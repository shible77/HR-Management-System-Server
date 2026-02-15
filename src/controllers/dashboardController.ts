import { SessionRequest } from "../middlewares/verifySession";
import { Response } from "express";
import { db } from "../db/setup";
import { departments } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { validate } from "../utils/validate";
import { getManagerDashboardInfoSchema } from "../validators/dashboard.schema";

export interface userStatesType {
  totalUsers: number;
  totalEmployees: number;
  activeEmployees: number;
}

export interface attendanceStatsType {
  totalAttendedToday: number;
  totalPendingLeave: number;
  totalOnLeaveToday: number;
}

export const getAdminDashboardInfo = async (req: SessionRequest, res: Response) => {
  try {

    const userStats: userStatesType = await db.execute(sql`
    SELECT
      COUNT(*)                                   AS "totalUsers",
      COUNT(*) FILTER (WHERE u.role != 'admin') AS "totalEmployees",
      COUNT(*) FILTER (
        WHERE e.status = 'active' 
          AND u.role != 'admin'
      )                                          AS "activeEmployees"
    FROM users u
    JOIN employees e ON u.user_id = e.user_id
  `) as any;

    const attendanceStats: attendanceStatsType = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (
        WHERE a.attendance_date = CURRENT_DATE
      ) AS "totalAttendedToday",

      COUNT(*) FILTER (
        WHERE la.status = 'pending'
      ) AS "totalPendingLeave",

      COUNT(*) FILTER (
        WHERE la.status = 'approved'
          AND CURRENT_DATE BETWEEN la.start_date AND la.end_date
      ) AS "totalOnLeaveToday"
    FROM leave_applications la
    LEFT JOIN attendance a ON a.employee_id = la.employee_id
  `) as any;

    return res.status(200).json({
      status: true,
      message: "Count of some fields for Dashboard fetched successfully",
      data: {
        userStats: userStats.totalUsers,
        totalEmployees: userStats.totalEmployees,
        activeEmployees: userStats.activeEmployees,
        totalAttendedToday: attendanceStats.totalAttendedToday,
        totalPendingLeave: attendanceStats.totalPendingLeave,
        totalOnLeaveToday: attendanceStats.totalOnLeaveToday,
      }
    });
  } catch (error) {
    throw error;
  }
}

export interface ManagerDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  attendedToday: number;
  pendingLeave: number;
  onLeaveToday: number;
}

export const getManagerDashboardInfo = async (req: SessionRequest, res: Response) => {
  try {
    const userId = req.userID!;
    const { departmentId } = validate(getManagerDashboardInfoSchema, req.query);
    const dept = await db
      .select({ managerId: departments.managerId, departmentName: departments.departmentName })
      .from(departments)
      .where(eq(departments.departmentId, departmentId))
      .execute();

    if (dept.length < 1 || dept[0]?.managerId !== userId) {
      return res.status(403).json({
        message: "You don't have permission to perform this action",
      });
    }

    const stats: ManagerDashboardStats = await db.execute(sql`
    SELECT
    COUNT(*) AS "totalEmployees",
    COUNT(*) FILTER (WHERE e.status = 'active') AS "activeEmployees",
    COUNT(*) FILTER (WHERE a.employee_id IS NOT NULL) AS "attendedToday",
    COUNT(*) FILTER (WHERE lp.user_id IS NOT NULL) AS "pendingLeave",
    COUNT(*) FILTER (WHERE lo.user_id IS NOT NULL) AS "onLeaveToday"
    FROM employees e
    JOIN users u ON u.user_id = e.user_id
    LEFT JOIN (
    SELECT DISTINCT employee_id
    FROM attendance
    WHERE attendance_date = CURRENT_DATE
    ) a ON a.employee_id = e.employee_id
    LEFT JOIN (
    SELECT DISTINCT user_id
    FROM leave_applications
    WHERE status = 'pending'
    ) lp ON lp.user_id = u.user_id
    LEFT JOIN (
    SELECT DISTINCT user_id
    FROM leave_applications
    WHERE status = 'approved'
    AND CURRENT_DATE BETWEEN start_date AND end_date
    ) lo ON lo.user_id = u.user_id
    WHERE
    u.role = 'employee'
    AND e.department_id = ${departmentId}`) as any;

    return res.status(200).json({
      status: true,
      message: `Manager Dashboard stats of department ${dept[0]?.departmentName} fetched successfully`,
      departmentName: dept[0]?.departmentName,
      data: {
        totalEmployees: stats.totalEmployees,
        activeEmployees: stats.activeEmployees,
        attendedToday: stats.attendedToday,
        pendingLeave: stats.pendingLeave,
        onLeaveToday: stats.onLeaveToday,
      }
    })

  } catch (error) {
    throw error;
  }
};
