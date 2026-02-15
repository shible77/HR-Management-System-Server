import { z } from "zod";
import { Status } from "../types/types";
import { Role } from "../middlewares/checkPermission";

export const getUserSchema = z.object({
    uid: z.coerce.string().optional(),
    eid: z.coerce.number().optional(),
    username: z.string().min(2).max(100).optional(),
    phone: z.string().min(10).max(15).optional(),
    email: z.string().email().optional(),
});

export const getUsersSchema = z.object({
    departmentId: z.number().int().positive().optional(),
    designation: z.string().optional(),
    hireDate: z.string().optional(),
    status: z.enum([Status.ACTIVE, Status.INACTIVE]).optional(),
    role: z.enum([Role.ADMIN, Role.MANAGER, Role.EMPLOYEE]).optional(),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    cursor: z.coerce.string().optional()
});