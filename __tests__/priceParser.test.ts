/**
 * Tests for src/lib/priceParser.ts
 * One test per PRD parsing table row, plus all reject cases.
 */
import { describe, it, expect } from 'vitest';
import { parsePrice, isPriceToken } from '../src/lib/priceParser';
import { VALID_PRICE_FIXTURES, REJECT_PRICE_FIXTURES } from './fixtures/prices';

// ---------------------------------------------------------------------------
// Fixture-driven tests
// ---------------------------------------------------------------------------

describe('parsePrice — valid price fixtures', () => {
  for (const fixture of VALID_PRICE_FIXTURES) {
    it(fixture.description, () => {
      const result = parsePrice(fixture.input);
      expect(result).not.toBeNull();
      if (!result || !fixture.expected) return;
      expect(result.minor).toBe(fixture.expected.minor);
      expect(result.currency).toBe(fixture.expected.currency);
      expect(result.confidence).toBeCloseTo(fixture.expected.confidence, 2);
      if (fixture.expected.note !== undefined) {
        expect(result.note).toBe(fixture.expected.note);
      }
    });
  }
});

describe('parsePrice — reject fixtures', () => {
  for (const fixture of REJECT_PRICE_FIXTURES) {
    it(fixture.description, () => {
      const result = parsePrice(fixture.input);
      expect(result).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// Inline PRD table row tests
// ---------------------------------------------------------------------------

describe('parsePrice — PRD table row: standard dollar formats', () => {
  it('$4.99 → 499n, USD, confidence 1', () => {
    const r = parsePrice('$4.99');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(499n);
    expect(r!.currency).toBe('USD');
    expect(r!.confidence).toBe(1);
  });

  it('$1,299.00 → 129900n, USD, confidence 1', () => {
    const r = parsePrice('$1,299.00');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(129900n);
    expect(r!.currency).toBe('USD');
    expect(r!.confidence).toBe(1);
  });

  it('$10,000.99 → 1000099n (large price with thousands comma)', () => {
    const r = parsePrice('$10,000.99');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(1000099n);
  });
});

describe('parsePrice — PRD table row: split-cent shelf tag', () => {
  it('$3 99 → 399n, confidence 0.85', () => {
    const r = parsePrice('$3 99');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(399n);
    expect(r!.confidence).toBe(0.85);
  });

  it('$12 49 → 1249n, confidence 0.85', () => {
    const r = parsePrice('$12 49');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(1249n);
    expect(r!.confidence).toBe(0.85);
  });
});

describe('parsePrice — PRD table row: cents only', () => {
  it('99¢ → 99n, confidence 1', () => {
    const r = parsePrice('99¢');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(99n);
    expect(r!.confidence).toBe(1);
  });

  it('.99 → 99n, confidence 1', () => {
    const r = parsePrice('.99');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(99n);
    expect(r!.confidence).toBe(1);
  });

  it('25¢ → 25n', () => {
    const r = parsePrice('25¢');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(25n);
  });
});

describe('parsePrice — PRD table row: multi-buy', () => {
  it('2 for $5 → 250n, per-item, confidence 0.9', () => {
    const r = parsePrice('2 for $5');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(250n);
    expect(r!.note).toBe('per-item');
    expect(r!.confidence).toBe(0.9);
  });

  it('3/$10 → 333n (rounded), per-item, confidence 0.9', () => {
    const r = parsePrice('3/$10');
    expect(r).not.toBeNull();
    // 1000 cents / 3 = 333.33 → rounded to 333
    expect(r!.minor).toBe(333n);
    expect(r!.note).toBe('per-item');
    expect(r!.confidence).toBe(0.9);
  });

  it('5 for $10.00 → 200n per item', () => {
    const r = parsePrice('5 for $10.00');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(200n);
    expect(r!.note).toBe('per-item');
  });
});

describe('parsePrice — PRD table row: sale tags', () => {
  it('Was $5.99 Now $3.99 → 399n, sale-lower, confidence 0.95', () => {
    const r = parsePrice('Was $5.99 Now $3.99');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(399n);
    expect(r!.note).toBe('sale-lower');
    expect(r!.confidence).toBe(0.95);
  });

  it('was $10.00 now $7.50 (lowercase) → 750n, sale-lower', () => {
    const r = parsePrice('was $10.00 now $7.50');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(750n);
    expect(r!.note).toBe('sale-lower');
  });

  it('Reg. $5.99 → 599n, sale-higher, confidence 0.9', () => {
    const r = parsePrice('Reg. $5.99');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(599n);
    expect(r!.note).toBe('sale-higher');
    expect(r!.confidence).toBe(0.9);
  });

  it('Reg $12.99 (no period) → 1299n, sale-higher', () => {
    const r = parsePrice('Reg $12.99');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(1299n);
    expect(r!.note).toBe('sale-higher');
  });
});

describe('parsePrice — PRD table row: loyalty card price', () => {
  it('$2.99 with card → 299n, with-card, confidence 0.95', () => {
    const r = parsePrice('$2.99 with card');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(299n);
    expect(r!.note).toBe('with-card');
    expect(r!.confidence).toBe(0.95);
  });

  it('$9.99 with card → 999n, with-card', () => {
    const r = parsePrice('$9.99 with card');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(999n);
    expect(r!.note).toBe('with-card');
  });
});

describe('parsePrice — PRD table row: unit prices', () => {
  it('$0.25/oz → 25n, per-unit, confidence 0.9', () => {
    const r = parsePrice('$0.25/oz');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(25n);
    expect(r!.note).toBe('per-unit');
    expect(r!.confidence).toBe(0.9);
  });

  it('$3.49/lb → 349n, per-unit, confidence 0.9', () => {
    const r = parsePrice('$3.49/lb');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(349n);
    expect(r!.note).toBe('per-unit');
    expect(r!.confidence).toBe(0.9);
  });

  it('$1.99/kg → 199n, per-unit', () => {
    const r = parsePrice('$1.99/kg');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(199n);
    expect(r!.note).toBe('per-unit');
  });
});

describe('parsePrice — PRD table row: non-USD currencies', () => {
  it('C$4.99 → NOT_USD, not-usd, confidence 1', () => {
    const r = parsePrice('C$4.99');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(0n);
    expect(r!.currency).toBe('NOT_USD');
    expect(r!.note).toBe('not-usd');
    expect(r!.confidence).toBe(1);
  });

  it('CA$4.99 → NOT_USD, not-usd, confidence 1', () => {
    const r = parsePrice('CA$4.99');
    expect(r).not.toBeNull();
    expect(r!.currency).toBe('NOT_USD');
    expect(r!.note).toBe('not-usd');
  });

  it('€4,99 → NOT_USD, not-usd, confidence 1', () => {
    const r = parsePrice('€4,99');
    expect(r).not.toBeNull();
    expect(r!.currency).toBe('NOT_USD');
    expect(r!.note).toBe('not-usd');
    expect(r!.confidence).toBe(1);
  });

  it('£3.50 → NOT_USD, not-usd, confidence 1', () => {
    const r = parsePrice('£3.50');
    expect(r).not.toBeNull();
    expect(r!.currency).toBe('NOT_USD');
    expect(r!.note).toBe('not-usd');
    expect(r!.confidence).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Reject patterns
// ---------------------------------------------------------------------------

describe('parsePrice — reject: UPC/EAN barcodes', () => {
  it('12-digit EAN → null', () => {
    expect(parsePrice('012345678905')).toBeNull();
  });
  it('13-digit EAN → null', () => {
    expect(parsePrice('0123456789012')).toBeNull();
  });
  it('10-digit → null', () => {
    expect(parsePrice('1234567890')).toBeNull();
  });
});

describe('parsePrice — reject: dates', () => {
  it('MM/DD/YYYY → null', () => {
    expect(parsePrice('09/29/2026')).toBeNull();
  });
  it('YYYY-MM-DD → null', () => {
    expect(parsePrice('2026-09-29')).toBeNull();
  });
  it('Sep 29 2026 → null', () => {
    expect(parsePrice('Sep 29 2026')).toBeNull();
  });
  it('Jan 1 2024 → null', () => {
    expect(parsePrice('Jan 1 2024')).toBeNull();
  });
});

describe('parsePrice — reject: weights without $', () => {
  it('4.5oz → null', () => {
    expect(parsePrice('4.5oz')).toBeNull();
  });
  it('12lb → null', () => {
    expect(parsePrice('12lb')).toBeNull();
  });
  it('3 fl oz → null', () => {
    expect(parsePrice('3 fl oz')).toBeNull();
  });
  it('500g → null', () => {
    expect(parsePrice('500g')).toBeNull();
  });
});

describe('parsePrice — reject: phone numbers', () => {
  it('555-1234 → null', () => {
    expect(parsePrice('555-1234')).toBeNull();
  });
  it('(555) 123-4567 → null', () => {
    expect(parsePrice('(555) 123-4567')).toBeNull();
  });
});

describe('parsePrice — reject: SKUs', () => {
  it('AB12345 → null', () => {
    expect(parsePrice('AB12345')).toBeNull();
  });
  it('XY98765 → null', () => {
    expect(parsePrice('XY98765')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isPriceToken
// ---------------------------------------------------------------------------

describe('isPriceToken', () => {
  it('$4.99 → true', () => {
    expect(isPriceToken('$4.99')).toBe(true);
  });
  it('99¢ → true', () => {
    expect(isPriceToken('99¢')).toBe(true);
  });
  it('.99 → true', () => {
    expect(isPriceToken('.99')).toBe(true);
  });
  it('2 for $5 → true', () => {
    expect(isPriceToken('2 for $5')).toBe(true);
  });
  it('3/$10 → true', () => {
    expect(isPriceToken('3/$10')).toBe(true);
  });
  it('barcode 0123456789012 → false', () => {
    expect(isPriceToken('0123456789012')).toBe(false);
  });
  it('date 09/29/2026 → false', () => {
    expect(isPriceToken('09/29/2026')).toBe(false);
  });
  it('phone (555) 123-4567 → false', () => {
    expect(isPriceToken('(555) 123-4567')).toBe(false);
  });
  it('empty string → false', () => {
    expect(isPriceToken('')).toBe(false);
  });
  it('plain text "hello" → false', () => {
    expect(isPriceToken('hello')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Edge cases and additional coverage
// ---------------------------------------------------------------------------

describe('parsePrice — edge cases', () => {
  it('empty string → null', () => {
    expect(parsePrice('')).toBeNull();
  });

  it('whitespace-only string → null', () => {
    expect(parsePrice('   ')).toBeNull();
  });

  it('$0.00 → 0n', () => {
    const r = parsePrice('$0.00');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(0n);
  });

  it('$100 (no decimal) → 10000n', () => {
    const r = parsePrice('$100');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(10000n);
  });

  it('$1.5 (single decimal digit) → 150n', () => {
    // dollarStringToCents pads single digit to 2: "5" → "50"
    const r = parsePrice('$1.5');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(150n);
  });

  it('C$ prefix catches Canadian dollar', () => {
    const r = parsePrice('C$12.99');
    expect(r).not.toBeNull();
    expect(r!.currency).toBe('NOT_USD');
  });

  it('Was/Now is case-insensitive', () => {
    const r = parsePrice('WAS $8.00 NOW $6.00');
    expect(r).not.toBeNull();
    expect(r!.minor).toBe(600n);
    expect(r!.note).toBe('sale-lower');
  });
});
