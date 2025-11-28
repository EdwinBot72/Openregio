import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema, type RegisterUser, type LoginUser } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const SALT_ROUNDS = 10;

function getSession() {
  // Sessie timeout: 24 uur (privacy-first, kortere sessies)
  const sessionTtl = 24 * 60 * 60 * 1000; // 24 uur
  
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Productie detectie: check NODE_ENV of Replit deployment
  const isProduction = process.env.NODE_ENV === "production" || 
                       process.env.REPL_SLUG !== undefined;
  
  // Log waarschuwing als secure cookies niet kunnen worden ingesteld
  if (isProduction && !process.env.SESSION_SECRET) {
    console.warn("⚠️ SESSION_SECRET niet ingesteld in productie omgeving");
  }
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Ververs sessie bij activiteit (idle timeout effectief)
    cookie: {
      httpOnly: true,
      secure: isProduction, // Secure cookie in productie (Replit is altijd HTTPS)
      sameSite: isProduction ? 'strict' : 'lax', // Strict in productie voor betere beveiliging
      maxAge: sessionTtl, // 24 uur - automatisch uitloggen na inactiviteit
    },
  });
}

export function setupSimpleAuth(app: Express) {
  // Setup session middleware
  app.set("trust proxy", 1);
  app.use(getSession());
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
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          bio: user.bio,
          category: user.category,
          mustCompleteOnboarding: user.mustCompleteOnboarding,
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
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          bio: user.bio,
          category: user.category,
          mustCompleteOnboarding: user.mustCompleteOnboarding,
          isAdmin: user.email === "edwin@stroombox.nl",
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
  
  // Get current user endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" });
    }
    
    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          bio: user.bio,
          category: user.category,
          mustCompleteOnboarding: user.mustCompleteOnboarding,
          isAdmin: user.email === "edwin@stroombox.nl",
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Fout bij ophalen gebruiker" });
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
