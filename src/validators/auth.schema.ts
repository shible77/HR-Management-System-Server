import { z } from "zod";

export const createUserBody = z.object({
  firstName: z.string().openapi({example : "Salauddin"}),
  lastName: z.string().openapi({example : "Shible"}),
  phone: z.string().nullable().openapi({example: "01738668434"}),
  username: z.string().openapi({example : "shible7"}),
  email: z.email().openapi({example : "shible0805@gmail.com"}),
  password: z.string().min(6).openapi({example : "ShiblE77@", description:"Minimum length of password should be 6."}),
  role: z.enum(["admin", "manager", "employee"]).openapi({example : "employee"}),
}).openapi({description : "create an user"});

export const loginSchema = z.object({
  email: z.email().openapi({example : "shible0805@gmail.com"}),
  password: z.string().openapi({example : "ShiblE77@"}),
}).openapi({description : "Login as an user"});

export const verifyEmailSchema = z.object({
  email: z.email().openapi({example : "shible0805@gmail.com"}),
}).openapi({description : "verify you email for password change."});

export const verifyTokenSchema = z.object({
  tokenId:z.coerce.number().openapi({example : 2}),
  token: z.string().openapi({example : "123456"}),
}).openapi({description:"verify you email through the token sent to given your email."});

export const resetPasswordSchema = z.object({
    password : z.string().min(6).openapi({example : "ShiblE77@", description:"Minimum length of password should be 6."}),
}).openapi({description : "Reset your password."})