import { Worker } from "bullmq";
import { redisConnection, redis } from "../../config/redis";
import { db } from "../../db/setup";
import { payroll } from "../../db/schema";

import {
  getEmployeeBatch,
  getAttendanceSummary,
  getWorkingDays,
} from "./payroll.query";

import { calculatePayroll } from "./payroll.calculator";

import { PayrollInsert } from "./payroll.types";
import { sql } from "drizzle-orm";

new Worker(
  "payroll",
  async (job) => {
    const { payDate } = job.data;

    console.log("Starting payroll for:", payDate);

    const lockKey = `payroll-lock-${payDate}`;
    const lock = await redis.set(lockKey, "locked", "EX", 3600, "NX");

    if (!lock) {
      console.log("Payroll already running");
      return;
    }

    const requestedDate = new Date(payDate)

    const year = requestedDate.getUTCFullYear();
    const month = requestedDate.getUTCMonth();

    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 1));

    const formattedStartDate = start.toISOString().split("T")[0];
    const formattedEndDate = end.toISOString().split("T")[0];
    const PayMonth = new Date(Date.UTC(year, month + 1, 0));

    const workingDays = await getWorkingDays(formattedStartDate, formattedEndDate);

    let cursor = 0;
    const limit = 500;
    let processed = 0;

    while (true) {
      const employees = await getEmployeeBatch(cursor, limit);

      if (employees.length === 0) break;

      const payrollRows: PayrollInsert[] = [];

      for (const emp of employees) {
        const attendance = await getAttendanceSummary(
          emp.employeeId,
          formattedStartDate,
          formattedEndDate
        );

        const salary = calculatePayroll(
          Number(emp.baseSalary || 0),
          workingDays,
          attendance.presentDays,
          attendance.leaveDays
        );

        payrollRows.push({
          employeeId: emp.employeeId,
          grossSalary: salary.grossSalary,
          netSalary: salary.netSalary,
          payMonth: PayMonth.toISOString().split("T")[0],
        });
      }

      await db
        .insert(payroll)
        .values(payrollRows)
        .onConflictDoUpdate({
          target: [payroll.employeeId, payroll.payMonth],
          set: {
            grossSalary: sql`excluded.gross_salary`,
            netSalary: sql`excluded.net_salary`,
            updatedAt: new Date(),
          },
        });

      cursor = employees[employees.length - 1].employeeId;

      processed += employees.length;

      await job.updateProgress(processed);
    }

    console.log("Payroll completed");
  },
  {
    connection: redisConnection,
    concurrency: 20,
  }
);