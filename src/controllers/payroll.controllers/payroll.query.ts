import { db } from "../../db/setup";
import { employees, attendance, calendar } from "../../db/schema";
import { eq, gt, and, gte, lte, sql } from "drizzle-orm";
import { EmployeeBatch, AttendanceSummary } from "./payroll.types";

export async function getEmployeeBatch(cursor: number, limit: number): Promise<EmployeeBatch[]> {
  return db
    .select({
      employeeId: employees.employeeId,
      baseSalary: employees.baseSalary,
    })
    .from(employees)
    .where(gt(employees.employeeId, cursor))
    .limit(limit);
}

export async function getAttendanceSummary(
  employeeId: number,
  startDate: string,
  endDate: string
): Promise<AttendanceSummary> {
  const result = await db
    .select({
      presentDays: sql<number>`
        COUNT(*) FILTER (WHERE ${attendance.status} = 'Present')
      `,
      leaveDays: sql<number>`
        COUNT(*) FILTER (WHERE ${attendance.status} = 'Leave')
      `,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.employeeId, employeeId),
        gte(attendance.attendanceDate, startDate),
        lte(attendance.attendanceDate, endDate)
      )
    );

  const row = result[0];
  if (!row) return { presentDays: 0, leaveDays: 0 };
  return {
    presentDays: Number(row.presentDays ?? 0),
    leaveDays: Number(row.leaveDays ?? 0),
  };
}

export async function getWorkingDays(
  startDate: string,
  endDate: string
): Promise<number> {
  const result = await db
    .select({
      days: sql<number>`COUNT(*)`,
    })
    .from(calendar)
    .where(
      and(
        gte(calendar.calendarDate, startDate),
        lte(calendar.calendarDate, endDate),
        eq(calendar.isWeekend, false),
        eq(calendar.isHoliday, false)
      )
    );

  return result[0].days;
}