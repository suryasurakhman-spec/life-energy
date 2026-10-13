/**
 * Dev-only price-tag exam (FR-1 accuracy). Not reachable in release builds.
 *
 * Runs ML Kit on every photo in <documents>/exam/ and writes the raw OCR to
 * <documents>/exam-ocr.json. Parsing and scoring happen on the computer
 * (__tests__/price-exam.test.ts), so parser changes can be re-scored without
 * re-running OCR. Driven by scripts/price-exam.sh.
 */
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { PhotoRecognizer } from 'react-native-vision-camera-text-recognition';
import type { MlKitBlock } from '@/presentation/screens/lens/ocr-prices';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';

const EXAM_DIR = `${FileSystem.documentDirectory}exam/`;
const OUT_FILE = `${FileSystem.documentDirectory}exam-ocr.json`;
/** Written when the exam starts, so the driver script stops re-opening this screen. */
const STARTED_FILE = `${FileSystem.documentDirectory}exam-started`;

/** Keep only what the parser reads: text and frames. */
function slim(blocks: any[]): MlKitBlock[] {
  return blocks.map((b) => ({
    lines: (b?.lines ?? []).map((l: any) => ({
      lineText: l?.lineText,
      lineFrame: l?.lineFrame,
      elements: (l?.elements ?? []).map((e: any) => ({
        elementText: e?.elementText,
        elementFrame: e?.elementFrame,
      })),
    })),
  }));
}

export default function DevExam() {
  const [status, setStatus] = useState('starting');

  useEffect(() => {
    if (!__DEV__) return;
    void (async () => {
      if ((await FileSystem.getInfoAsync(STARTED_FILE)).exists) {
        setStatus('already running');
        return;
      }
      await FileSystem.writeAsStringAsync(STARTED_FILE, '');
      const files = (await FileSystem.readDirectoryAsync(EXAM_DIR))
        .filter((f) => f.endsWith('.jpg'))
        .sort();
      const results: Record<string, { ms: number; blocks: MlKitBlock[] }> = {};
      for (const [i, file] of files.entries()) {
        setStatus(`${i + 1}/${files.length} ${file}`);
        const started = Date.now();
        const text: any = await PhotoRecognizer({ uri: `${EXAM_DIR}${file}` });
        results[file.replace(/\.jpg$/, '')] = {
          ms: Date.now() - started,
          blocks: slim(text?.blocks ?? []),
        };
      }
      // Write then rename, so the script never copies a half-written file.
      await FileSystem.writeAsStringAsync(
        `${OUT_FILE}.part`,
        JSON.stringify({ engine: 'mlkit-latin-16.0.1 (android)', results }),
      );
      await FileSystem.moveAsync({ from: `${OUT_FILE}.part`, to: OUT_FILE });
      setStatus(`done ${files.length}`);
      console.log(`[exam] done ${files.length}`);
    })().catch((e) => {
      setStatus(`error ${String(e)}`);
      console.log(`[exam] error ${String(e)}`);
    });
  }, []);

  if (!__DEV__) return null;
  // Developer tool: plain status text, not user-facing copy.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.sand50 }}>
      <Text style={{ fontSize: fontSize.body, color: palette.sand900 }}>{status}</Text>
    </View>
  );
}
