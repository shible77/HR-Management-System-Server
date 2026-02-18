import { db } from "../../db/setup";
import { attendance, departments, employees, users } from "../../db/schema";
import { eq, and, gt, gte, lt, isNull } from "drizzle-orm/expressions";
import { Response } from "express";
import { SessionRequest } from "../../middlewares/verifySession";
import { validate } from "../../utils/validate";
import {
  checkOutSchema,
  getAttendanceByDateSchema,
  getAttendanceByDepartmentSchema,
  getAttendanceByMonthSchema,
  getAllAttendanceOfMeSchema,
  getAbsentEmployeeByMonthSchema
} from "../../validators/attendance.schema";


export const checkIn = async (req: SessionRequest, res: Response) => {
  try {
    const employeeId = req.employeeId!;
    const today = new Date();
    const result = await db.insert(attendance)
      .values({
        employeeId,
        attendanceDate: today.toISOString().split("T")[0],
        checkInTime: today.toLocaleTimeString(),
        status: "Present",
      })
      .onConflictDoNothing();
    if (result.rowCount === 0) {
      return res.status(400).json({ status: false, message: "Already checked in for today" });
    }
    return res.status(200).json({ status: true, message: "Check-in successful" });
  } catch (error) {
    throw error;
  }
}

export const checkOut = async (req: SessionRequest, res: Response) => {
  try {
    const today = new Date();
    const { attendanceId } = validate(checkOutSchema, { attendanceId: req.params.id });
    const result = await db.update(attendance)
      .set({ checkOutTime: today.toLocaleTimeString() })
      .where(eq(attendance.attendanceId, attendanceId));

    if (result.rowCount === 0) {
      return res.status(404).json({ status: false, message: "Attendance record not found" });
    }

    return res.status(200).json({ status: true, message: "Check-out successful" });
  } catch (error) {
    throw error;
  }
}

export const getAttendanceByDate = async (req: SessionRequest, res: Response) => {
  try {
    const { date, cursor, limit } = validate(getAttendanceByDateSchema, { ...req.query });
    const requestedDate = date ? new Date(date) : new Date();
    const formattedDate = requestedDate.toISOString().split("T")[0];
    const records = await db.select({
      attendanceId: attendance.attendanceId,
      attendanceDate: attendance.attendanceDate,
      employeesId: employees.employeeId,
      firstName: users.firstName,
      lastName: users.lastName,
      departmentName: departments.departmentName,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime
    })
      .from(attendance)
      .innerJoin(employees, eq(attendance.employeeId, employees.employeeId))
      .innerJoin(users, eq(employees.userId, users.userId))
      .innerJoin(departments, eq(employees.departmentId, departments.departmentId))
      .where(and(
        eq(attendance.attendanceDate, formattedDate),
        cursor ? gt(attendance.attendanceId, cursor) : undefined))
      .orderBy(departments.departmentName, attendance.checkInTime)
      .limit(limit + 1)

    const hasMore: boolean = records.length > limit;
    const sliced = hasMore ? records.slice(0, -1) : records;
    const nextCursor = hasMore ? sliced[sliced.length - 1].attendanceId : null;

    return res.status(200).json({ status: true, message: "Attendance records fetched successfully", data: sliced, pageInfo: { nextCursor, hasMore } });
  }
  catch (error) {
    throw error;
  }
}

