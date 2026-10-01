import { randomUUID } from 'expo-crypto';
import type { IncomeRepository, IncomeInput } from './ports/income-repository.port';

export type LogIncomeInput = Omit<IncomeInput, 'id'>;

export async function logIncome(repo: IncomeRepository, input: LogIncomeInput): Promise<void> {
  await repo.save({ ...input, id: randomUUID() });
}
