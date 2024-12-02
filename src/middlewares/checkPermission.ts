import { Response, NextFunction } from "express";
import { SessionRequest } from "./verifySession";
import { users } from "../db/schema";
import { db } from "../db/setup";
import { eq } from "drizzle-orm";

export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}
export interface PermissionRequest extends SessionRequest {
  role?: Role;
}

export const checkPermission = async (
  req: PermissionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, req.userID!))
      .execute();
    user[0].role === Role.ADMIN
      ? (req.role = Role.ADMIN)
      : user[0].role === Role.MANAGER
      ? (req.role = Role.MANAGER)
      : (req.role = Role.EMPLOYEE);
    next();
  } catch (error) {
    return res.status(500).json({ name: "Internal server error", error });
  }
};
