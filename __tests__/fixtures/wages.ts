/**
 * Wage test fixtures.
 */
import type { WageInput } from '../../src/lib/calc';

/** PRD worked example (§ Core calculations):
 *  net $4,000, 173 paid hrs, $700 job costs, 82 job hrs → $12.94/hr real, $23.12/hr nominal.
 *
 *  Note: 173 paid hrs/mo is a monthly figure already (the PRD states "173 paid hours").
 *  We model it as monthly with a dummy payPeriod of 'monthly'.
 */
export const PRD_WORKED_EXAMPLE: WageInput = {
  netPayPerPeriod: 4000,
  payPeriod: 'monthly',
  paidHoursPerPeriod: 173,
  monthlyJobCosts: 700,
  monthlyJobHours: 82,
};

/** Weekly-paid employee, same economics as the PRD example. */
export const WEEKLY_WAGE_INPUT: WageInput = {
  // $4,000/month = $923.077/week (approx)
  netPayPerPeriod: (4000 * 12) / 52,
  payPeriod: 'weekly',
  // 173 paid hrs/month = 39.923 hrs/week
  paidHoursPerPeriod: (173 * 12) / 52,
  monthlyJobCosts: 700,
  monthlyJobHours: 82,
};

/** Biweekly-paid employee. */
export const BIWEEKLY_WAGE_INPUT: WageInput = {
  // $4,000/month = $1,846.15/biweek
  netPayPerPeriod: (4000 * 12) / 26,
  payPeriod: 'biweekly',
  paidHoursPerPeriod: (173 * 12) / 26,
  monthlyJobCosts: 700,
  monthlyJobHours: 82,
};

/** Semimonthly-paid employee. */
export const SEMIMONTHLY_WAGE_INPUT: WageInput = {
  // $4,000/month = $2,000 per half-month
  netPayPerPeriod: 2000,
  payPeriod: 'semimonthly',
  paidHoursPerPeriod: 173 / 2,
  monthlyJobCosts: 700,
  monthlyJobHours: 82,
};

/** Negative real wage: job costs >= net pay. */
export const NEGATIVE_WAGE_INPUT: WageInput = {
  netPayPerPeriod: 3000,
  payPeriod: 'monthly',
  paidHoursPerPeriod: 160,
  monthlyJobCosts: 3500, // costs exceed pay → negative real wage
  monthlyJobHours: 40,
};

/** Zero real wage: job costs exactly equal net pay. */
export const ZERO_REAL_WAGE_INPUT: WageInput = {
  netPayPerPeriod: 3000,
  payPeriod: 'monthly',
  paidHoursPerPeriod: 160,
  monthlyJobCosts: 3000,
  monthlyJobHours: 40,
};

/** Irregular income user: trailing 3-month average. */
export const IRREGULAR_INCOME_INPUT: WageInput = {
  netPayPerPeriod: 0, // overridden by trailing average
  payPeriod: 'monthly',
  paidHoursPerPeriod: 120,
  monthlyJobCosts: 300,
  monthlyJobHours: 20,
  trailingMonthlyNetPay: 3500,
};
