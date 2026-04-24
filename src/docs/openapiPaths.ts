/**
 * Registers all HTTP routes with the OpenAPI registry.
 * Import `./registry` first so `extendZodWithOpenApi` runs before validator modules load.
 */
import "./registry";
import { z } from "zod";
import { registerRoute } from "./registerRoute";

import {
  createUserBody,
  loginSchema,
  verifyEmailSchema,
  verifyTokenSchema,
  resetPasswordSchema,
} from "../validators/auth.schema";
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
import {
  leaveReqBody,
  leaveFilterSchema,
  getOnLeaveSchema,
} from "../validators/leave.schema";
import { getManagerDashboardInfoSchema } from "../validators/dashboard.schema";
import { calendarYearSchema } from "../validators/calender.schema";
import { startPayrollBodySchema } from "../validators/payroll.schema";
import { ApplicationStatus } from "../types/types";

// ─────────────────────────────────────────────────────────────
// Reusable security / response schemas
// ─────────────────────────────────────────────────────────────

const bearer: { BearerAuth: never[] }[] = [{ BearerAuth: [] }];

/** Generic success with no data payload */
const ok = z
  .object({ status: z.literal(true), message: z.string() })
  .openapi({ description: "Success" });

/** Generic success with an optional data payload */
const okData = z
  .object({
    status: z.literal(true),
    message: z.string(),
    data: z.unknown().optional(),
  })
  .openapi({ description: "Success with payload" });

/** Paginated success response */
const okPaginated = z
  .object({
    status: z.literal(true),
    message: z.string(),
    data: z.array(z.unknown()),
    pageInfo: z.object({
      nextCursor: z.union([z.string(), z.number()]).nullable(),
      hasMore: z.boolean(),
    }),
  })
  .openapi({ description: "Paginated success with cursor-based page info" });

/** Generic error response */
const fail = z
  .object({ status: z.literal(false), message: z.string() })
  .openapi({ description: "Error" });

/** Validation error response */
const validationFail = z
  .object({
    status: z.literal(false),
    message: z.string(),
    errors: z.array(z.unknown()).optional(),
  })
  .openapi({ description: "Validation error – one or more fields are invalid" });

/** 404 Not Found */
const notFound = z
  .object({ status: z.literal(false), message: z.string() })
  .openapi({ description: "Resource not found" });

/** 403 Forbidden */
const forbidden = z
  .object({ status: z.literal(false), message: z.string() })
  .openapi({ description: "Forbidden – insufficient role/permissions" });

/** 500 Internal Server Error */
const serverError = z
  .object({ status: z.literal(false), message: z.string() })
  .openapi({ description: "Unexpected server error" });

// ─────────────────────────────────────────────────────────────
// Route-specific schemas (path params / inline bodies)
// ─────────────────────────────────────────────────────────────

const assignManagerPathParams = z.object({
  id: z.coerce
    .number()
    .openapi({ description: "Department ID", example: 6 }),
});

const assignManagerBody = z.object({
  userId: z.string().openapi({ example: "wer234-34sfr-565t5" }),
});

const assignEmployeePathParams = z.object({
  id: z.coerce
    .number()
    .openapi({ description: "Employee ID", example: 123456 }),
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
  id: z.coerce
    .number()
    .openapi({ description: "Leave application ID (leaveId)", example: 12 }),
});

const processLeaveQuery = z.object({
  status: z
    .enum([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED])
    .openapi({ example: "approved" }),
});

const leaveIdParam = z.object({
  id: z.coerce
    .number()
    .openapi({ description: "Leave application ID", example: 12 }),
});

const attendanceRecordIdParam = z.object({
  id: z.coerce
    .number()
    .openapi({ description: "Attendance record ID", example: 1 }),
});

const departmentIdParam = z.object({
  departmentId: z.coerce.number().openapi({ example: 1 }),
});

const employeeIdParam = z.object({
  employeeId: z.coerce.number().openapi({ example: 12445 }),
});

// ─────────────────────────────────────────────────────────────
// One-time registration guard
// ─────────────────────────────────────────────────────────────

let openApiPathsRegistered = false;

