import { z } from "zod";

export const createUserBody = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["admin", "manager", "employee"]),
});

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string(),
});