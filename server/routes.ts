import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEntrepreneurSchema, strictEntrepreneurSchema, insertProposalSchema, insertVoteSchema, insertChatRoomSchema, insertChatMessageSchema, insertPostSchema, insertUserProfileSchema, insertSubscriptionSchema, insertBedrijfsprofielSchema, regioBotChatSchema, visibilitySettingsSchema, DEFAULT_VISIBILITY_SETTINGS, insertCrewProfileSchema, insertCrewRequestSchema, insertCrewApplicationSchema, CREW_CATEGORIES, users, ragDocuments, documents, insertRegioDealSchema, crewApplications, crewRequests, bedrijfsprofielen } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { createMollieClient } from "@mollie/api-client";
import { setupJwtAuth, attachUser, requireAuth, requireAdmin, requirePro, issueTokensForUser, clearTokenCookies, revokeAllUserTokens } from "./jwtAuth";
import { seedMasterAccount } from "./seed";
import { generateRandomPassword, generateOnboardingToken, getPlanPrice, getPlanDisplayName, generateReferralCode } from "./utils/auth";
import { sendOnboardingEmail, sendNotificationEmail } from "./services/emailService";
import bcrypt from "bcrypt";
import { uploadMemory, getDocumentType } from "./middleware/upload";
import { objectStorageClient } from "./replit_integrations/object_storage";
import { randomUUID } from "crypto";
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
  
  // Seed master account (idempotent - non-fatal if DB not yet ready)
  try {
    await seedMasterAccount();
  } catch (err) {
    console.error("[Startup] Seed skipped — DB may not be ready:", (err as Error).message);
  }
  
  // Attach user to all requests (makes req.user available)
  app.use(attachUser);
  
  // Register object storage routes for user file uploads
  registerObjectStorageRoutes(app, requireAuth);
  
  // BLOK 2: Mollie Payment Flow (Basic €19 / Pro €49 ex btw)
  
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
          // 25% (Basis) of 35% (Pro) over eerste 3 maanden
          const { calculateAffiliatePayout } = await import("@shared/pricing");
          const planKey = plan === "pro" ? "pro" : "basis";
          const commissionAmount = calculateAffiliatePayout(planKey).totalPayoutExVat;
          
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

  // ── Ondernemer Thema's ───────────────────────────────────────────────────
  // Public endpoint — no auth required
  app.get("/api/intel/themas", async (_req, res) => {
    try {
      const themas = await storage.getOndernemerThemas();
      res.json(themas);
    } catch (error) {
      console.error("[API] /api/intel/themas fout:", error);
      res.status(500).json({ error: "Fout bij ophalen thema's" });
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
      console.warn("Stats endpoint: DB unavailable, returning fallback");
      res.json({ totalMembers: 0, totalCollaborations: 0, totalRegions: 0, monthlyGrowth: 0 });
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
  app.post("/api/regiobot/upload", requireAuth, checkDailyUploadLimit, uploadMemory.single('file'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Niet geauthenticeerd" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Geen bestand geüpload" });
      }

      // Determine document type from mime type
      const docType = getDocumentType(req.file.mimetype);

      // Upload buffer to Object Storage (private dir) instead of local disk
      const privateDir = process.env.PRIVATE_OBJECT_DIR || "";
      let storedPath = `local:${req.user.id}/${req.file.originalname}`;

      if (privateDir) {
        const ext = req.file.originalname.substring(req.file.originalname.lastIndexOf("."));
        const objectId = randomUUID();
        const fullPath = `${privateDir}/regiobot-docs/${req.user.id}/${objectId}${ext}`;
        const parts = fullPath.replace(/^\//, "").split("/");
        const bucketName = parts[0];
        const objectName = parts.slice(1).join("/");

        const bucket = objectStorageClient.bucket(bucketName);
        const gcsFile = bucket.file(objectName);
        await gcsFile.save(req.file.buffer, { contentType: req.file.mimetype });
        storedPath = `/${fullPath.replace(/^\//, "")}`;
      }

      // Store document metadata in database
      const document = await storage.createDocument({
        userId: req.user.id,
        filePath: storedPath,
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

  // Rate limiter for public RegioBot endpoint (5 requests per IP per minute)
  const buurmanRateLimit = new Map<string, { count: number; resetAt: number }>();
  const BUURMAN_RATE_WINDOW = 60_000;
  const BUURMAN_RATE_MAX = 5;

  // Digitale Buurman - quick RegioBot for dashboard (public, no auth needed)
  app.post("/api/regiobot/buurman", async (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const entry = buurmanRateLimit.get(ip);
      if (entry && now < entry.resetAt) {
        if (entry.count >= BUURMAN_RATE_MAX) {
          return res.status(429).json({ error: "Te veel verzoeken. Probeer het over een minuut opnieuw." });
        }
        entry.count++;
      } else {
        buurmanRateLimit.set(ip, { count: 1, resetAt: now + BUURMAN_RATE_WINDOW });
      }
      // Clean old entries periodically
      if (buurmanRateLimit.size > 1000) {
        for (const [key, val] of buurmanRateLimit) {
          if (now > val.resetAt) buurmanRateLimit.delete(key);
        }
      }

      const { beroep, stad, vraag } = req.body;
      if (!beroep || !stad || typeof beroep !== "string" || typeof stad !== "string") {
        return res.status(400).json({ error: "Beroep en stad zijn verplicht" });
      }
      if (beroep.length > 100 || stad.length > 100 || (vraag && typeof vraag === "string" && vraag.length > 500)) {
        return res.status(400).json({ error: "Invoer te lang" });
      }

      const systemPrompt = `Je bent de scherpste regionale marktanalist van Nederland, werkzaam voor OpenRegio. Je geeft ondernemers inzichten die ze nergens anders zo snel en concreet kunnen vinden — niet op Google, niet bij de Kamer van Koophandel, niet bij hun accountant.

Jouw analyse bevat altijd:
1. MARKTKLIMAAT: Specifiek voor de genoemde stad/gemeente — hoe is de vraag, is de markt verzadigd of onderbenut? Noem concrete omstandigheden of recente gemeentelijke ontwikkelingen indien relevant (herontwikkeling, bevolkingsgroei, winkelleegstand etc).
2. KANS: De meest onderbenutte niche of het meest concrete kansgebied voor dit beroep in deze regio. Zo specifiek mogelijk — denk aan doelgroepsegment, wijk, samenwerking, of onbediende vraag.
3. RISICO: Eén concreet risico of aandachtspunt dat deze ondernemer in dit gebied nu loopt — denk aan concurrentie, regelgeving, demografische verschuiving of markttrend.
4. ACTIE: De eerste concrete stap die de ondernemer deze week kan zetten. Noem een specifieke actie (bijv. een organisatie benaderen, een aanvraag indienen, een wijk of markt opzoeken).
5. LOKALE TIP: Eén insider-tip over de lokale markt of gemeente die niet op de eerste Google-pagina staat — bijv. een samenwerkingsverband, een lokaal initiatief, een gemeentelijk subsidieprogramma, of een ontwikkeling in de buurt.

Formatteer je antwoord EXACT zo (gebruik deze labels letterlijk):
MARKTKLIMAAT: [inhoud]
KANS: [inhoud]
RISICO: [inhoud]
ACTIE: [inhoud]
LOKALE TIP: [inhoud]

Schrijf in het Nederlands. Toon: scherp, concreet, als een insider die de regio kent. Geen algemene open deuren. Elke zin moet informatiewaarde hebben die de ondernemer nergens anders zo snel vindt.`;

      const userPrompt = vraag 
        ? `Analyseer de regionale positie voor een ${beroep} in ${stad}. Specifieke vraag: "${vraag}". Geef een scherpe, lokaal-specifieke analyse.`
        : `Analyseer de regionale positie voor een ${beroep} in ${stad}. Geef een scherpe, lokaal-specifieke analyse.`;

      // Try Gemini first, fallback to OpenAI
      let antwoordText = "";
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({
          apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
          httpOptions: {
            apiVersion: "",
            baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL!,
          },
        });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
          ],
          config: {
            maxOutputTokens: 1400,
            temperature: 0.8,
            thinkingConfig: { thinkingBudget: 0 },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && parts.length > 0) {
          antwoordText = parts
            .filter((p: any) => p.text && !p.thought)
            .map((p: any) => p.text)
            .join("");
        }
        if (!antwoordText) {
          antwoordText = response.text || "";
        }
        console.log("[RegioBot] Gemini response length:", antwoordText.length);
      } catch (geminiErr) {
        console.error("[RegioBot] Gemini failed, trying OpenAI fallback:", geminiErr);
        
        if (process.env.OPENAI_API_KEY) {
          const OpenAI = (await import("openai")).default;
          const openai = new OpenAI();
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 900,
            temperature: 0.8,
          });
          antwoordText = completion.choices[0]?.message?.content || "";
        } else {
          antwoordText = `Hoi ${beroep}! In ${stad} zijn er altijd kansen voor lokale ondernemers. Check de Beleidsmonitor voor actuele ontwikkelingen in jouw regio, of stel een gerichte vraag via de uitgebreide RegioBot (Pro).`;
        }
      }

      const antwoord = antwoordText || "Ik kon helaas geen antwoord genereren. Probeer het later opnieuw.";
      res.json({ antwoord });
    } catch (err: any) {
      console.error("Buurman error:", err);
      res.status(500).json({ error: "Kon geen antwoord genereren" });
    }
  });

  // Regelgeving-check - publieke endpoint voor homepage (rate-limited)
  const regelgevingRateLimit = new Map<string, { count: number; resetAt: number }>();
  const REGELGEVING_RATE_WINDOW = 60_000;
  const REGELGEVING_RATE_MAX = 5;

  app.post("/api/regelgeving/check", async (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const entry = regelgevingRateLimit.get(ip);
      if (entry && now < entry.resetAt) {
        if (entry.count >= REGELGEVING_RATE_MAX) {
          return res.status(429).json({ error: "Te veel verzoeken. Probeer het over een minuut opnieuw." });
        }
        entry.count++;
      } else {
        regelgevingRateLimit.set(ip, { count: 1, resetAt: now + REGELGEVING_RATE_WINDOW });
      }
      if (regelgevingRateLimit.size > 1000) {
        for (const [key, val] of regelgevingRateLimit) {
          if (now > val.resetAt) regelgevingRateLimit.delete(key);
        }
      }

      const { branche, onderwerp } = req.body;
      if (!branche || !onderwerp || typeof branche !== "string" || typeof onderwerp !== "string") {
        return res.status(400).json({ error: "Branche en onderwerp zijn verplicht" });
      }
      if (branche.length > 150 || onderwerp.length > 150) {
        return res.status(400).json({ error: "Invoer te lang" });
      }

      const systemPrompt = `Je bent een scherpzinnige regelgeving-analist voor OpenRegio, gespecialiseerd in Nederlandse wet- en regelgeving voor ondernemers. Je geeft ondernemers inzicht dat ze bij de gemiddelde adviseur pas na een uur uitleg krijgen — direct, to-the-point en volledig toepasbaar.

Jouw analyse bevat altijd:
1. WETTELIJK KADER: Welke specifieke Nederlandse wetten, besluiten of verordeningen van toepassing zijn. Noem ze bij naam (bijv. "Omgevingswet", "Wet open overheid (Woo)", "Drank- en Horecawet", "AVG", "Besluit bouwwerken leefomgeving"). Leg uit wat de wet precies inhoudt in dit geval.
2. PRAKTIJK: Wat dit in de praktijk betekent voor een ondernemer in deze branche — welke vergunningen, meldingen of toestemmingen zijn verplicht? Wat gaat er in de praktijk weleens mis?
3. RISICO: Wat zijn de concrete risico's als je dit niet goed regelt? Denk aan boetes, handhaving, intrekking vergunning, aansprakelijkheid. Noem concrete consequenties.
4. ACTIE: De eerste concrete stap die de ondernemer NU kan zetten — een specifiek loket, formulier, aanvraag of overleg. Noem waar je naartoe moet (gemeente, RVO, Omgevingsloket, etc.).
5. SLIMME TIP: Een minder bekende maar waardevolle tip over dit onderwerp — bijv. een bezwaarmogelijkheid, een Woo-verzoek om informatie op te vragen, een subsidie of een overheidsregeling die de meeste ondernemers missen.

Formatteer je antwoord EXACT zo (gebruik deze labels letterlijk):
WETTELIJK KADER: [inhoud]
PRAKTIJK: [inhoud]
RISICO: [inhoud]
ACTIE: [inhoud]
SLIMME TIP: [inhoud]

Schrijf in het Nederlands. Toon: helder, gezaghebbend, praktisch. Geef geen juridisch advies maar wel scherpe duiding. Elke sectie moet concreet en informatierijk zijn.`;

      const userPrompt = `Branche: ${branche}. Regelgevingsonderwerp: ${onderwerp}. Geef een scherpe, praktische regelgeving-analyse voor deze ondernemer.`;

      let antwoordText = "";
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({
          apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
          httpOptions: {
            apiVersion: "",
            baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL!,
          },
        });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
          ],
          config: {
            maxOutputTokens: 1400,
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && parts.length > 0) {
          antwoordText = parts
            .filter((p: any) => p.text && !p.thought)
            .map((p: any) => p.text)
            .join("");
        }
        if (!antwoordText) antwoordText = response.text || "";
      } catch (geminiErr) {
        console.error("[Regelgeving] Gemini failed, trying OpenAI fallback:", geminiErr);
        if (process.env.OPENAI_API_KEY) {
          const OpenAI = (await import("openai")).default;
          const openai = new OpenAI();
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 900,
            temperature: 0.7,
          });
          antwoordText = completion.choices[0]?.message?.content || "";
        } else {
          antwoordText = `Voor ${branche} in het kader van ${onderwerp} zijn er specifieke regels van toepassing. Controleer de relevante wetgeving via wetten.overheid.nl of vraag een uittreksel op via de Wet open overheid (Woo). Neem contact op met uw gemeente of de bevoegde toezichthouder voor een concreet advies.`;
        }
      }

      const antwoord = antwoordText || "Ik kon helaas geen antwoord genereren. Probeer het later opnieuw.";
      res.json({ antwoord });
    } catch (err: any) {
      console.error("Regelgeving check error:", err);
      res.status(500).json({ error: "Kon geen antwoord genereren" });
    }
  });

  // Brief Analyse - gestructureerde analyse van overheidsbrieven
  app.post("/api/brief-analyse", requireAuth, async (req, res) => {
    try {
      const { tekst } = req.body;
      if (!tekst || typeof tekst !== "string" || tekst.trim().length < 20) {
        return res.status(400).json({ error: "Tekst te kort of ontbrekend (minimaal 20 tekens)" });
      }
      if (tekst.length > 8000) {
        return res.status(400).json({ error: "Tekst te lang (maximaal 8000 tekens)" });
      }

      const systemPrompt = `Je bent een expert in Nederlandse overheidsdocumenten en bestuursrecht.
Analyseer de gegeven tekst van een overheidsbrief of besluit en geef de volgende informatie terug als valide JSON (geen extra tekst, alleen JSON):

{
  "afzender": "naam van de organisatie die de brief stuurde",
  "documentType": "type document, bijv. Besluit, Aanschrijving, Vergunning, WOO-reactie, Beschikking",
  "juridischeBasis": "de genoemde wettelijke grondslag of wet, bijv. Awb artikel 4:5, Omgevingswet",
  "bevoegdheid": "wie het bevoegd gezag is, bijv. College van B&W, burgemeester, minister",
  "termijn": "relevante termijn, bijv. Bezwaar binnen 6 weken, Reageer voor 15 maart",
  "aanbevolenActie": "kort advies wat de ontvanger kan of moet doen"
}

Gebruik "Onbekend" als een veld niet uit de tekst af te leiden is. Schrijf in het Nederlands. Geef alleen de JSON terug, geen inleidende tekst.`;

      let resultaatText = "";

      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({
          apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
          httpOptions: {
            apiVersion: "",
            baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL!,
          },
        });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\nTEKST:\n${tekst.trim()}` }] },
          ],
          config: {
            maxOutputTokens: 800,
            temperature: 0.3,
            thinkingConfig: { thinkingBudget: 0 },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && parts.length > 0) {
          resultaatText = parts.filter((p: any) => p.text && !p.thought).map((p: any) => p.text).join("");
        }
        if (!resultaatText) resultaatText = response.text || "";
      } catch (geminiErr) {
        console.error("[BriefAnalyse] Gemini failed:", geminiErr);
        if (process.env.OPENAI_API_KEY) {
          const OpenAI = (await import("openai")).default;
          const openai = new OpenAI();
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `TEKST:\n${tekst.trim()}` },
            ],
            max_tokens: 600,
            temperature: 0.3,
          });
          resultaatText = completion.choices[0]?.message?.content || "";
        } else {
          throw geminiErr;
        }
      }

      const jsonMatch = resultaatText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("[BriefAnalyse] No JSON in response:", resultaatText.substring(0, 200));
        return res.status(500).json({ error: "Kon de analyse niet verwerken" });
      }

      const resultaat = JSON.parse(jsonMatch[0]);
      res.json(resultaat);
    } catch (err: any) {
      console.error("[BriefAnalyse] Error:", err);
      res.status(500).json({ error: "Analyse mislukt" });
    }
  });

  // Brief Analyse — bestand uploaden (PDF / afbeelding / tekst)
  app.post("/api/brief-analyse/upload", requireAuth, uploadMemory.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Geen bestand ontvangen" });

      const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "text/plain"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Bestandstype niet ondersteund. Upload een PDF, afbeelding (JPG/PNG) of tekstbestand." });
      }

      const { extractTextFromPDF } = await import("./rag/extract");
      const { extractTextFromImage } = await import("./rag/ocr");

      let tekst = "";
      const isImage = file.mimetype.startsWith("image/");
      const isText = file.mimetype === "text/plain";

      if (isImage) {
        const ocr = await extractTextFromImage(file.buffer);
        tekst = ocr.text;
      } else if (isText) {
        tekst = file.buffer.toString("utf-8");
      } else {
        const pdf = await extractTextFromPDF(file.buffer);
        tekst = pdf.text;
      }

      if (!tekst || tekst.trim().length < 20) {
        return res.status(400).json({ error: "Geen tekst gevonden in het bestand. Probeer een duidelijker document." });
      }

      const tekst8k = tekst.slice(0, 8000);

      const systemPrompt = `Je bent een expert in Nederlandse overheidsdocumenten en bestuursrecht.
Analyseer de gegeven tekst van een overheidsbrief of besluit en geef de volgende informatie terug als valide JSON (geen extra tekst, alleen JSON):

{
  "afzender": "naam van de organisatie die de brief stuurde",
  "documentType": "type document, bijv. Besluit, Aanschrijving, Vergunning, WOO-reactie, Beschikking",
  "juridischeBasis": "de genoemde wettelijke grondslag of wet, bijv. Awb artikel 4:5, Omgevingswet",
  "bevoegdheid": "wie het bevoegd gezag is, bijv. College van B&W, burgemeester, minister",
  "termijn": "relevante termijn, bijv. Bezwaar binnen 6 weken, Reageer voor 15 maart",
  "aanbevolenActie": "kort advies wat de ontvanger kan of moet doen"
}

Gebruik "Onbekend" als een veld niet uit de tekst af te leiden is. Schrijf in het Nederlands. Geef alleen de JSON terug, geen inleidende tekst.`;

      let resultaatText = "";
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({
          apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
          httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL! },
        });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nTEKST:\n${tekst8k}` }] }],
          config: { maxOutputTokens: 800, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } },
        });
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && parts.length > 0) resultaatText = parts.filter((p: any) => p.text && !p.thought).map((p: any) => p.text).join("");
        if (!resultaatText) resultaatText = response.text || "";
      } catch (geminiErr) {
        console.error("[BriefAnalyse/upload] Gemini failed:", geminiErr);
        if (process.env.OPENAI_API_KEY) {
          const OpenAI = (await import("openai")).default;
          const openai = new OpenAI();
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `TEKST:\n${tekst8k}` }],
            max_tokens: 600, temperature: 0.3,
          });
          resultaatText = completion.choices[0]?.message?.content || "";
        } else throw geminiErr;
      }

      const jsonMatch = resultaatText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return res.status(500).json({ error: "Kon de analyse niet verwerken" });

      res.json(JSON.parse(jsonMatch[0]));
    } catch (err: any) {
      console.error("[BriefAnalyse/upload] Error:", err);
      res.status(500).json({ error: "Analyse mislukt" });
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
      console.warn("WOO regions: DB unavailable, returning empty list");
      res.json([]);
    }
  });

  app.get("/api/woo/authorities", async (_req, res) => {
    try {
      const authorities = await storage.getWooAuthorities();
      res.json(authorities);
    } catch (err: any) {
      console.warn("WOO authorities: DB unavailable, returning empty list");
      res.json([]);
    }
  });

  // WOO Categories - get allowed categories for dropdown
  app.get("/api/woo/categories", async (_req, res) => {
    try {
      const categories = await storage.getWooCategories();
      res.json(categories);
    } catch (err: any) {
      console.warn("WOO categories: DB unavailable, returning empty list");
      res.json([]);
    }
  });

  // WOO Library - public collective library for RegioBot dossier selector with filters
  app.get("/api/woo/library", async (req, res) => {
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
      const { authority, subject, context, requestedDocuments, generatedLetter, checklist, status,
              senderName, senderAddress, senderPostcode } = req.body;

      if (!authority || !subject || !generatedLetter) {
        return res.status(400).json({
          error: "Onvolledige aanvraag",
          details: "Bestuursorgaan, onderwerp en gegenereerde brief zijn verplicht."
        });
      }

      const { encryptField } = await import("./utils/woo-crypto");

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 28);

      const dossier = await storage.createWooDossier({
        userId: req.user!.id,
        authority,
        subject,
        context: context || null,
        requestedDocuments: requestedDocuments || null,
        generatedLetter,
        checklist: checklist || null,
        status: status || "sent",
        senderNameEncrypted: encryptField(senderName),
        senderAddressEncrypted: encryptField(senderAddress),
        senderPostcodeEncrypted: encryptField(senderPostcode),
        deadline,
      });

      res.status(201).json(dossier);
    } catch (err: any) {
      console.error("Create dossier error:", err);
      res.status(500).json({ error: "Dossier opslaan mislukt" });
    }
  });

  app.get("/api/woo/dossiers", requireAuth, async (req, res) => {
    try {
      const { decryptField } = await import("./utils/woo-crypto");
      const dossiers = await storage.getWooDossiers(req.user!.id);
      const decrypted = dossiers.map((d) => ({
        ...d,
        senderName: decryptField(d.senderNameEncrypted),
        senderAddress: decryptField(d.senderAddressEncrypted),
        senderPostcode: decryptField(d.senderPostcodeEncrypted),
        senderNameEncrypted: undefined,
        senderAddressEncrypted: undefined,
        senderPostcodeEncrypted: undefined,
      }));
      res.json(decrypted);
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

      const { decryptField } = await import("./utils/woo-crypto");
      res.json({
        ...dossier,
        senderName: decryptField(dossier.senderNameEncrypted),
        senderAddress: decryptField(dossier.senderAddressEncrypted),
        senderPostcode: decryptField(dossier.senderPostcodeEncrypted),
        senderNameEncrypted: undefined,
        senderAddressEncrypted: undefined,
        senderPostcodeEncrypted: undefined,
      });
    } catch (err: any) {
      console.error("Get dossier error:", err);
      res.status(500).json({ error: "Dossier ophalen mislukt" });
    }
  });

  // POST /api/woo/dossiers/:id/ingebreke — dwangsom contract accepteren + ingebrekestelling brief genereren
  app.post("/api/woo/dossiers/:id/ingebreke", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Ongeldig dossier ID" });
      }

      const { contractAccepted } = req.body;
      if (!contractAccepted) {
        return res.status(400).json({ error: "Je moet akkoord gaan met de voorwaarden om door te gaan." });
      }

      const dossier = await storage.getWooDossier(id, req.user!.id);
      if (!dossier) {
        return res.status(404).json({ error: "Dossier niet gevonden" });
      }

      if (dossier.status === "ingebreke_gesteld") {
        return res.status(409).json({ error: "Dit dossier is al in gebreke gesteld." });
      }

      if (["response_received", "closed"].includes(dossier.status ?? "")) {
        return res.status(409).json({ error: "Dit dossier is al afgerond." });
      }

      // Enforce 28-day wait — wettelijke beslistermijn must have passed
      if (dossier.createdAt) {
        const cutoff = new Date(dossier.createdAt);
        cutoff.setDate(cutoff.getDate() + 28);
        if (new Date() < cutoff) {
          const daysLeft = Math.ceil((cutoff.getTime() - Date.now()) / 86400000);
          return res.status(422).json({
            error: `De wettelijke beslistermijn van 28 dagen is nog niet verstreken. Nog ${daysLeft} dag${daysLeft !== 1 ? "en" : ""} te gaan.`,
          });
        }
      }

      const { decryptField } = await import("./utils/woo-crypto");
      const senderName = decryptField(dossier.senderNameEncrypted) || "[Naam afzender]";
      const senderAddress = decryptField(dossier.senderAddressEncrypted) || "";
      const senderPostcode = decryptField(dossier.senderPostcodeEncrypted) || "";

      const vandaag = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
      const uiterlijk = new Date();
      uiterlijk.setDate(uiterlijk.getDate() + 14);
      const uiterlijkStr = uiterlijk.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

      const ingebrekeletter = `INGEBREKESTELLING

Afzender:
${senderName}
${senderAddress}
${senderPostcode}

Aan:
${dossier.authority}

Betreft: Ingebrekestelling ex art. 4:17 Awb — Woo-verzoek inzake ${dossier.subject}

${vandaag}

Geacht bestuur,

Op grond van mijn Woo-verzoek d.d. ${dossier.createdAt ? new Date(dossier.createdAt).toLocaleDateString("nl-NL") : "[datum verzoek]"} inzake ${dossier.subject} had u conform art. 4.4 Wet open overheid uiterlijk binnen vier weken te beslissen.

Tot op heden heb ik geen beslissing ontvangen. Hiermee bent u in verzuim.

Op grond van artikel 4:17 Awb stel ik u hierbij formeel in gebreke. U heeft twee weken de tijd om alsnog een beslissing te nemen. Dit betekent dat u uiterlijk op ${uiterlijkStr} een besluit dient te nemen.

Indien u niet tijdig beslist, verbeurt u een dwangsom van €100 per dag voor de eerste 14 dagen, €200 per dag voor de volgende 14 dagen, en €300 per dag daarna, met een maximum van €1.400,-- (art. 4:17 lid 3 Awb).

Ik verzoek u deze ingebrekestelling schriftelijk te bevestigen.

Hoogachtend,


[Handtekening]
${senderName}`;

      const now = new Date();
      await storage.updateWooDossier(id, req.user!.id, {
        status: "ingebreke_gesteld",
        ingebrekeSentAt: now,
        dwangsomContractAcceptedAt: now,
      });

      res.json({ ingebrekeletter });
    } catch (err: any) {
      console.error("Ingebrekestelling error:", err);
      res.status(500).json({ error: "Ingebrekestelling aanmaken mislukt" });
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
  app.get("/api/user-profile/:id", requireAuth, async (req, res) => {
    try {
      const requestedId = req.params.id;
      const caller = req.user as any;
      if (caller.id !== requestedId && !caller.isAdmin) {
        return res.status(403).json({ error: "Toegang geweigerd" });
      }
      const profile = await storage.getUserProfile(requestedId);
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.get("/api/user-profile/email/:email", requireAuth, requireAdmin, async (req, res) => {
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

  app.post("/api/user-profile", requireAuth, async (req, res) => {
    try {
      const caller = req.user as any;
      const bodyUserId = typeof req.body.userId === "string" ? req.body.userId : null;
      const validatedData = insertUserProfileSchema.parse(req.body);
      if (bodyUserId && bodyUserId !== caller.id && !caller.isAdmin) {
        return res.status(403).json({ error: "Toegang geweigerd" });
      }
      const profile = await storage.createUserProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user profile" });
    }
  });

  app.patch("/api/user-profile/:id", requireAuth, async (req, res) => {
    try {
      const requestedId = req.params.id;
      const caller = req.user as any;
      if (caller.id !== requestedId && !caller.isAdmin) {
        return res.status(403).json({ error: "Toegang geweigerd" });
      }
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateUserProfile(requestedId, validatedData);
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
  app.post("/api/billing/create-checkout", requireAuth, async (req, res) => {
    try {
      if (!mollieClient) {
        return res.status(503).json({ error: "Payment provider not configured. Please contact administrator." });
      }

      const userId = (req.user as any).id;

      // Validate request with Zod — userId comes from session, not body
      const checkoutSchema = z.object({
        plan: z.enum(["basic", "pro"], { required_error: "plan must be 'basic' or 'pro'" }),
        returnUrl: z.string().url().optional()
      });

      const validatedData = checkoutSchema.parse(req.body);
      const { plan, returnUrl } = validatedData;

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

      // Canonical public URL for webhooks and redirects
      const publicUrl = process.env.PUBLIC_BASE_URL || getBaseUrl(req);

      // Create first payment to establish mandate
      const firstPayment = await mollieClient.payments.create({
        amount: {
          currency: "EUR",
          value: getPlanPrice(plan)
        },
        customerId: customer.id,
        sequenceType: "first" as any,
        description: `OpenRegio ${plan === "pro" ? "Pro" : "Basic"} lidmaatschap`,
        redirectUrl: returnUrl || `${publicUrl}/lidmaatschap`,
        webhookUrl: `${publicUrl}/api/webhooks/mollie`,
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

  app.get("/api/billing/subscription", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      // Haal het laatste actieve abonnement op voor deterministische resultaten
      const subscription = await storage.getActiveSubscription(userId);
      
      if (!subscription) {
        return res.status(404).json({ error: "No subscription found" });
      }

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // POST /api/subscription/cancel — Zelfbediening opzeggen (requireAuth)
  app.post("/api/subscription/cancel", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.id as string;

      // Alleen Pro-leden kunnen opzeggen
      if (user.plan !== "pro") {
        return res.status(403).json({ error: "Alleen Pro-leden kunnen een abonnement opzeggen" });
      }

      // Haal het laatste actieve abonnement op
      const subscription = await storage.getActiveSubscription(userId);

      if (!subscription) {
        return res.status(404).json({ error: "Geen actief abonnement gevonden" });
      }

      // Fail-closed: Mollie-client is vereist om opzeggen veilig te verwerken
      if (!mollieClient) {
        return res.status(503).json({ error: "Betalingssysteem niet beschikbaar. Neem contact op met info@openregio.nl." });
      }

      // Fail-closed: Mollie-abonnementsgegevens zijn vereist
      if (!subscription.mollieCustomerId || !subscription.mollieSubscriptionId) {
        return res.status(400).json({ error: "Abonnementsgegevens incompleet. Neem contact op via info@openregio.nl." });
      }

      // Cancel het recurring Mollie-abonnement — gooit een fout als dit mislukt
      await mollieClient.customerSubscriptions.cancel(
        subscription.mollieSubscriptionId,
        { customerId: subscription.mollieCustomerId }
      );
      console.log(`✓ Mollie subscription cancelled: ${subscription.mollieSubscriptionId}`);

      // Markeer abonnement als gecanceld in de database
      await storage.cancelSubscription(subscription.id);

      // Zet plan terug naar basic
      await storage.updateUserPlan(userId, "basic");

      // Stuur bevestigingsmail
      const firstName = user.firstName || user.email.split("@")[0];
      await sendNotificationEmail(
        user.email,
        "Je Pro-abonnement is opgezegd",
        `Je hebt je Pro-abonnement bij OpenRegio opgezegd. Je Pro-toegang is per direct beëindigd en je account is omgezet naar het Basis-abonnement.\n\nWil je later opnieuw upgraden? Dat kan altijd via openregio.nl/lidmaatschap.\n\nHeb je vragen? Neem dan contact op via info@openregio.nl.`,
        firstName
      );

      console.log(`✓ Abonnement opgezegd voor user ${userId} (${user.email})`);

      res.json({ success: true, message: "Abonnement succesvol opgezegd" });
    } catch (error: any) {
      console.error("Fout bij opzeggen abonnement:", error);
      res.status(500).json({ error: "Fout bij opzeggen abonnement. Probeer het later opnieuw." });
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

      const userId = (req.user as any).id;
      const isAdmin = (req.user as any).isAdmin;

      // Resolve ownership: application → crewRequest → bedrijfsprofiel → gebruikerId
      const [ownerRow] = await db
        .select({ gebruikerId: bedrijfsprofielen.gebruikerId })
        .from(crewApplications)
        .innerJoin(crewRequests, eq(crewApplications.requestId, crewRequests.id))
        .innerJoin(bedrijfsprofielen, eq(crewRequests.businessId, bedrijfsprofielen.id))
        .where(eq(crewApplications.id, req.params.id));

      if (!ownerRow) {
        return res.status(404).json({ error: "Reactie niet gevonden" });
      }

      if (!isAdmin && ownerRow.gebruikerId !== userId) {
        return res.status(403).json({ error: "Geen toegang" });
      }

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
      console.warn("Public blogs: DB unavailable, returning empty list");
      res.json([]);
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
          basic: 14.25,
          pro: 51.45,
          basicPercent: 25,
          proPercent: 35,
          months: 3,
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

  // ──────────────────────────────────────────────────────────────────────────
  // TenderNed integratie — publieke aanbestedingen per gemeente
  // ──────────────────────────────────────────────────────────────────────────
  const tenderCache = new Map<string, { data: any; expiresAt: number }>();
  const TENDER_TTL_MS = 15 * 60 * 1000; // 15 minuten
  const TENDERNED_URL = "https://www.tenderned.nl/papi/tenderned-rs-tns/v2/publicaties";

  async function fetchTenderPage(page: number, size: number): Promise<any[]> {
    const url = `${TENDERNED_URL}?page=${page}&size=${size}`;
    const cacheKey = `page_${page}_${size}`;
    const cached = tenderCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const res = await fetch(url, {
      headers: { "User-Agent": "OpenRegio/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`TenderNed responded with ${res.status}`);
    const json: any = await res.json();
    const items = json.content ?? json.publicaties ?? json.items ?? [];
    tenderCache.set(cacheKey, { data: items, expiresAt: Date.now() + TENDER_TTL_MS });
    return items;
  }

  app.get("/api/tenderned/aanbestedingen", requireAuth, async (req, res) => {
    const gemeente = (req.query.gemeente as string || "").trim();
    if (!gemeente) {
      return res.status(400).json({ error: "Gemeente is verplicht" });
    }
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const gemeenteLc = gemeente.toLowerCase();

    try {
      // Haal 4 pagina's op (max size=100 per pagina = 400 resultaten totaal)
      const [page0, page1, page2, page3] = await Promise.all([
        fetchTenderPage(0, 100),
        fetchTenderPage(1, 100),
        fetchTenderPage(2, 100),
        fetchTenderPage(3, 100),
      ]);
      const all = [...page0, ...page1, ...page2, ...page3];

      const matched = all
        .filter((p: any) => (p.opdrachtgeverNaam ?? "").toLowerCase().includes(gemeenteLc))
        .slice(0, limit)
        .map((p: any) => {
          const deadline = p.sluitingsDatum ? p.sluitingsDatum.split("T")[0] : null;
          return {
            id: String(p.publicatieId ?? p.kenmerk ?? Math.random()),
            title: p.aanbestedingNaam ?? "Onbekende titel",
            buyer: p.opdrachtgeverNaam ?? "",
            type: p.typeOpdracht?.omschrijving ?? null,
            procedure: p.procedure?.omschrijving ?? null,
            description: p.opdrachtBeschrijving ?? null,
            deadline,
            daysLeft: typeof p.aantalDagenTotSluitingsDatum === "number"
              ? p.aantalDagenTotSluitingsDatum
              : null,
            publicationDate: p.publicatieDatum ?? null,
            url: p.link?.href ?? null,
          };
        });

      res.json({ gemeente, count: matched.length, items: matched });
    } catch (err: any) {
      console.error("TenderNed fout:", err.message);
      res.status(503).json({
        error: "TenderNed tijdelijk niet bereikbaar. Probeer het later opnieuw.",
      });
    }
  });

  // Gemeente-updates — officiële publicaties via KOOP SRU API (overheid.nl)
  // ──────────────────────────────────────────────────────────────────────────
  const gemeenteUpdatesCache = new Map<string, { data: any; expiresAt: number }>();
  const GEMEENTE_TTL_MS = 30 * 60 * 1000; // 30 minuten
  const SRU_BASE = "https://repository.overheid.nl/sru";

  function extractSruField(xml: string, field: string): string[] {
    const results: string[] = [];
    const re = new RegExp(`<(?:dcterms:|gzd:|dc:)?${field}[^>]*>([^<]+)<`, "g");
    let m;
    while ((m = re.exec(xml)) !== null) {
      results.push(m[1].trim());
    }
    return results;
  }

  function parseSruXml(xml: string): any[] {
    const records = xml.split("<sru:record>");
    if (records.length <= 1) return [];
    const items: any[] = [];

    for (let i = 1; i < records.length; i++) {
      const rec = records[i];
      const title = extractSruField(rec, "title")[0] ?? null;
      if (!title) continue;

      const dates = extractSruField(rec, "date");
      const issued = extractSruField(rec, "issued");
      const date = issued[0] ?? dates[0] ?? null;

      const identifiers = extractSruField(rec, "identifier");
      const preferredUrl = (rec.match(/<gzd:preferredURL>([^<]+)</) ?? [])[1] ?? null;
      const url = preferredUrl ?? identifiers.find(id => id.startsWith("http")) ?? null;

      const types = extractSruField(rec, "type");
      const publicationType = types.find(t => t.match(/^[A-Z]/)) ?? types[0] ?? null;

      const subjects = extractSruField(rec, "subject");
      const creator = extractSruField(rec, "creator")[0] ?? null;

      items.push({
        id: identifiers[0] ?? String(i),
        title,
        date,
        url,
        type: publicationType,
        subjects: subjects.slice(0, 4),
        creator,
      });
    }
    return items;
  }

  app.get("/api/gemeente-updates", requireAuth, async (req, res) => {
    const gemeente = (req.query.gemeente as string || "").trim();
    if (!gemeente) {
      return res.status(400).json({ error: "Gemeente is verplicht" });
    }
    const limit = Math.min(Number(req.query.limit) || 15, 40);
    const cacheKey = gemeente.toLowerCase();
    const cached = gemeenteUpdatesCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json(cached.data);
    }

    try {
      const query = encodeURIComponent(
        `"${gemeente}" AND c.product-area = "officielepublicaties"`
      );
      const url = `${SRU_BASE}?operation=searchRetrieve&version=1.2&query=${query}&maximumRecords=${limit + 10}&sortKeys=dcterms.issued,,0`;

      const response = await fetch(url, {
        headers: { "User-Agent": "OpenRegio/1.0", "Accept": "application/xml" },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error(`SRU responded with ${response.status}`);

      const xml = await response.text();
      const countMatch = xml.match(/numberOfRecords>(\d+)/);
      const total = countMatch ? parseInt(countMatch[1]) : 0;
      const allItems = parseSruXml(xml).slice(0, limit);

      const result = { gemeente, total, count: allItems.length, items: allItems };
      gemeenteUpdatesCache.set(cacheKey, { data: result, expiresAt: Date.now() + GEMEENTE_TTL_MS });
      res.json(result);
    } catch (err: any) {
      console.error("Gemeente-updates fout:", err.message);
      res.status(503).json({
        error: "Overheid.nl tijdelijk niet bereikbaar. Probeer het later opnieuw.",
      });
    }
  });

  // ─── Regio Deals ───────────────────────────────────────────────────────────

  app.get("/api/regio-deals", requireAuth, async (req, res) => {
    try {
      const deals = await storage.getRegioDeals(true);
      res.json(deals);
    } catch (err: any) {
      res.status(500).json({ error: "Kon deals niet ophalen." });
    }
  });

  app.get("/api/regio-deals/all", requireAuth, requireAdmin, async (req, res) => {
    try {
      const deals = await storage.getRegioDeals(false);
      res.json(deals);
    } catch (err: any) {
      res.status(500).json({ error: "Kon deals niet ophalen." });
    }
  });

  app.post("/api/regio-deals", requireAuth, requireAdmin, async (req, res) => {
    const parsed = insertRegioDealSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: fromZodError(parsed.error).message });
    }
    try {
      const deal = await storage.createRegioDeal(parsed.data);
      res.status(201).json(deal);
    } catch (err: any) {
      res.status(500).json({ error: "Kon deal niet aanmaken." });
    }
  });

  app.put("/api/regio-deals/:id", requireAuth, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const parsed = insertRegioDealSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: fromZodError(parsed.error).message });
    }
    try {
      const updated = await storage.updateRegioDeal(id, parsed.data);
      if (!updated) return res.status(404).json({ error: "Deal niet gevonden." });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "Kon deal niet bijwerken." });
    }
  });

  app.delete("/api/regio-deals/:id", requireAuth, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await storage.deleteRegioDeal(id);
      if (!deleted) return res.status(404).json({ error: "Deal niet gevonden." });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Kon deal niet verwijderen." });
    }
  });

  // ─── INTEL SIGNALEN ────────────────────────────────────────────────────────

  // GET /api/intel/signalen/all — alle signalen inclusief ongepubliceerd (admin)
  app.get("/api/intel/signalen/all", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { categorie, regio } = req.query as { categorie?: string; regio?: string };
      const signalen = await storage.getIntelSignalen({
        categorie: categorie || undefined,
        regio: regio || undefined,
      });
      res.json(signalen);
    } catch (err: any) {
      console.error("Intel signalen (admin) ophalen fout:", err);
      res.status(500).json({ error: "Kon signalen niet ophalen" });
    }
  });

  // GET /api/intel/signalen — haal signalen op (iedereen die is ingelogd)
  app.get("/api/intel/signalen", requireAuth, async (req, res) => {
    try {
      const { categorie, regio } = req.query as { categorie?: string; regio?: string };
      const signalen = await storage.getIntelSignalen({
        categorie: categorie || undefined,
        regio: regio || undefined,
        isPublished: true,
      });
      res.json(signalen);
    } catch (err: any) {
      console.error("Intel signalen ophalen fout:", err);
      res.status(500).json({ error: "Kon signalen niet ophalen" });
    }
  });

  // POST /api/intel/signalen — nieuw signaal aanmaken (admin)
  app.post("/api/intel/signalen", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { insertIntelSignaalSchema } = await import("@shared/schema");
      const parsed = insertIntelSignaalSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Ongeldige invoer", details: parsed.error.flatten() });
      const signaal = await storage.createIntelSignaal({ ...parsed.data, createdByUserId: (req as any).userId });
      res.status(201).json(signaal);
    } catch (err: any) {
      console.error("Intel signaal aanmaken fout:", err);
      res.status(500).json({ error: "Kon signaal niet aanmaken" });
    }
  });

  // PATCH /api/intel/signalen/:id — signaal bijwerken (admin)
  app.patch("/api/intel/signalen/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getIntelSignaalById(id);
      if (!existing) return res.status(404).json({ error: "Signaal niet gevonden" });
      const updated = await storage.updateIntelSignaal(id, req.body);
      res.json(updated);
    } catch (err: any) {
      console.error("Intel signaal bijwerken fout:", err);
      res.status(500).json({ error: "Kon signaal niet bijwerken" });
    }
  });

  // DELETE /api/intel/signalen/:id — signaal verwijderen (admin)
  app.delete("/api/intel/signalen/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteIntelSignaal(id);
      if (!deleted) return res.status(404).json({ error: "Signaal niet gevonden" });
      res.json({ success: true });
    } catch (err: any) {
      console.error("Intel signaal verwijderen fout:", err);
      res.status(500).json({ error: "Kon signaal niet verwijderen" });
    }
  });

  // POST /api/intel/fetch — handmatig een fetch-ronde triggeren (admin)
  app.post("/api/intel/fetch", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const { runIntelFetch } = await import("./services/intelCron");
      const count = await runIntelFetch();
      res.json({ success: true, nieuwSignalen: count });
    } catch (err: any) {
      console.error("Intel fetch fout:", err);
      res.status(500).json({ error: "Fetch mislukt", detail: err.message });
    }
  });

  // ─── ADMIN COCKPIT ─────────────────────────────────────────────────────────

  // GET /api/admin/stats — platform overview stats
  app.get("/api/admin/stats", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const [userStats, wooStats, regionCount, crewCount, newUsers] = await Promise.all([
        db.execute(sql`SELECT plan, COUNT(*)::int AS cnt FROM users WHERE deleted_at IS NULL GROUP BY plan`),
        db.execute(sql`SELECT status, COUNT(*)::int AS cnt FROM woo_requests GROUP BY status`),
        db.execute(sql`SELECT COUNT(*)::int AS cnt FROM regions`),
        db.execute(sql`SELECT COUNT(*)::int AS cnt FROM crew_profiles`),
        db.execute(sql`SELECT COUNT(*)::int AS cnt FROM users WHERE deleted_at IS NULL AND created_at > NOW() - INTERVAL '30 days'`),
      ]);
      const byPlan: Record<string, number> = {};
      for (const row of userStats.rows as any[]) byPlan[row.plan || "basic"] = row.cnt;
      const byStatus: Record<string, number> = {};
      for (const row of wooStats.rows as any[]) byStatus[row.status || "sent"] = row.cnt;
      res.json({
        users: { total: Object.values(byPlan).reduce((a, b) => a + b, 0), byPlan },
        woo: { total: Object.values(byStatus).reduce((a, b) => a + b, 0), byStatus },
        regions: (regionCount.rows[0] as any)?.cnt || 0,
        crewProfiles: (crewCount.rows[0] as any)?.cnt || 0,
        newUsersLast30Days: (newUsers.rows[0] as any)?.cnt || 0,
      });
    } catch (err: any) {
      console.error("Admin stats error:", err);
      res.status(500).json({ error: "Kon statistieken niet ophalen" });
    }
  });

  // GET /api/admin/ondernemers — GDPR-compliant list of registered entrepreneurs
  // Query params: search, region, plan, page (default 1, pageSize 25)
  app.get("/api/admin/ondernemers", requireAuth, requireAdmin, async (req, res) => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const regionFilter = typeof req.query.region === "string" ? req.query.region.trim() : "";
      const planFilter = typeof req.query.plan === "string" && ["basic", "pro"].includes(req.query.plan) ? req.query.plan : "";
      const rawPage = Number.parseInt((req.query.page as string) || "1", 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const pageSize = 25;
      const offset = (page - 1) * pageSize;

      // Build dynamic filters using drizzle sql tag
      const searchFilter = search ? sql`AND LOWER(COALESCE(u.business_name, '')) LIKE ${`%${search.toLowerCase()}%`}` : sql``;
      const regionSqlFilter = regionFilter ? sql`AND u.region = ${regionFilter}` : sql``;
      const planSqlFilter = planFilter ? sql`AND COALESCE(u.plan, 'basic') = ${planFilter}` : sql``;

      // Main list query with pagination
      const listRows = await db.execute(sql`
        SELECT
          u.id,
          COALESCE(u.business_name, 'Geen naam opgegeven') AS "businessName",
          COALESCE(u.region, '-') AS region,
          COALESCE(u.plan, 'basic') AS plan,
          TO_CHAR(DATE_TRUNC('month', u.created_at), 'YYYY-MM') AS "memberSince",
          EXISTS (
            SELECT 1 FROM refresh_tokens rt
            WHERE rt.user_id = u.id
              AND rt.expires_at > NOW()
              AND rt.created_at > ${thirtyDaysAgo}
          ) AS "isRecentlyActive"
        FROM users u
        WHERE u.deleted_at IS NULL
        ${searchFilter}
        ${regionSqlFilter}
        ${planSqlFilter}
        ORDER BY u.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `);

      // Count query for pagination
      const countRows = await db.execute(sql`
        SELECT COUNT(*)::int AS total
        FROM users u
        WHERE u.deleted_at IS NULL
        ${searchFilter}
        ${regionSqlFilter}
        ${planSqlFilter}
      `);

      // Aggregate stats (always unfiltered for the stat cards)
      const statsRows = await db.execute(sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE COALESCE(u.plan, 'basic') = 'pro')::int AS total_pro,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM refresh_tokens rt
              WHERE rt.user_id = u.id
                AND rt.expires_at > NOW()
                AND rt.created_at > ${thirtyDaysAgo}
            )
          )::int AS total_active,
          (
            SELECT COALESCE(u2.region, '-')
            FROM users u2
            WHERE u2.deleted_at IS NULL AND u2.region IS NOT NULL AND u2.region != ''
            GROUP BY u2.region
            ORDER BY COUNT(*) DESC
            LIMIT 1
          ) AS top_region
        FROM users u
        WHERE u.deleted_at IS NULL
      `);

      const total = (countRows.rows[0] as any)?.total ?? 0;
      const stats = (statsRows.rows[0] as any) ?? { total: 0, total_pro: 0, total_active: 0, top_region: "-" };

      res.json({
        items: listRows.rows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        stats: {
          total: stats.total,
          totalPro: stats.total_pro,
          totalActive: stats.total_active,
          topRegion: stats.top_region || "-",
        },
      });
    } catch (err: any) {
      console.error("Admin ondernemers error:", err);
      res.status(500).json({ error: "Kon ondernemers niet ophalen" });
    }
  });

  // GET /api/admin/woo/stats — woo monitoring stats
  app.get("/api/admin/woo/stats", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const [byRegion, byCategory, byMonth] = await Promise.all([
        db.execute(sql`
          SELECT COALESCE(r.name, 'Onbekend') AS name, COUNT(wr.id)::int AS cnt
          FROM woo_requests wr
          LEFT JOIN regions r ON r.id = wr.region_id
          GROUP BY r.name ORDER BY cnt DESC LIMIT 8
        `),
        db.execute(sql`
          SELECT COALESCE(wc.label, wr.category_slug, 'Onbekend') AS name, COUNT(wr.id)::int AS cnt
          FROM woo_requests wr
          LEFT JOIN woo_categories wc ON wc.slug = wr.category_slug
          GROUP BY wc.label, wr.category_slug ORDER BY cnt DESC LIMIT 8
        `),
        db.execute(sql`
          SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                 DATE_TRUNC('month', created_at) AS sort_key,
                 COUNT(*)::int AS cnt
          FROM woo_requests
          WHERE created_at > NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY sort_key ASC
        `),
      ]);
      res.json({
        byRegion: byRegion.rows,
        byCategory: byCategory.rows,
        byMonth: byMonth.rows,
      });
    } catch (err: any) {
      console.error("Admin woo stats error:", err);
      res.status(500).json({ error: "Kon Woo-statistieken niet ophalen" });
    }
  });

  // GET /api/admin/woo/requests — all woo requests list
  app.get("/api/admin/woo/requests", requireAuth, requireAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt((req.query.limit as string) || "50"), 100);
      const offset = parseInt((req.query.offset as string) || "0");
      const rows = await db.execute(sql`
        SELECT wr.id, wr.title, wr.status, wr.reference_code,
               wr.created_at, wr.sent_at,
               COALESCE(rg.name, '') AS region,
               COALESCE(au.name, '') AS authority,
               COALESCE(wc.label, wr.category_slug, '') AS category
        FROM woo_requests wr
        LEFT JOIN regions rg ON rg.id = wr.region_id
        LEFT JOIN authorities au ON au.id = wr.authority_id
        LEFT JOIN woo_categories wc ON wc.slug = wr.category_slug
        ORDER BY wr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
      const total = await db.execute(sql`SELECT COUNT(*)::int AS cnt FROM woo_requests`);
      res.json({ requests: rows.rows, total: (total.rows[0] as any)?.cnt || 0 });
    } catch (err: any) {
      console.error("Admin woo requests error:", err);
      res.status(500).json({ error: "Kon Woo-verzoeken niet ophalen" });
    }
  });

  // GET /api/admin/woo/dossiers/overdue — dossiers past 28-day deadline
  app.get("/api/admin/woo/dossiers/overdue", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 28);

      const rows = await db.execute(sql`
        SELECT wd.id, wd.user_id, wd.authority, wd.subject, wd.status,
               wd.created_at, wd.deadline, wd.ingebreke_sent_at,
               wd.dwangsom_contract_accepted_at,
               u.email AS user_email
        FROM woo_dossiers wd
        JOIN users u ON u.id = wd.user_id
        WHERE wd.created_at <= ${cutoff.toISOString()}
          AND wd.status NOT IN ('response_received', 'closed', 'ingebreke_gesteld')
        ORDER BY wd.created_at ASC
      `);

      res.json({ overdue: rows.rows });
    } catch (err: any) {
      console.error("Admin overdue woo error:", err);
      res.status(500).json({ error: "Kon vervallen dossiers niet ophalen" });
    }
  });

  // GET /api/admin/regions — list all regions
  app.get("/api/admin/regions", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const rows = await db.execute(sql`
        SELECT r.id, r.name, r.slug,
               (SELECT COUNT(*)::int FROM woo_requests wr WHERE wr.region_id = r.id) AS woo_count
        FROM regions r ORDER BY r.name ASC
      `);
      res.json(rows.rows);
    } catch (err: any) {
      console.error("Admin regions error:", err);
      res.status(500).json({ error: "Kon regio's niet ophalen" });
    }
  });

  // POST /api/admin/regions — create region
  app.post("/api/admin/regions", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { name, slug } = req.body as { name: string; slug: string };
      if (!name || !slug) return res.status(400).json({ error: "Naam en slug zijn verplicht" });
      const rows = await db.execute(sql`
        INSERT INTO regions (name, slug) VALUES (${name}, ${slug})
        RETURNING id, name, slug
      `);
      res.json(rows.rows[0]);
    } catch (err: any) {
      if (err.code === "23505") return res.status(409).json({ error: "Slug bestaat al" });
      console.error("Admin create region error:", err);
      res.status(500).json({ error: "Kon regio niet aanmaken" });
    }
  });

  // PATCH /api/admin/regions/:id — update region
  app.patch("/api/admin/regions/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, slug } = req.body as { name?: string; slug?: string };
      if (!name && !slug) return res.status(400).json({ error: "Geen wijzigingen opgegeven" });
      const rows = await db.execute(sql`
        UPDATE regions SET
          name = COALESCE(${name || null}, name),
          slug = COALESCE(${slug || null}, slug)
        WHERE id = ${id}
        RETURNING id, name, slug
      `);
      if (rows.rows.length === 0) return res.status(404).json({ error: "Regio niet gevonden" });
      res.json(rows.rows[0]);
    } catch (err: any) {
      if (err.code === "23505") return res.status(409).json({ error: "Slug bestaat al" });
      console.error("Admin update region error:", err);
      res.status(500).json({ error: "Kon regio niet bijwerken" });
    }
  });

  // DELETE /api/admin/regions/:id — delete region
  app.delete("/api/admin/regions/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.execute(sql`DELETE FROM regions WHERE id = ${id}`);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Admin delete region error:", err);
      res.status(500).json({ error: "Kon regio niet verwijderen" });
    }
  });

  // GET /api/admin/inzicht — platform analytics
  app.get("/api/admin/inzicht", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const [userGrowth, wooGrowth, topWooCategories, planDistribution] = await Promise.all([
        db.execute(sql`
          SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                 DATE_TRUNC('month', created_at) AS sort_key,
                 COUNT(*)::int AS cnt
          FROM users WHERE deleted_at IS NULL
          AND created_at > NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY sort_key ASC
        `),
        db.execute(sql`
          SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                 DATE_TRUNC('month', created_at) AS sort_key,
                 COUNT(*)::int AS cnt
          FROM woo_requests
          WHERE created_at > NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY sort_key ASC
        `),
        db.execute(sql`
          SELECT COALESCE(wc.label, wr.category_slug, 'Onbekend') AS name, COUNT(wr.id)::int AS cnt
          FROM woo_requests wr
          LEFT JOIN woo_categories wc ON wc.slug = wr.category_slug
          GROUP BY wc.label, wr.category_slug ORDER BY cnt DESC LIMIT 5
        `),
        db.execute(sql`SELECT plan, COUNT(*)::int AS cnt FROM users WHERE deleted_at IS NULL GROUP BY plan`),
      ]);
      res.json({
        userGrowth: userGrowth.rows,
        wooGrowth: wooGrowth.rows,
        topWooCategories: topWooCategories.rows,
        planDistribution: planDistribution.rows,
      });
    } catch (err: any) {
      console.error("Admin inzicht error:", err);
      res.status(500).json({ error: "Kon inzicht niet ophalen" });
    }
  });

  // ─── Website Scan ──────────────────────────────────────────────────────────
  app.post("/api/tools/website-scan", requireAuth, requirePro, async (req, res) => {
    const rawUrl: string = (req.body.url || "").trim();
    if (!rawUrl) return res.status(400).json({ error: "URL is vereist" });

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    } catch {
      return res.status(400).json({ error: "Ongeldige URL. Voer een geldig webadres in." });
    }

    let html = "";
    let finalUrl = parsedUrl.href;
    let fetchError: string | null = null;

    try {
      const response = await fetch(parsedUrl.href, {
        signal: AbortSignal.timeout(12000),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OpenRegio-Scanner/1.0)",
          "Accept": "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });
      finalUrl = response.url;
      html = await response.text();
    } catch {
      fetchError = "Kon de website niet bereiken. Controleer of de URL correct en bereikbaar is.";
    }

    const s: Record<string, any> = { url: finalUrl, fetchError };

    if (html) {
      s.title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null;
      s.titleLength = s.title?.length ?? 0;
      s.metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']{0,500})["']/i)?.[1]?.trim()
        ?? html.match(/<meta[^>]*content=["']([^"']{0,500})["'][^>]*name=["']description["']/i)?.[1]?.trim() ?? null;
      s.metaDescLength = s.metaDesc?.length ?? 0;
      const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
      s.h1Count = h1s.length;
      s.h1First = h1s[0]?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null;
      s.h2Count = (html.match(/<h2[^>]*>/gi) ?? []).length;
      const imgs = html.match(/<img[^>]*>/gi) ?? [];
      s.imgTotal = imgs.length;
      s.imgNoAlt = imgs.filter(i => !/alt=["'][^"']+["']/i.test(i)).length;
      s.isHttps = finalUrl.startsWith("https://");
      s.hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
      s.hasOgTitle = /<meta[^>]*property=["']og:title["']/i.test(html);
      s.hasOgDesc = /<meta[^>]*property=["']og:description["']/i.test(html);
      s.hasOgImage = /<meta[^>]*property=["']og:image["']/i.test(html);
      s.hasStructuredData = /<script[^>]*type=["']application\/ld\+json["']/i.test(html);
      s.hasPhone = /(\+31|0[1-9][0-9\-\s]{7,12})/.test(html);
      s.hasEmail = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(html);
      s.hasGoogleMaps = /maps\.google|maps\.googleapis|google\.com\/maps/i.test(html);
      s.hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
      s.htmlLang = html.match(/<html[^>]*lang=["']([^"']+)["']/i)?.[1] ?? null;
      s.wordCount = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).length;
      s.pageSizeKb = Math.round(html.length / 1024);
    }

    const prompt = fetchError
      ? `De website kon niet worden bereikt: ${fetchError}. Geef een JSON-object met overallScore: 0, categories: [], sterkePunten: [], aanbevelingen: [{prioriteit:"hoog", actie:"Controleer of de website online is", waarom:"De website is niet bereikbaar"}], samenvattend:"De website kon niet worden bereikt."`
      : `Je bent een lokale SEO- en online-marketingexpert voor Nederlandse MKB-bedrijven.

Analyseer deze website-signalen voor ${finalUrl}:
${JSON.stringify(s, null, 2)}

Geef een JSON-analyse in exact dit formaat (geen markdown):
{
  "overallScore": [0-100],
  "categories": [
    {"naam":"Vindbaarheid (SEO)","score":[0-100],"oordeel":"goed|matig|slecht","toelichting":"[1-2 zinnen observatie]"},
    {"naam":"Lokale aanwezigheid","score":[0-100],"oordeel":"goed|matig|slecht","toelichting":"[1-2 zinnen]"},
    {"naam":"Mobiel & Technisch","score":[0-100],"oordeel":"goed|matig|slecht","toelichting":"[1-2 zinnen]"},
    {"naam":"Social & Deelbaarheid","score":[0-100],"oordeel":"goed|matig|slecht","toelichting":"[1-2 zinnen]"}
  ],
  "sterkePunten": ["punt 1","punt 2"],
  "aanbevelingen": [
    {"prioriteit":"hoog|midden|laag","actie":"[concrete actie]","waarom":"[waarom voor MKB]"}
  ],
  "samenvattend": "[2-3 zinnen overkoepelende beoordeling]"
}
Wees kritisch maar opbouwend. Focus op lokale vindbaarheid voor Nederlandse ondernemers. Max 5 aanbevelingen.`;

    function extractJson(raw: string): any {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      // First try direct parse
      try { return JSON.parse(cleaned); } catch {}
      // Try to extract first JSON object
      const match = cleaned.match(/\{[\s\S]+\}/);
      if (match) {
        try { return JSON.parse(match[0]); } catch {}
      }
      return null;
    }

    // Fallback analysis when AI fails
    function buildFallbackAnalysis() {
      const httpsScore = s.isHttps ? 20 : 0;
      const seoScore = (s.title ? 15 : 0) + (s.metaDesc ? 15 : 0) + (s.h1Count === 1 ? 10 : 0);
      const mobileScore = s.hasViewport ? 20 : 0;
      const localScore = (s.hasPhone ? 10 : 0) + (s.hasEmail ? 10 : 0) + (s.hasGoogleMaps ? 10 : 0);
      const overall = Math.round(Math.min(100, httpsScore + seoScore + mobileScore + localScore));
      return {
        overallScore: overall || 45,
        categories: [
          { naam: "Vindbaarheid (SEO)", score: Math.min(100, seoScore * 2), oordeel: seoScore > 30 ? "goed" : "matig", toelichting: s.title ? "Er is een paginatitel gevonden." : "Geen paginatitel gevonden — dit is essentieel voor Google." },
          { naam: "Lokale aanwezigheid", score: Math.min(100, localScore * 3), oordeel: localScore > 20 ? "goed" : "slecht", toelichting: s.hasPhone ? "Telefoonnummer aanwezig." : "Geen contactgegevens gevonden op de pagina." },
          { naam: "Mobiel & Technisch", score: mobileScore + httpsScore, oordeel: (mobileScore + httpsScore) > 30 ? "goed" : "matig", toelichting: s.isHttps ? "Website draait via HTTPS." : "Geen HTTPS — dit schaadt zowel veiligheid als SEO." },
          { naam: "Social & Deelbaarheid", score: s.hasOgTitle ? 60 : 20, oordeel: s.hasOgTitle ? "matig" : "slecht", toelichting: s.hasOgTitle ? "Open Graph titel aanwezig." : "Geen Open Graph tags — links op social media worden niet mooi weergegeven." },
        ],
        sterkePunten: [
          ...(s.isHttps ? ["Website draait via HTTPS"] : []),
          ...(s.hasViewport ? ["Mobielvriendelijke viewport ingesteld"] : []),
          ...(s.title ? ["Paginatitel aanwezig"] : []),
        ],
        aanbevelingen: [
          ...(!s.isHttps ? [{ prioriteit: "hoog", actie: "Schakel HTTPS in", waarom: "Google geeft voorkeur aan veilige websites en laat zonder HTTPS een waarschuwing zien." }] : []),
          ...(!s.metaDesc ? [{ prioriteit: "hoog", actie: "Voeg een meta-beschrijving toe", waarom: "Dit is de tekst die in Google zoekresultaten verschijnt — cruciaal voor klikken." }] : []),
          ...(!s.hasPhone ? [{ prioriteit: "midden", actie: "Zet een telefoonnummer op de website", waarom: "Lokale klanten zoeken snel contactmogelijkheden — een zichtbaar nummer verhoogt vertrouwen en conversie." }] : []),
          ...(!s.hasStructuredData ? [{ prioriteit: "midden", actie: "Voeg structured data (JSON-LD) toe", waarom: "Dit helpt Google begrijpen wie je bent en kan leiden tot rich results in zoekresultaten." }] : []),
          ...(!s.hasOgImage ? [{ prioriteit: "laag", actie: "Voeg een Open Graph afbeelding toe", waarom: "Wanneer mensen je link delen op social media, wordt er nu geen afbeelding getoond." }] : []),
        ].slice(0, 5),
        samenvattend: `Analyse van ${finalUrl} op basis van technische signalen. ${overall >= 60 ? "De website heeft een solide basis maar er zijn verbeterpunten." : "Er zijn meerdere aandachtspunten die de online vindbaarheid verbeteren."}`,
      };
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const genAI = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
        ...(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
          ? { httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL! } }
          : {}),
      });
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });
      const raw = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const analysis = extractJson(raw) ?? buildFallbackAnalysis();
      return res.json({ url: finalUrl, signals: s, analysis });
    } catch (geminiErr) {
      try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI();
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        });
        const analysis = extractJson(completion.choices[0].message.content ?? "{}") ?? buildFallbackAnalysis();
        return res.json({ url: finalUrl, signals: s, analysis });
      } catch {
        // Both AI services failed — return rule-based analysis
        return res.json({ url: finalUrl, signals: s, analysis: buildFallbackAnalysis() });
      }
    }
  });

  // ─── Regelgeving Verkenner ──────────────────────────────────────────────────
  const regelgevingCache = new Map<string, { data: any; expiresAt: number }>();
  const REGELGEVING_TTL = 60 * 60 * 1000; // 1 uur

  app.get("/api/regelgeving-verkenner", requireAuth, async (req, res) => {
    const query = (req.query.query as string || "").trim();
    const categorie = (req.query.categorie as string || "alle").trim();
    const limit = Math.min(Number(req.query.limit) || 20, 40);

    if (!query) return res.status(400).json({ error: "Zoekopdracht is vereist" });

    const cacheKey = `${query}:${categorie}:${limit}`;
    const cached = regelgevingCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return res.json(cached.data);

    const categorieFilter: Record<string, string> = {
      "verordening": ' AND dc.type = "Verordening"',
      "beleidsregel": ' AND dc.type = "Beleidsregel"',
      "besluit": ' AND dc.type = "Besluit"',
      "regeling": ' AND dc.type = "Regeling"',
      "alle": "",
    };
    const typeFilter = categorieFilter[categorie] ?? "";
    const sruQuery = encodeURIComponent(`"${query}"${typeFilter} AND c.product-area = "officielepublicaties"`);
    const url = `${SRU_BASE}?operation=searchRetrieve&version=1.2&query=${sruQuery}&maximumRecords=${limit + 10}&sortKeys=dcterms.issued,,0`;

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "OpenRegio/1.0", "Accept": "application/xml" },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error(`SRU ${response.status}`);

      const xml = await response.text();
      const total = parseInt(xml.match(/numberOfRecords>(\d+)/)?.[1] ?? "0");
      const items = parseSruXml(xml).slice(0, limit);

      const result = { query, categorie, total, count: items.length, items };
      regelgevingCache.set(cacheKey, { data: result, expiresAt: Date.now() + REGELGEVING_TTL });
      res.json(result);
    } catch (err: any) {
      console.error("Regelgeving verkenner fout:", err.message);
      res.status(503).json({ error: "Overheid.nl tijdelijk niet bereikbaar. Probeer het later opnieuw." });
    }
  });

  // ─── WOO-concept generator ──────────────────────────────────────────────────
  app.post("/api/regelgeving-verkenner/woo-concept", requireAuth, requirePro, async (req, res) => {
    const { title, onderwerp, creator, url: bronUrl } = req.body;
    const user = (req as any).user;
    if (!title || !onderwerp) return res.status(400).json({ error: "Titel en onderwerp zijn vereist" });

    const prompt = `Je bent een expert in de Wet open overheid (Woo) en juridische communicatie voor Nederlandse ondernemers.

Een ondernemer wil een Woo-verzoek indienen op basis van het volgende overheidsDocument:
- Titel: ${title}
- Onderwerp: ${onderwerp}
- Uitgegeven door: ${creator ?? "onbekend bestuursorgaan"}
- Bron: ${bronUrl ?? "officiële publicatie"}

Schrijf een professioneel en afdwingbaar Woo-verzoek in formele Nederlandse juridische stijl.
Het verzoek moet:
1. Beginnen met een duidelijke aanhef aan het juiste bestuursorgaan
2. De wettelijke grondslag vermelden (Wet open overheid, art. 1.1 e.v.)
3. Specifiek beschrijven welke informatie wordt gevraagd
4. Een redelijke termijn stellen (artikel 4.4 Woo: 4 weken)
5. Eindigen met een formele afsluiting

Geef een JSON-object terug in exact dit formaat:
{
  "aanhef": "[bestuursorgaan aanschrijving]",
  "brief": "[de volledige brief tekst]",
  "aanbevolenDocumenten": ["document type 1", "document type 2", "document type 3"],
  "juridischeGrondslag": "[relevante wetsartikelen]"
}`;

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const genAI = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
        ...(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
          ? { httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL! } }
          : {}),
      });
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      let raw = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const concept = JSON.parse(raw);
      return res.json(concept);
    } catch {
      try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI();
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        });
        const concept = JSON.parse(completion.choices[0].message.content ?? "{}");
        return res.json(concept);
      } catch {
        return res.status(500).json({ error: "Kon geen concept genereren. Probeer het later opnieuw." });
      }
    }
  });

  // ── Google Bedrijfsprofiel check (geen auth — gebruikt in anonieme Basischeck) ──
  interface GooglePlacesSearchResult {
    place_id: string;
    name: string;
    rating?: number;
    user_ratings_total?: number;
    formatted_address?: string;
  }
  interface GooglePlacesSearchResponse {
    results: GooglePlacesSearchResult[];
    status: string;
  }
  interface GooglePlacesPhoto {
    photo_reference: string;
  }
  interface GooglePlacesOpeningHours {
    weekday_text?: string[];
  }
  interface GooglePlacesDetails {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    formatted_address?: string;
    url?: string;
    photos?: GooglePlacesPhoto[];
    opening_hours?: GooglePlacesOpeningHours;
  }
  interface GooglePlacesDetailsResponse {
    result?: GooglePlacesDetails;
    status: string;
  }

  app.post("/api/tools/google-places-check", async (req, res) => {
    const { bedrijfsnaam, stad } = req.body as { bedrijfsnaam?: string; stad?: string };
    if (!bedrijfsnaam?.trim() || !stad?.trim()) {
      return res.status(400).json({ error: "bedrijfsnaam en stad zijn vereist" });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "Google Places API niet geconfigureerd", geconfigureerd: false });
    }

    try {
      const query = `${bedrijfsnaam.trim()} ${stad.trim()}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=nl&region=nl&key=${apiKey}`;
      const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
      if (!searchRes.ok) {
        return res.status(502).json({ error: "Google Places Text Search niet bereikbaar", geconfigureerd: true, gevonden: false });
      }
      const searchData = (await searchRes.json()) as GooglePlacesSearchResponse;

      if (searchData.status === "REQUEST_DENIED" || searchData.status === "INVALID_REQUEST") {
        return res.status(503).json({ error: `Google Places API afgewezen (${searchData.status})`, geconfigureerd: false });
      }
      if (searchData.status === "OVER_QUERY_LIMIT") {
        return res.status(429).json({ error: "Google Places quotum overschreden", geconfigureerd: true, gevonden: false });
      }
      if (!searchData.results?.length || searchData.status === "ZERO_RESULTS") {
        return res.json({ gevonden: false, geconfigureerd: true });
      }

      const place = searchData.results[0];
      const placeId = place.place_id;

      const fieldsParam = "name,rating,user_ratings_total,photos,opening_hours,formatted_address,url";
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fieldsParam}&language=nl&key=${apiKey}`;
      const detailsRes = await fetch(detailsUrl, { signal: AbortSignal.timeout(8000) });
      if (!detailsRes.ok) {
        return res.status(502).json({ error: "Google Places Details niet bereikbaar", geconfigureerd: true, gevonden: false });
      }
      const detailsData = (await detailsRes.json()) as GooglePlacesDetailsResponse;
      if (detailsData.status !== "OK") {
        // Fall back to basic search result data when details fail
        return res.json({
          geconfigureerd: true,
          gevonden: true,
          naam: place.name,
          rating: place.rating ?? null,
          aantalReviews: place.user_ratings_total ?? 0,
          adres: place.formatted_address ?? null,
          heeftFotos: false,
          heeftOpeningstijden: false,
          heeftVolledigAdres: !!(place.formatted_address),
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${placeId}`,
        });
      }
      const d: GooglePlacesDetails = detailsData.result ?? {};

      const rating: number | null = d.rating ?? place.rating ?? null;
      const aantalReviews: number = d.user_ratings_total ?? place.user_ratings_total ?? 0;
      const adres: string | null = d.formatted_address ?? place.formatted_address ?? null;
      const mapsUrl: string =
        d.url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${placeId}`;

      return res.json({
        geconfigureerd: true,
        gevonden: true,
        naam: d.name ?? place.name ?? bedrijfsnaam.trim(),
        rating,
        aantalReviews,
        adres,
        heeftFotos: (d.photos?.length ?? 0) > 0,
        heeftOpeningstijden: !!(d.opening_hours?.weekday_text?.length),
        heeftVolledigAdres: !!adres && adres.length > 0,
        mapsUrl,
      });
    } catch {
      return res.status(500).json({ error: "Lookup mislukt. Probeer het later opnieuw." });
    }
  });

  // ─── Dagelijkse nieuws-tip via AI ────────────────────────────────────
  // In-memory cache: opnieuw genereren zodra de datum verandert
  let nieuwsTipCacheDatum = "";
  let nieuwsTipCacheData: { tip: string; bronnen: string[]; bronUrl?: string; datum: string; fallback?: boolean } | null = null;

  async function fetchNieuwsTipVandaag(): Promise<{ tip: string; bronnen: string[]; bronUrl?: string }> {
    // Rijksoverheid als primaire bron (feitelijk, niet-opgeblazen) + NOS economie als aanvulling
    const feedUrls = [
      { url: "https://feeds.rijksoverheid.nl/nieuws.rss", bron: "Rijksoverheid.nl" },
      { url: "https://feeds.nos.nl/nosnieuwseconomie", bron: "NOS.nl" },
    ];

    const items: { titel: string; url?: string; bron: string }[] = [];
    const bronnenSet = new Set<string>();
    let eersteArtikelUrl: string | undefined;

    for (const feed of feedUrls) {
      try {
        const resp = await fetch(feed.url, { signal: AbortSignal.timeout(6000) });
        if (!resp.ok) continue;
        const xml = await resp.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let itemMatch: RegExpExecArray | null;
        while ((itemMatch = itemRegex.exec(xml)) !== null && items.length < 18) {
          const itemBlock = itemMatch[1];
          const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemBlock);
          const linkMatch = /<link>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+?)(?:\]\]>)?<\/link>/i.exec(itemBlock);
          if (titleMatch?.[1]) {
            const titel = titleMatch[1].trim();
            const artikelUrl = linkMatch?.[1]?.trim();
            if (titel && titel.length > 5) {
              items.push({ titel, url: artikelUrl, bron: feed.bron });
              bronnenSet.add(feed.bron);
              if (!eersteArtikelUrl && artikelUrl) eersteArtikelUrl = artikelUrl;
            }
          }
        }
      } catch {
        // Continue met andere feed
      }
    }

    if (items.length < 3) {
      throw new Error("Onvoldoende nieuwsitems opgehaald");
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
      ...(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
        ? { httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL! } }
        : {}),
    });

    const headlineText = items.slice(0, 15).map((it, i) => `${i + 1}. [${it.bron}] ${it.titel}`).join("\n");

    const prompt = `Je bent een kansen-scout voor Nederlandse lokale ondernemers (zzp, mkb, horeca, detailhandel, bouw, agrarisch).

