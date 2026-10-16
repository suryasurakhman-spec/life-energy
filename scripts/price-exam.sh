#!/usr/bin/env bash
# Run ML Kit over the price-tag test photos on a connected Android device or emulator
# (debug build installed, Metro running on :8081), then pull the raw OCR back for scoring:
#   scripts/price-exam.sh && yarn test __tests__/price-exam.test.ts
set -euo pipefail
cd "$(dirname "$0")/.."

PKG=com.beapp.beapp
FIXTURES=__tests__/fixtures/price-tags
OUT=${1:-$FIXTURES/ocr-android.json}
IMAGES=${2:-$FIXTURES/images} # or a folder of new photos only, to merge into the saved OCR
METRO=http://localhost:8081

curl -sf "$METRO/status" | grep -q running || { echo "Metro is not running on :8081 (yarn start)" >&2; exit 1; }
adb reverse tcp:8081 tcp:8081 >/dev/null

adb shell rm -rf /data/local/tmp/exam
adb push "$IMAGES" /data/local/tmp/exam >/dev/null
adb shell chmod -R a+r /data/local/tmp/exam
adb shell run-as "$PKG" sh -c "'rm -rf files/exam files/exam-ocr.json files/exam-ocr.json.part files/exam-started && mkdir -p files/exam && cp /data/local/tmp/exam/*.jpg files/exam/'"

# Cold-start the dev build straight onto Metro; a deep link sent while the dev
# launcher's server list is showing is dropped, so keep sending it until the exam starts.
adb shell am force-stop "$PKG"
adb shell am start -a android.intent.action.VIEW \
  -d "beapp://expo-development-client/?url=$(printf %s "$METRO" | sed 's/:/%3A/g; s#/#%2F#g')" "$PKG" >/dev/null
echo "Waiting for the app to load…"
for _ in $(seq 1 30); do
  sleep 5
  adb shell am start -a android.intent.action.VIEW -d "beapp://dev-exam" "$PKG" >/dev/null 2>&1
  sleep 2
  adb shell run-as "$PKG" ls files/exam-started >/dev/null 2>&1 && break
done
adb shell run-as "$PKG" ls files/exam-started >/dev/null 2>&1 || { echo "The exam screen never opened" >&2; exit 1; }

echo "Exam running on device…"
for _ in $(seq 1 300); do
  if adb shell run-as "$PKG" ls files/exam-ocr.json >/dev/null 2>&1; then
    adb exec-out run-as "$PKG" cat files/exam-ocr.json > "$OUT"
    echo "OCR saved to $OUT"
    exit 0
  fi
  sleep 2
done
echo "Timed out waiting for the exam" >&2
exit 1
