import { describe, it, expect } from 'vitest';
import { parsePrice, isPriceToken } from './parser';

describe('parsePrice', () => {
  // Standard formats
  it('parses $4.99',       () => expect(parsePrice('$4.99')).toMatchObject({ minor: 499n, currency: 'USD' }));
  it('parses $1,299.00',   () => expect(parsePrice('$1,299.00')).toMatchObject({ minor: 129900n, currency: 'USD' }));
  it('parses 99¢',         () => expect(parsePrice('99¢')).toMatchObject({ minor: 99n, currency: 'USD' }));
  it('parses .99',         () => expect(parsePrice('.99')).toMatchObject({ minor: 99n, currency: 'USD' }));

  // Multi-buy: returns per-item price
  it('parses 2 for $5',   () => expect(parsePrice('2 for $5')).toMatchObject({ minor: 250n, currency: 'USD', note: 'per-item' }));
  it('parses 3/$10',       () => expect(parsePrice('3/$10')).toMatchObject({ minor: 333n, currency: 'USD', note: 'per-item' }));

  // Foreign separators (FR-18)
  it('parses €4,99 as a decimal comma',    () => expect(parsePrice('€4,99')).toMatchObject({ minor: 499n, currency: 'EUR' }));
  it('parses €1.299,00 (EU thousands)',    () => expect(parsePrice('€1.299,00')).toMatchObject({ minor: 129900n, currency: 'EUR' }));
  it('parses Rp15.000 as fifteen thousand', () => expect(parsePrice('Rp15.000')).toMatchObject({ minor: 1500000n, currency: 'IDR' }));
  it('parses Rp. 6000 with a dot and a space', () => expect(parsePrice('Rp. 6000')).toMatchObject({ minor: 600000n, currency: 'IDR' }));
  it('parses a euro sign after the amount', () => expect(parsePrice('6,90€')).toMatchObject({ minor: 690n, currency: 'EUR' }));
  it('parses whole euros written with a dash', () => {
    expect(parsePrice('2.- €')).toMatchObject({ minor: 200n, currency: 'EUR' });
    expect(parsePrice('3,-€')).toMatchObject({ minor: 300n, currency: 'EUR' });
  });
  it('parses Rp1.299.000',                 () => expect(parsePrice('Rp1.299.000')).toMatchObject({ minor: 129900000n, currency: 'IDR' }));
  it('parses £3.50 as a decimal point',    () => expect(parsePrice('£3.50')).toMatchObject({ minor: 350n, currency: 'GBP' }));
  it('parses ¥1,299 with no minor units',  () => expect(parsePrice('¥1,299')).toMatchObject({ minor: 1299n, currency: 'JPY' }));

  it('returns null for unrecognised text', () => expect(parsePrice('hello world')).toBeNull());
});

describe('isPriceToken', () => {
  it('rejects dates',          () => expect(isPriceToken('09/29/2026')).toBe(false));
  it('rejects weights',        () => expect(isPriceToken('4.5oz')).toBe(false));
  it('rejects barcodes',       () => expect(isPriceToken('0123456789012')).toBe(false));
  it('rejects phone numbers',  () => expect(isPriceToken('555-1234')).toBe(false));
  it('accepts $4.99',          () => expect(isPriceToken('$4.99')).toBe(true));
});
