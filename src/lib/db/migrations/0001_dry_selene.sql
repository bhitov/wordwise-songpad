CREATE TABLE "songs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"mureka_task_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'preparing' NOT NULL,
	"song_url" text,
	"failed_reason" text,
	"prompt" text,
	"model" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;