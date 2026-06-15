import type { Express, Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        plan: string | null;
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
  points: E2E_BYPASS_RATE_LIMITS ? 100_000 : 15,
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
    emailLokaleActiesDigest: user.emailLokaleActiesDigest ?? true,
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
      
      // plan intentionally niet overgenomen uit het verzoek — altijd "pending" tot betaling
      const { email, password, firstName, lastName } = validationResult.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email is al in gebruik" });
      }
      
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      
      const user = await storage.createUser({
        email,
        passwordHash,
        plan: "pending", // plan blijft pending totdat Mollie webhook bevestigt
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

  // /api/auth/register-after-payment is verwijderd:
  // Betaling + account-aanmaak loopt uitsluitend via de Mollie webhook
  // (server/routes.ts). Een publiek endpoint dat plan en subscription aanmaakt
  // zonder betaalverificatie is een privilege-escalatie-lek.

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
          plan: user.plan as "pending" | "basic" | "pro" | "coaching",
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
  
  // POST /api/auth/change-password — ingelogde gebruiker wijzigt eigen wachtwoord
  app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Huidig en nieuw wachtwoord zijn verplicht" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Nieuw wachtwoord moet minimaal 8 tekens bevatten" });
      }

      const user = await storage.getUserById((req as any).user.userId);
      if (!user || !user.passwordHash) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ error: "Huidig wachtwoord klopt niet" });
      }

      const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await storage.updateUserPassword(user.id, newHash);

      res.json({ message: "Wachtwoord succesvol gewijzigd" });
    } catch (error) {
      console.error("Change password error:", error);
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
    plan: user.plan ?? null,
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

// ─── Shared auth helpers ────────────────────────────────────────────────────

/** Extract and verify JWT; throws on failure. */
function verifyToken(req: Request): { userId: string; email: string } {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    const err = Object.assign(new Error("Authenticatie vereist"), { status: 401, code: "NO_TOKEN" });
    throw err;
  }
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (e) {
    const isExpired = (e as jwt.JsonWebTokenError).name === "TokenExpiredError";
    const err = Object.assign(
      new Error(isExpired ? "Token verlopen" : "Ongeldige token"),
      { status: 401, code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN" }
    );
    throw err;
  }
}

/** Load user from DB; 401 if not found, 403 if soft-deleted. */
async function loadUser(userId: string): Promise<User> {
  const user = await storage.getUserById(userId);
  if (!user) {
    throw Object.assign(new Error("Gebruiker niet gevonden"), { status: 401 });
  }
  if (user.deletedAt) {
    throw Object.assign(new Error("Account is verwijderd"), { status: 403 });
  }
  return user;
}

/** Handle auth errors thrown by helpers above. */
function handleAuthError(err: unknown, res: Response) {
  const e = err as { status?: number; code?: string; message?: string };
  res.status(e.status ?? 401).json({
    error: e.message ?? "Authenticatie mislukt",
    ...(e.code ? { code: e.code } : {}),
  });
}

// ─── Middleware ──────────────────────────────────────────────────────────────

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const decoded = verifyToken(req);
    const user = await loadUser(decoded.userId);
    req.user = toAuthUser(user);
    next();
  } catch (err) {
    handleAuthError(err, res);
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const decoded = verifyToken(req);
    const user = await loadUser(decoded.userId);
    if (user.role !== "admin" && user.role !== "master") {
      return res.status(403).json({ error: "Alleen admin heeft toegang" });
    }
    req.user = toAuthUser(user);
    next();
  } catch (err) {
    handleAuthError(err, res);
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
  try {
    const decoded = verifyToken(req);
    const user = await loadUser(decoded.userId);

    // Admins/masters: altijd toegang
    if (user.role === "admin" || user.role === "master") {
      req.user = toAuthUser(user);
      return next();
    }

    // Check uitsluitend de subscriptions-tabel — niet user.plan
    const subscription = await storage.getActiveSubscription(user.id);
    if (
      !subscription ||
      subscription.status !== "active" ||
      (subscription.plan !== "pro" && subscription.plan !== "coaching")
    ) {
      return res.status(403).json({
        error: "Geen actief Pro-abonnement gevonden. Activeer je Pro-lidmaatschap om toegang te krijgen.",
        upgradeUrl: "/lidmaatschap",
      });
    }

    req.user = toAuthUser(user);
    next();
  } catch (err) {
    handleAuthError(err, res);
  }
}

export async function requireBasic(req: Request, res: Response, next: NextFunction) {
  try {
    const decoded = verifyToken(req);
    const user = await loadUser(decoded.userId);

    // Admins/masters: altijd toegang
    if (user.role === "admin" || user.role === "master") {
      req.user = toAuthUser(user);
      return next();
    }

    // Check uitsluitend de subscriptions-tabel — niet user.plan
    const subscription = await storage.getActiveSubscription(user.id);
    if (
      !subscription ||
      subscription.status !== "active" ||
      !["basic", "pro", "coaching"].includes(subscription.plan)
    ) {
      return res.status(403).json({
        error: "Geen actief abonnement gevonden. Activeer je lidmaatschap om toegang te krijgen.",
        upgradeUrl: "/lidmaatschap",
      });
    }

    req.user = toAuthUser(user);
    next();
  } catch (err) {
    handleAuthError(err, res);
  }
}

export async function requireCoaching(req: Request, res: Response, next: NextFunction) {
  try {
    const decoded = verifyToken(req);
    const user = await loadUser(decoded.userId);

    // Admins/masters: altijd toegang
    if (user.role === "admin" || user.role === "master") {
      req.user = toAuthUser(user);
      return next();
    }

    // Check uitsluitend de subscriptions-tabel — niet user.plan
    const subscription = await storage.getActiveSubscription(user.id);
    if (
      !subscription ||
      subscription.status !== "active" ||
      subscription.plan !== "coaching"
    ) {
      return res.status(403).json({
        error: "Coaching-abonnement vereist",
        upgradeUrl: "/lidmaatschap",
      });
    }

    req.user = toAuthUser(user);
    next();
  } catch (err) {
    handleAuthError(err, res);
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
