import { employees } from "../db/schema";
import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/setup";
import { users } from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { PermissionRequest, Role } from "../middlewares/checkPermission";
const crypto = require("crypto");

const userReqBody = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["admin", "manager", "employee"]),
});
export const createUser = async (req: PermissionRequest, res: Response) => {
  try {
    if (req.role !== Role.ADMIN) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this" });
    }
    const { firstName, lastName, phone, username, email, password, role } =
      userReqBody.parse(req.body);
    const user = await db
      .insert(users)
      .values({
        userId: uuidv4(),
        firstName,
        lastName,
        phone,
        username,
        email,
        password,
        role,
      })
      .returning({ userId: users.userId })
      .execute();
    const employee = await db
      .insert(employees)
      .values({
        employeeId: crypto.randomInt(10000000, 100000000),
        userId: user[0].userId,
      })
      .returning({ employeeId: employees.employeeId })
      .execute();

    return res
      .status(201)
      .json({
        status: true,
        message: "User created successfully",
        data: { userId: user[0].userId, employeeId: employee[0].employeeId },
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid data type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ name: "Internal server error", error });
  }
};
