import {
  users, solutions, comments, likes, userProgress, globeInteractions,
  type User, type UpsertUser, type Solution, type InsertSolution,
  type Comment, type InsertComment, type Like, type InsertLike,
  type UserProgress, type InsertUserProgress, type GlobeInteraction,
  type InsertGlobeInteraction
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Solution operations
  getSolution(id: number): Promise<Solution | undefined>;
  getSolutionByShareableLink(link: string): Promise<Solution | undefined>;
  getSolutionsByUser(userId: string): Promise<Solution[]>;
  getAllSolutions(limit?: number, offset?: number): Promise<Solution[]>;
  createSolution(solution: InsertSolution): Promise<Solution>;
  updateSolution(id: number, updates: Partial<Solution>): Promise<Solution | undefined>;
  deleteSolution(id: number): Promise<boolean>;

  // Comment operations
  getCommentsBySolution(solutionId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;

  // Like operations
  getLike(solutionId: number, userId: string): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(solutionId: number, userId: string): Promise<boolean>;

  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;

  // Globe interaction operations
  createGlobeInteraction(interaction: InsertGlobeInteraction): Promise<GlobeInteraction>;
  getUserGlobeInteractions(userId: string): Promise<GlobeInteraction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Solution operations
  async getSolution(id: number): Promise<Solution | undefined> {
    const [solution] = await db.select().from(solutions).where(eq(solutions.id, id));
    return solution;
  }

  async getSolutionByShareableLink(link: string): Promise<Solution | undefined> {
    const [solution] = await db.select().from(solutions).where(eq(solutions.shareableLink, link));
    return solution;
  }

  async getSolutionsByUser(userId: string): Promise<Solution[]> {
    return await db.select().from(solutions)
      .where(eq(solutions.userId, userId))
      .orderBy(solutions.createdAt);
  }

  async getAllSolutions(limit = 50, offset = 0): Promise<Solution[]> {
    return await db.select().from(solutions)
      .orderBy(solutions.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async createSolution(insertSolution: InsertSolution): Promise<Solution> {
    const shareableLink = nanoid(10);
    const [solution] = await db
      .insert(solutions)
      .values({
        ...insertSolution,
        parameters: insertSolution.parameters as any,
        outcomes: insertSolution.outcomes as any,
        shareableLink,
        likesCount: 0,
        commentsCount: 0,
      })
      .returning();

    // Update user progress
    const progress = await this.getUserProgress(insertSolution.userId);
    if (progress) {
      const newSolutionsCount = progress.solutionsCreated + 1;
      const newAverageScore = (progress.averageSynergyScore * progress.solutionsCreated + insertSolution.synergyScore) / newSolutionsCount;
      
      await this.createOrUpdateUserProgress({
        userId: insertSolution.userId,
        regionsExplored: progress.regionsExplored,
        solutionsCreated: newSolutionsCount,
        averageSynergyScore: newAverageScore,
        totalCommunityInteractions: progress.totalCommunityInteractions,
        badges: progress.badges as any,
      });
    }

    return solution;
  }

  async updateSolution(id: number, updates: Partial<Solution>): Promise<Solution | undefined> {
    const [solution] = await db
      .update(solutions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(solutions.id, id))
      .returning();
    return solution;
  }

  async deleteSolution(id: number): Promise<boolean> {
    const result = await db.delete(solutions).where(eq(solutions.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Comment operations
  async getCommentsBySolution(solutionId: number): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.solutionId, solutionId))
      .orderBy(comments.createdAt);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();

    // Update solution comment count
    const solution = await this.getSolution(insertComment.solutionId);
    if (solution) {
      await this.updateSolution(solution.id, {
        commentsCount: solution.commentsCount + 1
      });
    }

    // Update user progress
    const progress = await this.getUserProgress(insertComment.userId);
    if (progress) {
      await this.createOrUpdateUserProgress({
        userId: insertComment.userId,
        regionsExplored: progress.regionsExplored,
        solutionsCreated: progress.solutionsCreated,
        averageSynergyScore: progress.averageSynergyScore,
        totalCommunityInteractions: progress.totalCommunityInteractions + 1,
        badges: progress.badges as any,
      });
    }

    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    if (!comment) return false;

    // Update solution comment count
    const solution = await this.getSolution(comment.solutionId);
    if (solution) {
      await this.updateSolution(solution.id, {
        commentsCount: Math.max(0, solution.commentsCount - 1)
      });
    }

    const result = await db.delete(comments).where(eq(comments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Like operations
  async getLike(solutionId: number, userId: string): Promise<Like | undefined> {
    const [like] = await db.select().from(likes)
      .where(and(eq(likes.solutionId, solutionId), eq(likes.userId, userId)));
    return like;
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values(insertLike)
      .returning();

    // Update solution like count
    const solution = await this.getSolution(insertLike.solutionId);
    if (solution) {
      await this.updateSolution(solution.id, {
        likesCount: solution.likesCount + 1
      });
    }

    return like;
  }

  async deleteLike(solutionId: number, userId: string): Promise<boolean> {
    const result = await db.delete(likes)
      .where(and(eq(likes.solutionId, solutionId), eq(likes.userId, userId)));
    
    if ((result.rowCount || 0) > 0) {
      // Update solution like count
      const solution = await this.getSolution(solutionId);
      if (solution) {
        await this.updateSolution(solution.id, {
          likesCount: Math.max(0, solution.likesCount - 1)
        });
      }
    }

    return (result.rowCount || 0) > 0;
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(eq(userProgress.userId, userId));
    return progress;
  }

  async createOrUpdateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values({
        ...insertProgress,
        badges: insertProgress.badges as any,
      })
      .onConflictDoUpdate({
        target: userProgress.userId,
        set: {
          ...insertProgress,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  // Globe interaction operations
  async createGlobeInteraction(insertInteraction: InsertGlobeInteraction): Promise<GlobeInteraction> {
    const [interaction] = await db
      .insert(globeInteractions)
      .values(insertInteraction)
      .returning();

    // Update user progress - regions explored
    const userInteractions = await this.getUserGlobeInteractions(insertInteraction.userId);
    const uniqueCountries = new Set(userInteractions.map(i => i.countryCode));

    const progress = await this.getUserProgress(insertInteraction.userId);
    if (progress) {
      await this.createOrUpdateUserProgress({
        userId: insertInteraction.userId,
        regionsExplored: uniqueCountries.size,
        solutionsCreated: progress.solutionsCreated,
        averageSynergyScore: progress.averageSynergyScore,
        totalCommunityInteractions: progress.totalCommunityInteractions,
        badges: progress.badges as any,
      });
    }

    return interaction;
  }

  async getUserGlobeInteractions(userId: string): Promise<GlobeInteraction[]> {
    return await db.select().from(globeInteractions)
      .where(eq(globeInteractions.userId, userId))
      .orderBy(globeInteractions.timestamp);
  }
}

export const storage = new DatabaseStorage();
