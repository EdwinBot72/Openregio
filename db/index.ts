import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.PGPOOL_MAX || "5"),
  idleTimeoutMillis: parseInt(process.env.PGPOOL_IDLE_TIMEOUT || "10000"),
  connectionTimeoutMillis: parseInt(process.env.PGPOOL_CONNECT_TIMEOUT || "10000"),
});

pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

export const db = drizzle(pool, { schema });

export async function closePool() {
  await pool.end();
}
