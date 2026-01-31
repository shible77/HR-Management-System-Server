import express from 'express'
import { verifySession } from '../../middlewares/verifySession'
import { checkPermission } from '../../middlewares/checkPermission'
import { assignEmployee, assignManager, createDepartment } from '../../controllers/department.controllers/departmentController'

const departmentRouter = express.Router()

/**
 * @swagger
 * /api/createDepartment:
 *   post:
 *     summary: Create a new department
 *     description: Allows administrators to create a new department by providing its name and description.
 *     tags:
 *       - Departments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentName
 *               - description
 *             properties:
 *               departmentName:
 *                 type: string
 *                 maxLength: 50
 *                 description: Name of the department
 *                 example: "IT Department"
 *               description:
 *                 type: string
 *                 description: Brief description of the department
 *                 example: "Handles all IT-related tasks and infrastructure"
 *     responses:
 *       200:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Department created successfully"
 *                 departmentID:
 *                   type: integer
 *                   example: 123
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
 *                   example: ["departmentName must be a string with a maximum length of 50"]
 *       403:
 *         description: Forbidden - User does not have the required permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to perform this"
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
departmentRouter.post('/createDepartment', verifySession, checkPermission, createDepartment)
/**
 * @swagger
 * /api/assignManager/{id}:
 *   put:
 *     summary: Assign a manager to a department
 *     description: Allows administrators to assign a manager to a specific department. Updates the user's role to "MANAGER" if not already assigned.
 *     tags:
 *       - Departments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the department to which the manager is assigned
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 maxLength: 50
 *                 description: The ID of the user to be assigned as the manager
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: Manager assigned successfully
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
 *                   example: "Manager assigned successfully"
 *       400:
 *         description: Invalid request data
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
 *                   example: "Invalid request"
 *       403:
 *         description: Forbidden - User does not have the required permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to perform this"
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
departmentRouter.put('/assignManager/:id', verifySession, checkPermission, assignManager)

/**
 * @swagger
 * /api/assignEmployee/{id}:
 *   put:
 *     summary: Assign an employee to a department
 *     description: Allows administrators or managers to assign a employee to a specific department.
 *     tags:
 *       - Departments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of employee
 *         example: 10141213
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - DepartmentId
 *             properties:
 *               departmentId:
 *                 type: integer
 *                 description: The ID of the department to where an employee is assigned.
 *                 example: 4
 *     responses:
 *       200:
 *         description: employee assigned successfully
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
 *                   example: "employee assigned successfully"
 *       400:
 *         description: Invalid request data
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
 *                   example: "Invalid request"
 *       403:
 *         description: Forbidden - User does not have the required permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to perform this"
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
departmentRouter.put('/assignEmployee/:id', verifySession, checkPermission, assignEmployee)

export default departmentRouter