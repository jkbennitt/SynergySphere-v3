import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertSolutionSchema, insertCommentSchema, insertLikeSchema, insertGlobeInteractionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || "synergy-sphere-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(new LocalStrategy(
    async (username: string, password: string, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Authentication required' });
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Log in the user
      req.login(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed after registration' });
        }
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Authentication error' });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      
      req.login(user, (loginErr: any) => {
        if (loginErr) {
          return res.status(500).json({ message: 'Login failed' });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const { password, ...userWithoutPassword } = req.user as any;
      res.json({ user: userWithoutPassword });
    } else {
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
            user: user ? { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl } : null
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
      const comments = await storage.getCommentsByolution(id);
      
      // Get user data for comments
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => {
          const commentUser = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: commentUser ? { id: commentUser.id, username: commentUser.username, firstName: commentUser.firstName, lastName: commentUser.lastName, avatarUrl: commentUser.avatarUrl } : null
          };
        })
      );

      res.json({
        ...solution,
        user: user ? { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl } : null,
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
        user: user ? { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl } : null
      });
    } catch (error) {
      console.error('Error fetching solution by link:', error);
      res.status(500).json({ message: 'Failed to fetch solution' });
    }
  });

  app.post('/api/solutions', requireAuth, async (req, res) => {
    try {
      const solutionData = insertSolutionSchema.parse({
        ...req.body,
        userId: (req.user as any).id
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
      const userId = parseInt(req.params.id);
      const solutions = await storage.getSolutionsByUser(userId);
      res.json(solutions);
    } catch (error) {
      console.error('Error fetching user solutions:', error);
      res.status(500).json({ message: 'Failed to fetch user solutions' });
    }
  });

  // Comments routes
  app.post('/api/solutions/:id/comments', requireAuth, async (req, res) => {
    try {
      const solutionId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        solutionId,
        userId: (req.user as any).id
      });
      
      const comment = await storage.createComment(commentData);
      const user = await storage.getUser(comment.userId);
      
      res.status(201).json({
        ...comment,
        user: user ? { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl } : null
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
  app.post('/api/solutions/:id/like', requireAuth, async (req, res) => {
    try {
      const solutionId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
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

  app.delete('/api/solutions/:id/like', requireAuth, async (req, res) => {
    try {
      const solutionId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
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
      const userId = parseInt(req.params.id);
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
  app.post('/api/globe/interactions', requireAuth, async (req, res) => {
    try {
      const interactionData = insertGlobeInteractionSchema.parse({
        ...req.body,
        userId: (req.user as any).id
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
