import express from 'express'
import { loginUser } from '../../controllers/loginController'

const loginRouter = express.Router()
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Logs in a user with their email and password. Returns an authentication token and role of the user if successful.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "f7e9b3d0-8a4d-4f87-b9b6-3dcbf4c5b674"
 *                 role:
 *                   type: string
 *                   example: "admin || manager || employee"
 * 
 *       401:
 *         description: Invalid email or password
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
 *                   example: "Invalid email or password"
 *       400:
 *         description: Invalid request body
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
 *                   example: ["email must be a valid email address"]
 *       500:
 *         description: Internal server error
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
 *                   example: "Internal server error"
 */

loginRouter.post('/login', loginUser)

export default loginRouter