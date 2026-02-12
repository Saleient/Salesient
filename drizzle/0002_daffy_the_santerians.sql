ALTER TABLE "chat" ALTER COLUMN "attachments" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "attachments" SET DEFAULT '[]'::json;