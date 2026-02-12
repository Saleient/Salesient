ALTER TABLE "chat" ADD COLUMN "attachments" json DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "input_tokens" integer;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "output_tokens" integer;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "total_tokens" integer;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "completion_time" real;--> statement-breakpoint
ALTER TABLE "chat" DROP COLUMN "visibility";