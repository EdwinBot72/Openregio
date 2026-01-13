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
export const SUBSCRIPTION_PLANS = ["basic", "pro"] as const;
export const USER_ROLES = ["member", "master", "admin"] as const;

// Users table - supports both Replit Auth and email/password auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  plan: varchar("plan", { enum: SUBSCRIPTION_PLANS }).default("basic"),
  role: varchar("role", { enum: USER_ROLES }).default("member").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  businessName: varchar("business_name"),
  bio: text("bio"),
  category: varchar("category"),
  region: varchar("region"), // User's region for REGION_ONLY visibility
  visibilitySettings: text("visibility_settings"), // JSON string with visibility per field
  mustCompleteOnboarding: boolean("must_complete_onboarding").default(true).notNull(),
  onboardingToken: varchar("onboarding_token"),
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
  // Basischeck velden
  cashMogelijk: boolean("cash_mogelijk").notNull().default(false),
  bonnenblok: boolean("bonnenblok").notNull().default(false),
  papierenTelefoonlijst: boolean("papieren_telefoonlijst").notNull().default(false),
  offlineWerken: boolean("offline_werken").notNull().default(false),
  noodstroom: boolean("noodstroom").notNull().default(false),
  basischeckIngevuld: boolean("basischeck_ingevuld").notNull().default(false),
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
export const REGIONS = ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Leiden", "Haarlem"] as const;

// Shared constants for proposal status and vote choices
export const PROPOSAL_STATUS = ["open", "closed"] as const;
export const VOTE_CHOICES = ["yes", "no", "abstain"] as const;

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  replitUserId: varchar("replit_user_id").unique().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
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
  region: z.enum(REGIONS, { required_error: "Regio is verplicht" }),
  authorUserId: z.string().optional().nullable(),
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
  title: text("title").notNull(),
  body: text("body"),
  referenceCode: text("reference_code"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  status: text("status").default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_woo_requests_region").on(table.regionId),
  index("idx_woo_requests_authority").on(table.authorityId),
]);

// Document kinds
export const WOO_DOCUMENT_KIND = ["response", "decision", "attachment"] as const;

// WOO Documents table
export const wooDocuments = pgTable("woo_documents", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => wooRequests.id, { onDelete: "cascade" }),
  kind: text("kind").notNull().default("attachment"), // response/decision/attachment
  filename: text("filename").notNull(),
  fileUrl: text("file_url"),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  summary: text("summary"),
  textContent: text("text_content"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_woo_documents_request").on(table.requestId),
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
  status: text("status").default("intake"), // intake, extracted, questions, generated, sent, response_received, closed
  // Workflow step 1: Intake
  uploadedDocument: text("uploaded_document"), // Beschikking text/content
  location: text("location"), // Gemeente/locatie
  purpose: text("purpose"), // bezwaar, onderzoek, journalistiek
  userQuestion: text("user_question"), // "Wat wil je weten?"
  // Workflow step 2: Extracted data
  extractedData: jsonb("extracted_data"), // {datum, zaaknr, onderwerp, afdeling, kernfeiten, beleidsbotsing}
  // Workflow step 3: Document list
  documentList: jsonb("document_list"), // [{category, documents}]
  // Workflow step 5: Tracking
  deadline: timestamp("deadline", { withTimezone: true }),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_woo_dossiers_user").on(table.userId),
]);

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

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_blog_posts_author").on(table.authorId),
  index("idx_blog_posts_created").on(table.createdAt),
]);

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

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

// ===============================
// REGIOMARKT TABLES (B2B Deal Network)
// ===============================

// Business categories for RegioMarkt slots (exclusivity per region)
export const businessCategories = pgTable("business_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Region slots - 1 slot per category per region for exclusivity
export const SLOT_STATUS = ["open", "reserved", "active"] as const;

export const regionSlots = pgTable("region_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  regionName: text("region_name").notNull(), // Uses REGIONS constant values
  categoryId: varchar("category_id").notNull().references(() => businessCategories.id),
  status: text("status").notNull().default("open"),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  reservedUntil: timestamp("reserved_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueRegionCategory: unique().on(table.regionName, table.categoryId),
}));

// Leads - ingebracht door leden
export const LEAD_STATUS = ["new", "claimed", "qualified", "won", "lost", "expired"] as const;

