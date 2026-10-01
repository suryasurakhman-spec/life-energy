import { randomUUID } from 'expo-crypto';
import type { ExpenseRepository, ExpenseInput } from './ports/expense-repository.port';

export type LogExpenseInput = Omit<ExpenseInput, 'id'>;

export async function logExpense(repo: ExpenseRepository, input: LogExpenseInput): Promise<void> {
  await repo.save({ ...input, id: randomUUID() });
}
