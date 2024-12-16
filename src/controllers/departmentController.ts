import { Response } from "express";
import { db } from "../db/setup";
import { departments, employees, users } from "../db/schema";
import { z } from "zod";
import { PermissionRequest, Role } from "../middlewares/checkPermission";
import { eq } from "drizzle-orm";
import { handleError } from "../utils/handleError";

const departmentReqBody = z.object({
  departmentName: z.string().max(50),
  description: z.string(),
});
export const createDepartment = async (
  req: PermissionRequest,
  res: Response
) => {
  try {
    if (req.role !== Role.ADMIN) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this" });
    }
    const { departmentName, description } = departmentReqBody.parse(req.body);
    const department = await db
      .insert(departments)
      .values({
        departmentName,
        description,
      })
      .returning({ departmentId: departments.departmentId })
      .execute();
    return res.status(200).json({
      message: "Department created successfully",
      departmentID: department[0].departmentId,
    });
  } catch (error) {
    handleError(error, res)
  }
};

const assignManagerReqBody = z.object({
  userId: z.string().max(50),
});
export const assignManager = async (req: PermissionRequest, res: Response) => {
  try {
    if (req.role !== Role.ADMIN) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this" });
    }
    const departmentId = z.coerce.number().parse(req.params.id);
    const { userId } = assignManagerReqBody.parse(req.body);
    if (departmentId && userId) {
      await db
        .update(departments)
        .set({ managerId: userId })
        .where(eq(departments.departmentId, departmentId))
        .execute();
      await db
        .update(employees)
        .set({ departmentId: departmentId })
        .where(eq(employees.userId, userId))
        .execute();
      const user = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.userId, userId))
        .execute();
      if (user[0].role !== Role.MANAGER) {
        await db
          .update(users)
          .set({ role: Role.MANAGER })
          .where(eq(users.userId, userId))
          .execute();
      }
      return res
        .status(200)
        .json({ status: true, message: "Manager assigned successfully" });
    }
    return res.status(400).json({ status: false, message: "Invalid request" });
  } catch (error) {
    handleError(error, res)
  }
};

const assignEmployeeReqBody = z.object({
  departmentId : z.number()
})
export const assignEmployee = async (req: PermissionRequest, res: Response) => {
  try {
    if (req.role! === Role.EMPLOYEE) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this" });
    }
    const employeeId = z.coerce.number().parse(req.params.id);
    const { departmentId } = assignEmployeeReqBody.parse(req.body);
    await db.update(employees).set({ departmentId }).where(eq(employees.employeeId, employeeId)).execute();
    return res.status(200).json({ status: true, message: "Employee assigned successfully" });
  } catch (error) {
    handleError(error, res)
  }
};
