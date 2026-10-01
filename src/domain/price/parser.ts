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

export function isPriceToken(token: string): boolean {
  if (REJECT_PATTERNS.some(r => r.test(token.trim()))) return false;
  return /[$¢]|^\.\d{2}$/.test(token) || /^\d{1,4}\.\d{2}$/.test(token);
}

export function parsePrice(text: string): ParsedPrice | null {
  const t = text.trim();

  // Multi-buy: "2 for $5" or "3/$10"
  const multiBuy = t.match(/^(\d+)\s*(?:for|\/)\s*\$(\d+(?:\.\d{2})?)$/i);
  if (multiBuy) {
    const count = parseInt(multiBuy[1]!);
    const total = parseFloat(multiBuy[2]!);
    return { minor: BigInt(Math.round((total / count) * 100)), currency: 'USD', note: 'per-item', confidence: 0.9 };
  }

  // Cents only: 99¢
  const cents = t.match(/^(\d+)¢$/);
  if (cents) return { minor: BigInt(parseInt(cents[1]!)), currency: 'USD', confidence: 1 };

  // Leading dot: .99
  const leadingDot = t.match(/^\.(\d{2})$/);
  if (leadingDot) return { minor: BigInt(parseInt(leadingDot[1]!)), currency: 'USD', confidence: 0.85 };

  // Standard: $X.XX or $X,XXX.XX
  const standard = t.match(/^\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)$/);
  if (standard) {
    const numeric = standard[1]!.replace(/,/g, '');
    const minor = BigInt(Math.round(parseFloat(numeric) * 100));
    return { minor, currency: 'USD', confidence: 1 };
  }

  return null;
}
