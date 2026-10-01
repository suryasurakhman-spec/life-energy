# Life Energy — Full Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Life Energy mobile AR app end-to-end — from project scaffold through MVP (live price lens + real-wage wizard) to v2 (sync, tabulation, Wall Chart, crossover) and v3 (receipt scan, widget, CSV import).

**Architecture:** Layered/hexagonal — domain (pure TS), application (use cases + ports), infrastructure (adapters: SQLite, Supabase, RevenueCat), presentation (RN screens + hooks). See `rules/architecture.md`.

**Tech Stack:** React Native + Expo SDK (EAS dev build), expo-router, react-native-vision-camera v4, ML Kit Text Recognition v2, @shopify/react-native-skia, expo-sqlite + Drizzle ORM, TanStack Query v5, Zustand, NativeWind v4, Supabase, RevenueCat, Vitest, React Native Testing Library.

**References:** `docs/prd.md`, `CLAUDE.md`, `DESIGN.md`, `rules/`

---

## Scope Overview

| Milestone | Sprints | Deliverable |
|-----------|---------|-------------|
| M1 — Foundation | Sprint 1 | Repo scaffold, tooling, tech spike passes |
| M2 — Domain Core | Sprint 2 | All calculations tested, real-wage wizard UI |
| M3 — Price Lens MVP | Sprint 3 | Live lens, parser, stabilization, freeze mode |
| M4 — MVP Complete | Sprint 4 | Label sheet, log, quick convert, offline store, export → MVP beta |
| M5 — v2 Core | Sprint 5 | Supabase auth + sync, categories, tabulation |
| M6 — v2 Complete | Sprint 6 | Three Questions review, Wall Chart, crossover projection |
| M7 — Launch Prep | Sprint 7 | Perf tuning, accuracy, store submission |
| M8 — v3 | Sprint 8+ | Receipt scan, menu mode, widget, CSV import, household mode |

---

---

# MILESTONE 1 — Foundation

## Sprint 1 · Week 1 · Project Scaffold + Technical Spike

**Goal:** Running EAS dev build with Vision Camera + ML Kit + Skia overlay rendering at ≥30 fps on the reference Android device. All versions pinned.

---

### Task 1.1: Initialize Expo Project

**Files:**
- Create: `app.config.ts`
- Create: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`
- Create: `tsconfig.json`
- Create: `global.css`
- Create: `babel.config.js`
- Create: `metro.config.js`
- Create: `.env.local` (gitignored)
- Create: `.env.example`
- Create: `eas.json`

- [ ] **Step 1: Create Expo project**
```bash
npx create-expo-app@latest beapp --template blank-typescript
cd beapp
```

- [ ] **Step 2: Install NativeWind v4**
```bash
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context
npx tailwindcss init
```

- [ ] **Step 3: Configure tailwind.config.ts** with design tokens from `DESIGN.md §2`

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        sand: { 50:'#FAF8F5', 100:'#F3EFE9', 200:'#E6DFD5', 300:'#CFC5B8', 500:'#8C8174', 700:'#4A433B', 800:'#2B2622', 900:'#1A1714', 950:'#110F0D' },
        amber: { 100:'#FDEFD3', 300:'#F7C873', 500:'#E8A13A', 600:'#C9821F', 700:'#9A6214' },
        sage:  { 500:'#5E8C6A' },
        error: { 500:'#C2412D' },
      },
      borderRadius: { sm:'8px', md:'12px', lg:'16px', xl:'24px', pill:'9999px' },
      spacing: { xxs:'2px', xs:'4px', sm:'8px', md:'12px', lg:'16px', xl:'24px', xxl:'32px', xxxl:'48px' },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 4: Configure babel.config.js**
```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'nativewind/babel',
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@/domain':         './src/domain',
        '@/application':    './src/application',
        '@/infrastructure': './src/infrastructure',
        '@/presentation':   './src/presentation',
        '@/lib':            './src/lib',
        '@/theme':          './src/theme',
      },
    }],
  ],
};
```

- [ ] **Step 5: Configure metro.config.js**
```js
const { withNativeWind } = require('nativewind/metro');
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 6: Configure tsconfig.json**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "paths": {
      "@/domain/*":         ["src/domain/*"],
      "@/application/*":    ["src/application/*"],
      "@/infrastructure/*": ["src/infrastructure/*"],
      "@/presentation/*":   ["src/presentation/*"],
      "@/lib/*":            ["src/lib/*"],
      "@/theme/*":          ["src/theme/*"]
    }
  }
}
```

- [ ] **Step 7: Configure eas.json**
```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "distribution": "internal" },
    "production":  {}
  },
  "submit": { "production": {} }
}
```

- [ ] **Step 8: Create src/ folder structure**
```bash
mkdir -p src/{domain/{wage,price,crossover,money},application/ports,infrastructure/{sqlite/drizzle/migrations,supabase,revenuecat,fx},presentation/{screens/{lens,log,profile,onboarding},components,hooks,stores},lib,theme}
```

- [ ] **Step 9: Run type check — expect 0 errors**
```bash
npx tsc --noEmit
```

- [ ] **Step 10: Commit**
```bash
git add -A
git commit -m "feat: initialize expo project with NativeWind, tsconfig, EAS config"
```

---

### Task 1.2: Install and Verify Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/domain/wage/wage.test.ts` (placeholder)

- [ ] **Step 1: Install Vitest**
```bash
npm install -D vitest @vitest/coverage-v8
```

- [ ] **Step 2: Create vitest.config.ts**
```ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
});
```

- [ ] **Step 3: Write a canary test**
```ts
// src/domain/wage/wage.test.ts
import { describe, it, expect } from 'vitest';
it('vitest is configured', () => expect(1 + 1).toBe(2));
```

- [ ] **Step 4: Run — expect PASS**
```bash
npx vitest run
```
Expected: `1 passed`

- [ ] **Step 5: Commit**
```bash
git add vitest.config.ts src/domain/wage/wage.test.ts
git commit -m "chore: add vitest"
```

---

### Task 1.3: Technical Spike — Vision Camera + ML Kit + Skia

**Goal:** Prove the stack works together on a real device before building anything else. Pin versions. Reference: `CLAUDE.md` week-1 spike note.

**Files:**
- Create: `src/presentation/screens/spike/SpikeScreen.tsx`
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Install native packages**
```bash
npx expo install react-native-vision-camera
npx expo install @shopify/react-native-skia
npx expo install react-native-worklets-core
npx expo install react-native-reanimated  # already installed
# ML Kit plugin for Vision Camera:
npm install vision-camera-plugin-ml-kit-text-recognition
```

- [ ] **Step 2: Pin exact compatible versions in package.json**

After confirming the build works, record exact versions in a comment block at the top of `package.json`:
```json
// PINNED — do not upgrade without re-running spike
// react-native-vision-camera: X.X.X
// vision-camera-plugin-ml-kit-text-recognition: X.X.X
// react-native-worklets-core: X.X.X
// react-native-reanimated: X.X.X
// @shopify/react-native-skia: X.X.X
```

- [ ] **Step 3: Create SpikeScreen that exercises all three**
```tsx
// src/presentation/screens/spike/SpikeScreen.tsx
import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { runOnJS } from 'react-native-reanimated';
import { scanText } from 'vision-camera-plugin-ml-kit-text-recognition';

export function SpikeScreen() {
  const device = useCameraDevice('back');
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    frameCount.current++;
    const result = scanText(frame);
    runOnJS(setFps)(result.resultMetadata?.processingTimeMs ?? 0);
  }, []);

  if (!device) return <Text>No camera</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive
        frameProcessor={frameProcessor}
      />
      <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <Rect x={20} y={20} width={100} height={40} color="rgba(0,0,0,0.5)" />
      </Canvas>
      <Text style={{ position: 'absolute', top: 30, left: 30, color: 'white' }}>
        OCR ms: {fps}
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: Build EAS dev client**
```bash
eas build --profile development --platform android
# Install the resulting APK on the reference device
```

- [ ] **Step 5: Verify on device**
  - Camera opens and streams
  - ML Kit processes frames (ms counter updates)
  - Skia overlay renders without crash
  - FPS ≥ 30 on reference Android device

- [ ] **Step 6: Record pinned versions and device fps in `docs/spike-results.md`**

- [ ] **Step 7: Commit**
```bash
git add -A
git commit -m "spike: vision camera + ml kit + skia verified on device, versions pinned"
```

---

---

# MILESTONE 2 — Domain Core

## Sprint 2 · Weeks 2–3 · Calculations + Wizard UI

**Goal:** All domain calculations covered by tests. Real-wage wizard functional with local state. No database yet.

---

### Task 2.1: Money Value Object

**Files:**
- Create: `src/domain/money/money.ts`
- Create: `src/domain/money/money.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// src/domain/money/money.test.ts
import { describe, it, expect } from 'vitest';
import { money, addMoney, subtractMoney, toDecimal } from './money';

