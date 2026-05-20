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

    // Lokale Acties (evenementen) - Pro-leden maken acties die alle leden zien
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS lokale_acties (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_user_id VARCHAR NOT NULL REFERENCES users(id),
        titel VARCHAR(255) NOT NULL,
        beschrijving TEXT NOT NULL,
        datum TIMESTAMPTZ,
        locatie VARCHAR(255) NOT NULL,
        regio VARCHAR(255) NOT NULL,
        doelgroep VARCHAR NOT NULL DEFAULT 'iedereen',
        externe_link TEXT,
        contact_email VARCHAR(255),
        bedrijfsnaam VARCHAR(255),
        status VARCHAR NOT NULL DEFAULT 'actief',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_lokale_acties_regio ON lokale_acties(regio);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_lokale_acties_owner ON lokale_acties(owner_user_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_lokale_acties_status_expires ON lokale_acties(status, expires_at);`);
    console.log("[Migration] ✓ lokale_acties table ensured");

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

    // RegioScan voor Pro — brancheafhankelijke scan met scores, blokken en concept Woo-verzoek
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS regio_scans (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        branche TEXT NOT NULL,
        gemeente TEXT NOT NULL,
        extra_context TEXT,
        score_risico INTEGER NOT NULL DEFAULT 0,
        score_kans INTEGER NOT NULL DEFAULT 0,
        result JSONB NOT NULL,
        woo_concept TEXT,
        woo_dossier_id INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_regio_scans_user ON regio_scans(user_id);`);
    console.log("[Migration] ✓ regio_scans table ensured");

    // Hulp-engine dossiers — bewaarde runs van de hulp-flows (brief-ontvangen,
    // regel-onduidelijk, controle-vergunning-boete) zodat ondernemers later
    // verder kunnen met dezelfde casus.
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS help_flow_dossiers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        flow_id TEXT NOT NULL,
        flow_title TEXT NOT NULL,
        title TEXT NOT NULL,
        answers JSONB NOT NULL,
        scenario_id TEXT,
        scenario_level TEXT,
        scenario_risk_label TEXT,
        rendered_text TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_help_flow_dossiers_user ON help_flow_dossiers(user_id);`);
    console.log("[Migration] ✓ help_flow_dossiers table ensured");

    // WOO dossiers — afzendergegevens (versleuteld) + ingebrekestelling tracking
    await db.execute(sql`ALTER TABLE woo_dossiers ADD COLUMN IF NOT EXISTS sender_name_encrypted TEXT`);
    await db.execute(sql`ALTER TABLE woo_dossiers ADD COLUMN IF NOT EXISTS sender_address_encrypted TEXT`);
    await db.execute(sql`ALTER TABLE woo_dossiers ADD COLUMN IF NOT EXISTS sender_postcode_encrypted TEXT`);
    await db.execute(sql`ALTER TABLE woo_dossiers ADD COLUMN IF NOT EXISTS ingebreke_sent_at TIMESTAMPTZ`);
    await db.execute(sql`ALTER TABLE woo_dossiers ADD COLUMN IF NOT EXISTS dwangsom_contract_accepted_at TIMESTAMPTZ`);
    console.log("[Migration] ✓ woo_dossiers afzender + ingebrekestelling columns ensured");

    // Sector-systeem: sector kolom op users en intel_signalen
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS sector VARCHAR(50);
    `);
    console.log("[Migration] ✓ users.sector column ensured");

    await db.execute(sql`
      ALTER TABLE intel_signalen ADD COLUMN IF NOT EXISTS sector VARCHAR(50);
    `);
    console.log("[Migration] ✓ intel_signalen.sector column ensured");

    // Pexels afbeelding URL voor intel_signalen
    await db.execute(sql`
      ALTER TABLE intel_signalen ADD COLUMN IF NOT EXISTS photo_url VARCHAR(1024);
    `);
    console.log("[Migration] ✓ intel_signalen.photo_url column ensured");

    // Audience-veld voor blogs: scheidt publieke blogposts van leden-updates
    await db.execute(sql`
      ALTER TABLE blogs ADD COLUMN IF NOT EXISTS audience VARCHAR(20) NOT NULL DEFAULT 'publiek';
    `);
    console.log("[Migration] ✓ blogs.audience column ensured");

    // Indien-velden voor woo-dossiers (auto-indienen vanuit RegioScan)
    await db.execute(sql`
      ALTER TABLE woo_dossiers ADD COLUMN IF NOT EXISTS indien_kanaal VARCHAR(16);
    `);
    await db.execute(sql`
      ALTER TABLE woo_dossiers ADD COLUMN IF NOT EXISTS indien_ontvanger TEXT;
    `);
    await db.execute(sql`
      ALTER TABLE woo_dossiers ADD COLUMN IF NOT EXISTS ingediend_op TIMESTAMPTZ;
    `);
    console.log("[Migration] ✓ woo_dossiers indien-kolommen ensured");

    // Seed starter-cursussen (idempotent — alleen als tabel leeg is)
    const { rows: courseCount } = await db.execute(sql`SELECT COUNT(*)::int AS n FROM daily_courses`);
    if ((courseCount[0] as any).n === 0) {
      const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();
      await db.execute(sql`
        INSERT INTO daily_courses
          (id, title, slug, category, sector, plan, status, posted_at, expires_at, minutes, goal, action, result, cta_label, sort_order)
        VALUES
          (gen_random_uuid(), 'Google Bedrijfsprofiel aanscherpen', 'google-bedrijfsprofiel-aanscherpen', 'zichtbaarheid', 'algemeen', 'basis', 'published',
           ${now}::timestamptz, ${weekLater}::timestamptz,
           15,
           'Meer lokale zichtbaarheid in Google zoekresultaten.',
           'Log in op Google Bedrijfsprofiel, voeg 3 nieuwe foto''s toe, werk je omschrijving bij en controleer je openingstijden.',
           'Je profiel scoort beter in lokale zoekresultaten en trekt meer klanten.',
           'Markeer als gedaan', 1),
          (gen_random_uuid(), 'Één klant bellen voor een review', 'klant-bellen-review', 'marketing', 'algemeen', 'basis', 'published',
           ${now}::timestamptz, ${weekLater}::timestamptz,
           10,
           'Meer positieve reviews om vertrouwen te winnen bij nieuwe klanten.',
           'Bel één tevreden vaste klant op, vraag hoe het gaat en verzoek vriendelijk om een Google review.',
           'Je hebt een extra review en verstevigt de klantrelatie tegelijk.',
           'Markeer als gedaan', 2),
          (gen_random_uuid(), 'Jouw aanbod in één zin', 'aanbod-in-een-zin', 'marketing', 'algemeen', 'pro', 'published',
           ${now}::timestamptz, ${twoWeeksLater}::timestamptz,
           20,
           'Een scherpe, duidelijke boodschap die klanten direct aanspreekt.',
           'Schrijf op: voor wie je werkt, wat je doet en wat het oplevert. Schrap alles wat niet essentieel is totdat je op één krachtige zin uitkomt.',
           'Een positionering die je direct kunt gebruiken op je website, socials en visitekaartje.',
           'Markeer als gedaan', 3)
      `);
      console.log("[Migration] ✓ daily_courses starter-cursussen geseed");
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS seo_checklist (
        user_id   TEXT PRIMARY KEY,
        afgevinkt JSONB NOT NULL DEFAULT '[]',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log("[Migration] ✓ seo_checklist table ensured");

    console.log("[Migration] Database schema is up to date");
  } catch (error) {
    console.error("[Migration] Error running migrations:", error);
    throw error;
  }
}
