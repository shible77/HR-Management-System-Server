import express from 'express';
import { resetPassword, verifyEmail, verifyToken } from '../controllers/auth.controllers/forgotPasswordControllers';

const forgotPasswordRouter = express.Router()

forgotPasswordRouter.post('/forgot-password', verifyEmail)

forgotPasswordRouter.put('/verify-token/:id', verifyToken)

forgotPasswordRouter.put('/reset-password/:id', resetPassword)

export default forgotPasswordRouter;