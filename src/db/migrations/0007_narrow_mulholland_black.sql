CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."leave_types" AS ENUM('casual', 'medical', 'annual');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_applications" (
	"leave_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"leave_type" "leave_types" NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"applied_at" timestamp DEFAULT now(),
	"approved_by" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_approved_by_users_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
