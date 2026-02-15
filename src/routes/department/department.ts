import express from 'express'
import { verifySession } from '../../middlewares/verifySession'
import { checkPermission } from '../../middlewares/checkPermission'
import { assignEmployee, assignManager, createDepartment } from '../../controllers/department.controllers/departmentController'

const departmentRouter = express.Router()

departmentRouter.post('/createDepartment', verifySession, checkPermission, createDepartment)

departmentRouter.put('/assignManager/:id', verifySession, checkPermission, assignManager)

departmentRouter.put('/assignEmployee/:id', verifySession, checkPermission, assignEmployee)

export default departmentRouter;