describe('money', () => {
  it('stores minor units and currency', () => {
    const m = money(1299n, 'USD');
    expect(m.amountMinor).toBe(1299n);
    expect(m.currency).toBe('USD');
  });

  it('adds two same-currency amounts', () => {
    expect(addMoney(money(100n, 'USD'), money(200n, 'USD')).amountMinor).toBe(300n);
  });

  it('throws on currency mismatch', () => {
    expect(() => addMoney(money(100n, 'USD'), money(100n, 'CAD'))).toThrow();
  });

  it('converts to decimal', () => {
    expect(toDecimal(money(1299n, 'USD'))).toBeCloseTo(12.99);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**
```bash
npx vitest run src/domain/money
```

- [ ] **Step 3: Implement**
```ts
// src/domain/money/money.ts
export interface Money {
  readonly amountMinor: bigint;
  readonly currency: string;
}

export const money = (amountMinor: bigint, currency: string): Money =>
  ({ amountMinor, currency });

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  return money(a.amountMinor + b.amountMinor, a.currency);
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  return money(a.amountMinor - b.amountMinor, a.currency);
}

export function toDecimal(m: Money): number {
  return Number(m.amountMinor) / 100;
}
```

- [ ] **Step 4: Run — expect PASS**
```bash
npx vitest run src/domain/money
```

- [ ] **Step 5: Commit**
```bash
git add src/domain/money/
git commit -m "feat(domain): Money value object with minor-units arithmetic"
```

---

### Task 2.2: Result Type

**Files:**
- Create: `src/lib/result.ts`
- Create: `src/lib/result.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// src/lib/result.test.ts
import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr } from './result';

describe('Result', () => {
  it('ok wraps a value', () => {
    const r = ok(42);
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value).toBe(42);
  });

  it('err wraps an error', () => {
    const r = err(new Error('fail'));
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.message).toBe('fail');
  });
});
```

- [ ] **Step 2: Run — expect FAIL, Step 3: Implement**
```ts
// src/lib/result.ts
export type Result<T, E = Error> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

export const ok  = <T>(value: T): Result<T, never>  => ({ ok: true,  value });
export const err = <E>(error: E): Result<never, E>  => ({ ok: false, error });
export const isOk  = <T, E>(r: Result<T, E>): r is { ok: true;  value: T } => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } => !r.ok;
```

- [ ] **Step 4: Run — expect PASS, Step 5: Commit**
```bash
git add src/lib/result.ts src/lib/result.test.ts
git commit -m "feat(lib): Result<T,E> type"
```

---

### Task 2.3: Real-Wage Calculation

**Files:**
- Create: `src/domain/wage/wage.ts`
- Create: `src/domain/wage/wage.test.ts`

- [ ] **Step 1: Write failing tests** (covers PRD worked example and edge cases)
```ts
// src/domain/wage/wage.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRealWage } from './wage';
import { isOk, isErr } from '@/lib/result';

describe('calculateRealWage', () => {
  // PRD worked example: net $4,000, 173 paid hrs, $700 costs, 82 job hrs → $12.94/hr real
  it('matches PRD worked example', () => {
    const r = calculateRealWage({
      netPayMinor: 400000n,
      jobCostsMinor: 70000n,
      paidHoursPerMonth: 173,
      jobHoursPerMonth: 82,
    });
    expect(isOk(r)).toBe(true);
    if (!isOk(r)) return;
    expect(r.value.realHourly).toBeCloseTo(12.94, 1);
    expect(r.value.nominalHourly).toBeCloseTo(23.12, 1);
    expect(r.value.gapPercent).toBeCloseTo(44, 0);
  });

  it('returns error when real wage is zero or negative', () => {
    const r = calculateRealWage({
      netPayMinor: 100000n,
      jobCostsMinor: 100000n, // costs equal pay
      paidHoursPerMonth: 173,
      jobHoursPerMonth: 0,
    });
    expect(isErr(r)).toBe(true);
  });

  it('converts weekly pay to monthly', () => {
    // $1,000/week net, 40 hrs/week → monthly = $1000 * 52/12 = $4333.33
    const r = calculateRealWage({
      netPayMinor: 100000n,   // $1,000 weekly
      payPeriod: 'weekly',
      jobCostsMinor: 0n,
      paidHoursPerWeek: 40,
      jobHoursPerMonth: 0,
    });
    expect(isOk(r)).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**
```ts
// src/domain/wage/wage.ts
import { Result, ok, err } from '@/lib/result';

export type PayPeriod = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export interface WageInput {
  netPayMinor: bigint;
  payPeriod?: PayPeriod;
  jobCostsMinor: bigint;
  paidHoursPerMonth?: number;
  paidHoursPerWeek?: number;
  jobHoursPerMonth: number;
}

export interface RealWage {
  nominalHourly: number;
  realHourly: number;
  gapPercent: number;
  totalHoursPerMonth: number;
}

export class NegativeRealWageError extends Error {
  constructor(public readonly realWage: number) {
    super(`Real wage is ${realWage} — job costs meet or exceed net pay`);
  }
}

function monthlyHours(input: WageInput): number {
  if (input.paidHoursPerMonth) return input.paidHoursPerMonth;
  const weekly = input.paidHoursPerWeek ?? 40;
  return (weekly * 52) / 12;
}

function monthlyNetPay(input: WageInput): number {
  const minor = Number(input.netPayMinor);
  switch (input.payPeriod ?? 'monthly') {
    case 'weekly':      return (minor * 52) / 12;
    case 'biweekly':    return (minor * 26) / 12;
    case 'semimonthly': return minor * 2;
    case 'monthly':     return minor;
  }
}

export function calculateRealWage(input: WageInput): Result<RealWage, NegativeRealWageError> {
  const netPay   = monthlyNetPay(input);
  const costs    = Number(input.jobCostsMinor);
  const paidHrs  = monthlyHours(input);
  const totalHrs = paidHrs + input.jobHoursPerMonth;

  const realHourly    = (netPay - costs) / totalHrs / 100;
  const nominalHourly = netPay / paidHrs / 100;

  if (realHourly <= 0) return err(new NegativeRealWageError(realHourly));

  const gapPercent = ((nominalHourly - realHourly) / nominalHourly) * 100;

  return ok({ nominalHourly, realHourly, gapPercent, totalHoursPerMonth: totalHrs });
}
```

- [ ] **Step 4: Run — expect PASS**
- [ ] **Step 5: Commit**
```bash
git add src/domain/wage/
git commit -m "feat(domain): real-wage calculation with PRD worked example verified"
```

---

### Task 2.4: Life-Energy Conversion

**Files:**
- Create: `src/domain/price/price.ts`
- Create: `src/domain/price/price.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// src/domain/price/price.test.ts
import { describe, it, expect } from 'vitest';
import { lifeEnergy, formatLifeEnergy } from './price';

describe('lifeEnergy', () => {
  it('converts $12.99 at $12.94/hr to ~60 minutes', () => {
    const result = lifeEnergy({ priceMinor: 1299n, realHourlyWage: 12.94 });
    expect(result.totalMinutes).toBeCloseTo(60.2, 0);
  });

  it('formats under 1 hour as minutes', () => {
    expect(formatLifeEnergy({ totalMinutes: 43 })).toBe('43 m');
  });

  it('formats 1–40 hours as hours + minutes', () => {
    expect(formatLifeEnergy({ totalMinutes: 65 })).toBe('1 h 5 m');
  });

  it('formats 10+ hours dropping minutes', () => {
    expect(formatLifeEnergy({ totalMinutes: 840 })).toBe('14 h');
  });

  it('formats > 40 hours as work days', () => {
    // 3.2 work days
    expect(formatLifeEnergy({ totalMinutes: 1536, workDayMinutes: 480 })).toMatch(/work day/);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**
- [ ] **Step 3: Implement**
```ts
// src/domain/price/price.ts
export interface LifeEnergyInput {
  priceMinor: bigint;
  realHourlyWage: number; // dollars per hour
}

export interface LifeEnergyResult {
  totalMinutes: number;
  hours: number;
  minutes: number;
}

export function lifeEnergy({ priceMinor, realHourlyWage }: LifeEnergyInput): LifeEnergyResult {
  const priceUSD = Number(priceMinor) / 100;
  const totalHours = priceUSD / realHourlyWage;
  const totalMinutes = totalHours * 60;
  return {
    totalMinutes,
    hours: Math.floor(totalHours),
    minutes: Math.round(totalMinutes % 60),
  };
}

export function formatLifeEnergy(
  { totalMinutes, workDayMinutes = 480 }:
  { totalMinutes: number; workDayMinutes?: number }
): string {
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} m`;
  const hours = totalMinutes / 60;
  if (hours >= 40) {
    const days = (totalMinutes / workDayMinutes).toFixed(1);
    return `${days} work days`;
  }
  if (hours >= 10) return `${Math.floor(hours)} h`;
  const h = Math.floor(hours);
  const m = Math.round(totalMinutes % 60);
  return m > 0 ? `${h} h ${m} m` : `${h} h`;
}
```

- [ ] **Step 4: Run — expect PASS, Step 5: Commit**
```bash
git add src/domain/price/
git commit -m "feat(domain): life-energy conversion and display formatting"
```

---

### Task 2.5: Crossover Projection

**Files:**
- Create: `src/domain/crossover/crossover.ts`
- Create: `src/domain/crossover/crossover.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// src/domain/crossover/crossover.test.ts
import { describe, it, expect } from 'vitest';
import { monthlyInvestmentIncome, projectCrossover } from './crossover';

describe('monthlyInvestmentIncome', () => {
  it('applies annual rate monthly', () => {
    // $120,000 at 4% → $400/month
    expect(monthlyInvestmentIncome({ capitalMinor: 12000000n, annualRatePct: 4 })).toBeCloseTo(400, 0);
  });
});

describe('projectCrossover', () => {
  it('returns months to crossover', () => {
    const result = projectCrossover({
      currentCapitalMinor: 12000000n,  // $120,000
      monthlyExpensesMinor: 300000n,   // $3,000/month
      monthlySavingsMinor: 100000n,    // $1,000/month savings
      annualRatePct: 4,
    });
    expect(result.monthsToGo).toBeGreaterThan(0);
    expect(result.crossoverCapitalMinor).toBeGreaterThan(12000000n);
  });

  it('returns 0 months if already crossed over', () => {
    const result = projectCrossover({
      currentCapitalMinor: 100000000n, // $1,000,000
      monthlyExpensesMinor: 200000n,   // $2,000/month
      monthlySavingsMinor: 50000n,
      annualRatePct: 4,
    });
    expect(result.monthsToGo).toBe(0);
  });
});
```

- [ ] **Step 2: Run — expect FAIL, Step 3: Implement**
```ts
// src/domain/crossover/crossover.ts
export function monthlyInvestmentIncome({
  capitalMinor, annualRatePct,
}: { capitalMinor: bigint; annualRatePct: number }): number {
  return (Number(capitalMinor) / 100) * (annualRatePct / 100) / 12;
}

export interface CrossoverResult {
  monthsToGo: number;
  crossoverCapitalMinor: bigint;
  projectedDate: Date;
}

export function projectCrossover({
  currentCapitalMinor, monthlyExpensesMinor, monthlySavingsMinor, annualRatePct,
}: {
  currentCapitalMinor: bigint;
  monthlyExpensesMinor: bigint;
  monthlySavingsMinor: bigint;
  annualRatePct: number;
}): CrossoverResult {
  const monthlyExpenses = Number(monthlyExpensesMinor) / 100;
  let capital = Number(currentCapitalMinor) / 100;
  const monthlySavings = Number(monthlySavingsMinor) / 100;
  const monthlyRate = annualRatePct / 100 / 12;

  // Already crossed over
  if (capital * monthlyRate * 12 >= monthlyExpenses * 12) {
    return {
      monthsToGo: 0,
      crossoverCapitalMinor: currentCapitalMinor,
      projectedDate: new Date(),
    };
  }

  let months = 0;
  const MAX_MONTHS = 600; // 50 years safety cap
  while (capital * monthlyRate * 12 < monthlyExpenses * 12 && months < MAX_MONTHS) {
    capital += capital * monthlyRate + monthlySavings;
    months++;
  }

  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + months);

  return {
    monthsToGo: months,
    crossoverCapitalMinor: BigInt(Math.round(capital * 100)),
    projectedDate,
  };
}
```

- [ ] **Step 4: Run — expect PASS, Step 5: Commit**
```bash
git add src/domain/crossover/
git commit -m "feat(domain): crossover projection calculation"
```

---

### Task 2.6: Format Utilities

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/format.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// src/lib/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatHours, formatDate } from './format';

describe('formatCurrency', () => {
  it('formats USD cents as $X.XX', () => {
    expect(formatCurrency(1299n, 'USD')).toBe('$12.99');
    expect(formatCurrency(130000n, 'USD')).toBe('$1,300.00');
  });
});

describe('formatHours', () => {
  it('adds ≈ prefix when estimated', () => {
    expect(formatHours(65, { estimated: true })).toMatch(/^≈/);
  });
});
```

- [ ] **Step 2: Run — expect FAIL, Step 3: Implement**
```ts
// src/lib/format.ts
import { formatLifeEnergy } from '@/domain/price/price';

export function formatCurrency(amountMinor: bigint, currency: string): string {
  const amount = Number(amountMinor) / 100;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatHours(
  totalMinutes: number,
  opts: { estimated?: boolean; workDayMinutes?: number } = {}
): string {
  const label = formatLifeEnergy({ totalMinutes, workDayMinutes: opts.workDayMinutes });
  return opts.estimated ? `≈ ${label}` : label;
}

export function formatDate(date: Date, style: 'short' | 'medium' = 'medium'): string {
  return style === 'short'
    ? new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).format(date)
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}
```

- [ ] **Step 4: Run — expect PASS, Step 5: Commit**
```bash
git add src/lib/format.ts src/lib/format.test.ts
git commit -m "feat(lib): format utilities for currency, hours, dates"
```

---

### Task 2.7: Real-Wage Wizard — Zustand Store + Screens

**Files:**
- Create: `src/presentation/stores/onboarding.store.ts`
- Create: `app/onboarding/_layout.tsx`
- Create: `app/onboarding/welcome.tsx`
- Create: `app/onboarding/pay.tsx`
- Create: `app/onboarding/hours.tsx`
- Create: `app/onboarding/commute.tsx`
- Create: `app/onboarding/reveal.tsx`

- [ ] **Step 1: Create onboarding store**
```ts
// src/presentation/stores/onboarding.store.ts
import { create } from 'zustand';

export type PayPeriod = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

interface OnboardingState {
  // Step values
  currency: string;
  payPeriod: PayPeriod;
  netPayMinor: bigint | null;
  paidHoursPerWeek: number | null;
  commuteMinutesPerDay: number | null;
  commuteCostMinor: bigint | null;
  // Extra job costs (full path)
  workMealsMinor: bigint;
  workClothesMinor: bigint;
  childcareMinor: bigint;
  decompressionMinor: bigint;
  extraJobHoursPerMonth: number;

  // Actions
  setCurrency: (c: string) => void;
  setPayPeriod: (p: PayPeriod) => void;
  setNetPay: (minor: bigint) => void;
  setPaidHours: (hrs: number) => void;
  setCommute: (minutes: number, costMinor: bigint) => void;
  reset: () => void;
}

const defaults = {
  currency: 'USD',
  payPeriod: 'monthly' as PayPeriod,
  netPayMinor: null,
  paidHoursPerWeek: null,
  commuteMinutesPerDay: null,
  commuteCostMinor: null,
  workMealsMinor: 0n,
  workClothesMinor: 0n,
  childcareMinor: 0n,
  decompressionMinor: 0n,
  extraJobHoursPerMonth: 0,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...defaults,
  setCurrency: (currency) => set({ currency }),
  setPayPeriod: (payPeriod) => set({ payPeriod }),
  setNetPay: (netPayMinor) => set({ netPayMinor }),
  setPaidHours: (paidHoursPerWeek) => set({ paidHoursPerWeek }),
  setCommute: (commuteMinutesPerDay, commuteCostMinor) =>
    set({ commuteMinutesPerDay, commuteCostMinor }),
  reset: () => set(defaults),
}));
```

- [ ] **Step 2: Build wizard screens** — one screen per step with a `Next` button advancing via `router.push`. Each screen reads from and writes to `useOnboardingStore`.

- [ ] **Step 3: Build reveal screen** — call `calculateRealWage` with store values; display nominal vs real side by side using `display` typography from DESIGN.md.

- [ ] **Step 4: Verify quick path (3 steps) completes in ≤ 5 screens**

- [ ] **Step 5: Commit**
```bash
git add src/presentation/stores/onboarding.store.ts app/onboarding/
git commit -m "feat(wizard): real-wage wizard with onboarding store and reveal screen"
```

---

---

# MILESTONE 3 — Price Lens MVP

## Sprint 3 · Weeks 3–4 · Price Parser + Live Lens

**Goal:** Live lens running on device, parsing US price formats, labels stabilized, no flicker.

---

### Task 3.1: Price Parser (Domain)

**Files:**
- Create: `src/domain/price/parser.ts`
- Create: `src/domain/price/parser.test.ts`

- [ ] **Step 1: Write failing tests** (covers every row from PRD parsing table)
```ts
// src/domain/price/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parsePrice, isPriceToken } from './parser';

describe('parsePrice', () => {
  // Standard formats
  it('parses $4.99',       () => expect(parsePrice('$4.99')).toEqual({ minor: 499n, currency: 'USD' }));
  it('parses $1,299.00',   () => expect(parsePrice('$1,299.00')).toEqual({ minor: 129900n, currency: 'USD' }));
  it('parses 99¢',         () => expect(parsePrice('99¢')).toEqual({ minor: 99n, currency: 'USD' }));
  it('parses .99',         () => expect(parsePrice('.99')).toEqual({ minor: 99n, currency: 'USD' }));

  // Multi-buy: returns per-item price
  it('parses 2 for $5',    () => expect(parsePrice('2 for $5')).toEqual({ minor: 250n, currency: 'USD', note: 'per-item' }));
  it('parses 3/$10',       () => expect(parsePrice('3/$10')).toEqual({ minor: 333n, currency: 'USD', note: 'per-item' }));
});

describe('isPriceToken', () => {
  it('rejects dates',      () => expect(isPriceToken('09/29/2026')).toBe(false));
  it('rejects weights',    () => expect(isPriceToken('4.5oz')).toBe(false));
  it('rejects barcodes',   () => expect(isPriceToken('0123456789012')).toBe(false));
  it('rejects phone numbers', () => expect(isPriceToken('555-1234')).toBe(false));
  it('accepts $4.99',      () => expect(isPriceToken('$4.99')).toBe(true));
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement parser** covering all PRD patterns
```ts
// src/domain/price/parser.ts
export interface ParsedPrice {
  minor: bigint;
  currency: string;
  note?: 'per-item' | 'per-unit' | 'with-card' | 'sale';
  confidence: number; // 0–1
}

const REJECT_PATTERNS = [
  /^\d{2}\/\d{2}\/\d{4}$/,           // dates
  /\d+(oz|lb|fl oz|kg|g)\b/i,        // weights
  /^\d{10,13}$/,                      // barcodes/UPCs
  /\d{3}-\d{4}/,                      // phone fragments
];

export function isPriceToken(token: string): boolean {
  if (REJECT_PATTERNS.some(r => r.test(token.trim()))) return false;
  return /[$¢]|^\.\d{2}$/.test(token) || /^\d{1,4}\.\d{2}$/.test(token);
}

export function parsePrice(text: string): ParsedPrice | null {
  const t = text.trim();

  // Multi-buy: "2 for $5" or "3/$10"
  const multiBuy = t.match(/^(\d+)\s*(?:for|\/)\s*\$(\d+(?:\.\d{2})?)$/i);
  if (multiBuy) {
    const count = parseInt(multiBuy[1]!);
    const total = parseFloat(multiBuy[2]!);
    return { minor: BigInt(Math.round((total / count) * 100)), currency: 'USD', note: 'per-item', confidence: 0.9 };
  }

  // Cents only: 99¢
  const cents = t.match(/^(\d+)¢$/);
  if (cents) return { minor: BigInt(parseInt(cents[1]!)), currency: 'USD', confidence: 1 };

  // Leading dot: .99
  const leadingDot = t.match(/^\.(\d{2})$/);
  if (leadingDot) return { minor: BigInt(parseInt(leadingDot[1]!)), currency: 'USD', confidence: 0.85 };

  // Standard: $X.XX or $X,XXX.XX
  const standard = t.match(/^\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)$/);
  if (standard) {
    const numeric = standard[1]!.replace(/,/g, '');
    const minor = BigInt(Math.round(parseFloat(numeric) * 100));
    return { minor, currency: 'USD', confidence: 1 };
  }

  return null;
}
```

- [ ] **Step 4: Run — expect PASS**
- [ ] **Step 5: Commit**
```bash
git add src/domain/price/parser.ts src/domain/price/parser.test.ts
git commit -m "feat(domain): price parser covering all PRD US price formats"
```

---

### Task 3.2: Frame Stabilizer (Domain)

**Files:**
- Create: `src/domain/price/stabilizer.ts`
- Create: `src/domain/price/stabilizer.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// src/domain/price/stabilizer.test.ts
import { describe, it, expect } from 'vitest';
import { createStabilizer } from './stabilizer';

describe('createStabilizer', () => {
  it('shows label only after 2 of 3 frames', () => {
    const s = createStabilizer();
    const price = { minor: 499n, currency: 'USD', confidence: 1, id: 'p1', x: 10, y: 10 };

    s.addFrame([price]);         // frame 1 — 1/3
    expect(s.stableItems()).toHaveLength(0);

    s.addFrame([price]);         // frame 2 — 2/3
    expect(s.stableItems()).toHaveLength(1);
  });

  it('removes label after 3 consecutive missed frames', () => {
    const s = createStabilizer();
    const price = { minor: 499n, currency: 'USD', confidence: 1, id: 'p1', x: 10, y: 10 };
    s.addFrame([price]);
    s.addFrame([price]);
    expect(s.stableItems()).toHaveLength(1);

    s.addFrame([]);
    s.addFrame([]);
    s.addFrame([]);
    expect(s.stableItems()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run — expect FAIL, Step 3: Implement**
```ts
// src/domain/price/stabilizer.ts
export interface DetectedPrice {
  id: string;
  minor: bigint;
  currency: string;
  confidence: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface TrackedPrice extends DetectedPrice {
  seenInLast3: boolean[];
  missedFrames: number;
}

export function createStabilizer() {
  const tracked = new Map<string, TrackedPrice>();

  return {
    addFrame(prices: DetectedPrice[]) {
      const seenIds = new Set(prices.map(p => p.id));

      // Update existing
      for (const [id, item] of tracked) {
        item.seenInLast3 = [...item.seenInLast3.slice(-2), seenIds.has(id)];
        item.missedFrames = seenIds.has(id) ? 0 : item.missedFrames + 1;
      }

      // Add new
      for (const price of prices) {
        if (!tracked.has(price.id)) {
          tracked.set(price.id, { ...price, seenInLast3: [true], missedFrames: 0 });
        } else {
          const t = tracked.get(price.id)!;
          Object.assign(t, price); // update position
        }
      }

      // Evict after 3 missed frames
      for (const [id, item] of tracked) {
        if (item.missedFrames >= 3) tracked.delete(id);
      }
    },

    stableItems(): DetectedPrice[] {
      return [...tracked.values()].filter(
        t => t.seenInLast3.filter(Boolean).length >= 2
      );
    },
  };
}
```

- [ ] **Step 4: Run — expect PASS, Step 5: Commit**
```bash
git add src/domain/price/stabilizer.ts src/domain/price/stabilizer.test.ts
git commit -m "feat(domain): frame stabilizer — show after 2/3 frames, remove after 3 misses"
```

---

### Task 3.3: Lens Store

**Files:**
- Create: `src/presentation/stores/lens.store.ts`

- [ ] **Step 1: Implement** (as per `rules/state-management.md`)
```ts
// src/presentation/stores/lens.store.ts
import { create } from 'zustand';
import type { DetectedPrice } from '@/domain/price/stabilizer';

type LensMode = 'live' | 'freeze';

interface LensState {
  mode: LensMode;
  torchOn: boolean;
  selectedChipId: string | null;
  stablePrices: DetectedPrice[];

  freeze: () => void;
  unfreeze: () => void;
  toggleTorch: () => void;
  selectChip: (id: string | null) => void;
  setPrices: (prices: DetectedPrice[]) => void;
}

export const useLensStore = create<LensState>((set) => ({
  mode: 'live',
  torchOn: false,
  selectedChipId: null,
  stablePrices: [],

  freeze:       () => set({ mode: 'freeze' }),
  unfreeze:     () => set({ mode: 'live', selectedChipId: null }),
  toggleTorch:  () => set((s) => ({ torchOn: !s.torchOn })),
  selectChip:   (id) => set({ selectedChipId: id }),
  setPrices:    (stablePrices) => set({ stablePrices }),
}));
```

- [ ] **Step 2: Commit**
```bash
git add src/presentation/stores/lens.store.ts
git commit -m "feat(store): lens store — mode, torch, chip selection, stable prices"
```

---

### Task 3.4: LabelChip Component (Skia)

**Files:**
- Create: `src/presentation/components/LabelChip.tsx`
- Create: `src/theme/chip-tiers.ts`

- [ ] **Step 1: Create chip tiers**
```ts
// src/theme/chip-tiers.ts
export const chipTiers = [
  { fill: 'rgba(17,15,13,0.72)', text: '#FAF8F5', border: 'rgba(255,255,255,0.18)' },
  { fill: 'rgba(17,15,13,0.80)', text: '#FAF8F5', border: 'rgba(255,255,255,0.18)' },
  { fill: '#F7C873',             text: '#110F0D', border: 'rgba(255,255,255,0.18)' },
  { fill: '#E8A13A',             text: '#110F0D', border: 'rgba(255,255,255,0.18)' },
  { fill: '#9A6214',             text: '#FFFFFF', border: 'rgba(255,255,255,0.18)' },
] as const;

export type ChipTier = 0 | 1 | 2 | 3 | 4;

export function getTier(totalMinutes: number, workDayMinutes = 480): ChipTier {
  if (totalMinutes < 15)  return 0;
  if (totalMinutes < 60)  return 1;
  if (totalMinutes < workDayMinutes) return 2;
  if (totalMinutes < workDayMinutes * 5) return 3;
  return 4;
}
```

- [ ] **Step 2: Create LabelChip**
```tsx
// src/presentation/components/LabelChip.tsx
import { RoundedRect, Text as SkiaText, Group, rect } from '@shopify/react-native-skia';
import type { ChipTier } from '@/theme/chip-tiers';
import { chipTiers } from '@/theme/chip-tiers';

interface Props {
  label: string;        // e.g. "≈ 1 h 5 m"
  x: number;
  y: number;
  tier: ChipTier;
  font: any;            // SkiaFont from useFont()
}

const CHIP_HEIGHT = 32;
const CHIP_H_PAD  = 10;

export function LabelChip({ label, x, y, tier, font }: Props) {
  const colors = chipTiers[tier];
  const textWidth = font ? font.measureText(label).width : 80;
  const chipWidth = textWidth + CHIP_H_PAD * 2;

  return (
    <Group>
      <RoundedRect
        x={x} y={y - CHIP_HEIGHT / 2}
        width={chipWidth} height={CHIP_HEIGHT}
        r={CHIP_HEIGHT / 2}
        color={colors.fill}
      />
      <SkiaText
        x={x + CHIP_H_PAD}
        y={y + 5}
        text={label}
        font={font}
        color={colors.text}
      />
    </Group>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/presentation/components/LabelChip.tsx src/theme/chip-tiers.ts
git commit -m "feat(components): LabelChip Skia component with time-weight tiers"
```

---

### Task 3.5: Live Lens Screen

**Files:**
- Create: `src/presentation/screens/lens/LensScreen.tsx`
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Implement frame processor**

The frame processor runs on a worklet thread: scan text → parse prices → stabilize → pass to JS thread via `runOnJS`.

```tsx
// src/presentation/screens/lens/LensScreen.tsx
import { useCallback, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { scanText } from 'vision-camera-plugin-ml-kit-text-recognition';
import { Canvas, useFont } from '@shopify/react-native-skia';
import { useLensStore } from '@/presentation/stores/lens.store';
import { parsePrice } from '@/domain/price/parser';
import { createStabilizer } from '@/domain/price/stabilizer';
import { formatHours } from '@/lib/format';
import { lifeEnergy } from '@/domain/price/price';
import { LabelChip } from '@/presentation/components/LabelChip';
import { getTier } from '@/theme/chip-tiers';

const stabilizer = createStabilizer();

export function LensScreen({ realHourlyWage }: { realHourlyWage: number }) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { mode, torchOn, freeze, unfreeze, setPrices, stablePrices } = useLensStore();
  const font = useFont(require('@assets/fonts/Inter-Bold.ttf'), 15);

  const onPricesDetected = useCallback((detected: any[]) => {
    stabilizer.addFrame(detected);
    setPrices(stabilizer.stableItems());
  }, [setPrices]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (mode === 'freeze') return;
    const result = scanText(frame);
    const detected = (result.blocks ?? [])
      .flatMap((b: any) => b.lines ?? [])
      .flatMap((l: any) => l.elements ?? [])
      .map((el: any) => {
        const parsed = parsePrice(el.text);
        if (!parsed) return null;
        return {
          id: `${el.frame.x.toFixed(0)}-${el.frame.y.toFixed(0)}`,
          ...parsed,
          x: el.frame.x,
          y: el.frame.y,
          width: el.frame.width,
          height: el.frame.height,
        };
      })
      .filter(Boolean);
    runOnJS(onPricesDetected)(detected);
  }, [mode, onPricesDetected]);

  if (!device) return null;

  return (
    <View className="flex-1 bg-black">
      <Camera
        className="flex-1"
        device={device}
        isActive={mode === 'live'}
        frameProcessor={frameProcessor}
        torch={torchOn ? 'on' : 'off'}
      />
      <Canvas className="absolute inset-0" pointerEvents="none">
        {stablePrices.map(p => {
          const energy = lifeEnergy({ priceMinor: p.minor, realHourlyWage });
          const label  = formatHours(energy.totalMinutes, { estimated: p.confidence < 0.9 });
          const tier   = getTier(energy.totalMinutes);
          return (
            <LabelChip
              key={p.id}
              label={label}
              x={(p.x ?? 0) + (p.width ?? 60) + 8}
              y={(p.y ?? 0) + (p.height ?? 20) / 2}
              tier={tier}
              font={font}
            />
          );
        })}
      </Canvas>

      {/* Controls */}
      <View className="absolute bottom-10 w-full flex-row items-center justify-between px-xl">
        <Pressable className="min-h-[44px] min-w-[44px] items-center justify-center">
          {/* Keypad icon */}
        </Pressable>
        <Pressable
          className="w-[72px] h-[72px] rounded-pill border-4 border-white bg-white/20 items-center justify-center"
          onPress={mode === 'live' ? freeze : unfreeze}
          accessibilityLabel={mode === 'live' ? 'Freeze frame' : 'Unfreeze'}
        />
        <Pressable
          className="min-h-[44px] min-w-[44px] items-center justify-center"
          onPress={useLensStore.getState().toggleTorch}
          accessibilityLabel="Toggle torch"
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Wire into `app/(tabs)/index.tsx`**
- [ ] **Step 3: Test on device — verify labels appear ≤ 1 s (p90) and no flicker at rest**
- [ ] **Step 4: Commit**
```bash
git add src/presentation/screens/lens/ app/(tabs)/index.tsx
git commit -m "feat(lens): live frame processor with ML Kit, stabilizer, Skia label chips"
```

---

---

# MILESTONE 4 — MVP Complete

## Sprint 4 · Week 5 · Label Sheet + Log + Offline Store + Export

**Goal:** Full MVP flow: scan → tap chip → log expense → review log → export. All offline.

---

### Task 4.1: SQLite Schema + Drizzle Migrations

**Files:**
- Create: `src/infrastructure/sqlite/drizzle/schema.ts`
- Create: `src/infrastructure/sqlite/drizzle/migrations/0001_init.sql`
- Create: `src/infrastructure/sqlite/db.ts`

- [ ] **Step 1: Define schema**
```ts
// src/infrastructure/sqlite/drizzle/schema.ts
import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const wageProfiles = sqliteTable('wage_profiles', {
  id:             text('id').primaryKey(),
  effectiveFrom:  text('effective_from').notNull(),
  netPayMinor:    integer('net_pay_minor', { mode: 'bigint' }).notNull(),
  currency:       text('currency').notNull().default('USD'),
  payPeriod:      text('pay_period').notNull(),
  paidHoursPerWeek: integer('paid_hours_per_week').notNull(),
  jobCostsMinor:  integer('job_costs_minor', { mode: 'bigint' }).notNull().default(0n),
  jobHoursPerMonth: integer('job_hours_per_month').notNull().default(0),
  realWageCached: integer('real_wage_cached').notNull(), // cents per hour * 100
  createdAt:      text('created_at').notNull(),
  updatedAt:      text('updated_at').notNull(),
  deletedAt:      text('deleted_at'),
});

export const expenses = sqliteTable('expenses', {
  id:            text('id').primaryKey(),
  amountMinor:   integer('amount_minor', { mode: 'bigint' }).notNull(),
  currency:      text('currency').notNull().default('USD'),
  categoryId:    text('category_id'),
  spentAt:       text('spent_at').notNull(),
  note:          text('note'),
  wageProfileId: text('wage_profile_id').notNull(),
  verdict:       text('verdict'),  // 'worth_it' | 'not_sure' | 'not_worth_it'
  source:        text('source').notNull(), // 'lens' | 'freeze' | 'keypad' | 'manual'
  createdAt:     text('created_at').notNull(),
  updatedAt:     text('updated_at').notNull(),
  deletedAt:     text('deleted_at'),
});

export const conversions = sqliteTable('conversions', {
  id:            text('id').primaryKey(),
  priceMinor:    integer('price_minor', { mode: 'bigint' }).notNull(),
  currency:      text('currency').notNull().default('USD'),
  hoursMinutes:  integer('hours_minutes').notNull(), // totalMinutes
  verdict:       text('verdict'),
  source:        text('source').notNull(),
  createdAt:     text('created_at').notNull(),
});
```

- [ ] **Step 2: Create db.ts**
```ts
// src/infrastructure/sqlite/db.ts
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './drizzle/schema';

const sqlite = SQLite.openDatabaseSync('life-energy.db');
export const db = drizzle(sqlite, { schema });
```

- [ ] **Step 3: Commit**
```bash
git add src/infrastructure/sqlite/
git commit -m "feat(db): SQLite schema with Drizzle — wage_profiles, expenses, conversions"
```

---

### Task 4.2: Repository Ports + SQLite Adapters

**Files:**
- Create: `src/application/ports/expense-repository.port.ts`
- Create: `src/application/ports/wage-repository.port.ts`
- Create: `src/infrastructure/sqlite/sqlite-expense-repository.ts`
- Create: `src/infrastructure/sqlite/sqlite-wage-repository.ts`

- [ ] **Step 1: Define ports**
```ts
// src/application/ports/expense-repository.port.ts
import type { Money } from '@/domain/money/money';

export interface ExpenseInput {
  id: string;
  amountMinor: bigint;
  currency: string;
  categoryId?: string;
  spentAt: Date;
  note?: string;
  wageProfileId: string;
  verdict?: string;
  source: 'lens' | 'freeze' | 'keypad' | 'manual';
}

export interface ExpenseRecord extends ExpenseInput {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ExpenseRepository {
  save(expense: ExpenseInput): Promise<void>;
  findByMonth(month: string): Promise<ExpenseRecord[]>;
  findAll(): Promise<ExpenseRecord[]>;
  delete(id: string): Promise<void>;
  exportAll(): Promise<ExpenseRecord[]>;
}
```

- [ ] **Step 2: Implement SQLite adapter**
```ts
// src/infrastructure/sqlite/sqlite-expense-repository.ts
import { db } from './db';
import { expenses } from './drizzle/schema';
import { eq, gte, lt, isNull } from 'drizzle-orm';
import type { ExpenseRepository, ExpenseInput, ExpenseRecord } from '@/application/ports/expense-repository.port';

export class SqliteExpenseRepository implements ExpenseRepository {
  async save(expense: ExpenseInput): Promise<void> {
    const now = new Date().toISOString();
    await db.insert(expenses).values({
      id:            expense.id,
      amountMinor:   expense.amountMinor,
      currency:      expense.currency,
      categoryId:    expense.categoryId ?? null,
      spentAt:       expense.spentAt.toISOString(),
      note:          expense.note ?? null,
      wageProfileId: expense.wageProfileId,
      verdict:       expense.verdict ?? null,
      source:        expense.source,
      createdAt:     now,
      updatedAt:     now,
      deletedAt:     null,
    }).onConflictDoUpdate({
      target: expenses.id,
      set: { updatedAt: now, verdict: expense.verdict ?? null },
    });
  }

  async findByMonth(month: string): Promise<ExpenseRecord[]> {
    const start = `${month}-01`;
    const end   = nextMonth(month);
    const rows  = await db.select().from(expenses)
      .where(gte(expenses.spentAt, start))
      .where(lt(expenses.spentAt, end))
      .where(isNull(expenses.deletedAt));
    return rows.map(toRecord);
  }

  async findAll():          Promise<ExpenseRecord[]> { return (await db.select().from(expenses).where(isNull(expenses.deletedAt))).map(toRecord); }
  async exportAll():        Promise<ExpenseRecord[]> { return (await db.select().from(expenses)).map(toRecord); }
  async delete(id: string): Promise<void>            { await db.update(expenses).set({ deletedAt: new Date().toISOString() }).where(eq(expenses.id, id)); }
}

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

function toRecord(row: any): ExpenseRecord {
  return {
    ...row,
    amountMinor: BigInt(row.amountMinor),
    spentAt:  new Date(row.spentAt),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    deletedAt: row.deletedAt ? new Date(row.deletedAt) : undefined,
  };
}
```

- [ ] **Step 3: Commit**
```bash
git add src/application/ports/ src/infrastructure/sqlite/
git commit -m "feat(infra): ExpenseRepository port + SQLite adapter"
```

---

### Task 4.3: Use Cases — Log Expense + Get Expenses

**Files:**
- Create: `src/application/log-expense.ts`
- Create: `src/application/log-expense.test.ts`
- Create: `src/application/get-expenses.ts`

- [ ] **Step 1: Write failing test for log-expense**
```ts
// src/application/log-expense.test.ts
import { describe, it, expect, vi } from 'vitest';
import { logExpense } from './log-expense';
import type { ExpenseRepository } from './ports/expense-repository.port';

describe('logExpense', () => {
  it('saves the expense with a generated id', async () => {
    const repo: ExpenseRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findByMonth: vi.fn(), findAll: vi.fn(), delete: vi.fn(), exportAll: vi.fn(),
    };

    await logExpense(repo, {
      amountMinor: 1299n,
      currency: 'USD',
      wageProfileId: 'wp-1',
      source: 'lens',
      spentAt: new Date('2026-09-30'),
    });

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ amountMinor: 1299n, source: 'lens' })
    );
  });
});
```

- [ ] **Step 2: Run — expect FAIL, Step 3: Implement**
```ts
// src/application/log-expense.ts
import { randomUUID } from 'expo-crypto';
import type { ExpenseRepository, ExpenseInput } from './ports/expense-repository.port';

type LogExpenseInput = Omit<ExpenseInput, 'id'>;

export async function logExpense(repo: ExpenseRepository, input: LogExpenseInput): Promise<void> {
  await repo.save({ ...input, id: randomUUID() });
}
```

- [ ] **Step 4: Run — expect PASS, Step 5: Commit**
```bash
git add src/application/log-expense.ts src/application/log-expense.test.ts
git commit -m "feat(application): logExpense use case with repository port"
```

---

### Task 4.4: TanStack Query Hooks — Expenses

**Files:**
- Create: `src/lib/query-client.ts`
- Create: `src/lib/query-keys.ts`
- Create: `src/presentation/hooks/useExpenses.ts`
- Create: `src/presentation/hooks/useLogExpense.ts`

Implement per `rules/data-fetching.md` patterns exactly. Wire `QueryClientProvider` in `app/_layout.tsx`.

- [ ] **Step 1: Create query-client.ts and query-keys.ts** (as per data-fetching.md)
- [ ] **Step 2: Create useExpenses hook**
- [ ] **Step 3: Create useLogExpense mutation hook with `invalidateQueries` on success**
- [ ] **Step 4: Commit**
```bash
git add src/lib/query-client.ts src/lib/query-keys.ts src/presentation/hooks/
git commit -m "feat(hooks): TanStack Query hooks for expenses"
```

---

### Task 4.5: Label Sheet Component

**Files:**
- Create: `src/presentation/components/LabelSheet.tsx`

Per DESIGN.md §6.2: `@gorhom/bottom-sheet`, snap points 45%/90%, `display` hours, editable price, Worth It? buttons, Log It CTA.

- [ ] **Step 1: Install**
```bash
npx expo install @gorhom/bottom-sheet
```

- [ ] **Step 2: Implement LabelSheet**
```tsx
// src/presentation/components/LabelSheet.tsx
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRef, useState } from 'react';
import { formatCurrency, formatHours } from '@/lib/format';
import { lifeEnergy } from '@/domain/price/price';
import { useLogExpense } from '@/presentation/hooks/useLogExpense';
import { useLensStore } from '@/presentation/stores/lens.store';

type Verdict = 'worth_it' | 'not_sure' | 'not_worth_it';

interface Props {
  priceMinor: bigint;
  currency: string;
  wageProfileId: string;
  source: 'lens' | 'freeze';
  realHourlyWage: number;
  onClose: () => void;
}

export function LabelSheet({ priceMinor, currency, wageProfileId, source, realHourlyWage, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const [editedMinor, setEditedMinor] = useState(priceMinor);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const logExpense = useLogExpense();

  const energy = lifeEnergy({ priceMinor: editedMinor, realHourlyWage });
  const hoursLabel = formatHours(energy.totalMinutes, { estimated: false });

  const verdictButtons: { key: Verdict; label: string }[] = [
    { key: 'worth_it',     label: 'Worth it' },
    { key: 'not_sure',     label: 'Not sure' },
    { key: 'not_worth_it', label: 'Not worth it' },
  ];

  return (
    <BottomSheet ref={sheetRef} snapPoints={['45%', '90%']} onClose={onClose}>
      <BottomSheetView className="px-lg pt-md pb-xxxl">
        {/* Hours display */}
        <Text className="font-bold text-[48px] leading-[52px] tabular-nums text-sand-900 dark:text-sand-50">
          {hoursLabel}
        </Text>
        <TextInput
          className="text-[15px] text-sand-500 mt-xs"
          value={(Number(editedMinor) / 100).toFixed(2)}
          keyboardType="decimal-pad"
          onChangeText={(v) => {
            const cents = Math.round(parseFloat(v || '0') * 100);
            if (!isNaN(cents)) setEditedMinor(BigInt(cents));
          }}
          accessibilityLabel="Edit price"
        />

        {/* Worth it? */}
        <Text className="font-semibold text-[17px] text-sand-900 dark:text-sand-50 mt-xl mb-md">
          Worth it?
        </Text>
        <View className="flex-row gap-sm">
          {verdictButtons.map(({ key, label }) => (
            <Pressable
              key={key}
              className={`flex-1 py-sm rounded-md items-center ${verdict === key ? 'bg-amber-600' : 'bg-sand-100 dark:bg-sand-800'}`}
              onPress={() => setVerdict(key)}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <Text className={`font-semibold ${verdict === key ? 'text-white' : 'text-sand-900 dark:text-sand-50'}`}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Log it */}
        <Pressable
          className="w-full mt-xl py-md rounded-md bg-amber-600 items-center"
          onPress={() => {
            logExpense.mutate({
              amountMinor: editedMinor,
              currency,
              wageProfileId,
              source,
              spentAt: new Date(),
              verdict: verdict ?? undefined,
            });
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Log this expense"
        >
          <Text className="font-semibold text-white text-[17px]">Log it</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
```

- [ ] **Step 3: Wire into LensScreen — open on chip tap**
- [ ] **Step 4: Commit**
```bash
git add src/presentation/components/LabelSheet.tsx
git commit -m "feat(components): LabelSheet with verdict buttons and log action"
```

---

### Task 4.6: Manual Quick Convert Screen

**Files:**
- Create: `src/presentation/screens/lens/QuickConvertModal.tsx`

Per DESIGN.md §6.4: 3×4 keypad, `display` result above, live conversion, haptic on keypress.

- [ ] **Implement, commit**
```bash
git commit -m "feat(lens): manual quick convert keypad modal"
```

---

### Task 4.7: Log Screen

**Files:**
- Create: `src/presentation/screens/log/LogScreen.tsx`
- Create: `src/presentation/components/ExpenseRow.tsx`
- Modify: `app/(tabs)/log.tsx`

- [ ] **Implement** using `useExpenses` hook. Group by day. Show amount + hours per row.
- [ ] **Commit**
```bash
git commit -m "feat(screens): log screen with grouped expense list"
```

---

### Task 4.8: Export + Delete All Data

**Files:**
- Create: `src/application/export-data.ts`
- Create: `src/application/delete-all-data.ts`
- Modify: `src/presentation/screens/profile/ProfileScreen.tsx`

- [ ] **Implement export** using `expo-sharing` to share a JSON file via `expo-file-system`.
- [ ] **Implement delete** with a confirmation alert before calling `repo.deleteAll()`.
- [ ] **Commit**
```bash
git commit -m "feat(profile): data export (CSV/JSON) and delete all data"
```

---

### Task 4.9: MVP Beta Build

- [ ] **Run full test suite**
```bash
npx vitest run
npx tsc --noEmit
```
Expected: all tests pass, 0 type errors.

- [ ] **EAS preview build**
```bash
eas build --profile preview --platform all
```

- [ ] **Manual QA checklist**
  - [ ] Camera permission flow + fallback to quick convert
  - [ ] Live labels appear ≤ 1 s on mid-range Android
  - [ ] No flicker when phone held still 2 s
  - [ ] Freeze mode: tap shutter, labels stay, sheet opens on chip tap
  - [ ] Log expense from lens and from manual entry
  - [ ] Log screen shows correct amounts and hours
  - [ ] Export produces valid JSON
  - [ ] All features work in airplane mode

- [ ] **Commit**
```bash
git commit -m "chore: MVP beta — all features verified offline"
```

---

---

# MILESTONE 5 — v2 Core

## Sprint 5 · Weeks 6–7 · Auth + Sync + Categories + Tabulation

---

### Task 5.1: Supabase Client + Auth

**Files:**
- Create: `src/infrastructure/supabase/supabase-client.ts`
- Create: `src/infrastructure/supabase/supabase-auth.ts`
- Create: `src/presentation/stores/auth.store.ts`

- [ ] **Install**
```bash
npx expo install @supabase/supabase-js expo-secure-store expo-web-browser
```

- [ ] **Implement supabase-client.ts** with URL + anon key from `EXPO_PUBLIC_` env vars.
- [ ] **Implement auth store** (persisted with `expo-secure-store`) per `rules/state-management.md`.
- [ ] **Implement sign-in** (magic link + Apple + Google via `expo-web-browser`).
- [ ] **Commit**
```bash
git commit -m "feat(auth): Supabase auth with magic link, Apple, Google; persisted auth store"
```

---

### Task 5.2: Supabase Expense Repository + Sync

**Files:**
- Create: `src/infrastructure/supabase/supabase-expense-repository.ts`
- Create: `src/infrastructure/repository-factory.ts`

- [ ] **Implement SupabaseExpenseRepository** implementing the same `ExpenseRepository` port.
- [ ] **Implement repository-factory** — returns SQLite repo when signed out, Supabase repo when signed in.
- [ ] **Implement sync-on-open** — on sign-in, push all local `deletedAt=null` rows to Supabase.
- [ ] **Commit**
```bash
git commit -m "feat(infra): Supabase expense repository + repository factory for offline/online"
```

---

### Task 5.3: Categories

**Files:**
- Create: `src/infrastructure/sqlite/drizzle/schema.ts` (add `categories` table)
- Create: `src/application/ports/category-repository.port.ts`
- Create: `src/infrastructure/sqlite/sqlite-category-repository.ts`

- [ ] **Add categories table** to Drizzle schema.
- [ ] **Seed default categories** on first run (Groceries, Dining, Transport, Health, Household, Other).
- [ ] **Commit**
```bash
git commit -m "feat(db): categories table with default seed"
```

---

### Task 5.4: Monthly Tabulation Screen

**Files:**
- Create: `src/application/get-monthly-summary.ts`
- Create: `src/presentation/screens/month/MonthScreen.tsx`

- [ ] **Implement get-monthly-summary use case** — sum expenses by category in money and hours.
- [ ] **Implement MonthScreen** — category rows with money total + hours total.
- [ ] **Commit**
```bash
git commit -m "feat(screens): monthly tabulation screen with category totals"
```

---

---

# MILESTONE 6 — v2 Complete

## Sprint 6 · Weeks 8–9 · Three Questions + Wall Chart + Crossover

---

### Task 6.1: Three Questions Review

**Files:**
- Create: `src/infrastructure/sqlite/drizzle/schema.ts` (add `monthly_reviews`)
- Create: `src/application/save-monthly-review.ts`
- Create: `src/presentation/screens/month/MonthlyReviewSheet.tsx`

- [ ] **Add monthly_reviews table** (month, category_id, q1/q2/q3 verdicts).
- [ ] **Build review sheet** per DESIGN.md — three question marks per category, neutral styling.
- [ ] **Schedule month-start reminder** via `expo-notifications`.
- [ ] **Commit**
```bash
git commit -m "feat(v2): Three Questions monthly review with persistence and reminder"
```

---

### Task 6.2: Income Log

**Files:**
- Create: `src/infrastructure/sqlite/drizzle/schema.ts` (add `incomes`)
- Create: `src/application/ports/income-repository.port.ts`
- Create: `src/infrastructure/sqlite/sqlite-income-repository.ts`

- [ ] **Implement**
- [ ] **Commit**
```bash
git commit -m "feat(v2): income log for Wall Chart data"
```

---

### Task 6.3: Wall Chart

**Files:**
- Create: `src/presentation/screens/month/WallChartScreen.tsx`
- Create: `src/application/get-wall-chart-data.ts`

Per DESIGN.md §6.8: Victory Native (Skia), 36 months, three series (income, expenses, investment income), crossover dot.

- [ ] **Install**
```bash
npx expo install victory-native
```

- [ ] **Implement get-wall-chart-data** — 36 months of income + expenses + investment income lines.
- [ ] **Implement WallChartScreen** — pinch to zoom, text summary above chart.
- [ ] **Commit**
```bash
git commit -m "feat(v2): Wall Chart with income, expenses, investment income + crossover marker"
```

---

### Task 6.4: Crossover Projection Screen

**Files:**
- Create: `src/infrastructure/sqlite/drizzle/schema.ts` (add `capital_snapshots`)
- Create: `src/presentation/screens/month/CrossoverScreen.tsx`

- [ ] **Use `projectCrossover` domain function** (already tested in Task 2.5).
- [ ] **Build screen** with months-to-go, projected date, disclaimer "Estimates only. Not financial advice."
- [ ] **Commit**
```bash
git commit -m "feat(v2): crossover projection screen with capital snapshots"
```

---

### Task 6.5: RevenueCat Paywall (v2 Feature Gate)

**Files:**
- Create: `src/infrastructure/revenuecat/revenuecat-purchase-service.ts`
- Create: `src/presentation/hooks/usePurchases.ts`
- Create: `src/presentation/hooks/useEntitlement.ts`
- Create: `src/presentation/screens/paywall/PaywallScreen.tsx`

Per `rules/payments.md`:
- [ ] **Install**
```bash
npx expo install react-native-purchases
```
- [ ] **Implement RevenueCatPurchaseService** adapter.
- [ ] **Replace NoopPurchaseService** with real adapter.
- [ ] **Gate v2 screens** with `useHasProAccess()`.
- [ ] **Commit**
```bash
git commit -m "feat(payments): RevenueCat paywall gating v2 features"
```

---

---

# MILESTONE 7 — Launch Prep

## Sprint 7 · Weeks 10–12

---

### Task 7.1: Accuracy Tuning

- [ ] Run price parser against the 500-tag test photo set (from PRD).
- [ ] Target ≥ 90% correct. Fix parser patterns for real-world failures.
- [ ] Add regression tests for any newly discovered edge cases.
- [ ] **Commit per fix**

---

### Task 7.2: Performance Pass

- [ ] Profile OCR on reference Android device — target ≤ 100 ms per frame.
- [ ] Implement auto-switch to freeze mode when live fps drops below 15.
- [ ] Measure and cap battery: ≤ 5% per 10 min; stop camera on 60 s idle.
- [ ] Cold-start profiling — target < 2 s.
- [ ] **Commit**
```bash
git commit -m "perf: auto-freeze on low fps, idle camera timeout, battery optimizations"
```

---

### Task 7.3: Accessibility Pass

- [ ] Audit all screens: `accessibilityRole`, `accessibilityLabel` on every interactive element.
- [ ] Test VoiceOver (iOS) + TalkBack (Android) — freeze mode reads detected prices in order.
- [ ] Dynamic Type at maximum — no clipped text.
- [ ] Grayscale mode — tiers distinguishable by label text alone.
- [ ] 4.5:1 contrast check on all chip tiers.
- [ ] **Commit**
```bash
git commit -m "a11y: full accessibility audit — roles, labels, contrast, dynamic type"
```

---

### Task 7.4: Privacy + Legal Review

- [ ] Confirm no camera image is written to disk or network.
- [ ] Confirm analytics track no salary, price, or note values.
- [ ] Add "not financial advice" footnote on crossover screens.
- [ ] Add book credit in onboarding and About screen.
- [ ] Camera permission string: "We read prices through your camera. Images never leave your phone."
- [ ] **Commit**
```bash
git commit -m "chore: privacy/legal — camera copy, analytics audit, financial advice disclaimer"
```

---

### Task 7.5: Store Submission

- [ ] Write App Store / Play Store listing copy. No "financial advice" claims.
- [ ] Prepare screenshots: lens, label sheet, wizard reveal, log, Wall Chart.
- [ ] Configure `app.config.ts` production values.
- [ ] **EAS production build**
```bash
eas build --profile production --platform all
eas submit --platform all
```

---

---

# MILESTONE 8 — v3

## Sprint 8+ · Post-Launch

Each v3 feature ships behind a feature flag (`eas.json` + `Constants.expoConfig.extra`).

| Task | Feature | Flag |
|------|---------|------|
| 8.1 | Receipt scan — `expo-camera` + ML Kit receipt parser | `FEAT_RECEIPT_SCAN` |
| 8.2 | Menu mode — column alignment for price labels | `FEAT_MENU_MODE` |
| 8.3 | Share sheet — parse price from shared URL | `FEAT_SHARE_SHEET` |
| 8.4 | Home-screen widget — `expo-widget` (when available) | `FEAT_WIDGET` |
| 8.5 | CSV import — `expo-document-picker` + parser | `FEAT_CSV_IMPORT` |
| 8.6 | Household mode — linked accounts via Supabase RLS | `FEAT_HOUSEHOLD` |

Each 8.x task follows the same TDD pattern: port → domain test → adapter → use case test → screen.

---

---

## File Map Summary

```
src/
  domain/
    money/          money.ts · money.test.ts
    wage/           wage.ts · wage.test.ts
    price/          price.ts · price.test.ts · parser.ts · parser.test.ts · stabilizer.ts · stabilizer.test.ts
    crossover/      crossover.ts · crossover.test.ts
  application/
    ports/          expense-repository.port.ts · wage-repository.port.ts · category-repository.port.ts · purchase-service.port.ts · fx-rate-service.port.ts
    log-expense.ts · log-expense.test.ts
    get-expenses.ts
    get-monthly-summary.ts
    calculate-real-wage.ts
    get-crossover-projection.ts
    export-data.ts
    delete-all-data.ts
    save-monthly-review.ts
  infrastructure/
    sqlite/
      db.ts
      drizzle/schema.ts · migrations/
      sqlite-expense-repository.ts
      sqlite-wage-repository.ts
      sqlite-category-repository.ts
    supabase/
      supabase-client.ts
      supabase-auth.ts
      supabase-expense-repository.ts
    revenuecat/
      revenuecat-purchase-service.ts
      noop-purchase-service.ts
    repository-factory.ts
  presentation/
    screens/
      lens/         LensScreen.tsx · QuickConvertModal.tsx
      log/          LogScreen.tsx
      profile/      ProfileScreen.tsx
      onboarding/   (wizard steps)
      month/        MonthScreen.tsx · MonthlyReviewSheet.tsx · WallChartScreen.tsx · CrossoverScreen.tsx
      paywall/      PaywallScreen.tsx
      spike/        SpikeScreen.tsx (delete after M1)
    components/
      LabelChip.tsx · LabelSheet.tsx · ExpenseRow.tsx · Button.tsx · Card.tsx
    hooks/
      useExpenses.ts · useLogExpense.ts · useWage.ts · usePurchases.ts · useEntitlement.ts
    stores/
      lens.store.ts · onboarding.store.ts · auth.store.ts
  lib/
    result.ts · result.test.ts
    format.ts · format.test.ts
    query-client.ts
    query-keys.ts
    cn.ts
  theme/
    chip-tiers.ts
app/
  _layout.tsx
  (tabs)/_layout.tsx · index.tsx · log.tsx · profile.tsx
  onboarding/_layout.tsx · welcome.tsx · pay.tsx · hours.tsx · commute.tsx · reveal.tsx
```
