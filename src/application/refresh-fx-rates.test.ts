import { describe, expect, it, vi } from 'vitest';
import { FX_REFRESH_MS, refreshFxRates, type FxRateStore } from './refresh-fx-rates';
import type { FxRate } from '@/domain/fx/fx';

const XML = `<Cube time='2026-10-12'><Cube currency='USD' rate='1.1181'/></Cube>`;
const NOW = new Date('2026-10-13T09:00:00Z');

function fakeStore(last: Date | null) {
  const saved: FxRate[][] = [];
  const store: FxRateStore = {
    lastUpdated: async () => last,
    upsertRates: async (rates) => { saved.push(rates); },
  };
  return { store, saved };
}

describe('refreshFxRates', () => {
  it('fetches and saves every pair when nothing is cached', async () => {
    const { store, saved } = fakeStore(null);
    expect(await refreshFxRates(store, async () => XML, NOW)).toBe(true);
    expect(saved[0]).toHaveLength(2); // USD→EUR and EUR→USD
  });

  it('skips the network while the cache is fresh', async () => {
    const { store, saved } = fakeStore(new Date(NOW.getTime() - FX_REFRESH_MS + 1000));
    const fetchDaily = vi.fn(async () => XML);
    expect(await refreshFxRates(store, fetchDaily, NOW)).toBe(false);
    expect(fetchDaily).not.toHaveBeenCalled();
    expect(saved).toHaveLength(0);
  });

  it('refreshes a stale cache', async () => {
    const { store, saved } = fakeStore(new Date(NOW.getTime() - FX_REFRESH_MS - 1000));
    expect(await refreshFxRates(store, async () => XML, NOW)).toBe(true);
    expect(saved).toHaveLength(1);
  });

  it('keeps the old rates when offline or the file is bad', async () => {
    const { store, saved } = fakeStore(null);
    expect(await refreshFxRates(store, async () => null, NOW)).toBe(false);
    expect(await refreshFxRates(store, async () => '<html/>', NOW)).toBe(false);
    expect(saved).toHaveLength(0);
  });
});
