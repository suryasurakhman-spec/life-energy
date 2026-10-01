import { db } from './db';
import { incomes } from './drizzle/schema';
import { eq, and, isNull } from 'drizzle-orm';
import type { IncomeRepository, IncomeInput, IncomeRecord } from '@/application/ports/income-repository.port';

export class SqliteIncomeRepository implements IncomeRepository {
  async save(income: IncomeInput): Promise<void> {
    const now = new Date().toISOString();
    await db.insert(incomes).values({
      id:          income.id,
      amountMinor: Number(income.amountMinor),
      currency:    income.currency,
      month:       income.month,
      source:      income.source ?? null,
      createdAt:   now,
      updatedAt:   now,
      deletedAt:   null,
    }).onConflictDoUpdate({
      target: incomes.id,
      set: { amountMinor: Number(income.amountMinor), updatedAt: now },
    });
  }

  async remove(id: string): Promise<void> {
    await db.delete(incomes).where(eq(incomes.id, id));
  }

  async findByMonth(month: string): Promise<IncomeRecord[]> {
    const rows = await db.select().from(incomes)
      .where(and(eq(incomes.month, month), isNull(incomes.deletedAt)));
    return rows.map(toRecord);
  }

  async findAll(): Promise<IncomeRecord[]> {
    const rows = await db.select().from(incomes).where(isNull(incomes.deletedAt));
    return rows.map(toRecord);
  }
}

function toRecord(row: typeof incomes.$inferSelect): IncomeRecord {
  return {
    id:          row.id,
    amountMinor: BigInt(row.amountMinor),
    currency:    row.currency,
    month:       row.month,
    ...(row.source != null ? { source: row.source } : {}),
    createdAt:   new Date(row.createdAt),
    updatedAt:   new Date(row.updatedAt),
    ...(row.deletedAt != null ? { deletedAt: new Date(row.deletedAt) } : {}),
  };
}
