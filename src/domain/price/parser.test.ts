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

  it('returns null for unrecognised text', () => expect(parsePrice('hello world')).toBeNull());
});

describe('isPriceToken', () => {
  it('rejects dates',          () => expect(isPriceToken('09/29/2026')).toBe(false));
  it('rejects weights',        () => expect(isPriceToken('4.5oz')).toBe(false));
  it('rejects barcodes',       () => expect(isPriceToken('0123456789012')).toBe(false));
  it('rejects phone numbers',  () => expect(isPriceToken('555-1234')).toBe(false));
  it('accepts $4.99',          () => expect(isPriceToken('$4.99')).toBe(true));
});
