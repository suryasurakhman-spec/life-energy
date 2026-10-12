import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  VisionCameraProxy,
} from 'react-native-vision-camera';
// Frame processors run on react-native-worklets-core, not Reanimated's runtime.
import { useRunOnJS, useSharedValue } from 'react-native-worklets-core';
import { Canvas, useFont } from '@shopify/react-native-skia';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useLensStore } from '@/presentation/stores/lens.store';
import { useCurrentWage, useRealHourlyWage } from '@/presentation/hooks/useWage';
import { useFxRate, convertToBase } from '@/presentation/hooks/useFxRate';
import { parsePrice } from '@/domain/price/parser';
import { createStabilizer } from '@/domain/price/stabilizer';
import type { DetectedPrice } from '@/domain/price/stabilizer';
import { formatHours } from '@/lib/format';
import { lifeEnergy } from '@/domain/price/price';
import { LabelChip } from '@/presentation/components/LabelChip';
import { getTier } from '@/theme/chip-tiers';
import { useTranslation } from '@/lib/i18n';
import { LabelSheet } from '@/presentation/components/LabelSheet';
import { QuickConvertModal } from './QuickConvertModal';

const stabilizer = createStabilizer();

/** One OCR word with its box already mapped to view coordinates. */
interface OcrWord {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ML Kit text recognition (native plugin registered by react-native-vision-camera-text-recognition).
const scanTextPlugin = VisionCameraProxy.initFrameProcessorPlugin('scanText', { language: 'latin' });

/** OCR runs at most this often (ms) — ~10 runs/sec. */
const OCR_MIN_INTERVAL_MS = 100;
/** Auto-freeze when frame rate drops below this threshold. */
const MIN_FPS = 15;
/** Auto-freeze after this many consecutive ms below MIN_FPS in a 1-sec window. */
const IDLE_TIMEOUT_MS = 60_000;

// Separate inner component so hooks can be called per-currency without Rules-of-Hooks issues
function PriceChip({
  p,
  realHourlyWage,
  homeCurrency,
  font,
}: {
  p: DetectedPrice;
  realHourlyWage: number;
  homeCurrency: string;
  font: ReturnType<typeof useFont>;
}) {
  const { data: fxRate } = useFxRate(homeCurrency, p.currency);
  const baseMinor = convertToBase(p.minor, p.currency, homeCurrency, fxRate?.rate);

  if (baseMinor === null) {
    // Rate not cached yet — show "not [currency]" label
    return (
      <LabelChip
        key={p.id}
        label={`not ${homeCurrency}`}
        x={(p.x ?? 0) + (p.width ?? 60) + 8}
        y={(p.y ?? 0) + (p.height ?? 20) / 2}
        tier="T0"
        font={font}
      />
    );
  }

  const energy = lifeEnergy({ priceMinor: baseMinor, realHourlyWage });
  const estimated = p.confidence < 0.9 || p.currency !== homeCurrency;
  const label = formatHours(energy.totalMinutes, { estimated });
  const tier = getTier(energy.totalMinutes);
  return (
    <LabelChip
      key={p.id}
      label={label}
      x={(p.x ?? 0) + (p.width ?? 60) + 8}
      y={(p.y ?? 0) + (p.height ?? 20) / 2}
      tier={tier}
      font={font}
    />
  );
}

export function LensScreen() {
  const t = useTranslation();
  const realHourlyWage = useRealHourlyWage();
  const { data: wage } = useCurrentWage();
  const homeCurrency = wage?.currency ?? 'USD';
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { mode, torchOn, freeze, unfreeze, setPrices, stablePrices } = useLensStore();
  const font = useFont(require('../../../../assets/fonts/Inter_700Bold.ttf'), 15);
  const [selectedPrice, setSelectedPrice] = useState<DetectedPrice | null>(null);
  const [quickConvertVisible, setQuickConvertVisible] = useState(false);

  // ── Worklet-safe shared values ────────────────────────────────────────────
  const lastOcrMs      = useSharedValue(0); // timestamp of last OCR run
  const fpsWindowStart = useSharedValue(0); // start of current 1-second fps window
  const fpsFrameCount  = useSharedValue(0); // frame count in current window

  // ── Idle timeout ──────────────────────────────────────────────────────────
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(freeze, IDLE_TIMEOUT_MS);
  }, [freeze]);

  useEffect(() => {
    if (mode === 'live') {
      // Start a fresh fps window; a stale one from before the freeze would re-freeze on the first frame.
      fpsWindowStart.value = 0;
      fpsFrameCount.value = 0;
      resetIdleTimer();
    } else {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [mode, resetIdleTimer, fpsWindowStart, fpsFrameCount]);

  // ── Keep screen awake while live ──────────────────────────────────────────
  useEffect(() => {
    if (mode === 'live') {
      void activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => { deactivateKeepAwake(); };
  }, [mode]);

  // ── JS callbacks (invoked from the frame processor via useRunOnJS) ───────────────────────
  const onFpsTooLow = useCallback(() => freeze(), [freeze]);

  // Price parsing runs here on the JS thread: the parser's regex tables and bigint results
  // don't cross the worklet boundary, so the frame processor only sends text + view boxes.
  const onTextDetected = useCallback(
    (words: OcrWord[]) => {
      const detected: DetectedPrice[] = [];
      for (const w of words) {
        const parsed = parsePrice(w.text);
        if (!parsed) continue;
        detected.push({
          id: `${Math.round(w.x / 24)}-${Math.round(w.y / 24)}`,
          ...parsed,
          x: w.x,
          y: w.y,
          width: w.width,
          height: w.height,
        });
      }
      stabilizer.addFrame(detected);
      setPrices(stabilizer.stableItems());
      if (detected.length > 0) resetIdleTimer();
    },
    [setPrices, resetIdleTimer],
  );

  const runFpsTooLow = useRunOnJS(onFpsTooLow, [onFpsTooLow]);
  const runTextDetected = useRunOnJS(onTextDetected, [onTextDetected]);

  // ── Frame processor ───────────────────────────────────────────────────────
  const viewWidth  = useSharedValue(0);
  const viewHeight = useSharedValue(0);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (mode === 'freeze') return;

      const now = performance.now();

      // ── FPS tracking: count frames in 1-second rolling windows ────────────
      if (fpsWindowStart.value === 0) {
        fpsWindowStart.value = now;
      } else if (now - fpsWindowStart.value >= 1000) {
        if (fpsFrameCount.value < MIN_FPS) {
          runFpsTooLow();
        }
        fpsWindowStart.value = now;
        fpsFrameCount.value = 0;
      }
      fpsFrameCount.value += 1;

      // ── OCR throttle: max ~10 runs/sec ─────────────────────────────────────
      if (now - lastOcrMs.value < OCR_MIN_INTERVAL_MS) return;
      lastOcrMs.value = now;

      // ── OCR ────────────────────────────────────────────────────────────────
      // The plugin returns one { resultText, blocks } map (or null when nothing is found).
      // Element frames are centre points in upright image space; map them to view space
      // using the preview's "cover" scaling so chips land on the tag.
      // Native side returns null when ML Kit fails (e.g. model still downloading); skip the frame.
      if (scanTextPlugin == null) return;
      const result: any = scanTextPlugin.call(frame);
      const blocks: any[] = result?.blocks ?? [];
      const portraitView = viewHeight.value >= viewWidth.value;
      const imgW = portraitView ? Math.min(frame.width, frame.height) : Math.max(frame.width, frame.height);
      const imgH = portraitView ? Math.max(frame.width, frame.height) : Math.min(frame.width, frame.height);
      const scale = Math.max(viewWidth.value / imgW, viewHeight.value / imgH);
      const offsetX = (viewWidth.value - imgW * scale) / 2;
      const offsetY = (viewHeight.value - imgH * scale) / 2;
      const words: OcrWord[] = [];
      for (const block of blocks) {
        const lines: any[] = block?.lines ?? [];
        for (const line of lines) {
          const elements: any[] = line?.elements ?? [];
          for (const el of elements) {
            const text: string = el?.elementText ?? '';
            if (!/\d/.test(text)) continue; // a price always has a digit
            const f = el.elementFrame ?? {};
            const width = (f.width ?? 0) * scale;
            const height = (f.height ?? 0) * scale;
            words.push({
              text,
              x: (f.x ?? 0) * scale + offsetX - width / 2,
              y: (f.y ?? 0) * scale + offsetY - height / 2,
              width,
              height,
            });
          }
        }
      }
      runTextDetected(words);
    },
    [mode, lastOcrMs, fpsWindowStart, fpsFrameCount, viewWidth, viewHeight, runFpsTooLow, runTextDetected],
  );

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#110F0D', padding: 32, gap: 20 }}>
        <Text style={{ color: '#FAF8F5', fontSize: 22, fontWeight: '700', textAlign: 'center' }}>
          {t.lens.noPermissionTitle}
        </Text>
        <Text style={{ color: '#CFC5B8', fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
          {t.lens.noPermissionBody}
        </Text>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => ({ marginTop: 8, paddingHorizontal: 32, paddingVertical: 16, backgroundColor: '#C9821F', borderRadius: 14, opacity: pressed ? 0.8 : 1 })}
          accessibilityRole="button"
          accessibilityLabel={t.lens.noPermissionCta}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17 }}>{t.lens.noPermissionCta}</Text>
        </Pressable>
        <Pressable
          onPress={() => setQuickConvertVisible(true)}
          style={({ pressed }) => ({ paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: '#4A433B', opacity: pressed ? 0.8 : 1 })}
          accessibilityRole="button"
        >
          <Text style={{ color: '#CFC5B8', fontWeight: '600', fontSize: 15 }}>{'Type a price manually'}</Text>
        </Pressable>
        {quickConvertVisible && wage && (
          <QuickConvertModal
            realHourlyWage={realHourlyWage}
            wageProfileId={wage.id}
            visible={quickConvertVisible}
            onClose={() => setQuickConvertVisible(false)}
          />
        )}
      </View>
    );
  }

  if (!device) return null;

  return (
    <View
      style={{ flex: 1, backgroundColor: '#000' }}
      onLayout={(e) => {
        viewWidth.value = e.nativeEvent.layout.width;
        viewHeight.value = e.nativeEvent.layout.height;
      }}
    >
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={mode === 'live'}
        frameProcessor={frameProcessor}
        torch={torchOn ? 'on' : 'off'}
        accessibilityLabel={t.lens.cameraLabel}
      />

      {/* Skia overlay: chip visuals (pointerEvents none — taps fall through to Pressables below) */}
      <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        {/* Skia's Canvas is a separate React renderer, so context must be provided again inside it. */}
        <QueryClientProvider client={queryClient}>
          {stablePrices.map(p => (
            <PriceChip
              key={p.id}
              p={p}
              realHourlyWage={realHourlyWage}
              homeCurrency={homeCurrency}
              font={font}
            />
          ))}
        </QueryClientProvider>
      </Canvas>

      {/* Transparent hit targets for each chip — sits above Skia canvas */}
      {stablePrices.map(p => (
        <Pressable
          key={`hit-${p.id}`}
          onPress={() => { freeze(); setSelectedPrice(p); }}
          style={{
            position: 'absolute',
            left: (p.x ?? 0) + (p.width ?? 60) + 8 - 8,
            top: (p.y ?? 0) + (p.height ?? 20) / 2 - 16,
            minWidth: 60,
            minHeight: 32,
          }}
          accessibilityRole="button"
        />
      ))}

      {/* Shutter + torch controls */}
      <View style={{ position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 24 }}>
        <Pressable
          onPress={useLensStore.getState().toggleTorch}
          style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={t.lens.toggleTorch}
        >
          <Text style={{ fontSize: 22 }}>{torchOn ? '🔦' : '💡'}</Text>
        </Pressable>
        <Pressable
          onPress={mode === 'live' ? freeze : unfreeze}
          style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={mode === 'live' ? t.lens.freeze : t.lens.live}
        />
        <Pressable
          onPress={() => setQuickConvertVisible(true)}
          style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel="Type a price"
        >
          <Text style={{ fontSize: 26, color: '#FFFFFF' }}>⌨</Text>
        </Pressable>
      </View>

      {/* LabelSheet: shown when a chip is tapped */}
      {selectedPrice != null && wage && (
        <LabelSheet
          priceMinor={selectedPrice.minor}
          currency="USD"
          wageProfileId={wage.id}
          source={mode === 'freeze' ? 'freeze' : 'lens'}
          realHourlyWage={realHourlyWage}
          onClose={() => setSelectedPrice(null)}
        />
      )}

      {/* QuickConvert: manual keypad entry */}
      {wage && (
        <QuickConvertModal
          realHourlyWage={realHourlyWage}
          wageProfileId={wage.id}
          visible={quickConvertVisible}
          onClose={() => setQuickConvertVisible(false)}
        />
      )}
    </View>
  );
}
