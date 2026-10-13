import { describe, expect, it } from 'vitest';
import { createChunkedStore, type KeyValueStore } from './chunked-store';

function memory() {
  const data = new Map<string, string>();
  const backend: KeyValueStore = {
    getItem: async (k) => data.get(k) ?? null,
    setItem: async (k, v) => { data.set(k, v); },
    removeItem: async (k) => { data.delete(k); },
  };
  return { data, backend };
}

describe('createChunkedStore', () => {
  it('round-trips a value larger than one chunk, every chunk under the limit', async () => {
    const { data, backend } = memory();
    const store = createChunkedStore(backend, 10);
    const value = 'x'.repeat(25);
    await store.setItem('session', value);
    expect(await store.getItem('session')).toBe(value);
    expect(data.get('session')).toBe('3');
    for (const [k, v] of data) if (k !== 'session') expect(v.length).toBeLessThanOrEqual(10);
  });

  it('stores an empty string as one empty chunk', async () => {
    const store = createChunkedStore(memory().backend, 10);
    await store.setItem('k', '');
    expect(await store.getItem('k')).toBe('');
  });

  it('drops leftover chunks when a value shrinks', async () => {
    const { data, backend } = memory();
    const store = createChunkedStore(backend, 10);
    await store.setItem('k', 'a'.repeat(30));
    await store.setItem('k', 'b'.repeat(5));
    expect(await store.getItem('k')).toBe('bbbbb');
    expect([...data.keys()].sort()).toEqual(['k', 'k.0']);
  });

  it('removes the value and all its chunks', async () => {
    const { data, backend } = memory();
    const store = createChunkedStore(backend, 10);
    await store.setItem('k', 'a'.repeat(30));
    await store.removeItem('k');
    expect(await store.getItem('k')).toBeNull();
    expect(data.size).toBe(0);
  });

  it('reads a missing or damaged value as signed out', async () => {
    const { data, backend } = memory();
    const store = createChunkedStore(backend, 10);
    expect(await store.getItem('none')).toBeNull();
    data.set('k', '2');
    data.set('k.0', 'half');
    expect(await store.getItem('k')).toBeNull();
    data.set('j', 'garbage');
    expect(await store.getItem('j')).toBeNull();
  });
});
