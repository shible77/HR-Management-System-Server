import { z } from "zod";

export const startPayrollBodySchema = z
  .object({
    payDate: z
      .string()
      .trim()
      .min(1)
      .openapi({
        example: "2026-04-15",
        description:
          "Any parseable date; normalized to UTC YYYY-MM-DD. Payroll runs for the calendar month containing this date.",
      }),
  })
  .openapi({ description: "Queue a BullMQ job to compute and upsert payroll for that month" });
