import { db } from './db';
import { expenses } from './drizzle/schema';
import { eq, gte, lt, isNull, and } from 'drizzle-orm';
import type { ExpenseRepository, ExpenseInput, ExpenseRecord } from '@/application/ports/expense-repository.port';

export class SqliteExpenseRepository implements ExpenseRepository {
  async save(expense: ExpenseInput): Promise<void> {
    const now = new Date().toISOString();
    await db.insert(expenses).values({
      id:            expense.id,
      amountMinor:   Number(expense.amountMinor),
      currency:      expense.currency,
      categoryId:    expense.categoryId ?? null,
      spentAt:       expense.spentAt.toISOString(),
      note:          expense.note ?? null,
      wageProfileId: expense.wageProfileId,
      verdict:       expense.verdict ?? null,
      source:        expense.source,
      createdAt:     now,
      updatedAt:     now,
      deletedAt:     null,
    }).onConflictDoUpdate({
      target: expenses.id,
      set: { updatedAt: now, verdict: expense.verdict ?? null },
    });
  }

  async findByMonth(month: string): Promise<ExpenseRecord[]> {
    const start = `${month}-01`;
    const end   = nextMonth(month);
    const rows  = await db.select().from(expenses).where(
      and(
        gte(expenses.spentAt, start),
        lt(expenses.spentAt, end),
        isNull(expenses.deletedAt),
      )
    );
    return rows.map(toRecord);
  }

  async findAll(): Promise<ExpenseRecord[]> {
    const rows = await db.select().from(expenses).where(isNull(expenses.deletedAt));
    return rows.map(toRecord);
  }

  async exportAll(): Promise<ExpenseRecord[]> {
    const rows = await db.select().from(expenses);
    return rows.map(toRecord);
  }

  async delete(id: string): Promise<void> {
    await db.update(expenses).set({ deletedAt: new Date().toISOString() }).where(eq(expenses.id, id));
  }
}

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

function toRecord(row: typeof expenses.$inferSelect): ExpenseRecord {
  return {
    id:            row.id,
    amountMinor:   BigInt(row.amountMinor),
    currency:      row.currency,
    ...(row.categoryId !== null ? { categoryId: row.categoryId } : {}),
    spentAt:       new Date(row.spentAt),
    ...(row.note !== null ? { note: row.note } : {}),
    wageProfileId: row.wageProfileId,
    ...(row.verdict !== null ? { verdict: row.verdict } : {}),
    source:        row.source as ExpenseInput['source'],
    createdAt:     new Date(row.createdAt),
    updatedAt:     new Date(row.updatedAt),
    ...(row.deletedAt !== null ? { deletedAt: new Date(row.deletedAt!) } : {}),
  };
}
