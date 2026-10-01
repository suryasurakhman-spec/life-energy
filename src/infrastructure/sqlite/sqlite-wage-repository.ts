import { db } from './db';
import { wageProfiles } from './drizzle/schema';
import { isNull, desc } from 'drizzle-orm';
import type { WageRepository, WageProfileInput, WageProfileRecord } from '@/application/ports/wage-repository.port';
import type { PayPeriod } from '@/domain/wage/wage';

export class SqliteWageRepository implements WageRepository {
  async save(profile: WageProfileInput): Promise<void> {
    const now = new Date().toISOString();
    await db.insert(wageProfiles).values({
      id:               profile.id,
      effectiveFrom:    profile.effectiveFrom.toISOString(),
      netPayMinor:      Number(profile.netPayMinor),
      currency:         profile.currency,
      payPeriod:        profile.payPeriod,
      paidHoursPerWeek: profile.paidHoursPerWeek,
      jobCostsMinor:    Number(profile.jobCostsMinor),
      jobHoursPerMonth: profile.jobHoursPerMonth,
      realWageCached:   profile.realWageCached,
      createdAt:        now,
      updatedAt:        now,
      deletedAt:        null,
    }).onConflictDoUpdate({
      target: wageProfiles.id,
      set: { updatedAt: now, realWageCached: profile.realWageCached },
    });
  }

  async findCurrent(): Promise<WageProfileRecord | null> {
    const rows = await db.select().from(wageProfiles)
      .where(isNull(wageProfiles.deletedAt))
      .orderBy(desc(wageProfiles.effectiveFrom))
      .limit(1);
    if (rows.length === 0) return null;
    return toRecord(rows[0]!);
  }

  async findAll(): Promise<WageProfileRecord[]> {
    const rows = await db.select().from(wageProfiles)
      .where(isNull(wageProfiles.deletedAt))
      .orderBy(desc(wageProfiles.effectiveFrom));
    return rows.map(toRecord);
  }
}

function toRecord(row: typeof wageProfiles.$inferSelect): WageProfileRecord {
  return {
    id:               row.id,
    effectiveFrom:    new Date(row.effectiveFrom),
    netPayMinor:      BigInt(row.netPayMinor),
    currency:         row.currency,
    payPeriod:        row.payPeriod as PayPeriod,
    paidHoursPerWeek: row.paidHoursPerWeek,
    jobCostsMinor:    BigInt(row.jobCostsMinor),
    jobHoursPerMonth: row.jobHoursPerMonth,
    realWageCached:   row.realWageCached,
    createdAt:        new Date(row.createdAt),
    updatedAt:        new Date(row.updatedAt),
    ...(row.deletedAt != null ? { deletedAt: new Date(row.deletedAt) } : {}),
  };
}
