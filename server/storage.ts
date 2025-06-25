import { 
  users, solutions, comments, likes, userProgress, globeInteractions,
  type User, type InsertUser, type Solution, type InsertSolution,
  type Comment, type InsertComment, type Like, type InsertLike,
  type UserProgress, type InsertUserProgress, type GlobeInteraction,
  type InsertGlobeInteraction
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Solution operations
  getSolution(id: number): Promise<Solution | undefined>;
  getSolutionByShareableLink(link: string): Promise<Solution | undefined>;
  getSolutionsByUser(userId: number): Promise<Solution[]>;
  getAllSolutions(limit?: number, offset?: number): Promise<Solution[]>;
  createSolution(solution: InsertSolution): Promise<Solution>;
  updateSolution(id: number, updates: Partial<Solution>): Promise<Solution | undefined>;
  deleteSolution(id: number): Promise<boolean>;

  // Comment operations
  getCommentsBySolution(solutionId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;

  // Like operations
  getLike(solutionId: number, userId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(solutionId: number, userId: number): Promise<boolean>;

  // User progress operations
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;

  // Globe interaction operations
  createGlobeInteraction(interaction: InsertGlobeInteraction): Promise<GlobeInteraction>;
  getUserGlobeInteractions(userId: number): Promise<GlobeInteraction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private solutions: Map<number, Solution>;
  private comments: Map<number, Comment>;
  private likes: Map<string, Like>; // key: `${solutionId}-${userId}`
  private userProgress: Map<number, UserProgress>;
  private globeInteractions: Map<number, GlobeInteraction>;
  private currentUserId: number;
  private currentSolutionId: number;
  private currentCommentId: number;
  private currentLikeId: number;
  private currentProgressId: number;
  private currentInteractionId: number;

  constructor() {
    this.users = new Map();
    this.solutions = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.userProgress = new Map();
    this.globeInteractions = new Map();
    this.currentUserId = 1;
    this.currentSolutionId = 1;
    this.currentCommentId = 1;
    this.currentLikeId = 1;
    this.currentProgressId = 1;
    this.currentInteractionId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      isActive: true,
    };
    this.users.set(id, user);
    
    // Initialize user progress
    await this.createOrUpdateUserProgress({
      userId: id,
      regionsExplored: 0,
      solutionsCreated: 0,
      averageSynergyScore: 0,
      totalCommunityInteractions: 0,
      badges: [],
    });

    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Solution operations
  async getSolution(id: number): Promise<Solution | undefined> {
    return this.solutions.get(id);
  }

  async getSolutionByShareableLink(link: string): Promise<Solution | undefined> {
    return Array.from(this.solutions.values()).find(solution => solution.shareableLink === link);
  }

  async getSolutionsByUser(userId: number): Promise<Solution[]> {
    return Array.from(this.solutions.values())
      .filter(solution => solution.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllSolutions(limit = 50, offset = 0): Promise<Solution[]> {
    const allSolutions = Array.from(this.solutions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allSolutions.slice(offset, offset + limit);
  }

  async createSolution(insertSolution: InsertSolution): Promise<Solution> {
    const id = this.currentSolutionId++;
    const shareableLink = nanoid(10);
    const solution: Solution = {
      ...insertSolution,
      id,
      shareableLink,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.solutions.set(id, solution);

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
        badges: progress.badges,
      });
    }

    return solution;
  }

  async updateSolution(id: number, updates: Partial<Solution>): Promise<Solution | undefined> {
    const solution = this.solutions.get(id);
    if (!solution) return undefined;
    
    const updatedSolution = { ...solution, ...updates, updatedAt: new Date() };
    this.solutions.set(id, updatedSolution);
    return updatedSolution;
  }

  async deleteSolution(id: number): Promise<boolean> {
    return this.solutions.delete(id);
  }

  // Comment operations
  async getCommentsBySolution(solutionId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.solutionId === solutionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.comments.set(id, comment);

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
        badges: progress.badges,
      });
    }

    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;

    // Update solution comment count
    const solution = await this.getSolution(comment.solutionId);
    if (solution) {
      await this.updateSolution(solution.id, {
        commentsCount: Math.max(0, solution.commentsCount - 1)
      });
    }

    return this.comments.delete(id);
  }

  // Like operations
  async getLike(solutionId: number, userId: number): Promise<Like | undefined> {
    return this.likes.get(`${solutionId}-${userId}`);
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = this.currentLikeId++;
    const like: Like = {
      ...insertLike,
      id,
      createdAt: new Date(),
    };
    this.likes.set(`${insertLike.solutionId}-${insertLike.userId}`, like);

    // Update solution like count
    const solution = await this.getSolution(insertLike.solutionId);
    if (solution) {
      await this.updateSolution(solution.id, {
        likesCount: solution.likesCount + 1
      });
    }

    return like;
  }

  async deleteLike(solutionId: number, userId: number): Promise<boolean> {
    const key = `${solutionId}-${userId}`;
    const deleted = this.likes.delete(key);
    
    if (deleted) {
      // Update solution like count
      const solution = await this.getSolution(solutionId);
      if (solution) {
        await this.updateSolution(solution.id, {
          likesCount: Math.max(0, solution.likesCount - 1)
        });
      }
    }

    return deleted;
  }

  // User progress operations
  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(progress => progress.userId === userId);
  }

  async createOrUpdateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgress(insertProgress.userId);
    
    if (existing) {
      const updated: UserProgress = {
        ...existing,
        ...insertProgress,
        updatedAt: new Date(),
      };
      this.userProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentProgressId++;
      const progress: UserProgress = {
        ...insertProgress,
        id,
        updatedAt: new Date(),
      };
      this.userProgress.set(id, progress);
      return progress;
    }
  }

  // Globe interaction operations
  async createGlobeInteraction(insertInteraction: InsertGlobeInteraction): Promise<GlobeInteraction> {
    const id = this.currentInteractionId++;
    const interaction: GlobeInteraction = {
      ...insertInteraction,
      id,
      timestamp: new Date(),
    };
    this.globeInteractions.set(id, interaction);

    // Update user progress - regions explored
    const uniqueCountries = new Set(
      Array.from(this.globeInteractions.values())
        .filter(i => i.userId === insertInteraction.userId)
        .map(i => i.countryCode)
    );

    const progress = await this.getUserProgress(insertInteraction.userId);
    if (progress) {
      await this.createOrUpdateUserProgress({
        userId: insertInteraction.userId,
        regionsExplored: uniqueCountries.size,
        solutionsCreated: progress.solutionsCreated,
        averageSynergyScore: progress.averageSynergyScore,
        totalCommunityInteractions: progress.totalCommunityInteractions,
        badges: progress.badges,
      });
    }

    return interaction;
  }

  async getUserGlobeInteractions(userId: number): Promise<GlobeInteraction[]> {
    return Array.from(this.globeInteractions.values())
      .filter(interaction => interaction.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const storage = new MemStorage();
