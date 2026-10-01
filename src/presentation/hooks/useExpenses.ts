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

export function useAllExpenses() {
  return useQuery({
    queryKey: keys.expenses.all(),
    queryFn: () => getExpenses(repo),
  });
}
