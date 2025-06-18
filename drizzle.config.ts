/**
 * @file Drizzle Kit configuration file.
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */

import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load environment variables from .env.local
config({ path: '.env.local' });

console.log('jksdfjsdkfjds');
console.log(process.env.DATABASE_URL);

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config; 