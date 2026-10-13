import { allPairs, parseEcbDaily, type FxRate } from '@/domain/fx/fx';

export interface FxRateStore {
  lastUpdated(): Promise<Date | null>;
  upsertRates(rates: FxRate[]): Promise<void>;
}

/** Rates are refreshed at most this often; the ECB publishes once per working day. */
export const FX_REFRESH_MS = 12 * 60 * 60 * 1000;

/**
 * Fetch the day's exchange rates and cache every pair on the device (FR-18).
 * Skips when the cache is fresh; offline or a bad file leaves the last cached rates in use.
 * Returns true when new rates were saved.
 */
export async function refreshFxRates(
  store: FxRateStore,
  fetchDaily: () => Promise<string | null>,
  now = new Date(),
): Promise<boolean> {
  const last = await store.lastUpdated();
  if (last && now.getTime() - last.getTime() < FX_REFRESH_MS) return false;
  const xml = await fetchDaily();
  const parsed = xml ? parseEcbDaily(xml) : null;
  if (!parsed) return false;
  await store.upsertRates(allPairs(parsed.perEuro, parsed.asOf));
  return true;
}
