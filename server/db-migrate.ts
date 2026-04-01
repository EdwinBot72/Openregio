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

    // Add affiliate/referral columns to users table
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
    `);
    console.log("[Migration] ✓ users.referral_code column ensured");
    
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_user_id VARCHAR(255);
    `);
    console.log("[Migration] ✓ users.referred_by_user_id column ensured");
    
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_at TIMESTAMP;
    `);
    console.log("[Migration] ✓ users.referred_at column ensured");

    // WOO Categories table - fixed set of allowed categories for WOO requests
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS woo_categories (
        slug TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        is_allowed BOOLEAN NOT NULL DEFAULT true
      );
    `);
    console.log("[Migration] ✓ woo_categories table ensured");

    // Seed WOO categories (idempotent upsert)
    await db.execute(sql`
      INSERT INTO woo_categories (slug, label, is_allowed) VALUES
        ('mandaat_delegatie', 'Mandaat & delegatie', true),
        ('beleid_verordening', 'Beleid & verordeningen', true),
        ('vergunningen', 'Vergunningen & beleidsregels', true),
        ('heffingen_leges', 'Heffingen, leges, belastingen', true),
        ('handhaving_kaders', 'Handhavingskaders (beleid)', true),
        ('aanbesteding', 'Aanbestedingen & gunning', true),
        ('subsidies', 'Subsidiekaders & besluiten', true),
        ('uitvoering_partijen', 'Uitvoeringsorganisaties/derden', true),
        ('openbaarheid_archief', 'Archief/openbaarheid/werkinstructies', true),
        ('persoonlijk_verkeer_boete', 'Persoonlijk/Verkeer/Boete (NIET TOEGESTAAN)', false)
      ON CONFLICT (slug) DO UPDATE SET
        label = EXCLUDED.label,
        is_allowed = EXCLUDED.is_allowed;
    `);
    console.log("[Migration] ✓ woo_categories seeded");

    // Add category_slug to woo_requests (optional, defaults to beleid_verordening)
    await db.execute(sql`
      ALTER TABLE woo_requests ADD COLUMN IF NOT EXISTS category_slug TEXT;
    `);
    console.log("[Migration] ✓ woo_requests.category_slug column ensured");

    // Add category_slug to woo_documents (optional)
    await db.execute(sql`
      ALTER TABLE woo_documents ADD COLUMN IF NOT EXISTS category_slug TEXT;
    `);
    console.log("[Migration] ✓ woo_documents.category_slug column ensured");

    // Create hard block trigger for non-allowed categories
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION enforce_allowed_woo_category()
      RETURNS trigger AS $$
      BEGIN
        IF NEW.category_slug IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM woo_categories c
          WHERE c.slug = NEW.category_slug AND c.is_allowed = true
        ) THEN
          RAISE EXCEPTION 'Category % is not allowed in OpenRegio WOO library', NEW.category_slug;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("[Migration] ✓ enforce_allowed_woo_category function created");

    await db.execute(sql`
      DROP TRIGGER IF EXISTS trg_enforce_allowed_woo_category ON woo_requests;
    `);
    await db.execute(sql`
      CREATE TRIGGER trg_enforce_allowed_woo_category
      BEFORE INSERT OR UPDATE ON woo_requests
      FOR EACH ROW EXECUTE FUNCTION enforce_allowed_woo_category();
    `);
    console.log("[Migration] ✓ woo_requests category enforcement trigger ensured");

    // Full-text search index on woo_documents for smart Top-K selection
    await db.execute(sql`
      ALTER TABLE woo_documents ADD COLUMN IF NOT EXISTS fts tsvector;
    `);
    console.log("[Migration] ✓ woo_documents.fts column ensured");

    await db.execute(sql`
      UPDATE woo_documents 
      SET fts = to_tsvector('simple', coalesce(summary,'') || ' ' || coalesce(text_content,''))
      WHERE fts IS NULL;
    `);
    console.log("[Migration] ✓ woo_documents.fts values populated");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_woo_documents_fts ON woo_documents USING gin(fts);
    `);
    console.log("[Migration] ✓ woo_documents FTS index ensured");

    await db.execute(sql`
      CREATE OR REPLACE FUNCTION woo_documents_fts_trigger()
      RETURNS trigger AS $$
      BEGIN
        NEW.fts := to_tsvector('simple', coalesce(NEW.summary,'') || ' ' || coalesce(NEW.text_content,''));
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("[Migration] ✓ woo_documents_fts_trigger function created");

    await db.execute(sql`DROP TRIGGER IF EXISTS trg_woo_documents_fts ON woo_documents;`);
    await db.execute(sql`
      CREATE TRIGGER trg_woo_documents_fts
      BEFORE INSERT OR UPDATE ON woo_documents
      FOR EACH ROW EXECUTE FUNCTION woo_documents_fts_trigger();
    `);
    console.log("[Migration] ✓ woo_documents FTS trigger ensured");

    await db.execute(sql`
      ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    console.log("[Migration] ✓ user_profiles.avatar_url column ensured");

    // Intel signalen table for Regio Intel feature
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS intel_signalen (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        categorie VARCHAR(50) NOT NULL,
        urgentie VARCHAR(20) NOT NULL DEFAULT 'normaal',
        titel VARCHAR(512) NOT NULL,
        samenvatting TEXT NOT NULL,
        bron VARCHAR(255) NOT NULL,
        regio VARCHAR(255) NOT NULL DEFAULT 'Nationaal',
        datum TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        bron_url VARCHAR(1024),
        is_published BOOLEAN NOT NULL DEFAULT true,
        external_id VARCHAR(512) UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by_user_id VARCHAR(255)
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_intel_signalen_categorie ON intel_signalen(categorie);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_intel_signalen_datum ON intel_signalen(datum DESC);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_intel_signalen_regio ON intel_signalen(regio);`);
    console.log("[Migration] ✓ intel_signalen table ensured");

    // Lokale Marktplaats table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS lokaal_aanbod (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id),
        type VARCHAR(10) NOT NULL CHECK (type IN ('zoek', 'bied')),
        titel VARCHAR(255) NOT NULL,
        beschrijving TEXT NOT NULL,
        categorie VARCHAR(50) NOT NULL,
        regio VARCHAR(255) NOT NULL,
        contact_info TEXT,
        bedrijfsnaam VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_lokaal_aanbod_regio ON lokaal_aanbod(regio);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_lokaal_aanbod_type ON lokaal_aanbod(type);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_lokaal_aanbod_user ON lokaal_aanbod(user_id);`);
    console.log("[Migration] ✓ lokaal_aanbod table ensured");

    // Ondernemer Thema's table for AI-generated weekly entrepreneur insights
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ondernemer_themas (
        id SERIAL PRIMARY KEY,
        thema_id VARCHAR(50) NOT NULL UNIQUE,
        titel VARCHAR(255) NOT NULL,
        tag VARCHAR(50) NOT NULL,
        samenvatting TEXT NOT NULL,
        acties TEXT[] NOT NULL DEFAULT '{}',
        bijgewerkt_op TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ondernemer_themas_thema_id ON ondernemer_themas(thema_id);`);
    console.log("[Migration] ✓ ondernemer_themas table ensured");

    // Wetgeving Inzendingen table for Wet & Regelgeving submission flow
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wetgeving_inzendingen (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        afzender VARCHAR(255) NOT NULL,
        onderwerp VARCHAR(500) NOT NULL,
        regio VARCHAR(255) NOT NULL,
        brief_tekst TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'ingediend' CHECK (status IN ('ingediend', 'verwerkt', 'gepubliceerd')),
        ingediend_op TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_wetgeving_inzendingen_status ON wetgeving_inzendingen(status);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_wetgeving_inzendingen_user ON wetgeving_inzendingen(user_id);`);
    console.log("[Migration] ✓ wetgeving_inzendingen table ensured");

    console.log("[Migration] Database schema is up to date");
  } catch (error) {
    console.error("[Migration] Error running migrations:", error);
    throw error;
  }
}