export const marketLeads = pgTable("market_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  regionName: text("region_name").notNull(),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id),
  
  // Klantgegevens
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  clientCompany: text("client_company"),
  
  // Lead details
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => businessCategories.id),
  
  // Lifecycle
  status: text("status").notNull().default("new"),
  valueEstimateEur: integer("value_estimate_eur"),
  dueBy: timestamp("due_by", { withTimezone: true }),
  
  // Claim info
  claimedByUserId: varchar("claimed_by_user_id").references(() => users.id),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_market_leads_region").on(table.regionName),
  index("idx_market_leads_status").on(table.status),
  index("idx_market_leads_category").on(table.categoryId),
]);

// Deals - afgesloten deals met fees
export const DEAL_STATUS = ["in_progress", "won", "lost"] as const;

export const marketDeals = pgTable("market_deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => marketLeads.id),
  regionName: text("region_name").notNull(),
  
  // Supplier (who does the work)
  supplierUserId: varchar("supplier_user_id").notNull().references(() => users.id),
  
  // Referrer (who brought the lead, gets fee)
  referrerUserId: varchar("referrer_user_id").references(() => users.id),
  
  status: text("status").notNull().default("in_progress"),
  amountEur: integer("amount_eur"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_market_deals_region").on(table.regionName),
  index("idx_market_deals_supplier").on(table.supplierUserId),
]);

// Deal fees - platform fee + referral fee tracking
export const FEE_TYPE = ["platform_fee", "referral_fee"] as const;
export const FEE_STATUS = ["pending", "invoiced", "paid", "waived"] as const;

export const dealFees = pgTable("deal_fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealId: varchar("deal_id").notNull().references(() => marketDeals.id, { onDelete: "cascade" }),
  feeType: text("fee_type").notNull(),
  status: text("status").notNull().default("pending"),
  payToUserId: varchar("pay_to_user_id").references(() => users.id),
  percent: integer("percent"), // e.g. 5 or 10
  amountEur: integer("amount_eur"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_deal_fees_deal").on(table.dealId),
]);

// RegioMarkt Schemas and Types
export const insertBusinessCategorySchema = createInsertSchema(businessCategories).omit({ id: true, createdAt: true });
export type InsertBusinessCategory = z.infer<typeof insertBusinessCategorySchema>;
export type BusinessCategory = typeof businessCategories.$inferSelect;

export const insertRegionSlotSchema = createInsertSchema(regionSlots).omit({ id: true, createdAt: true });
export type InsertRegionSlot = z.infer<typeof insertRegionSlotSchema>;
export type RegionSlot = typeof regionSlots.$inferSelect;

export const insertMarketLeadSchema = createInsertSchema(marketLeads).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  claimedAt: true,
  claimedByUserId: true,
}).extend({
  status: z.enum(LEAD_STATUS).optional(),
  regionName: z.enum(REGIONS, { required_error: "Regio is verplicht" }),
});
export type InsertMarketLead = z.infer<typeof insertMarketLeadSchema>;
export type MarketLead = typeof marketLeads.$inferSelect;

export const insertMarketDealSchema = createInsertSchema(marketDeals).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  status: z.enum(DEAL_STATUS).optional(),
});
export type InsertMarketDeal = z.infer<typeof insertMarketDealSchema>;
export type MarketDeal = typeof marketDeals.$inferSelect;

export const insertDealFeeSchema = createInsertSchema(dealFees).omit({ id: true, createdAt: true });
export type InsertDealFee = z.infer<typeof insertDealFeeSchema>;
export type DealFee = typeof dealFees.$inferSelect;

// RegioMarkt business categories (seed data)
export const BUSINESS_CATEGORIES = [
  { slug: "loodgieter", name: "Loodgieter" },
  { slug: "elektricien", name: "Elektricien" },
  { slug: "webbouwer", name: "Webbouwer" },
  { slug: "drukker", name: "Drukker" },
  { slug: "schoonmaak", name: "Schoonmaak" },
  { slug: "accountant", name: "Accountant" },
  { slug: "fotograaf", name: "Fotograaf" },
  { slug: "schilder", name: "Schilder" },
  { slug: "tuinman", name: "Tuinman" },
  { slug: "kapper", name: "Kapper" },
  { slug: "coach", name: "Coach/Trainer" },
  { slug: "designer", name: "Grafisch Ontwerper" },
] as const;
