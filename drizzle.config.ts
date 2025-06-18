/**
 * @file Drizzle Kit configuration file.
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config; 