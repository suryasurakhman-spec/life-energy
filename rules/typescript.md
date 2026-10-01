# TypeScript Rules

All code in this project is TypeScript. No `.js` or `.jsx` files. Tests are TypeScript too.

---

## tsconfig

Extend Expo's base config and tighten it:

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
  },
  "include": ["src", "app", "*.ts", "*.tsx"]
}
```

Run `npx tsc --noEmit` in CI. No type errors allowed to merge.

---

## No `any`

Never use `any`. Use `unknown` when the type is genuinely unknown, then narrow it.

```ts
// Bad
function parse(input: any): any { ... }

// Good
function parse(input: unknown): Price {
  if (typeof input !== 'object' || input === null) throw new ParseError();
  // narrow further...
}
```

Disable `@typescript-eslint/no-explicit-any` errors — they block CI.

---

## Domain Types

Define types close to the domain entity they describe. Avoid generic bags like `Record<string, unknown>`.

```ts
// src/domain/wage/wage.ts

export type PayPeriod = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export interface WageProfile {
  readonly id: string;
  readonly netPayMinor: bigint;       // minor units (cents)
  readonly currency: string;          // ISO 4217
  readonly paidHoursPerWeek: number;
  readonly payPeriod: PayPeriod;
  readonly jobCostsMinor: bigint;
  readonly jobHoursPerMonth: number;
  readonly effectiveFrom: Date;
}

export interface RealWage {
  readonly nominalHourly: number;
  readonly realHourly: number;
  readonly gapPercent: number;
}
```

---

## Money Types

Never use `number` for money. Use `bigint` for storage (minor units) and a `Money` value object for arithmetic.

```ts
// src/domain/money.ts
export interface Money {
  readonly amountMinor: bigint;
  readonly currency: string;  // ISO 4217, e.g. "USD"
}

export function money(amountMinor: bigint, currency: string): Money {
  return { amountMinor, currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error('Currency mismatch');
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}
```

---

## Result Pattern

Use a typed `Result<T, E>` for operations that can fail in expected ways (not exceptions):

```ts
// src/lib/result.ts
export type Result<T, E = Error> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

export const ok  = <T>(value: T): Result<T, never>    => ({ ok: true,  value });
export const err = <E>(error: E): Result<never, E>    => ({ ok: false, error });
```

Use for domain validation, use case outputs:

```ts
// src/application/calculate-real-wage.ts
export function calculateRealWage(input: WageInput): Result<RealWage, NegativeRealWageError> {
  const real = (input.netPay - input.jobCosts) / (input.paidHours + input.jobHours);
  if (real <= 0) return err(new NegativeRealWageError(real));
  return ok({ nominalHourly: ..., realHourly: real, gapPercent: ... });
}
```

---

## Enums → Union Types

Prefer string union types over `enum`. Enums have runtime footprint and confusing behavior with `const enum`.

```ts
// Bad
enum LensMode { Live = 'live', Freeze = 'freeze' }

// Good
type LensMode = 'live' | 'freeze';
```

---

## Component Props

Always define a named `Props` interface (or type alias) for each component. Never use inline object types in function signatures.

```ts
// Bad
export function LabelChip({ value, tier, onPress }: { value: string; tier: number; onPress: () => void }) {}

// Good
interface Props {
  value: string;
  tier: 0 | 1 | 2 | 3 | 4;
  onPress: () => void;
}

export function LabelChip({ value, tier, onPress }: Props) {}
```

---

## Tests

Use **Vitest** for unit and integration tests. Use **React Native Testing Library** for component tests.

```ts
// src/domain/wage/wage.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRealWage } from './wage';

describe('calculateRealWage', () => {
  it('returns the real wage from the PRD worked example', () => {
    const result = calculateRealWage({
      netPayMinor: 400000n,   // $4,000.00
      jobCostsMinor: 70000n,  // $700.00
      paidHoursPerMonth: 173,
      jobHoursPerMonth: 82,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.realHourly).toBeCloseTo(12.94, 1);
  });

  it('returns an error when real wage would be zero or negative', () => {
    const result = calculateRealWage({
      netPayMinor: 50000n,
      jobCostsMinor: 50000n,  // costs = pay
      paidHoursPerMonth: 173,
      jobHoursPerMonth: 0,
    });

    expect(result.ok).toBe(false);
  });
});
```

Test file rules:
- Co-locate with the file under test: `wage.ts` → `wage.test.ts`.
- Domain tests: Vitest, no mocks.
- Application tests: Vitest, fake repository implementations (in-memory, typed).
- Component tests: RNTL + Vitest.
- Infrastructure tests: integration tests against a local Supabase / SQLite in-memory DB.

---

## Zod for Runtime Validation

Use `zod` for all external data boundaries: form inputs, Supabase row shapes, sync payloads, API responses.

```ts
// src/infrastructure/supabase/expense.schema.ts
import { z } from 'zod';

export const expenseRowSchema = z.object({
  id:            z.string().uuid(),
  user_id:       z.string().uuid(),
  amount_minor:  z.bigint(),
  currency:      z.string().length(3),
  category_id:   z.string().uuid().nullable(),
  spent_at:      z.coerce.date(),
  note:          z.string().nullable(),
  deleted_at:    z.coerce.date().nullable(),
});

export type ExpenseRow = z.infer<typeof expenseRowSchema>;
```

Never write manual type assertion (`as SomeType`) on data from external sources.

---

## Rules Summary

- `strict: true` + `noUncheckedIndexedAccess` always on.
- No `any`. No `as` on external data — use Zod.
- Money stored as `bigint` minor units + ISO 4217 currency string.
- Use `Result<T, E>` for expected failures; throw only for unexpected errors.
- String unions instead of enums.
- Named `Props` interface for every component.
- Tests in TypeScript, co-located with source.
- `tsc --noEmit` runs in CI; zero type errors to merge.
