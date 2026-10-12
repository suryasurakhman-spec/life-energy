import { describe, it, expect, vi } from 'vitest';

vi.mock('expo-file-system', () => ({}));
vi.mock('expo-sharing', () => ({}));

import { toExportJson, toExportCsv } from './export-data';
import { deleteAllData } from './delete-all-data';
import type { UserDataDump, UserDataStore } from './ports/user-data.port';

const dump: UserDataDump = {
  wage_profiles: [{ id: 'wp-1', real_wage_cached: 1344, currency: 'USD' }],
  expenses: [
    { id: 'e-1', amount_minor: 6400, note: 'shoes, "running"', verdict: null },
    { id: 'e-2', amount_minor: 1400, note: null, verdict: 'worth_it' },
  ],
  conversions: [],
};

describe('toExportJson', () => {
  it('includes every table and the export time', () => {
    const parsed = JSON.parse(toExportJson(dump, new Date('2026-10-12T00:00:00Z')));
    expect(parsed.exportedAt).toBe('2026-10-12T00:00:00.000Z');
    expect(Object.keys(parsed.tables)).toEqual(['wage_profiles', 'expenses', 'conversions']);
    expect(parsed.tables.expenses).toHaveLength(2);
  });
});

describe('toExportCsv', () => {
  const csv = toExportCsv(dump);

  it('writes one section per table with a header row', () => {
    expect(csv).toContain('# wage_profiles\r\nid,real_wage_cached,currency\r\nwp-1,1344,USD');
    expect(csv).toContain('# expenses\r\nid,amount_minor,note,verdict');
  });

  it('quotes cells with commas or quotes and leaves nulls empty', () => {
    expect(csv).toContain('e-1,6400,"shoes, ""running""",\r\n');
    expect(csv).toContain('e-2,1400,,worth_it');
  });

  it('keeps empty tables as a bare section title', () => {
    expect(csv).toContain('# conversions\r\n');
  });
});

describe('deleteAllData', () => {
  it('wipes every user table', async () => {
    const store: UserDataStore = { dumpAll: vi.fn(), wipeAll: vi.fn().mockResolvedValue(undefined) };
    await deleteAllData(store);
    expect(store.wipeAll).toHaveBeenCalledOnce();
  });
});
