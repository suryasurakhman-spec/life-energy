import { describe, it, expect } from 'vitest';
import { monthlyInvestmentIncome, projectCrossover } from './crossover';

describe('monthlyInvestmentIncome', () => {
  it('applies annual rate monthly', () => {
    // $120,000 at 4% → $400/month
    expect(monthlyInvestmentIncome({ capitalMinor: 12000000n, annualRatePct: 4 })).toBeCloseTo(400, 0);
  });
});

describe('projectCrossover', () => {
  it('returns months to crossover', () => {
    const result = projectCrossover({
      currentCapitalMinor: 12000000n,  // $120,000
      monthlyExpensesMinor: 300000n,   // $3,000/month
      monthlySavingsMinor: 100000n,    // $1,000/month savings
      annualRatePct: 4,
    });
    expect(result.monthsToGo).toBeGreaterThan(0);
    expect(result.crossoverCapitalMinor).toBeGreaterThan(12000000n);
  });

  it('returns 0 months if already crossed over', () => {
    const result = projectCrossover({
      currentCapitalMinor: 100000000n, // $1,000,000
      monthlyExpensesMinor: 200000n,   // $2,000/month
      monthlySavingsMinor: 50000n,
      annualRatePct: 4,
    });
    expect(result.monthsToGo).toBe(0);
  });
});
