import { db } from "../../db/setup";
import { attendance, employees } from "../../db/schema";
import { eq, and } from "drizzle-orm/expressions";
import { Request, Response } from "express";



const getTodayDate = (): string => new Date().toISOString().split("T")[0];

// Insert attendance records for all employees for the current date
export const insertAttendanceForAllEmployees = async (req: Request, res: Response) => {
  const date = req.body.date || new Date().toISOString().split('T')[0]; // Default to today's date

  try {
    // Check if attendance records already exist for the current date
    const existingAttendance = await db
      .select()
      .from(attendance)
      .where(eq(attendance.attendanceDate, date)) // Check for existing records by attendanceDate
      .execute();

    if (existingAttendance.length > 0) {
      return res.status(400).json({ message: 'Attendance records already exist for this date.' });
    }

    // Fetch all employees
    const employeesList = await db
      .select()
      .from(employees)
      .execute();

    // Insert attendance records for each employee
    const insertPromises = employeesList.map((employee) => {
      return db
        .insert(attendance)
        .values({
          employeeId: employee.employeeId,
          attendanceDate: date,
          status: "Absent", // Default status is "Absent" for all employees
        })
        .execute();
    });

    // Wait for all insertions to complete
    await Promise.all(insertPromises);

    res.status(200).json({ message: 'Attendance records inserted for all employees' });
  } catch (error) {
    console.error('Error inserting attendance for all employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch attendance for a specific date
export const getAttendance = async (req: Request, res: Response) => {
  const { date } = req.query;
  const attendanceDate = (date as string) || getTodayDate();

  try {
    const records = await db
      .select()
      .from(attendance)
      .where(eq(attendance.attendanceDate, attendanceDate));
    /*  const records = await db
  .select()
  .from(attendance)
  .where(eq(attendance.attendanceDate, attendanceDate))
  .innerJoin(employees, eq(employees.employeeId, attendance.employeeId))
  .innerJoin(users, eq(users.userId, employees.userId));
res.json({ success: true, data: records });*/
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error,
    });
  }
};
// Record Check-In
export const checkIn = async (req: Request, res: Response) => {
  const { employeeId, date } = req.body;
  const attendanceDate = getTodayDate();

  try {


    await db
      .update(attendance)
      .set({
        checkInTime: new Date().toLocaleTimeString("en-US", { hour12: false }),
        status: "Present"
      })
      .where(
        and(
          eq(attendance.attendanceDate, date),
          eq(attendance.employeeId, employeeId)
        )
      );

    // await db.insert(attendance).values({
    //   employeeId,
    //   attendanceDate,
    //   checkInTime: new Date().toLocaleTimeString("en-US", { hour12: false }),
    //   status: "Present",
    // });
    res.json({ success: true, message: "Check-in recorded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to record check-in", error });
  }
};
// Record Check-Out
export const checkOut = async (req: Request, res: Response) => {
  const { employeeId, date } = req.body;
  const attendanceDate = getTodayDate();

  try {
    await db
      .update(attendance)
      .set({
        checkOutTime: new Date().toLocaleTimeString("en-US", { hour12: false }),
      })
      .where(
        and(
          eq(attendance.attendanceDate, date),
          eq(attendance.employeeId, employeeId)
        )
      );

    res.json({ success: true, message: "Check-out recorded successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to record check-out",
      error,
    });
  }
};