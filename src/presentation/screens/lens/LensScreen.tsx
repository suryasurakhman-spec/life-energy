import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useTextRecognition } from 'react-native-vision-camera-text-recognition';
import { Canvas, useFont } from '@shopify/react-native-skia';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useLensStore } from '@/presentation/stores/lens.store';
import { useCurrentWage, useRealHourlyWage } from '@/presentation/hooks/useWage';
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

/** OCR runs at most this often (ms) — ~10 runs/sec. */
const OCR_MIN_INTERVAL_MS = 100;
/** Auto-freeze when frame rate drops below this threshold. */
const MIN_FPS = 15;
/** Auto-freeze after this many consecutive ms below MIN_FPS in a 1-sec window. */
const IDLE_TIMEOUT_MS = 60_000;

export function LensScreen() {
  const t = useTranslation();
  const realHourlyWage = useRealHourlyWage();
  const { data: wage } = useCurrentWage();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { mode, torchOn, freeze, unfreeze, setPrices, stablePrices } = useLensStore();
  const font = useFont(require('../../../../assets/fonts/Inter_700Bold.ttf'), 15);
  const [selectedPrice, setSelectedPrice] = useState<DetectedPrice | null>(null);
  const [quickConvertVisible, setQuickConvertVisible] = useState(false);
  const textRecognition = useTextRecognition({ language: 'latin' });

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
      resetIdleTimer();
    } else {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [mode, resetIdleTimer]);

  // ── Keep screen awake while live ──────────────────────────────────────────
  useEffect(() => {
    if (mode === 'live') {
      void activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => { deactivateKeepAwake(); };
  }, [mode]);

  // ── JS callbacks (invoked from worklet via runOnJS) ───────────────────────
  const onFpsTooLow = useCallback(() => freeze(), [freeze]);

  const onPricesDetected = useCallback(
    (detected: DetectedPrice[]) => {
      stabilizer.addFrame(detected);
      setPrices(stabilizer.stableItems());
      if (detected.length > 0) resetIdleTimer();
    },
    [setPrices, resetIdleTimer],
  );

  // ── Frame processor ───────────────────────────────────────────────────────
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
          runOnJS(onFpsTooLow)();
        }
        fpsWindowStart.value = now;
        fpsFrameCount.value = 0;
      }
      fpsFrameCount.value += 1;

      // ── OCR throttle: max ~10 runs/sec ─────────────────────────────────────
      if (now - lastOcrMs.value < OCR_MIN_INTERVAL_MS) return;
      lastOcrMs.value = now;

      // ── OCR ────────────────────────────────────────────────────────────────
      const results = textRecognition.scanText(frame);
      const detected: DetectedPrice[] = [];
      for (const result of (results as any[])) {
        const blocks: any[] = result.blocks ?? [];
        for (const block of blocks) {
          const lines: any[] = block.lines ?? block[2] ?? [];
          for (const line of lines) {
            const elements: any[] = line.elements ?? line[1] ?? [];
            for (const el of elements) {
              const elFrame = el.frame ?? el[1] ?? {};
              const elText: string = el.text ?? el[2] ?? '';
              const parsed = parsePrice(elText);
              if (!parsed) continue;
              detected.push({
                id: `${Math.round(elFrame.x ?? 0)}-${Math.round(elFrame.y ?? 0)}`,
                ...parsed,
                x: elFrame.x ?? 0,
                y: elFrame.y ?? 0,
                width: elFrame.width,
                height: elFrame.height,
              });
            }
          }
        }
      }
      runOnJS(onPricesDetected)(detected);
    },
    [mode, lastOcrMs, fpsWindowStart, fpsFrameCount, onFpsTooLow, onPricesDetected, textRecognition],
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
    <View style={{ flex: 1, backgroundColor: '#000' }}>
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
        {stablePrices.map(p => {
          const energy = lifeEnergy({ priceMinor: p.minor, realHourlyWage });
          const label  = formatHours(energy.totalMinutes, { estimated: p.confidence < 0.9 });
          const tier   = getTier(energy.totalMinutes);
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
        })}
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