Hier zijn de actuele nieuwskoppen van vandaag uit Nederland:
${headlineText}

Jouw taak: zoek in deze koppen het nieuwsitem dat VANDAAG een concrete kans of opening biedt voor een lokale ondernemer.

Denk in kansen, niet in bedreigingen:
- Dure brandstof → kans voor lokale bezorging, fietskoeriers, thuisbezorging
- Lege schappen of tekort aan grondstoffen → kans voor lokale alternatieven of import-vervanging
- Staking of storing → kans voor wie wél levert
- Stijgende energieprijzen → kans voor energiebesparing-dienstverleners of zonnepanelen-installateurs
- Hittegolf → kans voor koeling, horeca-terrassen, ijsverkoop
- Bouwstop ergens → kans voor renovatie of verbouwing
- Consumentenvertrouwen verandert → kans om nu te acquireren of juist te investeren

Schrijf PRECIES 2 zakelijke zinnen in nuchter Nederlands:
- Zin 1: wat er speelt vandaag in Nederland (feitelijk, 1 zin, geen emotie)
- Zin 2: welke concrete kans of actie dit biedt voor een lokale ondernemer (specifiek, actief)

Toon: zakelijk, nuchter, positief-realistisch. Geen alarm, geen hype, geen bangmakerij.
Voorbeeldtoon: "Benzineprijzen stegen vandaag opnieuw tot boven de €2,30 per liter. Lokale bezorgdiensten en fietskoeriersbedrijven kunnen dit vandaag als verkoopargument inzetten bij klanten die afhankelijk zijn van duurdere transportopties."

