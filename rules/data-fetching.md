# Data Fetching Rules

## Stack

- **TanStack Query v5** (`@tanstack/react-query`) — all async server/database state.
- **Supabase JS client** — used inside query/mutation functions, not called directly in components.
- Combine both: Supabase provides the transport; TanStack Query provides caching, loading states, and invalidation.

---

## TanStack Query Setup

```ts
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min
      retry: 2,
      networkMode: 'offlineFirst', // respect local-first architecture
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});
```

```tsx
// app/_layout.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
    </QueryClientProvider>
  );
}
```

---

## Query Keys

Centralize all query keys in one file. Never inline string arrays in components.

```ts
// src/lib/query-keys.ts
export const keys = {
  expenses: {
    all:    () => ['expenses'] as const,
    list:   (month: string) => ['expenses', 'list', month] as const,
    detail: (id: string)    => ['expenses', 'detail', id] as const,
  },
  wage: {
    current: () => ['wage', 'current'] as const,
    history: () => ['wage', 'history'] as const,
  },
  conversions: {
    recent: () => ['conversions', 'recent'] as const,
  },
  fxRates: {
    base: (currency: string) => ['fx-rates', currency] as const,
  },
  purchases: {
    customerInfo: () => ['purchases', 'customer-info'] as const,
    offerings:    () => ['purchases', 'offerings'] as const,
  },
} as const;
```

---

## Query Hooks

Wrap every query in a custom hook in `presentation/hooks/`. Components never call `useQuery` directly.

```ts
// src/presentation/hooks/useExpenses.ts
import { useQuery } from '@tanstack/react-query';
import { keys } from '@/lib/query-keys';
import { getExpenses } from '@/application/get-expenses';
import { SqliteExpenseRepository } from '@/infrastructure/sqlite/sqlite-expense-repository';

const repo = new SqliteExpenseRepository();

export function useExpenses(month: string) {
  return useQuery({
    queryKey: keys.expenses.list(month),
    queryFn: () => getExpenses(repo, { month }),
  });
}
```

---

## Mutations

```ts
// src/presentation/hooks/useLogExpense.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '@/lib/query-keys';
import { logExpense } from '@/application/log-expense';
import { SqliteExpenseRepository } from '@/infrastructure/sqlite/sqlite-expense-repository';

const repo = new SqliteExpenseRepository();

export function useLogExpense() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: LogExpenseInput) => logExpense(repo, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.expenses.all() });
    },
  });
}
```

---

## Supabase + TanStack Query

Use the Supabase client inside `queryFn` / `mutationFn`. Never subscribe to Supabase realtime inside a component directly — wrap in a hook that integrates with `queryClient.invalidateQueries`.

```ts
// src/infrastructure/supabase/supabase-expense-repository.ts
import { supabase } from './supabase-client';
import type { ExpenseRepository } from '@/application/ports/expense-repository.port';

export class SupabaseExpenseRepository implements ExpenseRepository {
  async findByMonth(userId: string, month: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('spent_at', `${month}-01`)
      .lt('spent_at', nextMonth(month));

    if (error) throw error;
    return data;
  }
}
```

```ts
// When using realtime with TanStack Query:
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/infrastructure/supabase/supabase-client';
import { keys } from '@/lib/query-keys';

export function useExpensesRealtimeSync(month: string) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        qc.invalidateQueries({ queryKey: keys.expenses.list(month) });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [month, qc]);
}
```

---

## Offline-First Pattern

MVP is fully offline. The query layer must handle this gracefully.

- SQLite (Drizzle) is the primary repository for all MVP queries.
- Supabase repositories are only used after sign-in (v2+).
- Use a repository factory that returns the right adapter based on auth state:

```ts
// src/infrastructure/repository-factory.ts
import { useAuthStore } from '@/presentation/stores/auth.store';

export function useExpenseRepository(): ExpenseRepository {
  const isSignedIn = useAuthStore(s => s.isSignedIn);
  return isSignedIn
    ? new SupabaseExpenseRepository()
    : new SqliteExpenseRepository();
}
```

---

## Rules Summary

- All data fetching goes through TanStack Query. No `useEffect` + `useState` for async data.
- Query keys live in `src/lib/query-keys.ts` only.
- Custom hooks wrap all `useQuery` / `useMutation` calls. Components receive data, not fetch logic.
- Supabase client is called inside application use cases or repository adapters — never in components or query functions defined inline in a component.
- `networkMode: 'offlineFirst'` on all queries and mutations.
- Always invalidate related queries in `onSuccess` of mutations.
- Prefer optimistic updates for frequent UI actions (logging an expense, setting a verdict).
