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
