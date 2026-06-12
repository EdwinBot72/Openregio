import type { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const isE2E =
  process.env.NODE_ENV !== "production" ||
  process.env.E2E_BYPASS_RATE_LIMITS === "true";

// ── Mollie /start — voorkomt misbruik van betaalcreatie (Mollie-kosten / brute-force)
const mollieStartLimiter = new RateLimiterMemory({
  points: isE2E ? 100_000 : 5,
  duration: 600,       // 10 minuten
  blockDuration: 600,
});

export async function mollieStartRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  try {
    await mollieStartLimiter.consume(ip);
    next();
  } catch {
    res.status(429).json({
      error: "Te veel betalingspogingen. Probeer het over 10 minuten opnieuw.",
    });
  }
}

// ── Contact / aanmeldformulier — voorkomt spam-leads
const contactFormLimiter = new RateLimiterMemory({
  points: isE2E ? 100_000 : 5,
  duration: 300,       // 5 minuten
  blockDuration: 300,
});

export async function contactFormRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  try {
    await contactFormLimiter.consume(ip);
    next();
  } catch {
    res.status(429).json({
      error: "Te veel verzoeken. Probeer het over 5 minuten opnieuw.",
    });
  }
}
