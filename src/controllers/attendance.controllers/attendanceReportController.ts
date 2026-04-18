import { db } from "../../db/setup";
import { Response } from "express";
import { SessionRequest } from "../../middlewares/verifySession";
import { validate } from "../../utils/validate";
import {
    getPerEmployeeAttendanceReportForAdminSchema,
    getAttendanceReportPerDepartmentByMonthSchema,
    getAttendanceReportPerEmployeeByMonthSchema
} from "../../validators/attendance.schema";
import { sql } from "drizzle-orm";

export const getPerEmployeeAttendanceReportForAdmin = async (
    req: SessionRequest,
    res: Response,
) => {
    try {
        const { month, year, cursor, limit } = validate(getPerEmployeeAttendanceReportForAdminSchema, { ...req.query });
        let requestedDate = new Date();
        if (month && year) {
            requestedDate = new Date(Number(year), Number(month) - 1, 1);
        } else if (year && !month) {
            requestedDate = new Date(Number(year), 0, 1);
        } else {
            return res.status(400).json({ status: false, message: "Please provide year and month or at least year" })
        }
        const reqYear = requestedDate.getUTCFullYear();
        const reqMonth = requestedDate.getUTCMonth();

        const start = new Date(Date.UTC(reqYear, reqMonth, 1));
        const end = new Date(Date.UTC(reqYear, reqMonth + 1, 1));

        const formattedStart = start.toISOString().split("T")[0];
        const formattedEnd = end.toISOString().split("T")[0];

        const result = await db.execute(sql`
      WITH working_days AS (
      SELECT COUNT(*) AS total_working_days
      FROM calendar
      WHERE calendar_date >= ${formattedStart}
        AND calendar_date <  ${formattedEnd}
        AND is_weekend = false
        AND is_holiday = false
    ),

      attendance_summary AS (
        SELECT
          employee_id,
          COUNT(*) AS present_days
        FROM attendance
        WHERE attendance_date >= ${formattedStart}
        AND attendance_date <  ${formattedEnd}
        AND status = 'Present'
        GROUP BY employee_id
      )

      SELECT
        e.employee_id,
        u.user_id AS "userId",
        u.first_name,
        u.last_name,
        d.department_name,
        COALESCE(a.present_days, 0) AS present_days,
        w.total_working_days,
        w.total_working_days - COALESCE(a.present_days, 0) AS absent_days
        FROM employees e
        JOIN users u ON u.user_id = e.user_id
        JOIN departments d ON d.department_id = e.department_id
        LEFT JOIN attendance_summary a ON a.employee_id = e.employee_id
        CROSS JOIN working_days w
        WHERE (${cursor ?? null} IS NULL OR u.user_id > ${cursor ?? null})
        ORDER BY u.user_id ASC
        LIMIT ${limit + 1};
    `);

        const hasMore: boolean = result.rows.length > limit;
        const sliced = hasMore ? result.rows.slice(0, -1) : result.rows;
        const nextCursor = hasMore ? sliced[sliced.length - 1].userId : null;

        return res.status(200).json({ status: true, message: "Data fetch successfully", data: sliced, pageInfo: { nextCursor, hasMore } })
    } catch (error) {
        throw error;
    }
};

export const getAttendanceReportPerDepartmentByMonth = async (req: SessionRequest, res: Response) => {
    try {

        const { date } = validate(getAttendanceReportPerDepartmentByMonthSchema, { ...req.query })
        const requestedDate = date ? new Date(date) : new Date();

        const year = requestedDate.getUTCFullYear();
        const month = requestedDate.getUTCMonth();

        const start = new Date(Date.UTC(year, month, 1));
        const end = new Date(Date.UTC(year, month + 1, 1));

        const formattedStartDate = start.toISOString().split("T")[0];
        const formattedEndDate = end.toISOString().split("T")[0];

        const result = await db.execute(sql`
        WITH working_days AS (
        SELECT COUNT(*) AS total_working_days
        FROM calendar
        WHERE calendar_date >= ${formattedStartDate}
        AND calendar_date <  ${formattedEndDate}
        AND is_weekend = false
        AND is_holiday = false
        ),

      attendance_summary AS (
        SELECT
        employee_id,
        COUNT(*) AS present_days
        FROM attendance
        WHERE attendance_date >= ${formattedStartDate}
        AND attendance_date <  ${formattedEndDate}
        AND status = 'Present'
        GROUP BY employee_id
      )

      SELECT
        d.department_name,
        w.total_working_days,
        COUNT(e.employee_id) AS total_employees,
        SUM(COALESCE(a.present_days, 0)) AS total_present_days,
        SUM(w.total_working_days - COALESCE(a.present_days, 0)) AS total_absent_days
        FROM employees e
        JOIN departments d ON d.department_id = e.department_id
        LEFT JOIN attendance_summary a ON a.employee_id = e.employee_id
        CROSS JOIN working_days w
        GROUP BY d.department_name
        ORDER BY d.department_name;
    `);

        return res.status(200).json({ status: true, message: "Data fetch successfully", data: result.rows })
    } catch (error) {
        throw error;
    }
}

export const getAttendanceReportPerEmployeeByMonth = async (req: SessionRequest, res: Response) => {
    try{
        const { date, employeeId } = validate(getAttendanceReportPerEmployeeByMonthSchema, { ...req.query })
        const requestedDate = date ? new Date(date) : new Date();

        const year = requestedDate.getUTCFullYear();
        const month = requestedDate.getUTCMonth();

        const start = new Date(Date.UTC(year, month, 1));
        const end = new Date(Date.UTC(year, month + 1, 1));

        const formattedStartDate = start.toISOString().split("T")[0];
        const formattedEndDate = end.toISOString().split("T")[0];

        const result = await db.execute(sql`
        WITH working_days AS (
        SELECT COUNT(*) AS total_working_days
        FROM calendar
        WHERE calendar_date >= ${formattedStartDate}
        AND calendar_date <  ${formattedEndDate}
        AND is_weekend = false
        AND is_holiday = false
        ),

      attendance_summary AS (
        SELECT
        employee_id,
        COUNT(*) AS present_days
        FROM attendance
        WHERE attendance_date >= ${formattedStartDate}
        AND attendance_date <  ${formattedEndDate}
        AND status = 'Present'
        AND employee_id = ${employeeId}
        GROUP BY employee_id
      )

      SELECT
        u.first_name,
        u.last_name,
        w.total_working_days,
        COALESCE(a.present_days, 0) AS present_days,
        w.total_working_days - COALESCE(a.present_days, 0) AS absent_days
      FROM employees e
      JOIN users u ON u.user_id = e.user_id
      LEFT JOIN attendance_summary a ON a.employee_id = e.employee_id
      CROSS JOIN working_days w
      WHERE e.employee_id = ${employeeId};
    `);
        
    return res.status(200).json({ status: true, message: "Data fetch successfully", data: result.rows[0] })
    }catch(error){
        throw error;
    }
}