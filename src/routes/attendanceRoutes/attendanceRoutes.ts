import { Router } from "express";
import {
  checkIn,
  checkOut,
  getAttendanceByDate,
  getAttendanceByDepartment,
  getAttendanceByMonth,
  getAllAttendanceOfMe
} from "../../controllers/attendance.controllers/attendanceController";

const attendanceRouter = Router();

attendanceRouter.post("/attendance/checkin", checkIn);

attendanceRouter.patch("/attendance/checkout/:id", checkOut);

attendanceRouter.get("/attendance/byDate", getAttendanceByDate);

attendanceRouter.get("/attendance/byDepartment/:departmentId", getAttendanceByDepartment);

attendanceRouter.get("/attendance/byMonth/:employeeId", getAttendanceByMonth);

attendanceRouter.get("/attendance/me", getAllAttendanceOfMe);
export default attendanceRouter;