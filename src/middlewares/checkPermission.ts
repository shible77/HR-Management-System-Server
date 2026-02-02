import { Response, NextFunction } from "express";
import { SessionRequest } from "./verifySession";


export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

export const checkPermission = ((givenRole: Role[]) => {
  return async (req: SessionRequest, res: Response, next: NextFunction) => {
    try {
      const role = req.role;
      if (givenRole.length > 0 && !givenRole.includes(role as Role)) {
        return res
          .status(403)
          .json({ status: false, message: "You do not have permission to perform this" });
      }
      next();
    } catch {
      throw new Error("Internal server error");
    }
  };
})


