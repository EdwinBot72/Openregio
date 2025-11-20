import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

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
