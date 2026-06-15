import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, doublePrecision, unique, index, jsonb, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Replit Auth: Session storage table
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Shared constants for subscriptions (must be defined before users table)
export const SUBSCRIPTION_STATUS = ["active", "trialing", "cancelled", "past_due"] as const;
export const SUBSCRIPTION_PLANS = ["pending", "basic", "pro", "coaching"] as const;
export const USER_ROLES = ["member", "master", "admin"] as const;

// Users table - supports both Replit Auth and email/password auth
export const SECTOR_TYPES = ["detailhandel", "horeca", "techniek", "agrarisch"] as const;
export type SectorType = typeof SECTOR_TYPES[number];

// Extended enum for intel_signalen.sector — includes "alle" to mark signals visible to all sectored users.
// NULL = zichtbaar voor iedereen (ook niet-geselecteerde sector); "alle" = zichtbaar voor alle sector-gebruikers;
// sector-waarde = alleen voor die sector.
export const SIGNAAL_SECTOR_TYPES = [...SECTOR_TYPES, "alle"] as const;
export type SignaalSectorType = typeof SIGNAAL_SECTOR_TYPES[number];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  plan: varchar("plan", { enum: SUBSCRIPTION_PLANS }).default("pending"),
  role: varchar("role", { enum: USER_ROLES }).default("member").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  businessName: varchar("business_name"),
  bio: text("bio"),
  category: varchar("category"),
  sector: varchar("sector", { enum: SECTOR_TYPES }), // Sector for personalized content
  region: varchar("region"), // User's region for REGION_ONLY visibility
  visibilitySettings: text("visibility_settings"), // JSON string with visibility per field
  mustCompleteOnboarding: boolean("must_complete_onboarding").default(true).notNull(),
  onboardingToken: varchar("onboarding_token"),
  // Affiliate/Referral tracking
  referralCode: varchar("referral_code").unique(), // Unique code like OR-ABC123
  referredByUserId: varchar("referred_by_user_id"), // User who referred this user
  referredAt: timestamp("referred_at"), // When the referral was made
  // Notificaties leden-updates (zie task #72)
  lastNewsReadAt: timestamp("last_news_read_at"), // Wanneer gebruiker voor het laatst leden-updates las
  emailNewsDigest: boolean("email_news_digest").default(true).notNull(), // Opt-out toggle voor wekelijkse digest-mail
  emailLokaleActiesDigest: boolean("email_lokale_acties_digest").default(true).notNull(), // Opt-out toggle voor wekelijkse "nieuwe lokale acties in jouw regio"-mail (task #77)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete for AVG compliance
});

export const entrepreneurs = pgTable("entrepreneurs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id"),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  category: text("category").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  openingHours: text("opening_hours"),
  logoUrl: text("logo_url"),
  image: text("image"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Business profiles table with Dutch field names
export const bedrijfsprofielen = pgTable("bedrijfsprofielen", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gebruikerId: varchar("gebruiker_id").notNull().references(() => users.id),
  naam: text("naam").notNull(),
  eigenaarnaam: text("eigenaarnaam").notNull(),
  categorieId: varchar("categorie_id").notNull(),
  regio: text("regio").notNull(),
  beschrijving: text("beschrijving").notNull(),
  websiteUrl: text("website_url"),
  stemtoon: text("stemtoon"),
  status: text("status").notNull().default("actief"),
  aangemaakt: timestamp("aangemaakt").defaultNow().notNull(),
  bijgewerkt: timestamp("bijgewerkt").defaultNow().notNull(),
});

