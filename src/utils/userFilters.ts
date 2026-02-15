import { eq, and, gt } from "drizzle-orm";
import { employees, users } from "../db/schema";
import { UserFilter } from "../types/types";

export function applyUserFilters(query: any, filters: UserFilter) {
  const conditions: any[] = [];
  if (filters.departmentId) {
    conditions.push(eq(employees.departmentId, filters.departmentId));
  }
  if (filters.designation) {
    conditions.push(eq(employees.designation, filters.designation));
  }
  if (filters.hireDate) {
    conditions.push(eq(employees.hireDate, filters.hireDate));
  }
  if (filters.status) {
    conditions.push(eq(employees.status, filters.status));
  }
  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }

 
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query;
}
