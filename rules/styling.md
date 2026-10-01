# Styling Rules

## Stack

- **NativeWind v4** — Tailwind CSS utility classes in React Native via `className`.
- **DESIGN.md** is the design source of truth. NativeWind implements it.
- Custom tokens (colors, spacing, radius) are defined in `tailwind.config.ts` — not duplicated in `src/theme/`.
- **Skia** (`@shopify/react-native-skia`) for lens overlays (LabelChip, bounding-box drawing). Skia elements cannot use NativeWind; they use raw values from the theme object.

---

## Setup

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Warm neutrals
        sand: {
          50:  '#FAF8F5',
          100: '#F3EFE9',
          200: '#E6DFD5',
          300: '#CFC5B8',
          500: '#8C8174',
          700: '#4A433B',
          800: '#2B2622',
          900: '#1A1714',
          950: '#110F0D',
        },
        // Accent
        amber: {
          100: '#FDEFD3',
          300: '#F7C873',
          500: '#E8A13A',
          600: '#C9821F',
          700: '#9A6214',
        },
        // Support
        sage:  { 500: '#5E8C6A' },
        slate: { 500: '#5B6B7F' },
        error: { 500: '#C2412D' },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      spacing: {
        // Matches layout.ts space tokens
        xxs: '2px',
        xs:  '4px',
        sm:  '8px',
        md:  '12px',
        lg:  '16px',
        xl:  '24px',
        xxl: '32px',
        xxxl:'48px',
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

```ts
// babel.config.js — add NativeWind babel plugin
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['nativewind/babel'],
};
```

```ts
// metro.config.js
const { withNativeWind } = require('nativewind/metro');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Usage

```tsx
// Use className on all RN core components
<View className="flex-1 bg-sand-50 dark:bg-sand-950 px-lg">
  <Text className="text-[17px] font-semibold text-sand-900 dark:text-sand-50">
    Hello
  </Text>
</View>
```

---

## Dark Mode

NativeWind respects the system color scheme via the `dark:` variant. Enable it:

```ts
// tailwind.config.ts
export default {
  darkMode: 'media',   // follows system (useColorScheme)
  ...
}
```

The lens chrome is always dark regardless of system theme. Use explicit dark classes or a `lens-chrome` wrapper with a forced dark background:

```tsx
// Lens controls — always dark
<View className="bg-black/40">
  ...
</View>
```

---

## Skia Overlays (LabelChip)

Skia does not support `className`. Use raw color values from the time-weight tier table (DESIGN.md §2.2):

```ts
// src/theme/chip-tiers.ts
// Mirror of DESIGN.md §2.2 — single source, used by Skia components
export const chipTiers = [
  { fill: 'rgba(17,15,13,0.72)', text: '#FAF8F5', border: 'rgba(255,255,255,0.18)' }, // T0
  { fill: 'rgba(17,15,13,0.80)', text: '#FAF8F5', border: 'rgba(255,255,255,0.18)' }, // T1
  { fill: '#F7C873',             text: '#110F0D', border: 'rgba(255,255,255,0.18)' }, // T2
  { fill: '#E8A13A',             text: '#110F0D', border: 'rgba(255,255,255,0.18)' }, // T3
  { fill: '#9A6214',             text: '#FFFFFF', border: 'rgba(255,255,255,0.18)' }, // T4
] as const;

export type ChipTier = 0 | 1 | 2 | 3 | 4;
```

---

## Typography

Use Inter with tabular numbers on all numeric displays. Load with `expo-font` / `@expo-google-fonts/inter`.

NativeWind font classes:

```tsx
// Display number (wage reveal, label sheet)
<Text className="font-bold text-[48px] leading-[52px] tabular-nums text-amber-600 dark:text-amber-500">
  $12.94
</Text>

// Chip text (min 14pt per PRD accessibility requirement)
<Text className="font-bold text-[15px] leading-[18px] tabular-nums">
  ≈ 1 h 5 m
</Text>
```

---

## Component Patterns

### No inline style objects

```tsx
// Bad
<View style={{ backgroundColor: '#FAF8F5', padding: 16 }}>

// Good
<View className="bg-sand-50 p-lg">
```

Exception: values that are dynamic at runtime (bounding box coordinates, animation transforms) must use `style` prop or Reanimated's `animatedStyle`.

### Dynamic classes with `clsx` / `cn`

```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
<View className={cn('rounded-pill px-md py-xs', isSelected && 'bg-amber-600')}>
```

### Minimum touch targets

Every interactive element must have a minimum 44×44 pt hit area:

```tsx
<Pressable className="min-h-[44px] min-w-[44px] items-center justify-center">
```

---

## What NOT to Use

- No `StyleSheet.create` for new components — use NativeWind classes.
- No hard-coded hex values in components — use Tailwind color tokens.
- No `styled()` from NativeWind v2/v3 — use `className` (v4 API).
- No `@emotion`, `styled-components`, or `react-native-paper` theming.

---

## Rules Summary

- NativeWind v4 + `className` for all non-Skia components.
- Design tokens are the `tailwind.config.ts` custom theme — single source of truth.
- `dark:` variants for all colors. Lens chrome is always explicitly dark.
- Skia components (LabelChip) use raw values from `src/theme/chip-tiers.ts`.
- Dynamic classes via `cn()` (`clsx` + `tailwind-merge`).
- No `StyleSheet.create`, no hard-coded hex values in components.
- Minimum 44×44 pt tap targets on all interactive elements.
