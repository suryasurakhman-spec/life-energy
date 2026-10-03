import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { fxRates } from './drizzle/schema';

export interface FxRate {
  base: string;
  quote: string;
  rate: number;
  asOf: string;
}

export class SqliteFxRepository {
  /** Returns the rate to convert 1 unit of `quote` → `base`. Null if not cached. */
  async getRate(base: string, quote: string): Promise<FxRate | null> {
    if (base === quote) return { base, quote, rate: 1, asOf: new Date().toISOString().slice(0, 10) };
    const rows = await db
      .select()
      .from(fxRates)
      .where(and(eq(fxRates.base, base), eq(fxRates.quote, quote)))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Upsert a batch of rates (called after syncing from Supabase). */
  async upsertRates(rates: FxRate[]): Promise<void> {
    if (rates.length === 0) return;
    await db
      .insert(fxRates)
      .values(
        rates.map(r => ({
          base: r.base,
          quote: r.quote,
          rate: r.rate,
          asOf: r.asOf,
          updatedAt: new Date().toISOString(),
        })),
      )
      .onConflictDoUpdate({
        target: [fxRates.base, fxRates.quote],
        set: { rate: fxRates.rate, asOf: fxRates.asOf, updatedAt: fxRates.updatedAt },
      });
  }
}
