ALTER TABLE "conversation_summary" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "image_embeddings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mem0_memories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mem0_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "message_attachment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "nango_integrations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "text_embeddings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "conversation_summary" CASCADE;--> statement-breakpoint
DROP TABLE "image_embeddings" CASCADE;--> statement-breakpoint
DROP TABLE "mem0_memories" CASCADE;--> statement-breakpoint
DROP TABLE "mem0_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "message_attachment" CASCADE;--> statement-breakpoint
DROP TABLE "nango_integrations" CASCADE;--> statement-breakpoint
DROP TABLE "text_embeddings" CASCADE;--> statement-breakpoint
ALTER TABLE "chat" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "chat" DROP CONSTRAINT "chat_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;