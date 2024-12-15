import { eq, and } from "drizzle-orm";
import { leaveApplications, employees } from "../db/schema";
import { LeaveFilter, UserFilter } from "../types";

export function applyLeaveFilters(query: any, filters: LeaveFilter) {
  const conditions: any[] = [];

  if (filters.userId) {
    conditions.push(eq(leaveApplications.userId, filters.userId));
  }
  if (filters.leaveType) {
    conditions.push(eq(leaveApplications.leaveType, filters.leaveType));
  }
  if (filters.status) {
    conditions.push(eq(leaveApplications.status, filters.status));
  }
  if (filters.departmentId) {
    conditions.push(eq(employees.departmentId, filters.departmentId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query;
}
