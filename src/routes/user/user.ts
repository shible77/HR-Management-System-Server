import express, { Response } from "express";
import { verifySession } from "../../middlewares/verifySession";
import { getCurrentUser, getUser, getUsers } from "../../controllers/userController";
import { checkPermission } from "../../middlewares/checkPermission";
const userRouter = express.Router();

userRouter.get('/currentUser', verifySession, getCurrentUser)

userRouter.get('/user', verifySession, getUser)

userRouter.get('/users', verifySession, checkPermission, getUsers)

export default userRouter;