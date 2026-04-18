import { payrollQueue } from "./payroll.queue";

export async function enqueuePayroll(payDate: string) {
  await payrollQueue.add(
    "run-payroll",
    { payDate },
    {
      jobId: `payroll-${payDate}`,
    }
  );
}