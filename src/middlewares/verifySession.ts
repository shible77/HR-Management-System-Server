import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";
import { JwtPayload } from "../config/jwt";

export interface SessionRequest extends Request {
  userID?: string;
  role?: string;
}
export const verifySession = async (req: SessionRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({status:false, message: "UNAUTHORIZED" });
  try {
    const payload = verifyToken(token) as JwtPayload;
    req.userID=payload.userId;
    req.role=payload.role;
    next();
  } catch {
    throw new Error("Invalid or expired token");
  }
};
