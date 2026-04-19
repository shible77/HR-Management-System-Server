import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis";

let payrollQueue: Queue | null = null;

export function getPayrollQueue(): Queue {
  if (!payrollQueue) {
    payrollQueue = new Queue("payroll", {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }
  return payrollQueue;
}
