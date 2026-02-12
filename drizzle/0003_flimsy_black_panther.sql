CREATE TABLE "image_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_path" text NOT NULL,
	"embedding" json NOT NULL,
	"file_upload_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "text_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"embedding" json NOT NULL,
	"file_upload_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "image_embeddings" ADD CONSTRAINT "image_embeddings_file_upload_id_file_upload_id_fk" FOREIGN KEY ("file_upload_id") REFERENCES "public"."file_upload"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_embeddings" ADD CONSTRAINT "text_embeddings_file_upload_id_file_upload_id_fk" FOREIGN KEY ("file_upload_id") REFERENCES "public"."file_upload"("id") ON DELETE cascade ON UPDATE no action;