export const getAttendanceByDepartment = async (req: SessionRequest, res: Response) => {
  try {
    const { date, departmentId, cursor, limit } = validate(getAttendanceByDepartmentSchema, { ...req.query, departmentId: req.params.departmentId });
    const requestedDate = date ? new Date(date) : new Date();
    const formattedDate = requestedDate.toISOString().split("T")[0];

    const records = await db.select({
      attendanceId: attendance.attendanceId,
      attendanceDate: attendance.attendanceDate,
      employeesId: employees.employeeId,
      firstName: users.firstName,
      lastName: users.lastName,
      departmentName: departments.departmentName,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime
    })
      .from(attendance)
      .innerJoin(employees, eq(attendance.employeeId, employees.employeeId))
      .innerJoin(users, eq(employees.userId, users.userId))
      .innerJoin(departments, eq(employees.departmentId, departments.departmentId))
      .where(and(
        eq(attendance.attendanceDate, formattedDate),
        eq(departments.departmentId, departmentId),
        cursor ? gt(attendance.attendanceId, cursor) : undefined))
      .orderBy(attendance.checkInTime)
      .limit(limit + 1);

    const hasMore: boolean = records.length > limit;
    const sliced = hasMore ? records.slice(0, -1) : records;
    const nextCursor = hasMore ? sliced[sliced.length - 1].attendanceId : null;
    return res.status(200).json({ status: true, message: "Attendance records fetched successfully", data: sliced, pageInfo: { nextCursor, hasMore } });
  } catch (error) {
    throw error;
  }
}

export const getAttendanceByMonth = async (req: SessionRequest, res: Response) => {
  try {
    const { date, employeeId } = validate(getAttendanceByMonthSchema, { ...req.query, employeeId: req.params.employeeId });
    const requestedDate = date ? new Date(date) : new Date();

    const year = requestedDate.getUTCFullYear();
    const month = requestedDate.getUTCMonth();

    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 1));

    const formattedStartDate = start.toISOString().split("T")[0];
    const formattedEndDate = end.toISOString().split("T")[0];
    const records = await db.select({
      attendanceId: attendance.attendanceId,
      attendanceDate: attendance.attendanceDate,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      status: attendance.status,
    })
      .from(attendance)
      .where(and(
        eq(attendance.employeeId, employeeId),
        gte(attendance.attendanceDate, formattedStartDate),
        lt(attendance.attendanceDate, formattedEndDate)
      ))
      .orderBy(attendance.attendanceDate);

    return res.status(200).json({ status: true, message: "Attendance records fetched successfully", data: records });

  } catch (error) {
    throw error;
  }
}

export const getAllAttendanceOfMe = async (req: SessionRequest, res: Response) => {
  try {
    const { cursor, limit } = validate(getAllAttendanceOfMeSchema, { ...req.query });
    const employeeId = req.employeeId!;
    const records = await db.select({
      attendanceId: attendance.attendanceId,
      attendanceDate: attendance.attendanceDate,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      status: attendance.status,
    })
      .from(attendance)
      .where(and(
        eq(attendance.employeeId, employeeId),
        cursor ? gt(attendance.attendanceId, cursor) : undefined
      ))
      .orderBy(attendance.attendanceDate)
      .limit(limit + 1);

    const hasMore: boolean = records.length > limit;
    const sliced = hasMore ? records.slice(0, -1) : records;
    const nextCursor = hasMore ? sliced[sliced.length - 1].attendanceId : null;
    return res.status(200).json({ status: true, message: "Attendance records fetched successfully", data: sliced, pageInfo: { nextCursor, hasMore } });

  } catch (error) {
    throw error;
  }
}

export const getAbsentEmployeeByMonth = async (req: SessionRequest, res: Response) => {
  try {
    const { date } = validate(getAbsentEmployeeByMonthSchema, { ...req.query });
    const requestedDate = date ? new Date(date) : new Date();
    const formattedDate = requestedDate.toISOString().split("T")[0];
    const record = await db
      .select({
        employeeId: employees.employeeId,
        firstName: users.firstName,
        lastName: users.lastName,
        departmentName: departments.departmentName,
      })
      .from(employees)
      .innerJoin(users, eq(users.userId, employees.userId))
      .innerJoin(departments, eq(departments.departmentId, employees.departmentId))
      .leftJoin(
        attendance,
        and(
          eq(attendance.employeeId, employees.employeeId),
          eq(attendance.attendanceDate, formattedDate)
        )
      )
      .where(isNull(attendance.attendanceId))
      .orderBy(departments.departmentName)
      .execute();

      return res.status(200).json({status: 200, message:"data fetched successfully", data:record});
  } catch (error) {
    throw error;
  }
}