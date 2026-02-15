import { eq, and } from "drizzle-orm";
import { leaveApplications, employees } from "../db/schema";
import { LeaveFilter, UserFilter } from "../types/types";

export function applyLeaveFilters(condition: any[], filters: LeaveFilter) {
  if (filters.leaveType) {
    condition.push(eq(leaveApplications.leaveType, filters.leaveType));
  }
  if (filters.status) {
    condition.push(eq(leaveApplications.status, filters.status));
  }
  if (filters.departmentId) {
    condition.push(eq(employees.departmentId, filters.departmentId));
  }

  return condition;
}
