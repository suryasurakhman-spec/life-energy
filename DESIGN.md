# DESIGN.md — Life Energy

Design system and UI rules for the Life Energy mobile app (React Native + Expo). Read this before building any screen or component. The PRD defines *what* to build; this file defines *how it looks, moves and speaks*.

---

## 1. Design principles

1. **Awareness, not guilt.** We show the cost in hours and let the user decide. Never shame, never use alarm colors for spending.
2. **The camera is the product.** The lens is the home screen. Everything else is one tap away and quieter than the lens.
3. **Numbers first.** The hours label is the hero of every screen. Big, tabular, instantly readable.
4. **Calm and warm.** Time is personal. Use warm neutrals and one warm accent, not fintech blue or casino green.
5. **Honest precision.** Show "≈" when a value is estimated (OCR, rounding). Never show more precision than we have.

---

## 2. Color

One warm accent (amber), warm neutrals, and a single-hue "time weight" scale. Red is reserved for errors only, never for prices.

### 2.1 Tokens

```ts
// src/theme/colors.ts
export const palette = {
  // Warm neutrals
  sand50:  '#FAF8F5',
  sand100: '#F3EFE9',
  sand200: '#E6DFD5',
  sand300: '#CFC5B8',
  sand500: '#8C8174',
  sand700: '#4A433B',
  sand800: '#2B2622',
  sand900: '#1A1714',
  sand950: '#110F0D',

  // Accent — amber ("life energy")
  amber100: '#FDEFD3',
  amber300: '#F7C873',
  amber500: '#E8A13A',
  amber600: '#C9821F',
  amber700: '#9A6214',

  // Support
  sage500:  '#5E8C6A',   // positive: "worth it", crossover progress
  slate500: '#5B6B7F',   // info
  error500: '#C2412D',   // errors ONLY (misread, failed sync) — never prices
};

export const light = {
  bg:            palette.sand50,
  surface:       '#FFFFFF',
  surfaceAlt:    palette.sand100,
  border:        palette.sand200,
  textPrimary:   palette.sand900,
  textSecondary: palette.sand500,
  accent:        palette.amber600,
  accentSoft:    palette.amber100,
  onAccent:      '#FFFFFF',
  positive:      palette.sage500,
  error:         palette.error500,
};

export const dark = {
  bg:            palette.sand950,
  surface:       palette.sand900,
  surfaceAlt:    palette.sand800,
  border:        palette.sand700,
  textPrimary:   palette.sand50,
  textSecondary: palette.sand300,
  accent:        palette.amber500,
  accentSoft:    '#3A2A12',
  onAccent:      palette.sand950,
  positive:      '#7FB08B',
  error:         '#E06A55',
};
```

### 2.2 Time-weight scale (label chips)

Chips get warmer as the cost grows. Same hue, rising intensity — informative, not alarming.

| Tier | Life-energy cost | Chip fill | Text |
|---|---|---|---|
| T0 | < 15 min | `rgba(17,15,13,0.72)` | `#FAF8F5` |
| T1 | 15 min – 1 h | `rgba(17,15,13,0.80)` + amber300 left bar | `#FAF8F5` |
| T2 | 1 h – 1 work day | `amber300` | `sand950` |
| T3 | 1 – 5 work days | `amber500` | `sand950` |
| T4 | > 1 work week | `amber700` | `#FFFFFF` |

A "work day" uses the user's real work day (paid + job-related hours), not a fixed 8 h.

### 2.3 Theme rules

- App follows the system theme (`useColorScheme`). Users can override in Profile.
- **The lens is always dark chrome** (status bar, controls, sheets over camera) regardless of theme.
- Contrast: body text ≥ 4.5:1, large numbers and chip text ≥ 4.5:1 on their fill. Test every tier.

---

## 3. Typography

**Font:** Inter (via `@expo-google-fonts/inter`), with `fontVariant: ['tabular-nums']` on every number so digits don't jump while typing or scanning.

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| `display` | 48 / 52 | 700 | Wage reveal, hours on the label sheet |
| `title1` | 28 / 34 | 700 | Screen titles |
| `title2` | 22 / 28 | 600 | Section headers, card titles |
| `body` | 17 / 24 | 400 | Default text |
| `bodyStrong` | 17 / 24 | 600 | Emphasis, list primaries |
| `callout` | 15 / 20 | 500 | Secondary info, prices beside hours |
| `caption` | 13 / 18 | 500 | Metadata, chart axes |
| `chip` | 15 / 18 | 700 | Lens label chips (min 14 pt, per PRD) |

