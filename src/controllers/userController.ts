import { SessionRequest } from "../middlewares/verifySession";
import { db } from "../db/setup";
import { users, employees, departments, addresses } from "../db/schema";
import { eq, and, inArray, gt } from "drizzle-orm";
import { Response } from "express";
import { z } from "zod";
import { UserFilter } from "../types/types";
import { applyUserFilters } from "../utils/userFilters";

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
    throw error;;
  }
};

export const getUser = async (req: SessionRequest, res: Response) => {
  try {
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
        departmentId: departments.departmentId,
        departmentName: departments.departmentName,
        deptDescription: departments.description,
        managerId: departments.managerId,
        division: addresses.division,
        district: addresses.district,
        thana: addresses.thana,
        postCode: addresses.postCode,
      })
      .from(users)
      .innerJoin(employees, eq(users.userId, employees.userId))
      .leftJoin(
        departments,
        eq(employees.departmentId, departments.departmentId),
      )
      .leftJoin(addresses, eq(users.userId, addresses.userId));

    if (user_id && employee_id) {
      query.where(
        and(eq(users.userId, user_id), eq(employees.employeeId, employee_id)),
      );
    } else if (user_id) {
      query.where(eq(users.userId, user_id));
    } else if (employee_id) {
      query.where(eq(employees.employeeId, employee_id));
    }

    const user_info = await query.execute();
    if (user_info.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Info of user is fetched successfully",
      data: user_info[0],
    });
  } catch (error) {
    throw error;
  }
};

export const getUsers = async (req: SessionRequest, res: Response) => {
  try {
    const filter: UserFilter = req.query;
    const limit = z.coerce
      .number()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .parse(req.query.limit);
    const cursor = z.coerce.string().optional().parse(req.query.cursor);

    let query = db
      .select({ userId: users.userId })
      .from(users)
      .innerJoin(employees, eq(users.userId, employees.userId))
      .where(cursor ? gt(users.userId, cursor) : undefined);
    query = applyUserFilters(query, filter);

    const userIdList = (
      await query
        .orderBy(users.userId)
        .limit(limit + 1)
        .execute()
    ).map((u) => u.userId);

    const hasMore: boolean = userIdList.length > limit;
    const sliced = hasMore ? userIdList.slice(0, -1) : userIdList;
    const nextCursor = hasMore ? sliced[sliced.length - 1] : null;

    if (userIdList.length === 0) {
      return res.status(200).json({
        status: true,
        message: "Users fetched successfully",
        data: [],
        pageInfo: {
          nextCursor,
          hasMore,
        },
      });
    }

    const data = await db
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
        departmentId: departments.departmentId,
        departmentName: departments.departmentName,
        deptDescription: departments.description,
        managerId: departments.managerId,
        division: addresses.division,
        district: addresses.district,
        thana: addresses.thana,
        postCode: addresses.postCode,
      })
      .from(users)
      .innerJoin(employees, eq(users.userId, employees.userId))
      .leftJoin(
        departments,
        eq(employees.departmentId, departments.departmentId),
      )
      .leftJoin(addresses, eq(users.userId, addresses.userId))
      .where(inArray(users.userId, sliced));

    return res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: data,
      pageInfo: {
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    throw error;
  }
};
