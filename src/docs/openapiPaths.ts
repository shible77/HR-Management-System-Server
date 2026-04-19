/**
 * Registers all HTTP routes with the OpenAPI registry.
 * Import `./registry` first so `extendZodWithOpenApi` runs before validator modules load.
 */
import "./registry";
import { z } from "zod";
import { registerRoute } from "./registerRoute";

import { createUserBody, loginSchema, verifyEmailSchema, verifyTokenSchema, resetPasswordSchema } from "../validators/auth.schema";
import { getUserSchema, getUsersSchema } from "../validators/user.schema";
import { departmentReqBody } from "../validators/department.schema";
import {
  getAttendanceByDateSchema,
  getAttendanceByDepartmentSchema,
  getAttendanceByMonthSchema,
  getAllAttendanceOfMeSchema,
  getAbsentEmployeeByMonthSchema,
  getPerEmployeeAttendanceReportForAdminSchema,
  getAttendanceReportPerDepartmentByMonthSchema,
  getAttendanceReportPerEmployeeByMonthSchema,
} from "../validators/attendance.schema";
import { leaveReqBody, leaveFilterSchema, getOnLeaveSchema } from "../validators/leave.schema";
import { getManagerDashboardInfoSchema } from "../validators/dashboard.schema";
import { calendarYearSchema } from "../validators/calender.schema";
import { startPayrollBodySchema } from "../validators/payroll.schema";
import { ApplicationStatus } from "../types/types";

const bearer: { BearerAuth: never[] }[] = [{ BearerAuth: [] }];

const ok = z.object({ status: z.literal(true), message: z.string() }).openapi({ description: "Success" });
const okData = z
  .object({ status: z.literal(true), message: z.string(), data: z.unknown().optional() })
  .openapi({ description: "Success with payload" });
const fail = z.object({ status: z.literal(false), message: z.string() }).openapi({ description: "Error" });
const validationFail = z
  .object({ status: z.literal(false), message: z.string(), errors: z.array(z.unknown()).optional() })
  .openapi({ description: "Validation error" });

const assignManagerPathParams = z.object({
  id: z.coerce.number().openapi({ description: "Department ID", example: 6 }),
});

const assignManagerBody = z.object({
  userId: z.string().openapi({ example: "wer234-34sfr-565t5" }),
});

const assignEmployeePathParams = z.object({
  id: z.coerce.number().openapi({ description: "Employee ID", example: 123456 }),
});

const assignEmployeeBody = z.object({
  departmentId: z.number().openapi({ example: 5 }),
});

const updateLeaveBody = z.object({
  leaveTypes: leaveReqBody.shape.leaveTypes,
  startDate: leaveReqBody.shape.startDate,
  endDate: leaveReqBody.shape.endDate,
  reason: leaveReqBody.shape.reason,
});

const processLeavePathParams = z.object({
  id: z.coerce.number().openapi({ description: "Leave application ID (leaveId)", example: 12 }),
});

const processLeaveQuery = z.object({
  status: z.enum([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED]).openapi({ example: "approved" }),
});

const leaveIdParam = z.object({
  id: z.coerce.number().openapi({ description: "Leave application ID", example: 12 }),
});

const attendanceRecordIdParam = z.object({
  id: z.coerce.number().openapi({ description: "Attendance record ID", example: 1 }),
});

const departmentIdParam = z.object({
  departmentId: z.coerce.number().openapi({ example: 1 }),
});

const employeeIdParam = z.object({
  employeeId: z.coerce.number().openapi({ example: 12445 }),
});

let openApiPathsRegistered = false;

