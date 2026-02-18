import { z } from 'zod';

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