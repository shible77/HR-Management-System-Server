import express , { Response } from 'express';
import { verifySession } from '../middlewares/verifySession';
import { checkPermission } from '../middlewares/checkPermission';
import { applyLeave, deleteLeave, getLeave, getOnLeave, processLeaveRequest, updateLeave } from '../controllers/leaveController';

const leaveRouter = express.Router();

/**
 * @swagger
 * /api/applyLeave:
 *   post:
 *     summary: Submit a leave application
 *     description: Allows authenticated users to apply for a leave by providing leave details such as type, start date, end date, and reason.
 *     tags:
 *       - Leave Management
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaveTypes
 *               - startDate
 *               - endDate
 *               - reason
 *             properties:
 *               leaveTypes:
 *                 type: string
 *                 enum: [casual, medical, annual]
 *                 description: The type of leave being applied for.
 *                 example: "casual || medical || annual"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the leave in YYYY-MM-DD format.
 *                 example: "2024-12-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the leave in YYYY-MM-DD format.
 *                 example: "2024-12-20"
 *               reason:
 *                 type: string
 *                 description: The reason for applying for the leave.
 *                 example: "Personal work"
 *     responses:
 *       201:
 *         description: Leave application submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Leave Application Created Successfully"
 *                 leaveId:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Validation error due to invalid or missing data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Invalid Data Type"
 *                 message:
 *                   type: object
 *                   description: Detailed validation errors.
 *       500:
 *         description: Internal server error.
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
leaveRouter.post('/applyLeave', verifySession, applyLeave)

/**
 * @swagger
 * /api/leave:
 *   get:
 *     summary: Fetch leave applications with optional filters and pagination
 *     description: Retrieves leave applications based on various filters such as user ID, department ID, leave type, and application status. Supports pagination.
 *     tags:
 *       - Leave Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by department ID
 *         example: 101
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *         example: "user123"
 *       - in: query
 *         name: leaveType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [casual, medical, annual]
 *         description: Filter by type of leave
 *         example: "casual"
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by leave application status
 *         example: "approved"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The page number for pagination
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Leave applications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Leave Application fetched Successfully"
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
 *                       leaveId:
 *                         type: integer
 *                         example: 123
 *                       userId:
 *                         type: string
 *                         example: "user123"
 *                       leaveType:
 *                         type: string
 *                         enum: [casual, medical, annual]
 *                         example: "casual"
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-12-15"
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-12-20"
 *                       totalDays:
 *                         type: integer
 *                         example: 5
 *                       status:
 *                         type: string
 *                         enum: [pending, approved, Rejected]
 *                         example: "pending"
 *                       reason:
 *                         type: string
 *                         example: "Medical emergency"
 *                       appliedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-01T10:00:00Z"
 *                       approvedBy:
 *                         type: string
 *                         nullable: true
 *                         example: "admin123"
 *                       departmentId:
 *                         type: integer
 *                         example: 101
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
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["page must be a number"]
 *       404:
 *         description: No leave applications found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No Leave Application found"
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
leaveRouter.get('/leave', verifySession, getLeave)

/**
 * @swagger
 * /api/leave/{id}:
 *   put:
 *     summary: Update an existing leave application
 *     description: Updates the details of a specific leave application identified by its ID. Only the user who submitted the application can update it.
 *     tags:
 *       - Leave Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the leave application to update
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveTypes:
 *                 type: string
 *                 enum: [casual, medical, annual]
 *                 example: "casual"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the leave
 *                 example: "2024-12-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the leave
 *                 example: "2024-12-20"
 *               reason:
 *                 type: string
 *                 description: The reason for the leave
 *                 example: "Family emergency"
 *     responses:
 *       200:
 *         description: Leave application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Leave Application Updated Successfully"
 *                 leaveId:
 *                   type: integer
 *                   example: 123
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
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["leaveTypes must be one of casual, medical, annual"]
 *       403:
 *         description: Unauthorized access to the leave application
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to update this leave application"
 *       404:
 *         description: Leave application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Leave Application not found"
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
leaveRouter.put('/leave/:id', verifySession, checkPermission, updateLeave)

/**
 * @swagger
 * /api/processLeave/{id}:
 *   put:
 *     summary: Approve or Reject a Leave Application
 *     description: Allows an admin or manager to approve or reject a pending leave application identified by its ID.For managers, the departmentId parameter is required.
 *     tags:
 *       - Leave Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the leave application to process
 *         example: 42
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [approved, rejected]
 *         description: The new status of the leave application
 *         example: "approved"
 *       - in: query
 *         name: departmentId
 *         required: false
 *         schema:
 *           type: integer
 *         description: The ID of the department, required for managers only
 *         example: 101
 *     responses:
 *       200:
 *         description: Leave application processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Leave Application Processed Successfully"
 *                 leaveId:
 *                   type: integer
 *                   example: 42
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
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["status must be one of approved, rejected"]
 *       403:
 *         description: Unauthorized access to process the leave application
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to process this leave application"
 *       404:
 *         description: Leave application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Leave Application not found"
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
leaveRouter.put('/processLeave/:id', verifySession, checkPermission, processLeaveRequest)

/**
 * @swagger
 * /api/leave/{id}:
 *   delete:
 *     summary: Delete a Leave Application
 *     description: Deletes a pending leave application identified by its ID. Only the user who submitted the application or an admin can delete it.
 *     tags:
 *       - Leave Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the leave application to delete
 *         example: 123
 *     responses:
 *       200:
 *         description: Leave application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Leave Application Deleted Successfully"
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
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["id must be a number"]
 *       403:
 *         description: Unauthorized access to delete the leave application
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to delete this leave application"
 *       404:
 *         description: Leave application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Leave Application not found"
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
leaveRouter.delete('/leave/:id', verifySession, checkPermission, deleteLeave)

/**
 * @swagger
 * /api/onLeave:
 *   get:
 *     summary: Get a list of employees who are on leave today
 *     description: Retrieve department-wise or individual employees who are on leave today based on the user role. Admins can view all departments, while managers can only view employees in their department.
 *     tags:
 *       - Leave Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: false
 *         schema:
 *           type: integer
 *         description: The unique ID of the department (required for managers)
 *         example: 101
 *     responses:
 *       200:
 *         description: Successfully retrieved data
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
 *                   example: "Department-wise data of employees on leave today"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       departmentId:
 *                         type: integer
 *                         example: 101
 *                       departmentName:
 *                         type: string
 *                         example: "Human Resources"
 *                       usersOnLeave:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             firstName:
 *                               type: string
 *                               example: "John"
 *                             lastName:
 *                               type: string
 *                               example: "Doe"
 *                             employeeId:
 *                               type: integer
 *                               example: 1001
 *                             designation:
 *                               type: string
 *                               example: "Software Engineer"
 *                             phone:
 *                               type: string
 *                               example: "+123456789"
 *                             email:
 *                               type: string
 *                               example: "john.doe@example.com"
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
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["departmentId must be a number"]
 *       403:
 *         description: Unauthorized access to the resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to access this resource"
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
leaveRouter.get('/onLeave', verifySession, checkPermission, getOnLeave)

export default leaveRouter