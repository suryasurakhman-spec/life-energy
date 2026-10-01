import { Result, ok, err } from '@/lib/result';

export type PayPeriod = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export interface WageInput {
  netPayMinor: bigint;
  payPeriod?: PayPeriod;
  jobCostsMinor: bigint;
  paidHoursPerMonth?: number;
  paidHoursPerWeek?: number;
  jobHoursPerMonth: number;
}

export interface RealWage {
  nominalHourly: number;
  realHourly: number;
  gapPercent: number;
  totalHoursPerMonth: number;
}

export class NegativeRealWageError extends Error {
  constructor(public readonly realWage: number) {
    super(`Real wage is ${realWage} — job costs meet or exceed net pay`);
  }
}

function monthlyHours(input: WageInput): number {
  if (input.paidHoursPerMonth) return input.paidHoursPerMonth;
  const weekly = input.paidHoursPerWeek ?? 40;
  return (weekly * 52) / 12;
}

function monthlyNetPay(input: WageInput): number {
  const minor = Number(input.netPayMinor);
  switch (input.payPeriod ?? 'monthly') {
    case 'weekly':      return (minor * 52) / 12;
    case 'biweekly':    return (minor * 26) / 12;
    case 'semimonthly': return minor * 2;
    case 'monthly':     return minor;
  }
}

export function calculateRealWage(input: WageInput): Result<RealWage, NegativeRealWageError> {
  const netPay   = monthlyNetPay(input);
  const costs    = Number(input.jobCostsMinor);
  const paidHrs  = monthlyHours(input);
  const totalHrs = paidHrs + input.jobHoursPerMonth;

  const realHourly    = (netPay - costs) / totalHrs / 100;
  const nominalHourly = netPay / paidHrs / 100;

  if (realHourly <= 0) return err(new NegativeRealWageError(realHourly));

  const gapPercent = ((nominalHourly - realHourly) / nominalHourly) * 100;

  return ok({ nominalHourly, realHourly, gapPercent, totalHoursPerMonth: totalHrs });
}
