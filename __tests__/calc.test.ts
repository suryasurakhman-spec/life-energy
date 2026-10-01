/**
 * Tests for src/lib/calc.ts
 */
import { describe, it, expect } from 'vitest';
import {
  calculateRealWage,
  lifeEnergy,
  formatLifeEnergy,
  projectCrossover,
  calculateRunwayDays,
  toMonthlyAmount,
  NegativeRealWageError,
} from '../src/lib/calc';
import {
  PRD_WORKED_EXAMPLE,
  WEEKLY_WAGE_INPUT,
  BIWEEKLY_WAGE_INPUT,
  SEMIMONTHLY_WAGE_INPUT,
  NEGATIVE_WAGE_INPUT,
  ZERO_REAL_WAGE_INPUT,
  IRREGULAR_INCOME_INPUT,
} from './fixtures/wages';

// ---------------------------------------------------------------------------
// calculateRealWage
// ---------------------------------------------------------------------------

describe('calculateRealWage', () => {
  it('PRD worked example: net $4,000, 173 hrs, $700 costs, 82 hrs → $12.94 real, $23.12 nominal', () => {
    const result = calculateRealWage(PRD_WORKED_EXAMPLE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // PRD states: $12.94/hr real, $23.12/hr nominal
    // Real: (4000 - 700) / (173 + 82) = 3300 / 255 = 12.941...
    expect(result.value.realHourlyWage).toBeCloseTo(12.94, 1);
    // Nominal: 4000 / 173 = 23.121...
    expect(result.value.nominalHourlyWage).toBeCloseTo(23.12, 1);
  });

  it('PRD worked example: exact formula values', () => {
    const result = calculateRealWage(PRD_WORKED_EXAMPLE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const expectedReal = (4000 - 700) / (173 + 82);
    const expectedNominal = 4000 / 173;
    expect(result.value.realHourlyWage).toBeCloseTo(expectedReal, 5);
    expect(result.value.nominalHourlyWage).toBeCloseTo(expectedNominal, 5);
    expect(result.value.monthlyNetPay).toBe(4000);
    expect(result.value.totalMonthlyHours).toBe(255);
    expect(result.value.monthlyPaidHours).toBe(173);
  });

  it('weekly pay period: converts to monthly correctly', () => {
    const result = calculateRealWage(WEEKLY_WAGE_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Verify the monthly net pay is approximately 4000
    expect(result.value.monthlyNetPay).toBeCloseTo(4000, 1);
    // Real wage should match the PRD example
    expect(result.value.realHourlyWage).toBeCloseTo(12.94, 1);
  });

  it('biweekly pay period: converts to monthly correctly', () => {
    const result = calculateRealWage(BIWEEKLY_WAGE_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.monthlyNetPay).toBeCloseTo(4000, 1);
    expect(result.value.realHourlyWage).toBeCloseTo(12.94, 1);
  });

  it('semimonthly pay period: $2,000 × 2 = $4,000/month', () => {
    const result = calculateRealWage(SEMIMONTHLY_WAGE_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.monthlyNetPay).toBeCloseTo(4000, 5);
    expect(result.value.realHourlyWage).toBeCloseTo(12.94, 1);
  });

  it('monthly pay period: no conversion needed', () => {
    const result = calculateRealWage(PRD_WORKED_EXAMPLE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.monthlyNetPay).toBe(4000);
  });

  it('negative real wage: job costs exceed net pay → NegativeRealWageError', () => {
    const result = calculateRealWage(NEGATIVE_WAGE_INPUT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(NegativeRealWageError);
    expect(result.error.realWage).toBeLessThan(0);
  });

  it('zero real wage: job costs equal net pay → NegativeRealWageError', () => {
    const result = calculateRealWage(ZERO_REAL_WAGE_INPUT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(NegativeRealWageError);
    expect(result.error.realWage).toBe(0);
  });

  it('irregular income: trailingMonthlyNetPay overrides period conversion', () => {
    const result = calculateRealWage(IRREGULAR_INCOME_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // trailingMonthlyNetPay = 3500 should be used, not the 0 netPayPerPeriod
    expect(result.value.monthlyNetPay).toBe(3500);
    const expectedReal = (3500 - 300) / (120 + 20);
    expect(result.value.realHourlyWage).toBeCloseTo(expectedReal, 5);
  });
});

// ---------------------------------------------------------------------------
// toMonthlyAmount (pay period helpers)
// ---------------------------------------------------------------------------

describe('toMonthlyAmount', () => {
  it('weekly: multiplied by 52/12', () => {
    expect(toMonthlyAmount(100, 'weekly')).toBeCloseTo((100 * 52) / 12, 5);
  });
  it('biweekly: multiplied by 26/12', () => {
    expect(toMonthlyAmount(100, 'biweekly')).toBeCloseTo((100 * 26) / 12, 5);
  });
  it('semimonthly: multiplied by 2', () => {
    expect(toMonthlyAmount(100, 'semimonthly')).toBe(200);
  });
  it('monthly: unchanged', () => {
    expect(toMonthlyAmount(100, 'monthly')).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// lifeEnergy
// ---------------------------------------------------------------------------

describe('lifeEnergy', () => {
  it('PRD example: $12.99 at $12.94/hr → ~60 min', () => {
    const result = lifeEnergy(1299n, 12.94);
    // $12.99 / $12.94 ≈ 1.0039 hours ≈ 60.2 minutes
    expect(result.totalMinutes).toBeCloseTo(60.2, 0);
    expect(result.hours).toBe(1);
  });

  it('$4.99 at $12.94/hr → ~23 min', () => {
    const result = lifeEnergy(499n, 12.94);
    // $4.99 / $12.94 ≈ 0.3857 hrs ≈ 23.1 min
    expect(result.totalMinutes).toBeCloseTo(23.1, 0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBeGreaterThan(20);
  });

  it('$0 price → 0 minutes', () => {
    const result = lifeEnergy(0n, 12.94);
    expect(result.totalMinutes).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });

  it('hours and minutes decompose correctly', () => {
    // $25.88 at $12.94/hr = exactly 2 hours
    const result = lifeEnergy(2588n, 12.94);
    expect(result.hours).toBe(2);
    expect(result.minutes).toBe(0);
  });

  it('large price → many hours', () => {
    // $1000 at $10/hr = 100 hours = 6000 minutes
    const result = lifeEnergy(100000n, 10);
    expect(result.totalMinutes).toBeCloseTo(6000, 0);
    expect(result.hours).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// formatLifeEnergy
// ---------------------------------------------------------------------------

describe('formatLifeEnergy', () => {
  it('under 1 hour → minutes only: "43 m"', () => {
    expect(formatLifeEnergy(43)).toBe('43 m');
  });

  it('under 1 hour, 1 minute → "1 m"', () => {
    expect(formatLifeEnergy(1)).toBe('1 m');
  });

  it('exactly 0 minutes → "0 m"', () => {
    expect(formatLifeEnergy(0)).toBe('0 m');
  });

  it('just under 1 hour: 59 min → "59 m"', () => {
    expect(formatLifeEnergy(59)).toBe('59 m');
  });

  it('1–10 hrs with remaining minutes: "1 h 5 m"', () => {
    expect(formatLifeEnergy(65)).toBe('1 h 5 m');
  });

  it('1 h exactly → "1 h"', () => {
    expect(formatLifeEnergy(60)).toBe('1 h');
  });

  it('9 h 30 m → "9 h 30 m" (still < 10h, keep minutes)', () => {
    expect(formatLifeEnergy(9 * 60 + 30)).toBe('9 h 30 m');
  });

  it('≥ 10 hrs: drop minutes: "14 h"', () => {
    // 14 h 20 m → "14 h" because >= 10 h
    expect(formatLifeEnergy(14 * 60 + 20)).toBe('14 h');
  });

  it('exactly 40 hrs → "40 h"', () => {
    expect(formatLifeEnergy(40 * 60)).toBe('40 h');
  });

  it('above 40 hrs → work days (1 decimal)', () => {
    // 41 hrs = 2460 min; default workday = 480 min → 5.125 work days
    expect(formatLifeEnergy(2460)).toBe('5.1 work days');
  });

  it('above 40 hrs, custom work day: "3.2 work days"', () => {
    // 3.2 work days × 8 hrs = 25.6 hrs = 1536 min
    // But 1536 min / 60 = 25.6 hrs which is <= 40 hrs → test with >40 hrs
    // Let's do: 3.2 work days × 480 min = 1536 min for 8hr day
    // 1536 min = 25.6 hrs, which is ≤ 40, so it'll show as hrs.
    // Need > 40 hrs = > 2400 min. At 480 min/day that's > 5 days.
    // 3.2 work days at 10 hr workday (600 min) = 1920 min = 32 hrs → still ≤ 40
    // Use 6 work days at 480 min/day = 2880 min = 48 hrs
    expect(formatLifeEnergy(6 * 480, { workDayMinutes: 480 })).toBe('6.0 work days');
  });

  it('above 20 work days → work weeks', () => {
    // 25 work days at 480 min/day = 12000 min
    // 25 / 5 = 5.0 work weeks
    expect(formatLifeEnergy(25 * 480, { workDayMinutes: 480 })).toBe('5.0 work weeks');
  });

  it('above 20 work days, fractional weeks', () => {
    // 22.5 work days at 480 min = 10800 min
    // 22.5 / 5 = 4.5 work weeks
    expect(formatLifeEnergy(22.5 * 480, { workDayMinutes: 480 })).toBe('4.5 work weeks');
  });

  it('estimated flag adds "≈" prefix', () => {
    expect(formatLifeEnergy(43, { estimated: true })).toBe('≈ 43 m');
    expect(formatLifeEnergy(65, { estimated: true })).toBe('≈ 1 h 5 m');
  });

  it('estimated + work days', () => {
    expect(formatLifeEnergy(6 * 480, { estimated: true, workDayMinutes: 480 })).toBe(
      '≈ 6.0 work days',
    );
  });
});

// ---------------------------------------------------------------------------
// projectCrossover
// ---------------------------------------------------------------------------

describe('projectCrossover', () => {
  it('already crossed over: monthsToGo = 0', () => {
    // Capital 1,000,000; rate 4%; monthly income = 3333 >= 2000 expenses
    const result = projectCrossover({
      currentCapital: 1_000_000,
      annualRate: 0.04,
      monthlyExpenses: 2000,
      monthlySavings: 0,
    });
    expect(result.monthsToGo).toBe(0);
    expect(result.cappedAt600Months).toBe(false);
  });

  it('normal projection reaches crossover within reasonable time', () => {
    // Starting capital: 100,000; rate: 4%; expenses: 2000; savings: 1000/mo
    const result = projectCrossover({
      currentCapital: 100_000,
      annualRate: 0.04,
      monthlyExpenses: 2000,
      monthlySavings: 1000,
    });
    // Should reach crossover (capital needs to be 600,000 for $2000/mo at 4%)
    // With $1000/mo savings it will eventually get there
    expect(result.monthsToGo).toBeGreaterThan(0);
    expect(result.cappedAt600Months).toBe(false);
    expect(result.capitalAtCrossover).toBeDefined();
    if (result.capitalAtCrossover !== undefined) {
      // At crossover, (K * 0.04) / 12 >= 2000 → K >= 600,000
      expect(result.capitalAtCrossover).toBeGreaterThanOrEqual(600_000);
    }
  });

  it('zero savings with insufficient capital caps at 600 months', () => {
    // Capital: 10,000; rate: 4%; monthly income: 33.33; expenses: 5000; savings: 0
    // Will never reach crossover
    const result = projectCrossover({
      currentCapital: 10_000,
      annualRate: 0.04,
      monthlyExpenses: 5000,
      monthlySavings: 0,
    });
    expect(result.cappedAt600Months).toBe(true);
    expect(result.monthsToGo).toBe(600);
  });

  it('zero savings but capital already sufficient: immediate crossover', () => {
    const result = projectCrossover({
      currentCapital: 900_000,
      annualRate: 0.04,
      monthlyExpenses: 2000,
      monthlySavings: 0,
    });
    // (900000 * 0.04) / 12 = 3000 >= 2000
    expect(result.monthsToGo).toBe(0);
    expect(result.cappedAt600Months).toBe(false);
  });

  it('crossover projection grows capital correctly each month', () => {
    // Simple check: with very high savings, crossover is fast
    const result = projectCrossover({
      currentCapital: 500_000,
      annualRate: 0.04,
      monthlyExpenses: 2000,
      monthlySavings: 10_000,
    });
    // Already close: need 600k; adding 10k/mo → should cross within ~10 months
    expect(result.monthsToGo).toBeLessThan(20);
    expect(result.cappedAt600Months).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// calculateRunwayDays
// ---------------------------------------------------------------------------

describe('calculateRunwayDays', () => {
  it('basic: $10,000 capital / $1,000/month × 30 = 300 days', () => {
    const days = calculateRunwayDays(1_000_000n, 100_000n); // in cents
    expect(days).toBeCloseTo(300, 1);
  });

  it('large capital: $100,000 / $2,000/month = 1,500 days', () => {
    const days = calculateRunwayDays(10_000_000n, 200_000n);
    expect(days).toBeCloseTo(1500, 1);
  });

  it('zero monthly spending: returns Infinity', () => {
    const days = calculateRunwayDays(1_000_000n, 0n);
    expect(days).toBe(Infinity);
  });

  it('capital equals one month of spending: 30 days', () => {
    const days = calculateRunwayDays(100_000n, 100_000n);
    expect(days).toBeCloseTo(30, 5);
  });

  it('zero capital: 0 days', () => {
    const days = calculateRunwayDays(0n, 100_000n);
    expect(days).toBe(0);
  });
});
