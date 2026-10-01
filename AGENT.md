# Life Energy — AGENT.md

Source of truth: `docs/prd.md`. This file is a distilled reference for AI coding agent sessions.

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
| App | React Native + Expo (current SDK), TypeScript, Expo Router | **EAS dev build required** — Expo Go cannot run the lens |
| Camera | react-native-vision-camera v4 + frame processors | Frames on a background worklet thread |
| Text recognition | Google ML Kit Text Recognition v2 (Vision Camera plugin) | On-device, no network, no per-scan cost |
| Overlay | @shopify/react-native-skia over camera view | Chips follow bounding boxes at camera frame rate |
| Worklets | react-native-worklets-core + Reanimated | Price parser runs as a worklet |
| Local data | expo-sqlite + Drizzle ORM | Migrations versioned in repo |
| State | Zustand (UI), TanStack Query (server) | |
| Auth/Backend | Supabase Auth + Postgres + RLS | v2+; every user table has `user_id`; policy `user_id = auth.uid()` |

**Week-1 spike required:** pin compatible versions of Vision Camera, ML Kit plugin, worklets-core, and Reanimated against the Expo SDK's React Native version before any other native work.

## Money Rule

> Store all monetary amounts as **integers in minor units** (e.g., cents) with an **ISO 4217 currency code**. Never use floats for money. Format for display with `Intl.NumberFormat` per locale.

Column convention: `amount_minor` (bigint) + `currency` (text, e.g. `"USD"`).

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

## File Structure

```
beapp/
  docs/prd.md          # Source of truth
  CLAUDE.md            # Claude Code reference
  AGENT.md             # This file (other AI agents)
  # (project files to be scaffolded)
```

## Commands

```bash
# Start dev server (EAS dev build required on device/simulator)
npx expo start --dev-client

# TypeScript check
npx tsc --noEmit
```

## Key Constraints

- **Privacy:** no ad or tracking SDKs; camera purpose string must explain "nothing leaves your phone"; analytics track behavior only, never amounts or prices.
- **Tone:** neutral, never shaming — "This is 12 hours. Worth it to you?"
- **Legal:** credit the book; do not use its title or cover as branding; add "not financial advice" on crossover screens; in-app data export and deletion required (store policy).
- **Performance:** first label ≤ 1 s (p90); overlay ≥ 30 fps; OCR throttled to 5–10 runs/sec; auto-switch to freeze mode below 15 fps; support iOS 15+ and Android 8+.
