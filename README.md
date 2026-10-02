# Life Energy

Point your phone's camera at any price tag and instantly see the cost in hours of your life — not dollars.

Based on the method from Vicki Robin & Joe Dominguez, *Your Money or Your Life*.

---

## What it does

1. **Live price lens.** Open the app, aim at a price tag in any store. Every visible price is labeled in real time with how many hours of work it costs at your *real* hourly wage — e.g. "$74.99 → about 5 h 48 m". No typing required.

2. **Real-wage wizard.** Your real wage is lower than your nominal wage. The wizard subtracts job-related costs (commute, work meals, work clothes, decompression spending) and adds unpaid job-related hours (commute, getting-ready time). A $23/hr salary often works out to $12–14/hr real.

3. **Worth it? / Log it.** Tap any chip to freeze the frame. Decide whether the purchase is worth it, then log it as an expense with one tap. Every log entry keeps the wage in effect at that time.

4. **Expense log.** A chronological list of everything you logged from scans or manually typed.

5. **Manual quick convert.** A keypad in the corner lets you type any price and see the hours instantly — even if you decline camera access.

---

## Concept: real wage and life energy

The core insight from *Your Money or Your Life*:

```
Real hourly wage = (net monthly pay − job costs) ÷ (paid hours + unpaid job hours)
```

Example: net $4,000/month, 173 paid hours, $700 job costs, 82 job-related hours
→ ($4,000 − $700) ÷ 255 hours = **$12.94/hr real** (vs $23.12/hr nominal)

Life-energy cost of a price:
```
hours = price ÷ real hourly wage
```

Display rules:
- Under 1 h → shown in minutes ("32 m")
- 1–40 h → shown in hours and minutes ("5 h 48 m")
- Over 40 h → shown in work days

---

## Release plan

| Release | Focus | What ships |
|---------|-------|-----------|
| **MVP** | Point and see | Live lens, freeze mode, real-wage wizard, manual keypad, "Worth it?", log from scan, local SQLite — fully offline, no account |
| **v2** | Follow the program | Optional sign-in, Supabase sync, spending categories, monthly tabulation, Three Questions review, Wall Chart, crossover projection |
| **v3** | Beyond the shelf | Receipt scan, menu mode, share sheet, home-screen widget, CSV import, household mode |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| App framework | React Native + Expo SDK 52, TypeScript strict |
| Navigation | Expo Router (file-based) |
| Camera | react-native-vision-camera v4 with frame processors |
| Text recognition | Google ML Kit Text Recognition v2 (on-device, no network) |
| Overlay | @shopify/react-native-skia drawn over the camera view |
| Worklets | react-native-worklets-core + Reanimated (price parser runs on a background thread) |
| Local storage | expo-sqlite + Drizzle ORM (migrations versioned in repo) |
| UI state | Zustand |
| Server state | TanStack Query |
| Charts | Victory Native (Skia renderer) |
| Backend | Supabase Auth + Postgres + RLS (v2+) |
| Validation | zod |
| Build / distribution | EAS Build (cloud) — Expo Go cannot run this app |

---

## Project structure

```
app/                        # Expo Router screens
  _layout.tsx               # Root layout, query client, gesture handler
  index.tsx                 # Entry redirect
  (tabs)/
    _layout.tsx             # Tab bar (Lens / Log / Month / Profile)
    log.tsx
    profile.tsx
    month/
  onboarding/
    _layout.tsx
    locale.tsx              # Language picker (first onboarding step)
    welcome.tsx
    pay.tsx                 # Net pay entry
    hours.tsx               # Paid hours
    commute.tsx             # Commute time + cost
    reveal.tsx              # Nominal vs real wage reveal

src/
  lib/
    calc.ts                 # ALL business math — pure TS, no React imports, 100% branch-tested
    format.ts               # ALL number and date formatting (Intl.NumberFormat)
    priceParser.ts          # USD price string → cents
    i18n.ts                 # Locale type, Strings interface, all translation strings, useTranslation()
    result.ts               # Result<T, E> type
    query-keys.ts           # TanStack Query key factories

  theme/                    # Design tokens: colors, typography, spacing, useTheme()
  components/               # Shared UI (ExpenseRow, LabelChip, LabelSheet, …)

  presentation/
    screens/
      lens/
        LensScreen.tsx      # Main camera + overlay screen
        QuickConvertModal.tsx
      log/
        LogScreen.tsx
      profile/
        ProfileScreen.tsx
      month/
      paywall/
    stores/
      lens.store.ts         # live/freeze mode, torch, detected prices (Zustand)
      onboarding.store.ts
      locale.store.ts       # Persisted locale selection
    hooks/
      useWage.ts
      useExpenses.ts
      useLogExpense.ts
      usePurchases.ts

  domain/
    price/
      parser.ts             # USD price parsing worklet
      stabilizer.ts         # Frame-to-frame price stabilization
      price.ts              # lifeEnergy() pure function

  application/              # Use cases (no React imports)
    delete-all-data.ts
    export-data.ts
    ports/                  # Repository interfaces

  infrastructure/
    sqlite/                 # Drizzle repositories

  db/
    schema.ts               # Drizzle schema
    migrations/             # Versioned SQL migrations

supabase/                   # Migrations, RLS policies, Edge Functions
__tests__/                  # Vitest tests (mirror src/ structure)
docs/
  prd.md                    # Full product requirements (source of truth)
  decisions/                # Architecture decision records
```

---

## Data model

All amounts stored as integer minor units (`bigint`) + ISO 4217 currency code. Never floats.

