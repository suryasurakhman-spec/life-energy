import { db } from './db';
import {
  wageProfiles,
  expenses,
  categories,
  monthlyReviews,
  incomes,
  capitalSnapshots,
  conversions,
} from './drizzle/schema';
import type { UserDataStore, UserDataDump, DataRow } from '@/application/ports/user-data.port';

// User tables only. fx_rates is shared, read-only reference data and stays.
const USER_TABLES = {
  wage_profiles:     wageProfiles,
  expenses:          expenses,
  categories:        categories,
  monthly_reviews:   monthlyReviews,
  incomes:           incomes,
  capital_snapshots: capitalSnapshots,
  conversions:       conversions,
} as const;

export class SqliteUserDataStore implements UserDataStore {
  async dumpAll(): Promise<UserDataDump> {
    const dump: UserDataDump = {};
    for (const [name, table] of Object.entries(USER_TABLES)) {
      dump[name] = (await db.select().from(table)) as DataRow[];
    }
    return dump;
  }

  async wipeAll(): Promise<void> {
    // Expenses reference wage profiles and categories, so they go first.
    await db.transaction(async tx => {
      await tx.delete(expenses);
      await tx.delete(conversions);
      await tx.delete(monthlyReviews);
      await tx.delete(incomes);
      await tx.delete(capitalSnapshots);
      await tx.delete(categories);
      await tx.delete(wageProfiles);
    });
  }
}
