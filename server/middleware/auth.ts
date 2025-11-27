import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Admin email - only this account has admin access
const ADMIN_EMAIL = "edwin@stroombox.nl";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        plan: string;
        firstName: string | null;
        lastName: string | null;
        businessName: string | null;
        bio: string | null;
        category: string | null;
        mustCompleteOnboarding: boolean;
        isAdmin: boolean;
      };
    }
  }
}

/**
 * Middleware to attach user to request if logged in
 * Does NOT require auth - just attaches user if session exists
 * Uses storage abstraction to support both MemStorage and DbStorage
 */
export async function attachUser(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    try {
      const user = await storage.getUserById(req.session.userId);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          plan: user.plan || 'basic',
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          bio: user.bio,
          category: user.category,
          mustCompleteOnboarding: user.mustCompleteOnboarding,
          isAdmin: user.email === ADMIN_EMAIL,
        };
      } else {
        // User not found, clear session
        req.session.userId = undefined;
      }
    } catch (error) {
      console.error('Error attaching user:', error);
      req.session.userId = undefined;
    }
  }

  // Make user available in all templates
  res.locals.user = req.user || null;
  next();
}

/**
 * Middleware to require authentication
 * Redirects to /login if not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  if (!req.user) {
    // Session exists but user not attached (race condition)
    return res.redirect('/login');
  }

  next();
}

/**
 * Middleware to redirect authenticated users away from auth pages
 */
export function redirectIfAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId && req.user) {
    return res.redirect('/dashboard');
  }
  next();
}

/**
 * Middleware to ensure user has completed onboarding
 * Redirects to /first-login if mustCompleteOnboarding is true
 * Should be used after requireAuth
 */
export function requireOnboardingDone(req: Request, res: Response, next: NextFunction) {
  // Skip check if already on first-login page or first-login API
  if (req.path.startsWith('/first-login')) {
    return next();
  }

  if (!req.user) {
    // User not authenticated
    return res.redirect('/login');
  }

  if (req.user.mustCompleteOnboarding) {
    // User needs to complete onboarding
    return res.redirect('/first-login');
  }

  next();
}

/**
 * Middleware to require Pro plan
 * Returns 403 for API routes, redirects to /regiobot for page routes
 * Should be used after requireAuth
 */
export function requirePro(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    // User not authenticated
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: "Niet geautoriseerd" });
    }
    return res.redirect('/login');
  }

  if (req.user.plan !== 'pro') {
    // User doesn't have Pro plan
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({ 
        error: "Deze functie is alleen beschikbaar voor Pro-leden",
        upgrade: true 
      });
    }
    // For page routes, let the page handle the upgrade UI
    return next();
  }

  next();
}

/**
 * Middleware to require Admin access
 * Only the master admin account has access
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: "Niet geautoriseerd" });
    }
    return res.redirect('/login');
  }

  if (req.user.email !== ADMIN_EMAIL) {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({ error: "Alleen admin heeft toegang" });
    }
    return res.redirect('/dashboard');
  }

  next();
}
