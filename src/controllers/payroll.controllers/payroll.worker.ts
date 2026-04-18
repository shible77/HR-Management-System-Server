import { Worker } from "bullmq";
import { redisConnection, redis } from "../../config/redis";
import { db } from "../../db/setup";
import { payroll } from "../../db/schema";

import {
  getEmployeeBatch,
  getAttendanceSummaryBatch,
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
    try {
      const requestedDate = new Date(payDate);
      if (Number.isNaN(requestedDate.getTime())) {
        throw new Error(`Invalid payDate "${payDate}"`);
      }

      const year = requestedDate.getUTCFullYear();
      const month = requestedDate.getUTCMonth();

      const monthStart = new Date(Date.UTC(year, month, 1));
      const nextMonthStart = new Date(Date.UTC(year, month + 1, 1));

      const formattedStartDate = monthStart.toISOString().split("T")[0];
      const formattedEndDateExclusive = nextMonthStart.toISOString().split("T")[0];
      const payMonth = formattedStartDate;

      const workingDays = await getWorkingDays(
        formattedStartDate,
        formattedEndDateExclusive
      );

      let cursor: string | null = null;
      const limit = 500;
      let processed = 0;

      while (true) {
        const employees = await getEmployeeBatch(cursor, limit);

        if (employees.length === 0) break;

        const attendanceSummaryByEmployee = await getAttendanceSummaryBatch(
          employees.map((emp) => emp.employeeId),
          formattedStartDate,
          formattedEndDateExclusive
        );

        const payrollRows: PayrollInsert[] = [];

        for (const emp of employees) {
          const attendance = attendanceSummaryByEmployee.get(emp.employeeId) ?? {
            presentDays: 0,
            leaveDays: 0,
          };

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
            payMonth,
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

        cursor = employees[employees.length - 1].userId;
        processed += employees.length;
        await job.updateProgress(processed);
      }

      console.log("Payroll completed");
    } finally {
      await redis.del(lockKey);
    }
  },
  {
    connection: redisConnection,
    concurrency: 20,
  }
);