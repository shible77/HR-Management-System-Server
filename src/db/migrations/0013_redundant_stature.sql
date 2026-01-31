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
	"reviewer_id" varchar NOT NULL,
	"review_date" date NOT NULL,
	"score" integer NOT NULL,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "Attendance" RENAME TO "attendance";--> statement-breakpoint
ALTER TABLE "attendance" DROP CONSTRAINT "Attendance_employee_id_employees_employee_id_fk";
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
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_emp_month_idx" ON "payroll" USING btree ("employee_id","pay_month");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_employee_idx" ON "payroll" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "performance_emp_date_idx" ON "performance_reviews" USING btree ("employee_id","review_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "performance_reviewer_idx" ON "performance_reviews" USING btree ("reviewer_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_employees_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("employee_id") ON DELETE cascade ON UPDATE no action;
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
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");