- Support Dynamic Type: use `allowFontScaling`, cap scale at 1.6 for chips and the keypad (`maxFontSizeMultiplier`).
- Sentence case everywhere. No ALL CAPS except tiny badges ("WITH CARD", "PER UNIT").

---

## 4. Spacing, radius, elevation

```ts
// src/theme/layout.ts
export const space  = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
export const hitSlop = 44; // minimum touch target (pt)
```

- Screen gutter: 16. Card padding: 16. Gap between cards: 12.
- Elevation: prefer borders (1 px `border`) over shadows. One shadow level only, for sheets and floating buttons:
  `shadowColor #000, opacity 0.12, radius 16, offset (0, 4)`; Android `elevation: 6`.

---

## 5. Number and time formatting

One formatter module (`src/lib/format.ts`) used everywhere. Never format inline.

| Value | Format | Example |
|---|---|---|
| Price (USD) | `Intl.NumberFormat('en-US', {style:'currency', currency:'USD'})` | $1,299.00 |
| < 1 h | minutes | 22 m |
| 1 – 40 h | hours + minutes, drop minutes ≥ 10 h | 1 h 5 m · 14 h |
| > 40 h | work days, 1 decimal | 3.2 work days |
| > 20 work days | work weeks, 1 decimal | 6.5 work weeks |
| Estimated (OCR) | prefix "≈" | ≈ 1 h 5 m |
| Dates | US | Sep 29, 2026 · 09/29/2026 in tables |

Always pair hours with the price on sheets and lists: **1 h 5 m** · $14.00.

---

## 6. Components

### 6.1 LabelChip (lens overlay)

The most important component. Drawn with Skia over the camera.

- Pill (`radius.pill`), height 32, horizontal padding 10, `chip` type.
- Placed to the right of the detected price's bounding box; if no room, above it. Never covers the price.
- Fill and text per time-weight tier (§2.2). 1 px border `rgba(255,255,255,0.18)` so it reads on any background.
- Prefix "≈" when OCR confidence < 0.9.
- Badges inside the chip, after the value: `per unit`, `with card`, `not USD` (caption size, 70% opacity).
- Promo pair: both prices labeled; the lower price's chip gets a 2 px amber500 ring.
- Tap target ≥ 44 × 44 (use hit slop).
- Appears only after the stabilization rule (2 of 3 frames). Motion: see §7.

### 6.2 LabelSheet (bottom sheet)

Opens on chip tap; camera freezes behind it.

- Top: hours in `display`, price in `callout` beside it (editable, with a pencil affordance).
- "Was this worth it?" — three equal buttons: **Worth it** · **Not sure** · **Not worth it**. Neutral styling for all three; selected state = accent fill. No red/green.
- Primary action: **Log it** (full-width accent button) with category chips above it.
- Uses `@gorhom/bottom-sheet`, snap points 45% / 90%.

### 6.3 Lens controls

- Bottom bar over a 40% black gradient: keypad button (left), shutter/freeze (center, 72 pt circle), torch (right).
- Top: current real wage as a small pill ("$12.94/h real") — tap opens Profile.
- Icons: `lucide-react-native`, 24 pt, stroke 2, white.

### 6.4 Keypad (manual convert)

- Large 3×4 grid, keys 64 pt tall, `title2` digits.
- Result updates live above the keys in `display`.
- Haptic `selection` on each key press.

### 6.5 WageReveal (onboarding)

- Two stacked values: "Your paycheck says" **$23.12/h** (textSecondary, struck through lightly) → "Your real wage" **$12.94/h** (display, accent).
- Below: a horizontal bar split into paid hours and job-related hours, and a list of job costs.
- Copy tone: curious, not dramatic ("Here's what an hour of your life really earns.").

### 6.6 Buttons

