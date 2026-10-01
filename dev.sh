#!/bin/bash
# dev.sh — build APK first, then start emulator, then Metro
# Run this instead of `yarn android` to avoid OOM crashes

set -e

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 18

cd "$(dirname "$0")"

ANDROID_HOME="$HOME/Android/Sdk"
AVD_NAME="fitmom_avd"
APK="android/app/build/outputs/apk/debug/app-debug.apk"

# ── Step 1: Kill emulator if running ──────────────────────────────────────────
echo "▶ Stopping any running emulator..."
pkill -f "emulator.*fitmom" 2>/dev/null || true
sleep 2

# ── Step 2: Build APK (Gradle only, no emulator running) ─────────────────────
echo "▶ Building APK (emulator is OFF to save RAM)..."
cd android
./gradlew assembleDebug \
  -x lint -x test \
  --configure-on-demand \
  --build-cache \
  -PreactNativeDevServerPort=8081 \
  -PreactNativeArchitectures=x86_64
cd ..

echo "▶ Stopping Gradle daemon to free RAM..."
android/gradlew --stop 2>/dev/null || true
sleep 3

# ── Step 3: Start emulator ────────────────────────────────────────────────────
echo "▶ Starting emulator..."
DISPLAY=:0 "$ANDROID_HOME/emulator/emulator" \
  -avd "$AVD_NAME" \
  -no-audio -no-snapshot-save -accel on -no-metrics 2>/dev/null &

echo "▶ Waiting for emulator to boot..."
until adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; do
  sleep 3
done
echo "▶ Emulator ready."

# ── Step 4: Install APK ───────────────────────────────────────────────────────
echo "▶ Installing APK..."
adb install -r "$APK"

# ── Step 5: Port forwarding ───────────────────────────────────────────────────
adb reverse tcp:8081 tcp:8081

# ── Step 6: Start Metro ───────────────────────────────────────────────────────
echo "▶ Starting Metro (press Ctrl+C to stop)..."
npx expo start --dev-client --host lan --clear &
METRO_PID=$!

sleep 8

# ── Step 7: Launch app ────────────────────────────────────────────────────────
echo "▶ Launching app..."
adb shell am start -a android.intent.action.VIEW \
  -d "com.beapp.beapp://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" \
  com.beapp.beapp

echo ""
echo "✓ Done. App is launching on the emulator."
echo "  Metro is running in the background (PID $METRO_PID)."
echo "  Press Ctrl+C to stop Metro when done."
wait $METRO_PID
