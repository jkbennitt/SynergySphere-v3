import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  serial,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
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

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Additional fields for our app
  bio: text("bio"),
  location: text("location"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const solutions = pgTable("solutions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  challenge: text("challenge").notNull(), // "reduce_emissions", "reforestation", etc.
  parameters: jsonb("parameters").notNull(), // Store simulation parameters as JSON
  outcomes: jsonb("outcomes").notNull(), // Store simulation results as JSON
  synergyScore: real("synergy_score").notNull(),
  shareableLink: text("shareable_link").unique(),
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  solutionId: integer("solution_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // For reply threads
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  solutionId: integer("solution_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  regionsExplored: integer("regions_explored").default(0).notNull(),
  solutionsCreated: integer("solutions_created").default(0).notNull(),
  averageSynergyScore: real("average_synergy_score").default(0).notNull(),
  totalCommunityInteractions: integer("total_community_interactions").default(0).notNull(),
  badges: jsonb("badges").default("[]").notNull(), // Array of earned badge IDs
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const globeInteractions = pgTable("globe_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  countryCode: text("country_code").notNull(),
  dataLayer: text("data_layer").notNull(), // "co2_emissions", "population_density", etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export const insertSolutionSchema = createInsertSchema(solutions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
  commentsCount: true,
  shareableLink: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertGlobeInteractionSchema = createInsertSchema(globeInteractions).omit({
  id: true,
  timestamp: true,
});


// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Solution = typeof solutions.$inferSelect;
export type InsertSolution = z.infer<typeof insertSolutionSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type GlobeInteraction = typeof globeInteractions.$inferSelect;
export type InsertGlobeInteraction = z.infer<typeof insertGlobeInteractionSchema>;

// Simulation parameter types
export type SimulationParameters = {
  solarEnergyAdoption: number;
  windEnergyAdoption: number;
  policyStrength: "low" | "moderate" | "high" | "maximum";
  carbonTax?: number;
  reforestationArea?: number;
};

export type SimulationOutcomes = {
  temperatureChange: number;
  co2Reduction: number;
  economicImpact: number;
  roi: number;
  feasibilityScore: number;
  sustainabilityScore: number;
  globalImpactScore: number;
};
