import { z } from "zod";

export const checkOutSchema = z.object({
    attendanceId: z.coerce.number().openapi({example: 1}),
}).openapi({description: "update attendance record with check-out time"});

export const getAttendanceByDateSchema = z.object({
    date: z.string().optional().openapi({example: "2024-06-01"}),
    cursor: z.coerce.number().optional().openapi({example: 10}),
    limit: z.coerce.number().optional().default(10).openapi({example: 10}),
}).openapi({description: "get attendance records for a specific date"});

export const getAttendanceByDepartmentSchema = z.object({
    date: z.string().optional().openapi({example: "2024-06-01"}),
    departmentId: z.coerce.number().openapi({example: 1}),
    cursor: z.coerce.number().optional().openapi({example: 10}),
    limit: z.coerce.number().optional().default(10).openapi({example: 10}),
}).openapi({description: "get attendance records for a specific date and department"});

export const getAttendanceByMonthSchema = z.object({
    date: z.string().optional().openapi({example: "2024-06-01"}),
    employeeId: z.coerce.number().openapi({example: 12445}),
}).openapi({description: "get attendance records for a specific date for a specific employee"});

export const getAllAttendanceOfMeSchema = z.object({
    cursor: z.coerce.number().optional().openapi({example: 10}),
    limit: z.coerce.number().optional().default(10).openapi({example: 10}),
}).openapi({description: "get all attendance records of the logged-in employee"});

export const getAbsentEmployeeByMonthSchema = z.object({
    date: z.string().optional().openapi({example: "2016-06-23"}),
}).openapi({description: "get all the absent employee by month"})

export const getPerEmployeeAttendanceReportForAdminSchema = z.object({
    month: z.string().optional().openapi({example: "1"}),
    year: z.string().optional().openapi({example: "2024"}),
    cursor: z.string().optional().openapi({example: "wetwe6-hsjs8-6s7d8"}),
    limit: z.coerce.number().optional().default(10).openapi({example: 10}),
}).openapi({description: "get monthly or yearly attendance report for admin. provide month and year for monthly report, provide only year for yearly report"});

export const getAttendanceReportPerDepartmentByMonthSchema = z.object({
    date: z.string().optional().openapi({
      example: "2024-06-01",
      description: "Provide any date of the month for which you want the report. If not provided, current month will be considered.",
    }),
}).openapi({description: "get monthly attendance report per department. Can be use for showing department-wise attendance summary in dashboard"});

export const getAttendanceReportPerEmployeeByMonthSchema = z.object({
    date: z.string().optional().openapi({
      example: "2024-06-01",
      description: "Provide any date of the month for which you want the report. If not provided, current month will be considered.",
    }),
    employeeId: z.coerce.number().openapi({example: 12445}),
}).openapi({description: "get monthly attendance report per employee. Can be use for showing employee-wise attendance summary in dashboard"});