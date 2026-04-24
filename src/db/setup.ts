import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DB_URL) {
    throw new Error("DB credentials error");
}

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const db = drizzle(pool);