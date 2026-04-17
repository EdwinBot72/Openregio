import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

// ─── AI ENDPOINT RATE LIMITERS ────────────────────────────────────────────────
// Beschermt AI-endpoints tegen misbruik en onbedoelde kosten.

/**
 * Rate limiter voor publieke AI-endpoints (geen auth vereist).
 * Bijv: /api/woo/generate, /api/regiobot/buurman, /api/regelgeving/check
 * Limiet: 10 verzoeken per IP per 10 minuten.
 */
export const publicAiLimiter = new RateLimiterMemory({
  points: 10,
  duration: 10 * 60,
  blockDuration: 10 * 60,
});

/**
 * Rate limiter voor geauthenticeerde AI-endpoints.
 * Bijv: /api/brief-analyse, /api/rag/ask
 * Limiet: 30 verzoeken per gebruiker per uur.
 */
export const authenticatedAiLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60 * 60,
  blockDuration: 15 * 60,
});

/**
 * Middleware: limiteert publieke AI-endpoints op IP.
 * Gebruik: app.post("/api/woo/generate", publicAiRateLimit, ...)
 */
export async function publicAiRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  try {
    await publicAiLimiter.consume(ip);
    next();
  } catch {
    res.status(429).json({
      error: "Te veel verzoeken. Probeer het over 10 minuten opnieuw.",
    });
  }
}

/**
 * Middleware: limiteert geauthenticeerde AI-endpoints op gebruikers-ID.
 * Gebruik: app.post("/api/brief-analyse", requireAuth, authenticatedAiRateLimit, ...)
 */
export async function authenticatedAiRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.id || req.ip || "unknown";
  try {
    await authenticatedAiLimiter.consume(userId);
    next();
  } catch {
    res.status(429).json({
      error: "Je hebt het maximale aantal AI-verzoeken bereikt. Probeer het over 15 minuten opnieuw.",
    });
  }
}
