import express , { Response } from 'express';
import { verifySession } from '../middlewares/verifySession';
import { checkPermission } from '../middlewares/checkPermission';
import { applyLeave, deleteLeave, getLeave, getOnLeave, processLeaveRequest, updateLeave } from '../controllers/leave.controllers/leaveController';

const leaveRouter = express.Router();

leaveRouter.post('/applyLeave', verifySession, applyLeave)

leaveRouter.get('/leave', verifySession, getLeave)

leaveRouter.put('/leave/:id', verifySession, checkPermission, updateLeave)

leaveRouter.put('/processLeave/:id', verifySession, checkPermission, processLeaveRequest)

leaveRouter.delete('/leave/:id', verifySession, checkPermission, deleteLeave)

leaveRouter.get('/onLeave', verifySession, checkPermission, getOnLeave)

export default leaveRouter