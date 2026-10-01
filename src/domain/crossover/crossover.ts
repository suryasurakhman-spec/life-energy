export function monthlyInvestmentIncome({
  capitalMinor, annualRatePct,
}: { capitalMinor: bigint; annualRatePct: number }): number {
  return (Number(capitalMinor) / 100) * (annualRatePct / 100) / 12;
}

export interface CrossoverResult {
  monthsToGo: number;
  crossoverCapitalMinor: bigint;
  projectedDate: Date;
}

export function projectCrossover({
  currentCapitalMinor, monthlyExpensesMinor, monthlySavingsMinor, annualRatePct,
}: {
  currentCapitalMinor: bigint;
  monthlyExpensesMinor: bigint;
  monthlySavingsMinor: bigint;
  annualRatePct: number;
}): CrossoverResult {
  const monthlyExpenses = Number(monthlyExpensesMinor) / 100;
  let capital = Number(currentCapitalMinor) / 100;
  const monthlySavings = Number(monthlySavingsMinor) / 100;
  const monthlyRate = annualRatePct / 100 / 12;

  // Already crossed over
  if (capital * (annualRatePct / 100) / 12 >= monthlyExpenses) {
    return {
      monthsToGo: 0,
      crossoverCapitalMinor: currentCapitalMinor,
      projectedDate: new Date(),
    };
  }

  let months = 0;
  const MAX_MONTHS = 600; // 50 years safety cap
  while ((capital * (annualRatePct / 100)) / 12 < monthlyExpenses && months < MAX_MONTHS) {
    capital += capital * monthlyRate + monthlySavings;
    months++;
  }

  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + months);

  return {
    monthsToGo: months,
    crossoverCapitalMinor: BigInt(Math.round(capital * 100)),
    projectedDate,
  };
}
