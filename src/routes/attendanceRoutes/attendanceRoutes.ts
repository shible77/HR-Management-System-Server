import { Router } from "express";
import {
  checkIn,
  checkOut,
  getAttendanceByDate,
  getAttendanceByDepartment,
  getAttendanceByMonthPerEmployee,
  getAllAttendanceOfMe,
  getAbsentEmployeeByDate
} from "../../controllers/attendance.controllers/attendanceController";

import { 
  getPerEmployeeAttendanceReportForAdmin, 
  getAttendanceReportPerDepartmentByMonth,
  getAttendanceReportPerEmployeeByMonth
 } from "../../controllers/attendance.controllers/attendanceReportController";
import { verifySession } from "../../middlewares/verifySession";
import { checkPermission, Role } from "../../middlewares/checkPermission";

const attendanceRouter = Router();

attendanceRouter.post("/attendance/checkin",verifySession, checkIn);

attendanceRouter.patch("/attendance/checkout/:id",verifySession, checkOut);

attendanceRouter.get("/attendance/byDate", verifySession, getAttendanceByDate);

attendanceRouter.get("/attendance/byDepartment/:departmentId", verifySession, getAttendanceByDepartment);

attendanceRouter.get("/attendance/byMonth/:employeeId", verifySession ,getAttendanceByMonthPerEmployee);

attendanceRouter.get("/attendance/me", verifySession ,getAllAttendanceOfMe);

attendanceRouter.get("/attendance/absent/byDate", verifySession,getAbsentEmployeeByDate)

attendanceRouter.get("/attendance/report/perEmployee/admin", verifySession, checkPermission([Role.ADMIN]), getPerEmployeeAttendanceReportForAdmin);

attendanceRouter.get("/attendance/report/perDepartment/byMonth", verifySession, getAttendanceReportPerDepartmentByMonth);

attendanceRouter.get("/attendance/report/perEmployee/byMonth", verifySession, getAttendanceReportPerEmployeeByMonth);

export default attendanceRouter;