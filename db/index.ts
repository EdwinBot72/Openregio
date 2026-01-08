import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.PGPOOL_MAX || "5"),
  idleTimeoutMillis: parseInt(process.env.PGPOOL_IDLE_TIMEOUT || "10000"),
  connectionTimeoutMillis: parseInt(process.env.PGPOOL_CONNECT_TIMEOUT || "2000"),
});

pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

export const db = drizzle({ client: pool, schema });

export async function closePool() {
  await pool.end();
}
