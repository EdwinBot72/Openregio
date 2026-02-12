import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEntrepreneurSchema, strictEntrepreneurSchema, insertProposalSchema, insertVoteSchema, insertChatRoomSchema, insertChatMessageSchema, insertPostSchema, insertUserProfileSchema, insertSubscriptionSchema, insertBedrijfsprofielSchema, regioBotChatSchema, visibilitySettingsSchema, DEFAULT_VISIBILITY_SETTINGS, insertCrewProfileSchema, insertCrewRequestSchema, insertCrewApplicationSchema, CREW_CATEGORIES, users, ragDocuments, documents } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { createMollieClient } from "@mollie/api-client";
import { setupJwtAuth, attachUser, requireAuth, requirePro, issueTokensForUser, clearTokenCookies, revokeAllUserTokens } from "./jwtAuth";
import { requireAdmin } from "./middleware/auth";
import { seedMasterAccount } from "./seed";
import { generateRandomPassword, generateOnboardingToken, getPlanPrice, getPlanDisplayName, generateReferralCode } from "./utils/auth";
import { sendOnboardingEmail } from "./services/emailService";
import bcrypt from "bcrypt";
import { upload, uploadMemory, getDocumentType } from "./middleware/upload";
import { runRegioBot } from "./regiobot";
import { db } from "db";
import { eq, sql, gte, and, count } from "drizzle-orm";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import type { Request, Response, NextFunction } from "express";

const DAILY_UPLOAD_LIMIT_BASIC = 1;

async function checkDailyUploadLimit(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user?.id) return res.status(401).json({ error: "Niet ingelogd" });

  if (user.plan === "pro") return next();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [ragCount] = await db
    .select({ total: count() })
    .from(ragDocuments)
    .where(and(
      eq(ragDocuments.userId, user.id),
      gte(ragDocuments.createdAt, todayStart)
    ));

  const [docCount] = await db
    .select({ total: count() })
    .from(documents)
    .where(and(
      eq(documents.userId, user.id),
      gte(documents.createdAt, todayStart)
    ));

  const totalUploads = (ragCount?.total ?? 0) + (docCount?.total ?? 0);

  if (totalUploads >= DAILY_UPLOAD_LIMIT_BASIC) {
    return res.status(429).json({
      error: "Daglimiet bereikt",
      message: `Als basis-lid kun je ${DAILY_UPLOAD_LIMIT_BASIC} document per dag uploaden. Upgrade naar Pro voor onbeperkt uploaden.`,
      limit: DAILY_UPLOAD_LIMIT_BASIC,
      used: totalUploads,
    });
  }

  next();
}

// Initialize Mollie client (requires MOLLIE_API_KEY environment variable)
const mollieClient = process.env.MOLLIE_API_KEY 
  ? createMollieClient({ apiKey: process.env.MOLLIE_API_KEY }) 
  : null;

