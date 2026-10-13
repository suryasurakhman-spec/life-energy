import { describe, it, expect } from 'vitest';
import { formatCurrency, formatHours, formatDate, currencySymbol, formatHourlyWage } from './format';
import { formatRateDate } from './format';

describe('formatCurrency', () => {
  it('formats USD cents as $X.XX', () => {
    expect(formatCurrency(1299n, 'USD')).toBe('$12.99');
    expect(formatCurrency(130000n, 'USD')).toBe('$1,300.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0n, 'USD')).toBe('$0.00');
  });
});

describe('formatHours', () => {
  it('adds ≈ prefix when estimated', () => {
    expect(formatHours(65, { estimated: true })).toMatch(/^≈/);
  });

  it('formats under 1 hour as minutes', () => {
    expect(formatHours(45)).toBe('45 m');
  });

  it('formats hours and minutes', () => {
    expect(formatHours(65)).toBe('1 h 5 m');
  });
});

describe('formatDate', () => {
  it('formats medium style', () => {
    const d = new Date('2026-09-30T00:00:00Z');
    expect(formatDate(d, 'medium')).toMatch(/Sep/);
  });

  it('formats short style', () => {
    const d = new Date('2026-09-30T00:00:00Z');
    expect(formatDate(d, 'short')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('currencySymbol', () => {
  it('returns the symbol for the home currency', () => {
    expect(currencySymbol('USD')).toBe('$');
    expect(currencySymbol('EUR')).toBe('€');
  });
});

describe('formatHourlyWage', () => {
  it('formats a real wage in its currency, to the cent', () => {
    expect(formatHourlyWage(13.4375, 'USD')).toBe('$13.44');
  });
});

describe('formatCurrency minor units', () => {
  it('reads yen as whole units', () => {
    expect(formatCurrency(4600n, 'JPY')).toBe('¥4,600');
  });

  it('reads cents for two-decimal currencies', () => {
    expect(formatCurrency(2300n, 'PLN')).toMatch(/^PLN\s23\.00$/);
  });
});

describe('formatRateDate', () => {
  it('formats the calendar day as written, whatever the time zone', () => {
    expect(formatRateDate('2026-10-12')).toBe('Oct 12, 2026');
  });
});