export function registerAllOpenApiPaths() {
  if (openApiPathsRegistered) return;
  openApiPathsRegistered = true;

  // ═══════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════

  registerRoute({
    method: "post",
    path: "/api/login",
    tags: ["Auth"],
    requestBody: loginSchema,
    responses: {
      200: {
        description:
          "Login successful – JWT returned in JSON body and optionally set as an `token` HttpOnly cookie.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          token: z.string().openapi({
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            description: "Bearer token; pass this in the Authorization header for all protected routes.",
          }),
          role: z.string().openapi({ example: "employee" }),
        }),
      },
      400: { description: "Validation error – email or password missing / malformed", body: validationFail },
      401: { description: "Invalid credentials – email not found or password mismatch", body: fail },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/createUser",
    tags: ["Auth"],
    security: bearer,
    requestBody: createUserBody,
    responses: {
      201: {
        description: "User created successfully. Returns the new user UUID and employee ID.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          data: z.object({
            userId: z.string().uuid().openapi({ example: "a1b2c3d4-..." }),
            employeeId: z.number().openapi({ example: 52837461 }),
          }),
        }),
      },
      400: { description: "Validation error – required fields missing or invalid", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins may create users", body: forbidden },
      409: {
        description: "Conflict – username or email already exists",
        body: fail,
      },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "post",
    path: "/api/forgot-password",
    tags: ["Auth"],
    requestBody: verifyEmailSchema,
    responses: {
      200: {
        description:
          "A 6-digit verification code was e-mailed to the address. Store the returned `tokenInfo.tokenId` – you need it for the next step (`PUT /api/verify-token/{id}`).",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          email: z.string().email().openapi({ example: "user@example.com" }),
          tokenInfo: z
            .object({
              tokenId: z.number().openapi({ example: 7 }),
              createdAt: z.string().openapi({ example: "2025-06-01T08:30:00.000Z" }),
            })
            .openapi({ description: "Use tokenId in the next verification step." }),
        }),
      },
      400: { description: "Validation error – invalid email format", body: validationFail },
      404: {
        description: "No account found for this email address",
        body: z.object({
          status: z.literal(false),
          message: z.string(),
          email: z.string(),
        }),
      },
      500: { description: "Failed to send email or unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "put",
    path: "/api/verify-token/{id}",
    tags: ["Auth"],
    params: z.object({
      id: z.coerce
        .number()
        .openapi({ description: "Token ID (`password_reset_tokens.token_id`) from the forgot-password response", example: 7 }),
    }),
    requestBody: verifyTokenSchema.omit({ tokenId: true }),
    responses: {
      200: {
        description:
          "Token is valid and not expired. Store the returned `userId` for the password-reset step.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          userId: z.string().openapi({ example: "a1b2c3d4-e5f6-..." }),
        }),
      },
      400: { description: "Validation error – token field missing", body: validationFail },
      401: {
        description: "Token is invalid, already used, or has expired (5-minute window)",
        body: fail,
      },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "put",
    path: "/api/reset-password/{id}",
    tags: ["Auth"],
    params: z.object({
      id: z.string().openapi({ description: "User ID (UUID) returned by the token-verify step", example: "a1b2c3d4-e5f6-..." }),
    }),
    requestBody: resetPasswordSchema,
    responses: {
      200: { description: "Password updated successfully", body: ok },
      400: { description: "Validation error – password too short (min 6 chars)", body: validationFail },
      404: { description: "User ID not found", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  // ═══════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════

  registerRoute({
    method: "get",
    path: "/api/currentUser",
    tags: ["Users"],
    security: bearer,
    responses: {
      200: {
        description:
          "Returns the full profile of the authenticated user including their employee record.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          data: z
            .object({
              userId: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              phone: z.string().nullable(),
              username: z.string(),
              email: z.string(),
              role: z.string(),
              employeeId: z.number(),
              designation: z.string().nullable(),
              hireDate: z.string().nullable(),
              status: z.string(),
              departmentId: z.number().nullable(),
            })
            .openapi({ description: "Authenticated user's profile with employee details" }),
        }),
      },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      404: { description: "User record not found (data integrity issue)", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/user",
    tags: ["Users"],
    security: bearer,
    query: getUserSchema,
    responses: {
      200: {
        description:
          "Returns a single user matched by one of the provided filters (uid, eid, username, phone, or email). Includes department and address info.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          data: z
            .object({
              userId: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              phone: z.string().nullable(),
              username: z.string(),
              email: z.string(),
              role: z.string(),
              employeeId: z.number(),
              designation: z.string().nullable(),
              hireDate: z.string().nullable(),
              status: z.string(),
              departmentId: z.number().nullable(),
              departmentName: z.string().nullable(),
              deptDescription: z.string().nullable(),
              managerId: z.string().nullable(),
              division: z.string().nullable(),
              district: z.string().nullable(),
              thana: z.string().nullable(),
              postCode: z.string().nullable(),
            })
            .openapi({ description: "Full user details including department and address" }),
        }),
      },
      400: { description: "Validation error – invalid filter value", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      404: { description: "No user found matching the given filters", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/users",
    tags: ["Users"],
    security: bearer,
    query: getUsersSchema,
    responses: {
      200: {
        description:
          "Cursor-paginated list of users. Pass the returned `pageInfo.nextCursor` as the `cursor` query param to fetch the next page. Results include department and address.",
        body: okPaginated,
      },
      400: { description: "Validation error – invalid filter or pagination value", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – insufficient role", body: forbidden },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  // ═══════════════════════════════════════════
  // DEPARTMENT
  // ═══════════════════════════════════════════

  registerRoute({
    method: "post",
    path: "/api/createDepartment",
    tags: ["Department"],
    security: bearer,
    requestBody: departmentReqBody,
    responses: {
      200: {
        description: "Department created. Returns the new auto-generated department ID.",
        body: z.object({
          message: z.string(),
          departmentID: z.number().openapi({ example: 3 }),
        }),
      },
      400: { description: "Validation error – name too long or missing", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins can create departments", body: forbidden },
      409: {
        description: "Conflict – a department with this name already exists",
        body: fail,
      },
      500: { description: "Unexpected server error", body: serverError },
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
      200: {
        description:
          "Manager assigned to the department. The user's role is upgraded to `manager` if it was previously `employee`.",
        body: ok,
      },
      400: { description: "Validation error – invalid userId or departmentId", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins can assign managers", body: forbidden },
      404: { description: "Department or user not found", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
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
      200: { description: "Employee's department assignment updated successfully", body: ok },
      400: { description: "Validation error – invalid employeeId or departmentId", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – employees cannot reassign department membership", body: forbidden },
      404: { description: "Employee or department not found", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  // ═══════════════════════════════════════════
  // ATTENDANCE
  // ═══════════════════════════════════════════

  registerRoute({
    method: "post",
    path: "/api/attendance/checkin",
    tags: ["Attendance"],
    security: bearer,
    responses: {
      200: {
        description:
          "Check-in recorded for today. The attendance date is set to the current UTC date and the check-in time to the current local time of the server.",
        body: ok,
      },
      400: {
        description: "Already checked in for today – duplicate check-in prevented by unique index on (employeeId, attendanceDate)",
        body: fail,
      },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "patch",
    path: "/api/attendance/checkout/{id}",
    tags: ["Attendance"],
    security: bearer,
    params: attendanceRecordIdParam,
    responses: {
      200: { description: "Check-out time recorded on the attendance record", body: ok },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      404: {
        description: "No attendance record found with the given ID",
        body: notFound,
      },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/byDate",
    tags: ["Attendance"],
    security: bearer,
    query: getAttendanceByDateSchema,
    responses: {
      200: {
        description:
          "Cursor-paginated attendance records for the specified date (or today if omitted). Records are ordered by department name then check-in time.",
        body: okPaginated,
      },
      400: { description: "Validation error – invalid date format or limit out of range", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      500: { description: "Unexpected server error", body: serverError },
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
      200: {
        description:
          "Cursor-paginated attendance records scoped to a specific department for the given date (today if omitted). Ordered by check-in time.",
        body: okPaginated,
      },
      400: { description: "Validation error – invalid departmentId or date", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      404: { description: "Department not found", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
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
      200: {
        description:
          "All attendance records for the given employee within the calendar month of the supplied date (current month if omitted). Ordered by attendance date ascending.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          data: z.array(
            z.object({
              attendanceId: z.number(),
              attendanceDate: z.string(),
              checkInTime: z.string(),
              checkOutTime: z.string().nullable(),
              status: z.enum(["Present", "Leave"]),
            })
          ),
        }),
      },
      400: { description: "Validation error – invalid employeeId or date", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      404: { description: "Employee not found", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/me",
    tags: ["Attendance"],
    security: bearer,
    query: getAllAttendanceOfMeSchema,
    responses: {
      200: {
        description:
          "Cursor-paginated attendance history for the currently authenticated employee. Ordered by attendance date ascending.",
        body: okPaginated,
      },
      400: { description: "Validation error – invalid cursor or limit", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/absent/byDate",
    tags: ["Attendance"],
    security: bearer,
    query: getAbsentEmployeeByMonthSchema,
    responses: {
      200: {
        description:
          "List of employees who have no attendance record for the given date (today if omitted). Useful for identifying absentees. Ordered by department name.",
        body: z.object({
          status: z.number(),
          message: z.string(),
          data: z.array(
            z.object({
              employeeId: z.number(),
              firstName: z.string(),
              lastName: z.string(),
              departmentName: z.string().nullable(),
            })
          ),
        }),
      },
      400: { description: "Validation error – invalid date format", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/report/perEmployee/admin",
    tags: ["Attendance"],
    security: bearer,
    query: getPerEmployeeAttendanceReportForAdminSchema,
    responses: {
      200: {
        description:
          "Admin-level cursor-paginated report: present days, absent days, and total working days per employee for the requested month or year. Provide both `month` and `year` for a monthly report, or `year` only for a yearly aggregate.",
        body: okPaginated,
      },
      400: {
        description: "Validation error or missing required parameters (year is mandatory)",
        body: validationFail,
      },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins can access this report", body: forbidden },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/report/perDepartment/byMonth",
    tags: ["Attendance"],
    security: bearer,
    query: getAttendanceReportPerDepartmentByMonthSchema,
    responses: {
      200: {
        description:
          "Department-wise monthly attendance summary: total employees, total working days, total present days, and total absent days per department. Useful for dashboard widgets.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          data: z.array(
            z.object({
              department_name: z.string(),
              total_working_days: z.number(),
              total_employees: z.number(),
              total_present_days: z.number(),
              total_absent_days: z.number(),
            })
          ),
        }),
      },
      400: { description: "Validation error – invalid date", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/attendance/report/perEmployee/byMonth",
    tags: ["Attendance"],
    security: bearer,
    query: getAttendanceReportPerEmployeeByMonthSchema,
    responses: {
      200: {
        description:
          "Single-employee monthly attendance summary: present days, absent days, and total working days. Useful for individual employee dashboards.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          data: z.object({
            first_name: z.string(),
            last_name: z.string(),
            total_working_days: z.number(),
            present_days: z.number(),
            absent_days: z.number(),
          }),
        }),
      },
      400: { description: "Validation error – invalid date or missing employeeId", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      404: { description: "Employee not found", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  // ═══════════════════════════════════════════
  // LEAVE
  // ═══════════════════════════════════════════

  registerRoute({
    method: "post",
    path: "/api/applyLeave",
    tags: ["Leave"],
    security: bearer,
    requestBody: leaveReqBody,
    responses: {
      201: {
        description:
          "Leave application submitted and stored as `pending`. The total leave days are computed automatically from startDate and endDate (inclusive).",
        body: ok,
      },
      400: { description: "Validation error – missing dates, invalid leave type, or end date before start date", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/leave",
    tags: ["Leave"],
    security: bearer,
    query: leaveFilterSchema,
    responses: {
      200: {
        description:
          "Cursor-paginated list of leave applications, optionally filtered by leaveType, status, or departmentId. Results include applicant name and department.",
        body: okPaginated,
      },
      400: { description: "Validation error – invalid filter or pagination value", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      500: { description: "Unexpected server error", body: serverError },
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
      200: { description: "Leave application updated. Total days are recalculated.", body: ok },
      400: { description: "Validation error – invalid fields or date range", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins and managers can update leave records", body: forbidden },
      404: { description: "Leave application not found", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
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
      200: {
        description:
          "Leave processed successfully. If approved, attendance records are automatically created for each day of the leave period (status = `Leave`). Existing attendance records for those days are overwritten with source = `SYSTEM`.",
        body: ok,
      },
      400: { description: "Validation error – invalid status value", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only managers can process leave requests", body: forbidden },
      404: { description: "Leave application not found or already processed", body: notFound },
      409: {
        description: "Conflict – leave is not in `pending` state and cannot be reprocessed",
        body: fail,
      },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "delete",
    path: "/api/leave/{id}",
    tags: ["Leave"],
    security: bearer,
    params: leaveIdParam,
    responses: {
      200: { description: "Leave application permanently deleted", body: ok },
      400: { description: "Validation error – invalid leave ID", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins and managers can delete leave records", body: forbidden },
      404: { description: "Leave application not found", body: notFound },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/onLeave",
    tags: ["Leave"],
    security: bearer,
    query: getOnLeaveSchema,
    responses: {
      200: {
        description:
          "Employees currently on approved leave today. **Admin** receives a department-grouped JSON array. **Manager** receives a flat list scoped to their `departmentId` (required for managers).",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          data: z.union([
            z
              .array(
                z.object({
                  departmentId: z.number(),
                  departmentName: z.string(),
                  usersOnLeave: z.array(z.unknown()),
                })
              )
              .openapi({ description: "Admin view – grouped by department" }),
            z
              .array(
                z.object({
                  firstName: z.string(),
                  lastName: z.string(),
                  employeeId: z.number(),
                  designation: z.string().nullable(),
                  phone: z.string().nullable(),
                  email: z.string(),
                })
              )
              .openapi({ description: "Manager view – flat list for the given department" }),
          ]),
        }),
      },
      400: { description: "Validation error – invalid departmentId", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – employees cannot access this endpoint", body: forbidden },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  // ═══════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════

  registerRoute({
    method: "get",
    path: "/api/adminDashboardInfo",
    tags: ["Dashboard"],
    security: bearer,
    responses: {
      200: {
        description:
          "Aggregated counts for the admin dashboard: total users, total employees, active employees, today's attendance, pending leave requests, and employees on leave today.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          data: z.object({
            userStats: z.number().openapi({ description: "Total users (all roles)" }),
            totalEmployees: z.number().openapi({ description: "Total non-admin users" }),
            activeEmployees: z.number().openapi({ description: "Non-admin users with status = active" }),
            totalAttendedToday: z.number().openapi({ description: "Employees who checked in today" }),
            totalPendingLeave: z.number().openapi({ description: "Leave applications with status = pending" }),
            totalOnLeaveToday: z.number().openapi({ description: "Employees on approved leave today" }),
          }),
        }),
      },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins can access this endpoint", body: forbidden },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  registerRoute({
    method: "get",
    path: "/api/managerDashboardInfo",
    tags: ["Dashboard"],
    security: bearer,
    query: getManagerDashboardInfoSchema,
    responses: {
      200: {
        description:
          "Department-scoped stats for the manager dashboard: headcount, active employees, today's attendance, pending leave, and on-leave count.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          departmentName: z.string(),
          data: z.object({
            totalEmployees: z.number(),
            activeEmployees: z.number(),
            attendedToday: z.number(),
            pendingLeave: z.number(),
            onLeaveToday: z.number(),
          }),
        }),
      },
      400: { description: "Validation error – missing or invalid departmentId", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: {
        description: "Forbidden – caller is not the manager of the requested department",
        body: z.object({ message: z.string() }),
      },
      500: { description: "Unexpected server error", body: serverError },
    },
  });

  // ═══════════════════════════════════════════
  // CALENDAR
  // ═══════════════════════════════════════════

  registerRoute({
    method: "post",
    path: "/api/generateCalenderYear",
    tags: ["Calendar"],
    security: bearer,
    requestBody: calendarYearSchema,
    responses: {
      200: {
        description:
          "Calendar rows generated for every day of the requested year. Weekends (Saturday & Sunday) are automatically flagged. Existing rows are silently skipped (`ON CONFLICT DO NOTHING`), so re-running is safe.",
        body: z.object({ message: z.string() }),
      },
      400: { description: "Validation error – year missing or less than 4 characters", body: validationFail },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins can generate calendar data", body: forbidden },
      500: { description: "Server error while inserting calendar rows", body: z.object({ message: z.string() }) },
    },
  });

  // ═══════════════════════════════════════════
  // PAYROLL
  // ═══════════════════════════════════════════

  registerRoute({
    method: "post",
    path: "/api/payroll/start",
    tags: ["Payroll"],
    security: bearer,
    requestBody: startPayrollBodySchema,
    responses: {
      202: {
        description:
          "Payroll job accepted and added to the BullMQ `payroll` queue. The worker will compute gross and net salary for every employee based on attendance records for the calendar month containing `payDate`. Job ID format: `payroll-YYYY-MM-DD`.",
        body: z.object({
          status: z.literal(true),
          message: z.string(),
          jobId: z.string().openapi({ example: "payroll-2025-06-01" }),
          jobName: z.string().openapi({ example: "run-payroll" }),
          payDate: z.string().openapi({ example: "2025-06-01" }),
        }),
      },
      400: {
        description: "Validation error – `payDate` missing, empty, or not a parseable date string",
        body: validationFail,
      },
      401: { description: "Unauthorized – missing or invalid JWT", body: fail },
      403: { description: "Forbidden – only admins can trigger payroll runs", body: forbidden },
      409: {
        description:
          "Conflict – a payroll job for this month is already queued, delayed, or actively running. Check BullMQ to monitor progress.",
        body: fail,
      },
      503: {
        description:
          "Service unavailable – Redis is not reachable. Start Redis on `REDIS_HOST:REDIS_PORT` (default `127.0.0.1:6379`), e.g. `docker compose up -d`.",
        body: fail,
      },
      500: { description: "Unexpected server error", body: serverError },
    },
  });
}