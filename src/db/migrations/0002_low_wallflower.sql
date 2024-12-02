ALTER TABLE "departments" RENAME COLUMN "user_id" TO "manager_id";--> statement-breakpoint
ALTER TABLE "departments" DROP CONSTRAINT "departments_user_id_users_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "departments" ADD CONSTRAINT "departments_manager_id_users_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
