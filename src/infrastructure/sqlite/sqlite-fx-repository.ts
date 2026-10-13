import { eq, and, sql, max } from 'drizzle-orm';
import type { FxRate } from '@/domain/fx/fx';
import { db } from './db';
import { fxRates } from './drizzle/schema';

export type { FxRate };

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

  /** When rates were last saved on this device, or null if never. */
  async lastUpdated(): Promise<Date | null> {
    const rows = await db.select({ at: max(fxRates.updatedAt) }).from(fxRates);
    const at = rows[0]?.at;
    return at ? new Date(at) : null;
  }

  /** Upsert a batch of rates (after a daily fetch, or a Supabase sync from v2). */
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
        // excluded.* is the incoming row; setting a column to itself would keep the stale rate.
        set: { rate: sql`excluded.rate`, asOf: sql`excluded.as_of`, updatedAt: sql`excluded.updated_at` },
      });
  }
}
