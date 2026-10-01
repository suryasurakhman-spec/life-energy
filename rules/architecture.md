# Architecture Rules

Life Energy uses a **layered architecture** inspired by hexagonal (ports & adapters) principles. The goal is to keep domain logic pure and framework-agnostic, with all external dependencies (Supabase, RevenueCat, SQLite, camera) isolated behind interfaces.

---

## Layer Overview

```
src/
  domain/           # Pure business logic. No imports from RN, Expo, Supabase, etc.
  application/      # Use cases / service functions. Orchestrates domain + ports.
  infrastructure/   # Adapters: concrete implementations of ports.
  presentation/     # React Native screens, components, hooks.
  lib/              # Shared utilities (format.ts, etc.) — no business logic.
  theme/            # Design tokens only.
```

---

## Layer Rules

### `domain/`

- Plain TypeScript. Zero framework imports.
- Contains: entities, value objects, domain errors, pure calculation functions.
- No async, no side effects, no I/O.
- Every exported function is unit-testable with plain `vitest` — no mocks needed.

```
domain/
  wage/
    wage.ts           // WageProfile entity, real-wage calculation
    wage.test.ts
  price/
    price.ts          // Price value object, life-energy conversion
    price.test.ts
  crossover/
    crossover.ts      // Crossover projection
    crossover.test.ts
  errors.ts           // Typed domain errors (e.g. NegativeRealWageError)
```

### `application/`

- Orchestrates domain logic and calls ports (interfaces, not implementations).
- One file per use case. Named `verb-noun.ts` (e.g. `log-expense.ts`).
- May be async. Returns typed results (use `Result<T, E>` pattern or throw domain errors).
- No React, no RN imports.

```
application/
  ports/
    expense-repository.port.ts   // interface ExpenseRepository { ... }
    wage-repository.port.ts
    purchase-service.port.ts     // interface PurchaseService (RevenueCat)
    fx-rate-service.port.ts
  log-expense.ts
  calculate-real-wage.ts
  get-crossover-projection.ts
  restore-purchases.ts
```

### `infrastructure/`

- Concrete adapters implementing the ports defined in `application/ports/`.
- One adapter per external system.
- All Supabase, SQLite (Drizzle), RevenueCat, and network code lives here only.

```
infrastructure/
  supabase/
    supabase-expense-repository.ts   // implements ExpenseRepository
    supabase-client.ts
  sqlite/
    sqlite-expense-repository.ts     // implements ExpenseRepository (offline)
    drizzle/
      schema.ts
      migrations/
  revenuecat/
    revenuecat-purchase-service.ts   // implements PurchaseService
  fx/
    supabase-fx-rate-service.ts
```

### `presentation/`

- React Native screens and components.
- Calls application use cases (never domain or infrastructure directly).
- Uses TanStack Query hooks for async operations.
- Uses Zustand stores for client-side UI state.
- No business logic here — only view logic (loading states, navigation, formatting).

```
presentation/
  screens/
    lens/
    log/
    profile/
    onboarding/
  components/
    LabelChip.tsx
    LabelSheet.tsx
    ...
  hooks/
    useExpenses.ts       // wraps TanStack Query
    useWage.ts
    usePurchases.ts
  stores/
    lens.store.ts        // Zustand
    onboarding.store.ts
```

---

## Dependency Rule

Dependencies point **inward only**:

```
presentation → application → domain
infrastructure → application (implements ports)
```

- `domain` imports nothing from other layers.
- `application` imports from `domain` and `application/ports` only.
- `infrastructure` imports from `application/ports` and external SDKs.
- `presentation` imports from `application` (use cases) and `infrastructure` (via DI or direct instantiation).

**Never:** `domain` importing from `infrastructure`, or `application` importing a concrete adapter.

---

## Dependency Injection

Use simple constructor injection or factory functions — no DI container needed at this scale.

```ts
// src/infrastructure/sqlite/sqlite-expense-repository.ts
export class SqliteExpenseRepository implements ExpenseRepository { ... }

// src/presentation/screens/log/LogScreen.tsx
import { SqliteExpenseRepository } from '@/infrastructure/sqlite/sqlite-expense-repository';
import { logExpense } from '@/application/log-expense';

const repo = new SqliteExpenseRepository();
// pass to use case
```

For tests, swap the concrete adapter with a fake:

```ts
const fakeRepo: ExpenseRepository = { save: vi.fn(), findAll: vi.fn() };
await logExpense(fakeRepo, input);
```

---

## Module Aliases

Configure `tsconfig.json` paths and Babel/Metro:

```json
{
  "@/domain/*":         ["src/domain/*"],
  "@/application/*":    ["src/application/*"],
  "@/infrastructure/*": ["src/infrastructure/*"],
  "@/presentation/*":   ["src/presentation/*"],
  "@/lib/*":            ["src/lib/*"],
  "@/theme/*":          ["src/theme/*"]
}
```

---

## File Naming

| Thing | Convention | Example |
|-------|------------|---------|
| Domain entity / value | `noun.ts` | `wage.ts` |
| Use case | `verb-noun.ts` | `log-expense.ts` |
| Port interface | `noun.port.ts` | `expense-repository.port.ts` |
| Adapter | `system-noun.ts` | `sqlite-expense-repository.ts` |
| React component | `PascalCase.tsx` | `LabelChip.tsx` |
| Zustand store | `noun.store.ts` | `lens.store.ts` |
| TanStack Query hook | `useNoun.ts` | `useExpenses.ts` |
| Test | co-located `*.test.ts` | `wage.test.ts` |

---

## What Goes Where — Quick Reference

| Concern | Layer |
|---------|-------|
| Real-wage formula | `domain/wage/wage.ts` |
| Life-energy conversion | `domain/price/price.ts` |
| Saving an expense to SQLite | `infrastructure/sqlite/` |
| Syncing an expense to Supabase | `infrastructure/supabase/` |
| "Log this expense" orchestration | `application/log-expense.ts` |
| RevenueCat paywall logic | `infrastructure/revenuecat/` |
| Whether the paywall sheet is open | `presentation/stores/` (Zustand) |
| Fetching the expense list for display | `presentation/hooks/useExpenses.ts` (TanStack Query) |
| Rendering the expense list | `presentation/screens/log/` |
