import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ExpenseRepository } from './ports/expense-repository.port';

export async function exportData(repo: ExpenseRepository): Promise<void> {
  const records = await repo.exportAll();
  const json = JSON.stringify(
    records.map(r => ({ ...r, amountMinor: r.amountMinor.toString() })),
    null,
    2,
  );

  const fileUri = `${FileSystem.cacheDirectory}life-energy-export-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, json);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
  }
}
