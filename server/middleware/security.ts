import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Security headers middleware voor OpenRegio
 * Implementeert AVG/GDPR-vriendelijke beveiligingsmaatregelen
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // HTTPS enforcement (alleen in productie)
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy - strenger in productie
  // In development: unsafe-inline/eval nodig voor Vite HMR
  // In productie: alleen 'self' met noodzakelijke uitzonderingen
  const scriptSrc = isProduction 
    ? "script-src 'self'" 
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  
  const styleSrc = isProduction
    ? "style-src 'self' 'unsafe-inline'" // unsafe-inline nodig voor inline styles van UI libs
    : "style-src 'self' 'unsafe-inline'";
  
  const connectSrc = isProduction
    ? "connect-src 'self'"
    : "connect-src 'self' ws: wss:"; // WebSocket voor Vite HMR
  
  const cspDirectives = [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "img-src 'self' data: blob:",
    "font-src 'self'", // Alleen lokale fonts
    connectSrc,
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://js.mollie.com", // YouTube embeds + Mollie
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests" // Upgrade HTTP naar HTTPS
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspDirectives);
  
  // Voorkom dat de site in een iframe geladen wordt (clickjacking preventie)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Voorkom MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Minimale referrer info naar externe sites
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // XSS filter (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Geen cache voor API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Voorkom dat browsers automatisch content-type raden
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  next();
}

/**
 * Middleware om gevoelige informatie uit error responses te filteren
 */
export function sanitizeErrors(err: any, req: Request, res: Response, next: NextFunction) {
  const isDev = process.env.NODE_ENV !== 'production';
  
  const status = err.status || err.statusCode || 500;
  
  // In productie: geen stack traces of interne details
  const message = isDev 
    ? err.message 
    : (status >= 500 ? 'Er is een fout opgetreden' : err.message);
  
  res.status(status).json({ 
    error: message,
    ...(isDev && { stack: err.stack })
  });
}
