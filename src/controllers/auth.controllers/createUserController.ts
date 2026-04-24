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
import * as argon2 from "argon2";
export const createUser = async (req: SessionRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, username, email, password, role } = validate(createUserBody, req.body);
    const hashed_password = await argon2.hash(password);
    const user= await db.transaction(async (trx) => {
      const userId = uuidv7();
      const user = await trx
        .insert(users)
        .values({
          userId: userId,
          firstName,
          lastName,
          phone,
          username,
          email,
          password: hashed_password,
          role,
        })
        .returning({ userId: users.userId })
        .execute();
      const employee = await trx
        .insert(employees)
        .values({
          employeeId: crypto.randomInt(10000000, 100000000),
          userId: user[0].userId,
        })
        .returning({ employeeId: employees.employeeId })
        .execute();

        return {...user[0], ...employee[0]};
    })

    if(!user){
      return res.status(500)
      .json({
        status: false,
        message: "Failed to create user",
      });
    }

    return res
      .status(201)
      .json({
        status: true,
        message: "User created successfully",
        data: { userId: user.userId, employeeId: user.employeeId },
      });
  } catch (error) {
    throw error;
  }
};
