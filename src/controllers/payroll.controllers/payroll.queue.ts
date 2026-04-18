import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis";

export const payrollQueue = new Queue("payroll", {
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