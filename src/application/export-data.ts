import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { UserDataStore, UserDataDump, DataRow } from './ports/user-data.port';

export type ExportFormat = 'json' | 'csv';

/** Everything, nested by table. */
export function toExportJson(dump: UserDataDump, exportedAt: Date): string {
  return JSON.stringify({ app: 'Life Energy', exportedAt: exportedAt.toISOString(), tables: dump }, null, 2);
}

function csvCell(value: DataRow[string]): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Everything, one section per table: a "# table" line, a header row, then the rows. */
export function toExportCsv(dump: UserDataDump): string {
  const sections: string[] = [];
  for (const [table, rows] of Object.entries(dump)) {
    const columns = [...new Set(rows.flatMap(r => Object.keys(r)))];
    const lines = [`# ${table}`];
    if (columns.length > 0) {
      lines.push(columns.map(csvCell).join(','));
      for (const row of rows) lines.push(columns.map(c => csvCell(row[c] ?? null)).join(','));
    }
    sections.push(lines.join('\r\n'));
  }
  return sections.join('\r\n\r\n') + '\r\n';
}

/** Export all user data (FR-12) and hand it to the system share sheet. */
export async function exportData(store: UserDataStore, format: ExportFormat): Promise<void> {
  const dump = await store.dumpAll();
  const now = new Date();
  const body = format === 'json' ? toExportJson(dump, now) : toExportCsv(dump);
  const fileUri = `${FileSystem.cacheDirectory}life-energy-export-${now.getTime()}.${format}`;
  await FileSystem.writeAsStringAsync(fileUri, body);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: format === 'json' ? 'application/json' : 'text/csv' });
  }
}
