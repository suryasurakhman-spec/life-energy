import { useQuery } from '@tanstack/react-query';
import { SqliteFxRepository } from '@/infrastructure/sqlite/sqlite-fx-repository';

const repo = new SqliteFxRepository();

/**
 * Returns the rate to convert 1 unit of `quoteCurrency` into `baseCurrency`.
 * Falls back to null while loading or when the rate is not cached yet.
 *
 * Example: useFxRate('USD', 'EUR') → 1.08  (1 EUR = $1.08)
 */
export function useFxRate(baseCurrency: string, quoteCurrency: string) {
  return useQuery({
    queryKey: ['fx_rate', baseCurrency, quoteCurrency],
    queryFn: () => repo.getRate(baseCurrency, quoteCurrency),
    staleTime: 1000 * 60 * 60 * 12, // treat as fresh for 12 hours
    enabled: baseCurrency !== quoteCurrency,
  });
}

/**
 * Convert `priceMinor` from `quoteCurrency` to `baseCurrency` minor units.
 * Returns null when the rate is not available (show "not USD" label instead).
 */
export function convertToBase(
  priceMinor: bigint,
  quoteCurrency: string,
  baseCurrency: string,
  rate: number | null | undefined,
): bigint | null {
  if (quoteCurrency === baseCurrency) return priceMinor;
  if (!rate) return null;
  return BigInt(Math.round(Number(priceMinor) * rate));
}
