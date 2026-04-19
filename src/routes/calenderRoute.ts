import  express  from "express";
import { generateCalendarYear } from "../controllers/calendarController";
import { verifySession } from "../middlewares/verifySession";
import { checkPermission } from "../middlewares/checkPermission";
import { Role } from "../middlewares/checkPermission";

const calenderRouter = express.Router();

calenderRouter.post('/generateCalenderYear',verifySession, checkPermission([Role.ADMIN]) ,generateCalendarYear, );

export default calenderRouter;