// Uploads table for business profile files
export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => bedrijfsprofielen.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "image" | "document"
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  url: text("url").notNull(),
  size: text("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User files for personal object storage
export const userFiles = pgTable("user_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  objectPath: text("object_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").default(0),
  contentType: text("content_type").default("application/octet-stream"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  proposerId: varchar("proposer_id").notNull(),
  proposerName: text("proposer_name").notNull(),
  closesAt: timestamp("closes_at").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  userId: varchar("user_id").notNull().references(() => userProfiles.id),
  choice: text("choice").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueVote: unique().on(table.proposalId, table.userId),
}));

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  title: text("title").notNull(),
  from: text("from").notNull(),
  entrepreneurId: varchar("entrepreneur_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blogs table for public blog posts on homepage
export const BLOG_STATUS = ["draft", "published", "archived"] as const;
export const BLOG_AUDIENCE = ["publiek", "leden"] as const;
export type BlogStatus = typeof BLOG_STATUS[number];
export type BlogAudience = typeof BLOG_AUDIENCE[number];

export const blogs = pgTable("blogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  authorName: text("author_name").notNull(),
  featuredImage: text("featured_image"),
  status: text("status", { enum: BLOG_STATUS }).notNull().default("draft"),
  audience: text("audience", { enum: BLOG_AUDIENCE }).notNull().default("publiek"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shared constants for pain points
export const PAIN_POINTS = [
  "visibility",
  "rules",
  "time",
  "platform_fees",
  "no_community",
  "digital_stress",
  "rights_confusion",
  "low_autonomy"
] as const;

// Shared constants for post types and regions
export const POST_TYPES = ["vraag", "aanbieding", "lead", "event", "update"] as const;

// 342 Nederlandse gemeenten (CBS 2024), gegroepeerd per provincie
export const PROVINCES_GEMEENTEN: Record<string, readonly string[]> = {
  "Drenthe": [
    "Aa en Hunze", "Assen", "Borger-Odoorn", "Coevorden", "De Wolden",
    "Emmen", "Hoogeveen", "Meppel", "Midden-Drenthe", "Noordenveld",
    "Tynaarlo", "Westerveld",
  ],
  "Flevoland": [
    "Almere", "Dronten", "Lelystad", "Noordoostpolder", "Urk", "Zeewolde",
  ],
  "Friesland": [
    "Achtkarspelen", "Ameland", "Dantumadiel", "De Fryske Marren", "Harlingen",
    "Heerenveen", "Leeuwarden", "Noardeast-Fryslân", "Ooststellingwerf",
    "Opsterland", "Schiermonnikoog", "Smallingerland", "Súdwest-Fryslân",
    "Terschelling", "Tytsjerksteradiel", "Vlieland", "Waadhoeke", "Weststellingwerf",
  ],
  "Gelderland": [
    "Aalten", "Apeldoorn", "Arnhem", "Barneveld", "Berg en Dal", "Berkelland",
    "Beuningen", "Bronckhorst", "Brummen", "Buren", "Culemborg", "Doetinchem",
    "Druten", "Duiven", "Ede", "Elburg", "Epe", "Ermelo", "Harderwijk",
    "Hattem", "Heerde", "Heumen", "Lingewaard", "Lochem", "Maasdriel",
    "Montferland", "Neder-Betuwe", "Nijkerk", "Nijmegen", "Nunspeet",
    "Oldebroek", "Oost Gelre", "Overbetuwe", "Putten", "Renkum", "Rheden",
    "Rozendaal", "Scherpenzeel", "Tiel", "Voorst", "Wageningen", "West Betuwe",
    "West Maas en Waal", "Westervoort", "Wijchen", "Winterswijk", "Zaltbommel",
    "Zevenaar", "Zutphen",
  ],
  "Groningen": [
    "Eemsdelta", "Groningen", "Het Hogeland", "Midden-Groningen", "Oldambt",
    "Pekela", "Stadskanaal", "Veendam", "Westerkwartier", "Westerwolde",
  ],
  "Limburg": [
    "Beekdaelen", "Bergen (L)", "Beesel", "Brunssum", "Echt-Susteren",
    "Eijsden-Margraten", "Gennep", "Gulpen-Wittem", "Heerlen", "Horst aan de Maas",
    "Kerkrade", "Landgraaf", "Leudal", "Maastricht", "Maasgouw", "Mook en Middelaar",
    "Peel en Maas", "Roerdalen", "Roermond", "Simpelveld", "Sittard-Geleen",
    "Stein", "Vaals", "Valkenburg aan de Geul", "Venlo", "Venray", "Weert",
  ],
  "Noord-Brabant": [
    "Alphen-Chaam", "Altena", "Asten", "Baarle-Nassau", "Bergen op Zoom",
    "Best", "Bladel", "Boekel", "Boxtel", "Breda", "Deurne", "Dongen",
    "Drimmelen", "Eersel", "Eindhoven", "Geertruidenberg", "Gemert-Bakel",
    "Gilze en Rijen", "Goirle", "Halderberge", "Heeze-Leende", "Helmond",
    "'s-Hertogenbosch", "Hilvarenbeek", "Land van Cuijk", "Laarbeek",
    "Loon op Zand", "Meierijstad", "Moerdijk", "Nuenen c.a.", "Oirschot",
    "Oisterwijk", "Oosterhout", "Oss", "Reusel-De Mierden", "Roosendaal",
    "Rucphen", "Sint-Michielsgestel", "Someren", "Son en Breugel", "Steenbergen",
    "Tilburg", "Valkenswaard", "Veldhoven", "Vught", "Waalre", "Waalwijk",
    "Woensdrecht", "Zundert",
  ],
  "Noord-Holland": [
    "Aalsmeer", "Alkmaar", "Amstelveen", "Amsterdam", "Bergen (NH)",
    "Beverwijk", "Blaricum", "Bloemendaal", "Castricum", "Den Helder",
    "Diemen", "Dijk en Waard", "Drechterland", "Edam-Volendam", "Enkhuizen",
    "Gooise Meren", "Haarlem", "Haarlemmermeer", "Heemskerk", "Heemstede",
    "Heiloo", "Hilversum", "Hollands Kroon", "Hoorn", "Huizen", "Koggenland",
    "Landsmeer", "Laren", "Medemblik", "Oostzaan", "Opmeer", "Ouder-Amstel",
    "Purmerend", "Schagen", "Stede Broec", "Texel", "Uitgeest", "Uithoorn",
    "Velsen", "Waterland", "Wijdemeren", "Wormerland", "Zaanstad", "Zandvoort",
  ],
  "Overijssel": [
    "Almelo", "Borne", "Dalfsen", "Deventer", "Dinkelland", "Enschede",
    "Haaksbergen", "Hardenberg", "Hellendoorn", "Hengelo", "Kampen", "Losser",
    "Oldenzaal", "Olst-Wijhe", "Ommen", "Raalte", "Rijssen-Holten", "Staphorst",
    "Steenwijkerland", "Tubbergen", "Twenterand", "Wierden", "Zwartewaterland",
    "Zwolle",
  ],
  "Utrecht": [
    "Amersfoort", "Baarn", "Bunnik", "Bunschoten", "De Bilt", "De Ronde Venen",
    "Eemnes", "Houten", "IJsselstein", "Leusden", "Lopik", "Montfoort",
    "Nieuwegein", "Oudewater", "Renswoude", "Rhenen", "Soest", "Stichtse Vecht",
    "Utrecht", "Utrechtse Heuvelrug", "Veenendaal", "Vijfheerenlanden",
    "Wijk bij Duurstede", "Woerden", "Woudenberg", "Zeist",
  ],
  "Zeeland": [
    "Borsele", "Goes", "Hulst", "Kapelle", "Middelburg", "Noord-Beveland",
    "Reimerswaal", "Schouwen-Duiveland", "Sluis", "Terneuzen", "Tholen",
    "Veere", "Vlissingen",
  ],
  "Zuid-Holland": [
    "Albrandswaard", "Alphen aan den Rijn", "Barendrecht", "Bodegraven-Reeuwijk",
    "Brielle", "Capelle aan den IJssel", "Delft", "Dordrecht", "Goeree-Overflakkee",
    "Gorinchem", "Gouda", "Hardinxveld-Giessendam", "Hendrik-Ido-Ambacht",
    "Hillegom", "Hoeksche Waard", "Kaag en Braassem", "Krimpen aan den IJssel",
    "Krimpenerwaard", "Lansingerland", "Leiden", "Leiderdorp",
    "Leidschendam-Voorburg", "Lisse", "Maassluis", "Midden-Delfland",
    "Molenlanden", "Nieuwkoop", "Nissewaard", "Noordwijk", "Oegstgeest",
    "Papendrecht", "Pijnacker-Nootdorp", "Ridderkerk", "Rijswijk", "Rotterdam",
    "Schiedam", "Sliedrecht", "Vlaardingen", "Voorschoten", "Waddinxveen",
    "Wassenaar", "Westland", "Westvoorne", "Zoetermeer", "Zoeterwoude", "Zuidplas",
  ],
  "Caribisch Nederland": [
    "Bonaire", "Saba", "Sint Eustatius",
  ],
};

// Vlakke array van alle gemeenten (voor Zod-enum en autocomplete)
export const GEMEENTEN = Object.values(PROVINCES_GEMEENTEN).flat() as string[];

// Backward-compatible alias
export const REGIONS = GEMEENTEN;

// Provinces for iteration
export const PROVINCES = Object.keys(PROVINCES_GEMEENTEN) as (keyof typeof PROVINCES_GEMEENTEN)[];

// Legacy alias (was PROVINCES_REGIONS)
export const PROVINCES_REGIONS = PROVINCES_GEMEENTEN;


// Shared constants for proposal status and vote choices
export const PROPOSAL_STATUS = ["open", "closed"] as const;
export const VOTE_CHOICES = ["yes", "no", "abstain"] as const;

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  replitUserId: varchar("replit_user_id").unique().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  painPoints: text("pain_points").array().notNull().default(sql`'{}'::text[]`),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorUserId: varchar("author_user_id"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  region: text("region").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  molliePaymentId: text("mollie_payment_id").unique(),
  mollieCustomerId: text("mollie_customer_id"),
  mollieSubscriptionId: text("mollie_subscription_id"),
  status: text("status").notNull().default("active"),
  plan: text("plan").notNull().default("basic"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const onboardingTokens = pgTable("onboarding_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Affiliate commission status options
export const COMMISSION_STATUS = ["pending", "approved", "paid", "cancelled"] as const;

// Affiliate commissions table - tracks earnings per referral payment
export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateUserId: varchar("affiliate_user_id").notNull().references(() => users.id), // The user who earns commission
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id), // The user who was referred
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  molliePaymentId: text("mollie_payment_id").notNull(), // Original payment that triggered commission
  plan: text("plan", { enum: SUBSCRIPTION_PLANS }).notNull(), // basic or pro
  amount: doublePrecision("amount").notNull(), // Commission amount in EUR (14.25 for basis, 51.45 for pro — 3 maanden % commissie)
  status: text("status", { enum: COMMISSION_STATUS }).notNull().default("pending"),
  paidAt: timestamp("paid_at"), // When commission was paid out
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for commissions
export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissions.$inferSelect;

// Visibility levels for field privacy settings
export const VISIBILITY_LEVELS = ["public", "members", "region_only", "private"] as const;
export type VisibilityLevel = typeof VISIBILITY_LEVELS[number];

// Zod schema for visibility settings validation
export const visibilitySettingsSchema = z.object({
  company_name: z.enum(VISIBILITY_LEVELS).optional(),
  phone: z.enum(VISIBILITY_LEVELS).optional(),
  address: z.enum(VISIBILITY_LEVELS).optional(),
  website: z.enum(VISIBILITY_LEVELS).optional(),
  description: z.enum(VISIBILITY_LEVELS).optional(),
});

export type VisibilitySettings = z.infer<typeof visibilitySettingsSchema>;

// Default visibility is PRIVATE for all fields (privacy-first for Basic members)
// PRO members can customize these settings in /pro/visibility-settings
export const DEFAULT_VISIBILITY_SETTINGS: Record<string, VisibilityLevel> = {
  company_name: "private",
  phone: "private",
  address: "private",
  website: "private",
  description: "private",
};

// Field visibility settings for privacy control
export const fieldVisibility = pgTable("field_visibility", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fieldName: varchar("field_name").notNull(),
  visibility: varchar("visibility", { enum: VISIBILITY_LEVELS }).notNull().default("private"),
}, (table) => ({
  uniqueUserField: unique().on(table.userId, table.fieldName),
}));

// Consent log for tracking visibility changes (AVG compliance)
export const consentLog = pgTable("consent_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fieldName: varchar("field_name").notNull(),
  oldVisibility: varchar("old_visibility", { enum: VISIBILITY_LEVELS }),
  newVisibility: varchar("new_visibility", { enum: VISIBILITY_LEVELS }).notNull(),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

// Documents table for RegioBot uploads (PDF, DOC, TXT, images)
export const DOCUMENT_TYPES = ["doc", "image"] as const;
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filePath: text("file_path").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  type: varchar("type", { enum: DOCUMENT_TYPES }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RegioBot modes for specialized assistance
export const REGIOBOT_MODES = ["general", "legal", "marketing"] as const;
export type RegioBotMode = typeof REGIOBOT_MODES[number];

// RegioCrew constants
export const CREW_RATE_TYPES = ["hour", "day", "fixed", "negotiable"] as const;
export const CREW_REQUEST_STATUS = ["open", "closed", "filled", "cancelled"] as const;
export const CREW_APPLICATION_STATUS = ["applied", "shortlisted", "accepted", "rejected", "withdrawn"] as const;
export const CREW_CATEGORIES = [
  "retail",
  "horeca",
  "logistiek",
  "administratie",
  "techniek",
  "zorg",
  "onderwijs",
  "creatief",
  "it",
  "overig",
] as const;

// RegioCrew - Professional profiles for flex work
export const crewProfiles = pgTable("crew_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  region: text("region").notNull(),
  displayName: text("display_name").notNull(),
  headline: text("headline"),
  categories: text("categories").array().notNull().default(sql`'{}'::text[]`),
  skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
  availability: text("availability"), // JSON string
  rateType: text("rate_type").notNull().default("hour"),
  rateMinEur: text("rate_min_eur"),
  phone: text("phone"),
  bio: text("bio"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// RegioCrew - Requests for temporary help
export const crewRequests = pgTable("crew_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => bedrijfsprofielen.id),
  region: text("region").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  rateType: text("rate_type").notNull().default("negotiable"),
  rateEur: text("rate_eur"),
  locationText: text("location_text"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// RegioCrew - Applications to requests
export const crewApplications = pgTable("crew_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => crewRequests.id),
  crewProfileId: varchar("crew_profile_id").notNull().references(() => crewProfiles.id),
  message: text("message"),
  status: text("status").notNull().default("applied"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEntrepreneurSchema = createInsertSchema(entrepreneurs).omit({
  id: true,
  createdAt: true,
});

// Bedrijfsprofiel insert schema (Dutch field names)
export const insertBedrijfsprofielSchema = createInsertSchema(bedrijfsprofielen).omit({
  id: true,
  aangemaakt: true,
  bijgewerkt: true,
}).extend({
  status: z.enum(["actief", "inactief", "concept"] as const).optional(),
});

// Upload insert schema
export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(["image", "document"] as const, { required_error: "Type is verplicht" }),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
}).extend({
  choice: z.enum(["yes", "no", "abstain"], { required_error: "Keuze is verplicht" }),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  authorId: true,
  authorName: true,
}).extend({
  status: z.enum(BLOG_STATUS).optional(),
  audience: z.enum(BLOG_AUDIENCE).optional(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(POST_TYPES, { required_error: "Type is verplicht" }),
  region: z.string({ required_error: "Gemeente is verplicht" }).min(1, "Gemeente is verplicht"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(SUBSCRIPTION_STATUS).optional(),
  plan: z.enum(SUBSCRIPTION_PLANS, { required_error: "Plan is verplicht" }),
});

export type InsertEntrepreneur = z.infer<typeof insertEntrepreneurSchema>;
export type Entrepreneur = typeof entrepreneurs.$inferSelect;

export const strictEntrepreneurSchema = insertEntrepreneurSchema.extend({
  lat: z.number({ required_error: "Latitude is verplicht" })
    .min(-90, "Latitude moet tussen -90 en 90 zijn")
    .max(90, "Latitude moet tussen -90 en 90 zijn")
    .refine(Number.isFinite, "Latitude must be a valid number"),
  lng: z.number({ required_error: "Longitude is verplicht" })
    .min(-180, "Longitude moet tussen -180 en 180 zijn")
    .max(180, "Longitude moet tussen -180 en 180 zijn")
    .refine(Number.isFinite, "Longitude must be a valid number"),
});

export type StrictInsertEntrepreneur = z.infer<typeof strictEntrepreneurSchema>;

// Bedrijfsprofiel types (Dutch field names)
export type InsertBedrijfsprofiel = z.infer<typeof insertBedrijfsprofielSchema>;
export type Bedrijfsprofiel = typeof bedrijfsprofielen.$inferSelect;

// Upload types
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type ProposalSummary = {
  proposal: Proposal;
  voteCounts: { yes: number; no: number; abstain: number };
  userVoteChoice?: "yes" | "no" | "abstain";
};

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogs.$inferSelect;

export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
}).extend({
  painPoints: z.array(z.enum(PAIN_POINTS)).optional(),
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const insertOnboardingTokenSchema = createInsertSchema(onboardingTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertOnboardingToken = z.infer<typeof insertOnboardingTokenSchema>;

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type OnboardingToken = typeof onboardingTokens.$inferSelect;

// User types
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().optional(),
  plan: z.enum(SUBSCRIPTION_PLANS).optional(),
});

export const registerUserSchema = z.object({
  email: z.string().email("Ongeldig emailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens zijn"),
  plan: z.enum(SUBSCRIPTION_PLANS).default("basic"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email("Ongeldig emailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
});

export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

// RegioBot chat request schema
export const regioBotChatSchema = z.object({
  message: z.string().min(1, "Bericht is verplicht"),
  mode: z.enum(REGIOBOT_MODES, { required_error: "Modus is verplicht" }).default("general"),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
});

export type RegioBotChatRequest = z.infer<typeof regioBotChatSchema>;

// Field visibility schemas and types
export const insertFieldVisibilitySchema = createInsertSchema(fieldVisibility).omit({
  id: true,
}).extend({
  visibility: z.enum(VISIBILITY_LEVELS, { required_error: "Zichtbaarheid is verplicht" }),
});

export const updateFieldVisibilitySchema = z.object({
  fieldName: z.string().min(1, "Veldnaam is verplicht"),
  visibility: z.enum(VISIBILITY_LEVELS, { required_error: "Zichtbaarheid is verplicht" }),
});

export type InsertFieldVisibility = z.infer<typeof insertFieldVisibilitySchema>;
export type FieldVisibility = typeof fieldVisibility.$inferSelect;
export type UpdateFieldVisibility = z.infer<typeof updateFieldVisibilitySchema>;

// Consent log schemas and types
export const insertConsentLogSchema = createInsertSchema(consentLog).omit({
  id: true,
  changedAt: true,
});

export type InsertConsentLog = z.infer<typeof insertConsentLogSchema>;
export type ConsentLog = typeof consentLog.$inferSelect;

// Privacy profile fields that can have visibility settings
export const PRIVACY_FIELDS = [
  "businessName",
  "firstName", 
  "lastName",
  "email",
  "bio",
  "category",
  "profileImageUrl",
] as const;
export type PrivacyField = typeof PRIVACY_FIELDS[number];

// ===============================
// WOO (Wet open overheid) TABLES
// ===============================

// WOO Categories - fixed set of allowed categories
export const WOO_CATEGORIES = [
  { slug: "mandaat_delegatie", label: "Mandaat & delegatie", isAllowed: true },
  { slug: "beleid_verordening", label: "Beleid & verordeningen", isAllowed: true },
  { slug: "vergunningen", label: "Vergunningen & beleidsregels", isAllowed: true },
  { slug: "heffingen_leges", label: "Heffingen, leges, belastingen", isAllowed: true },
  { slug: "handhaving_kaders", label: "Handhavingskaders (beleid)", isAllowed: true },
  { slug: "aanbesteding", label: "Aanbestedingen & gunning", isAllowed: true },
  { slug: "subsidies", label: "Subsidiekaders & besluiten", isAllowed: true },
  { slug: "uitvoering_partijen", label: "Uitvoeringsorganisaties/derden", isAllowed: true },
  { slug: "openbaarheid_archief", label: "Archief/openbaarheid/werkinstructies", isAllowed: true },
  { slug: "persoonlijk_verkeer_boete", label: "Persoonlijk/Verkeer/Boete (NIET TOEGESTAAN)", isAllowed: false },
] as const;

export type WooCategorySlug = typeof WOO_CATEGORIES[number]["slug"];

// WOO Categories table
export const wooCategories = pgTable("woo_categories", {
  slug: text("slug").primaryKey(),
  label: text("label").notNull(),
  isAllowed: boolean("is_allowed").notNull().default(true),
});

// Regions table
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// Authorities (overheden/instanties) table
export const authorities = pgTable("authorities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// WOO status options
export const WOO_REQUEST_STATUS = ["sent", "received", "in_progress", "completed", "rejected"] as const;

// WOO Requests table
export const wooRequests = pgTable("woo_requests", {
  id: serial("id").primaryKey(),
  regionId: integer("region_id").references(() => regions.id),
  authorityId: integer("authority_id").references(() => authorities.id),
  categorySlug: text("category_slug").references(() => wooCategories.slug).default("beleid_verordening"),
  title: text("title").notNull(),
  body: text("body"),
  referenceCode: text("reference_code"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  status: text("status").default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_woo_requests_region").on(table.regionId),
  index("idx_woo_requests_authority").on(table.authorityId),
  index("idx_woo_requests_category").on(table.categorySlug),
]);

// Document kinds
export const WOO_DOCUMENT_KIND = ["response", "decision", "attachment"] as const;

// WOO Documents table
export const wooDocuments = pgTable("woo_documents", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => wooRequests.id, { onDelete: "cascade" }),
  categorySlug: text("category_slug").references(() => wooCategories.slug),
  kind: text("kind").notNull().default("attachment"), // response/decision/attachment
  filename: text("filename").notNull(),
  fileUrl: text("file_url"),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  summary: text("summary"),
  textContent: text("text_content"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_woo_documents_request").on(table.requestId),
  index("idx_woo_documents_category").on(table.categorySlug),
]);

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// Request-Tag junction table
export const requestTags = pgTable("request_tags", {
  requestId: integer("request_id").notNull().references(() => wooRequests.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: unique().on(table.requestId, table.tagId),
}));

// WOO Dossiers - saved generated WOO letters with full workflow
export const wooDossiers = pgTable("woo_dossiers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  authority: text("authority").notNull(),
  subject: text("subject").notNull(),
  context: text("context"),
  requestedDocuments: text("requested_documents"),
  generatedLetter: text("generated_letter"),
  checklist: text("checklist"),
  status: text("status").default("intake"), // intake, extracted, questions, generated, sent, response_received, closed, ingebreke_gesteld
  // Workflow step 1: Intake
  uploadedDocument: text("uploaded_document"), // Beschikking text/content
  location: text("location"), // Gemeente/locatie
  purpose: text("purpose"), // controleslag, onderzoek, journalistiek
  userQuestion: text("user_question"), // "Wat wil je weten?"
  // Workflow step 2: Extracted data
  extractedData: jsonb("extracted_data"), // {datum, zaaknr, onderwerp, afdeling, kernfeiten, beleidsbotsing}
  // Workflow step 3: Document list
  documentList: jsonb("document_list"), // [{category, documents}]
  // Workflow step 5: Tracking
  deadline: timestamp("deadline", { withTimezone: true }),
  reminderSent: boolean("reminder_sent").default(false),
  // Afzendergegevens (AES-GCM versleuteld)
  senderNameEncrypted: text("sender_name_encrypted"),
  senderAddressEncrypted: text("sender_address_encrypted"),
  senderPostcodeEncrypted: text("sender_postcode_encrypted"),
  // Ingebrekestelling & dwangsom
  ingebrekeSentAt: timestamp("ingebreke_sent_at", { withTimezone: true }),
  dwangsomContractAcceptedAt: timestamp("dwangsom_contract_accepted_at", { withTimezone: true }),
  // Indiening bij gemeente / bestuursorgaan
  indienKanaal: varchar("indien_kanaal", { length: 16 }), // 'email' | 'post'
  indienOntvanger: text("indien_ontvanger"),
  ingediendOp: timestamp("ingediend_op", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_woo_dossiers_user").on(table.userId),
]);

// RegioScan voor Pro — brancheafhankelijke scan met 6 uitkomstblokken,
// risico/kansenscores, en concept Woo-verzoek. Bewaard als ondernemersdossier.
export const regioScans = pgTable("regio_scans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  branche: text("branche").notNull(),
  gemeente: text("gemeente").notNull(),
  extraContext: text("extra_context"),
  scoreRisico: integer("score_risico").notNull().default(0),
  scoreKans: integer("score_kans").notNull().default(0),
  result: jsonb("result").notNull(),
  wooConcept: text("woo_concept"),
  wooDossierId: integer("woo_dossier_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_regio_scans_user").on(table.userId),
]);

export const insertRegioScanSchema = createInsertSchema(regioScans).omit({
  id: true,
  createdAt: true,
});
export type InsertRegioScan = z.infer<typeof insertRegioScanSchema>;
export type RegioScan = typeof regioScans.$inferSelect;

// Help-flow dossiers — opgeslagen runs van de hulp-engine flows
// (brief-ontvangen, regel-onduidelijk, controle-vergunning-boete, ...).
// Antwoorden + scenario-uitkomst worden bewaard zodat een ondernemer later
// verder kan werken aan dezelfde casus.
export const helpFlowDossiers = pgTable("help_flow_dossiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  flowId: text("flow_id").notNull(),
  flowTitle: text("flow_title").notNull(),
  title: text("title").notNull(),
  answers: jsonb("answers").notNull(),
  scenarioId: text("scenario_id"),
  scenarioLevel: text("scenario_level"),
  scenarioRiskLabel: text("scenario_risk_label"),
  renderedText: text("rendered_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_help_flow_dossiers_user").on(table.userId),
]);

export const insertHelpFlowDossierSchema = createInsertSchema(helpFlowDossiers).omit({
  id: true,
  createdAt: true,
});
export type InsertHelpFlowDossier = z.infer<typeof insertHelpFlowDossierSchema>;
export type HelpFlowDossier = typeof helpFlowDossiers.$inferSelect;

// Schema voor het opslaan van een nieuwe dossier-run vanuit de frontend.
// userId wordt server-side ingevuld op basis van de ingelogde gebruiker.
export const saveHelpFlowDossierSchema = z.object({
  flowId: z.string().trim().min(1).max(120),
  flowTitle: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  answers: z
    .record(z.string().max(4000))
    .refine((obj) => Object.keys(obj).length <= 50, {
      message: "Te veel antwoordvelden",
    }),
  scenarioId: z.string().trim().max(120).optional().nullable(),
  scenarioLevel: z.string().trim().max(40).optional().nullable(),
  scenarioRiskLabel: z.string().trim().max(200).optional().nullable(),
  renderedText: z.string().max(20000).optional().nullable(),
});
export type SaveHelpFlowDossierInput = z.infer<typeof saveHelpFlowDossierSchema>;

// Schema voor het uitvoeren van een nieuwe scan vanuit de frontend
export const runRegioScanSchema = z.object({
  branche: z.string().trim().min(2, "Branche is verplicht").max(120),
  gemeente: z.string().trim().min(2, "Gemeente is verplicht").max(120),
  extraContext: z.string().trim().max(2000).optional(),
});
export type RunRegioScanInput = z.infer<typeof runRegioScanSchema>;

// Vorm van het resultaat dat de Gemini-prompt teruggeeft (en wat we tonen).
// We valideren met Zod om de UI te beschermen tegen ongeldige LLM-output.
export const regioScanItemSchema = z.object({
  titel: z.string(),
  toelichting: z.string().optional().default(""),
  bron: z.string().optional().default(""),
  teVerifieren: z.boolean().optional().default(true),
  // Verwachte datum of periode (vrij tekstveld zoals "Q3 2026", "voor zomer 2026", "12-09-2026").
  // Vooral relevant voor "besluiten die eraan komen".
  datum: z.string().optional().default(""),
});
export const regioScanActieSchema = z.object({
  titel: z.string(),
  prio: z.enum(["hoog", "midden", "laag"]).default("midden"),
  toelichting: z.string().optional().default(""),
});
export const regioScanResultSchema = z.object({
  scoreRisico: z.number().int().min(0).max(100),
  scoreKans: z.number().int().min(0).max(100),
  risicoToelichting: z.string().default(""),
  kansenToelichting: z.string().default(""),
  besluiten: z.array(regioScanItemSchema).default([]),
  regels: z.array(regioScanItemSchema).default([]),
  kansen: z.array(regioScanItemSchema).default([]),
  documenten: z.array(regioScanItemSchema).default([]),
  risicos: z.array(regioScanItemSchema).default([]),
  acties: z.array(regioScanActieSchema).default([]),
  samenvatting: z.string().default(""),
});
export type RegioScanItem = z.infer<typeof regioScanItemSchema>;
export type RegioScanActie = z.infer<typeof regioScanActieSchema>;
export type RegioScanResult = z.infer<typeof regioScanResultSchema>;

// Refresh tokens for JWT auth (stateless, scalable)
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash").notNull(), // SHA256 hash of the token
  tokenId: varchar("token_id").notNull().unique(), // For targeted revocation
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_refresh_tokens_user").on(table.userId),
  index("idx_refresh_tokens_token_id").on(table.tokenId),
]);

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({ id: true, createdAt: true });
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_password_reset_tokens_user").on(table.userId),
]);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// WOO Schemas and Types
export const insertRegionSchema = createInsertSchema(regions).omit({ id: true });
export const insertAuthoritySchema = createInsertSchema(authorities).omit({ id: true });
export const insertWooRequestSchema = createInsertSchema(wooRequests).omit({ id: true, createdAt: true });
export const insertWooDocumentSchema = createInsertSchema(wooDocuments).omit({ id: true, createdAt: true });
export const insertTagSchema = createInsertSchema(tags).omit({ id: true });
export const insertWooDossierSchema = createInsertSchema(wooDossiers).omit({ id: true, createdAt: true });

export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;
export type InsertAuthority = z.infer<typeof insertAuthoritySchema>;
export type Authority = typeof authorities.$inferSelect;
export type InsertWooRequest = z.infer<typeof insertWooRequestSchema>;
export type WooRequest = typeof wooRequests.$inferSelect;
export type InsertWooDocument = z.infer<typeof insertWooDocumentSchema>;
export type WooDocument = typeof wooDocuments.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertWooDossier = z.infer<typeof insertWooDossierSchema>;
export type WooDossier = typeof wooDossiers.$inferSelect;

// RegioCrew Schemas and Types
export const insertCrewProfileSchema = createInsertSchema(crewProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categories: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  rateType: z.enum(["hour", "day", "fixed"]).default("hour"),
  isActive: z.boolean().default(true),
});

export const insertCrewRequestSchema = createInsertSchema(crewRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  skills: z.array(z.string()).default([]),
  rateType: z.enum(["hour", "day", "fixed", "negotiable"]).default("negotiable"),
  status: z.enum(["open", "closed", "filled", "cancelled"]).default("open"),
});

export const insertCrewApplicationSchema = createInsertSchema(crewApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(["applied", "shortlisted", "accepted", "rejected", "withdrawn"]).default("applied"),
});

export type InsertCrewProfile = z.infer<typeof insertCrewProfileSchema>;
export type CrewProfile = typeof crewProfiles.$inferSelect;
export type InsertCrewRequest = z.infer<typeof insertCrewRequestSchema>;
export type CrewRequest = typeof crewRequests.$inferSelect;
export type InsertCrewApplication = z.infer<typeof insertCrewApplicationSchema>;
export type CrewApplication = typeof crewApplications.$inferSelect;

// WOO Category slugs for RAG documents
export const WOO_CATEGORY_SLUGS = [
  "mandaat_delegatie",
  "beleid_verordening",
  "vergunningen",
  "heffingen_leges",
  "handhaving_kaders",
  "aanbesteding",
  "subsidies",
  "uitvoering_partijen",
  "openbaarheid_archief",
] as const;

export type WooCategorySlugType = typeof WOO_CATEGORY_SLUGS[number];

// RAG System Tables for RegioBot WOO-bibliotheek
export const ragDocuments = pgTable("rag_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  region: text("region"),
  wooCategory: text("woo_category"),
  title: text("title"),
  sourceType: text("source_type").default("upload"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  letterDate: timestamp("letter_date"),
  metadataJson: jsonb("metadata_json").default({}),
  needsOcr: boolean("needs_ocr").default(false),
}, (table) => [
  index("idx_rag_documents_user").on(table.userId),
]);

export const ragChunks = pgTable("rag_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => ragDocuments.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  text: text("text").notNull(),
  metadataJson: jsonb("metadata_json").default({}),
}, (table) => [
  index("idx_rag_chunks_doc").on(table.documentId),
]);

export const ragEmbeddings = pgTable("rag_embeddings", {
  chunkId: varchar("chunk_id").primaryKey().references(() => ragChunks.id, { onDelete: "cascade" }),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  plan: text("plan").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  phone: text("phone"),
  region: text("region"),
  category: text("category"),
  badges: jsonb("badges").default([]),
  note: text("note"),
  source: text("source").default("openregio"),
});

export const monitorItems = pgTable("monitor_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  region: varchar("region").notNull(),
  title: varchar("title").notNull(),
  summary: text("summary").notNull(),
  sourceUrl: varchar("source_url"),
  tags: varchar("tags").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdByUserId: varchar("created_by_user_id"),
});

export const REGIO_DEAL_CATEGORIES = [
  "Software",
  "Kantoor",
  "Marketing",
  "Verzekering",
  "Energie",
  "Overig",
] as const;

export const regioDeals = pgTable("regio_deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  provider: varchar("provider").notNull(),
  category: varchar("category").notNull(),
  description: text("description").notNull(),
  discount: varchar("discount").notNull(),
  url: varchar("url").notNull(),
  promoCode: varchar("promo_code"),
  validUntil: varchar("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const INTEL_CATEGORIES = ["wetgeving", "beleid", "financieel", "subsidies"] as const;
export const INTEL_URGENTIE = ["hoog", "normaal", "info"] as const;

export const intelSignalen = pgTable("intel_signalen", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categorie: varchar("categorie", { enum: INTEL_CATEGORIES }).notNull(),
  urgentie: varchar("urgentie", { enum: INTEL_URGENTIE }).notNull().default("normaal"),
  titel: varchar("titel", { length: 512 }).notNull(),
  samenvatting: text("samenvatting").notNull(),
  bron: varchar("bron", { length: 255 }).notNull(),
  regio: varchar("regio", { length: 255 }).notNull().default("Nationaal"),
  sector: varchar("sector", { enum: SIGNAAL_SECTOR_TYPES }), // null = iedereen; "alle" = alle sectored users; specifieke sector = alleen die sector
  datum: timestamp("datum", { withTimezone: true }).notNull().defaultNow(),
  bronUrl: varchar("bron_url"),
  photoUrl: varchar("photo_url"),
  isPublished: boolean("is_published").notNull().default(true),
  externalId: varchar("external_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdByUserId: varchar("created_by_user_id"),
});

export const insertIntelSignaalSchema = createInsertSchema(intelSignalen).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertIntelSignaal = z.infer<typeof insertIntelSignaalSchema>;
export type IntelSignaal = typeof intelSignalen.$inferSelect;

export const insertRagDocumentSchema = createInsertSchema(ragDocuments).omit({ id: true, createdAt: true });
export const insertRagChunkSchema = createInsertSchema(ragChunks).omit({ id: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertMonitorItemSchema = createInsertSchema(monitorItems).omit({ id: true, createdAt: true });
export const insertRegioDealSchema = createInsertSchema(regioDeals).omit({ id: true, createdAt: true });

export type InsertRagDocument = z.infer<typeof insertRagDocumentSchema>;
export type RagDocument = typeof ragDocuments.$inferSelect;
export type InsertRagChunk = z.infer<typeof insertRagChunkSchema>;
export type RagChunk = typeof ragChunks.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertMonitorItem = z.infer<typeof insertMonitorItemSchema>;
export type MonitorItem = typeof monitorItems.$inferSelect;
export type InsertRegioDeal = z.infer<typeof insertRegioDealSchema>;
export type RegioDeal = typeof regioDeals.$inferSelect;

// ─── Lokale Marktplaats (ik zoek / ik bied) ───────────────────────────────
export const LOKAAL_AANBOD_TYPE = ["zoek", "bied"] as const;
export const LOKAAL_AANBOD_CATEGORIEEN = [
  "diensten", "producten", "ruimte", "materieel", "kennis", "samenwerking", "overig",
] as const;

export const lokaalAanbod = pgTable("lokaal_aanbod", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { enum: LOKAAL_AANBOD_TYPE }).notNull(),
  titel: varchar("titel", { length: 255 }).notNull(),
  beschrijving: text("beschrijving").notNull(),
  categorie: varchar("categorie", { enum: LOKAAL_AANBOD_CATEGORIEEN }).notNull(),
  regio: varchar("regio", { length: 255 }).notNull(),
  contactInfo: text("contact_info"),
  bedrijfsnaam: varchar("bedrijfsnaam", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertLokaalAanbodSchema = createInsertSchema(lokaalAanbod).omit({
  id: true,
  createdAt: true,
});
export type InsertLokaalAanbod = z.infer<typeof insertLokaalAanbodSchema>;
export type LokaalAanbod = typeof lokaalAanbod.$inferSelect;

// ─── Lokale Acties (evenementen door Pro-leden) ──────────────────────────────
export const LOKALE_ACTIE_DOELGROEPEN = [
  "iedereen", "buurtbewoners", "ouderen", "studenten", "gezinnen", "ondernemers", "kinderen",
] as const;
export const LOKALE_ACTIE_STATUS = ["actief", "verlopen"] as const;

export const lokaleActies = pgTable("lokale_acties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id").notNull().references(() => users.id),
  titel: varchar("titel", { length: 255 }).notNull(),
  beschrijving: text("beschrijving").notNull(),
  datum: timestamp("datum", { withTimezone: true }),
  locatie: varchar("locatie", { length: 255 }).notNull(),
  regio: varchar("regio", { length: 255 }).notNull(),
  doelgroep: varchar("doelgroep", { enum: LOKALE_ACTIE_DOELGROEPEN }).notNull().default("iedereen"),
  externeLink: text("externe_link"),
  contactEmail: varchar("contact_email", { length: 255 }),
  bedrijfsnaam: varchar("bedrijfsnaam", { length: 255 }),
  status: varchar("status", { enum: LOKALE_ACTIE_STATUS }).notNull().default("actief"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const insertLokaleActieSchema = createInsertSchema(lokaleActies).omit({
  id: true,
  createdAt: true,
  status: true,
  expiresAt: true,
});
export type InsertLokaleActie = z.infer<typeof insertLokaleActieSchema>;
export type LokaleActie = typeof lokaleActies.$inferSelect;

// ── Ondernemer Thema's (AI-gegenereerde wekelijkse updates) ──────────────────
export const ondernemerThemas = pgTable("ondernemer_themas", {
  id: serial("id").primaryKey(),
  themaId: varchar("thema_id", { length: 50 }).notNull().unique(),
  titel: varchar("titel", { length: 255 }).notNull(),
  tag: varchar("tag", { length: 50 }).notNull(),
  samenvatting: text("samenvatting").notNull(),
  acties: text("acties").array().notNull().default(sql`'{}'::text[]`),
  bijgewerktOp: timestamp("bijgewerkt_op", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOndernemerThemaSchema = createInsertSchema(ondernemerThemas).omit({
  id: true,
});
export type InsertOndernemerThema = z.infer<typeof insertOndernemerThemaSchema>;
export type OndernemerThema = typeof ondernemerThemas.$inferSelect;

export * from "./models/chat";

// ─── Wetgeving Inzendingen (Wet & Regelgeving indienen) ───────────────────────
export const WETGEVING_STATUS = ["ingediend", "verwerkt", "gepubliceerd"] as const;

export const wetgevingInzendingen = pgTable("wetgeving_inzendingen", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  afzender: varchar("afzender", { length: 255 }).notNull(),
  onderwerp: varchar("onderwerp", { length: 500 }).notNull(),
  regio: varchar("regio", { length: 255 }).notNull(),
  briefTekst: text("brief_tekst"),
  status: varchar("status", { enum: WETGEVING_STATUS }).notNull().default("ingediend"),
  ingediendOp: timestamp("ingediend_op", { withTimezone: true }).defaultNow().notNull(),
});

export const insertWetgevingInzendingSchema = createInsertSchema(wetgevingInzendingen).omit({
  id: true,
  ingediendOp: true,
  status: true,
});
export type InsertWetgevingInzending = z.infer<typeof insertWetgevingInzendingSchema>;
export type WetgevingInzending = typeof wetgevingInzendingen.$inferSelect;

// ─── Dagelijkse Acties (Cursussen) ──────────────────────────────────────────
export const COURSE_CATEGORIES = ["zichtbaarheid", "financieel", "marketing", "operatie", "wetgeving", "netwerk"] as const;
export type CourseCategoryType = typeof COURSE_CATEGORIES[number];

export const COURSE_PLAN_TYPES = ["basic", "pro", "all"] as const;
export type CoursePlanType = typeof COURSE_PLAN_TYPES[number];

export const COURSE_STATUS = ["draft", "published"] as const;

export const dailyCourses = pgTable("daily_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: varchar("category", { enum: COURSE_CATEGORIES }).notNull(),
  sector: varchar("sector").notNull().default("algemeen"),
  plan: varchar("plan", { enum: COURSE_PLAN_TYPES }).notNull().default("basic"),
  status: varchar("status", { enum: COURSE_STATUS }).notNull().default("draft"),
  postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  minutes: integer("minutes").notNull().default(15),
  goal: text("goal").notNull(),
  action: text("action").notNull(),
  result: text("result").notNull(),
  imageUrl: varchar("image_url"),
  ctaLabel: varchar("cta_label").default("Markeer als gedaan"),
  sortOrder: integer("sort_order").default(0),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyCourseProgress = pgTable("daily_course_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => dailyCourses.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.courseId),
]);

export const insertDailyCourseSchema = createInsertSchema(dailyCourses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDailyCourse = z.infer<typeof insertDailyCourseSchema>;
export type DailyCourse = typeof dailyCourses.$inferSelect;

export const insertDailyCourseProgressSchema = createInsertSchema(dailyCourseProgress).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyCourseProgress = z.infer<typeof insertDailyCourseProgressSchema>;
export type DailyCourseProgress = typeof dailyCourseProgress.$inferSelect;
