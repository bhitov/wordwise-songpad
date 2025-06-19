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

/**
 * The `songs` table for storing generated songs and their status.
 *
 * @see https://orm.drizzle.team/docs/sql-schema-declaration#songs
 */
export const songs = pgTable('songs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  documentId: varchar('document_id', { length: 255 })
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  murekaTaskId: varchar('mureka_task_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('preparing'),
  songUrl: text('song_url'),
  failedReason: text('failed_reason'),
  prompt: text('prompt'),
  model: varchar('model', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 