import { supabase } from '@/lib/supabase';
import { SqliteFxRepository } from '@/infrastructure/sqlite/sqlite-fx-repository';

const fxRepo = new SqliteFxRepository();

/**
 * Pull the latest fx_rates rows from Supabase for `base` currency and cache
 * them locally. Safe to call on every app open — a no-op when offline.
 */
export async function syncFxRates(baseCurrency = 'USD'): Promise<void> {
  const { data, error } = await supabase
    .from('fx_rates')
    .select('base, quote, rate, as_of')
    .eq('base', baseCurrency);

  if (error || !data || data.length === 0) return; // offline or no rates yet

  await fxRepo.upsertRates(
    data.map((row: { base: string; quote: string; rate: number; as_of: string }) => ({
      base: row.base,
      quote: row.quote,
      rate: row.rate,
      asOf: row.as_of,
    })),
  );
}
