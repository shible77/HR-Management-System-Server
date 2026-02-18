import { z } from 'zod';

export const departmentReqBody = z.object({
  departmentName: z.string().max(50).openapi({example : "Sales Department", description: "The length of the department name should be within 50 characters."}),
  description: z.string().openapi({example : "This is a well-known department of this company.....", description: "Instruct end-user to put a brief about the department."}),
}).openapi({description : "Create a department"});

export const assignManagerReqBody = z.object({
  userId: z.string().max(50).openapi({example : "wer234-34sfr-565t5"}),
  departmentId: z.coerce.number().openapi({example : "6"})
}).openapi({description : "Assign a manager to a department"});

export const assignEmployeeReqBody = z.object({
  departmentId : z.number().openapi({example : 5}),
  employeeId: z.coerce.number().openapi({example : 123456})
}).openapi({description : "Assign an employee to a specific department."});