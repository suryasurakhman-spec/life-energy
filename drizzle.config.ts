import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/sqlite/drizzle/schema.ts',
  out:    './src/infrastructure/sqlite/drizzle/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
