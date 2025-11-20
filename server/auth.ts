import { Router } from 'express';
import bcrypt from 'bcrypt';
import { db } from 'db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { redirectIfAuth } from './middleware/auth';

const router = Router();

const SALT_ROUNDS = 10;

/**
 * GET /login - Login page
 */
router.get('/login', redirectIfAuth, (req, res) => {
  const error = req.query.error as string | undefined;
  res.render('login', { 
    title: 'Inloggen - OpenRegio',
    error: error ? decodeURIComponent(error) : null
  });
});

/**
 * POST /login - Handle login
 */
router.post('/login', redirectIfAuth, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.redirect('/login?error=' + encodeURIComponent('Email en wachtwoord zijn verplicht'));
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return res.redirect('/login?error=' + encodeURIComponent('Ongeldig emailadres of wachtwoord'));
    }

    if (!user.passwordHash) {
      return res.redirect('/login?error=' + encodeURIComponent('Dit account gebruikt een andere login methode'));
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.redirect('/login?error=' + encodeURIComponent('Ongeldig emailadres of wachtwoord'));
    }

    // Set session
    req.session.userId = user.id;

    // Redirect based on onboarding status
    if (user.mustCompleteOnboarding) {
      return res.redirect('/onboarding');
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login?error=' + encodeURIComponent('Er is een fout opgetreden'));
  }
});

/**
 * POST /logout - Handle logout
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

/**
 * GET /register - Registration page
 */
router.get('/register', redirectIfAuth, (req, res) => {
  const error = req.query.error as string | undefined;
  res.render('register', {
    title: 'Registreren - OpenRegio',
    error: error ? decodeURIComponent(error) : null
  });
});

/**
 * POST /register - Handle registration
 */
router.post('/register', redirectIfAuth, async (req, res) => {
  try {
    const { email, password, plan } = req.body;

    if (!email || !password) {
      return res.redirect('/register?error=' + encodeURIComponent('Email en wachtwoord zijn verplicht'));
    }

    if (password.length < 6) {
      return res.redirect('/register?error=' + encodeURIComponent('Wachtwoord moet minimaal 6 tekens zijn'));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return res.redirect('/register?error=' + encodeURIComponent('Er bestaat al een account met dit emailadres'));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        plan: (plan === 'basic' || plan === 'pro') ? plan : 'basic',
        mustCompleteOnboarding: true,
      })
      .returning();

    // Set session
    req.session.userId = newUser.id;

    // Redirect to onboarding
    res.redirect('/onboarding');
  } catch (error) {
    console.error('Registration error:', error);
    res.redirect('/register?error=' + encodeURIComponent('Er is een fout opgetreden'));
  }
});

export default router;
