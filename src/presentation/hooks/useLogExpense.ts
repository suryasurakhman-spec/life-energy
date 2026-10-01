import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '@/lib/query-keys';
import { logExpense, type LogExpenseInput } from '@/application/log-expense';
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
