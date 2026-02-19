CREATE TABLE IF NOT EXISTS "calendar" (
	"date_id" serial PRIMARY KEY NOT NULL,
	"calendar_date" date NOT NULL,
	"is_weekend" boolean DEFAULT false NOT NULL,
	"is_holiday" boolean DEFAULT false NOT NULL,
	"holiday_name" text
);
--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "check_in_time" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "calendar_date_idx" ON "calendar" USING btree ("calendar_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendance_employee_idx" ON "attendance" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendance_date_idx" ON "attendance" USING btree ("attendance_date");