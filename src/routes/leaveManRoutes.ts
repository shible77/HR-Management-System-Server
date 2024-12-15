import express , { Response } from 'express';
import { verifySession } from '../middlewares/verifySession';
import { applyLeave } from '../controllers/leaveController';

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

export default leaveRouter