import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, doublePrecision, unique, index, jsonb } from "drizzle-orm/pg-core";
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
  mustCompleteOnboarding: boolean("must_complete_onboarding").default(true).notNull(),
  onboardingToken: varchar("onboarding_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
