import { eq, and } from "drizzle-orm";
import { users, employees } from "../db/schema";
import { oneUserFilterType } from "../types/types";

export function applyOneUserFilters(query: any, filters: oneUserFilterType) {
    const conditions: any[] = [];
    if (filters.uid) {
        conditions.push(eq(users.userId, filters.uid));
    }
    if (filters.eid) {
        conditions.push(eq(employees.employeeId, filters.eid));
    }
    if (filters.username) {
        conditions.push(eq(users.username, filters.username));
    }
    if (filters.phone) {
        conditions.push(eq(users.phone, filters.phone));
    }
    if (filters.email) {
        conditions.push(eq(users.email, filters.email));
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    return query;
}
