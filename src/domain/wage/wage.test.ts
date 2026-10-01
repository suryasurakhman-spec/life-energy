import { describe, it, expect } from 'vitest';
import { calculateRealWage } from './wage';
import { isOk, isErr } from '@/lib/result';

describe('calculateRealWage', () => {
  // PRD worked example: net $4,000, 173 paid hrs, $700 costs, 82 job hrs → $12.94/hr real
  it('matches PRD worked example', () => {
    const r = calculateRealWage({
      netPayMinor: 400000n,
      jobCostsMinor: 70000n,
      paidHoursPerMonth: 173,
      jobHoursPerMonth: 82,
    });
    expect(isOk(r)).toBe(true);
    if (!isOk(r)) return;
    expect(r.value.realHourly).toBeCloseTo(12.94, 1);
    expect(r.value.nominalHourly).toBeCloseTo(23.12, 1);
    expect(r.value.gapPercent).toBeCloseTo(44, 0);
  });

  it('returns error when real wage is zero or negative', () => {
    const r = calculateRealWage({
      netPayMinor: 100000n,
      jobCostsMinor: 100000n,
      paidHoursPerMonth: 173,
      jobHoursPerMonth: 0,
    });
    expect(isErr(r)).toBe(true);
  });

  it('converts weekly pay to monthly', () => {
    const r = calculateRealWage({
      netPayMinor: 100000n,
      payPeriod: 'weekly',
      jobCostsMinor: 0n,
      paidHoursPerWeek: 40,
      jobHoursPerMonth: 0,
    });
    expect(isOk(r)).toBe(true);
  });

  it('includes gap percent', () => {
    const r = calculateRealWage({
      netPayMinor: 400000n,
      jobCostsMinor: 70000n,
      paidHoursPerMonth: 173,
      jobHoursPerMonth: 82,
    });
    if (!isOk(r)) return;
    expect(r.value.gapPercent).toBeGreaterThan(0);
    expect(r.value.gapPercent).toBeLessThan(100);
  });
});
