/**
 * calc.ts — Pure TypeScript business math for Life Energy.
 * Zero React / RN / Expo imports. All amounts in minor units (bigint = cents).
 * Real-hourly-wage formula: W_real = (P_net - C_job) / (H_paid + H_job)
 */

// ---------------------------------------------------------------------------
// Result type (lightweight Ok/Err without a library dependency)
// ---------------------------------------------------------------------------

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class NegativeRealWageError extends Error {
  constructor(
    public readonly realWage: number,
    message?: string,
  ) {
    super(
      message ??
        `Real wage is ${realWage.toFixed(2)}/hr (≤ 0). Job costs equal or exceed net pay.`,
    );
    this.name = 'NegativeRealWageError';
  }
}

// ---------------------------------------------------------------------------
// Pay period helpers
// ---------------------------------------------------------------------------

export type PayPeriod = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

/** Multiply a per-period amount to get the monthly equivalent. */
export function toMonthlyAmount(amount: number, period: PayPeriod): number {
  switch (period) {
    case 'weekly':
      return (amount * 52) / 12;
    case 'biweekly':
      return (amount * 26) / 12;
    case 'semimonthly':
      return amount * 2;
    case 'monthly':
      return amount;
  }
}

/** Multiply paid hours per period to get monthly hours. */
export function toMonthlyHours(hours: number, period: PayPeriod): number {
  // Hours follow the same multipliers as amounts
  return toMonthlyAmount(hours, period);
}

// ---------------------------------------------------------------------------
// WageInput
// ---------------------------------------------------------------------------

export interface WageInput {
  /** Take-home (net) pay per pay period, in dollars (NOT minor units). */
  netPayPerPeriod: number;
  payPeriod: PayPeriod;

  /** Paid hours per pay period (e.g. 40 hrs/week). */
  paidHoursPerPeriod: number;

  /** Monthly job costs in dollars (commute, clothes, work meals, etc.). */
  monthlyJobCosts: number;

  /** Monthly unpaid job-related hours (commute, prep, decompression). */
  monthlyJobHours: number;

  /**
   * Optional: if the user has irregular income, pass a trailing average of
   * net monthly pay (already converted to monthly). When present this takes
   * precedence over netPayPerPeriod + payPeriod.
   */
  trailingMonthlyNetPay?: number;
}

// ---------------------------------------------------------------------------
// RealWage result
// ---------------------------------------------------------------------------

export interface RealWage {
  /** Real hourly wage in dollars. */
  realHourlyWage: number;
  /** Nominal hourly wage in dollars (net pay / paid hours). */
  nominalHourlyWage: number;
  /** Monthly net pay used in the calculation. */
  monthlyNetPay: number;
  /** Total monthly hours (paid + job-related). */
  totalMonthlyHours: number;
  /** Monthly paid hours. */
  monthlyPaidHours: number;
}

// ---------------------------------------------------------------------------
// calculateRealWage
// ---------------------------------------------------------------------------

/**
 * W_real = (P_net - C_job) / (H_paid + H_job)
 *
 * PRD worked example:
 *   net $4,000, 173 paid hrs/mo, $700 job costs, 82 job hrs → $12.94/hr real, $23.12/hr nominal
 */
export function calculateRealWage(
  input: WageInput,
): Result<RealWage, NegativeRealWageError> {
  const {
    netPayPerPeriod,
    payPeriod,
    paidHoursPerPeriod,
    monthlyJobCosts,
    monthlyJobHours,
    trailingMonthlyNetPay,
  } = input;

  // Monthly net pay: trailing average overrides period conversion
  const monthlyNetPay =
    trailingMonthlyNetPay !== undefined
      ? trailingMonthlyNetPay
      : toMonthlyAmount(netPayPerPeriod, payPeriod);

  // Monthly paid hours
  const monthlyPaidHours = toMonthlyHours(paidHoursPerPeriod, payPeriod);

  // Formula components
  const adjustedPay = monthlyNetPay - monthlyJobCosts;
  const totalMonthlyHours = monthlyPaidHours + monthlyJobHours;

  const realHourlyWage = adjustedPay / totalMonthlyHours;

  if (realHourlyWage <= 0) {
    return err(new NegativeRealWageError(realHourlyWage));
  }

  const nominalHourlyWage = monthlyNetPay / monthlyPaidHours;

  return ok({
    realHourlyWage,
    nominalHourlyWage,
    monthlyNetPay,
    totalMonthlyHours,
    monthlyPaidHours,
  });
}

// ---------------------------------------------------------------------------
// lifeEnergy
// ---------------------------------------------------------------------------

export interface LifeEnergyResult {
  /** Total life-energy cost in minutes. */
  totalMinutes: number;
  /** Whole hours component. */
  hours: number;
  /** Remaining minutes component (0–59). */
  minutes: number;
}

/**
 * L = price / W_real
 * priceMinor: price in cents (bigint)
 * realHourlyWage: dollars per hour
 */
