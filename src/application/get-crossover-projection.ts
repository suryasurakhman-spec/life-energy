import { projectCrossover, type CrossoverResult } from '@/domain/crossover/crossover';

export interface CrossoverInput {
  currentCapitalMinor: bigint;
  monthlyExpensesMinor: bigint;
  monthlySavingsMinor: bigint;
  annualRatePct?: number; // default 4
}

export function getCrossoverProjection(input: CrossoverInput): CrossoverResult {
  return projectCrossover({
    currentCapitalMinor:  input.currentCapitalMinor,
    monthlyExpensesMinor: input.monthlyExpensesMinor,
    monthlySavingsMinor:  input.monthlySavingsMinor,
    annualRatePct:        input.annualRatePct ?? 4,
  });
}
