import { db } from "../db/setup";
import { sql } from "drizzle-orm";
import { SessionRequest } from "../middlewares/verifySession";
import { Response } from "express";
import { calendarYearSchema } from "../validators/calender.schema";
import { validate } from "../utils/validate";

export const generateCalendarYear = async (req:SessionRequest, res:Response) => {
  try {
    const { year } = validate(calendarYearSchema, req.body);

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    await db.execute(sql`
      INSERT INTO calendar (calendar_date, is_weekend)
      SELECT
          d::date,
          EXTRACT(DOW FROM d) IN (0, 6)
      FROM generate_series(
          ${start}::date,
          ${end}::date,
          '1 day'
      ) AS d
      ON CONFLICT (calendar_date)
      DO NOTHING;
    `);

    return res.status(200).json({
      message: `Calendar generated successfully for ${year}`
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