// Helper to get base URL for redirects/webhooks
function getBaseUrl(req: any): string {
  const host = req.get('host') || 'localhost:5000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

// Helper to get or create user profile ID from JWT user
async function getOrCreateUserProfileId(req: any): Promise<string> {
  const user = req.user;
  if (!user?.id || !user?.email) throw new Error("No auth user in request");

  // Probeer bestaande profile via email
  let profile = await storage.getUserProfileByEmail(user.email);

  // Zo niet: maak 'm aan (minimaal)
  if (!profile) {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.email.split("@")[0];

    profile = await storage.createUserProfile({
      replitUserId: user.id,
      email: user.email,
      name,
      painPoints: [],
      onboardingCompleted: false,
    });
  }

  return profile.id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (before auth middleware)
  app.get("/health", (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  // Initialize JWT auth with rate limiting (production-ready, stateless)
  setupJwtAuth(app);
  
  // Seed master account (idempotent - only creates if doesn't exist)
  await seedMasterAccount();
  
  // Attach user to all requests (makes req.user available)
  app.use(attachUser);
  
  // Register object storage routes for user file uploads
  registerObjectStorageRoutes(app, requireAuth);
  
  // BLOK 2: Mollie Payment Flow (Basic €12,95 / Pro €24,00)
  
  // POST /start - Create Mollie payment for plan subscription
  app.post("/start", async (req, res) => {
    try {
      const { email, plan, ref } = req.body;
      
      // Validate input
      if (!email || !plan) {
        return res.status(400).json({ error: "Email en plan zijn verplicht" });
      }
      
      if (!["basic", "pro"].includes(plan)) {
        return res.status(400).json({ error: "Plan moet 'basic' of 'pro' zijn" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Ongeldig e-mailadres" });
      }
      
      if (!mollieClient) {
        console.error("Mollie API key niet geconfigureerd");
        return res.status(500).json({ error: "Betalingssysteem niet beschikbaar" });
      }
      
      // If referral code provided, validate it exists
      let referrerUserId: string | null = null;
      if (ref) {
        const referrer = await storage.getUserByReferralCode(ref);
        if (referrer) {
          referrerUserId = referrer.id;
          console.log(`✓ Valid referral code ${ref} from user ${referrer.id}`);
        } else {
          console.log(`⚠ Invalid referral code ${ref} - ignoring`);
        }
      }
      
      const baseUrl = getBaseUrl(req);
      const webhookBaseUrl = process.env.PUBLIC_BASE_URL || baseUrl;
      const amount = getPlanPrice(plan);
      const description = `${getPlanDisplayName(plan)} - Maandelijks abonnement`;
      
      // Create Mollie customer first (needed for recurring payments)
      const customer = await mollieClient.customers.create({
        name: email.split("@")[0],
        email: email,
      });
      
      console.log(`✓ Mollie customer created: ${customer.id} for ${email}`);
      
      const payment = await mollieClient.payments.create({
        amount: {
          value: amount,
          currency: "EUR"
        },
        customerId: customer.id,
        description,
        redirectUrl: `${baseUrl}/betaling-geslaagd?email=${encodeURIComponent(email)}`,
        webhookUrl: `${webhookBaseUrl}/api/mollie/webhook`,
        metadata: {
          email,
          plan,
          source: "openregio-signup",
          mollieCustomerId: customer.id,
          referrerUserId: referrerUserId || undefined,
          referralCode: ref || undefined
        }
      });
      
      console.log(`✓ Mollie payment created: ${payment.id} for ${email} (${plan})`);
      
      // Redirect to Mollie checkout
      const checkoutUrl = payment.getCheckoutUrl();
      if (!checkoutUrl) {
        return res.status(500).json({ error: "Kon checkout URL niet genereren" });
      }
      
      res.json({ checkoutUrl });
    } catch (error: any) {
      console.error("Fout bij aanmaken Mollie payment:", error);
      const userMessage = error?.statusCode === 422 
        ? "Geen geschikte betaalmethoden beschikbaar. Neem contact op met info@openregio.nl."
        : "Kon betaling niet aanmaken. Probeer het later opnieuw.";
      res.status(500).json({ error: userMessage });
    }
  });
  
  // POST /api/mollie/webhook - Handle Mollie payment status updates
  app.post("/api/mollie/webhook", async (req, res) => {
    try {
      const baseUrl = process.env.PUBLIC_BASE_URL || getBaseUrl(req);
      const paymentId = req.body.id;
      
      if (!paymentId) {
        console.error("Webhook ontvangen zonder payment ID");
        return res.status(400).send("Missing payment ID");
      }
      
      if (!mollieClient) {
        console.error("Mollie API key niet geconfigureerd");
        return res.status(500).send("Mollie client not configured");
      }
      
      // Fetch payment details from Mollie
      const payment = await mollieClient.payments.get(paymentId);
      
      console.log(`Webhook ontvangen voor payment ${paymentId}: status=${payment.status}`);
      
      // Only process paid payments
      if (payment.status === "paid") {
        const { email, plan, referrerUserId, mollieCustomerId } = payment.metadata as { 
          email: string; 
          plan: string; 
          referrerUserId?: string;
          mollieCustomerId?: string;
        };
        
        if (!email || !plan) {
          console.error("Payment metadata incomplete:", payment.metadata);
          return res.status(200).send("OK");
        }
        
        console.log(`✓ Payment PAID for ${email} (${plan})`);
        
        // Idempotency check: skip if this payment was already processed
        const existingSub = await storage.getSubscriptionByMolliePaymentId(paymentId);
        if (existingSub) {
          console.log(`⚠ Payment ${paymentId} already processed (subscription ${existingSub.id}) - skipping`);
          return res.status(200).send("OK");
        }
        
        // Check if user already exists
        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          const tempPassword = generateRandomPassword();
          const onboardingToken = generateOnboardingToken();
          const referralCode = generateReferralCode();
          const passwordHash = await bcrypt.hash(tempPassword, 10);
          
          user = await storage.createUser({
            email,
            passwordHash,
            plan: plan as "basic" | "pro",
            role: "member",
            mustCompleteOnboarding: true,
            onboardingToken,
            referralCode,
            referredByUserId: referrerUserId || null,
            referredAt: referrerUserId ? new Date() : null,
          });
          
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          
          await storage.createOnboardingToken({
            userId: user.id,
            token: onboardingToken,
            expiresAt,
          });
          
          console.log(`✓ User created: ${user.id} (${email})`);
          const onboardingLink = `${baseUrl}/first-login?token=${onboardingToken}`;
          console.log(`  Onboarding link: ${onboardingLink}`);
          
          const emailSent = await sendOnboardingEmail(email, tempPassword, onboardingLink, plan);
          if (emailSent) {
            console.log(`✓ Onboarding email sent to ${email}`);
          } else {
            console.error(`✗ Failed to send onboarding email to ${email}`);
          }
          
        } else {
          console.log(`✓ User already exists: ${user.id} (${email})`);
          
          if (user.plan !== plan) {
            await storage.updateUserPlan(user.id, plan as "basic" | "pro");
            console.log(`  Updated plan: ${user.plan} → ${plan}`);
          }
        }
        
        // Create subscription record with Mollie customer ID for recurring billing
        const subscription = await storage.createSubscription({
          userId: user.id,
          molliePaymentId: payment.id,
          mollieCustomerId: mollieCustomerId || null,
          plan: plan as "basic" | "pro",
          status: "active",
        });
        
        console.log(`✓ Subscription created: ${subscription.id}`);
        
        if (mollieCustomerId && mollieClient) {
          try {
            const mandatesPage: any = await mollieClient.customerMandates.page({ customerId: mollieCustomerId });
            const mandatesList = mandatesPage?.length ? Array.from(mandatesPage) : [];
            const hasValidMandate = mandatesList.length > 0 && mandatesList.some((m: any) => m.status === "valid" || m.status === "pending");
            
            if (hasValidMandate) {
              const mollieSubscription = await mollieClient.customerSubscriptions.create({
                customerId: mollieCustomerId,
                amount: {
                  currency: "EUR",
                  value: getPlanPrice(plan)
                },
                interval: "1 month",
                description: `${getPlanDisplayName(plan)} - Maandelijks abonnement`,
                webhookUrl: `${baseUrl}/api/mollie/webhook`
              });
              
              const nextMonth = new Date();
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              
              await storage.updateSubscription(subscription.id, {
                mollieSubscriptionId: mollieSubscription.id,
                currentPeriodEnd: nextMonth
              });
              
              console.log(`✓ Mollie recurring subscription created: ${mollieSubscription.id} (maandelijks €${getPlanPrice(plan)})`);
            } else {
              console.log(`ℹ No valid mandate found for customer ${mollieCustomerId} - recurring subscription will need to be set up separately`);
              
              const nextMonth = new Date();
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              await storage.updateSubscription(subscription.id, {
                currentPeriodEnd: nextMonth
              });
            }
          } catch (subError: any) {
            console.error(`⚠ Failed to create Mollie recurring subscription:`, subError);
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            await storage.updateSubscription(subscription.id, {
              currentPeriodEnd: nextMonth
            });
          }
        }
        
        // Create commission for referrer if applicable
        if (referrerUserId) {
          const commissionAmount = plan === "pro" ? 4.00 : 2.95;
          
          try {
            const commission = await storage.createCommission({
              affiliateUserId: referrerUserId,
              referredUserId: user.id,
              subscriptionId: subscription.id,
              molliePaymentId: payment.id,
              plan: plan as "basic" | "pro",
              amount: commissionAmount,
              status: "pending",
            });
            
            console.log(`✓ Commission created: ${commission.id} (€${commissionAmount.toFixed(2)} for ${referrerUserId})`);
          } catch (commissionError: any) {
            console.error(`⚠ Failed to create commission:`, commissionError);
          }
        }
      }
      
      // Always return 200 OK to acknowledge webhook
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Fout in Mollie webhook:", error);
      // Still return 200 to prevent Mollie from retrying
      res.status(200).send("OK");
    }
  });

  // GET /first-login - Onboarding flow: validate token and show form
  app.get("/api/first-login/validate", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Token is verplicht" });
      }

      // Get onboarding token from database
      const onboardingToken = await storage.getOnboardingTokenByToken(token);
      
      if (!onboardingToken) {
        return res.status(404).json({ error: "Onboarding link is ongeldig" });
      }

      // Check if token is expired
      if (new Date() > new Date(onboardingToken.expiresAt)) {
        return res.status(410).json({ error: "Onboarding link is verlopen" });
      }

      // Get user
      const user = await storage.getUserById(onboardingToken.userId);
      
      if (!user) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }

      // Return user info (excluding sensitive data)
      res.json({
        valid: true,
        user: {
          email: user.email,
          plan: user.plan,
        },
      });
    } catch (error) {
      console.error("Error validating onboarding token:", error);
      res.status(500).json({ error: "Fout bij valideren onboarding link" });
    }
  });

  // POST /first-login - Complete onboarding
  app.post("/api/first-login", async (req, res) => {
    try {
      const { token, password, businessName, bio, category } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Token is verplicht" });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Wachtwoord moet minimaal 6 tekens zijn" });
      }

      if (!businessName) {
        return res.status(400).json({ error: "Bedrijfsnaam is verplicht" });
      }

      // Get onboarding token
      const onboardingToken = await storage.getOnboardingTokenByToken(token);
      
      if (!onboardingToken) {
        return res.status(404).json({ error: "Onboarding link is ongeldig" });
      }

      // Check if token is expired
      if (new Date() > new Date(onboardingToken.expiresAt)) {
        return res.status(410).json({ error: "Onboarding link is verlopen" });
      }

      // Get user
      const user = await storage.getUserById(onboardingToken.userId);
      
      if (!user) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update user with new password and profile info
      const updatedUser = await storage.upsertUser({
        id: user.id,
        email: user.email,
        passwordHash,
        businessName,
        bio: bio || undefined,
        category: category || undefined,
        mustCompleteOnboarding: false,
        plan: user.plan as "basic" | "pro",
        role: user.role as "member" | "master" | "admin",
      });

      // Delete onboarding token
      await storage.deleteOnboardingToken(token);

      // Issue JWT tokens
      await issueTokensForUser(res, updatedUser as any);

      console.log(`✓ Onboarding completed for user: ${user.id} (${user.email})`);

      res.json({ 
        message: "Onboarding succesvol afgerond",
        user: {
          id: updatedUser!.id,
          email: updatedUser!.email,
          businessName: updatedUser!.businessName,
          plan: updatedUser!.plan,
        }
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ error: "Fout bij afronden onboarding" });
    }
  });
  
  // Entrepreneurs routes
  app.get("/api/entrepreneurs", async (req, res) => {
    try {
      const { search, category, lat, lng, radius } = req.query;
      
      // Parse and validate geo parameters
      const parsedLat = lat ? parseFloat(lat as string) : undefined;
      const parsedLng = lng ? parseFloat(lng as string) : undefined;
      const parsedRadius = radius ? parseFloat(radius as string) : undefined;
      
      // Validate that if one geo param is provided, all must be provided
      if ((parsedLat !== undefined || parsedLng !== undefined || parsedRadius !== undefined) &&
          (parsedLat === undefined || parsedLng === undefined || parsedRadius === undefined)) {
        return res.status(400).json({ 
          error: "Geo search requires all three parameters: lat, lng, and radius" 
        });
      }
      
      // Validate geo parameter values
      if (parsedLat !== undefined && parsedLng !== undefined && parsedRadius !== undefined) {
        if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng) || !Number.isFinite(parsedRadius)) {
          return res.status(400).json({ error: "Geo parameters must be valid numbers" });
        }
        if (parsedLat < -90 || parsedLat > 90) {
          return res.status(400).json({ error: "Latitude must be between -90 and 90" });
        }
        if (parsedLng < -180 || parsedLng > 180) {
          return res.status(400).json({ error: "Longitude must be between -180 and 180" });
        }
        if (parsedRadius <= 0 || parsedRadius > 100) {
          return res.status(400).json({ error: "Radius must be between 0 and 100 km" });
        }
      }
      
      const entrepreneurs = await storage.getEntrepreneurs(
        search as string | undefined,
        category as string | undefined,
        parsedLat,
        parsedLng,
        parsedRadius
      );
      res.json(entrepreneurs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entrepreneurs" });
    }
  });

  app.get("/api/entrepreneurs/:id", async (req, res) => {
    try {
      const entrepreneur = await storage.getEntrepreneur(req.params.id);
      if (!entrepreneur) {
        return res.status(404).json({ error: "Entrepreneur not found" });
      }
      res.json(entrepreneur);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entrepreneur" });
    }
  });

  app.post("/api/entrepreneurs", async (req, res) => {
    try {
      const validatedData = strictEntrepreneurSchema.parse(req.body);
      const entrepreneur = await storage.createEntrepreneur(validatedData);
      res.status(201).json(entrepreneur);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create entrepreneur" });
    }
  });

  app.put("/api/entrepreneurs/:id", async (req, res) => {
    try {
      const validatedData = insertEntrepreneurSchema.partial().parse(req.body);
      const entrepreneur = await storage.updateEntrepreneur(req.params.id, validatedData);
      if (!entrepreneur) {
        return res.status(404).json({ error: "Entrepreneur not found" });
      }
      res.json(entrepreneur);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update entrepreneur" });
    }
  });

  app.delete("/api/entrepreneurs/:id", async (req, res) => {
    try {
      const success = await storage.deleteEntrepreneur(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Entrepreneur not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete entrepreneur" });
    }
  });

  // Categories endpoint
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = [
        { value: "retail", label: "Retail & Winkels" },
        { value: "food", label: "Horeca & Catering" },
        { value: "services", label: "Zakelijke Diensten" },
        { value: "tech", label: "Technologie & ICT" },
        { value: "health", label: "Gezondheid & Welzijn" },
        { value: "education", label: "Onderwijs & Training" },
        { value: "creative", label: "Creatief & Media" },
        { value: "construction", label: "Bouw & Renovatie" },
        { value: "agriculture", label: "Landbouw & Tuinbouw" },
        { value: "transport", label: "Transport & Logistiek" },
      ];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Business Profile routes
  
  // Public endpoint for all business profiles (for map display)
  app.get("/api/business-profiles/public", async (req, res) => {
    try {
      const profielen = await storage.getAllBedrijfsprofielen();
      res.json(profielen);
    } catch (error) {
      console.error("Error fetching public business profiles:", error);
      res.status(500).json({ error: "Fout bij ophalen bedrijfsprofielen" });
    }
  });
  
  app.get("/api/business-profiles", attachUser, requireAuth, async (req, res) => {
    try {
      const profielen = await storage.getAllBedrijfsprofielen();
      res.json(profielen);
    } catch (error) {
      console.error("Error fetching business profiles:", error);
      res.status(500).json({ error: "Fout bij ophalen bedrijfsprofielen" });
    }
  });

  // Get region member stats for dashboard
  app.get("/api/region-stats/me", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Niet ingelogd" });
      }

      const profiel = await storage.getBedrijfsprofielByUserId(req.user.id);
      if (!profiel) {
        return res.json({ count: 0, latestMember: null, region: null });
      }

      const stats = await storage.getRegionMemberStats(profiel.regio);
      res.json({ ...stats, region: profiel.regio });
    } catch (error) {
      console.error("Error fetching region stats:", error);
      res.status(500).json({ error: "Fout bij ophalen regio statistieken" });
    }
  });

  // Get post stats for user's region
  app.get("/api/post-stats/me", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Niet ingelogd" });
      }

      const profiel = await storage.getBedrijfsprofielByUserId(req.user.id);
      if (!profiel) {
        return res.json({ openPosts: 0, userPosts: 0, region: null });
      }

      const stats = await storage.getRegionPostStats(profiel.regio, req.user.id);
      res.json({ ...stats, region: profiel.regio });
    } catch (error) {
      console.error("Error fetching post stats:", error);
      res.status(500).json({ error: "Fout bij ophalen post statistieken" });
    }
  });

  app.get("/api/business-profile/me", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Niet ingelogd" });
      }

      const profiel = await storage.getBedrijfsprofielByUserId(req.user.id);
      if (!profiel) {
        return res.status(404).json({ error: "Bedrijfsprofiel niet gevonden" });
      }

      res.json(profiel);
    } catch (error) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ error: "Fout bij ophalen bedrijfsprofiel" });
    }
  });

  app.post("/api/business-profile", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Niet ingelogd" });
      }

      const validationResult = insertBedrijfsprofielSchema.safeParse({
        ...req.body,
        gebruikerId: req.user.id,
      });

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const existingProfiel = await storage.getBedrijfsprofielByUserId(req.user.id);

      let profiel;
      if (existingProfiel) {
        profiel = await storage.updateBedrijfsprofiel(existingProfiel.id, validationResult.data);
      } else {
        profiel = await storage.createBedrijfsprofiel(validationResult.data);
      }

      res.json(profiel);
    } catch (error) {
      console.error("Error saving business profile:", error);
      res.status(500).json({ error: "Fout bij opslaan bedrijfsprofiel" });
    }
  });

  // Proposals routes
  app.get("/api/proposals/summary", requireAuth, async (req, res) => {
    try {
      const userProfileId = await getOrCreateUserProfileId(req);
      const summaries = await storage.getProposalSummaries(userProfileId);
      res.json(summaries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch proposal summaries" });
    }
  });

  app.get("/api/proposals", async (req, res) => {
    try {
      const { status } = req.query;
      const proposals = await storage.getProposals(status as string | undefined);
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  app.get("/api/proposals/:id", async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposal" });
    }
  });

  app.post("/api/proposals", async (req, res) => {
    try {
      const validatedData = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal(validatedData);
      res.status(201).json(proposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create proposal" });
    }
  });

  app.get("/api/proposals/:id/votes", async (req, res) => {
    try {
      const voteCounts = await storage.getVoteCounts(req.params.id);
      res.json(voteCounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vote counts" });
    }
  });

  app.post("/api/proposals/:id/vote", requireAuth, async (req, res) => {
    try {
      const { choice } = req.body;
      const userProfileId = await getOrCreateUserProfileId(req);

      const validatedVote = insertVoteSchema.parse({
        proposalId: req.params.id,
        userId: userProfileId,
        choice,
      });

      const vote = await storage.createVote(validatedVote);
      res.status(201).json(vote);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to vote" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // RegioBot chat route with mode support: general, legal, marketing (Pro-only)
  app.post("/api/regiobot/chat", requirePro, async (req, res) => {
    try {
      // Early check for OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "RegioBot is tijdelijk niet beschikbaar",
          details: "De AI-configuratie is nog niet voltooid. Neem contact op met de beheerder.",
          action: "Vraag de beheerder om OPENAI_API_KEY te configureren in de omgevingsvariabelen."
        });
      }

      // Validate request using schema
      const validationResult = regioBotChatSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Ongeldige aanvraag", 
          details: validationResult.error.errors 
        });
      }

      const { message, mode, history } = validationResult.data;

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      // Mode-based system prompts
      const modePrompts: Record<typeof mode, string> = {
        general: `Je bent RegioBot, een vriendelijke AI-assistent voor lokale ondernemers in Nederland. Je helpt met:
- Algemene bedrijfsvragen en strategieën
- Lokale SEO tips en online vindbaarheid
- Klantbereik vergroten
- Slimme automatiseringen
- Zakelijke processen optimaliseren

Wees altijd behulpzaam, professioneel en positief. Schrijf in het Nederlands en houd rekening met de lokale context van Nederlandse ondernemers.`,

        legal: `Je bent RegioBot, een toegankelijke juridische uitleg-assistent voor Nederlandse ondernemers.

**BELANGRIJKE DISCLAIMER:** Je geeft GEEN formeel juridisch advies. Je helpt ondernemers om juridische documenten, brieven en regelgeving te begrijpen in begrijpelijke taal.

Je taken:
- Leg juridische documenten uit in dagelijkse taal
- Vertaal juridisch jargon naar heldere uitleg
- Vat belangrijkste punten samen met bullet points
- Geef stappenplannen voor veelvoorkomende juridische situaties
- Leg consequenties en mogelijke acties uit
- Wees helder over wat een ondernemer zelf kan doen vs. wanneer een advocaat nodig is

Richtlijnen:
- Begin altijd met: "Dit is geen juridisch advies, maar een uitleg..."
- Gebruik concrete voorbeelden waar mogelijk
- Verwijs naar relevante Nederlandse wet- en regelgeving
- Adviseer bij complexe zaken om juridisch advies in te winnen
- Schrijf in het Nederlands
- Wees voorzichtig en conservatief in je uitleg

Je helpt NIET met:
- Formele juridische adviezen geven
- Contracten opstellen (alleen uitleggen)
- Vertegenwoordigen in juridische procedures`,

        marketing: `Je bent RegioBot, een creatieve AI-marketeer voor lokale Nederlandse ondernemers.

Je specialisaties:
- **Social media content**: Schrijf pakkende posts voor Facebook, Instagram, LinkedIn
- **Blog artikelen**: Creëer SEO-vriendelijke content over lokale onderwerpen
- **Aanbiedingen & acties**: Ontwikkel aantrekkelijke promoties met urgentie
- **Marketing strategieën**: Geef praktische tips voor lokale marketing

Voor social media posts:
- Schrijf authentiek en toegankelijk
- Gebruik emoji's waar gepast (max 2-3)
- Houd het kort en krachtig (max 150 woorden)
- Voeg een duidelijke call-to-action toe
- Focus op lokale verbinding en gemeenschap

Voor aanbiedingen:
- Maak de aanbieding concreet en waardevol
- Gebruik urgentie (beperkte tijd/aantal)
- Vermeld duidelijk de voordelen
- Schrijf een pakkende titel
- Voeg voorwaarden toe indien relevant

Voor blogs:
- Focus op lokale SEO zoekwoorden
- Schrijf informatief en waardevol
- Gebruik koppen en subkoppen
- Voeg praktische tips en voorbeelden toe
- Eindig met een call-to-action

Schrijf altijd in het Nederlands en denk mee met lokale trends en actualiteit.`,
      };

      // Build messages array with history support
      const messages: Array<{ role: "system" | "user" | "assistant", content: string }> = [
        {
          role: "system",
          content: modePrompts[mode],
        }
      ];

      // Add conversation history if provided
      if (history && history.length > 0) {
        messages.push(...history);
      }

      // Add current user message
      messages.push({
        role: "user",
        content: message,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      const response = completion.choices[0]?.message?.content || "Sorry, ik kon geen antwoord genereren.";
      res.json({ response, mode });
    } catch (error) {
      console.error("RegioBot error:", error);
      res.status(500).json({ error: "Kan geen antwoord van RegioBot ophalen" });
    }
  });

  // BLOK 5: RegioBot document upload endpoint (Pro-only)
  app.post("/api/regiobot/upload", requireAuth, checkDailyUploadLimit, upload.single('file'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Niet geauthenticeerd" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Geen bestand geüpload" });
      }

      // Determine document type from mime type
      const docType = getDocumentType(req.file.mimetype);

      // Store document metadata in database
      const document = await storage.createDocument({
        userId: req.user.id,
        filePath: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        type: docType,
      });

      res.status(201).json({
        success: true,
        document: {
          id: document.id,
          originalName: document.originalName,
          type: document.type,
          createdAt: document.createdAt,
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Bestand uploaden mislukt" });
    }
  });

  // Get user's uploaded documents
  app.get("/api/regiobot/documents", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Niet geauthenticeerd" });
      }

      const documents = await storage.getUserDocuments(req.user.id);
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Documenten ophalen mislukt" });
    }
  });

  // WOO RegioBot - searches WOO requests/documents and provides AI answers
  app.post("/api/regiobot", async (req, res) => {
    try {
      // Early check for OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "WOO RegioBot is tijdelijk niet beschikbaar",
          details: "De AI-configuratie is nog niet voltooid. Neem contact op met de beheerder.",
          action: "Vraag de beheerder om OPENAI_API_KEY te configureren in de omgevingsvariabelen."
        });
      }

      const payload = req.body ?? {};
      const result = await runRegioBot(payload);
      res.json(result);
    } catch (err: any) {
      console.error("RegioBot WOO error:", err);
      
      // Provide actionable error message
      const errorMessage = err?.message ?? String(err);
      const isConfigError = errorMessage.includes("OPENAI") || errorMessage.includes("API");
      
      res.status(isConfigError ? 503 : 400).json({
        error: isConfigError ? "RegioBot configuratiefout" : "RegioBot fout",
        message: errorMessage,
        action: isConfigError 
          ? "Controleer of OPENAI_API_KEY correct is geconfigureerd." 
          : "Controleer je invoer en probeer opnieuw."
      });
    }
  });

  // Digitale Buurman - quick RegioBot for dashboard
  app.post("/api/regiobot/buurman", requireAuth, async (req, res) => {
    try {
      const { beroep, stad, vraag } = req.body;
      if (!beroep || !stad) {
        return res.status(400).json({ error: "Beroep en stad zijn verplicht" });
      }

      if (!process.env.OPENAI_API_KEY) {
        const antwoord = `Hoi ${beroep}! In ${stad} zijn er altijd kansen voor lokale ondernemers. ` +
          `Check de Beleidsmonitor voor actuele ontwikkelingen in jouw regio, ` +
          `of stel een gerichte vraag via de uitgebreide RegioBot (Pro).`;
        return res.json({ antwoord });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const systemPrompt = `Je bent de digitale buurman van OpenRegio. Je bent warm, behulpzaam en je kent de regio.
Je geeft altijd 2 concrete, hoopvolle suggesties op basis van lokale samenwerking en WOO-inzichten.
Houd het kort (max 3-4 zinnen), persoonlijk en positief. Schrijf in het Nederlands.
Verwijs niet naar externe websites. Focus op concrete kansen en samenwerking.`;

      const userPrompt = vraag 
        ? `Een ${beroep} uit ${stad} vraagt: "${vraag}". Geef 2 concrete, hoopvolle suggesties.`
        : `Een ${beroep} uit ${stad} vraagt naar kansen. Geef 2 concrete, hoopvolle suggesties op basis van lokale samenwerking en WOO-inzichten.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      const antwoord = completion.choices[0]?.message?.content || "Ik kon helaas geen antwoord genereren. Probeer het later opnieuw.";
      res.json({ antwoord });
    } catch (err: any) {
      console.error("Buurman error:", err);
      res.status(500).json({ error: "Kon geen antwoord genereren" });
    }
  });

  // RAG System Routes - Document Upload and Vector Search
  app.post("/api/rag/documents", requireAuth, checkDailyUploadLimit, uploadMemory.single('file'), async (req, res) => {
    try {
      const user = req.user;
      if (!user?.id) return res.status(401).json({ error: "Niet ingelogd" });

      const file = req.file;
      if (!file) return res.status(400).json({ error: "Geen bestand ontvangen" });

      const { extractTextFromPDF } = await import("./rag/extract");
      const { extractTextFromImage } = await import("./rag/ocr");
      const { chunkText } = await import("./rag/chunk");
      const { embedTexts } = await import("./rag/embeddings");

      const allowedMimeTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "text/plain",
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          error: "Bestandstype niet ondersteund", 
          hint: "Upload een PDF, afbeelding (JPG/PNG), of tekstbestand."
        });
      }

      let text = "";
      let needsOcr = false;
      let pages: number | null = null;
      let ocrConfidence: number | null = null;

      const isImage = file.mimetype.startsWith("image/");
      const isTextFile = file.mimetype === "text/plain";
      
      if (isImage) {
        const ocrResult = await extractTextFromImage(file.buffer);
        text = ocrResult.text;
        ocrConfidence = ocrResult.confidence;
        needsOcr = false;
      } else if (isTextFile) {
        text = file.buffer.toString("utf-8");
        needsOcr = false;
      } else {
        const pdfResult = await extractTextFromPDF(file.buffer);
        text = pdfResult.text;
        needsOcr = pdfResult.needsOcr;
        pages = pdfResult.pages;
      }

      if (!text || text.trim().length < 10) {
        return res.status(400).json({ 
          error: "Geen tekst gevonden in document", 
          hint: "Probeer een document met meer tekst of een duidelijker gescande afbeelding." 
        });
      }

      const title = req.body.title || file.originalname;
      const region = req.body.region || null;
      const wooCategory = req.body.wooCategory || null;

      const metadata = { 
        pages, 
        originalName: file.originalname,
        mimeType: file.mimetype,
        ocrConfidence,
        isImage,
      };

      const docResult = await db.execute(sql`
        INSERT INTO rag_documents (user_id, region, woo_category, title, source_type, needs_ocr, metadata_json)
        VALUES (${user.id}, ${region}, ${wooCategory}, ${title}, 'upload', ${needsOcr}, ${JSON.stringify(metadata)})
        RETURNING id
      `);
      const docId = (docResult.rows as any)[0]?.id;

      if (!docId) throw new Error("Kon document niet opslaan");

      const chunks = chunkText(text);
      
      if (chunks.length === 0) {
        return res.status(400).json({ error: "Geen tekst chunks gevonden" });
      }

      const embeddings = await embedTexts(chunks);

      for (let i = 0; i < chunks.length; i++) {
        const chunkResult = await db.execute(sql`
          INSERT INTO rag_chunks (document_id, chunk_index, text)
          VALUES (${docId}, ${i}, ${chunks[i]})
          RETURNING id
        `);
        const chunkId = (chunkResult.rows as any)[0]?.id;

        const embeddingStr = `[${embeddings[i].join(",")}]`;
        await db.execute(sql`
          INSERT INTO rag_embeddings (chunk_id, embedding)
          VALUES (${chunkId}, ${embeddingStr}::vector)
        `);
      }

      res.json({
        success: true,
        documentId: docId,
        chunks: chunks.length,
        needsOcr,
        pages,
        ocrConfidence,
        isImage,
      });
    } catch (err: any) {
      console.error("RAG document upload error:", err);
      res.status(500).json({ error: "Document verwerken mislukt", message: err?.message });
    }
  });

  app.post("/api/rag/ask", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.id) return res.status(401).json({ error: "Niet ingelogd" });

      const { query, region } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Vraag is verplicht" });
      }

      const { ask } = await import("./rag/answer");
      const result = await ask({
        userId: user.id,
        region: region || undefined,
        query,
      });

      res.json(result);
    } catch (err: any) {
      console.error("RAG ask error:", err);
      res.status(500).json({ error: "Vraag beantwoorden mislukt", message: err?.message });
    }
  });

  app.get("/api/rag/documents", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.id) return res.status(401).json({ error: "Niet ingelogd" });

      const result = await db.execute(sql`
        SELECT d.*, 
          (SELECT COUNT(*) FROM rag_chunks WHERE document_id = d.id) as chunk_count
        FROM rag_documents d
        WHERE d.user_id = ${user.id}
        ORDER BY d.created_at DESC
      `);

      res.json(result.rows);
    } catch (err: any) {
      console.error("RAG documents list error:", err);
      res.status(500).json({ error: "Documenten ophalen mislukt" });
    }
  });

  app.delete("/api/rag/documents/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.id) return res.status(401).json({ error: "Niet ingelogd" });

      const { id } = req.params;
      await db.execute(sql`
        DELETE FROM rag_documents WHERE id = ${id} AND user_id = ${user.id}
      `);

      res.json({ success: true });
    } catch (err: any) {
      console.error("RAG document delete error:", err);
      res.status(500).json({ error: "Document verwijderen mislukt" });
    }
  });

  // WOO API routes for dropdown selectors
  app.get("/api/woo/regions", async (_req, res) => {
    try {
      const regions = await storage.getWooRegions();
      res.json(regions);
    } catch (err: any) {
      console.error("Error fetching WOO regions:", err);
      res.status(500).json({ error: "Kon regio's niet ophalen" });
    }
  });

  app.get("/api/woo/authorities", async (_req, res) => {
    try {
      const authorities = await storage.getWooAuthorities();
      res.json(authorities);
    } catch (err: any) {
      console.error("Error fetching WOO authorities:", err);
      res.status(500).json({ error: "Kon bestuursorganen niet ophalen" });
    }
  });

  // WOO Categories - get allowed categories for dropdown
  app.get("/api/woo/categories", async (_req, res) => {
    try {
      const categories = await storage.getWooCategories();
      res.json(categories);
    } catch (err: any) {
      console.error("Error fetching WOO categories:", err);
      res.status(500).json({ error: "Kon categorieën niet ophalen" });
    }
  });

  // WOO Dossiers - for RegioBot dossier selector with filters (collective library)
  app.get("/api/woo/dossiers", async (req, res) => {
    try {
      const { region, authority, q } = req.query as { region?: string; authority?: string; q?: string };
      
      const results = await db.execute(sql`
        SELECT 
          r.id, 
          r.title, 
          r.reference_code, 
          r.sent_at, 
          r.status,
          rg.slug as region_slug, 
          rg.name as region_name,
          au.slug as authority_slug, 
          au.name as authority_name
        FROM woo_requests r
        LEFT JOIN regions rg ON rg.id = r.region_id
        LEFT JOIN authorities au ON au.id = r.authority_id
        ORDER BY COALESCE(r.sent_at, r.created_at) DESC
        LIMIT 300
      `);
      
      // Filter in memory for dynamic conditions (safer than raw SQL injection)
      let rows = results.rows as any[];
      if (region && region !== "all") {
        rows = rows.filter(r => r.region_slug === region);
      }
      if (authority && authority !== "all") {
        rows = rows.filter(r => r.authority_slug === authority);
      }
      if (q && String(q).trim().length >= 2) {
        const search = String(q).trim().toLowerCase();
        rows = rows.filter(r => 
          (r.title && r.title.toLowerCase().includes(search)) ||
          (r.reference_code && r.reference_code.toLowerCase().includes(search))
        );
      }
      
      res.json(rows);
    } catch (err: any) {
      console.error("Error fetching WOO dossiers:", err);
      res.status(500).json({ error: "dossiers_list_failed" });
    }
  });

  // Legacy endpoint - redirect to dossiers
  app.get("/api/woo/requests/list", async (_req, res) => {
    try {
      const results = await db.execute(sql`
        SELECT 
          r.id, 
          r.title, 
          r.reference_code, 
          r.sent_at, 
          r.status,
          rg.slug as region_slug, 
          rg.name as region_name,
          au.slug as authority_slug, 
          au.name as authority_name
        FROM woo_requests r
        LEFT JOIN regions rg ON rg.id = r.region_id
        LEFT JOIN authorities au ON au.id = r.authority_id
        ORDER BY COALESCE(r.sent_at, r.created_at) DESC
        LIMIT 200
      `);
      res.json(results.rows);
    } catch (err: any) {
      console.error("Error fetching WOO requests list:", err);
      res.status(500).json({ error: "Kon WOO-verzoeken niet ophalen" });
    }
  });

  // WOO Template Generator - generates ready-to-use WOO request letters
  app.post("/api/woo/generate", async (req, res) => {
    try {
      // Early check for OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "WOO Generator is tijdelijk niet beschikbaar",
          details: "De AI-configuratie is nog niet voltooid.",
          action: "Vraag de beheerder om OPENAI_API_KEY te configureren."
        });
      }

      // Validate input
      const { authority, subject, context, requestedDocuments } = req.body;
      
      if (!authority || !subject) {
        return res.status(400).json({
          error: "Onvolledige aanvraag",
          details: "Bestuursorgaan en onderwerp zijn verplicht.",
          action: "Vul alle verplichte velden in."
        });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const today = new Date().toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });

      const systemPrompt = `Je bent een expert in het opstellen van WOO-verzoeken (Wet open overheid) voor Nederlandse burgers en ondernemers.

Je taak is om een professionele, juridisch correcte WOO-brief te genereren die direct gebruikt kan worden.

Regels:
- Gebruik formeel maar toegankelijk Nederlands
- Verwijs naar de juiste wetsartikelen (Woo artikel 4.1)
- Wees specifiek over welke documenten worden opgevraagd
- Geef een redelijke termijn (4 weken conform Woo)
- Vermeld het recht op bezwaar en beroep
- Voeg een checklist toe voor de indiener

Output formaat:
1. De volledige brief (klaar om te kopiëren)
2. Een checklist met actiepunten voor de indiener
3. Tips voor opvolging`;

      const userPrompt = `Genereer een WOO-verzoek met de volgende gegevens:

Bestuursorgaan: ${authority}
Onderwerp: ${subject}
${context ? `Achtergrond/context: ${context}` : ''}
${requestedDocuments ? `Specifiek gevraagde stukken: ${requestedDocuments}` : ''}

Datum: ${today}

Maak een complete, direct bruikbare WOO-brief.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      });

      const generatedContent = completion.choices[0]?.message?.content || "";

      // Parse the response to extract letter and checklist
      const letterMatch = generatedContent.match(/^([\s\S]*?)(?=\n\s*(?:Checklist|CHECKLIST|✓|□|\d+\.\s*\[))/i);
      const checklistMatch = generatedContent.match(/(?:Checklist|CHECKLIST|Actiepunten)[\s\S]*$/i);

      res.json({
        success: true,
        letter: letterMatch ? letterMatch[1].trim() : generatedContent,
        checklist: checklistMatch ? checklistMatch[0].trim() : "- Controleer of alle gegevens kloppen\n- Bewaar een kopie van je verzoek\n- Noteer de verzenddatum\n- Zet een herinnering voor 4 weken",
        fullContent: generatedContent,
        metadata: {
          authority,
          subject,
          generatedAt: new Date().toISOString(),
        }
      });
    } catch (err: any) {
      console.error("WOO Generator error:", err);
      res.status(500).json({
        error: "WOO-brief genereren mislukt",
        message: err?.message ?? String(err),
        action: "Probeer het opnieuw of neem contact op met support."
      });
    }
  });

  // WOO Dossiers - save and retrieve generated WOO letters
  app.post("/api/woo/dossiers", requireAuth, async (req, res) => {
    try {
      const { authority, subject, context, requestedDocuments, generatedLetter, checklist, status } = req.body;

      if (!authority || !subject || !generatedLetter) {
        return res.status(400).json({
          error: "Onvolledige aanvraag",
          details: "Bestuursorgaan, onderwerp en gegenereerde brief zijn verplicht."
        });
      }

      const dossier = await storage.createWooDossier({
        userId: req.user!.id,
        authority,
        subject,
        context: context || null,
        requestedDocuments: requestedDocuments || null,
        generatedLetter,
        checklist: checklist || null,
        status: status || "draft",
      });

      res.status(201).json(dossier);
    } catch (err: any) {
      console.error("Create dossier error:", err);
      res.status(500).json({ error: "Dossier opslaan mislukt" });
    }
  });

  app.get("/api/woo/dossiers", requireAuth, async (req, res) => {
    try {
      const dossiers = await storage.getWooDossiers(req.user!.id);
      res.json(dossiers);
    } catch (err: any) {
      console.error("Get dossiers error:", err);
      res.status(500).json({ error: "Dossiers ophalen mislukt" });
    }
  });

  app.get("/api/woo/dossiers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Ongeldig dossier ID" });
      }

      const dossier = await storage.getWooDossier(id, req.user!.id);
      if (!dossier) {
        return res.status(404).json({ error: "Dossier niet gevonden" });
      }

      res.json(dossier);
    } catch (err: any) {
      console.error("Get dossier error:", err);
      res.status(500).json({ error: "Dossier ophalen mislukt" });
    }
  });

  // WOO Wizard Step 1: Create intake dossier
  app.post("/api/woo/wizard/intake", requireAuth, async (req, res) => {
    try {
      const { authority, subject, uploadedDocument, location, purpose, userQuestion } = req.body;

      if (!authority || !subject) {
        return res.status(400).json({ error: "Bestuursorgaan en onderwerp zijn verplicht" });
      }

      const dossier = await storage.createWooDossier({
        userId: req.user!.id,
        authority,
        subject,
        uploadedDocument: uploadedDocument || null,
        location: location || null,
        purpose: purpose || null,
        userQuestion: userQuestion || null,
        status: "intake",
      });

      res.status(201).json(dossier);
    } catch (err: any) {
      console.error("WOO intake error:", err);
      res.status(500).json({ error: "Intake opslaan mislukt" });
    }
  });

  // WOO Wizard Step 2: Extract data from document
  app.post("/api/woo/wizard/extract", requireAuth, async (req, res) => {
    try {
      const { dossierId, documentText } = req.body;

      if (!dossierId || !documentText) {
        return res.status(400).json({ error: "Dossier ID en documenttekst zijn verplicht" });
      }

      if (typeof documentText === "string" && documentText.trim().length < 200) {
        return res.status(400).json({ error: "Documenttekst is te kort. Voeg minimaal ~200 tekens toe voor een goede analyse." });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "OpenAI API niet geconfigureerd" });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const systemPrompt = `Je bent een juridisch expert in Nederlandse bestuursrechtelijke documenten.
Analyseer de beschikking of besluit en extraheer de volgende informatie in JSON formaat:
{
  "datum": "datum van het besluit",
  "zaaknummer": "zaaknummer of kenmerk",
  "onderwerp": "korte omschrijving van het onderwerp",
  "afdeling": "betrokken afdeling of bestuursorgaan",
  "kernfeiten": ["feit 1", "feit 2", "feit 3"],
  "beleidsbotsing": "beschrijving van mogelijke beleidsconflicten of onduidelijkheden"
}
Wees nauwkeurig en beknopt. Als informatie niet gevonden kan worden, geef dan "Niet gevonden" aan.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: documentText }
        ],
        response_format: { type: "json_object" },
      });

      const extractedData = JSON.parse(response.choices[0].message.content || "{}");

      // Update dossier with extracted data
      await storage.updateWooDossier(dossierId, req.user!.id, {
        extractedData,
        status: "extracted",
      });

      res.json({ success: true, extractedData });
    } catch (err: any) {
      console.error("WOO extract error:", err);
      res.status(500).json({ error: "Analyse mislukt", message: err?.message });
    }
  });

  // WOO Wizard Step 3: Generate document list (vraagset)
  app.post("/api/woo/wizard/questions", requireAuth, async (req, res) => {
    try {
      const { dossierId, extractedData, purpose, userQuestion } = req.body;

      if (!dossierId) {
        return res.status(400).json({ error: "Dossier ID is verplicht" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "OpenAI API niet geconfigureerd" });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const systemPrompt = `Je bent een expert in WOO-verzoeken (Wet open overheid).
Genereer een gerichte documentenlijst voor een WOO-verzoek, gebaseerd op de geëxtraheerde informatie.

Doel van het verzoek: ${purpose || "onderzoek"}
Vraag van de gebruiker: ${userQuestion || "Alle relevante documenten"}

Genereer een JSON array met categorieën en specifieke documenten:
{
  "documentList": [
    {"category": "Besluitvorming", "documents": ["besluit", "concept-besluiten", "adviezen"]},
    {"category": "Grondslag", "documents": ["wettelijke grondslag", "beleidsregels"]},
    {"category": "Beleid", "documents": ["beleidsnotities", "richtlijnen"]},
    {"category": "Uitvoering", "documents": ["contracten", "facturen", "correspondentie"]},
    {"category": "Gelijkheidsinformatie", "documents": ["vergelijkbare zaken", "precedenten"]},
    {"category": "Communicatie", "documents": ["e-mails", "vergaderverslagen", "telefoonnotities"]}
  ]
}

Pas de documentenlijst aan op basis van het specifieke onderwerp en doel.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(extractedData) }
        ],
        response_format: { type: "json_object" },
      });

      const { documentList } = JSON.parse(response.choices[0].message.content || '{"documentList":[]}');

      // Update dossier with document list
      await storage.updateWooDossier(dossierId, req.user!.id, {
        documentList,
        status: "questions",
      });

      res.json({ success: true, documentList });
    } catch (err: any) {
      console.error("WOO questions error:", err);
      res.status(500).json({ error: "Vraagset genereren mislukt", message: err?.message });
    }
  });

  // WOO Wizard Step 4: Generate complete WOO letter
  app.post("/api/woo/wizard/generate", requireAuth, async (req, res) => {
    try {
      const { dossierId, authority, subject, extractedData, documentList, location } = req.body;

      if (!dossierId || !authority || !subject) {
        return res.status(400).json({ error: "Vereiste velden ontbreken" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "OpenAI API niet geconfigureerd" });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const systemPrompt = `Je bent een expert in Nederlandse WOO-verzoeken (Wet open overheid).
Schrijf een formeel, volledig WOO-verzoek met de volgende elementen:

1. Briefhoofd met datum en adressering aan: ${authority}
2. Onderwerpregel: ${subject}
3. Introductie met verwijzing naar de Wet open overheid
4. Gedetailleerde opsomming van gevraagde documenten (inventarislijst)
5. Clausules voor:
   - Lakken/verwijderen van persoonsgegevens (indien nodig)
   - Digitale levering via e-mail
   - Termijn van 4 weken conform artikel 4.4 Woo
6. Afsluitende formule

Locatie/gemeente: ${location || "Niet gespecificeerd"}

Maak het verzoek professioneel en juridisch correct.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Geëxtraheerde data: ${JSON.stringify(extractedData)}\n\nGevraagde documenten: ${JSON.stringify(documentList)}` }
        ],
      });

      const generatedLetter = response.choices[0].message.content || "";

      // Generate checklist
      const checklist = [
        "Controleer alle gegevens op juistheid",
        "Voeg eventuele bijlagen toe",
        "Bewaar een kopie van dit verzoek",
        "Verstuur per e-mail of aangetekende post",
        "Noteer de verzenddatum",
        "Zet een herinnering voor 4 weken (reactietermijn)"
      ];

      // Update dossier with generated letter
      await storage.updateWooDossier(dossierId, req.user!.id, {
        generatedLetter,
        checklist: JSON.stringify(checklist),
        requestedDocuments: JSON.stringify(documentList),
        status: "generated",
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
      });

      res.json({
        success: true,
        letter: generatedLetter,
        checklist,
        metadata: {
          authority,
          subject,
          generatedAt: new Date().toISOString(),
        }
      });
    } catch (err: any) {
      console.error("WOO generate error:", err);
      res.status(500).json({ error: "Brief genereren mislukt", message: err?.message });
    }
  });

  // Update WOO dossier status
  app.patch("/api/woo/dossiers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Ongeldig dossier ID" });
      }

      const updated = await storage.updateWooDossier(id, req.user!.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Dossier niet gevonden" });
      }

      res.json(updated);
    } catch (err: any) {
      console.error("Update dossier error:", err);
      res.status(500).json({ error: "Dossier bijwerken mislukt" });
    }
  });

  // Chat routes
  app.get("/api/chat/rooms", async (_req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  app.get("/api/chat/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getChatRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat room" });
    }
  });

  app.post("/api/chat/rooms", async (req, res) => {
    try {
      const validatedData = insertChatRoomSchema.parse(req.body);
      const room = await storage.createChatRoom(validatedData);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create chat room" });
    }
  });

  app.get("/api/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const room = await storage.getChatRoom(req.params.roomId);
      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await storage.getChatMessages(req.params.roomId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const room = await storage.getChatRoom(req.params.roomId);
      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }
      
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        roomId: req.params.roomId,
      });
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { region, type } = req.query;
      const posts = await storage.getPosts(
        region as string | undefined,
        type as string | undefined
      );
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", attachUser, requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const validatedData = insertPostSchema.parse({
        ...req.body,
        authorUserId: user.id,
      });
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.delete("/api/posts/:id", attachUser, requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const postId = req.params.id;
      
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post niet gevonden" });
      }
      
      // Check if user is owner or master/admin
      const isMaster = user.isAdmin;
      const isOwner = post.authorUserId === user.id;
      
      if (!isMaster && !isOwner) {
        return res.status(403).json({ error: "Je kunt alleen je eigen posts verwijderen" });
      }
      
      const deleted = await storage.deletePost(postId);
      if (deleted) {
        res.json({ success: true, message: "Post verwijderd" });
      } else {
        res.status(500).json({ error: "Kon post niet verwijderen" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // User Profile routes
  app.get("/api/user-profile/:id", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.get("/api/user-profile/email/:email", async (req, res) => {
    try {
      const profile = await storage.getUserProfileByEmail(req.params.email);
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.post("/api/user-profile", async (req, res) => {
    try {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user profile" });
    }
  });

  app.patch("/api/user-profile/:id", async (req, res) => {
    try {
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateUserProfile(req.params.id, validatedData);
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // Billing & Subscription routes
  app.post("/api/billing/create-checkout", async (req, res) => {
    try {
      if (!mollieClient) {
        return res.status(503).json({ error: "Payment provider not configured. Please contact administrator." });
      }

      // Validate request with Zod
      const checkoutSchema = z.object({
        userId: z.string().min(1, "userId is required"),
        plan: z.enum(["basic", "pro"], { required_error: "plan must be 'basic' or 'pro'" }),
        returnUrl: z.string().url().optional()
      });

      const validatedData = checkoutSchema.parse(req.body);
      const { userId, plan, returnUrl } = validatedData;

      // Get or create user profile
      const userProfile = await storage.getUserProfile(userId);
      if (!userProfile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      // Check if user already has active subscription
      const existingSub = await storage.getSubscription(userId);
      if (existingSub && existingSub.status === "active") {
        return res.status(400).json({ error: "User already has active subscription" });
      }

      // Create Mollie customer
      const customer = await mollieClient.customers.create({
        name: userProfile.name,
        email: userProfile.email,
      });

      // Get base URL for redirects and webhooks
      const baseUrl = getBaseUrl(req);

      // Create first payment to establish mandate
      const firstPayment = await mollieClient.payments.create({
        amount: {
          currency: "EUR",
          value: getPlanPrice(plan)
        },
        customerId: customer.id,
        sequenceType: "first" as any,
        description: `OpenRegio ${plan === "pro" ? "Pro" : "Basic"} lidmaatschap`,
        redirectUrl: returnUrl || `${baseUrl}/lidmaatschap`,
        webhookUrl: `${baseUrl}/api/webhooks/mollie`,
        metadata: {
          userId,
          plan
        } as any
      });

      // Create subscription record in database (status: trialing until first payment)
      const subscription = await storage.createSubscription({
        userId,
        mollieCustomerId: customer.id,
        mollieSubscriptionId: null,
        status: "trialing",
        plan,
        currentPeriodEnd: null
      });

      res.json({
        checkoutUrl: (firstPayment as any)._links?.checkout?.href || "",
        paymentId: firstPayment.id,
        subscriptionId: subscription.id
      });
    } catch (error: any) {
      console.error("Create checkout error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  app.get("/api/billing/subscription", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const subscription = await storage.getSubscription(userId as string);
      
      if (!subscription) {
        return res.status(404).json({ error: "No subscription found" });
      }

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  app.post("/api/webhooks/mollie", async (req, res) => {
    try {
      if (!mollieClient) {
        return res.sendStatus(503);
      }

      const paymentId = req.body.id;
      
      if (!paymentId) {
        return res.status(400).json({ error: "Payment ID required" });
      }

      // Fetch payment details from Mollie
      const payment: any = await mollieClient.payments.get(paymentId);
      
      const userId = payment.metadata?.userId;
      const plan = payment.metadata?.plan;

      if (!userId) {
        console.error("Webhook: No userId in payment metadata");
        return res.sendStatus(200);
      }

      if (payment.status === "paid") {
        console.log(`Payment ${paymentId} paid for user ${userId}`);
        
        // Get subscription
        const subscription = await storage.getSubscription(userId);
        if (!subscription) {
          console.error("Webhook: Subscription not found for user", userId);
          return res.sendStatus(200);
        }

        // If this is first payment with mandate, create Mollie subscription
        if (payment.sequenceType === "first" && subscription.mollieCustomerId) {
          try {
            // Use PUBLIC_BASE_URL env var or construct from request
            const baseUrl = process.env.PUBLIC_BASE_URL || getBaseUrl(req);
            
            const mollieSubscription = await mollieClient.customerSubscriptions.create({
              customerId: subscription.mollieCustomerId,
              amount: {
                currency: "EUR",
                value: getPlanPrice(plan)
              },
              interval: "1 month",
              description: `OpenRegio ${plan === "pro" ? "Pro" : "Basic"} lidmaatschap`,
              webhookUrl: `${baseUrl}/api/webhooks/mollie`
            });

            // Update subscription to active
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            
            await storage.updateSubscription(subscription.id, {
              mollieSubscriptionId: mollieSubscription.id,
              status: "active",
              currentPeriodEnd: nextMonth
            });

            console.log(`Subscription activated for user ${userId}`);
          } catch (subError: any) {
            console.error("Failed to create Mollie subscription:", subError);
          }
        }
      } else if (payment.status === "failed") {
        console.log(`Payment ${paymentId} failed for user ${userId}`);
        // Handle failed payment (could update subscription status)
      }

      res.sendStatus(200);
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.sendStatus(500);
    }
  });

  // ===============================
  // ADMIN EXPORT ROUTES
  // ===============================

  // GET /api/export/nieuwe-leden - Export new members (configurable days, supports CSV)
  app.get("/api/export/nieuwe-leden", requireAdmin, async (req, res) => {
    try {
      // Get days parameter (default 30)
      const days = parseInt(req.query.days as string) || 30;
      const format = req.query.format as string || 'json';
      
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const allUsers = await storage.getAllUsers();
      
      // Filter users by creation date and get their business profiles
      const nieuweLeden = [];
      
      for (const user of allUsers) {
        // Skip if no createdAt or if older than specified days
        if (!user.createdAt || new Date(user.createdAt) < sinceDate) {
          continue;
        }
        
        // Get business profile if exists
        const profiel = await storage.getBedrijfsprofielByUserId(user.id);
        
        nieuweLeden.push({
          id: user.id,
          email: user.email,
          naam: profiel?.naam || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Onbekend',
          eigenaarnaam: profiel?.eigenaarnaam || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          regio: profiel?.regio || '-',
          plan: user.plan,
          aangemeld: user.createdAt,
          profielStatus: profiel?.status || 'geen profiel',
        });
      }

      // Sort by newest first
      nieuweLeden.sort((a, b) => 
        new Date(b.aangemeld).getTime() - new Date(a.aangemeld).getTime()
      );

      // CSV format
      if (format === 'csv') {
        const csvHeader = 'Naam,Eigenaarnaam,Email,Regio,Plan,Aangemeld,Status\n';
        const csvRows = nieuweLeden.map(lid => 
          `"${lid.naam}","${lid.eigenaarnaam}","${lid.email}","${lid.regio}","${lid.plan}","${new Date(lid.aangemeld).toLocaleDateString('nl-NL')}","${lid.profielStatus}"`
        ).join('\n');
        
        const csv = csvHeader + csvRows;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="nieuwe-leden-${days}-dagen.csv"`);
        return res.send(csv);
      }

      // JSON format (default)
      res.json({
        success: true,
        periode: {
          van: sinceDate.toISOString().split('T')[0],
          tot: new Date().toISOString().split('T')[0],
          dagen: days,
        },
        aantal: nieuweLeden.length,
        leden: nieuweLeden,
      });
    } catch (error: any) {
      console.error("Export nieuwe leden error:", error);
      res.status(500).json({ error: "Kon nieuwe leden niet ophalen" });
    }
  });

  // ===================================
  // PRO DATA & CONSENT CONTROL
  // ===================================

  // Get visibility settings (PRO only)
  app.get("/api/pro/visibility-settings", requirePro, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }

      // Parse visibility settings or use defaults
      const { parseVisibilitySettings, VISIBILITY_OPTIONS, VISIBILITY_LABELS, FIELD_LABELS } = await import("./utils/visibility");
      const settings = parseVisibilitySettings(user.visibilitySettings);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          businessName: user.businessName,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          region: user.region,
        },
        settings,
        options: VISIBILITY_OPTIONS,
        labels: VISIBILITY_LABELS,
        fieldLabels: FIELD_LABELS,
      });
    } catch (error: any) {
      console.error("Error fetching visibility settings:", error);
      res.status(500).json({ error: "Kon zichtbaarheidsinstellingen niet ophalen" });
    }
  });

  // Update visibility settings (PRO only)
  app.post("/api/pro/visibility-settings", requirePro, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Validate request body with Zod schema
      const validationResult = visibilitySettingsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Ongeldige invoer", 
          details: fromZodError(validationResult.error).message 
        });
      }

      // Merge with defaults to ensure all fields are present
      const settings = {
        ...DEFAULT_VISIBILITY_SETTINGS,
        ...validationResult.data,
      };

      // Update user's visibility settings
      await storage.updateUserVisibilitySettings(userId, JSON.stringify(settings));

      res.json({ 
        success: true, 
        message: "Zichtbaarheidsinstellingen opgeslagen",
        settings 
      });
    } catch (error: any) {
      console.error("Error updating visibility settings:", error);
      res.status(500).json({ error: "Kon zichtbaarheidsinstellingen niet opslaan" });
    }
  });

  // Get user profile with visibility filtering
  app.get("/api/profile/:id", async (req, res) => {
    try {
      const ownerId = req.params.id;
      const viewerId = req.user?.id;
      
      const owner = await storage.getUser(ownerId);
      if (!owner) {
        return res.status(404).json({ error: "Profiel niet gevonden" });
      }

      const viewer = viewerId ? await storage.getUser(viewerId) : null;
      
      // Import visibility helpers
      const { parseVisibilitySettings, canViewField } = await import("./utils/visibility");
      const settings = parseVisibilitySettings(owner.visibilitySettings);

      // Build profile with visibility filtering
      const profile: Record<string, any> = {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        profileImageUrl: owner.profileImageUrl,
        plan: owner.plan,
      };

      // Apply visibility rules to each field
      if (canViewField(viewer, owner, settings.company_name)) {
        profile.businessName = owner.businessName;
      } else {
        profile.businessName = null;
        profile.businessNameHidden = true;
      }

      if (canViewField(viewer, owner, settings.phone)) {
        profile.phone = owner.email; // Using email as phone placeholder
      } else {
        profile.phone = null;
        profile.phoneHidden = true;
      }

      if (canViewField(viewer, owner, settings.address)) {
        profile.address = owner.region;
      } else {
        profile.address = null;
        profile.addressHidden = true;
      }

      if (canViewField(viewer, owner, settings.website)) {
        profile.website = null; // No website field in user table
      }

      if (canViewField(viewer, owner, settings.description)) {
        profile.bio = owner.bio;
      } else {
        profile.bio = null;
        profile.bioHidden = true;
      }

      res.json(profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Kon profiel niet ophalen" });
    }
  });

  // ===================================
  // PRIVACY & CONSENT DASHBOARD (AVG)
  // ===================================

  // Get all field visibilities for current user
  app.get("/api/privacy/visibility", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const visibilities = await storage.getFieldVisibilities(userId);
      res.json(visibilities);
    } catch (error: any) {
      console.error("Error fetching visibilities:", error);
      res.status(500).json({ error: "Kon zichtbaarheidsinstellingen niet ophalen" });
    }
  });

  // Update visibility for a specific field
  app.post("/api/privacy/visibility", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { fieldName, visibility } = req.body;

      if (!fieldName || !visibility) {
        return res.status(400).json({ error: "Veldnaam en zichtbaarheid zijn verplicht" });
      }

      const validVisibilities = ["public", "members", "region_only", "private"];
      if (!validVisibilities.includes(visibility)) {
        return res.status(400).json({ error: "Ongeldige zichtbaarheidsinstelling" });
      }

      const result = await storage.setFieldVisibility(userId, fieldName, visibility);
      res.json(result);
    } catch (error: any) {
      console.error("Error updating visibility:", error);
      res.status(500).json({ error: "Kon zichtbaarheid niet bijwerken" });
    }
  });

  // Get consent history (last 10 changes)
  app.get("/api/privacy/consent-log", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const logs = await storage.getConsentLogs(userId, 10);
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching consent logs:", error);
      res.status(500).json({ error: "Kon toestemmingshistorie niet ophalen" });
    }
  });

  // Export all user data (AVG right)
  app.get("/api/privacy/export", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const data = await storage.exportUserData(userId);

      // Remove sensitive fields from export
      const exportData = {
        profile: {
          ...data.profile,
          passwordHash: undefined, // Never export password hash
        },
        bedrijfsprofiel: data.bedrijfsprofiel,
        visibility: data.visibility,
        consentLog: data.consentLog,
        exportedAt: new Date().toISOString(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="mijn-openregio-data.json"');
      res.json(exportData);
    } catch (error: any) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ error: "Kon data niet exporteren" });
    }
  });

  // Delete account (soft delete - AVG right to be forgotten)
  app.post("/api/privacy/delete-account", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { confirm } = req.body;

      if (confirm !== "VERWIJDER") {
        return res.status(400).json({ 
          error: "Bevestig verwijdering door 'VERWIJDER' in te typen" 
        });
      }

      // Soft delete user
      const deleted = await storage.softDeleteUser(userId);

      if (!deleted) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }

      // Revoke all refresh tokens for this user
      await revokeAllUserTokens(userId);

      // Clear all auth cookies
      clearTokenCookies(res);

      res.json({ 
        success: true, 
        message: "Je account is verwijderd. We zullen je data binnen 30 dagen volledig verwijderen." 
      });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Kon account niet verwijderen" });
    }
  });

  // Get full privacy dashboard data in one call
  app.get("/api/privacy/dashboard", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const [user, profiel, visibilities, logs] = await Promise.all([
        storage.getUser(userId),
        storage.getBedrijfsprofielByUserId(userId),
        storage.getFieldVisibilities(userId),
        storage.getConsentLogs(userId, 10)
      ]);

      if (!user) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }

      res.json({
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          bio: user.bio,
          category: user.category,
          profileImageUrl: user.profileImageUrl,
          plan: user.plan,
          createdAt: user.createdAt,
        },
        bedrijfsprofiel: profiel,
        visibility: visibilities,
        consentLog: logs,
      });
    } catch (error: any) {
      console.error("Error fetching privacy dashboard:", error);
      res.status(500).json({ error: "Kon privacy dashboard niet laden" });
    }
  });

  // =====================================
  // RegioCrew - Flex pool for personnel shortages
  // Available to ALL members (Basic + Pro)
  // =====================================

  // Get categories for RegioCrew
  app.get("/api/crew/categories", (_req, res) => {
    res.json(CREW_CATEGORIES);
  });

  // Crew Profiles - My profile
  app.get("/api/crew/profile", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getCrewProfile(req.user!.id);
      res.json(profile || null);
    } catch (error: any) {
      console.error("Error fetching crew profile:", error);
      res.status(500).json({ error: "Kon profiel niet laden" });
    }
  });

  app.post("/api/crew/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Check if profile already exists
      const existing = await storage.getCrewProfile(userId);
      if (existing) {
        return res.status(400).json({ error: "Je hebt al een flex-profiel" });
      }

      const parsed = insertCrewProfileSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }

      const profile = await storage.createCrewProfile(parsed.data);
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("Error creating crew profile:", error);
      res.status(500).json({ error: "Kon profiel niet aanmaken" });
    }
  });

  app.put("/api/crew/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const existing = await storage.getCrewProfile(userId);
      
      if (!existing) {
        return res.status(404).json({ error: "Geen profiel gevonden" });
      }

      const updated = await storage.updateCrewProfile(existing.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating crew profile:", error);
      res.status(500).json({ error: "Kon profiel niet bijwerken" });
    }
  });

  // Browse all active crew profiles
  app.get("/api/crew/profiles", requireAuth, async (req, res) => {
    try {
      const { region, category } = req.query;
      const profiles = await storage.getCrewProfiles(
        region as string | undefined,
        category as string | undefined
      );
      res.json(profiles);
    } catch (error: any) {
      console.error("Error fetching crew profiles:", error);
      res.status(500).json({ error: "Kon profielen niet laden" });
    }
  });

  // Crew Requests - Open requests for help
  app.get("/api/crew/requests", requireAuth, async (req, res) => {
    try {
      const { region, category, status } = req.query;
      const requests = await storage.getCrewRequests(
        region as string | undefined,
        category as string | undefined,
        status as string | undefined || "open"
      );
      res.json(requests);
    } catch (error: any) {
      console.error("Error fetching crew requests:", error);
      res.status(500).json({ error: "Kon hulpvragen niet laden" });
    }
  });

  app.get("/api/crew/requests/:id", requireAuth, async (req, res) => {
    try {
      const request = await storage.getCrewRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Hulpvraag niet gevonden" });
      }
      res.json(request);
    } catch (error: any) {
      console.error("Error fetching crew request:", error);
      res.status(500).json({ error: "Kon hulpvraag niet laden" });
    }
  });

  app.get("/api/crew/my-requests", requireAuth, async (req, res) => {
    try {
      const profiel = await storage.getBedrijfsprofielByUserId(req.user!.id);
      if (!profiel) {
        return res.json([]);
      }
      const requests = await storage.getCrewRequestsByBusiness(profiel.id);
      res.json(requests);
    } catch (error: any) {
      console.error("Error fetching my crew requests:", error);
      res.status(500).json({ error: "Kon mijn hulpvragen niet laden" });
    }
  });

  app.post("/api/crew/requests", requireAuth, async (req, res) => {
    try {
      // User must have a bedrijfsprofiel to post requests
      const profiel = await storage.getBedrijfsprofielByUserId(req.user!.id);
      if (!profiel) {
        return res.status(400).json({ 
          error: "Je moet eerst een bedrijfsprofiel aanmaken om hulpvragen te plaatsen" 
        });
      }

      const parsed = insertCrewRequestSchema.safeParse({ 
        ...req.body, 
        businessId: profiel.id,
        region: req.body.region || profiel.regio 
      });
      
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }

      const request = await storage.createCrewRequest(parsed.data);
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating crew request:", error);
      res.status(500).json({ error: "Kon hulpvraag niet aanmaken" });
    }
  });

  app.put("/api/crew/requests/:id", requireAuth, async (req, res) => {
    try {
      const request = await storage.getCrewRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Hulpvraag niet gevonden" });
      }

      // Check ownership
      const profiel = await storage.getBedrijfsprofielByUserId(req.user!.id);
      if (!profiel || request.businessId !== profiel.id) {
        return res.status(403).json({ error: "Niet geautoriseerd" });
      }

      const updated = await storage.updateCrewRequest(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating crew request:", error);
      res.status(500).json({ error: "Kon hulpvraag niet bijwerken" });
    }
  });

  app.delete("/api/crew/requests/:id", requireAuth, async (req, res) => {
    try {
      const request = await storage.getCrewRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Hulpvraag niet gevonden" });
      }

      // Check ownership or admin
      const profiel = await storage.getBedrijfsprofielByUserId(req.user!.id);
      const isOwner = profiel && request.businessId === profiel.id;
      
      if (!isOwner && !req.user!.isAdmin) {
        return res.status(403).json({ error: "Niet geautoriseerd" });
      }

      await storage.deleteCrewRequest(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting crew request:", error);
      res.status(500).json({ error: "Kon hulpvraag niet verwijderen" });
    }
  });

  // Crew Applications - Apply for a request
  app.get("/api/crew/requests/:id/applications", requireAuth, async (req, res) => {
    try {
      const request = await storage.getCrewRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Hulpvraag niet gevonden" });
      }

      // Only request owner can see all applications
      const profiel = await storage.getBedrijfsprofielByUserId(req.user!.id);
      if (!profiel || request.businessId !== profiel.id) {
        return res.status(403).json({ error: "Niet geautoriseerd" });
      }

      const applications = await storage.getCrewApplications(req.params.id);
      res.json(applications);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Kon reacties niet laden" });
    }
  });

  app.post("/api/crew/requests/:id/apply", requireAuth, async (req, res) => {
    try {
      const request = await storage.getCrewRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Hulpvraag niet gevonden" });
      }

      if (request.status !== "open") {
        return res.status(400).json({ error: "Deze hulpvraag is niet meer open" });
      }

      // User must have a crew profile to apply
      const crewProfile = await storage.getCrewProfile(req.user!.id);
      if (!crewProfile) {
        return res.status(400).json({ 
          error: "Je moet eerst een flex-profiel aanmaken om te reageren" 
        });
      }

      const parsed = insertCrewApplicationSchema.safeParse({
        requestId: req.params.id,
        crewProfileId: crewProfile.id,
        message: req.body.message || null,
      });

      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }

      const application = await storage.createCrewApplication(parsed.data);
      res.status(201).json(application);
    } catch (error: any) {
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Kon reactie niet plaatsen" });
    }
  });

  app.get("/api/crew/my-applications", requireAuth, async (req, res) => {
    try {
      const crewProfile = await storage.getCrewProfile(req.user!.id);
      if (!crewProfile) {
        return res.json([]);
      }
      const applications = await storage.getCrewApplicationsByProfile(crewProfile.id);
      res.json(applications);
    } catch (error: any) {
      console.error("Error fetching my applications:", error);
      res.status(500).json({ error: "Kon mijn reacties niet laden" });
    }
  });

  app.put("/api/crew/applications/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["shortlisted", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Ongeldige status" });
      }

      // TODO: Add authorization check - only request owner can update status
      const updated = await storage.updateCrewApplication(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: "Reactie niet gevonden" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating application status:", error);
      res.status(500).json({ error: "Kon status niet bijwerken" });
    }
  });

  // =================================
  // BLOGS (public homepage content)
  // =================================

  // Public: Get published blogs for homepage (no auth required)
  app.get("/api/blogs/public", async (_req, res) => {
    try {
      const blogs = await storage.getPublishedBlogs(6);
      res.json(blogs);
    } catch (error: any) {
      console.error("Error fetching public blogs:", error);
      res.status(500).json({ error: "Kon blogs niet laden" });
    }
  });

  // Public: Get single blog by slug (no auth required)
  app.get("/api/blogs/public/:slug", async (req, res) => {
    try {
      const blog = await storage.getBlogBySlug(req.params.slug);
      if (!blog || blog.status !== "published") {
        return res.status(404).json({ error: "Blog niet gevonden" });
      }
      res.json(blog);
    } catch (error: any) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ error: "Kon blog niet laden" });
    }
  });

  // Admin: Get all blogs (requires admin)
  app.get("/api/blogs", requireAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const blogs = await storage.getBlogs(status);
      res.json(blogs);
    } catch (error: any) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ error: "Kon blogs niet laden" });
    }
  });

  // Admin: Get single blog by ID (requires admin)
  app.get("/api/blogs/:id", requireAdmin, async (req, res) => {
    try {
      const blog = await storage.getBlogById(req.params.id);
      if (!blog) {
        return res.status(404).json({ error: "Blog niet gevonden" });
      }
      res.json(blog);
    } catch (error: any) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ error: "Kon blog niet laden" });
    }
  });

  // Admin: Create blog (requires admin)
  app.post("/api/blogs", requireAdmin, async (req, res) => {
    try {
      const { insertBlogSchema } = await import("@shared/schema");
      const result = insertBlogSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const blog = await storage.createBlog({
        ...result.data,
        authorId: req.user!.id,
        authorName: [req.user!.firstName, req.user!.lastName].filter(Boolean).join(" ") || req.user!.email,
      });
      res.status(201).json(blog);
    } catch (error: any) {
      console.error("Error creating blog:", error);
      res.status(500).json({ error: "Kon blog niet aanmaken" });
    }
  });

  // Admin: Update blog (requires admin)
  app.put("/api/blogs/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateBlog(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Blog niet gevonden" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating blog:", error);
      res.status(500).json({ error: "Kon blog niet bijwerken" });
    }
  });

  // Admin: Delete blog (requires admin)
  app.delete("/api/blogs/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteBlog(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Blog niet gevonden" });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ error: "Kon blog niet verwijderen" });
    }
  });

  // ====== AFFILIATE SYSTEM ======
  
  // GET /api/affiliate - Get current user's affiliate info and stats
  app.get("/api/affiliate", requireAuth, async (req, res) => {
    try {
      const jwtUser = req.user!;
      // Get full user from database to access referralCode
      const fullUser = await storage.getUserById(jwtUser.id);
      if (!fullUser) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }
      
      const stats = await storage.getAffiliateStats(fullUser.id);
      
      res.json({
        referralCode: fullUser.referralCode,
        activeReferrals: stats.activeReferrals,
        totalCommission: stats.totalCommission,
        pendingCommission: stats.pendingCommission,
        paidCommission: stats.paidCommission,
        commissionRates: {
          basic: 2.95,
          pro: 4.00
        },
      });
    } catch (error: any) {
      console.error("Error fetching affiliate stats:", error);
      res.status(500).json({ error: "Kon affiliate gegevens niet laden" });
    }
  });
  
  // GET /api/affiliate/commissions - Get current user's commission history
  app.get("/api/affiliate/commissions", requireAuth, async (req, res) => {
    try {
      const jwtUser = req.user!;
      const userCommissions = await storage.getCommissionsByAffiliateId(jwtUser.id);
      
      // Enrich with referred user info
      const enrichedCommissions = await Promise.all(userCommissions.map(async (c) => {
        const referredUser = await storage.getUserById(c.referredUserId);
        return {
          ...c,
          referredEmail: referredUser?.email || "Onbekend",
          planDisplayName: c.plan === "pro" ? "Pro-bijdrager" : "Basis-lid",
        };
      }));
      
      res.json(enrichedCommissions);
    } catch (error: any) {
      console.error("Error fetching user commissions:", error);
      res.status(500).json({ error: "Kon commissies niet laden" });
    }
  });

  // POST /api/affiliate/generate-code - Generate a referral code for the current user if they don't have one
  app.post("/api/affiliate/generate-code", requireAuth, async (req, res) => {
    try {
      const jwtUser = req.user!;
      // Get full user from database
      const fullUser = await storage.getUserById(jwtUser.id);
      if (!fullUser) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }
      
      if (fullUser.referralCode) {
        return res.json({ referralCode: fullUser.referralCode });
      }
      
      // Generate unique referral code
      let code = generateReferralCode();
      let existingUser = await storage.getUserByReferralCode(code);
      let attempts = 0;
      while (existingUser && attempts < 10) {
        code = generateReferralCode();
        existingUser = await storage.getUserByReferralCode(code);
        attempts++;
      }
      
      if (existingUser) {
        return res.status(500).json({ error: "Kon geen unieke referral code genereren" });
      }
      
      // Update user with referral code
      await db.update(users).set({ referralCode: code }).where(eq(users.id, fullUser.id));
      
      res.json({ referralCode: code });
    } catch (error: any) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ error: "Kon referral code niet genereren" });
    }
  });

  // Admin: GET /api/admin/affiliates - Get all affiliate stats for CSV export
  app.get("/api/admin/affiliates", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAllAffiliateStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching all affiliate stats:", error);
      res.status(500).json({ error: "Kon affiliate statistieken niet laden" });
    }
  });

  // Admin: GET /api/admin/affiliates/csv - Download CSV export of affiliate stats
  app.get("/api/admin/affiliates/csv", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAllAffiliateStats();
      
      // Build CSV
      const header = "Email,Referral Code,Actieve Referrals,Openstaand (EUR),Uitbetaald (EUR),Totaal (EUR)\n";
      const rows = stats.map(s => 
        `"${s.email}","${s.referralCode}",${s.activeReferrals},${s.pendingCommission.toFixed(2)},${s.paidCommission.toFixed(2)},${s.totalCommission.toFixed(2)}`
      ).join("\n");
      
      const csv = header + rows;
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="affiliates-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csv);
    } catch (error: any) {
      console.error("Error generating affiliate CSV:", error);
      res.status(500).json({ error: "Kon CSV niet genereren" });
    }
  });
  
  // Admin: GET /api/admin/commissions - Get all commissions with filtering
  app.get("/api/admin/commissions", requireAdmin, async (req, res) => {
    try {
      const allCommissions = await storage.getAllCommissions();
      
      // Enrich with user info
      const enrichedCommissions = await Promise.all(allCommissions.map(async (c) => {
        const affiliateUser = await storage.getUserById(c.affiliateUserId);
        const referredUser = await storage.getUserById(c.referredUserId);
        return {
          ...c,
          affiliateEmail: affiliateUser?.email || "Onbekend",
          referredEmail: referredUser?.email || "Onbekend",
          planDisplayName: c.plan === "pro" ? "Pro-bijdrager" : "Basis-lid",
        };
      }));
      
      res.json(enrichedCommissions);
    } catch (error: any) {
      console.error("Error fetching all commissions:", error);
      res.status(500).json({ error: "Kon commissies niet laden" });
    }
  });
  
  // Admin: PATCH /api/admin/commissions/:id/status - Update commission status (approve/pay/cancel)
  app.patch("/api/admin/commissions/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["pending", "approved", "paid", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Ongeldige status" });
      }
      
      const commission = await storage.getCommissionById(id);
      if (!commission) {
        return res.status(404).json({ error: "Commissie niet gevonden" });
      }
      
      const paidAt = status === "paid" ? new Date() : undefined;
      const updatedCommission = await storage.updateCommissionStatus(id, status, paidAt);
      
      console.log(`✓ Commission ${id} status updated: ${commission.status} → ${status}`);
      
      res.json(updatedCommission);
    } catch (error: any) {
      console.error("Error updating commission status:", error);
      res.status(500).json({ error: "Kon commissie status niet bijwerken" });
    }
  });
  
  // Admin: POST /api/admin/commissions/bulk-pay - Mark multiple commissions as paid
  app.post("/api/admin/commissions/bulk-pay", requireAdmin, async (req, res) => {
    try {
      const { commissionIds } = req.body;
      
      if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
        return res.status(400).json({ error: "Geen commissies geselecteerd" });
      }
      
      const paidAt = new Date();
      const results = await Promise.all(commissionIds.map(async (id: string) => {
        try {
          const updated = await storage.updateCommissionStatus(id, "paid", paidAt);
          return { id, success: !!updated };
        } catch (e) {
          return { id, success: false };
        }
      }));
      
      const successCount = results.filter(r => r.success).length;
      console.log(`✓ Bulk commission payout: ${successCount}/${commissionIds.length} marked as paid`);
      
      res.json({ 
        success: true, 
        processed: results.length,
        successful: successCount,
        paidAt 
      });
    } catch (error: any) {
      console.error("Error bulk paying commissions:", error);
      res.status(500).json({ error: "Kon commissies niet uitbetalen" });
    }
  });
  
  // Admin: GET /api/admin/commissions/csv - Download CSV export of all commissions
  app.get("/api/admin/commissions/csv", requireAdmin, async (req, res) => {
    try {
      const allCommissions = await storage.getAllCommissions();
      
      // Enrich with user info
      const enrichedCommissions = await Promise.all(allCommissions.map(async (c) => {
        const affiliateUser = await storage.getUserById(c.affiliateUserId);
        const referredUser = await storage.getUserById(c.referredUserId);
        return {
          ...c,
          affiliateEmail: affiliateUser?.email || "Onbekend",
          referredEmail: referredUser?.email || "Onbekend",
        };
      }));
      
      // Build CSV
      const header = "Datum,Affiliate Email,Referred Email,Plan,Bedrag (EUR),Status,Uitbetaald Op\n";
      const rows = enrichedCommissions.map(c => 
        `"${new Date(c.createdAt).toLocaleDateString('nl-NL')}","${c.affiliateEmail}","${c.referredEmail}","${c.plan}",${c.amount.toFixed(2)},"${c.status}","${c.paidAt ? new Date(c.paidAt).toLocaleDateString('nl-NL') : '-'}"`
      ).join("\n");
      
      const csv = header + rows;
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="commissions-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csv);
    } catch (error: any) {
      console.error("Error generating commissions CSV:", error);
      res.status(500).json({ error: "Kon CSV niet genereren" });
    }
  });

  // Admin: POST /api/admin/create-user - Create user without payment (backdoor for friends/family)
  app.post("/api/admin/create-user", requireAdmin, async (req, res) => {
    try {
      const { email, firstName, lastName, plan } = req.body;

      if (!email || !plan) {
        return res.status(400).json({ error: "Email en plan zijn verplicht" });
      }

      if (!["basic", "pro"].includes(plan)) {
        return res.status(400).json({ error: "Plan moet 'basic' of 'pro' zijn" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "Er bestaat al een gebruiker met dit e-mailadres" });
      }

      const tempPassword = generateRandomPassword();
      const onboardingToken = generateOnboardingToken();
      const referralCode = generateReferralCode();
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const user = await storage.createUser({
        email,
        passwordHash,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        plan: plan as "basic" | "pro",
        role: "member",
        mustCompleteOnboarding: true,
        onboardingToken,
        referralCode,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await storage.createOnboardingToken({
        userId: user.id,
        token: onboardingToken,
        expiresAt,
      });

      const baseUrl = process.env.PUBLIC_BASE_URL || getBaseUrl(req);
      const onboardingLink = `${baseUrl}/first-login?token=${onboardingToken}`;

      const emailSent = await sendOnboardingEmail(email, tempPassword, onboardingLink, plan);

      console.log(`[Admin] User created by ${req.user!.email}: ${email} (${plan})`);
      console.log(`[Admin] Onboarding link: ${onboardingLink}`);

      res.status(201).json({
        message: "Gebruiker aangemaakt",
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        onboardingLink,
        emailSent,
      });
    } catch (error: any) {
      console.error("Error creating user via admin:", error);
      res.status(500).json({ error: "Kon gebruiker niet aanmaken" });
    }
  });

  app.post("/api/admin/resend-activation", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is verplicht" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
      }

      if (!user.mustCompleteOnboarding) {
        return res.status(400).json({ error: "Deze gebruiker heeft de onboarding al voltooid" });
      }

      await storage.deleteOnboardingTokensByUserId(user.id);

      const tempPassword = generateRandomPassword();
      const onboardingToken = generateOnboardingToken();
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      await storage.upsertUser({
        id: user.id,
        email: user.email,
        passwordHash,
        plan: user.plan as "basic" | "pro",
        role: user.role as "member" | "master" | "admin",
        mustCompleteOnboarding: true,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await storage.createOnboardingToken({
        userId: user.id,
        token: onboardingToken,
        expiresAt,
      });

      const baseUrl = process.env.PUBLIC_BASE_URL || getBaseUrl(req);
      const onboardingLink = `${baseUrl}/first-login?token=${onboardingToken}`;

      const emailSent = await sendOnboardingEmail(email, tempPassword, onboardingLink, user.plan || "basic");

      console.log(`[Admin] Activation resent by ${req.user!.email}: ${email}`);
      console.log(`[Admin] New onboarding link: ${onboardingLink}`);

      res.json({
        message: "Activatielink opnieuw verstuurd",
        onboardingLink,
        emailSent,
      });
    } catch (error: any) {
      console.error("Error resending activation:", error);
      res.status(500).json({ error: "Kon activatielink niet opnieuw versturen" });
    }
  });

  // ===================== Beleidsmonitor =====================
  app.get("/api/monitor-items", attachUser, async (req, res) => {
    try {
      const region = req.query.region as string | undefined;
      const items = await storage.getMonitorItems(region);
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching monitor items:", error);
      res.status(500).json({ error: "Kon beleidsmonitor items niet ophalen" });
    }
  });

  app.post("/api/monitor-items", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { region, title, summary, sourceUrl, tags } = req.body;
      if (!region || !title || !summary) {
        return res.status(400).json({ error: "Regio, titel en samenvatting zijn verplicht" });
      }
      const item = await storage.createMonitorItem({
        region,
        title,
        summary,
        sourceUrl: sourceUrl || null,
        tags: tags || "",
        createdByUserId: req.user!.id,
      });
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating monitor item:", error);
      res.status(500).json({ error: "Kon beleidsmonitor item niet aanmaken" });
    }
  });

  app.delete("/api/monitor-items/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteMonitorItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Item niet gevonden" });
      }
      res.json({ message: "Item verwijderd" });
    } catch (error: any) {
      console.error("Error deleting monitor item:", error);
      res.status(500).json({ error: "Kon item niet verwijderen" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
