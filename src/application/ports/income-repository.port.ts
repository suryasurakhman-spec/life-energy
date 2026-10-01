export interface IncomeInput {
  id: string;
  amountMinor: bigint;
  currency: string;
  month: string; // 'YYYY-MM'
  source?: string;
}

export interface IncomeRecord extends IncomeInput {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IncomeRepository {
  save(income: IncomeInput): Promise<void>;
  remove(id: string): Promise<void>;
  findByMonth(month: string): Promise<IncomeRecord[]>;
  findAll(): Promise<IncomeRecord[]>;
}
