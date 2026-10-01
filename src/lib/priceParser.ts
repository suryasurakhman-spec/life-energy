/**
 * priceParser.ts — Parse price strings from US store tags into minor units.
 * Returns ParsedPrice | null. Zero React / RN / Expo imports.
 *
 * Handles every row in the PRD US price parsing table.
 */

export interface ParsedPrice {
  /** Amount in cents (minor units). */
  minor: bigint;
  /** 'USD' or flag 'NOT_USD'. */
  currency: string;
  note?:
    | 'per-item'
    | 'per-unit'
    | 'with-card'
    | 'sale-lower'
    | 'sale-higher'
    | 'not-usd';
  /** 0.0–1.0 */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Reject patterns
// ---------------------------------------------------------------------------

/** UPC/EAN: 10–13 consecutive digits (no non-digit adjacent on either side). */
const RE_BARCODE = /(?<!\d)\d{10,13}(?!\d)/;

/** Date patterns: MM/DD/YYYY, YYYY-MM-DD, "Sep 29 2026"-style. */
const RE_DATE_SLASH = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/;
const RE_DATE_ISO = /\b\d{4}-\d{2}-\d{2}\b/;
const RE_DATE_WORDS =
  /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{4}\b/i;

/** Weights without a dollar sign: 4.5oz, 12lb, 3 fl oz. */
const RE_WEIGHT_ONLY = /\b\d+(?:\.\d+)?\s*(?:oz|lb|lbs|fl\s*oz|g|kg)\b/i;

/** Phone numbers: 555-1234, (555) 123-4567, 555.123.4567. */
const RE_PHONE = /(?:\(\d{3}\)\s*|\d{3}[-.])\d{3}[-.]?\d{4}\b/;

/** SKUs: alphanumeric codes like AB12345 (letter(s) + digits or digits + letter(s)). */
const RE_SKU = /\b[A-Z]{1,4}\d{4,8}\b|\b\d{4,8}[A-Z]{1,4}\b/;

// ---------------------------------------------------------------------------
// Non-USD currency symbols/prefixes
// ---------------------------------------------------------------------------

const RE_NOT_USD = /^(?:C\$|CA\$|£|€|A\$|AU\$|NZ\$|HK\$|MX\$)/i;

// ---------------------------------------------------------------------------
// Helper: parse a dollar string like "4.99" or "1,299.00" to cents (bigint)
// ---------------------------------------------------------------------------

function dollarStringToCents(s: string): bigint | null {
  // Remove thousands commas
  const clean = s.replace(/,/g, '');
  const match = clean.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  const dollars = BigInt(match[1] ?? '0');
  const centsStr = (match[2] ?? '00').padEnd(2, '0');
  const cents = BigInt(centsStr);
  return dollars * 100n + cents;
}

// ---------------------------------------------------------------------------
// isPriceToken — quick filter for the AR pipeline
// ---------------------------------------------------------------------------

/**
 * Returns true if the text looks like it could contain a price token.
 * Used as a fast pre-filter before full parsing.
 */
export function isPriceToken(text: string): boolean {
  if (!text || text.trim().length === 0) return false;

  // Must not be a pure reject pattern
  if (RE_BARCODE.test(text)) return false;
  if (RE_DATE_SLASH.test(text) || RE_DATE_ISO.test(text) || RE_DATE_WORDS.test(text))
    return false;
  if (RE_PHONE.test(text)) return false;

  // Positive signals
  if (/\$/.test(text)) return true;
  if (/¢/.test(text)) return true;
  if (/^\s*\.\d{2}\s*$/.test(text)) return true;
  if (/\b\d+\s+for\s+\$/i.test(text)) return true;
  if (/\d+\/\$/.test(text)) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

/**
 * Parse a price string from a US store tag.
 * Returns ParsedPrice | null.
 */
export function parsePrice(text: string): ParsedPrice | null {
  if (!text || text.trim().length === 0) return null;

  const trimmed = text.trim();

  // ------------------------------------------------------------------
  // 1. Reject patterns — check before anything else
  // ------------------------------------------------------------------

  if (RE_BARCODE.test(trimmed)) return null;
  if (RE_DATE_SLASH.test(trimmed) || RE_DATE_ISO.test(trimmed) || RE_DATE_WORDS.test(trimmed))
    return null;
  if (RE_PHONE.test(trimmed)) return null;

  // Weights without $ sign
  if (RE_WEIGHT_ONLY.test(trimmed) && !/\$/.test(trimmed)) return null;

  // SKU patterns (no $ sign)
  if (RE_SKU.test(trimmed) && !/\$/.test(trimmed)) return null;

  // ------------------------------------------------------------------
  // 2. Non-USD currencies
  // ------------------------------------------------------------------

  if (RE_NOT_USD.test(trimmed)) {
    return {
      minor: 0n,
      currency: 'NOT_USD',
      note: 'not-usd',
      confidence: 1,
    };
  }

  // Also catch €4,99 and £3.50 patterns (symbol mid-string or with digit)
  if (/[€£]/.test(trimmed)) {
    return {
      minor: 0n,
      currency: 'NOT_USD',
      note: 'not-usd',
      confidence: 1,
    };
  }

  // ------------------------------------------------------------------
  // 3. Sale tag: "Was $X.XX Now $Y.YY" — return the lower with note
  // ------------------------------------------------------------------

  const saleNowMatch = trimmed.match(
    /was\s+\$(\d[\d,]*(?:\.\d{1,2})?)\s+now\s+\$(\d[\d,]*(?:\.\d{1,2})?)/i,
  );
  if (saleNowMatch) {
    const wasStr = saleNowMatch[1];
    const nowStr = saleNowMatch[2];
    if (wasStr && nowStr) {
      const wasCents = dollarStringToCents(wasStr);
      const nowCents = dollarStringToCents(nowStr);
      if (wasCents !== null && nowCents !== null) {
        // Return the lower price (the "now" price) with sale-lower note
        const lowerCents = nowCents < wasCents ? nowCents : wasCents;
        return {
          minor: lowerCents,
          currency: 'USD',
          note: 'sale-lower',
          confidence: 0.95,
        };
      }
    }
  }

  // ------------------------------------------------------------------
  // 4. Regular price tag "Reg. $X.XX" or "Reg $X.XX" — sale-higher
  // ------------------------------------------------------------------

  const regMatch = trimmed.match(/reg\.?\s+\$(\d[\d,]*(?:\.\d{1,2})?)/i);
  if (regMatch) {
    const regStr = regMatch[1];
    if (regStr) {
      const cents = dollarStringToCents(regStr);
      if (cents !== null) {
        return {
          minor: cents,
          currency: 'USD',
          note: 'sale-higher',
          confidence: 0.9,
        };
      }
    }
  }

  // ------------------------------------------------------------------
  // 5. Loyalty card price: "$X.XX with card"
  // ------------------------------------------------------------------

  const withCardMatch = trimmed.match(
    /\$(\d[\d,]*(?:\.\d{1,2})?)\s+with\s+card/i,
  );
  if (withCardMatch) {
    const priceStr = withCardMatch[1];
    if (priceStr) {
      const cents = dollarStringToCents(priceStr);
      if (cents !== null) {
        return {
          minor: cents,
          currency: 'USD',
          note: 'with-card',
          confidence: 0.95,
        };
      }
    }
  }

  // ------------------------------------------------------------------
  // 6. Multi-buy: "2 for $5" or "3/$10"
  // ------------------------------------------------------------------

  // "N for $X.XX"
  const nForMatch = trimmed.match(
    /(\d+)\s+for\s+\$(\d[\d,]*(?:\.\d{1,2})?)/i,
  );
  if (nForMatch) {
    const count = parseInt(nForMatch[1] ?? '1', 10);
    const totalStr = nForMatch[2];
    if (totalStr && count > 0) {
      const totalCents = dollarStringToCents(totalStr);
      if (totalCents !== null) {
        const perItemCents = BigInt(Math.round(Number(totalCents) / count));
        return {
          minor: perItemCents,
          currency: 'USD',
          note: 'per-item',
          confidence: 0.9,
        };
      }
    }
  }

  // "N/$X.XX"
  const nSlashMatch = trimmed.match(
    /(\d+)\s*\/\s*\$(\d[\d,]*(?:\.\d{1,2})?)/,
  );
  if (nSlashMatch) {
    const count = parseInt(nSlashMatch[1] ?? '1', 10);
    const totalStr = nSlashMatch[2];
    if (totalStr && count > 0) {
      const totalCents = dollarStringToCents(totalStr);
      if (totalCents !== null) {
        const perItemCents = BigInt(Math.round(Number(totalCents) / count));
        return {
          minor: perItemCents,
          currency: 'USD',
          note: 'per-item',
          confidence: 0.9,
        };
      }
    }
  }

  // ------------------------------------------------------------------
  // 7. Unit price: "$X.XX/oz" or "$X.XX/lb"
  // ------------------------------------------------------------------

  const unitPriceMatch = trimmed.match(
    /\$(\d[\d,]*(?:\.\d{1,2})?)\/(?:oz|lb|lbs|fl\s*oz|g|kg|ml|l|ct|ea|each)\b/i,
  );
  if (unitPriceMatch) {
    const priceStr = unitPriceMatch[1];
    if (priceStr) {
      const cents = dollarStringToCents(priceStr);
      if (cents !== null) {
        return {
          minor: cents,
          currency: 'USD',
          note: 'per-unit',
          confidence: 0.9,
        };
      }
    }
  }

  // ------------------------------------------------------------------
  // 8. Cents only: "99¢" or ".99"
  // ------------------------------------------------------------------

  const centsSymbolMatch = trimmed.match(/^(\d{1,2})¢$/);
  if (centsSymbolMatch) {
    const c = centsSymbolMatch[1];
    if (c) {
      return {
        minor: BigInt(parseInt(c, 10)),
        currency: 'USD',
        confidence: 1,
      };
    }
  }

  const leadingDotMatch = trimmed.match(/^\.(\d{2})$/);
  if (leadingDotMatch) {
    const c = leadingDotMatch[1];
    if (c) {
      return {
        minor: BigInt(parseInt(c, 10)),
        currency: 'USD',
        confidence: 1,
      };
    }
  }

  // ------------------------------------------------------------------
  // 9. Split-cent shelf tag: "$3 99" (large integer + 2-digit cents, no dot)
  //    The PRD describes this as "large number + adjacent smaller top-aligned
  //    2 digits". We parse "$D DD" where DD is exactly 2 digits.
  // ------------------------------------------------------------------

  const splitCentMatch = trimmed.match(/^\$(\d+)\s+(\d{2})$/);
  if (splitCentMatch) {
    const dollarsStr = splitCentMatch[1];
    const centsStr = splitCentMatch[2];
    if (dollarsStr && centsStr) {
      const dollars = BigInt(dollarsStr);
      const cents = BigInt(centsStr);
      return {
        minor: dollars * 100n + cents,
        currency: 'USD',
        confidence: 0.85,
      };
    }
  }

  // ------------------------------------------------------------------
  // 10. Standard dollar price: $4.99, $1,299.00, $5 (no cents)
  // ------------------------------------------------------------------

  // Try to extract a standard price — must have $ sign
  const standardMatch = trimmed.match(/^\$(\d[\d,]*(?:\.\d{1,2})?)$/);
  if (standardMatch) {
    const priceStr = standardMatch[1];
    if (priceStr) {
      const cents = dollarStringToCents(priceStr);
      if (cents !== null) {
        return {
          minor: cents,
          currency: 'USD',
          confidence: 1,
        };
      }
    }
  }

  // Allow a price anywhere in the string when no other pattern matched yet
  // (e.g. "$4.99 " with trailing whitespace, already handled by trimmed)
  // Try flexible extraction: find first $-price token
  const flexMatch = trimmed.match(/\$(\d[\d,]*(?:\.\d{1,2})?)/);
  if (flexMatch) {
    const priceStr = flexMatch[1];
    if (priceStr) {
      const cents = dollarStringToCents(priceStr);
      if (cents !== null) {
        return {
          minor: cents,
          currency: 'USD',
          confidence: 0.9,
        };
      }
    }
  }

  return null;
}
