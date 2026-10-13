/** The async key-value API Supabase Auth uses for its session. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * expo-secure-store warns above ~2 KB per value on Android, and a Supabase session
 * (JWT + refresh token + user) can be larger. This splits a value into chunks under
 * `key.0`, `key.1`, … with the chunk count stored at `key`, so it all stays in secure storage.
 */
export function createChunkedStore(backend: KeyValueStore, chunkSize = 1800): KeyValueStore {
  const countOf = async (key: string) => {
    const n = Number(await backend.getItem(key));
    return Number.isInteger(n) && n > 0 ? n : 0;
  };
  const removeChunks = async (key: string, from: number, to: number) => {
    for (let i = from; i < to; i++) await backend.removeItem(`${key}.${i}`);
  };

  return {
    async getItem(key) {
      const count = await countOf(key);
      if (count === 0) return null;
      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        const part = await backend.getItem(`${key}.${i}`);
        if (part === null) return null; // a partial write; treat as signed out
        parts.push(part);
      }
      return parts.join('');
    },
    async setItem(key, value) {
      const old = await countOf(key);
      const count = Math.max(1, Math.ceil(value.length / chunkSize));
      for (let i = 0; i < count; i++) {
        await backend.setItem(`${key}.${i}`, value.slice(i * chunkSize, (i + 1) * chunkSize));
      }
      await backend.setItem(key, String(count));
      await removeChunks(key, count, old);
    },
    async removeItem(key) {
      const old = await countOf(key);
      await backend.removeItem(key);
      await removeChunks(key, 0, old);
    },
  };
}
