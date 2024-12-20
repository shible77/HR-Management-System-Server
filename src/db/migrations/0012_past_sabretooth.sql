CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"token_id" serial PRIMARY KEY NOT NULL,
	"token" varchar(50) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
