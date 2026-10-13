import type { UserDataStore } from './ports/user-data.port';

/** The signed-in account, when there is one. */
export interface AccountService {
  /** Delete the account on the server. Needs a connection. */
  deleteAccount(): Promise<void>;
  /** Forget the session on this phone. */
  signOut(): Promise<void>;
}

/**
 * Permanently remove every user record on the device, and the account when signed in (FR-12).
 * The account goes first: it is the step that can fail (no connection), and failing there
 * leaves everything as it was, so the user can simply try again.
 */
export async function deleteAllData(store: UserDataStore, account?: AccountService): Promise<void> {
  if (account) await account.deleteAccount();
  await store.wipeAll();
  // Last, because signing out sends the user to the sign-in screen.
  if (account) await account.signOut();
}
