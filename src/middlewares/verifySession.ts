import { Request, Response, NextFunction } from "express";
import { userTokens, users } from "../db/schema";
import { db } from "../db/setup";
import { eq } from "drizzle-orm";

export interface SessionRequest extends Request {
  userID?: string;
  userToken?: string;
}
export const verifySession = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.header("Authorization");
  if (!header) {
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized Request" });
  }
  const token = header.split(" ")[1];
  try {
    const tokenData = await db
      .select()
      .from(userTokens)
      .where(eq(userTokens.token, token))
      .execute();
    if (tokenData.length === 0) {
      return res.status(401).json({ status: false, message: "Invalid Token" });
    }
    const { createdAt } = tokenData[0]
    if((Date.now()+21600000) - createdAt.getTime() > 1000 * 60 * 60 * 24 * 7){
      await db.delete(userTokens).where(eq(userTokens.token, token)).execute();
      return res.status(401).json({ Message: "Session Expires, log in again" });
    }
    req.userToken = tokenData[0].token;
    req.userID = tokenData[0].userId!;
    next();
  } catch (error) {
    return res.status(500).json({ message : 'Internal server error', error });
  }
};
