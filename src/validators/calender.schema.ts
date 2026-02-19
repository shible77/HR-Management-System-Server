import { z } from "zod";

export const calendarYearSchema = z.object({
    year: z.string().min(4).openapi({ example: "2024" , description: "The year for which to generate the calendar" }),
}).openapi({description: "Schema for generating calendar year"});