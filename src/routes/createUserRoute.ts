import express from 'express'
import { createUser } from '../controllers/auth.controllers/createUserController'
import { verifySession } from '../middlewares/verifySession'
import { checkPermission } from '../middlewares/checkPermission'
import { Role } from '../middlewares/checkPermission'

const createUserRouter = express.Router()

createUserRouter.post('/createUser', verifySession, checkPermission([Role.ADMIN]), createUser)

export default createUserRouter