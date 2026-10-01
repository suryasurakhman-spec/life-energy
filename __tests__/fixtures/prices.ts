/**
 * Price parsing fixtures — one entry per PRD parsing table row,
 * plus reject cases.
 */
import type { ParsedPrice } from '../../src/lib/priceParser';

export interface PriceFixture {
  input: string;
  expected: ParsedPrice | null;
  description: string;
}

export const VALID_PRICE_FIXTURES: PriceFixture[] = [
  // Standard dollar formats
  {
    input: '$4.99',
    expected: { minor: 499n, currency: 'USD', confidence: 1 },
    description: 'Standard price with cents',
  },
  {
    input: '$1,299.00',
    expected: { minor: 129900n, currency: 'USD', confidence: 1 },
    description: 'Price with thousands separator',
  },
  {
    input: '$10.00',
    expected: { minor: 1000n, currency: 'USD', confidence: 1 },
    description: 'Round dollar amount with explicit cents',
  },
  {
    input: '$5',
    expected: { minor: 500n, currency: 'USD', confidence: 1 },
    description: 'Whole dollar, no cents',
  },

  // Split-cent shelf tag
  {
    input: '$3 99',
    expected: { minor: 399n, currency: 'USD', confidence: 0.85 },
    description: 'Split-cent shelf tag: large digit + adjacent 2-digit cents',
  },
  {
    input: '$12 49',
    expected: { minor: 1249n, currency: 'USD', confidence: 0.85 },
    description: 'Split-cent shelf tag with 2-digit dollars',
  },

  // Cents only
  {
    input: '99¢',
    expected: { minor: 99n, currency: 'USD', confidence: 1 },
    description: 'Cents-only with ¢ symbol',
  },
  {
    input: '.99',
    expected: { minor: 99n, currency: 'USD', confidence: 1 },
    description: 'Leading-dot cents',
  },
  {
    input: '25¢',
    expected: { minor: 25n, currency: 'USD', confidence: 1 },
    description: '25 cents with ¢ symbol',
  },

  // Multi-buy
  {
    input: '2 for $5',
    expected: { minor: 250n, currency: 'USD', note: 'per-item', confidence: 0.9 },
    description: 'N for $X multi-buy — per-item price',
  },
  {
    input: '3/$10',
    expected: { minor: 333n, currency: 'USD', note: 'per-item', confidence: 0.9 },
    description: 'N/$X multi-buy — rounded per-item price',
  },
  {
    input: '4 for $6.00',
    expected: { minor: 150n, currency: 'USD', note: 'per-item', confidence: 0.9 },
    description: '4 for $6.00 — $1.50 per item',
  },

  // Sale tags
  {
    input: 'Was $5.99 Now $3.99',
    expected: { minor: 399n, currency: 'USD', note: 'sale-lower', confidence: 0.95 },
    description: 'Sale tag — returns lower (now) price',
  },
  {
    input: 'Reg. $5.99',
    expected: { minor: 599n, currency: 'USD', note: 'sale-higher', confidence: 0.9 },
    description: 'Reg. price — flagged as sale-higher (was the original price)',
  },

  // Loyalty card
  {
    input: '$2.99 with card',
    expected: { minor: 299n, currency: 'USD', note: 'with-card', confidence: 0.95 },
    description: 'Card-member price',
  },

  // Unit prices
  {
    input: '$0.25/oz',
    expected: { minor: 25n, currency: 'USD', note: 'per-unit', confidence: 0.9 },
    description: 'Per-ounce unit price',
  },
  {
    input: '$3.49/lb',
    expected: { minor: 349n, currency: 'USD', note: 'per-unit', confidence: 0.9 },
    description: 'Per-pound unit price',
  },
  {
    input: '$1.99/kg',
    expected: { minor: 199n, currency: 'USD', note: 'per-unit', confidence: 0.9 },
    description: 'Per-kg unit price',
  },

  // Non-USD
  {
    input: 'C$4.99',
    expected: { minor: 0n, currency: 'NOT_USD', note: 'not-usd', confidence: 1 },
    description: 'Canadian dollar — not USD',
  },
  {
    input: 'CA$4.99',
    expected: { minor: 0n, currency: 'NOT_USD', note: 'not-usd', confidence: 1 },
    description: 'Canadian dollar CA$ prefix — not USD',
  },
  {
    input: '€4,99',
    expected: { minor: 0n, currency: 'NOT_USD', note: 'not-usd', confidence: 1 },
    description: 'Euro price — not USD',
  },
  {
    input: '£3.50',
    expected: { minor: 0n, currency: 'NOT_USD', note: 'not-usd', confidence: 1 },
    description: 'GBP price — not USD',
  },
];

export const REJECT_PRICE_FIXTURES: PriceFixture[] = [
  // Barcodes
  {
    input: '012345678905',
    expected: null,
    description: 'EAN-12 barcode — reject',
  },
  {
    input: '0123456789012',
    expected: null,
    description: 'EAN-13 barcode — reject',
  },
  {
    input: '1234567890',
    expected: null,
    description: '10-digit UPC-A — reject',
  },

  // Dates
  {
    input: '09/29/2026',
    expected: null,
    description: 'MM/DD/YYYY date — reject',
  },
  {
    input: '2026-09-29',
    expected: null,
    description: 'ISO date YYYY-MM-DD — reject',
  },
  {
    input: 'Sep 29 2026',
    expected: null,
    description: 'Written-out date — reject',
  },

  // Weights without $
  {
    input: '4.5oz',
    expected: null,
    description: 'Weight without $ — reject',
  },
  {
    input: '12lb',
    expected: null,
    description: 'Weight lb without $ — reject',
  },
  {
    input: '3 fl oz',
    expected: null,
    description: 'Fluid ounces without $ — reject',
  },

  // Phone numbers
  {
    input: '555-1234',
    expected: null,
    description: 'Short phone number — reject',
  },
  {
    input: '(555) 123-4567',
    expected: null,
    description: 'US phone number with area code — reject',
  },

  // SKUs
  {
    input: 'AB12345',
    expected: null,
    description: 'Alphanumeric SKU — reject',
  },
  {
    input: 'XY98765',
    expected: null,
    description: 'Alphanumeric SKU variant — reject',
  },
];
