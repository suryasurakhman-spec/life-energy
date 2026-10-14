import { minorDigits } from '@/domain/price/parser';

/** One cached rate: 1 unit of `quote` is worth `rate` units of `base`. */
export interface FxRate {
  base: string;
  quote: string;
  rate: number;
  /** Date the rate was published, 'YYYY-MM-DD'. */
  asOf: string;
}

/**
 * Read the European Central Bank's daily reference rates (eurofxref-daily.xml):
 * how many units of each currency one euro buys. Null when the file isn't the expected shape.
 */
export function parseEcbDaily(xml: string): { asOf: string; perEuro: Record<string, number> } | null {
  const asOf = xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1];
  if (!asOf) return null;
  const perEuro: Record<string, number> = { EUR: 1 };
  for (const m of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) {
    const rate = Number(m[2]);
    if (rate > 0) perEuro[m[1]!] = rate;
  }
  // The ECB doesn't publish the riyal; it is pegged at 3.75 per US dollar.
  if (perEuro.USD) perEuro.SAR = perEuro.USD * 3.75;
  return Object.keys(perEuro).length > 1 ? { asOf, perEuro } : null;
}

/** Every base/quote pair from a per-euro table, so a change of home currency needs no new fetch. */
export function allPairs(perEuro: Record<string, number>, asOf: string): FxRate[] {
  const codes = Object.keys(perEuro);
  const pairs: FxRate[] = [];
  for (const base of codes) {
    for (const quote of codes) {
      if (base !== quote) pairs.push({ base, quote, rate: perEuro[base]! / perEuro[quote]!, asOf });
    }
  }
  return pairs;
}

/**
 * Convert minor units of `quote` into minor units of `base`.
 * Minor units differ by currency (¥4,600 is 4600, $30.82 is 3082), so the scale is applied.
 * Null when there is no rate yet.
 */
export function convertMinor(
  priceMinor: bigint,
  quote: string,
  base: string,
  rate: number | null | undefined,
): bigint | null {
  if (quote === base) return priceMinor;
  if (!rate) return null;
  const scale = 10 ** (minorDigits(base) - minorDigits(quote));
  return BigInt(Math.round(Number(priceMinor) * rate * scale));
}
