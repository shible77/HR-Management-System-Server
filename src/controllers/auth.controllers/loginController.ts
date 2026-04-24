import { Request, Response } from "express";
import { employees, users } from "../../db/schema";
import { db } from "../../db/setup";
import { eq } from "drizzle-orm";
import { validate } from "../../utils/validate";
import { loginSchema } from "../../validators/auth.schema";
import { generateToken } from "../../config/jwt";
import * as argon2 from "argon2";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = validate(loginSchema, req.body);

    const user = await db
      .select({
        userId: users.userId,
        password: users.password,
        role: users.role,
        employeeId: employees.employeeId,
      })
      .from(users)
      .innerJoin(employees, eq(users.userId, employees.userId))
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    if (user.length === 0) {
      // Return the same message regardless of whether the email exists,
      // to prevent user-enumeration attacks.
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await argon2.verify(user[0].password, password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    const userToken = generateToken({
      userId: user[0].userId,
      employeeId: user[0].employeeId,
      role: user[0].role,
    });

    res.cookie("token", userToken, {
      httpOnly: true,                                    // fixed: was false — JS should not read auth cookies
      secure: process.env.NODE_ENV === "production",    // fixed: was hardcoded false
      sameSite: "lax",
    });

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token: userToken,
      role: user[0].role,
    });
  } catch (error) {
    throw error;
  }
};