export function lifeEnergy(
  priceMinor: bigint,
  realHourlyWage: number,
): LifeEnergyResult {
  // Convert minor units to dollars
  const priceDollars = Number(priceMinor) / 100;
  // Hours of life energy
  const totalHours = priceDollars / realHourlyWage;
  const totalMinutes = totalHours * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  return { totalMinutes, hours, minutes };
}

// ---------------------------------------------------------------------------
// formatLifeEnergy
// ---------------------------------------------------------------------------

export interface FormatOptions {
  /** Prefix output with "≈" when the price is estimated. */
  estimated?: boolean;
  /** Minutes in a real work day (default 480 = 8 hrs). */
  workDayMinutes?: number;
}

/**
 * Display rules from PRD:
 * - Under 1 hr       → "43 m"
 * - 1–40 hrs         → "1 h 5 m" or "14 h" (drop minutes when ≥ 10 h)
 * - Above 40 hrs     → work days (1 decimal): "3.2 work days"
 * - Above 20 wd      → work weeks: "6.5 work weeks"
 * Prefix "≈" when { estimated: true }.
 */
export function formatLifeEnergy(
  totalMinutes: number,
  options: FormatOptions = {},
): string {
  const { estimated = false, workDayMinutes = 480 } = options;
  const prefix = estimated ? '≈ ' : '';

  const totalHours = totalMinutes / 60;

  if (totalHours < 1) {
    // Under 1 hour: minutes only
    const mins = Math.round(totalMinutes);
    return `${prefix}${mins} m`;
  }

  if (totalHours <= 40) {
    const wholeHours = Math.floor(totalHours);
    const remainingMins = Math.round((totalHours - wholeHours) * 60);

    if (wholeHours >= 10 || remainingMins === 0) {
      // Drop minutes when >= 10 h or no remaining minutes
      return `${prefix}${wholeHours} h`;
    }
    return `${prefix}${wholeHours} h ${remainingMins} m`;
  }

  // Above 40 hours: work days
  const workDays = totalMinutes / workDayMinutes;

  if (workDays <= 20) {
    return `${prefix}${workDays.toFixed(1)} work days`;
  }

  // Above 20 work days: work weeks (5-day week)
  const workWeeks = workDays / 5;
  return `${prefix}${workWeeks.toFixed(1)} work weeks`;
}

// ---------------------------------------------------------------------------
// Crossover projection
// ---------------------------------------------------------------------------

export interface CrossoverInput {
  /** Current invested capital in dollars. */
  currentCapital: number;
  /** Annual safe-withdrawal rate (default 0.04 = 4%). */
  annualRate: number;
  /** Monthly expenses in dollars. */
  monthlyExpenses: number;
  /** Monthly savings to add to capital each month. */
  monthlySavings: number;
}

export interface CrossoverResult {
  /** Months until crossover (0 = already crossed over). */
  monthsToGo: number;
  /**
   * Projected capital at crossover (or at the cap if not reached).
   * undefined if already crossed over.
   */
  capitalAtCrossover?: number;
  /** Whether the 600-month cap was hit without reaching crossover. */
  cappedAt600Months: boolean;
}

const MAX_MONTHS = 600;

/**
 * I_month = (K × r) / 12
 * Crossover = first month where I_month >= monthly_expenses.
 * Project: K grows by K * monthly_rate + monthly_savings each month.
 */
export function projectCrossover(input: CrossoverInput): CrossoverResult {
  const { currentCapital, annualRate, monthlyExpenses, monthlySavings } = input;

  const monthlyRate = annualRate / 12;

  // Check if already crossed over
  const currentMonthlyIncome = (currentCapital * annualRate) / 12;
  if (currentMonthlyIncome >= monthlyExpenses) {
    return { monthsToGo: 0, cappedAt600Months: false };
  }

  let capital = currentCapital;

  for (let month = 1; month <= MAX_MONTHS; month++) {
    capital = capital * (1 + monthlyRate) + monthlySavings;
    const monthlyIncome = (capital * annualRate) / 12;

    if (monthlyIncome >= monthlyExpenses) {
      return {
        monthsToGo: month,
        capitalAtCrossover: capital,
        cappedAt600Months: false,
      };
    }
  }

  return {
    monthsToGo: MAX_MONTHS,
    capitalAtCrossover: capital,
    cappedAt600Months: true,
  };
}

// ---------------------------------------------------------------------------
// Runway days (no-paid-work mode)
// ---------------------------------------------------------------------------

/**
 * How many days can the user survive on current capital?
 * capital / avg_monthly_spending * 30
 */
export function calculateRunwayDays(
  capitalMinor: bigint,
  monthlySpendingMinor: bigint,
): number {
  if (monthlySpendingMinor <= 0n) {
    return Infinity;
  }
  const capitalDollars = Number(capitalMinor) / 100;
  const monthlySpendingDollars = Number(monthlySpendingMinor) / 100;
  return (capitalDollars / monthlySpendingDollars) * 30;
}
