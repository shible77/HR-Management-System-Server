import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config(); 

if (!process.env.DB_URL) {
    throw new Error("DB credentials error");
}

const connection = neon(process.env.DB_URL!);
export const db = drizzle(connection)