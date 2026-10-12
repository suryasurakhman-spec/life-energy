/** One plain row per record, as stored. */
export type DataRow = Record<string, string | number | boolean | null>;

/** Every user table, by table name (shared reference data such as FX rates excluded). */
export type UserDataDump = Record<string, DataRow[]>;

export interface UserDataStore {
  /** Read every row of every user table. */
  dumpAll(): Promise<UserDataDump>;
  /** Permanently remove every row of every user table. */
  wipeAll(): Promise<void>;
}
