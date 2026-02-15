import express , { Response } from 'express';
import { verifySession } from '../middlewares/verifySession';
import { checkPermission, Role } from '../middlewares/checkPermission';
import { applyLeave, deleteLeave, getLeave, getOnLeave, processLeaveRequest, updateLeave } from '../controllers/leave.controllers/leaveController';

const leaveRouter = express.Router();

leaveRouter.post('/applyLeave', verifySession, applyLeave)

leaveRouter.get('/leave', verifySession, getLeave)

leaveRouter.put('/leave/:id', verifySession, checkPermission([Role.ADMIN, Role.MANAGER]), updateLeave)

leaveRouter.put('/processLeave/:id', verifySession, checkPermission([Role.MANAGER]), processLeaveRequest)

leaveRouter.delete('/leave/:id', verifySession, checkPermission([Role.ADMIN, Role.MANAGER]), deleteLeave)

leaveRouter.get('/onLeave', verifySession, checkPermission([Role.ADMIN, Role.MANAGER]), getOnLeave)

export default leaveRouter