import { z } from "zod";

export const getManagerDashboardInfoSchema = z.object({
    departmentId: z.coerce.number(),
});