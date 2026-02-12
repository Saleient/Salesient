CREATE TABLE "document_chunk" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768) NOT NULL,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_chunk" ADD CONSTRAINT "document_chunk_file_id_file_upload_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_upload"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunk" ADD CONSTRAINT "document_chunk_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_chunk_user_id_idx" ON "document_chunk" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_chunk_file_id_idx" ON "document_chunk" USING btree ("file_id");--> statement-breakpoint
ALTER TABLE "file_upload" DROP COLUMN "embedding";