// Define filter types for user queries
import { Role } from "./middlewares/checkPermission";
export enum Status {
    ACTIVE = "active",
    INACTIVE = "inactive",
  }
export type UserFilter = {
    departmentId?: number;
    username? : string;
    phone?: string;
    email?: string;
    designation?: string;
    hireDate?: string;
    status?: Status;
    role?: Role;
  };
  