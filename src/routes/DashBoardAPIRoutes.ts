import express from 'express'
import { verifySession } from './../middlewares/verifySession';
import { checkPermission } from '../middlewares/checkPermission';
import { getDashboardInfo } from '../controllers/dashboardController';

const dashboardRouter = express.Router()

/**
 * @swagger
 * /api/dashboardInfo:
 *   get:
 *     summary: Get summary information for the admin dashboard
 *     description: Retrieve various counts and statistics required for the admin dashboard, such as total users, active employees, and leave requests.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Count of some fields for Dashboard fetched successfully"
 *                 totalUsers:
 *                   type: integer
 *                   example: 100
 *                 totalDepartments:
 *                   type: integer
 *                   example: 10
 *                 totalEmployees:
 *                   type: integer
 *                   example: 95
 *                 activeEmployees:
 *                   type: integer
 *                   example: 90
 *                 totalAttendedEmployeesToday:
 *                   type: integer
 *                   example: 85
 *                 totalPendingLeaveRequest:
 *                   type: integer
 *                   example: 5
 *                 totalOnLeaveEmployeesToday:
 *                   type: integer
 *                   example: 3
 *       403:
 *         description: Unauthorized access to the resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You don't have permission to perform this action"
 *       400:
 *         description: Validation error due to invalid or missing data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Invalid Data Type"
 *                 message:
 *                   type: string
 *                   example: "[{\"path\":[\"param\"],\"message\":\"Expected number, received string\"}]"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: object
 */
dashboardRouter.get('/dashboardInfo', verifySession, checkPermission, getDashboardInfo)


export default dashboardRouter
