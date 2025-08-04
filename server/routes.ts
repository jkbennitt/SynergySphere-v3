import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSolutionSchema, insertCommentSchema, insertLikeSchema, insertGlobeInteractionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Legacy auth endpoint for compatibility
  app.get('/api/auth/me', async (req: any, res) => {
    try {
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        res.json({ user });
      } else {
        res.json({ user: null });
      }
    } catch (error) {
      console.error("Error fetching auth status:", error);
      res.json({ user: null });
    }
  });

  // Solutions routes
  app.get('/api/solutions', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const solutions = await storage.getAllSolutions(limit, offset);
      
      // Get user data for each solution
      const solutionsWithUsers = await Promise.all(
        solutions.map(async (solution) => {
          const user = await storage.getUser(solution.userId);
          return {
            ...solution,
            user: user ? { 
              id: user.id, 
              email: user.email, 
              firstName: user.firstName, 
              lastName: user.lastName, 
              profileImageUrl: user.profileImageUrl 
            } : null
          };
        })
      );
      
      res.json(solutionsWithUsers);
    } catch (error) {
      console.error('Error fetching solutions:', error);
      res.status(500).json({ message: 'Failed to fetch solutions' });
    }
  });

  app.get('/api/solutions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const solution = await storage.getSolution(id);
      
      if (!solution) {
        return res.status(404).json({ message: 'Solution not found' });
      }

      const user = await storage.getUser(solution.userId);
      const comments = await storage.getCommentsBySolution(id);
      
      // Get user data for comments
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment: any) => {
          const commentUser = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: commentUser ? { 
              id: commentUser.id, 
              email: commentUser.email, 
              firstName: commentUser.firstName, 
              lastName: commentUser.lastName, 
              profileImageUrl: commentUser.profileImageUrl 
            } : null
          };
        })
      );

      res.json({
        ...solution,
        user: user ? { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          profileImageUrl: user.profileImageUrl 
        } : null,
        comments: commentsWithUsers
      });
    } catch (error) {
      console.error('Error fetching solution:', error);
      res.status(500).json({ message: 'Failed to fetch solution' });
    }
  });

  app.get('/api/solutions/link/:link', async (req, res) => {
    try {
      const solution = await storage.getSolutionByShareableLink(req.params.link);
      
      if (!solution) {
        return res.status(404).json({ message: 'Solution not found' });
      }

      const user = await storage.getUser(solution.userId);
      res.json({
        ...solution,
        user: user ? { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          profileImageUrl: user.profileImageUrl 
        } : null
      });
    } catch (error) {
      console.error('Error fetching solution by link:', error);
      res.status(500).json({ message: 'Failed to fetch solution' });
    }
  });

  app.post('/api/solutions', isAuthenticated, async (req: any, res) => {
    try {
      const solutionData = insertSolutionSchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      
      const solution = await storage.createSolution(solutionData);
      res.status(201).json(solution);
    } catch (error) {
      console.error('Error creating solution:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create solution' });
    }
  });

  app.get('/api/users/:id/solutions', async (req, res) => {
    try {
      const userId = req.params.id;
      const solutions = await storage.getSolutionsByUser(userId);
      res.json(solutions);
    } catch (error) {
      console.error('Error fetching user solutions:', error);
      res.status(500).json({ message: 'Failed to fetch user solutions' });
    }
  });

  // Comments routes
  app.post('/api/solutions/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const solutionId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        solutionId,
        userId: req.user.claims.sub
      });
      
      const comment = await storage.createComment(commentData);
      const user = await storage.getUser(comment.userId);
      
      res.status(201).json({
        ...comment,
        user: user ? { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          profileImageUrl: user.profileImageUrl 
        } : null
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create comment' });
    }
  });

  // Likes routes
  app.post('/api/solutions/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const solutionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if already liked
      const existingLike = await storage.getLike(solutionId, userId);
      if (existingLike) {
        return res.status(400).json({ message: 'Already liked this solution' });
      }
      
      const like = await storage.createLike({ solutionId, userId });
      res.status(201).json(like);
    } catch (error) {
      console.error('Error creating like:', error);
      res.status(500).json({ message: 'Failed to like solution' });
    }
  });

  app.delete('/api/solutions/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const solutionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const deleted = await storage.deleteLike(solutionId, userId);
      if (!deleted) {
        return res.status(404).json({ message: 'Like not found' });
      }
      
      res.json({ message: 'Like removed successfully' });
    } catch (error) {
      console.error('Error removing like:', error);
      res.status(500).json({ message: 'Failed to remove like' });
    }
  });

  // User progress routes
  app.get('/api/users/:id/progress', async (req, res) => {
    try {
      const userId = req.params.id;
      const progress = await storage.getUserProgress(userId);
      
      if (!progress) {
        return res.status(404).json({ message: 'User progress not found' });
      }
      
      res.json(progress);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({ message: 'Failed to fetch user progress' });
    }
  });

  // Globe interactions routes
  app.post('/api/globe/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const interactionData = insertGlobeInteractionSchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      
      const interaction = await storage.createGlobeInteraction(interactionData);
      res.status(201).json(interaction);
    } catch (error) {
      console.error('Error creating globe interaction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to record globe interaction' });
    }
  });

  // Mock climate data API (in production, this would call external APIs)
  app.get('/api/climate/co2-emissions', (req, res) => {
    // Mock CO2 emissions data by country
    const co2Data = {
      "US": { emissions: 5416, population: 331000000, emissionsPerCapita: 16.4 },
      "CN": { emissions: 10175, population: 1439000000, emissionsPerCapita: 7.1 },
      "IN": { emissions: 2411, population: 1380000000, emissionsPerCapita: 1.7 },
      "RU": { emissions: 1616, population: 145000000, emissionsPerCapita: 11.1 },
      "JP": { emissions: 1162, population: 125000000, emissionsPerCapita: 9.3 },
      "DE": { emissions: 759, population: 83000000, emissionsPerCapita: 9.1 },
      "BR": { emissions: 419, population: 212000000, emissionsPerCapita: 2.0 },
      "CA": { emissions: 573, population: 38000000, emissionsPerCapita: 15.1 },
      "AU": { emissions: 414, population: 25000000, emissionsPerCapita: 16.6 },
      "GB": { emissions: 379, population: 67000000, emissionsPerCapita: 5.7 }
    };
    
    res.json(co2Data);
  });

  const httpServer = createServer(app);
  return httpServer;
}