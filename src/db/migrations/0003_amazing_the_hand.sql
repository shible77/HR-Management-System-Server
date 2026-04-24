DROP INDEX IF EXISTS "calendar_date_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "calendar_date_unique" ON "calendar" USING btree ("calendar_date");