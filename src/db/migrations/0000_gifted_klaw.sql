CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."Attendance_status_enum" AS ENUM('Present', 'Absent', 'Leave');--> statement-breakpoint
CREATE TYPE "public"."leave_types" AS ENUM('casual', 'medical', 'annual');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'manager', 'employee');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "addresses" (
	"address_id" serial PRIMARY KEY NOT NULL,
	"division" varchar(50) NOT NULL,
	"district" varchar(50) NOT NULL,
	"thana" varchar(50) NOT NULL,
	"post_code" varchar(10) NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendance" (
	"attendance_id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"attendance_date" date NOT NULL,
	"check_in_time" time,
	"check_out_time" time,
	"status" "Attendance_status_enum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "departments" (
	"department_id" serial PRIMARY KEY NOT NULL,
	"department_name" varchar(50) NOT NULL,
	"manager_id" uuid,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"employee_id" integer PRIMARY KEY NOT NULL,
	"designation" varchar(50),
	"hire_date" date,
	"status" "status" DEFAULT 'active' NOT NULL,
	"user_id" uuid NOT NULL,
	"department_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_applications" (
	"leave_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"leave_type" "leave_types" NOT NULL,
	"start_date" date,
	"end_date" date,
	"total_days" integer,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"applied_at" timestamp DEFAULT now(),
	"approved_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"token_id" serial PRIMARY KEY NOT NULL,
	"token" varchar(50) NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll" (
	"payroll_id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"base_salary" integer NOT NULL,
	"bonus" integer DEFAULT 0,
	"deductions" integer DEFAULT 0,
	"net_salary" integer NOT NULL,
	"pay_month" date NOT NULL,
	"paid_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "performance_reviews" (
	"review_id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"review_date" date NOT NULL,
	"score" integer NOT NULL,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"phone" varchar(11),
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"role" "role" NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_employees_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("employee_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "departments" ADD CONSTRAINT "departments_manager_id_users_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_employees_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("employee_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_employees_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("employee_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_users_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "addresses_user_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_emp_date_idx" ON "attendance" USING btree ("employee_id","attendance_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendance_status_idx" ON "attendance" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "departments_manager_idx" ON "departments" USING btree ("manager_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "departments_name_idx" ON "departments" USING btree ("department_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "employees_user_id_idx" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "employees_department_idx" ON "employees" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "employees_status_idx" ON "employees" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_user_idx" ON "leave_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_status_idx" ON "leave_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_approved_by_idx" ON "leave_applications" USING btree ("approved_by");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_emp_month_idx" ON "payroll" USING btree ("employee_id","pay_month");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_employee_idx" ON "payroll" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "performance_emp_date_idx" ON "performance_reviews" USING btree ("employee_id","review_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "performance_reviewer_idx" ON "performance_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_id_idx" ON "users" USING btree ("role","user_id");