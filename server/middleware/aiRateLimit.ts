import type { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const publicAiLimiter = new RateLimiterMemory({
  points: 10,
  duration: 600,
  blockDuration: 600,
});

const authenticatedAiLimiter = new RateLimiterMemory({
  points: 30,
  duration: 3600,
  blockDuration: 3600,
});

export async function publicAiRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  try {
    await publicAiLimiter.consume(ip);
    next();
  } catch {
    res.status(429).json({
      error:
        "Te veel AI-verzoeken vanaf dit IP-adres. Probeer het over enkele minuten opnieuw.",
      code: 429,
    });
  }
}

export async function authenticatedAiRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = (req as any).user?.id;
  const key = userId
    ? `user:${userId}`
    : `ip:${req.ip || req.socket?.remoteAddress || "unknown"}`;
  try {
    await authenticatedAiLimiter.consume(key);
    next();
  } catch {
    res.status(429).json({
      error:
        "Je hebt het AI-uurlimiet bereikt. Probeer het later opnieuw.",
      code: 429,
    });
  }
}