export function registerAllOpenApiPaths() {
  if (openApiPathsRegistered) return;
  openApiPathsRegistered = true;

  registerRoute({
    method: "post",
    path: "/api/login",
    tags: ["Auth"],
    requestBody: loginSchema,
    responses: {
      200: {
        description: "Login successful; JWT returned in JSON and may also be set as `token` cookie",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          token: z.string(),
          role: z.string(),
        }),
      },
      401: { description: "Invalid email or password", body: fail },
      400: { description: "Validation error", body: validationFail },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/createUser",
    tags: ["Auth"],
    security: bearer,
    requestBody: createUserBody,
    responses: {
      201: { description: "User created", body: ok },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/forgot-password",
    tags: ["Auth"],
    requestBody: verifyEmailSchema,
    responses: {
      200: {
        description: "Verification code sent",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          email: z.string(),
          tokenInfo: z.unknown(),
        }),
      },
      404: { description: "No user for email", body: z.object({ status: z.literal(false), message: z.string(), email: z.string() }) },
      400: { description: "Validation error", body: validationFail },
    },
  });

  registerRoute({
    method: "put",
    path: "/api/verify-token/{id}",
    tags: ["Auth"],
    params: z.object({ id: z.coerce.number().openapi({ description: "Token ID (password_reset_tokens.token_id)", example: 2 }) }),
    requestBody: verifyTokenSchema.omit({ tokenId: true }),
    responses: {
      200: {
        description: "Token verified",
        body: z.object({ status: z.literal(true), message: z.string(), userId: z.string() }),
      },
      401: { description: "Invalid or expired token", body: fail },
      400: { description: "Validation error", body: validationFail },
    },
  });

  registerRoute({
    method: "put",
    path: "/api/reset-password/{id}",
    tags: ["Auth"],
    params: z.object({ id: z.string().openapi({ description: "User ID (UUID)", example: "uuid-here" }) }),
    requestBody: resetPasswordSchema,
    responses: {
      200: { description: "Password reset", body: ok },
      400: { description: "Validation error", body: validationFail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/currentUser",
    tags: ["Users"],
    security: bearer,
    responses: {
      200: { description: "Current user profile", body: okData },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/user",
    tags: ["Users"],
    security: bearer,
    query: getUserSchema,
    responses: {
      200: { description: "User found", body: okData },
      404: { description: "User not found", body: z.object({ message: z.string() }) },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/users",
    tags: ["Users"],
    security: bearer,
    query: getUsersSchema,
    responses: {
      200: { description: "Paginated user list", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/createDepartment",
    tags: ["Department"],
    security: bearer,
    requestBody: departmentReqBody,
    responses: {
      200: {
        description: "Department created",
        body: z.object({ message: z.string(), departmentID: z.number() }),
      },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: z.object({ message: z.string() }) },
    },
  });

  registerRoute({
    method: "put",
    path: "/api/assignManager/{id}",
    tags: ["Department"],
    security: bearer,
    params: assignManagerPathParams,
    requestBody: assignManagerBody,
    responses: {
      200: { description: "Manager assigned", body: ok },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: z.object({ message: z.string() }) },
    },
  });

  registerRoute({
    method: "put",
    path: "/api/assignEmployee/{id}",
    tags: ["Department"],
    security: bearer,
    params: assignEmployeePathParams,
    requestBody: assignEmployeeBody,
    responses: {
      200: { description: "Employee assigned to department", body: ok },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: z.object({ message: z.string() }) },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/attendance/checkin",
    tags: ["Attendance"],
    security: bearer,
    responses: {
      200: { description: "Checked in", body: ok },
      400: { description: "Already checked in or bad request", body: fail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "patch",
    path: "/api/attendance/checkout/{id}",
    tags: ["Attendance"],
    security: bearer,
    params: attendanceRecordIdParam,
    responses: {
      200: { description: "Checked out", body: ok },
      404: { description: "Attendance record not found", body: fail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/byDate",
    tags: ["Attendance"],
    security: bearer,
    query: getAttendanceByDateSchema,
    responses: {
      200: { description: "Attendance rows for date", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/byDepartment/{departmentId}",
    tags: ["Attendance"],
    security: bearer,
    params: departmentIdParam,
    query: getAttendanceByDepartmentSchema.omit({ departmentId: true }),
    responses: {
      200: { description: "Attendance for department", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/byMonth/{employeeId}",
    tags: ["Attendance"],
    security: bearer,
    params: employeeIdParam,
    query: getAttendanceByMonthSchema.omit({ employeeId: true }),
    responses: {
      200: { description: "Attendance for employee month", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/me",
    tags: ["Attendance"],
    security: bearer,
    query: getAllAttendanceOfMeSchema,
    responses: {
      200: { description: "Own attendance history", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/absent/byDate",
    tags: ["Attendance"],
    security: bearer,
    query: getAbsentEmployeeByMonthSchema,
    responses: {
      200: { description: "Absent employees for month of given date", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/report/perEmployee/admin",
    tags: ["Attendance"],
    security: bearer,
    query: getPerEmployeeAttendanceReportForAdminSchema,
    responses: {
      200: { description: "Admin attendance report", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/report/perDepartment/byMonth",
    tags: ["Attendance"],
    security: bearer,
    query: getAttendanceReportPerDepartmentByMonthSchema,
    responses: {
      200: { description: "Department monthly summary", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/report/perEmployee/byMonth",
    tags: ["Attendance"],
    security: bearer,
    query: getAttendanceReportPerEmployeeByMonthSchema,
    responses: {
      200: { description: "Employee monthly summary", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/applyLeave",
    tags: ["Leave"],
    security: bearer,
    requestBody: leaveReqBody,
    responses: {
      201: { description: "Leave application created", body: ok },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/leave",
    tags: ["Leave"],
    security: bearer,
    query: leaveFilterSchema,
    responses: {
      200: { description: "Filtered leave applications", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
    },
  });

  registerRoute({
    method: "put",
    path: "/api/leave/{id}",
    tags: ["Leave"],
    security: bearer,
    params: leaveIdParam,
    requestBody: updateLeaveBody,
    responses: {
      200: { description: "Leave updated", body: ok },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
    },
  });

  registerRoute({
    method: "put",
    path: "/api/processLeave/{id}",
    tags: ["Leave"],
    security: bearer,
    params: processLeavePathParams,
    query: processLeaveQuery,
    responses: {
      200: { description: "Leave processed", body: ok },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
    },
  });

  registerRoute({
    method: "delete",
    path: "/api/leave/{id}",
    tags: ["Leave"],
    security: bearer,
    params: leaveIdParam,
    responses: {
      200: { description: "Leave deleted", body: ok },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/onLeave",
    tags: ["Leave"],
    security: bearer,
    query: getOnLeaveSchema,
    responses: {
      200: { description: "Employees on leave today", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/adminDashboardInfo",
    tags: ["Dashboard"],
    security: bearer,
    responses: {
      200: { description: "Admin dashboard counters", body: okData },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/managerDashboardInfo",
    tags: ["Dashboard"],
    security: bearer,
    query: getManagerDashboardInfoSchema,
    responses: {
      200: { description: "Manager dashboard stats for department", body: okData },
      400: { description: "Validation error", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: z.object({ message: z.string() }) },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/generateCalenderYear",
    tags: ["Calendar"],
    security: bearer,
    requestBody: calendarYearSchema,
    responses: {
      200: { description: "Calendar rows inserted (conflicts ignored)", body: z.object({ message: z.string() }) },
      400: { description: "Validation error or missing year", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
      500: { description: "Server error", body: z.object({ message: z.string() }) },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/payroll/start",
    tags: ["Payroll"],
    security: bearer,
    requestBody: startPayrollBodySchema,
    responses: {
      202: {
        description: "Payroll job queued",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          jobId: z.string(),
          jobName: z.string(),
          payDate: z.string(),
        }),
      },
      400: { description: "Validation or invalid pay date", body: validationFail },
      401: { description: "Unauthorized", body: fail },
      403: { description: "Forbidden", body: fail },
      409: { description: "Job already queued or running for that month", body: fail },
      503: { description: "Redis unreachable", body: fail },
    },
  });
}
