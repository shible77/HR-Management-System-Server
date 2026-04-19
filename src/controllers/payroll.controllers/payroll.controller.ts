import { Response } from "express";
import { z } from "zod";
import { SessionRequest } from "../../middlewares/verifySession";
import { validate } from "../../utils/validate";
import { getPayrollQueue } from "./payroll.queue";
import { enqueuePayroll } from "./payroll.service";

const blockingJobStates = new Set([
  "waiting",
  "waiting-children",
  "delayed",
  "paused",
  "active",
]);

const startPayrollSchema = z.object({
  payDate: z.string().trim().min(1, "payDate is required"),
});

function normalizePayDateUtc(payDate: string): string {
  const requestedDate = new Date(payDate);
  if (Number.isNaN(requestedDate.getTime())) {
    throw new Error("INVALID_PAY_DATE");
  }
  return requestedDate.toISOString().split("T")[0]!;
}

function isRedisUnreachable(error: unknown): boolean {
  let current: unknown = error;
  for (let i = 0; i < 5 && current; i++) {
    const code = (current as NodeJS.ErrnoException)?.code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

export const startPayroll = async (req: SessionRequest, res: Response) => {
  try {
    const { payDate: rawPayDate } = validate(startPayrollSchema, req.body);
    const payDate = normalizePayDateUtc(rawPayDate);

    const jobId = `payroll-${payDate}`;
    const existing = await getPayrollQueue().getJob(jobId);
    if (existing) {
      const state = await existing.getState();
      if (blockingJobStates.has(state)) {
        return res.status(409).json({
          status: false,
          message: "A payroll job for this month is already queued or running",
        });
      }
    }

    await enqueuePayroll(payDate);

    return res.status(202).json({
      status: true,
      message: "Payroll run has been queued",
      jobId,
      jobName: "run-payroll",
      payDate,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INVALID_PAY_DATE") {
      return res.status(400).json({
        status: false,
        message: "Invalid payDate; use an ISO date or YYYY-MM-DD string",
      });
    }

    if (isRedisUnreachable(error)) {
      return res.status(503).json({
        status: false,
        message:
          "Redis is not reachable. Start Redis on REDIS_HOST:REDIS_PORT (default 127.0.0.1:6379), for example: docker compose up -d",
      });
    }

    throw error;
  }
};
