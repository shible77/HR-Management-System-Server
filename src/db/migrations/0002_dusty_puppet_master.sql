ALTER TABLE "payroll" ALTER COLUMN "net_salary" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "base_salary" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "payroll" ADD COLUMN "gross_salary" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "payroll" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "payroll" DROP COLUMN IF EXISTS "base_salary";--> statement-breakpoint
ALTER TABLE "payroll" DROP COLUMN IF EXISTS "bonus";--> statement-breakpoint
ALTER TABLE "payroll" DROP COLUMN IF EXISTS "deductions";