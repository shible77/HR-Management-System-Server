import { LeaveType } from "../types/types";
import { ApplicationStatus } from "../types/types";
import { z } from "zod";

export const leaveReqBody = z.object({
  leaveTypes: z.enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
});

export const leaveFilterSchema = z.object({
  departmentId: z.coerce.number().optional(),
  userId: z.string().optional(),
  leaveType: z
    .enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL])
    .optional(),
  status: z.enum([ApplicationStatus.PENDING, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED]).optional(),
  limit : z.coerce.number().min(1).max(100).optional().default(10),
  cursor : z.coerce.number().optional(),
});

export const updateLeaveSchema = z.object({
  leaveTypes: z.enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
  leaveId : z.coerce.number()
});

export const processLeaveSchema = z.object({
  status: z.enum([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED]),
  leaveId : z.coerce.number(),
});

export const deleteLeaveSchema= z.object({
  leaveId : z.coerce.number(),
})

export const getOnLeaveSchema = z.object({
  departmentId: z.coerce.number().optional(),
})