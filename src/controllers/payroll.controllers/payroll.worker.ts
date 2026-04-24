import { Worker } from "bullmq";
import { bullMQConnectionOptions, redis } from "../../config/redis";
import { db } from "../../db/setup";
import { payroll } from "../../db/schema";
import { sql } from "drizzle-orm";

import {
  getEmployeeBatch,
  getAttendanceSummaryBatch,
  getWorkingDays,
} from "./payroll.query";
import { calculatePayroll } from "./payroll.calculator";
import { PayrollInsert } from "./payroll.types";

redis.connect().catch((err: Error) => {
  console.error("[Payroll Worker] Failed to connect Redis lock client:", err.message);
  process.exit(1);
});

const worker = new Worker(
  "payroll",
  async (job) => {
    const { payDate } = job.data as { payDate: string };
    console.log(`[Payroll Worker] Starting payroll for: ${payDate}`);

    const lockKey = `payroll-lock-${payDate}`;

    // Acquire a 1-hour distributed lock. NX = only set if not exists.
    const lockAcquired = await redis.set(lockKey, "locked", "EX", 3600, "NX");

    if (!lockAcquired) {
      console.log(`[Payroll Worker] Lock already held for ${payDate} — skipping.`);
      return;
    }

    // Only release the lock if THIS process acquired it.
    try {
      const requestedDate = new Date(payDate);
      if (Number.isNaN(requestedDate.getTime())) {
        throw new Error(`Invalid payDate "${payDate}"`);
      }

      const year = requestedDate.getUTCFullYear();
      const month = requestedDate.getUTCMonth();

      const monthStart = new Date(Date.UTC(year, month, 1));
      const nextMonthStart = new Date(Date.UTC(year, month + 1, 1));

      const formattedStartDate = monthStart.toISOString().split("T")[0]!;
      const formattedEndDateExclusive = nextMonthStart.toISOString().split("T")[0]!;
      const payMonth = formattedStartDate;

      const workingDays = await getWorkingDays(
        formattedStartDate,
        formattedEndDateExclusive
      );

      if (workingDays === 0) {
        console.warn(
          `[Payroll Worker] No working days found for ${payDate}. ` +
          `Ensure the calendar table is populated via POST /api/generateCalenderYear.`
        );
      }

      let cursor: string | null = null;
      const batchSize = 500;
      let totalProcessed = 0;

      // Count total employees for meaningful progress reporting.
      // We approximate: first batch tells us if there are employees at all.
      while (true) {
        const employees = await getEmployeeBatch(cursor, batchSize);
        if (employees.length === 0) break;

        const summaryMap = await getAttendanceSummaryBatch(
          employees.map((e) => e.employeeId),
          formattedStartDate,
          formattedEndDateExclusive
        );

        const payrollRows: PayrollInsert[] = employees.map((emp) => {
          const attendance = summaryMap.get(emp.employeeId) ?? {
            presentDays: 0,
            leaveDays: 0,
          };

          const { grossSalary, netSalary } = calculatePayroll(
            Number(emp.baseSalary ?? 0),
            workingDays,
            attendance.presentDays,
            attendance.leaveDays
          );

          return {
            employeeId: emp.employeeId,
            grossSalary,
            netSalary,
            payMonth,
          };
        });

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

        cursor = employees[employees.length - 1]!.userId;
        totalProcessed += employees.length;

        // BullMQ progress expects a value in [0, 100].
        // We can't know the total upfront without an extra COUNT query,
        // so we report the raw count and let monitoring tools interpret it.
        await job.updateProgress(totalProcessed);
        console.log(`[Payroll Worker] Processed ${totalProcessed} employees so far...`);
      }

      console.log(`[Payroll Worker] Completed payroll for ${payDate}. Total: ${totalProcessed} employees.`);
    } finally {
      // Always release the lock this process acquired.
      await redis.del(lockKey);
    }
  },
  {
    connection: bullMQConnectionOptions,
    concurrency: 1, // One payroll run at a time per worker process is safer.
  }
);

worker.on("completed", (job) => {
  console.log(`[Payroll Worker] Job ${job.id} completed.`);
});

worker.on("failed", (job, err) => {
  console.error(`[Payroll Worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[Payroll Worker] Worker error:", err.message);
});

// Graceful shutdown on SIGTERM / SIGINT (Docker stop, Ctrl-C, PM2 restart).
async function shutdown() {
  console.log("[Payroll Worker] Shutting down gracefully...");
  await worker.close();
  await redis.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);