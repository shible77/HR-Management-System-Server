import { db } from "../db/setup";// Your Drizzle ORM database instance
import { attendance } from "../db/schema";// Your Attendance schema
import { eq } from "drizzle-orm";
import { Request, Response } from "express";


export const getAttendance = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(attendance);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch attendance records." });
  }
};

export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db
      .select()
      .from(attendance)
      .where(eq(attendance.attendanceId, Number(id)));

    if (result.length === 0) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch the attendance record." });
  }
};

export const createAttendance = async (req: Request, res: Response) => {
    try {
      const { employeeId, attendanceDate, checkInTime, checkOutTime, status } =
        req.body;
  
      const inserted = await db
        .insert(attendance)
        .values({
          employeeId,
          attendanceDate,
          checkInTime,
          checkOutTime,
          status,
        })
        .returning({ attendanceId: attendance.attendanceId }); // Explicitly return the inserted ID
  
      res.status(201).json({
        id: inserted[0].attendanceId, // Access the first result for the ID
        message: "Attendance created successfully.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create attendance record." });
    }
  };

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId, attendanceDate, checkInTime, checkOutTime, status } =
      req.body;

    const result = await db
      .update(attendance)
      .set({ employeeId, attendanceDate, checkInTime, checkOutTime, status })
      .where(eq(attendance.attendanceId, Number(id)));

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    res.json({ message: "Attendance updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update attendance record." });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .delete(attendance)
      .where(eq(attendance.attendanceId, Number(id)));

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    res.json({ message: "Attendance deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete attendance record." });
  }
};
