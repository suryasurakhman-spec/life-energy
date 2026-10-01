# Life Energy — CLAUDE.md

Source of truth: `docs/prd.md`. This file is a distilled reference for Claude Code sessions.

## Project

Mobile AR app: point camera at a price tag → see the life-energy cost (hours of work) overlaid live.
Based on *Your Money or Your Life* (Vicki Robin & Joe Dominguez). Credits the book; does not reproduce its text.

## Architecture (invariants)

- **Local-first.** SQLite on-device is the source of truth. Supabase is an optional sync/backup layer (v2+).
- **No camera data off device.** Frames are processed in memory only, never saved or uploaded.
- **No account for MVP.** Sign-in is opt-in from v2; all MVP features work offline in airplane mode.
- All math runs on-device in a shared, unit-tested calculation module. Server never computes life energy.

## Release Scope

| Release | What's in | Out until later |
|---------|-----------|-----------------|
| **MVP** | Live price lens (live + freeze modes), real-wage wizard, manual quick convert, "Worth it?", log from scan, local SQLite storage | Supabase sync, sign-in, categories, tabulation, Wall Chart, crossover |
| **v2** | Optional sign-in, Supabase sync, categories, monthly tabulation, Three Questions review, Wall Chart, crossover projection | Receipt scan, menu mode, widget, CSV import, household mode |
| **v3** | Receipt scan, menu mode, share sheet, home-screen widget, CSV import, household mode | — |

Do not scope-creep MVP with v2/v3 features mid-session.

## Tech Stack

| Layer | Choice | Critical notes |
|-------|--------|----------------|
| App | React Native + Expo (latest stable SDK), TypeScript strict, Expo Router | **EAS dev build required** — Expo Go cannot run the lens |
| Camera | react-native-vision-camera v4 + frame processors | Frames on a background worklet thread |
| Text recognition | Google ML Kit Text Recognition v2 (Vision Camera plugin) | On-device, no network, no per-scan cost |
| Overlay | @shopify/react-native-skia over camera view | Chips follow bounding boxes at camera frame rate |
| Worklets | react-native-worklets-core + Reanimated | Price parser runs as a worklet |
| Local data | expo-sqlite + Drizzle ORM | Migrations versioned in repo |
| State | Zustand (UI), TanStack Query (server) | |
| Charts | Victory Native (Skia renderer) | Wall Chart and monthly bars (v2+) |
| Validation | zod | All external data boundaries: forms, sync payloads, Supabase rows |
| Auth/Backend | Supabase Auth + Postgres + RLS | v2+; every user table has `user_id`; policy `user_id = auth.uid()` |

**Week-1 spike required:** pin compatible versions of Vision Camera, ML Kit plugin, worklets-core, and Reanimated against the Expo SDK's React Native version before any other native work. Record in `docs/decisions/001-native-stack.md`.

## Coding Rules

- **Money:** store as integer minor units (`bigint`) + ISO 4217 currency code (`"USD"`). Never floats. Column: `amount_minor` + `currency`. Format only through `src/lib/format.ts` using `Intl.NumberFormat`.
- **Currency detection:** default USD, auto-detected via `expo-localization` (`regionCode "US"`, `currencyCode "USD"`); user can override in Profile.
- **All math** in `src/lib/calc.ts` — pure TypeScript, no React/RN imports, 100% branch-tested.
- **All number/date formatting** through `src/lib/format.ts` — never inline `Intl` calls in components.
- **No hard-coded colors, sizes, or font names** in components — always import from `src/theme/`.
- **Camera frames** are processed in memory only, never written to disk or sent over the network.
- **Offline first:** every MVP feature must work in airplane mode; no sign-in required for MVP.

## Data Model (quick reference)

