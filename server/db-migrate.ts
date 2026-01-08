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

    // Add visibility_settings column to users table if not exists
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS visibility_settings TEXT;
    `);
    console.log("[Migration] ✓ users.visibility_settings column ensured");

    // Add region column to users table if not exists
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(255);
    `);
    console.log("[Migration] ✓ users.region column ensured");

    // Create field_visibility table if not exists (legacy table for basic privacy)
    // Note: Using VARCHAR for user_id to match users.id UUID type
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS field_visibility (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        field_name VARCHAR(100) NOT NULL,
        visibility VARCHAR(20) NOT NULL DEFAULT 'private',
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, field_name)
      );
    `);
    console.log("[Migration] ✓ field_visibility table ensured");

    // Create consent_log table if not exists (audit trail for visibility changes)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS consent_log (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        field_name VARCHAR(100) NOT NULL,
        old_value VARCHAR(20),
        new_value VARCHAR(20) NOT NULL,
        changed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("[Migration] ✓ consent_log table ensured");

    // Create refresh_tokens table for JWT auth (production-ready stateless auth)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        token_id VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_id ON refresh_tokens(token_id);`);
    console.log("[Migration] ✓ refresh_tokens table ensured");

    console.log("[Migration] Database schema is up to date");
  } catch (error) {
    console.error("[Migration] Error running migrations:", error);
    throw error;
  }
}
