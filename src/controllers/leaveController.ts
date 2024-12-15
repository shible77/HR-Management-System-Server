import {  Response } from "express";
import { db } from "../db/setup";
import { leaveApplications, users, employees } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { LeaveType} from "../types";
import { SessionRequest } from "../middlewares/verifySession";
import { getDateDiff } from '../utils/getDateDiff';

const leaveReqBody = z.object({
    leaveTypes : z.enum([LeaveType.CASUAL, LeaveType.MEDICAL, LeaveType.ANNUAL]),
    startDate : z.string(),
    endDate : z.string(),
    reason : z.string()
})

export const applyLeave = async (req : SessionRequest, res : Response) => {
    try {
        const { leaveTypes, startDate, endDate, reason } = leaveReqBody.parse(req.body);
        const  userId  = req.userID!;
        const days = getDateDiff(startDate, endDate);
        const application = await db.insert(leaveApplications).values({
            userId,
            leaveType : leaveTypes,
            startDate : startDate,
            endDate : endDate,
            reason,
            totalDays : days
        }).returning({ leaveId : leaveApplications.leaveId }).execute();

        return res.status(201).json({
            message : 'Leave Application Created Successfully',
            leaveId : application[0].leaveId
        })

    }catch(error){
        if(error instanceof z.ZodError){
            return res.status(400).json({
                name : 'Invalid Data Type',
                message : JSON.parse(error.message)
            })
        }
        return res.status(500).json({message : 'Internal Server Error', error})
    }
}