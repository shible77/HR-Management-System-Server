import express from 'express'
import { verifySession } from '../../middlewares/verifySession'
import { checkPermission, Role } from '../../middlewares/checkPermission'
import { assignEmployee, assignManager, createDepartment } from '../../controllers/department.controllers/departmentController'

const departmentRouter = express.Router()

departmentRouter.post('/createDepartment', verifySession, checkPermission([Role.ADMIN]), createDepartment)

departmentRouter.put('/assignManager/:id', verifySession, checkPermission([Role.ADMIN]), assignManager)

departmentRouter.put('/assignEmployee/:id', verifySession, checkPermission([Role.ADMIN]), assignEmployee)

export default departmentRouter;