/**
 * @file Drizzle schema for the database.
 * @see https://orm.drizzle.team/docs/sql-schema-declaration
 */

import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * The `users` table.
 *
 * @see https://orm.drizzle.team/docs/sql-schema-declaration#users
 */
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * The `documents` table.
 *
 * @see https://orm.drizzle.team/docs/sql-schema-declaration#documents
 */
export const documents = pgTable('documents', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 