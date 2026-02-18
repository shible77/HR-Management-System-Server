export function getDateRange(startDate: string | null, endDate: string | null): Date[] {
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    throw new Error("Start date cannot be after end date");
  }

  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current)); // push clone
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
