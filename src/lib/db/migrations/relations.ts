import { relations } from "drizzle-orm/relations";
import { users, documents, songs } from "./schema";

export const documentsRelations = relations(documents, ({one, many}) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
	songs: many(songs),
}));

export const usersRelations = relations(users, ({many}) => ({
	documents: many(documents),
}));

export const songsRelations = relations(songs, ({one}) => ({
	document: one(documents, {
		fields: [songs.documentId],
		references: [documents.id]
	}),
}));