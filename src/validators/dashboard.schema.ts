import { email, z } from "zod";

export const getManagerDashboardInfoSchema = z.object({
    departmentId: z.coerce.number().openapi({example : 5}),
}).openapi({description : "Get the dashboard info of a manager by department id."});