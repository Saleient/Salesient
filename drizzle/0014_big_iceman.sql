CREATE TABLE "user_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"system_preferences" json DEFAULT '{"customSystemPrompt":""}'::json,
	"prompts" json DEFAULT '[]'::json NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"metadata" json DEFAULT '{"fileCount":0,"folderCount":0,"chatCount":0,"hasIntegrations":false}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "system_preferences";