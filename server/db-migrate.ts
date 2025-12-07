import { db } from "db";
import { sql } from "drizzle-orm";

export async function runMigrations(): Promise<void> {
  console.log("[Migration] Checking database schema...");
  
  try {
    // Add deleted_at column to users table if not exists
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `);
    console.log("[Migration] ✓ users.deleted_at column ensured");

    // Create field_visibility table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS field_visibility (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        field_name VARCHAR(100) NOT NULL,
        visibility VARCHAR(20) NOT NULL DEFAULT 'public',
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, field_name)
      );
    `);
    console.log("[Migration] ✓ field_visibility table ensured");

    // Create consent_log table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS consent_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        field_name VARCHAR(100) NOT NULL,
        old_value VARCHAR(20),
        new_value VARCHAR(20) NOT NULL,
        changed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("[Migration] ✓ consent_log table ensured");

    console.log("[Migration] Database schema is up to date");
  } catch (error) {
    console.error("[Migration] Error running migrations:", error);
    throw error;
  }
}
