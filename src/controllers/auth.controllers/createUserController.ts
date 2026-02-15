import { employees } from "../../db/schema";
import { Request, Response } from "express";
import { db } from "../../db/setup";
import { users } from "../../db/schema";
import { v7 as uuidv7 } from "uuid";
import { Role } from "../../middlewares/checkPermission";
import { SessionRequest } from "../../middlewares/verifySession";
const crypto = require("crypto");
import { createUserBody } from "../../validators/auth.schema";
import { validate } from "../../utils/validate";

export const createUser = async (req: SessionRequest, res: Response) => {
  try {
    if (req.role !== Role.ADMIN) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this" });
    }
    const { firstName, lastName, phone, username, email, password, role } = validate(createUserBody, req.body);
    const userId = uuidv7();
    const user = await db
      .insert(users)
      .values({
        userId: userId,
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
  } catch(error){
    throw error; 
  }
};
