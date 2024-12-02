import express, { Response } from "express";
import { verifySession } from "../../middlewares/verifySession";
import { getCurrentUser, getUser, getUsers } from "../../controllers/userController";
import { checkPermission } from "../../middlewares/checkPermission";
const userRouter = express.Router();

/**
 * @swagger
 * /api/currentUser:
 *   get:
 *     summary: Get current user's information
 *     description: Retrieves detailed information about the currently authenticated user, including user and employee details. Requires authentication via bearer header.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information fetched successfully
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
 *                   example: "Current user info fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "f7e9b3d0-8a4d-4f87-b9b6-3dcbf4c5b674"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "123-456-7890"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@example.com"
 *                     role:
 *                       type: string
 *                       enum: [admin, manager, employee]
 *                       example: "manager"
 *                     employeeId:
 *                       type: number
 *                       example: 12345678
 *                     designation:
 *                       type: string
 *                       example: "Software Engineer"
 *                     hireDate:
 *                       type: string
 *                       format: date
 *                       example: "2022-01-15"
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *                       example: "active"
 *                     departmentId:
 *                       type: string
 *                       example: "IT-123"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Invalid Data Type"
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["userID is required"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: object
 */
userRouter.get('/currentUser', verifySession, getCurrentUser)

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Fetch detailed user information
 *     description: Retrieves detailed information about a user, including associated employee, department, and address details. Query parameters can filter by user ID or employee ID.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: uid
 *         in: query
 *         description: The unique ID of the user
 *         required: false
 *         schema:
 *           type: string
 *           example: "f7e9b3d0-8a4d-4f87-b9b6-3dcbf4c5b674"
 *       - name: eid
 *         in: query
 *         description: The unique ID of the employee
 *         required: false
 *         schema:
 *           type: number
 *           example: 12345678
 *     responses:
 *       200:
 *         description: User information fetched successfully
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
 *                   example: "Info of user is fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "f7e9b3d0-8a4d-4f87-b9b6-3dcbf4c5b674"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "123-456-7890"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@gmail.com"
 *                     role:
 *                       type: string
 *                       enum: [admin, manager, employee]
 *                       example: "manager"
 *                     employeeId:
 *                       type: number
 *                       example: 12345678
 *                     designation:
 *                       type: string
 *                       example: "Software Engineer"
 *                     hireDate:
 *                       type: string
 *                       format: date
 *                       example: "2022-01-15"
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *                       example: "active"
 *                     departmentId:
 *                       type: string
 *                       example: "IT-123"
 *                     departmentName:
 *                       type: string
 *                       example: "IT Department"
 *                     deptDescription:
 *                       type: string
 *                       example: "Handles all IT-related activities"
 *                     managerId:
 *                       type: string
 *                       example: "mgr-7890"
 *                     division:
 *                       type: string
 *                       example: "North"
 *                     district:
 *                       type: string
 *                       example: "Capital City"
 *                     thana:
 *                       type: string
 *                       example: "Central Thana"
 *                     postCode:
 *                       type: string
 *                       example: "12345"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Invalid Data Type"
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["uid must be a string", "eid must be a number"]
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: object
 */
userRouter.get('/user', verifySession, getUser)

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Fetch a paginated list of users with optional filtering
 *     description: Retrieves a paginated list of users and their associated details. Filters can be applied to narrow the results.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - name: pageSize
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *       - name: departmentId
 *         in: query
 *         description: Filter by department ID
 *         required: false
 *         schema:
 *           type: integer
 *           example: 101
 *       - name: username
 *         in: query
 *         description: Filter by username
 *         required: false
 *         schema:
 *           type: string
 *           example: "john_doe"
 *       - name: phone
 *         in: query
 *         description: Filter by phone number
 *         required: false
 *         schema:
 *           type: string
 *           example: "123-456-7890"
 *       - name: email
 *         in: query
 *         description: Filter by email address
 *         required: false
 *         schema:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *       - name: designation
 *         in: query
 *         description: Filter by employee designation
 *         required: false
 *         schema:
 *           type: string
 *           example: "Software Engineer"
 *       - name: hireDate
 *         in: query
 *         description: Filter by hire date (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2022-01-15"
 *       - name: status
 *         in: query
 *         description: Filter by user status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *           example: "active"
 *       - name: role
 *         in: query
 *         description: Filter by user role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [admin, manager, employee]
 *           example: "manager"
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                   example: "Users fetched successfully"
 *                 totalItems:
 *                   type: integer
 *                   example: 100
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 next:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 2
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                 previous:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: null
 *                     limit:
 *                       type: integer
 *                       example: null
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: "f7e9b3d0-8a4d-4f87-b9b6-3dcbf4c5b674"
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       phone:
 *                         type: string
 *                         example: "123-456-7890"
 *                       username:
 *                         type: string
 *                         example: "john_doe"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "john.doe@example.com"
 *                       role:
 *                         type: string
 *                         enum: [admin, manager, employee]
 *                         example: "manager"
 *                       employeeId:
 *                         type: integer
 *                         example: 12345678
 *                       designation:
 *                         type: string
 *                         example: "Software Engineer"
 *                       hireDate:
 *                         type: string
 *                         format: date
 *                         example: "2022-01-15"
 *                       status:
 *                         type: string
 *                         enum: [active, inactive]
 *                         example: "active"
 *                       departmentId:
 *                         type: integer
 *                         example: 101
 *                       departmentName:
 *                         type: string
 *                         example: "IT Department"
 *                       managerId:
 *                         type: string
 *                         example: "mgr-7890"
 *                       division:
 *                         type: string
 *                         example: "North"
 *                       district:
 *                         type: string
 *                         example: "Capital City"
 *                       thana:
 *                         type: string
 *                         example: "Central Thana"
 *                       postCode:
 *                         type: string
 *                         example: "12345"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Invalid Data Type"
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["page must be a number"]
 *       403:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to access this resource"
 *       404:
 *         description: No users found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No users found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: object
 */
userRouter.get('/users', verifySession, checkPermission, getUsers)

export default userRouter;