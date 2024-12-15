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

  export enum LeaveType {
    CASUAL = "casual",
    MEDICAL = "medical",
    ANNUAL = "annual",
  }

  export enum ApplicationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
  }

  export type LeaveFilter = {
    userId?: string;
    leaveType?: LeaveType;
    status?: ApplicationStatus;
    departmentId? : number;
  }
  