import { PermissionRequest, Role } from "./../middlewares/checkPermission";
import { Response } from "express";
import { db } from "../db/setup";
import {
  employees,
  users,
  departments,
  leaveApplications,
  attendance,
} from "../db/schema";
import { eq, and, sql, ne, lte, gte } from "drizzle-orm";
import { handleError } from "../utils/handleError";
import { z } from "zod";
import { ApplicationStatus, Status } from "../types";
export const getDashboardInfo = async (
  req: PermissionRequest,
  res: Response
) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    if (req.role! === Role.ADMIN) {
      const totalUsers = await db.$count(users);
      const totalDepartments = await db.$count(departments);
      const totalEmployees = await db.$count(users, ne(users.role, Role.ADMIN));
      const  activeEmployeesQuery = db.select().from(users).innerJoin(employees, eq(users.userId, employees.userId)).where(and(eq(employees.status, Status.ACTIVE), ne(users.role, Role.ADMIN)));
      const activeEmployees = await db.$count(activeEmployeesQuery);
      const attendanceQuery = db
        .select()
        .from(attendance)
        .where(eq(attendance.attendanceDate, today));
      const totalAttendedEmployeesToday = await db.$count(attendanceQuery);
      const totalPendingLeaveRequest = await db.$count(
        leaveApplications,
        eq(leaveApplications.status, ApplicationStatus.PENDING)
      );

      const totalOnLeaveEmployeesTodayQuery = db
        .select()
        .from(leaveApplications)
        .where(
          and(
            eq(leaveApplications.status, ApplicationStatus.APPROVED),
            lte(leaveApplications.startDate, today),
            gte(leaveApplications.endDate, today)
          )
        );
      const totalOnLeaveEmployeesToday = await db.$count(
        totalOnLeaveEmployeesTodayQuery
      );
      return res.status(200).json({
        status: true,
        message: "Count of some fields for Dashboard fetched successfully",
        totalUsers,
        totalDepartments,
        totalEmployees,
        activeEmployees,
        totalAttendedEmployeesToday,
        totalPendingLeaveRequest,
        totalOnLeaveEmployeesToday,
      });
    }
    return res.status(403).json({
      status: false,
      message: "You don't have permission to perform this action",
    });
  } catch (error) {
    handleError(error, res);
  }
};
