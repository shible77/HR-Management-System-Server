CREATE TYPE "public"."Attendance_status_enum" AS ENUM('Present', 'Absent', 'Leave');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Attendance" (
	"attendance_id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"attendance_date" date NOT NULL,
	"check_in_time" time,
	"check_out_time" time,
	"status" "Attendance_status_enum" NOT NULL
);
