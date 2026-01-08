import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema, refreshTokens, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { db } from "db";
import { eq, and, lt } from "drizzle-orm";

const ADMIN_EMAIL = "edwin@stroombox.nl";

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

if (!process.env.SESSION_SECRET) {
  throw new Error("FATAL: SESSION_SECRET environment variable is required for JWT authentication. Set it in Secrets.");
}
const JWT_SECRET = process.env.SESSION_SECRET;

const isProduction = process.env.NODE_ENV === "production" || process.env.REPL_SLUG !== undefined;

const loginLimiter = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60,
  blockDuration: 15 * 60,
});

const registerLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60,
  blockDuration: 60 * 60,
});

const emailLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
});

function generateTokenId(): string {
  return crypto.randomBytes(16).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function storeRefreshToken(userId: string, token: string, tokenId: string): Promise<void> {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    tokenId,
    expiresAt,
  });
}

async function validateRefreshToken(tokenId: string, token: string): Promise<string | null> {
  const tokenHash = hashToken(token);
  const result = await db.select().from(refreshTokens)
    .where(and(
      eq(refreshTokens.tokenId, tokenId),
      eq(refreshTokens.tokenHash, tokenHash)
    ))
    .limit(1);
  
  if (result.length === 0) return null;
  const storedToken = result[0];
  
  if (new Date(storedToken.expiresAt) < new Date()) {
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenId, tokenId));
    return null;
  }
  
  return storedToken.userId;
}

async function revokeRefreshToken(tokenId: string): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.tokenId, tokenId));
}

async function revokeAllUserTokens(userId: string): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}

async function cleanupExpiredTokens(): Promise<void> {
  await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
}

function setTokenCookies(res: Response, accessToken: string, refreshToken: string, tokenId: string): void {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
  });
  
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
  
  res.cookie("tokenId", tokenId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function clearTokenCookies(res: Response): void {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.clearCookie("tokenId", { path: "/api/auth" });
}

function formatUserResponse(user: User) {
  return {
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
  };
}

export function setupJwtAuth(app: Express) {
  app.set("trust proxy", 1);
  
  setInterval(() => {
    cleanupExpiredTokens().catch(console.error);
  }, 60 * 60 * 1000);
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    
    try {
      await registerLimiter.consume(ip);
    } catch {
      return res.status(429).json({ 
        error: "Te veel registratiepogingen. Probeer het over een uur opnieuw." 
      });
    }
    
    try {
      const validationResult = registerUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      
      const { email, password, plan, firstName, lastName } = validationResult.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email is al in gebruik" });
      }
      
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      
      const user = await storage.createUser({
        email,
        passwordHash,
        plan: plan || "basic",
        firstName: firstName || null,
        lastName: lastName || null,
      });
      
      const tokenId = generateTokenId();
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken();
      
      await storeRefreshToken(user.id, refreshToken, tokenId);
      setTokenCookies(res, accessToken, refreshToken, tokenId);
      
      res.status(201).json({ user: formatUserResponse(user) });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registratie mislukt" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    
    try {
      await loginLimiter.consume(ip);
    } catch {
      return res.status(429).json({ 
        error: "Te veel inlogpogingen. Probeer het over 15 minuten opnieuw." 
      });
    }
    
    try {
      const validationResult = loginUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      
      const { email, password } = validationResult.data;
      
      try {
        await emailLimiter.consume(email.toLowerCase());
      } catch {
        return res.status(429).json({ 
          error: "Te veel pogingen voor dit account. Probeer het later opnieuw." 
        });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Ongeldige inloggegevens" });
      }
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Ongeldige inloggegevens" });
      }
      
      const tokenId = generateTokenId();
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken();
      
      await storeRefreshToken(user.id, refreshToken, tokenId);
      setTokenCookies(res, accessToken, refreshToken, tokenId);
      
      res.json({ user: formatUserResponse(user) });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Inloggen mislukt" });
    }
  });
  
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    const tokenId = req.cookies?.tokenId;
    
    if (!refreshToken || !tokenId) {
      clearTokenCookies(res);
      return res.status(401).json({ error: "Refresh token ontbreekt" });
    }
    
    try {
      const userId = await validateRefreshToken(tokenId, refreshToken);
      
      if (!userId) {
        clearTokenCookies(res);
        return res.status(401).json({ error: "Ongeldige refresh token" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        clearTokenCookies(res);
        return res.status(401).json({ error: "Gebruiker niet gevonden" });
      }
      
      await revokeRefreshToken(tokenId);
      
      const newTokenId = generateTokenId();
      const newAccessToken = generateAccessToken(user.id, user.email);
      const newRefreshToken = generateRefreshToken();
      
      await storeRefreshToken(user.id, newRefreshToken, newTokenId);
      setTokenCookies(res, newAccessToken, newRefreshToken, newTokenId);
      
      res.json({ user: formatUserResponse(user) });
    } catch (error) {
      console.error("Refresh error:", error);
      clearTokenCookies(res);
      res.status(401).json({ error: "Token vernieuwen mislukt" });
    }
  });
  
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const tokenId = req.cookies?.tokenId;
    
    if (tokenId) {
      await revokeRefreshToken(tokenId).catch(console.error);
    }
    
    clearTokenCookies(res);
    res.json({ message: "Uitgelogd" });
  });
  
  app.post("/api/auth/logout-all", async (req: Request, res: Response) => {
    const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    
    if (!accessToken) {
      return res.status(401).json({ error: "Niet ingelogd" });
    }
    
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as { userId: string };
      await revokeAllUserTokens(decoded.userId);
      clearTokenCookies(res);
      res.json({ message: "Overal uitgelogd" });
    } catch {
      clearTokenCookies(res);
      res.status(401).json({ error: "Ongeldige token" });
    }
  });
  
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    
    if (!accessToken) {
      return res.status(401).json({ error: "Niet ingelogd" });
    }
    
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as { userId: string; email: string };
      const user = await storage.getUserById(decoded.userId);
      
      if (!user) {
        clearTokenCookies(res);
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }
      
      res.json({ user: formatUserResponse(user) });
    } catch (error) {
      if ((error as jwt.JsonWebTokenError).name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token verlopen", code: "TOKEN_EXPIRED" });
      }
      clearTokenCookies(res);
      res.status(401).json({ error: "Ongeldige token" });
    }
  });
}

function toAuthUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    plan: user.plan || "basic",
    firstName: user.firstName,
    lastName: user.lastName,
    businessName: user.businessName,
    bio: user.bio,
    category: user.category,
    mustCompleteOnboarding: user.mustCompleteOnboarding,
    isAdmin: user.email === ADMIN_EMAIL,
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
  
  if (!accessToken) {
    return res.status(401).json({ error: "Authenticatie vereist" });
  }
  
  try {
    jwt.verify(accessToken, JWT_SECRET) as { userId: string; email: string };
    next();
  } catch (error) {
    if ((error as jwt.JsonWebTokenError).name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token verlopen", code: "TOKEN_EXPIRED" });
    }
    res.status(401).json({ error: "Ongeldige token" });
  }
}

export async function attachUser(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
  
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as { userId: string; email: string };
      const user = await storage.getUserById(decoded.userId);
      if (user) {
        req.user = toAuthUser(user);
      }
    } catch {
    }
  }
  
  next();
}

export async function requirePro(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
  
  if (!accessToken) {
    return res.status(401).json({ error: "Authenticatie vereist" });
  }
  
  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as { userId: string; email: string };
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: "Gebruiker niet gevonden" });
    }
    
    if (user.plan !== "pro") {
      return res.status(403).json({ 
        error: "PRO-abonnement vereist",
        upgradeUrl: "/upgrade" 
      });
    }
    
    req.user = toAuthUser(user);
    next();
  } catch (error) {
    if ((error as jwt.JsonWebTokenError).name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token verlopen", code: "TOKEN_EXPIRED" });
    }
    res.status(401).json({ error: "Ongeldige token" });
  }
}

export async function issueTokensForUser(res: Response, user: User): Promise<void> {
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken();
  const tokenId = generateTokenId();
  
  await storeRefreshToken(user.id, refreshToken, tokenId);
  setTokenCookies(res, accessToken, refreshToken, tokenId);
}

export { cleanupExpiredTokens, clearTokenCookies, revokeAllUserTokens };
