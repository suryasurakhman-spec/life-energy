export interface ParsedPrice {
  minor: bigint;
  currency: string;
  note?: 'per-item' | 'per-unit' | 'with-card' | 'sale';
  confidence: number; // 0–1
}

const REJECT_PATTERNS = [
  /^\d{2}\/\d{2}\/\d{4}$/,           // dates
  /\d+(oz|lb|fl oz|kg|g)\b/i,        // weights
  /^\d{10,13}$/,                      // barcodes/UPCs
  /\d{3}-\d{4}/,                      // phone fragments
];

// Maps recognized currency symbols/prefixes → ISO 4217 codes.
// Order matters: longer prefixes (CA$, C$, A$) must come before bare $.
const CURRENCY_SYMBOLS: Array<{ pattern: RegExp; code: string }> = [
  { pattern: /^CA\$|^C\$/i,  code: 'CAD' },
  { pattern: /^A\$/i,        code: 'AUD' },
  { pattern: /^NZ\$/i,       code: 'NZD' },
  { pattern: /^HK\$/i,       code: 'HKD' },
  { pattern: /^S\$/i,        code: 'SGD' },
  { pattern: /^MX\$/i,       code: 'MXN' },
  { pattern: /^£/,           code: 'GBP' },
  { pattern: /^€/,           code: 'EUR' },
  { pattern: /^¥|^JP¥/i,    code: 'JPY' },
  { pattern: /^CN¥|^元/,    code: 'CNY' },
  { pattern: /^₩/,           code: 'KRW' },
  { pattern: /^Rp\.?/i,      code: 'IDR' },
  { pattern: /^\$/,          code: 'USD' }, // bare $ last
];

/** Strip a known currency symbol from the start of a string and return [currencyCode, remainder]. */
function extractCurrency(t: string): [string, string] | null {
  for (const { pattern, code } of CURRENCY_SYMBOLS) {
    const m = t.match(pattern);
    if (m) return [code, t.slice(m[0].length)];
  }
  return null;
}

/** Parse a numeric string with optional thousands separators.
 *  Handles both "," thousands + "." decimal (US) and "." thousands + "," decimal (EU). */
function parseNumeric(s: string, currency: string): bigint | null {
  // EU format: digits with dots as thousands, comma as decimal — e.g. "1.299,00"
  // Detect: has comma AND dots where dots always come before the comma
  const isEuFormat = /\d\.\d{3}/.test(s) && s.includes(',');
  let normalized: string;
  if (isEuFormat) {
    normalized = s.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = s.replace(/,/g, '');
  }
  const val = parseFloat(normalized);
  if (isNaN(val)) return null;
  // JPY and KRW have no minor units (no decimal)
  const noMinorUnits = currency === 'JPY' || currency === 'KRW';
  return BigInt(noMinorUnits ? Math.round(val) : Math.round(val * 100));
}

export function isPriceToken(token: string): boolean {
  if (REJECT_PATTERNS.some(r => r.test(token.trim()))) return false;
  return /[$¢€£¥₩]|CA\$|C\$|A\$|Rp|^\.\d{2}$/.test(token) || /^\d{1,4}\.\d{2}$/.test(token);
}

export function parsePrice(text: string): ParsedPrice | null {
  const t = text.trim();

  if (REJECT_PATTERNS.some(r => r.test(t))) return null;

  // Multi-buy: "2 for $5" or "3/$10" (USD only — foreign multi-buy formats vary too much)
  const multiBuy = t.match(/^(\d+)\s*(?:for|\/)\s*\$(\d+(?:\.\d{2})?)$/i);
  if (multiBuy) {
    const count = parseInt(multiBuy[1]!);
    const total = parseFloat(multiBuy[2]!);
    return { minor: BigInt(Math.round((total / count) * 100)), currency: 'USD', note: 'per-item', confidence: 0.9 };
  }

  // Cents only: 99¢
  const cents = t.match(/^(\d+)¢$/);
  if (cents) return { minor: BigInt(parseInt(cents[1]!)), currency: 'USD', confidence: 1 };

  // Leading dot: .99 (USD assumed)
  const leadingDot = t.match(/^\.(\d{2})$/);
  if (leadingDot) return { minor: BigInt(parseInt(leadingDot[1]!)), currency: 'USD', confidence: 0.85 };

  // Generic symbol-prefixed price: $4.99, €4,99, £3.50, C$12.00, Rp15.000, ¥1299, etc.
  const extracted = extractCurrency(t);
  if (extracted) {
    const [currency, rest] = extracted;
    // rest must look like a number (digits, commas, dots only)
    if (!/^[\d.,]+$/.test(rest)) return null;
    const minor = parseNumeric(rest, currency);
    if (minor === null || minor < 0n) return null;
    return { minor, currency, confidence: 1 };
  }

  return null;
}
