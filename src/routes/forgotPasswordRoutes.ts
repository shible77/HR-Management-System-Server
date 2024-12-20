import express from 'express';
import { resetPassword, verifyEmail, verifyToken } from '../controllers/forgotPasswordControllers';

const forgotPasswordRouter = express.Router()

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     description: Verify the user's email and send a password reset verification code to the provided email address.
 *     tags:
 *       - Reset Password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Verification code sent to the provided email
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
 *                   example: "Verification code sent to your email"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *                 tokenInfo:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: integer
 *                       example: 123
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-20T10:45:00Z"
 *       404:
 *         description: Email not found in the system
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
 *                   example: "No user exist for this email"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *       400:
 *         description: Validation error due to invalid email format
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
 *                   example: "[{\"path\":[\"email\"],\"message\":\"Invalid email address format\"}]"
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
forgotPasswordRouter.post('/forgot-password', verifyEmail)

/**
 * @swagger
 * /api/verify-token/{id}:
 *   put:
 *     summary: Verify a password reset token
 *     description: Verify the provided token against the stored token information for password reset. Marks the token as used if valid.
 *     tags:
 *       - Reset Password
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the token to verify.
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Token verified successfully.
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
 *                   example: "Token verified"
 *                 userId:
 *                   type: integer
 *                   example: 45
 *       401:
 *         description: Token expired or invalid.
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
 *                   example: "Token expired or Invalid token"
 *       400:
 *         description: Validation error due to invalid token or token ID format.
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
 *                   example: "[{\"path\":[\"token\"],\"message\":\"Invalid token format\"}]"
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
forgotPasswordRouter.put('/verify-token/:id', verifyToken)

/**
 * @swagger
 * /api/reset-password/{id}:
 *   put:
 *     summary: Reset user password
 *     description: Resets the password for a user specified by the user ID.
 *     tags:
 *       - Reset Password
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user whose password is being reset.
 *         schema:
 *           type: string
 *           example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: New password for the user (minimum 6 characters).
 *                 example: "newSecurePassword123"
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Password reset successfully.
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
 *                   example: "Password reset successfully"
 *       400:
 *         description: Validation error due to invalid password format.
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
 *                   example: "[{\"path\":[\"password\"],\"message\":\"Password must be at least 6 characters long\"}]"
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
forgotPasswordRouter.put('/reset-password/:id', resetPassword)

export default forgotPasswordRouter;