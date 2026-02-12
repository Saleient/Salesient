DROP TABLE "api_integration" CASCADE;--> statement-breakpoint
DROP TABLE "knowledge_base" CASCADE;--> statement-breakpoint
DROP TABLE "stream" CASCADE;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "sequence" integer NOT NULL;