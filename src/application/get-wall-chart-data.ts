import type { ExpenseRepository } from './ports/expense-repository.port';
import type { IncomeRepository } from './ports/income-repository.port';

export interface WallChartPoint {
  month: string;
  expensesMinor: bigint;
  incomeMinor: bigint;
  investmentIncomeMinor: bigint;
}

export interface WallChartData {
  points: WallChartPoint[];
  crossoverMonth: string | null; // first month where investmentIncome >= expenses
}

export async function getWallChartData(
  expenseRepo: ExpenseRepository,
  incomeRepo: IncomeRepository,
  months: string[],   // 'YYYY-MM' array, up to 36
  currentCapitalMinor: bigint,
  annualRatePct: number,
): Promise<WallChartData> {
  const points: WallChartPoint[] = [];
  let crossoverMonth: string | null = null;
  const monthlyRate = annualRatePct / 100 / 12;

  for (const month of months) {
    const [expenses, incomes] = await Promise.all([
      expenseRepo.findByMonth(month),
      incomeRepo.findByMonth(month),
    ]);

    const expensesMinor = expenses.reduce((s, e) => s + e.amountMinor, 0n);
    const incomeMinor   = incomes.reduce((s, i) => s + i.amountMinor, 0n);
    const investmentIncomeMinor = BigInt(Math.round(Number(currentCapitalMinor) * monthlyRate));

    points.push({ month, expensesMinor, incomeMinor, investmentIncomeMinor });

    if (!crossoverMonth && investmentIncomeMinor >= expensesMinor && expensesMinor > 0n) {
      crossoverMonth = month;
    }
  }

  return { points, crossoverMonth };
}
