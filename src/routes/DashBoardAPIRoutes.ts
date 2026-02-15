import express from 'express'
import { verifySession } from './../middlewares/verifySession';
import { checkPermission, Role } from '../middlewares/checkPermission';
import { getAdminDashboardInfo, getManagerDashboardInfo } from '../controllers/dashboardController';

const dashboardRouter = express.Router()


dashboardRouter.get('/adminDashboardInfo', verifySession, checkPermission([Role.ADMIN]), getAdminDashboardInfo);
dashboardRouter.get('/managerDashboardInfo', verifySession, checkPermission([Role.MANAGER]), getManagerDashboardInfo);


export default dashboardRouter
