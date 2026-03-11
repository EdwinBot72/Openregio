import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders } from "./middleware/security";
import { runMigrations } from "./db-migrate";

// Use Replit-managed OpenAI key if the direct secret is not set
if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
}
if (!process.env.OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
  process.env.OPENAI_BASE_URL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
}

const app = express();

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

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
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
  // these are just safety checks and won't block serving requests
  runMigrations().catch((err) => {
    console.error("[Startup] Migration warning (non-fatal):", (err as Error).message);
  });
})();
