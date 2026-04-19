import express from "express";
import { verifySession } from "../middlewares/verifySession";
import { checkPermission, Role } from "../middlewares/checkPermission";
import { startPayroll } from "../controllers/payroll.controllers/payroll.controller";
const payrollRouter = express.Router();

payrollRouter.post("/payroll/start", verifySession, checkPermission([Role.ADMIN]), startPayroll)

export default payrollRouter;