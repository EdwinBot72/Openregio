import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema, type RegisterUser, type LoginUser } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const SALT_ROUNDS = 10;

export function setupSimpleAuth(app: Express) {
  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validationResult = registerUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      
      const { email, password, plan, firstName, lastName } = validationResult.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email is al in gebruik" });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Create user
      const user = await storage.createUser({
        email,
        passwordHash,
        plan: plan || "basic",
        firstName: firstName || null,
        lastName: lastName || null,
      });
      
      // Set session
      req.session.userId = user.id;
      
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registratie mislukt" });
    }
  });
  
  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validationResult = loginUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      
      const { email, password } = validationResult.data;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Ongeldige inloggegevens" });
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Ongeldige inloggegevens" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Inloggen mislukt" });
    }
  });
  
  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Uitloggen mislukt" });
      }
      res.json({ message: "Uitgelogd" });
    });
  });
  
  // Get current user endpoint (simple auth)
  // Note: This runs before Replit Auth handler, so call next() if not a simple auth user
  app.get("/api/auth/user", async (req: Request, res: Response, next: Function) => {
    // Only handle if this is a simple auth session
    if (!req.session.userId) {
      return next(); // Pass to Replit Auth handler
    }
    
    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        // User not found in simple auth storage - pass to Replit Auth handler
        return next();
      }
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      // Pass to Replit Auth handler on error as well
      next();
    }
  });
}

// Auth middleware to protect routes
export function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authenticatie vereist" });
  }
  next();
}
