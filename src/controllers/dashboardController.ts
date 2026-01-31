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
import { ApplicationStatus, Status } from "../types/types";

const getDashboardInfoSchema = z.object({
  departmentId: z.coerce.number().optional(),
});
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
      const activeEmployeesQuery = db
        .select()
        .from(users)
        .innerJoin(employees, eq(users.userId, employees.userId))
        .where(
          and(eq(employees.status, Status.ACTIVE), ne(users.role, Role.ADMIN))
        );
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
    if (req.role! === Role.MANAGER) {
      const userId = req.userID!;
      const departmentId = Number(
        getDashboardInfoSchema.parse(req.query).departmentId
      );
      const matchingManager = await db
        .select()
        .from(departments)
        .where(eq(departments.departmentId, departmentId));
      if (
        matchingManager.length < 1 ||
        matchingManager[0].managerId !== userId
      ) {
        return res.status(403).json({
          message: "You don't have permission to perform this action",
        });
      }
      const totalEmployeesInDeptQuery = db
        .select()
        .from(users)
        .innerJoin(employees, eq(users.userId, employees.userId))
        .where(
          and(
            eq(employees.departmentId, departmentId),
            eq(users.role, Role.EMPLOYEE)
          )
        );
      const totalEmployeesInDept = await db.$count(totalEmployeesInDeptQuery);
      const totalActiveEmployeesInDeptQuery = db
        .select()
        .from(users)
        .innerJoin(employees, eq(users.userId, employees.userId))
        .where(
          and(
            eq(employees.departmentId, departmentId),
            eq(users.role, Role.EMPLOYEE),
            eq(employees.status, Status.ACTIVE)
          )
        );
      const totalActiveEmployeesInDept = await db.$count(
        totalActiveEmployeesInDeptQuery
      );
      const totalAttendedEmployeesTodayQuery = db
        .select()
        .from(users)
        .innerJoin(employees, eq(users.userId, employees.userId))
        .leftJoin(attendance, eq(employees.employeeId, attendance.employeeId))
        .where(
          and(
            eq(attendance.attendanceDate, today),
            eq(employees.departmentId, departmentId)
          )
        );
      const totalAttendedEmployeesToday = await db.$count(
        totalAttendedEmployeesTodayQuery
      );
      const totalPendingLeaveRequestQuery = db
        .select()
        .from(users)
        .innerJoin(employees, eq(users.userId, employees.userId))
        .leftJoin(
          leaveApplications,
          eq(employees.userId, leaveApplications.userId)
        )
        .where(
          and(
            eq(leaveApplications.status, ApplicationStatus.PENDING),
            eq(employees.departmentId, departmentId),
            eq(users.role, Role.EMPLOYEE)
          )
        );
      const totalPendingLeaveRequest = await db.$count(
        totalPendingLeaveRequestQuery
      );

      const totalOnLeaveEmployeesTodayQuery = db
        .select()
        .from(users)
        .innerJoin(employees, eq(users.userId, employees.userId))
        .leftJoin(
          leaveApplications,
          eq(employees.userId, leaveApplications.userId)
        )
        .where(
          and(
            eq(leaveApplications.status, ApplicationStatus.APPROVED),
            eq(users.role, Role.EMPLOYEE),
            lte(leaveApplications.startDate, today),
            gte(leaveApplications.endDate, today),
            eq(employees.departmentId, departmentId)
          )
        );
      const totalOnLeaveEmployeesToday = await db.$count(
        totalOnLeaveEmployeesTodayQuery
      );

      return res.status(200).json({
        status: true,
        message: `Count of some fields for manager Dashboard of ${matchingManager[0].departmentName} fetched successfully`,
        departmentName: matchingManager[0].departmentName,
        totalEmployeesInDept,
        totalActiveEmployeesInDept,
        totalAttendedEmployeesToday,
        totalPendingLeaveRequest,
        totalOnLeaveEmployeesToday
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
