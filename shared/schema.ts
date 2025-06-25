import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  location: text("location"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const solutions = pgTable("solutions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // For reply threads
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  solutionId: integer("solution_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  regionsExplored: integer("regions_explored").default(0).notNull(),
  solutionsCreated: integer("solutions_created").default(0).notNull(),
  averageSynergyScore: real("average_synergy_score").default(0).notNull(),
  totalCommunityInteractions: integer("total_community_interactions").default(0).notNull(),
  badges: jsonb("badges").default("[]").notNull(), // Array of earned badge IDs
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const globeInteractions = pgTable("globe_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  countryCode: text("country_code").notNull(),
  dataLayer: text("data_layer").notNull(), // "co2_emissions", "population_density", etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Types
export type User = typeof users.$inferSelect;
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
export type LoginRequest = z.infer<typeof loginSchema>;

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
