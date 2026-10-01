import { useAuthStore } from '@/presentation/stores/auth.store';
import { SqliteExpenseRepository } from './sqlite/sqlite-expense-repository';
import { SupabaseExpenseRepository } from './supabase/supabase-expense-repository';
import type { ExpenseRepository } from '@/application/ports/expense-repository.port';

/** Returns the appropriate expense repository based on auth state. */
export function useExpenseRepository(): ExpenseRepository {
  const isSignedIn = useAuthStore(s => s.isSignedIn);
  return isSignedIn
    ? new SupabaseExpenseRepository()
    : new SqliteExpenseRepository();
}

/** Non-hook version for use in non-React contexts. Always returns SQLite for offline-first MVP. */
export function getExpenseRepository(): ExpenseRepository {
  return new SqliteExpenseRepository();
}
