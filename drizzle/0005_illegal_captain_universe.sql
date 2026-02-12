CREATE TABLE "mem0_memories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"chat_id" text,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"importance" integer DEFAULT 1,
	"tags" json,
	"embedding" json,
	"last_accessed" timestamp DEFAULT now() NOT NULL,
	"access_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mem0_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_type" text NOT NULL,
	"related_memory_id" text,
	"description" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mem0_memories" ADD CONSTRAINT "mem0_memories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mem0_memories" ADD CONSTRAINT "mem0_memories_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mem0_sessions" ADD CONSTRAINT "mem0_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mem0_sessions" ADD CONSTRAINT "mem0_sessions_related_memory_id_mem0_memories_id_fk" FOREIGN KEY ("related_memory_id") REFERENCES "public"."mem0_memories"("id") ON DELETE set null ON UPDATE no action;