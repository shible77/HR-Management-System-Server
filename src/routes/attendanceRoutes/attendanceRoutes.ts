import { Router } from "express";
import {insertAttendanceForAllEmployees,
  getAttendance,
  checkIn,
  checkOut,
} from "../../controllers/attendance.controllers/attendanceController";

const attendanceRouter = Router();


attendanceRouter.post('/attendance/insert-all', insertAttendanceForAllEmployees);

attendanceRouter.get("/attendance/", getAttendance);

attendanceRouter.post("/attendance/checkin", checkIn);

attendanceRouter.post("/attendance/checkout", checkOut);

export default attendanceRouter;