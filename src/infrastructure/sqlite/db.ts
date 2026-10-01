import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './drizzle/schema';

const sqlite = SQLite.openDatabaseSync('life-energy.db');
export const db = drizzle(sqlite, { schema });
