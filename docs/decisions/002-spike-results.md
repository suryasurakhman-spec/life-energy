# ADR 002 — Week 1 Spike Results

Date: 2026-09-30
Status: PENDING — fill in after device test

## Goal
Prove Vision Camera + ML Kit + Skia overlay work together at ≥30 fps on a reference Android device.

## Measurements (fill in after device test)
- Device: [model, RAM]
- Expo SDK: [version]
- Live mode fps: [n] fps
- Time to first label (p90): [n] ms
- OCR runs/sec at 5–10 throttle: [n]
- Battery: [n]% per 10 min

## Go / No-Go
- [ ] Live mode ≥ 30 fps on reference device → **GO for live mode**
- [ ] Live mode < 15 fps → **default to freeze mode**

## Issues found (pre-device — from code review)

### Resolved before device test
- **BigInt in worklet** (critical): `parsePrice` uses `BigInt` which may not be supported in `react-native-worklets-core`. Fixed by moving `parsePrice` to the JS thread — worklet now only runs `scanText` + `isPriceToken` (regex-only), then passes raw strings to JS via `runOnJS`. ✅ Fixed.
- **Wrong import path** `@/src/components/LabelChip` → `@/components/LabelChip`. ✅ Fixed.
- **T1 chip left bar** not rendered. ✅ Fixed.
- **Chip radius** was 16 pt (rounded rect) instead of 999 (pill). ✅ Fixed.
- **Icon sizes** 28pt → 24pt per DESIGN.md §6.3. ✅ Fixed.
- **Bottom bar gradient scrim** missing. ✅ Fixed.
- **Wage pill** not tappable. ✅ Fixed.

### Requires device testing to resolve
- **Frame-to-screen coordinate mapping**: ML Kit returns bounding boxes in frame pixel coordinates. These may not match screen coordinates when camera resolution ≠ view dimensions. If chips appear in wrong positions, add a scale transform: `scaleX = viewWidth / frameWidth`, `scaleY = viewHeight / frameHeight` and multiply all `x`, `y`, `width`, `height` values before passing to Skia.
- **`vision-camera-plugin-ml-kit-text-recognition` not in package.json**: Must be installed and version-pinned during the device build. The import exists in `LensScreen.tsx` but will fail until added. See `docs/decisions/001-native-stack.md`.

### Design decisions needed before Sprint 2
- **Sale tag "Label both"** (FR-2): `priceParser` currently returns only the lower (sale) price. PRD says "Label both; highlight the lower as the price paid." Either: (a) return `ParsedPrice[]` instead of `ParsedPrice | null`, or (b) add a `pairedPrice?: ParsedPrice` field. Decision needed before implementing the label sheet.
- **Chip tier scale**: PRD says "colour scales with hours." Implemented as 5 discrete tiers (T0–T4). Confirm discrete tiers are acceptable vs. a continuous gradient.
- **Work-day divisor**: `formatLifeEnergy` defaults to 480 min (8 h). PRD requires user's real work day `(H_paid + H_job) / work_days_per_month`. Wire to wage profile in Sprint 2.
- **Pre-existing legacy files** (`app/(app)/`, `app/(auth)/`, `providers/SessionProvider.tsx`): These reference `@/lib/supabase` and `@/lib/storage` not in this architecture. Delete or migrate?

## Measurements (fill in after device test)
- Device: [model, RAM]
- Expo SDK: 52.0.0
- Live mode fps: [n] fps
- Time to first label (p90): [n] ms
- OCR runs/sec at 5–10 throttle: [n] (throttled at 100 ms = ~10 runs/sec)
- Battery: [n]% per 10 min

## Go / No-Go
- [ ] Live mode ≥ 30 fps on reference device → **GO for live mode**
- [ ] Live mode < 15 fps → **default to freeze mode**

## Recommendation
[fill in after device test]
