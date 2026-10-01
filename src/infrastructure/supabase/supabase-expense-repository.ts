import { supabase } from './supabase-client';
import type { ExpenseRepository, ExpenseInput, ExpenseRecord } from '@/application/ports/expense-repository.port';

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

function toRecord(row: Record<string, unknown>): ExpenseRecord {
  return {
    id:            row['id'] as string,
    amountMinor:   BigInt(row['amount_minor'] as number),
    currency:      row['currency'] as string,
    ...(row['category_id'] != null ? { categoryId: row['category_id'] as string } : {}),
    spentAt:       new Date(row['spent_at'] as string),
    ...(row['note'] != null ? { note: row['note'] as string } : {}),
    wageProfileId: row['wage_profile_id'] as string,
    ...(row['verdict'] != null ? { verdict: row['verdict'] as string } : {}),
    source:        row['source'] as ExpenseInput['source'],
    createdAt:     new Date(row['created_at'] as string),
    updatedAt:     new Date(row['updated_at'] as string),
    ...(row['deleted_at'] != null ? { deletedAt: new Date(row['deleted_at'] as string) } : {}),
  };
}

export class SupabaseExpenseRepository implements ExpenseRepository {
  async save(expense: ExpenseInput): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase.from('expenses').upsert({
      id:             expense.id,
      amount_minor:   Number(expense.amountMinor),
      currency:       expense.currency,
      category_id:    expense.categoryId ?? null,
      spent_at:       expense.spentAt.toISOString(),
      note:           expense.note ?? null,
      wage_profile_id: expense.wageProfileId,
      verdict:        expense.verdict ?? null,
      source:         expense.source,
      updated_at:     now,
    });
    if (error) throw error;
  }

  async findByMonth(month: string): Promise<ExpenseRecord[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('spent_at', `${month}-01`)
      .lt('spent_at', nextMonth(month))
      .is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map(toRecord);
  }

  async findAll(): Promise<ExpenseRecord[]> {
    const { data, error } = await supabase.from('expenses').select('*').is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map(toRecord);
  }

  async exportAll(): Promise<ExpenseRecord[]> {
    const { data, error } = await supabase.from('expenses').select('*');
    if (error) throw error;
    return (data ?? []).map(toRecord);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }
}
