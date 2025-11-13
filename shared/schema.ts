import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  proposerId: varchar("proposer_id").notNull(),
  proposerName: text("proposer_name").notNull(),
  votesFor: text("votes_for").notNull().default("0"),
  votesAgainst: text("votes_against").notNull().default("0"),
  votesAbstain: text("votes_abstain").notNull().default("0"),
  deadline: timestamp("deadline").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

export const insertEntrepreneurSchema = createInsertSchema(entrepreneurs).omit({
  id: true,
  createdAt: true,
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  votesFor: true,
  votesAgainst: true,
  votesAbstain: true,
  status: true,
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

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

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
