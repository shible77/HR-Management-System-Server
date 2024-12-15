import { Response } from "express";
import { db } from "../db/setup";
import { leaveApplications, users, employees, departments } from "../db/schema";
import { eq, and, asc, desc, sql, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { LeaveType } from "../types";
import { SessionRequest } from "../middlewares/verifySession";
import { getDateDiff } from "../utils/getDateDiff";
import { PermissionRequest, Role } from "../middlewares/checkPermission";
import { LeaveFilter, ApplicationStatus } from "../types";
import { applyLeaveFilters } from "../utils/leaveFilters";
import { getPagination, getPagingData } from "../utils/pagination";

const leaveReqBody = z.object({
  leaveTypes: z.enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
});

export const applyLeave = async (req: SessionRequest, res: Response) => {
  try {
    const { leaveTypes, startDate, endDate, reason } = leaveReqBody.parse(
      req.body
    );
    const userId = req.userID!;
    const days = getDateDiff(startDate, endDate);
    const application = await db
      .insert(leaveApplications)
      .values({
        userId,
        leaveType: leaveTypes,
        startDate: startDate,
        endDate: endDate,
        reason,
        totalDays: days,
      })
      .returning({ leaveId: leaveApplications.leaveId })
      .execute();

    return res.status(201).json({
      message: "Leave Application Created Successfully",
      leaveId: application[0].leaveId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const leaveFilterSchema = z.object({
  departmentId: z.coerce.number().optional(),
  userId: z.string().optional(),
  leaveType: z
    .enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL])
    .optional(),
  status: z
    .enum([
      ApplicationStatus.PENDING,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED,
    ])
    .optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  pageSize: z.coerce.number().min(1).default(10).optional(),
});
export const getLeave = async (req: SessionRequest, res: Response) => {
  try {
    const { userId, leaveType, status, departmentId, page, pageSize } =
      leaveFilterSchema.parse(req.query);
    const filter: LeaveFilter = { userId, leaveType, status, departmentId };
    let query = db
      .select({
        leaveId: leaveApplications.leaveId,
        userId: leaveApplications.userId,
        leaveType: leaveApplications.leaveType,
        startDate: leaveApplications.startDate,
        endDate: leaveApplications.endDate,
        totalDays: leaveApplications.totalDays,
        status: leaveApplications.status,
        reason: leaveApplications.reason,
        appliedAt: leaveApplications.appliedAt,
        approvedBy: leaveApplications.approvedBy,
        departmentId: employees.departmentId,
      })
      .from(leaveApplications)
      .leftJoin(employees, eq(employees.userId, leaveApplications.userId));
    const { limit, offset } = getPagination(Number(page) - 1, Number(pageSize));
    query = applyLeaveFilters(query, filter);
    const totalFilteredData = await db.$count(query);
    const leaveApp = await query.limit(limit).offset(offset).execute();
    if (leaveApp.length === 0) {
      return res.status(404).json({ message: "No Leave Application found" });
    }
    const response = getPagingData(
      leaveApp,
      totalFilteredData,
      Number(page),
      limit,
      offset
    );
    return res.status(200).json({
      message: "Leave Application fetched Successfully",
      totalItems: totalFilteredData,
      pageSize: limit,
      ...response,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const updateLeaveSchema = z.object({
  leaveTypes: z.enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
});
export const updateLeave = async (req: PermissionRequest, res: Response) => {
  try {
    const currentUserId = req.userID!;
    const leaveId = z.coerce.number().parse(req.params.id);
    const getLeaveById = await db
      .select()
      .from(leaveApplications)
      .where(eq(leaveApplications.leaveId, leaveId))
      .execute();
    if (getLeaveById.length === 0) {
      return res.status(404).json({ message: "Leave Application not found" });
    }
    if (getLeaveById[0].userId !== currentUserId) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to update this leave application",
        });
    }
    const { leaveTypes, startDate, endDate, reason } = updateLeaveSchema.parse(
      req.body
    );
    const days = getDateDiff(startDate, endDate);
    const application = await db
      .update(leaveApplications)
      .set({
        leaveType: leaveTypes,
        startDate: startDate,
        endDate: endDate,
        reason,
        totalDays: days,
      })
      .where(eq(leaveApplications.leaveId, leaveId))
      .returning({ leaveId: leaveApplications.leaveId })
      .execute();
    return res.status(200).json({
      message: "Leave Application Updated Successfully",
      leaveId: application[0].leaveId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const processLeaveSchema = z.object({
  status: z.enum([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED]),
  departmentId: z.coerce.number().optional(),
});
export const processLeaveRequest = async (
  req: PermissionRequest,
  res: Response
) => {
  try {
    const leaveId = z.coerce.number().parse(req.params.id);
    const { status, departmentId } = processLeaveSchema.parse(req.query);
    const currentUser = req.userID!;
    if (req.role! === Role.ADMIN) {
      const application = await db
        .update(leaveApplications)
        .set({ status, approvedBy: currentUser })
        .where(eq(leaveApplications.leaveId, leaveId))
        .returning({ leaveId: leaveApplications.leaveId })
        .execute();
      return res.status(200).json({
        message: "Leave Application Processed Successfully",
        leaveId: application[0].leaveId,
      });
    }
    if (req.role! === Role.MANAGER) {
      const dept = await db
        .select({ managerId: departments.managerId })
        .from(departments)
        .where(eq(departments.departmentId, Number(departmentId)))
        .execute();
      if (
        dept.length === 0 ||
        dept[0].managerId === null ||
        dept[0].managerId !== currentUser
      ) {
        return res
          .status(403)
          .json({
            message: "You are not authorized to process this leave application",
          });
      }
      const application = await db
        .update(leaveApplications)
        .set({ status, approvedBy: currentUser })
        .where(eq(leaveApplications.leaveId, leaveId))
        .returning({ leaveId: leaveApplications.leaveId })
        .execute();
      return res.status(200).json({
        message: "Leave Application Processed Successfully",
        leaveId: application[0].leaveId,
      });
    }
    return res
      .status(403)
      .json({
        message: "You are not authorized to process this leave application",
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const deleteLeave = async (req: PermissionRequest, res: Response) => {
  try {
    const leaveId = z.coerce.number().parse(req.params.id);
    const currentUserId = req.userID!;
    const getLeaveById = await db
      .select({
        userId: leaveApplications.userId,
        status: leaveApplications.status,
      })
      .from(leaveApplications)
      .where(eq(leaveApplications.leaveId, leaveId))
      .execute();
    if (
      getLeaveById.length !== 0 &&
      getLeaveById[0].status === ApplicationStatus.PENDING &&
      (getLeaveById[0].userId === currentUserId || req.role! === Role.ADMIN)
    ) {
      await db
        .delete(leaveApplications)
        .where(eq(leaveApplications.leaveId, leaveId))
        .execute();
      return res
        .status(200)
        .json({ message: "Leave Application Deleted Successfully" });
    }
    return res
      .status(403)
      .json({
        message: "You are not authorized to delete this leave application",
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getOnLeaveSchema = z.object({
  departmentId: z.coerce.number().optional(),
})
export const getOnLeave = async (req: PermissionRequest, res: Response) => {
  try {
    const currentUserId = req.userID!;
    const role = req.role!;
    const { departmentId } = getOnLeaveSchema.parse(req.query);
    const today = new Date().toISOString().split("T")[0];
    if(role === Role.ADMIN) {
      const groupedLeavesToday = await db.execute(sql`
        SELECT 
          employees.department_id AS "departmentId",
          departments.department_name AS "departmentName",
          JSON_AGG(JSON_BUILD_OBJECT('firstName', users.first_name, 'lastName', users.last_name, 'employeeId', employees.employee_id, 'designation', employees.designation, 'phone', users.phone, 'email', users.email)) AS "usersOnLeave"
        FROM leave_applications
        LEFT JOIN users ON leave_applications.user_id = users.user_id
        LEFT JOIN employees ON users.user_id = employees.user_id
        LEFT JOIN departments ON employees.department_id = departments.department_id
        WHERE leave_applications.status = 'approved'
          AND leave_applications.start_date <= ${today}
          AND leave_applications.end_date >= ${today}
        GROUP BY employees.department_id, departments.department_name;
      `);
      return res
      .status(200)
      .json({
        status: true,
        message: "Department-wise data who are on leave today",
        data: groupedLeavesToday.rows,
      });
    }
    if(role === Role.MANAGER) {
      const dept = await db.select({managerId: departments.managerId}).from(departments).where(eq(departments.departmentId, Number(departmentId))).execute();
      if(dept.length === 0 || dept[0].managerId === null || dept[0].managerId !== currentUserId) {
        return res.status(403).json({message: "You are not authorized to access this resource"});
      }
      const onLeaveEmployees = await db.select({firstName: users.firstName, lastName: users.lastName, employeeId: employees.employeeId, designation: employees.designation, phone: users.phone, email: users.email}).from(leaveApplications)
      .leftJoin(users, eq(users.userId, leaveApplications.userId))
      .leftJoin(employees, eq(users.userId, employees.userId))
      .where(and(
        eq(leaveApplications.status, ApplicationStatus.APPROVED),
        gte(leaveApplications.startDate, today),
        lte(leaveApplications.endDate, today),
        eq(employees.departmentId, Number(departmentId))
      ))
      .execute();
      return res.status(200).json({
        status: true,
        message: "List of employees who are on leave today",
        data: onLeaveEmployees,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
