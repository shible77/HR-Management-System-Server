ALTER TABLE "departments" RENAME COLUMN "manager_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "departments" DROP CONSTRAINT "departments_manager_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "user_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "user_id" SET DATA TYPE varchar(50);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "departments" ADD CONSTRAINT "departments_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
