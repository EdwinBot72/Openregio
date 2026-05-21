import type { Express, Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        plan: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        businessName: string | null;
        bio: string | null;
        category: string | null;
        sector: string | null;
        region: string | null;
        mustCompleteOnboarding: boolean;
        isAdmin: boolean;
      };
    }
  }
}
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema, refreshTokens, passwordResetTokens, type User } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "db";
import { eq, and, lt, isNull } from "drizzle-orm";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./services/emailService";
import { generateOnboardingToken } from "./utils/auth";

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

if (!process.env.SESSION_SECRET) {
  throw new Error("FATAL: SESSION_SECRET environment variable is required for JWT authentication. Set it in Secrets.");
}
const JWT_SECRET = process.env.SESSION_SECRET;

const isProduction = process.env.NODE_ENV === "production";
const cookieSameSite: "strict" | "lax" = isProduction ? "strict" : "lax";

// Rate-limiters: relaxed outside of production so local dev / e2e test runs
// don't exhaust the 5-per-hour register cap. Set E2E_BYPASS_RATE_LIMITS=true
// in addition for completely unbounded limits.
const E2E_BYPASS_RATE_LIMITS =
  process.env.NODE_ENV !== "production" || process.env.E2E_BYPASS_RATE_LIMITS === "true";

const loginLimiter = new RateLimiterMemory({
  points: E2E_BYPASS_RATE_LIMITS ? 100_000 : 10,
  duration: 15 * 60,
  blockDuration: 15 * 60,
});

const registerLimiter = new RateLimiterMemory({
  points: E2E_BYPASS_RATE_LIMITS ? 100_000 : 5,
  duration: 60 * 60,
  blockDuration: 60 * 60,
});

const emailLimiter = new RateLimiterMemory({
  points: E2E_BYPASS_RATE_LIMITS ? 100_000 : 5,
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
    sameSite: cookieSameSite,
    maxAge: 15 * 60 * 1000,
  });
  
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: cookieSameSite,
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
  
  res.cookie("tokenId", tokenId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: cookieSameSite,
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
    sector: user.sector ?? null,
    region: user.region ?? null,
    mustCompleteOnboarding: user.mustCompleteOnboarding,
    isAdmin: user.role === "admin" || user.role === "master",
    emailNewsDigest: user.emailNewsDigest ?? true,
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
      
      // Send welcome email (don't await - fire and forget)
      sendWelcomeEmail(user.email, user.firstName || "").catch(err => {
        console.error("Failed to send welcome email:", err);
      });
      
      res.status(201).json({ user: formatUserResponse(user) });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registratie mislukt" });
    }
  });

  // POST /api/auth/register-after-payment
  // For users who paid via a Mollie Payment Link and now need to create an account.
  // Creates user + an active subscription record, then logs them in.
  // Accepts optional `plan` field: "basic" (default) or "pro".
  app.post("/api/auth/register-after-payment", async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    try {
      await registerLimiter.consume(ip);
    } catch {
      return res.status(429).json({
        error: "Te veel registratiepogingen. Probeer het over een uur opnieuw.",
      });
    }

    try {
      const schema = registerUserSchema.pick({ email: true, password: true }).extend({
        firstName: registerUserSchema.shape.firstName,
        lastName: registerUserSchema.shape.lastName,
        plan: z.enum(["basic", "pro"]).optional().default("basic"),
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const { email, password, firstName, lastName, plan } = validationResult.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Dit e-mailadres is al in gebruik. Heb je al een account? Log dan in." });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await storage.createUser({
        email,
        passwordHash,
        plan,
        firstName: firstName || null,
        lastName: lastName || null,
        mustCompleteOnboarding: true,
      });

      // Create an active subscription record for this user
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await storage.createSubscription({
        userId: user.id,
        plan,
        status: "active",
        currentPeriodEnd: nextMonth,
      });

      const tokenId = generateTokenId();
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken();

      await storeRefreshToken(user.id, refreshToken, tokenId);
      setTokenCookies(res, accessToken, refreshToken, tokenId);

      sendWelcomeEmail(user.email, user.firstName || "").catch((err) => {
        console.error("Failed to send welcome email:", err);
      });

      console.log(`✓ Post-payment registration: ${user.id} (${email}) - ${plan} plan`);

      res.status(201).json({ user: formatUserResponse(user) });
    } catch (error) {
      console.error("Post-payment registration error:", error);
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
      
      if (user.mustCompleteOnboarding) {
        await storage.upsertUser({
          id: user.id,
          email: user.email,
          mustCompleteOnboarding: false,
          plan: user.plan as "basic" | "pro",
          role: user.role as "member" | "master" | "admin",
        });
        await storage.deleteOnboardingTokensByUserId(user.id);
        console.log(`[Auth] Auto-cleared onboarding for user ${user.email} (successful password login)`);
      }
      
      // Één sessie per gebruiker: alle bestaande sessies intrekken bij nieuw inloggen
      await revokeAllUserTokens(user.id);

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

  // Password reset - request reset link
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      await emailLimiter.consume(req.ip || "unknown");
    } catch {
      return res.status(429).json({ error: "Te veel verzoeken. Probeer later opnieuw." });
    }

    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is verplicht" });
    }

    try {
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "Als dit emailadres bij ons bekend is, ontvang je een herstelmail." });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store token in database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      // Send email
      await sendPasswordResetEmail(user.email, resetToken, user.firstName || "");

      res.json({ message: "Als dit emailadres bij ons bekend is, ontvang je een herstelmail." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Er is een fout opgetreden" });
    }
  });

  // Password reset - verify token and reset password
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: "Token en nieuw wachtwoord zijn verplicht" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Wachtwoord moet minimaal 6 tekens zijn" });
    }

    try {
      const tokenHash = hashToken(token);
      
      // Find valid token
      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.tokenHash, tokenHash),
            isNull(passwordResetTokens.usedAt)
          )
        )
        .limit(1);

      if (!resetToken) {
        return res.status(400).json({ error: "Ongeldige of verlopen herstellink" });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ error: "Herstellink is verlopen" });
      }

      // Update user password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await storage.updateUserPassword(resetToken.userId, passwordHash);

      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, resetToken.id));

      // Revoke all existing sessions for security
      await revokeAllUserTokens(resetToken.userId);

      res.json({ message: "Wachtwoord is gewijzigd. Je kunt nu inloggen." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Er is een fout opgetreden" });
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
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    businessName: user.businessName,
    bio: user.bio,
    category: user.category,
    sector: user.sector ?? null,
    region: user.region ?? null,
    mustCompleteOnboarding: user.mustCompleteOnboarding,
    isAdmin: user.role === "admin" || user.role === "master",
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Authenticatie vereist" });
  }
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Alleen admin heeft toegang" });
  }
  next();
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
