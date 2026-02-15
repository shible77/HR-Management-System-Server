import { z } from 'zod';

export const departmentReqBody = z.object({
  departmentName: z.string().max(50),
  description: z.string(),
});

export const assignManagerReqBody = z.object({
  userId: z.string().max(50),
});

export const assignEmployeeReqBody = z.object({
  departmentId : z.number()
});