import { Router } from "express";
import {insertAttendanceForAllEmployees,
  getAttendance,
  checkIn,
  checkOut,
} from "../../controllers/attendanceController";

const attendanceRouter = Router();


/**
 * @swagger
 * /api/attendance/insert-all:
 *   post:
 *     summary: Insert attendance records for all employees
 *     description: This endpoint inserts attendance records for all employees for the current date if they don't already exist.
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: Attendance records inserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance records inserted for all employees
 *       400:
 *         description: Attendance records already exist for this date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance records already exist for this date
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
attendanceRouter.post('/attendance/insert-all', insertAttendanceForAllEmployees);


/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Fetch attendance records for a specific date
 *     description: Retrieves attendance records for a given date. Defaults to today's date if no date is provided.
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The date for which to fetch attendance records (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attendanceId:
 *                         type: integer
 *                       employeeId:
 *                         type: integer
 *                       attendanceDate:
 *                         type: string
 *                         format: date
 *                       checkInTime:
 *                         type: string
 *                         format: time
 *                       checkOutTime:
 *                         type: string
 *                         format: time
 *                       status:
 *                         type: string
 *     500:
 *       description: Internal server error.
 */
attendanceRouter.get("/attendance/", getAttendance);

/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: Record an employee's check-in time
 *     description: Records the check-in time for an employee for the current day.
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 description: The ID of the employee checking in.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Check-in recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 */
attendanceRouter.post("/attendance/checkin", checkIn);

/**
 * @swagger
 * /api/attendance/checkout:
 *   post:
 *     summary: Record an employee's check-out time
 *     description: Records the check-out time for an employee for the current day.
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 description: The ID of the employee checking out.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Check-out recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 */
attendanceRouter.post("/attendance/checkout", checkOut);

export default attendanceRouter;