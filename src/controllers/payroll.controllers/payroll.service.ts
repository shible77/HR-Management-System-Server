import { getPayrollQueue } from "./payroll.queue";

export async function enqueuePayroll(payDate: string) {
  await getPayrollQueue().add(
    "run-payroll",
    { payDate },
    {
      jobId: `payroll-${payDate}`,
    }
  );
}