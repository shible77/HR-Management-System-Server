import express from 'express'
import { verifySession } from './../middlewares/verifySession';
import { checkPermission, Role } from '../middlewares/checkPermission';
import { getDashboardInfo } from '../controllers/dashboardController';

const dashboardRouter = express.Router()

/**
 * @swagger
 * /api/dashboardInfo:
 *   get:
 *     summary: Fetch dashboard information
 *     description: Fetches aggregated information for the dashboard. The data returned depends on the role of the requester (ADMIN or MANAGER).
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: false
 *         description: ID of the department (required for MANAGER role).
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Aggregated dashboard data successfully fetched.
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
 *                   example: 80
 *                 activeEmployees:
 *                   type: integer
 *                   example: 75
 *                 totalAttendedEmployeesToday:
 *                   type: integer
 *                   example: 70
 *                 totalPendingLeaveRequest:
 *                   type: integer
 *                   example: 5
 *                 totalOnLeaveEmployeesToday:
 *                   type: integer
 *                   example: 3
 *                 departmentName:
 *                   type: string
 *                   example: "Sales"
 *                 totalEmployeesInDept:
 *                   type: integer
 *                   example: 20
 *                 totalActiveEmployeesInDept:
 *                   type: integer
 *                   example: 18
 *       403:
 *         description: User lacks the necessary permissions to access this resource.
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
 *       500:
 *         description: Internal server error occurred.
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
dashboardRouter.get('/dashboardInfo', verifySession, checkPermission([Role.ADMIN, Role.MANAGER]), getDashboardInfo)


export default dashboardRouter
