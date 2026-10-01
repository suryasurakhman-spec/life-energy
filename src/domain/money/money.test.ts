import { describe, it, expect } from 'vitest';
import { money, addMoney, subtractMoney, toDecimal } from './money';

describe('money', () => {
  it('stores minor units and currency', () => {
    const m = money(1299n, 'USD');
    expect(m.amountMinor).toBe(1299n);
    expect(m.currency).toBe('USD');
  });

  it('adds two same-currency amounts', () => {
    expect(addMoney(money(100n, 'USD'), money(200n, 'USD')).amountMinor).toBe(300n);
  });

  it('throws on currency mismatch', () => {
    expect(() => addMoney(money(100n, 'USD'), money(100n, 'CAD'))).toThrow();
  });

  it('subtracts two same-currency amounts', () => {
    expect(subtractMoney(money(300n, 'USD'), money(100n, 'USD')).amountMinor).toBe(200n);
  });

  it('converts to decimal', () => {
    expect(toDecimal(money(1299n, 'USD'))).toBeCloseTo(12.99);
  });
});
