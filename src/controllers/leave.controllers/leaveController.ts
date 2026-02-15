import { Response } from "express";
import { db } from "../../db/setup";
import { leaveApplications, users, employees, departments } from "../../db/schema";
import { eq, and, sql, gte, lte, gt, asc } from "drizzle-orm";
import { SessionRequest } from "../../middlewares/verifySession";
import { getDateDiff } from "../../utils/getDateDiff";
import { Role } from "../../middlewares/checkPermission";
import { LeaveFilter, ApplicationStatus } from "../../types/types";
import { applyLeaveFilters } from "../../utils/leaveFilters";
import { validate } from "../../utils/validate";
import { leaveReqBody, leaveFilterSchema, updateLeaveSchema, processLeaveSchema, getOnLeaveSchema, deleteLeaveSchema } from "../../validators/leave.schema";

export const applyLeave = async (req: SessionRequest, res: Response) => {
  try {
    const { leaveTypes, startDate, endDate, reason } = validate(leaveReqBody, req.body);
    const userId = req.userID!;
    const employeeId = req.employeeId!;
    const days = getDateDiff(startDate, endDate);
    await db.insert(leaveApplications)
      .values({
        employeeId: employeeId,
        leaveType: leaveTypes,
        startDate: startDate,
        endDate: endDate,
        reason,
        totalDays: days,
      })
      .execute();

    return res.status(201).json({
      status: true,
      message: "Leave Application Created Successfully"
    });
  } catch (error) {
    throw error;
  }
};


export const getLeave = async (req: SessionRequest, res: Response) => {
  try {
    const { leaveType, status, departmentId, limit, cursor } = validate(leaveFilterSchema, { ...req.query, limit: req.query.limit, cursor: req.query.cursor || undefined });

    const filter: LeaveFilter = { leaveType, status, departmentId };

    let condition: any[] = [];
    if (cursor) {
      condition.push(gt(leaveApplications.leaveId, cursor));
    }
    condition = applyLeaveFilters(condition, filter);

    const leaves = await db.select({
      leaveId: leaveApplications.leaveId,
      employeeId: leaveApplications.employeeId,
      firstName: users.firstName,
      lastName: users.lastName,
      leaveType: leaveApplications.leaveType,
      departmentName: departments.departmentName,
      startDate: leaveApplications.startDate,
      endDate: leaveApplications.endDate,
      reason: leaveApplications.reason,
      totalDays: leaveApplications.totalDays,
      status: leaveApplications.status,
    }).
      from(leaveApplications)
      .innerJoin(employees, eq(employees.employeeId, leaveApplications.employeeId))
      .innerJoin(users, eq(users.userId, employees.userId))
      .leftJoin(departments, eq(departments.departmentId, employees.departmentId))
      .where(condition.length > 0 ? and(...condition) : undefined)
      .orderBy(asc(leaveApplications.leaveId))
      .limit(limit + 1)
      .execute();

    const hasMore: boolean = leaves.length > limit;
    const sliced = hasMore ? leaves.slice(0, -1) : leaves;
    const nextCursor = hasMore ? sliced[sliced.length - 1] : null;

    return res.status(200).json({
      status: true,
      message: "Leave Applications fetched successfully",
      data: sliced,
      pageInfo: {
        hasMore,
        nextCursor
      }
    })

  } catch (error) {
    throw error;
  }
};

export const updateLeave = async (req: SessionRequest, res: Response) => {
  try {
    const { leaveTypes, startDate, endDate, reason, leaveId } = validate(updateLeaveSchema, { ...req.body, leaveId: req.params.id });
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
      .execute();
    if (application.rowCount === 0) {
      return res.status(404).json({ message: "Leave application not found" });
    }
    return res.status(200).json({
      status: true,
      message: "Leave Application Updated Successfully",
    });
  } catch (error) {
    throw error;
  }
};


export const processLeaveRequest = async (req: SessionRequest, res: Response) => {
  try {
    const { status, leaveId } = validate(processLeaveSchema, { status: req.query.status, leaveId: req.params.id });
    const currentUser = req.userID!;

    const application = await db
      .update(leaveApplications)
      .set({ status, approvedBy: currentUser })
      .where(and(eq(leaveApplications.leaveId, leaveId), eq(leaveApplications.status, ApplicationStatus.PENDING)))
      .execute();
    if (application.rowCount === 0) {
      return res.status(404).json({ message: "Leave application not found or already processed" });
    }
    return res.status(200).json({
      status: true,
      message: "Leave Application Processed Successfully"
    });
  } catch (error) {
    throw error;
  }
};

export const deleteLeave = async (req: SessionRequest, res: Response) => {
  try {
    const { leaveId } = validate(deleteLeaveSchema, { leaveId: req.params.id });
    const result = await db
      .delete(leaveApplications)
      .where(eq(leaveApplications.leaveId, leaveId))
      .execute();
    if (result.rowCount === 0) {
      return res.status(404).json({ status: false, message: "Leave application not found" });
    }
    return res.status(200).json({ status: true, message: "Leave Application Deleted Successfully" });
  } catch (error) {
    throw error;
  }
};


export const getOnLeave = async (req: SessionRequest, res: Response) => {
  try {
    const role = req.role!;
    const { departmentId } = validate(getOnLeaveSchema, req.query);
    const today = new Date().toISOString().split("T")[0];
    if (role === Role.ADMIN) {
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
    if (role === Role.MANAGER) {
      const onLeaveEmployees = await db
        .selectDistinct({
          firstName: users.firstName,
          lastName: users.lastName,
          employeeId: employees.employeeId,
          designation: employees.designation,
          phone: users.phone,
          email: users.email,
        })
        .from(leaveApplications)
        .innerJoin(
          employees,
          eq(leaveApplications.employeeId, employees.employeeId)
        )
        .innerJoin(
          users,
          eq(users.userId, employees.userId)
        )
        .where(
          and(
            eq(leaveApplications.status, ApplicationStatus.APPROVED),
            lte(leaveApplications.startDate, today),
            gte(leaveApplications.endDate, today),
            eq(employees.departmentId, Number(departmentId))
          )
        )
        .execute();

      return res.status(200).json({
        status: true,
        message: "List of employees who are on leave today",
        data: onLeaveEmployees,
      });
    }
  } catch (error) {
    throw error;
  }
};
