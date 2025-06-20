ALTER TABLE "documents" ADD COLUMN "song_genre" varchar(50) DEFAULT 'rap' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "song_description" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "content_html";