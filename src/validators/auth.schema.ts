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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
});

export const verifyTokenSchema = z.object({
  token: z.string(),
});

export const resetPasswordSchema = z.object({
    password : z.string().min(6)
})