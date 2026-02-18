import { z } from "zod";
import { Status } from "../types/types";
import { Role } from "../middlewares/checkPermission";

export const getUserSchema = z.object({
    uid: z.string().optional().openapi({example:'hibicb-8427-ygvwdb'}),
    eid: z.coerce.number().optional().openapi({example: 12345}),
    username: z.string().min(2).max(100).optional().openapi({example: "shible7"}),
    phone: z.string().min(10).max(15).optional().openapi({example: '01738668434'}),
    email: z.email().optional().openapi({example : 'shible0805@gmail.com'}),
}).openapi({description:"Get a specific user by the specific queries."});

export const getUsersSchema = z.object({
    departmentId: z.coerce.number().int().positive().optional().openapi({example:12}),
    designation: z.string().optional().openapi({example: "salesman"}),
    hireDate: z.string().optional().openapi({example: "2023-07-11"}),
    status: z.enum([Status.ACTIVE, Status.INACTIVE]).optional().openapi({example: "active"}),
    role: z.enum([Role.ADMIN, Role.MANAGER, Role.EMPLOYEE]).optional().openapi({example: "employee"}),
    limit: z.coerce.number().min(1).max(100).optional().default(10).openapi({example : 10}),
    cursor: z.string().optional().openapi({example : "hibicb-8427-ygvwdb"})
}).openapi({description : "Get list of users by specific queries."});