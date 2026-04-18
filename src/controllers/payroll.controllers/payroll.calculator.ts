export function calculatePayroll(
  baseSalary: number,
  workingDays: number,
  presentDays: number,
  leaveDays: number
) {
  const dailySalary = workingDays > 0 ? baseSalary / workingDays : 0;

  const grossSalary = dailySalary * presentDays;

  const deduction = dailySalary * leaveDays;

  const netSalary = grossSalary - deduction;

  return {
    grossSalary: grossSalary.toFixed(2),
    netSalary: netSalary.toFixed(2),
  };
}