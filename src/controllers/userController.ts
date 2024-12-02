import { SessionRequest } from "../middlewares/verifySession";
import { db } from "../db/setup";
import { users, employees, departments, addresses } from "../db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { Response } from "express";
import { z } from "zod";
import { PermissionRequest } from "../middlewares/checkPermission";
import { Role } from "../middlewares/checkPermission";
import { UserFilter } from "../types";
import { applyUserFilters } from "../utils/userFilters";
import { getPagingData, getPagination } from "../utils/pagination";
export const getCurrentUser = async (req: SessionRequest, res: Response) => {
  try {
    const user_id = req.userID!;
    const user_info = await db
      .select({
        userId: users.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        username: users.username,
        email: users.email,
        role: users.role,
        employeeId: employees.employeeId,
        designation: employees.designation,
        hireDate: employees.hireDate,
        status: employees.status,
        departmentId: employees.departmentId,
      })
      .from(users)
      .innerJoin(employees, eq(users.userId, employees.userId))
      .where(eq(users.userId, user_id))
      .execute();
    return res.status(200).json({
      status: true,
      message: "Current user info fetched successfully",
      data: user_info[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getUser = async (req: SessionRequest, res: Response) => {
  try{
    const user_id = z.coerce.string().optional().parse(req.query.uid);
    const employee_id = z.coerce.number().optional().parse(req.query.eid);
    const query = db
      .select({
        userId: users.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        username: users.username,
        email: users.email,
        role: users.role,
        employeeId: employees.employeeId,
        designation: employees.designation,
        hireDate: employees.hireDate,
        status: employees.status,
        departmentId : departments.departmentId,
        departmentName: departments.departmentName,
        deptDescription : departments.description,
        managerId : departments.managerId,
        division : addresses.division,
        district : addresses.district,
        thana : addresses.thana,
        postCode : addresses.postCode
      })
      .from(users)
      .innerJoin(employees, eq(users.userId, employees.userId))
      .leftJoin(departments, eq(employees.departmentId, departments.departmentId))
      .leftJoin(addresses, eq(users.userId, addresses.userId));
      
      if (user_id && employee_id) {
        query.where(and(eq(users.userId, user_id), eq(employees.employeeId, employee_id)));
      } else if (user_id) {
        query.where(eq(users.userId, user_id));
      } else if (employee_id) {
        query.where(eq(employees.employeeId, employee_id));
      }

      const user_info = await query.execute();
      if(user_info.length === 0){
        return res.status(404).json({ message: "User not found" });
      }

    return res.status(200).json({
      status: true,
      message: "Info of user is fetched successfully",
      data: user_info[0],
    })

  }catch(error){
    if(error instanceof z.ZodError){
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal server error", error });
  }
}

export const getUsers = async (req: PermissionRequest, res: Response) => {
  try{
    if(req.role! === Role.EMPLOYEE){
      return res.status(403).json({ message: "You are not authorized to access this resource"})
    }
    const filter : UserFilter = req.query;
    const page = z.coerce.number().min(1).default(1).parse(req.query.page);
    const pageSize = z.coerce.number().min(1).default(10).parse(req.query.pageSize);
    let query = db
      .select({
        userId: users.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        username: users.username,
        email: users.email,
        role: users.role,
        employeeId: employees.employeeId,
        designation: employees.designation,
        hireDate: employees.hireDate,
        status: employees.status,
        departmentId : departments.departmentId,
        departmentName: departments.departmentName,
        managerId : departments.managerId,
        division : addresses.division,
        district : addresses.district,
        thana : addresses.thana,
        postCode : addresses.postCode
      }).from(users)
      .innerJoin(employees, eq(users.userId, employees.userId))
      .leftJoin(departments, eq(employees.departmentId, departments.departmentId))
      .leftJoin(addresses, eq(users.userId, addresses.userId));
      const { limit, offset } = getPagination(Number(page) - 1, Number(pageSize));
      query = applyUserFilters(query, filter);
      const totalFilteredInfo = await db.$count(query)
      const usersInfo = await query.limit(limit).offset(offset).execute();

      if(usersInfo.length === 0){
        return res.status(404).json({ message: "No users found" });
      }
      const response = getPagingData(usersInfo, totalFilteredInfo, Number(page), limit, offset);

    return res.status(200).json({status : true, message : "Users fetched successfully", totalItems : totalFilteredInfo, pageSize : limit, ...response})

  }catch(error){
    if(error instanceof z.ZodError){
      return res.status(400).json({
        name: "Invalid Data Type",
        message: JSON.parse(error.message),
      });
    }
    return res.status(500).json({ message: "Internal server error", error });
  }

}