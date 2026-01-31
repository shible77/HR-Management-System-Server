import express from 'express'
import { createUser } from '../controllers/auth.controllers/createUserController'
import { verifySession } from '../middlewares/verifySession'
import { checkPermission } from '../middlewares/checkPermission'
const createUserRouter = express.Router()

/**
 * @swagger
 * /api/createUser:
 *   post:
 *     summary: Create a new user and an associated employee record
 *     description: This endpoint allows an admin to create a new user in the system and automatically creates an associated employee record. Requires authentication via bearer header.
 *     tags:
 *       - Create User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: "123-456-7890"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, employee]
 *                 example: "admin || manager || employee"
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "f7e9b3d0-8a4d-4f87-b9b6-3dcbf4c5b674"
 *       403:
 *         description: User does not have permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to perform this"
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Invalid data type"
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["email must be a valid email address"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: object
 */

createUserRouter.post('/createUser',verifySession, checkPermission, createUser)

export default createUserRouter