| Table | Purpose |
|-------|---------|
| `profiles` | One row per user; home currency, locale, crossover rate |
| `wage_profiles` | Wage history with effective dates; caches `real_wage` |
| `wage_items` | Individual job costs and unpaid hours attached to a wage profile |
| `expenses` | Logged spending: amount, currency, category, timestamp, wage snapshot |
| `conversions` | Every scanned or typed price; `source = lens / freeze / keypad` |
| `categories` | Spending categories (v2) |
| `incomes` | Income lines for the Wall Chart (v2) |
| `monthly_reviews` | Three Questions marks per category per month (v2) |
| `capital_snapshots` | Monthly invested capital for crossover projection (v2) |
| `fx_rates` | Shared, read-only; populated by a daily Edge Function cron |

All user tables carry `created_at`, `updated_at`, `deleted_at` (soft delete for sync).

---

## Privacy

- **No camera data leaves the device.** Frames are processed in memory only, never saved or uploaded. A frozen frame is discarded when the sheet closes.
- **No account required for MVP.** All features work offline in airplane mode.
- **No ad or tracking SDKs.** Analytics track behavior only (events like `price_labeled`, `verdict_set`) — never amounts, prices, or notes.
- Sync is opt-in from v2. Sign-in is optional; local data migrates to the account without loss.

---

## Money rules

- Store all amounts as **integer minor units** (`bigint`) with an ISO 4217 currency code (`"USD"`). Column names: `amount_minor` + `currency`.
- **Never use floats** for money.
- Format only through `src/lib/format.ts` using `Intl.NumberFormat`. No inline formatting in components.

---

## Localization

Supported locales: `en-US` (default), `id` (Bahasa Indonesia), `ja` (Japanese), `ar` (Arabic, RTL).

- All UI strings live in `src/lib/i18n.ts`. Never hardcode labels in components.
- When adding a string, add it to all four locales simultaneously.
- Arabic applies `I18nManager.forceRTL(true)` automatically; do not hardcode `textAlign` in components.
- The locale is persisted in `AsyncStorage` under `life-energy-locale`.
- Onboarding entry point is `/onboarding/locale` (language picker first).

---

## AR lens: how it works

Each camera frame goes through this pipeline (all on-device):

1. **Capture** — Vision Camera streams frames to a frame processor on a background worklet thread.
2. **OCR** — ML Kit Text Recognition v2 returns text blocks with bounding boxes. Throttled to ~10 runs/sec.
3. **Parse** — Regex rules extract prices from OCR text. Rejects dates, barcodes, weights, phone numbers.
4. **Stabilize** — Prices are matched across frames by position and value. A label appears only after a price is seen in 2 of the last 3 frames, preventing flicker.
5. **Convert** — `price ÷ real hourly wage` computed in `src/lib/calc.ts`.
6. **Draw** — Skia renders chips next to each bounding box at camera frame rate (≥ 30 fps).
7. **Interact** — Transparent Pressable hit targets sit above the Skia canvas. Tapping a chip freezes the frame and opens `LabelSheet`.

**Auto-freeze:** if the frame rate drops below 15 fps, the app automatically switches to freeze mode.
**Idle timeout:** the camera pauses after 60 seconds of no detected prices to save battery.

---

## Setup

### Prerequisites

- Node.js 20+
- Yarn 1.x
- An [Expo account](https://expo.dev) and the EAS CLI (`npm i -g eas-cli`)
- Android or iOS physical device, or an emulator/simulator

> **Important:** This app uses native camera modules (Vision Camera, ML Kit, Skia). It **cannot run in Expo Go**. You must use an EAS development build or a local build via `npx expo run:android`.

### Install dependencies

```bash
yarn
```

### Environment

Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key (only needed for v2 sync features; MVP works without them):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Build with EAS (recommended for testing on a real device)

```bash
# One-time: link to your EAS project
eas init

# Build a standalone preview APK (Android) — no local Gradle required
eas build --profile preview --platform android

# Build a development client APK (requires Metro running for hot reload)
eas build --profile development --platform android
```

Download the APK from the EAS dashboard and install it on your device or emulator:

```bash
adb install path/to/app.apk
```

### Run locally (requires Android SDK or Xcode)

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## Development commands

```bash
# Start Metro bundler (needed for development builds)
yarn start

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# TypeScript check
yarn typecheck

# Lint
yarn lint
```

---

## Testing

Tests live in `__tests__/` and mirror the `src/` structure. Run with [Vitest](https://vitest.dev).

Key test coverage requirements:
- `src/lib/calc.ts` — 100% branch coverage required (all math paths).
- `src/lib/format.ts` — formatting edge cases (zero, large amounts, all locales).
- `src/domain/price/parser.ts` — every row of the price parsing table; must reject dates, barcodes, weights.

```bash
yarn test
yarn test:coverage   # generates coverage/index.html
```

---

## Coding conventions

- **Money:** `bigint` minor units + currency code. Never floats. Use `src/lib/format.ts` for display.
- **Math:** all business logic in `src/lib/calc.ts` — pure TypeScript, no React/RN imports.
- **Formatting:** all `Intl` calls go through `src/lib/format.ts`. Never inline in components.
- **Colors/sizes:** always import from `src/theme/`. No hardcoded hex codes or pixel values in components.
- **Strings:** always call `useTranslation()`. No hardcoded UI labels.
- **Camera frames:** never write to disk or send over the network.

---

## Git conventions

```
FR-x: short description          # tied to a functional requirement
chore: description
fix: description
docs: description
test: description
```

Run `tsc --noEmit` and `vitest run` before committing.

---

## Legal and attribution

This app implements the method from *Your Money or Your Life* by Vicki Robin and Joe Dominguez and credits the book in the Profile screen. It does not reproduce the book's text. The crossover projection screen carries a "not financial advice" notice.

---

## License

MIT
