import type { ExpenseRepository, ExpenseRecord } from './ports/expense-repository.port';

export interface GetExpensesOptions {
  month?: string; // 'YYYY-MM' — if omitted, returns all
}

export async function getExpenses(
  repo: ExpenseRepository,
  opts: GetExpensesOptions = {},
): Promise<ExpenseRecord[]> {
  if (opts.month) return repo.findByMonth(opts.month);
  return repo.findAll();
}
