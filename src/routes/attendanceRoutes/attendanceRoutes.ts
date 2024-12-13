import express, { Router } from "express";
import {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../../controllers/attendanceController"; // Adjust path if necessary

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - employeeId
 *         - attendanceDate
 *         - status
 *       properties:
 *         attendanceId:
 *           type: integer
 *           description: Unique ID for the attendance record
 *         employeeId:
 *           type: integer
 *           description: Employee ID
 *         attendanceDate:
 *           type: string
 *           format: date
 *           description: Date of attendance
 *         checkInTime:
 *           type: string
 *           format: time
 *           description: Check-in time
 *         checkOutTime:
 *           type: string
 *           format: time
 *           description: Check-out time
 *         status:
 *           type: string
 *           enum: [Present, Absent, Leave]
 *           description: Attendance status
 */

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: List of attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 */
router.get("/attendance", getAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get an attendance record by ID
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the attendance record
 *     responses:
 *       200:
 *         description: Attendance record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Attendance record not found
 */
router.get("/attendance/:id", getAttendanceById);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Create a new attendance record
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Attendance'
 *     responses:
 *       201:
 *         description: Attendance record created successfully
 */
router.post("/attendance", createAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   put:
 *     summary: Update an attendance record by ID
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the attendance record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Attendance'
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *       404:
 *         description: Attendance record not found
 */
router.put("/attendance/:id", updateAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete an attendance record by ID
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the attendance record
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 *       404:
 *         description: Attendance record not found
 */
router.delete("/attendance/:id", deleteAttendance);

export default router;
