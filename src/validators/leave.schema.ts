import { LeaveType } from "../types/types";
import { ApplicationStatus } from "../types/types";
import { z } from "zod";

export const leaveReqBody = z.object({
  leaveTypes: z.enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL]).openapi({ example: "casual" }),
  startDate: z.string().openapi({ example: "2025-09-28" }),
  endDate: z.string().openapi({ example: "2025-09-31" }),
  reason: z.string().openapi({ example: "Wedding ceremony of my elder sister" }),
}).openapi({ description: "Apply for leave" });

export const leaveFilterSchema = z.object({
  departmentId: z.coerce.number().optional().openapi({ example: 2 }),
  userId: z.string().optional().openapi({ example: "hgg6eg-ywtuw7-uh87u" }),
  leaveType: z
    .enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL])
    .optional().openapi({ example: "casual" }),
  status: z.enum([ApplicationStatus.PENDING, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED]).optional().openapi({ example: "approved" }),
  limit: z.coerce.number().min(1).max(100).optional().default(10).openapi({ example: 10, description: "page size for pagination" }),
  cursor: z.coerce.number().optional().openapi({ example: 12, description: "leaveId for pagination" }),
}).openapi({ description: "Get filtered leave based on specific queries" });

export const updateLeaveSchema = z.object({
  leaveTypes: z.enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL]).openapi({ example: "casual" }),
  startDate: z.string().openapi({ example: "2025-09-28" }),
  endDate: z.string().openapi({ example: "2025-09-31" }),
  reason: z.string().openapi({ example: "Wedding ceremony of my elder sister" }),
  leaveId: z.coerce.number().openapi({ example: "12" }),
}).openapi({description : "update the leave record"});

export const processLeaveSchema = z.object({
  status: z.enum([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED]).openapi({example: "approved"}),
  leaveId: z.coerce.number().openapi({example : "12"}),
}).openapi({description : "Process a leave application."});

export const deleteLeaveSchema = z.object({
  leaveId: z.coerce.number().openapi({example : 12}),
}).openapi({description : "Delete a leave application"})

export const getOnLeaveSchema = z.object({
  departmentId: z.coerce.number().optional().openapi({example:5, description:"if no query pass this will return all the on leave employee of current day"}),
}).openapi({description : "Get the on leave employee for current day"})