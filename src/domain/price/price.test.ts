import { describe, it, expect } from 'vitest';
import { lifeEnergy, formatLifeEnergy } from './price';

describe('lifeEnergy', () => {
  it('converts $12.99 at $12.94/hr to ~60 minutes', () => {
    const result = lifeEnergy({ priceMinor: 1299n, realHourlyWage: 12.94 });
    expect(result.totalMinutes).toBeCloseTo(60.2, 0);
  });

  it('formats under 1 hour as minutes', () => {
    expect(formatLifeEnergy({ totalMinutes: 43 })).toBe('43 m');
  });

  it('formats 1–40 hours as hours + minutes', () => {
    expect(formatLifeEnergy({ totalMinutes: 65 })).toBe('1 h 5 m');
  });

  it('formats 10+ hours dropping minutes', () => {
    expect(formatLifeEnergy({ totalMinutes: 840 })).toBe('14 h');
  });

  it('formats > 40 hours as work days', () => {
    // 2880 min = 48 hrs = 6.0 work days
    expect(formatLifeEnergy({ totalMinutes: 2880, workDayMinutes: 480 })).toMatch(/work day/);
  });
});
