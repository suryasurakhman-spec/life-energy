import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SqliteIncomeRepository } from '@/infrastructure/sqlite/sqlite-income-repository';
import { logIncome, type LogIncomeInput } from '@/application/log-income';

const repo = new SqliteIncomeRepository();

export function useIncomeByMonth(month: string) {
  return useQuery({
    queryKey: ['income', month],
    queryFn: () => repo.findByMonth(month),
  });
}

export function useLogIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LogIncomeInput) => logIncome(repo, input),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ['income', vars.month] });
      void qc.invalidateQueries({ queryKey: ['wall-chart'] });
    },
  });
}

export function useRemoveIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; month: string }) => repo.remove(id),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ['income', vars.month] });
      void qc.invalidateQueries({ queryKey: ['wall-chart'] });
    },
  });
}
