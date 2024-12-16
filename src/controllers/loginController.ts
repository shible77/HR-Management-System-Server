import { Request, Response } from "express";
import { users, userTokens } from "../db/schema";
import { db } from "../db/setup";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { handleError } from "../utils/handleError";

const loginReqBody = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginReqBody.parse(req.body);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();
    if (user.length > 0 && user[0].password === password) {
      const userToken = await db
        .insert(userTokens)
        .values({ token: uuidv4(), userId: user[0].userId })
        .returning({ token: userTokens.token });
      res.cookie("token", userToken[0].token, {
        httpOnly: false, // Prevents client-side JavaScript from accessing the cookie
        secure: false, //process.env.NODE_ENV === 'production',      // Ensures the cookie is only sent over HTTPS
        sameSite: "lax", // Helps prevent CSRF attacks
      });
      return res.status(200).json({
        status: true,
        message: "Login successful",
        token: userToken[0].token,
        role: user[0].role
      });
    }
    return res.status(401).json({
      status: false,
      message: "Invalid email or password",
    });
  } catch (error) {
    handleError(error, res)
  }
};
