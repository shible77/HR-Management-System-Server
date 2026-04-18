export interface EmployeeBatch {
  employeeId: number;
  baseSalary: string | null;
}

export interface AttendanceSummary {
  presentDays: number;
  leaveDays: number;
}

export interface PayrollInsert {
  employeeId: number;
  grossSalary: string;
  netSalary: string;
  payMonth: string;
}