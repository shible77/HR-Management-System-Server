import { Request, Response } from "express";
import { users } from "../../db/schema";
import { db } from "../../db/setup";
import { eq } from "drizzle-orm";
import { validate } from "../../utils/validate";
import { loginSchema } from "../../validators/auth.schema";
import { generateToken } from "../../config/jwt";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = validate(loginSchema, req.body);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();

    if (user.length > 0 && user[0].password === password) {
      const userToken = generateToken({userId: user[0].userId, role: user[0].role})
      res.cookie("token", userToken, {
        httpOnly: false, // Prevents client-side JavaScript from accessing the cookie
        secure: false, //process.env.NODE_ENV === 'production',      // Ensures the cookie is only sent over HTTPS
        sameSite: "lax", // Helps prevent CSRF attacks
      });
      return res.status(200).json({
        status: true,
        message: "Login successful",
        token: userToken,
        role: user[0].role
      });
    }
    return res.status(401).json({
      status: false,
      message: "Invalid email or password",
    });
  } catch (error) {
    throw new Error("Login failed");
  }
};
