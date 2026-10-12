import type { UserDataStore } from './ports/user-data.port';

/** Permanently remove every user record on the device (FR-12). */
export async function deleteAllData(store: UserDataStore): Promise<void> {
  await store.wipeAll();
}
