import { pgTable, unique, varchar, text, timestamp, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const documents = pgTable("documents", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	title: text().notNull(),
	content: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	contentHtml: text("content_html"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "documents_user_id_users_id_fk"
		}),
]);

export const songs = pgTable("songs", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	documentId: varchar("document_id", { length: 255 }).notNull(),
	murekaTaskId: varchar("mureka_task_id", { length: 255 }).notNull(),
	status: varchar({ length: 50 }).default('preparing').notNull(),
	songUrl: text("song_url"),
	failedReason: text("failed_reason"),
	prompt: text(),
	model: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "songs_document_id_documents_id_fk"
		}).onDelete("cascade"),
]);
