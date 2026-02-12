CREATE TABLE "conversation_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"summary" text NOT NULL,
	"key_points" json,
	"sentiment" text,
	"topics" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"file_upload_id" text,
	"attachment_type" text NOT NULL,
	"content" text NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversation_summary" ADD CONSTRAINT "conversation_summary_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_file_upload_id_file_upload_id_fk" FOREIGN KEY ("file_upload_id") REFERENCES "public"."file_upload"("id") ON DELETE set null ON UPDATE no action;