| Table | Purpose |
|-------|---------|
| `profiles` | One row per user; home currency, locale, crossover rate |
| `wage_profiles` | Wage history with effective dates; stores `real_wage_cached` |
| `wage_items` | Individual job costs and job hours attached to a wage profile |
| `categories` | Spending categories (v2) |
| `expenses` | Logged spending: `amount_minor`, currency, category, timestamp, `wage_profile_id` |
| `incomes` | Income lines for Wall Chart (v2) |
| `conversions` | Every scanned or typed price; `source = lens / freeze / keypad` |
| `monthly_reviews` | Three Questions marks per category per month (v2) |
| `capital_snapshots` | Monthly invested capital for crossover projection (v2) |
| `fx_rates` | Shared, read-only; populated by daily Edge Function cron |

All user tables carry `created_at`, `updated_at`, `deleted_at` (for sync).

## File Structure (from DESIGN.md §10)

```
app/                    # Expo Router screens
  _layout.tsx
  (tabs)/
src/
  theme/                # Design tokens only — colors, typography, layout, useTheme()
  lib/
    calc.ts             # ALL business math — pure TS, no React imports
    format.ts           # ALL number/date formatting
    priceParser.ts      # USD price string → cents
  components/           # Shared UI components
  features/             # Feature folders (lens/, log/, wizard/, profile/)
  db/                   # Drizzle schema + migrations
supabase/               # Migrations, RLS policies, Edge Functions
__tests__/              # Vitest test files (mirror src/ structure)
docs/
  prd.md                # Source of truth
  decisions/            # ADRs (001-native-stack.md, etc.)
```

## Commands

```bash
# Install dependencies
yarn

# Start dev server (EAS dev build required — Expo Go will NOT work)
yarn start

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Lint
yarn lint

# TypeScript check
yarn typecheck
```

## Git

- Small, frequent commits tied to one FR at a time.
- Message format: `FR-x: short description` (e.g. `FR-2: price parser for split-cent shelf tags`)
- If not tied to a specific FR: `chore:`, `fix:`, `docs:`, `test:` prefixes.
- Run `tsc --noEmit` and `vitest run` before committing.

## Translations

Supported locales: `en-US` (default), `id` (Bahasa Indonesia), `ja` (Japanese), `ar` (Arabic).

| File | Role |
|------|------|
| `src/lib/i18n.ts` | `Locale` type, `Strings` interface, all translation strings, `useTranslation()` hook |
| `src/presentation/stores/locale.store.ts` | Zustand + AsyncStorage store for the user's chosen locale |
| `app/onboarding/locale.tsx` | Language picker — **first step of onboarding** (`/onboarding/locale` → `/onboarding/welcome`) |

**Rules:**
- **Never hardcode UI label strings in components.** Always call `useTranslation()` and use its returned object.
- When adding a new string, add it to **all four locales** in `src/lib/i18n.ts` simultaneously.
- Numbers, currency amounts, and life-energy hours are formatted by `src/lib/format.ts` via `Intl` — do NOT duplicate them in translation strings.
- **Arabic is RTL.** `I18nManager.forceRTL(true)` is applied automatically in `locale.store.ts` when Arabic is selected. The layout change takes effect after the app restarts (cold start). Do not hard-code `textAlign` or layout direction in components — let React Native's RTL system handle it.
- The locale is persisted in `AsyncStorage` under the key `life-energy-locale`. It loads before the first render via Zustand's `persist` middleware.
- Onboarding entry point is `/onboarding/locale` (not `/onboarding/welcome`). Update any navigation that redirects to onboarding.

## Key Constraints

- **Privacy:** no ad or tracking SDKs; camera purpose string must explain "nothing leaves your phone"; analytics track behavior only, never amounts or prices.
- **Tone:** neutral, never shaming — "This is 12 hours. Worth it to you?"
- **Legal:** credit the book; do not use its title or cover as branding; add "not financial advice" on crossover screens; in-app data export and deletion required (store policy).
- **Performance:** first label ≤ 1 s (p90); overlay ≥ 30 fps; OCR throttled to 5–10 runs/sec; auto-switch to freeze mode below 15 fps; support iOS 15+ and Android 8+.
