export interface ExpenseInput {
  id: string;
  amountMinor: bigint;
  currency: string;
  categoryId?: string;
  spentAt: Date;
  note?: string;
  wageProfileId: string;
  verdict?: string;
  source: 'lens' | 'freeze' | 'keypad' | 'manual';
}

export interface ExpenseRecord extends ExpenseInput {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ExpenseRepository {
  save(expense: ExpenseInput): Promise<void>;
  findByMonth(month: string): Promise<ExpenseRecord[]>;
  findAll(): Promise<ExpenseRecord[]>;
  delete(id: string): Promise<void>;
  exportAll(): Promise<ExpenseRecord[]>;
}
