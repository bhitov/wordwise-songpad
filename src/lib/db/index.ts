/**
 * @file Database connection and client configuration.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection
const connection = postgres(process.env.DATABASE_URL);

// Create and export the database client
export const db = drizzle(connection, { schema }); 