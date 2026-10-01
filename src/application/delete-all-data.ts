import type { ExpenseRepository } from './ports/expense-repository.port';

export async function deleteAllData(repo: ExpenseRepository): Promise<void> {
  const all = await repo.exportAll();
  await Promise.all(all.map(e => repo.delete(e.id)));
}