| Variant | Fill | Text | Use |
|---|---|---|---|
| Primary | `accent` | `onAccent` | One per screen max |
| Secondary | `surfaceAlt` | `textPrimary` | Everything else |
| Ghost | none | `accent` | Inline actions |
| Destructive | none, `error` text | `error` | Delete data only |

Height 52, radius `md`, `bodyStrong`. Pressed: scale 0.98 + 8% darker.

### 6.7 Cards and lists

- Card: `surface`, 1 px `border`, radius `lg`, padding 16.
- Expense row: category icon (32 pt circle, `accentSoft`) · name + date · right-aligned hours (bodyStrong) over price (caption).

### 6.8 Charts (Wall Chart, monthly bars)

Victory Native (Skia).

| Series | Color | Style |
|---|---|---|
| Income | `sand700` / dark: `sand300` | 2 px line |
| Expenses | `amber600` / dark: `amber500` | 2 px line |
| Investment income | `sage500` | 2 px line, dashed until it crosses expenses |
| Crossover point | `sage500` | 8 pt dot + label "Crossover" |

- Gridlines `border` at 50% opacity, axes `caption`. No 3D, no gradients under lines.
- Every chart has a one-sentence text summary above it (also its accessibility label).

---

## 7. Motion and haptics

Use Reanimated. Motion should feel steady, never playful around money.

| Event | Animation | Haptic |
|---|---|---|
| Chip appears | fade + scale 0.9 → 1, 150 ms, ease-out | none |
| Chip tracks tag | position follows bounding box, spring (damping 20, stiffness 200) | none |
| Chip disappears | fade 120 ms after 3 missed frames | none |
| Freeze frame | 80 ms white flash at 15% opacity | `impactLight` |
| Sheet opens | spring from bottom (library default) | none |
| Logged | checkmark draw 250 ms | `notificationSuccess` |
| Wage reveal | count-up from nominal to real, 900 ms | `impactMedium` at end |

Respect "Reduce Motion" (`useReducedMotion`): replace springs and count-ups with 100 ms fades.

---

## 8. Voice and copy

- Second person, plain words, short sentences.
- Present facts, then ask: "This is 3 h 20 m of your life. Worth it?"
- Never: "wasted", "blew", "bad purchase", "you shouldn't".
- Credit the method once in onboarding and in About: "Based on the ideas in *Your Money or Your Life* by Vicki Robin and Joe Dominguez." Don't use the book's title as UI headings or branding.
- Crossover screens carry a small footnote: "Estimates only. Not financial advice."

| Situation | Do | Don't |
|---|---|---|
| Camera permission | "We read prices through your camera. Images never leave your phone." | "Allow camera access to continue." |
| Misread price | "Didn't catch that one. Tap to fix." | "Error: OCR failed." |
| Expensive item | "≈ 4.5 work days" | "Whoa, that's expensive!" |
| Empty log | "Point at a price and tap **Log it** to start." | "No data." |

---

## 9. Accessibility

- Every interactive element has `accessibilityRole` and `accessibilityLabel`.
- Chips announce: "Price 14 dollars, about 1 hour 5 minutes of work." In freeze mode, VoiceOver/TalkBack can step through all detected prices in reading order.
- Minimum touch target 44 pt; don't rely on color alone (tiers also differ in text).
- Test with Dynamic Type at max, VoiceOver, TalkBack, and grayscale.

---

## 10. File structure

```
src/
  theme/
    colors.ts       // palette, light, dark, timeWeight tiers
    typography.ts   // text styles
    layout.ts       // space, radius, hitSlop, shadow
    index.ts        // useTheme() hook returning tokens for current scheme
  lib/
    format.ts       // all price/hours/date formatting
  components/
    LabelChip.tsx
    LabelSheet.tsx
    Keypad.tsx
    WageReveal.tsx
    Button.tsx
    Card.tsx
    ExpenseRow.tsx
    charts/WallChart.tsx
```

Rules for contributors (and AI coding agents):

- Never hard-code a color, size or font in a component; import from `theme`.
- Never format a number inline; use `lib/format.ts`.
- New components get a light and dark screenshot in the PR.
- If a design decision isn't covered here, follow §1 and add the rule to this file.
