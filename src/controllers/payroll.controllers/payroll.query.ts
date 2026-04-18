import { db } from "../../db/setup";
import { employees, attendance, calendar, users } from "../../db/schema";
import { eq, gt, and, gte, lt, sql, inArray } from "drizzle-orm";
import { EmployeeBatch, AttendanceSummary } from "./payroll.types";

export async function getEmployeeBatch(cursor: string | null, limit: number): Promise<EmployeeBatch[]> {
  return db
    .select({
      userId: users.userId,
      employeeId: employees.employeeId,
      baseSalary: employees.baseSalary,
    })
    .from(users)
    .innerJoin(employees, eq(users.userId, employees.userId))
    .where(cursor ? gt(users.userId, cursor) : undefined)
    .limit(limit);
}

export async function getAttendanceSummary(
  employeeId: number,
  startDate: string,
  endDateExclusive: string
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
        lt(attendance.attendanceDate, endDateExclusive)
      )
    );

  const row = result[0];
  if (!row) return { presentDays: 0, leaveDays: 0 };
  return {
    presentDays: Number(row.presentDays ?? 0),
    leaveDays: Number(row.leaveDays ?? 0),
  };
}

export async function getAttendanceSummaryBatch(
  employeeIds: number[],
  startDate: string,
  endDateExclusive: string
): Promise<Map<number, AttendanceSummary>> {
  if (employeeIds.length === 0) {
    return new Map<number, AttendanceSummary>();
  }

  const rows = await db
    .select({
      employeeId: attendance.employeeId,
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
        inArray(attendance.employeeId, employeeIds),
        gte(attendance.attendanceDate, startDate),
        lt(attendance.attendanceDate, endDateExclusive)
      )
    )
    .groupBy(attendance.employeeId);

  const summaryMap = new Map<number, AttendanceSummary>();
  for (const row of rows) {
    summaryMap.set(row.employeeId, {
      presentDays: Number(row.presentDays ?? 0),
      leaveDays: Number(row.leaveDays ?? 0),
    });
  }

  return summaryMap;
}

export async function getWorkingDays(
  startDate: string,
  endDateExclusive: string
): Promise<number> {
  const result = await db
    .select({
      days: sql<number>`COUNT(*)`,
    })
    .from(calendar)
    .where(
      and(
        gte(calendar.calendarDate, startDate),
        lt(calendar.calendarDate, endDateExclusive),
        eq(calendar.isWeekend, false),
        eq(calendar.isHoliday, false)
      )
    );

  return Number(result[0]?.days ?? 0);
}