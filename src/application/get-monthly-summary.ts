import type { ExpenseRepository, ExpenseRecord } from './ports/expense-repository.port';

export interface CategoryTotal {
  categoryId: string | null;
  categoryName: string;
  totalMinor: bigint;
  currency: string;
  totalMinutes: number;
  count: number;
}

export interface MonthlySummary {
  month: string;
  totalMinor: bigint;
  currency: string;
  totalMinutes: number;
  categories: CategoryTotal[];
}

export async function getMonthlySummary(
  repo: ExpenseRepository,
  month: string,
  realHourlyWage: number,
  categoryNames: Record<string, string> = {},
): Promise<MonthlySummary> {
  const expenses = await repo.findByMonth(month);

  const byCategory = new Map<string, { totalMinor: bigint; totalMinutes: number; count: number; currency: string }>();

  for (const e of expenses) {
    const key = e.categoryId ?? '__uncategorized__';
    const existing = byCategory.get(key) ?? { totalMinor: 0n, totalMinutes: 0, count: 0, currency: e.currency };
    const minutes = (Number(e.amountMinor) / 100 / realHourlyWage) * 60;
    byCategory.set(key, {
      totalMinor:   existing.totalMinor + e.amountMinor,
      totalMinutes: existing.totalMinutes + minutes,
      count:        existing.count + 1,
      currency:     e.currency,
    });
  }

  const categories: CategoryTotal[] = [...byCategory.entries()].map(([key, val]) => ({
    categoryId:   key === '__uncategorized__' ? null : key,
    categoryName: key === '__uncategorized__' ? 'Uncategorized' : (categoryNames[key] ?? key),
    totalMinor:   val.totalMinor,
    currency:     val.currency,
    totalMinutes: val.totalMinutes,
    count:        val.count,
  }));

  const totalMinor   = expenses.reduce((sum, e) => sum + e.amountMinor, 0n);
  const totalMinutes = expenses.reduce((sum, e) => sum + (Number(e.amountMinor) / 100 / realHourlyWage) * 60, 0);

  return { month, totalMinor, currency: 'USD', totalMinutes, categories };
}
