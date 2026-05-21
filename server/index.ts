import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders } from "./middleware/security";
import { runMigrations } from "./db-migrate";
import { RateLimiterMemory } from "rate-limiter-flexible";

// ─── Early environment validation ─────────────────────────────────────────────
// Fail fast with a clear message if critical variables are missing.
const REQUIRED_ENV: string[] = ["DATABASE_URL", "SESSION_SECRET"];
const missingVars = REQUIRED_ENV.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(
    `[Startup] FATAL: Missing required environment variables: ${missingVars.join(", ")}\n` +
    `Set these in the Secrets tab and restart the server.`
  );
  process.exit(1);
}

// Optional variables: warn but continue
const OPTIONAL_ENV: string[] = ["MOLLIE_API_KEY", "POSTMARK_API_KEY", "PUBLIC_BASE_URL"];
OPTIONAL_ENV.forEach((v) => {
  if (!process.env[v]) {
    console.warn(`[Startup] Optional env var not set: ${v} (some features will be disabled)`);
  }
});
// ──────────────────────────────────────────────────────────────────────────────

// Use Replit-managed OpenAI key if the direct secret is not set
if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
}
if (!process.env.OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
  process.env.OPENAI_BASE_URL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
}

const app = express();

// ─── Globale anti-DDoS rate limiter ───────────────────────────────────────────
// Max 120 API-verzoeken per minuut per IP (2 per seconde gemiddeld).
// Auth-endpoints hebben hun eigen strengere limieten bovenop deze globale limiet.
const globalApiLimiter = new RateLimiterMemory({
  points: 120,
  duration: 60,
  blockDuration: 60,
});

app.use("/api", async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  try {
    await globalApiLimiter.consume(ip);
    next();
  } catch {
    res.status(429).json({
      error: "Te veel verzoeken. Probeer het over een minuut opnieuw.",
      code: 429,
    });
  }
});
// ──────────────────────────────────────────────────────────────────────────────

// Security headers middleware (privacy-first, geen trackers)
app.use(securityHeaders);

// Cookie parser for JWT tokens
app.use(cookieParser());

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Start de dagelijkse Intel-cron
  const { startIntelCron } = await import("./services/intelCron");
  startIntelCron();

  // Start de wekelijkse Thema-refresh cron (alleen schedule, geen DB-aanroep)
  const { startThemaRefreshCron, runThemaRefreshIfEmpty } = await import("./services/themaRefresh");
  startThemaRefreshCron();

  // Start de dagelijkse opschoning van verlopen lokale acties
  const { startLokaleActiesCron } = await import("./services/lokaleActiesCron");
  startLokaleActiesCron();

  // Global error handler with structured logging
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const isServerError = status >= 500;

    const errorLog = {
      level: isServerError ? 'error' : 'warn',
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status,
      message,
      stack: isServerError ? err.stack : undefined,
      userId: (req as any).userId || 'anonymous',
    };

    if (isServerError) {
      console.error('[ERROR]', JSON.stringify(errorLog));
    } else {
      console.warn('[WARN]', JSON.stringify(errorLog));
    }

    res.status(status).json({ 
      error: isServerError ? "Er is een fout opgetreden" : message,
      code: status,
    });
  });

  // Determine serving mode:
  // - Running via `tsx server/index.ts` (dev): import.meta.dirname = "…/server"
  //   → "…/server/public" does NOT exist → use Vite dev middleware
  // - Running via `node dist/index.js` (prod): import.meta.dirname = "…/dist"
  //   → "…/dist/public" EXISTS after build → use static file serving
  // This is intentionally independent of NODE_ENV so that the built server
  // always serves the pre-built frontend, even without NODE_ENV=production set.
  const builtPublicPath = path.resolve(import.meta.dirname, "public");
  const isBuiltServer = fs.existsSync(builtPublicPath);

  if (isBuiltServer) {
    log(`[Startup] Production mode — serving built frontend from ${builtPublicPath}`);
    serveStatic(app);
  } else {
    log(`[Startup] Development mode — starting Vite dev server`);
    await setupVite(app, server);
  }

  // Start listening FIRST so healthchecks pass immediately
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Run migrations in the background — schema already exists in production,
  // these are just safety checks and won't block serving requests.
  // After migrations complete, trigger the thema startup-check (DB table must exist first).
  runMigrations()
    .then(() => runThemaRefreshIfEmpty())
    .catch((err) => {
      console.error("[Startup] Migration warning (non-fatal):", (err as Error).message);
      // Still attempt startup refresh — table may already exist from previous run
      runThemaRefreshIfEmpty().catch(() => {});
    });
})();