Geef ALLEEN de twee zinnen terug, zonder opmaak, nummers of titels. Maximaal 320 tekens.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Enforce length limit: trim to 300 characters at last sentence boundary
    let tip = response.text?.trim() ?? "";
    if (!tip) throw new Error("Lege AI-respons");
    if (tip.length > 350) {
      const truncated = tip.slice(0, 350);
      const lastDot = truncated.lastIndexOf(".");
      tip = lastDot > 50 ? truncated.slice(0, lastDot + 1) : truncated;
    }

    return { tip, bronnen: Array.from(bronnenSet), bronUrl: eersteArtikelUrl };
  }

  app.get("/api/tools/nieuws-tip", requireAuth, async (_req, res) => {
    const today = new Date().toISOString().split("T")[0];

    // Geef cached versie terug als datum overeenkomt
    if (nieuwsTipCacheDatum === today && nieuwsTipCacheData) {
      return res.json({ ...nieuwsTipCacheData, cached: true });
    }

    try {
      const { tip, bronnen, bronUrl } = await fetchNieuwsTipVandaag();
      nieuwsTipCacheDatum = today;
      nieuwsTipCacheData = { tip, bronnen, bronUrl, datum: today };
      return res.json({ tip, bronnen, bronUrl, datum: today, cached: false });
    } catch (err) {
      console.error("[NieuwsTip] Fout bij genereren tip:", (err as Error).message);
      // Fallback — cachen voor de dag zodat er niet elke request opnieuw geprobeerd wordt
      const fallbackTip = "Nederlandse gemeenten investeren dit jaar meer in lokale infrastructuur en verduurzaming. Vraag vandaag bij jouw gemeente na welke aanbestedingen of subsidies open staan voor jouw sector — die kansen zijn tijdgebonden.";
      nieuwsTipCacheDatum = today;
      nieuwsTipCacheData = { tip: fallbackTip, bronnen: [], datum: today, fallback: true };
      return res.json({
        tip: fallbackTip,
        bronnen: [],
        datum: today,
        cached: false,
        fallback: true,
      });
    }
  });
  // ─── Lokale Marktplaats (ik zoek / ik bied) ──────────────────────────

  // GET /api/lokaal-marktplaats — public listing (all active items)
  app.get("/api/lokaal-marktplaats", async (req, res) => {
    try {
      const { regio, type, categorie } = req.query as Record<string, string>;
      const items = await storage.getLokaalAanbod({
        regio: regio || undefined,
        type: type || undefined,
        categorie: categorie || undefined,
      });
      return res.json(items);
    } catch (err) {
      console.error("[LokaalMarktplaats] fout bij ophalen:", err);
      return res.status(500).json({ error: "Fout bij ophalen aanbod" });
    }
  });

  // GET /api/lokaal-marktplaats/me — own items (auth required)
  app.get("/api/lokaal-marktplaats/me", requireAuth, async (req, res) => {
    try {
      const items = await storage.getLokaalAanbodByUser(req.user!.id);
      return res.json(items);
    } catch (err) {
      console.error("[LokaalMarktplaats] fout bij ophalen eigen items:", err);
      return res.status(500).json({ error: "Fout bij ophalen eigen aanbod" });
    }
  });

  // POST /api/lokaal-marktplaats — place a new listing (auth required)
  app.post("/api/lokaal-marktplaats", requireAuth, async (req, res) => {
    try {
      const { insertLokaalAanbodSchema } = await import("@shared/schema");
      const parsed = insertLokaalAanbodSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" });
      }
      const item = await storage.createLokaalAanbod(parsed.data);
      return res.status(201).json(item);
    } catch (err) {
      console.error("[LokaalMarktplaats] fout bij aanmaken:", err);
      return res.status(500).json({ error: "Fout bij plaatsen aanbod" });
    }
  });

  // DELETE /api/lokaal-marktplaats/:id — delete own listing (auth required)
  app.delete("/api/lokaal-marktplaats/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteLokaalAanbod(req.params.id, req.user!.id);
      if (!deleted) return res.status(404).json({ error: "Niet gevonden of geen toegang" });
      return res.json({ success: true });
    } catch (err) {
      console.error("[LokaalMarktplaats] fout bij verwijderen:", err);
      return res.status(500).json({ error: "Fout bij verwijderen" });
    }
  });

  // ─── Kansen per gemeente (AI-gegenereerd) ────────────────────────────
  // In-memory cache per gemeente, geldig voor de huidige dag
  const kansenCache = new Map<string, { datum: string; kansen: KansKaartAI[] }>();

  type KansKaartAI = {
    titel: string;
    waarom: string;
    voorWie: string[];
    kans: string;
    urgentie: "Hoog" | "Gemiddeld" | "Laag";
  };

  app.get("/api/kansen/gemeente", requireAuth, async (req, res) => {
    const gemeente = (req.query.gemeente as string | undefined)?.trim();
    if (!gemeente) {
      return res.status(400).json({ error: "Gemeente is verplicht" });
    }

    const today = new Date().toISOString().split("T")[0];
    const forceRefresh = req.query.refresh === "true";
    const cached = kansenCache.get(gemeente);
    if (!forceRefresh && cached && cached.datum === today) {
      return res.json({ gemeente, kansen: cached.kansen, cached: true });
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
        ...(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
          ? { httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL! } }
          : {}),
      });

      // Haal recente nieuwssignalen op als actuele context
      const alleSignalen = await storage.getIntelSignalen();
      const contextSignalen = alleSignalen.slice(0, 12);
      const nieuwsContext = contextSignalen.length > 0
        ? contextSignalen.map((s, i) => `${i + 1}. [${s.bron}] ${s.titel}: ${s.samenvatting.slice(0, 150)}`).join("\n")
        : "(geen recente signalen beschikbaar)";

      const variationSeed = forceRefresh ? `\n\nVARIATIEINSTRUCTIE: Genereer volledig andere kansen dan eerder — andere sectoren, andere invalshoeken, andere urgentieniveaus. Vermijd herhaling van eerder genoemde kansen. (seed: ${Date.now()})` : "";

      const prompt = `Je bent een lokale kansen-analist voor Nederlandse ondernemers (zzp, mkb, horeca, detailhandel, bouw, agrarisch).

Genereer precies 4 actuele kansen voor ondernemers in de gemeente: **${gemeente}**.

Gebruik de onderstaande actuele nieuwssignalen als inspiratie — koppel elke kans zo mogelijk aan een actuele ontwikkeling:

--- RECENTE NIEUWSSIGNALEN ---
${nieuwsContext}
--- EINDE NIEUWS ---

Denk ook aan typische kenmerken van de gemeente ${gemeente} of haar regio. Wees specifiek en praktisch.${variationSeed}

Elke kans moet bevatten:
- titel: korte, pakkende omschrijving (max 8 woorden)
- waarom: waarom deze kans opvalt nu (1-2 zinnen, koppel aan actueel nieuws of lokale kenmerken)
- voorWie: 2-3 type ondernemers voor wie dit relevant is (bijv. "Webbouwers", "Horecaondernemers", "Bouwbedrijven")
- kans: wat de ondernemer concreet kan doen (1 actieve zin, begint met een werkwoord)
- urgentie: één van "Hoog", "Gemiddeld" of "Laag"

Zorg voor variatie: gebruik minimaal 2 verschillende urgentieniveaus en spreidt de doelgroepen.

Geef ALLEEN geldige JSON terug (geen markdown, geen uitleg), in dit exacte formaat:
[
  {
    "titel": "...",
    "waarom": "...",
    "voorWie": ["...", "..."],
    "kans": "...",
    "urgentie": "Hoog"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      let rawText = response.text?.trim() ?? "";
      console.log(`[Kansen] AI-respons voor ${gemeente} (${rawText.length} tekens):`, rawText.slice(0, 200));

      // Robuste JSON-extractie: zoek eerste JSON-array in de respons
      if (!rawText) throw new Error("Lege AI-respons");
      // Strip markdown code fences
      rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      // Zoek JSON array ([ ... ]) als Gemini toch extra tekst geeft
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error(`Geen JSON-array gevonden in respons: ${rawText.slice(0, 100)}`);

      const parsed: KansKaartAI[] = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Ongeldig AI-formaat: lege array");
      }

      const kansen = parsed.slice(0, 5).map((k) => ({
        titel: String(k.titel ?? "").slice(0, 120),
        waarom: String(k.waarom ?? "").slice(0, 500),
        voorWie: Array.isArray(k.voorWie) ? k.voorWie.slice(0, 4).map(String) : [],
        kans: String(k.kans ?? "").slice(0, 300),
        urgentie: (["Hoog", "Gemiddeld", "Laag"].includes(k.urgentie) ? k.urgentie : "Gemiddeld") as KansKaartAI["urgentie"],
      }));

      kansenCache.set(gemeente, { datum: today, kansen });
      console.log(`[Kansen] ${kansen.length} kansen gegenereerd voor ${gemeente}`);
      return res.json({ gemeente, kansen, cached: false });
    } catch (err) {
      console.error("[Kansen] AI-fout voor", gemeente, ":", (err as Error).message);
      // Generieke fallback — NIET cachen zodat volgende request opnieuw de AI probeert
      const fallback: KansKaartAI[] = [
        {
          titel: "Digitale zichtbaarheid verbeteren",
          waarom: "Veel lokale ondernemers zijn online moeilijk vindbaar terwijl de vraag naar lokale diensten groeit.",
          voorWie: ["Webdesigners", "Marketeers", "Fotografen"],
          kans: "Bied een lokale websitescan of zichtbaarheidspakket aan voor ondernemers in de buurt.",
          urgentie: "Hoog",
        },
        {
          titel: "Hulp bij administratie en brieven",
          waarom: "Overheidsformulieren en officiële brieven kosten ondernemers veel tijd en zorgen voor onnodige stress.",
          voorWie: ["Administrateurs", "Adviseurs", "Boekhouders"],
          kans: "Bied een laagdrempelige vraag-en-antwoord sessie of documentenhulp aan voor lokale ondernemers.",
          urgentie: "Gemiddeld",
        },
        {
          titel: "Lokale samenwerking faciliteren",
          waarom: "Ondernemers willen samenwerken maar concrete matches komen niet vanzelf tot stand.",
          voorWie: ["Verbinders", "Lokale netwerken", "Ondernemersverenigingen"],
          kans: "Organiseer een laagdrempelige lokale kennismaking of bundel complementaire diensten.",
          urgentie: "Gemiddeld",
        },
        {
          titel: "Subsidies en regelingen benutten",
          waarom: "Gemeenten en provincies hebben regelmatig subsidies beschikbaar die onbenut blijven bij kleine ondernemers.",
          voorWie: ["Adviseurs", "Duurzaamheidsspecialisten", "Bouwbedrijven"],
          kans: "Zoek actief naar openstaande subsidies voor verduurzaming of digitalisering via jouw gemeente.",
          urgentie: "Laag",
        },
      ];
      return res.json({ gemeente, kansen: fallback, cached: false, fallback: true });
    }
  });

  // ─── Wetgeving Inzendingen ─────────────────────────────────────────────────

  // POST /api/wetgeving/indienen — ondernemer dient een wet/regelgeving inzending in
  app.post("/api/wetgeving/indienen", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { afzender, onderwerp, regio, briefTekst } = req.body;

      if (!afzender || !onderwerp || !regio) {
        return res.status(400).json({ error: "Afzender, onderwerp en regio zijn verplicht" });
      }

      const result = await db.execute(sql`
        INSERT INTO wetgeving_inzendingen (user_id, afzender, onderwerp, regio, brief_tekst, status)
        VALUES (${user.id}, ${afzender.trim()}, ${onderwerp.trim()}, ${regio.trim()}, ${briefTekst?.trim() ?? null}, 'ingediend')
        RETURNING id, afzender, onderwerp, regio, status, ingediend_op
      `);

      return res.status(201).json({ success: true, inzending: result.rows[0] });
    } catch (error) {
      console.error("[Wetgeving] Fout bij indienen:", error);
      return res.status(500).json({ error: "Inzending kon niet worden opgeslagen" });
    }
  });

  // GET /api/wetgeving/inzendingen — admin: alle inzendingen
  app.get("/api/wetgeving/inzendingen", requireAuth, requireAdmin, async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT
          wi.id,
          wi.afzender,
          wi.onderwerp,
          wi.regio,
          wi.brief_tekst,
          wi.status,
          wi.ingediend_op,
          u.first_name,
          u.last_name,
          u.email,
          u.business_name
        FROM wetgeving_inzendingen wi
        LEFT JOIN users u ON wi.user_id = u.id
        ORDER BY wi.ingediend_op DESC
      `);
      return res.json(result.rows);
    } catch (error) {
      console.error("[Wetgeving] Fout bij ophalen inzendingen:", error);
      return res.status(500).json({ error: "Kon inzendingen niet ophalen" });
    }
  });

  // PATCH /api/wetgeving/inzendingen/:id/status — admin: status bijwerken
  app.patch("/api/wetgeving/inzendingen/:id/status", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const VALID_STATUS = ["ingediend", "verwerkt", "gepubliceerd"];
      if (!status || !VALID_STATUS.includes(status)) {
        return res.status(400).json({ error: "Ongeldige status. Kies: ingediend, verwerkt of gepubliceerd" });
      }
      const result = await db.execute(sql`
        UPDATE wetgeving_inzendingen SET status = ${status} WHERE id = ${parseInt(id)} RETURNING id, status
      `);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Inzending niet gevonden" });
      }
      return res.json({ success: true, inzending: result.rows[0] });
    } catch (error) {
      console.error("[Wetgeving] Fout bij status-update:", error);
      return res.status(500).json({ error: "Status kon niet worden bijgewerkt" });
    }
  });

  // GET /api/wetgeving/publicaties — alle ingelogde leden: gepubliceerde items (gefilterd op regio als beschikbaar)
  app.get("/api/wetgeving/publicaties", requireAuth, async (req, res) => {
    try {
      const userRegion = req.user!.region;
      let filteredByRegio = false;
      let result;

      if (userRegion) {
        // Try regional filter first
        const regionalResult = await db.execute(sql`
          SELECT id, afzender, onderwerp, regio, ingediend_op
          FROM wetgeving_inzendingen
          WHERE status = 'gepubliceerd' AND regio = ${userRegion}
          ORDER BY ingediend_op DESC
        `);

        if (regionalResult.rows.length > 0) {
          // Regional results found — use them and mark as filtered
          result = regionalResult;
          filteredByRegio = true;
        } else {
          // No regional results — fall back to all published items
          result = await db.execute(sql`
            SELECT id, afzender, onderwerp, regio, ingediend_op
            FROM wetgeving_inzendingen
            WHERE status = 'gepubliceerd'
            ORDER BY ingediend_op DESC
          `);
          filteredByRegio = false;
        }
      } else {
        result = await db.execute(sql`
          SELECT id, afzender, onderwerp, regio, ingediend_op
          FROM wetgeving_inzendingen
          WHERE status = 'gepubliceerd'
          ORDER BY ingediend_op DESC
        `);
        filteredByRegio = false;
      }

      return res.json({ items: result.rows, filteredByRegio });
    } catch (error) {
      console.error("[Wetgeving] Fout bij ophalen publicaties:", error);
      return res.status(500).json({ error: "Kon publicaties niet ophalen" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────

  const httpServer = createServer(app);
  return httpServer;
}
