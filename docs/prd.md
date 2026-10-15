# Life Energy App — PRD

Sep 29, 2026 · @Surya Surakhman · Status: Draft v0.1

## Overview

We will build a mobile AR app (React Native + Expo, Supabase backend): the user points the camera at a price tag, shelf label or menu in a store, and every price on screen is overlaid, live, with the hours of life it costs at their *real* hourly wage.

**Working name:** Life Energy (placeholder; not the book's title).

**Problem.** People judge purchases in money, which feels abstract, and the moment of decision happens in physical stores such as grocery, pharmacy and big-box retailers, where no tool helps. Existing price-to-hours tools are browser extensions or calculators that need typing, so they are unused at the shelf. They also use nominal wage, which overstates what an hour of work really earns.

**Solution.** Three layers, each building on the last:

1. **Point and see (core).** A live camera "price lens" reads prices on-device and places a life-energy label next to each one, like a translation overlay: "$12.99 → about 1 h".
2. **Know your real wage.** A guided wizard subtracts job costs (commute, work clothes, work meals, stress spending) and adds job-related hours (commute, prep, decompression). This makes every label honest, and the gap between nominal and real wage is the first "aha".
3. **Follow the program.** Tap a scanned price to log it, then use the monthly Three Questions review, the Wall Chart and the crossover projection from *Your Money or Your Life*.

**Source method.** Vicki Robin and Joe Dominguez, *Your Money or Your Life* (1992; revised 2008 and 2018). The app implements its nine steps in software and credits the book; it does not reproduce the book's text.

## Goals, non-goals and success metrics

Success means users come back monthly to review spending, not just convert one price.

**Goals**

- Show the life-energy cost of any price the camera sees, live, in under 1 second.
- Help users calculate an honest real hourly wage in under 5 minutes.
- Turn the book's nine steps into a repeatable monthly habit.
- Show a credible path to the crossover point.

**Non-goals (v1)**

- Investment advice, brokerage or portfolio management.
- Automatic bank connections (CSV import only until v3).
- Tax calculation (users enter net pay).
- Social features or public sharing of finances.

**Success metrics** (targets to validate after beta)

| Metric | Definition | Target |
| --- | --- | --- |
| Scan accuracy | Prices on screen correctly read and labeled, on a test set of 500 real tags | ≥ 90% |
| Time to first label | From pointing the camera at a tag to label shown | ≤ 1 s (p90) |
| Wizard completion | Installs that finish the real-wage wizard | ≥ 70% |
| Weekly scanners | Activated users scanning in ≥ 2 sessions per week | ≥ 30% |
| Monthly review completion | Activated users completing the monthly Three Questions review | ≥ 40% |
| Day-30 retention | Users active on day 30 after install | ≥ 25% |
| "Skipped" purchases | Scanned prices marked "Not worth it" | Tracked; no target in v1 |

## Target users and use cases

The primary user is a salaried 22–40-year-old who spends on impulse and wants more control, often FIRE-curious.

| Persona | Situation | What they need |
| --- | --- | --- |
| The impulse buyer | Salaried, shops online, feels money "disappears" | A quick check before buying: "Is this worth 9 hours?" |
| The FIRE aspirant | Tracks spending already, has read the book or FIRE blogs | The full program: tabulation, Wall Chart, crossover projection |
| The freelancer | Irregular monthly income | A real wage from a trailing average, not one month |
| The couple | Two incomes, shared expenses | Individual and household views (v3) |

**Key use cases**

1. "I'm about to buy headphones for $180. How many hours is that?"
2. "I just paid for lunch; log it in under 10 seconds."
3. "It's the end of the month; review my categories and mark what was worth it."
4. "At my current savings rate, when do I reach the crossover point?"

## Competitive landscape

Price-to-hours conversion exists online, but none of these tools works in a physical store, where the camera is the only fast input.

| Product | Type | Uses real wage? | Beyond conversion |
| --- | --- | --- | --- |
| Time Well Spent | Chrome extension | No (salary + pay frequency) | No |
| Worth My Time | Chrome extension | No | No; local-only, many retail sites |
| TimeCost | Chrome extension | No | Currency detection, fun units |
| loggd.life True Cost Calculator | Web tool | Yes | Keep-or-skip log |
| Salary-to-hourly iOS apps | Mobile | No | Wage conversion only |

**Our differentiation**

- Live AR price lens for physical stores: no typing, many prices at once.
- Real hourly wage per the book, with a guided wizard (not a single salary field).
- The whole loop on mobile: scan → log → tabulate → Three Questions → Wall Chart → crossover.

## Core calculations

All math runs on-device in one shared, unit-tested module; the server never needs to compute it.

**Real hourly wage** (monthly basis)

```
W_real = (P_net - C_job) / (H_paid + H_job)
```

- P_net = monthly take-home pay (after tax).
- C_job = monthly job costs: commute, work clothes, work meals, childcare, decompression spending, job-related health costs.
- H_paid = paid hours per month = weekly hours × 52 ÷ 12.
- H_job = unpaid job-related hours per month: commute, getting ready, decompressing, unpaid overtime.

Worked example: net $4,000, 173 paid hours, $700 job costs, 82 job hours → ($4,000 − $700) ÷ 255 = **$12.94/hr real** vs $23.12/hr nominal.

**Life-energy conversion**

```
L = price / W_real
```

Display rules: under 1 hr → minutes; 1–40 hrs → hours; above 40 hrs → work days, where one work day = (H_paid + H_job) ÷ work days per month. Always show the original price beside it.

**Crossover point**

```
I_month = (K × r) / 12
```

- K = total invested capital; r = annual rate, user-set, default 4%.
- Crossover = the first month where I_month ≥ monthly expenses.
- Projection: grow K each month by the trailing 3-month average savings; report months to crossover.

**Edge cases**

| Case | Rule |
| --- | --- |
| Irregular income | Use a trailing 3- or 6-month average of net pay (user picks) |
| Job costs ≥ net pay | Block save; explain that real wage would be zero or negative |
| No paid work | "Runway mode": price ÷ average monthly spending → days of runway |
| Multiple jobs | Sum pay, costs and hours across jobs |
| Currency | Wage stored in home currency; foreign prices converted with a daily-cached rate |
| Rounding | Store full precision; round only for display, USD to the cent, hours to the minute |

## Live price lens (AR)

The lens runs entirely on-device: each camera frame is read by ML Kit, prices are parsed from the text, and labels are drawn over them, about 5–10 times per second.

**Pipeline per frame**

1. **Capture.** Vision Camera streams frames to a frame processor (a worklet on a background thread).
2. **Read text.** ML Kit Text Recognition v2 (Latin script) returns text blocks, lines and elements, each with a bounding box.
3. **Find prices.** A parser keeps only tokens that look like prices (rules below) and assigns a confidence score.
4. **Stabilize.** Match each price to the one seen in earlier frames by position and value; show a label only after it appears in 2 of the last 3 frames. This stops flicker.
5. **Convert.** price ÷ real hourly wage (Core calculations), in the home currency.
6. **Draw.** Map the bounding box from frame to screen coordinates and draw a chip beside the price, e.g. "≈ 1 h 10 m"; colour scales with hours.
7. **Interact.** Tap a chip to freeze the frame, edit the price if misread, answer "Worth it?", or log it as an expense.

**Price parsing rules**

| Pattern on the tag | Example | Rule |
| --- | --- | --- |
| Dollar sign, comma thousands, dot cents | $4.99 · $1,299.00 | Primary format: "," = thousands, "." = cents |
| Split-cents shelf tag | $3 99 with small raised cents | Large number + adjacent smaller, top-aligned 2 digits → $3.99 |
| Cents only | 99¢ · .99 | "¢" or a leading dot = cents |
| Multi-buy | 2 for $5 · 3/$10 | Label the per-item price ($2.50) and note the deal |
| Sale tag, two prices | Was $5.99 Now $3.99 · Reg. $5.99 | Label both; highlight the lower as the price paid |
| Loyalty-card price | $2.99 with card | Label and mark "with card" |
| Unit price | $0.25/oz · $3.49/lb | Label, mark "per unit"; exclude from "log it" default |
| Other currencies | C$4.99 · €4,99 · £3.50 | Convert to the home currency with the last cached daily rate (FR-18); show "not USD" until a rate is cached |
| Non-prices | UPC barcodes, dates, SKUs, phone numbers, weights | Reject: wrong format, too many digits, or next to oz/lb/fl oz without a dollar sign |

**USD detection**

- The home currency defaults to USD. On first run the app confirms it from the device region with expo-localization (regionCode "US", currencyCode "USD"); the user can change it in Profile.
- In the lens, a number with a dollar sign or "¢", or in US format with 2 decimal places, is read as USD.
- A price with another symbol (C$, CA$, €, £) is labeled "not USD" instead of being converted wrongly.

**Sales tax**

US shelf prices exclude sales tax, which varies by state and city. A setting "Include sales tax" (off by default) takes a user-entered rate; when on, labels show the hours for price + tax.

**Modes**

- **Live mode** (default): labels follow the tags as the phone moves.
- **Freeze mode**: tap the shutter to hold a frame, then read and tap labels calmly; also the fallback on slow phones.
- **Menu mode**: many prices in a column; labels align to the right edge of each line.

## Scope and releases

MVP ships the live price lens with an honest real wage, no account needed; it works fully offline and all data stays on the phone. Each later release adds a part of the program.

| Release | Theme | In scope | Book steps |
| --- | --- | --- | --- |
| MVP | Point and see | No sign-in, live price lens (live + freeze modes), real-wage wizard, manual quick convert as fallback, "Worth it?" on a tapped label, log from a scan, foreign prices with daily cached rates, local storage | 2 |
| v2 | Follow the program | Categories, monthly tabulation in hours, Three Questions review, Wall Chart, lifetime-earnings exercise, crossover projection, Supabase sync | 1, 3–5, 8 |
| v3 | Beyond the shelf | Receipt scan to log a whole purchase, menu mode, share sheet for online prices, home-screen widget, CSV import, household mode | 6, 7, 9 |

## Functional requirements

Each requirement has an ID, a release and a testable acceptance criterion; MVP items are must-haves for launch.

| ID | Release | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| FR-1 | MVP | Live price lens: camera screen that labels every detected price with its life-energy cost | Labels appear ≤ 1 s (p90) on a mid-range phone; ≥ 90% accuracy on the 500-tag test set |
| FR-2 | MVP | Price parser for US price formats (USD), promo pairs and unit prices (see Live price lens) | Unit tests cover every row of the parsing table; rejects dates, barcodes, weights |
| FR-3 | MVP | Label stabilization across frames | No visible flicker when the phone is held still for 2 s |
| FR-4 | MVP | Freeze mode: shutter holds the frame with its labels | Frozen labels are tappable; works with the camera off |
| FR-5 | MVP | Tap a label: edit misread price, answer "Worth it?", or "Log it" | Edited value re-converts instantly; log saved with price, hours, category, timestamp |
| FR-6 | MVP | Torch toggle and tap-to-focus | Readable tags in a dim store aisle with torch on |
| FR-7 | MVP | Camera permission flow with a clear reason and a manual-entry fallback if denied | App fully usable without camera via quick convert |
| FR-8 | MVP | Real-wage wizard with a quick path (net pay, paid hours, commute) and a full path (all job costs and hours) | Quick path done in ≤ 5 screens; result shows nominal vs real wage side by side |
| FR-9 | MVP | Wage history with effective dates | Past logs keep the wage in force when they were made |
| FR-10 | MVP | Manual quick convert (keypad) | Result appears as the user types |
| FR-11 | MVP | Works fully offline; local SQLite store | All MVP features pass in airplane mode, including after an app restart |
| FR-12 | MVP | Export all data (CSV/JSON); delete all data | Deleting removes all local data in-app; from v2 also the account and server data within 30 days |
| FR-13 | v2 | Optional sign-in, offered with sync: email magic link, Sign in with Apple, Google (Supabase Auth); sign out in Profile | The MVP has no sign-in (dropped 2026-10-14); no spending data is sent to the server before the user turns on sync |
| FR-13b | v2 | Sync of logged data to Supabase for the signed-in account | Local data migrates to the account without loss |
| FR-14 | v2 | Categories, income log, monthly tabulation in money and hours | Totals match logged items to the cent |
| FR-15 | v2 | Three Questions review per category (+, −, 0) with a month-start reminder | Review saved per month |
| FR-16 | v2 | Wall Chart: income, expenses, investment income lines | 36 months render smoothly; pinch to zoom |
| FR-17 | v2 | Crossover projection with user-set rate (default 4%) | Shows projected month and years to go |
| FR-18 | MVP | Foreign prices: detect a non-home currency symbol and convert with a daily-cached rate (ECB reference rates fetched on the phone) | Offline uses last cached rate and labels its date |
| FR-19 | v3 | Receipt scan: read a receipt and log its total, optionally its lines | Total matches the printed total on 95% of test receipts |
| FR-20 | v3 | Menu mode, share sheet for online prices, home-screen widget, CSV import, household mode | Each ships behind its own flag |

## User flows and key screens

The app opens straight into the camera; the first session must end with the user seeing their real wage and a live label on a real price.

**First-run flow**

1. Language, then Welcome: one line on money as life energy, credit to the book.
2. Currency auto-detected as USD, and pay frequency (weekly, biweekly, semimonthly or monthly).
3. Net pay and paid hours per week.
4. Commute time and cost.
5. Choice: "Good enough for now" (quick path) or "Add more job costs" (full path).
6. Reveal: nominal vs real wage, with the gap in %.
7. Camera permission, with the reason: "to read prices; nothing leaves your phone".
8. First scan: "Point at any price near you" (a sample tag is shown if nothing is in reach).

**Key screens**

| Screen | Purpose | Main elements |
| --- | --- | --- |
| Lens (home) | See prices as life energy | Full-screen camera, label chips on prices, shutter (freeze), torch, keypad button for manual entry |
| Label sheet | Act on one price | Price (editable), hours/days, Worth it? buttons, "Log it" with category chips |
| Log | Review spending | Recent items in money and hours, add manually |
| Month | Tabulation + review (v2) | Category totals in money and hours, Three Questions marks |
| Wall Chart | Progress (v2) | Income, expenses, investment income lines; crossover marker |
| Profile | Wage and settings | Real-wage breakdown, edit inputs, currency, export, delete data (account, sign out and sync from v2) |

## Technical architecture

The app is local-first: SQLite on the device is the source of truth, and Supabase is an optional sync and backup layer behind Row Level Security.

Camera frames are read, parsed, converted and labeled on the phone; only logged items reach SQLite. In the MVP nothing is sent to a server; from v2, for users who turn on sync, the sync engine sends logged items to Supabase. No camera image ever leaves the device.

**Stack**

| Layer | Choice | Notes |
| --- | --- | --- |
| App | React Native + Expo (SDK current at kickoff), TypeScript, Expo Router | Needs an Expo development build (native camera modules); Expo Go cannot run the lens |
| Camera | react-native-vision-camera (v4) with frame processors | Frames processed on a background worklet thread |
| Text recognition | Google ML Kit Text Recognition v2 via a Vision Camera plugin | On-device, Latin script; no network, no per-scan cost |
| Overlay | @shopify/react-native-skia over the camera view (or Reanimated views) | Chips follow bounding boxes at camera frame rate |
| Worklets | react-native-worklets-core + Reanimated | Price parser runs as a worklet; results passed to JS throttled |
| Local data | expo-sqlite + Drizzle ORM | Migrations versioned in repo |
| State | Zustand (UI state), TanStack Query (server calls) | Calculation module is pure TypeScript |
| Charts | Victory Native (Skia) | Wall Chart and monthly bars |
| Auth (v2) | Supabase Auth: email magic link, Sign in with Apple, Google | Apple sign-in required on iOS if Google is offered |
| Backend | Supabase Postgres + RLS | Every table has user_id; policy user_id = auth.uid() |
| Sync | Custom: updated_at + soft delete, last-write-wins; PowerSync as the alternative if conflicts grow | Push on change, pull on app open |
| Exchange rates | MVP: the phone fetches the ECB daily reference rates (public file, no user data) when its cache is over 12 h old. v2: Supabase Edge Function on a daily cron | Both fill fx_rates; v2 picks one source (see open questions) |
| Validation | zod schemas shared by forms and sync | |

Pin compatible versions of Vision Camera, the ML Kit plugin, worklets-core and Reanimated in a spike during week 1; these packages must match the Expo SDK's React Native version.

**Money rules.** Store amounts as integers in minor units (bigint) with an ISO 4217 currency code; never floats. Format with Intl.NumberFormat per locale.

**Data model** (Postgres; mirrored in SQLite)

| Table | Key columns | Purpose |
| --- | --- | --- |
| profiles | id, home_currency, locale, crossover_rate | One row per user |
| wage_profiles | id, user_id, effective_from, net_pay, paid_hours, pay_period, real_wage_cached | Wage history (FR-2) |
| wage_items | id, wage_profile_id, kind (cost/hours), label, amount | Job costs and job hours |
| categories | id, user_id, name, icon, archived | Spending categories |
| expenses | id, user_id, amount_minor, currency, category_id, spent_at, note, wage_profile_id | Logged spending |
| incomes | id, user_id, amount_minor, currency, kind, received_at | Income lines for the Wall Chart |
| conversions | id, user_id, price_minor, currency, hours, verdict, created_at | Scanned or typed prices; source = lens / freeze / keypad |
| monthly_reviews | id, user_id, month, category_id, q1, q2, q3 | Three Questions marks |
| capital_snapshots | id, user_id, month, invested_capital_minor | Crossover input |
| fx_rates | base, quote, rate, as_of | MVP: cached on the phone for every currency pair. v2: shared, read-only for clients |

All user tables carry created_at, updated_at, deleted_at for sync.

## Non-functional requirements

Salary and spending are sensitive, so privacy is a product feature, not a setting.

| Area | Requirement |
| --- | --- |
| Privacy | Camera frames processed in memory only, never saved or uploaded (a frozen frame is discarded on close); MVP has no account and sends no user data to a server; sign-in and sync are opt-in from v2; no ad or tracking SDKs; plain-language privacy screen in onboarding |
| Security | RLS on every user table; service key never in the app; tokens in expo-secure-store; optional app lock with Face ID / fingerprint (expo-local-authentication) |
| Data rights | Export (CSV/JSON) and delete all data in-app; from v2 also account deletion (store policies require it) |
| Performance | Lens: first label ≤ 1 s (p90), overlay at ≥ 30 fps, OCR throttled to 5–10 runs per second; freeze mode becomes the default on phones where live mode drops below 15 fps. Battery: camera stops when the lens is hidden or after 60 s idle; ≤ 5% battery per 10 min of scanning. Support iOS 15+ and Android 8+, tested on a ~2 GB RAM Android phone. Cold start < 2 s; Wall Chart with 36 months at 60 fps |
| Offline | Every MVP feature works offline, including the lens (exchange rates refresh when online); from v2 sync queues changes and retries |
| Localization | English only at launch (US market); USD as home currency, auto-detected; US formats ($1,250.00, MM/DD/YYYY) |
| Accessibility | Label chips with high contrast and ≥ 14 pt text; screen reader reads detected prices in freeze mode; dynamic type, labels on all controls, 4.5:1 contrast, charts with a text summary |
| Tone | Neutral, never shaming: "This is 12 hours. Worth it to you?" |
| Legal | Credit the book; do not use its title or cover as branding; "not financial advice" note on crossover screens |

## Analytics and instrumentation

Track behavior, never amounts: events carry no salary, price or note values.

Use a privacy-friendly product analytics tool (e.g., PostHog with IP capture off), with an opt-out in settings.

| Event | Properties | Feeds metric |
| --- | --- | --- |
| lens_opened | entry (launch/tab), torch_on | Weekly scanners |
| price_labeled | ms_to_first_label, prices_in_frame_bucket, mode (live/freeze) | Time to first label |
| label_corrected | error_type (digits/separator/not a price) | Scan accuracy |
| verdict_set | verdict, source (lens/keypad) | "Skipped" purchases |
| expense_logged | source (lens/keypad/manual) | Engagement |
| lens_fps_low | device_model_bucket | Device support |
| wizard_started / wizard_completed | path (quick/full), duration_s | Wizard completion |
| monthly_review_completed | categories_count | Monthly review completion |
| sync_enabled | provider | Account conversion |

## Risks, open questions and milestones

The biggest risks are misread prices on real store tags and slow phones; a week-1 technical spike and a tag test set address both.

**Risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| OCR misreads (glare, small print, handwritten tags) | Wrong hours shown | Confidence threshold; tap to correct; torch; freeze mode; collect anonymized correction types |
| Non-prices read as prices (weights, dates, codes) | Clutter, lost trust | Strict parser rules and tests on a 500-tag photo set from real US grocery, pharmacy and big-box stores |
| Low-end Android performance | Laggy lens, churn | Throttle OCR; auto-switch to freeze mode; test on reference device weekly |
| Native module version conflicts with Expo SDK | Build breaks, delays | Week-1 spike pins versions; dev build in CI via EAS |
| One-and-done usage | Low retention | "Log it" from the lens; monthly review early in v2 |
| Shaming tone | Users feel judged | Neutral copy; user-set verdicts only |
| Store review (camera + finance) | Launch delay | Clear camera purpose string; no advice claims; in-app deletion |
| Data lost with the phone (no account) | Users who switch phones without a backup, or between iOS and Android, lose their history | Android Auto Backup and iCloud device backup include the database; export in Profile; add import; v2 sync |

**Open questions**

- [ ] Final app name and brand (not the book's title).
- [ ] Expand beyond the US later? Canada is the natural next market, but CAD shares the $ symbol, so detection must use region.
- [x] Free vs paid: decided 2026-10-15. A one-time "Pro" unlock on Google Play through RevenueCat (entitlement `pro_v2`, product `pro_lifetime`, $9.99). Free keeps the lens, wage wizard, quick convert and log; Pro unlocks the Wall Chart, crossover and Three Questions review. No ads. A subscription may come later with paid sync.
- [ ] Should the crossover rate default to 4% or ask the user?
- [ ] Household mode: shared account or linked accounts?

**Sign-in (MVP) and sync (v2) — gaps found in the code (2026-10-13)**

Sign-in moved into the MVP on 2026-10-13 and was dropped again on 2026-10-14: requiring an account that holds nothing risked App Store rejection (guideline 5.1.1(v)), and monetization works through store purchases without an account. The sign-in code (`app/sign-in.tsx`, `app/auth/callback.tsx`, `src/infrastructure/supabase/`, the `delete-account` Edge Function) stays for v2, unreachable from the app. All items below now belong to v2:

- [ ] **(v2) Sync design.** `src/infrastructure/repository-factory.ts` swaps expenses from SQLite to Supabase once signed in, which breaks local-first (logging fails offline while signed in). Replace with a sync engine: SQLite stays the source of truth and Supabase is a backup that syncs in the background.
- [ ] **(v2) Server schema and RLS.** Not needed for sign-in alone, since Supabase Auth keeps accounts in its own schema. `supabase/migrations/` and `supabase/policies/` are empty. Create the user tables with `user_id`, enable RLS on each, and add `user_id = auth.uid()` policies before any client writes.
- [x] **(MVP) Magic-link return.** Done 2026-10-13: `emailRedirectTo` = `beapp://auth/callback` (PKCE), handled by `app/auth/callback.tsx`. Add that URL to Supabase Auth → URL Configuration → Redirect URLs.
- [x] **(MVP) Session storage size.** Done 2026-10-13 by chunking the session across secure-store keys (no new native module). expo-secure-store warns above ~2 KB per value on Android and Supabase sessions can exceed it. Use the Supabase pattern: encrypt the session into AsyncStorage and keep only the key in secure store.
- [ ] **(v2) One FX source.** The app fetches ECB daily rates on the phone (FR-18, pulled into MVP); the unused Edge Function `supabase/functions/fetch-fx-rates` uses Open Exchange Rates with a USD base. Pick one source for v2 so rates match across devices.
- [ ] **(v2) Apple and Google sign-in** are not started; Apple is required on iOS if Google is offered. Needs an Apple Services ID, a Google OAuth client, and both configured in Supabase.
- [x] **(MVP) Account deletion.** Done 2026-10-13: Profile → Delete all data calls the `delete-account` Edge Function, which deletes the account the access token belongs to, then wipes the phone and signs out. Offline, nothing is deleted and the user is asked to retry (FR-12).
- [ ] **(v2) Apple token revocation.** Apple requires revoking Sign in with Apple tokens when an account is deleted; needs the sign-in authorization code and an Apple key on the server.
- [x] **Sign-in gate.** Built 2026-10-13, removed 2026-10-14 when sign-in left the MVP. Sign-in returns in v2 as an option for sync, not a gate.
- [ ] Optional app lock (expo-local-authentication is installed, unused): decide which release.

**Milestones** (estimates for one full-time developer)

1. Week 1: technical spike — Vision Camera + ML Kit + Skia overlay in an Expo dev build; pinned versions; fps on the reference phone.
2. Weeks 2–3: price parser with tests; collect the 500-tag photo set; calculation module; real-wage wizard.
3. Weeks 4–5: live lens with stabilization, freeze mode, label sheet, log from scan, offline store, export and delete — MVP beta via TestFlight / internal testing.
4. Weeks 6–9: Supabase sync, categories, monthly review, Wall Chart, crossover projection — v2 beta.
5. Weeks 10–12: localization, accuracy tuning from beta corrections, store submission.
6. After launch: v3 (receipt scan, menu mode, share sheet, widget, CSV import).
