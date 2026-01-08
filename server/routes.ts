import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEntrepreneurSchema, strictEntrepreneurSchema, insertProposalSchema, insertVoteSchema, insertChatRoomSchema, insertChatMessageSchema, insertPostSchema, insertUserProfileSchema, insertSubscriptionSchema, insertBedrijfsprofielSchema, regioBotChatSchema, visibilitySettingsSchema, DEFAULT_VISIBILITY_SETTINGS } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { createMollieClient } from "@mollie/api-client";
import { setupJwtAuth, attachUser, requireAuth, requirePro, issueTokensForUser, clearTokenCookies, revokeAllUserTokens } from "./jwtAuth";
import { requireAdmin } from "./middleware/auth";
import { seedMasterAccount } from "./seed";
import { generateRandomPassword, generateOnboardingToken, getPlanPrice, getPlanDisplayName } from "./utils/auth";
import bcrypt from "bcrypt";
import { upload, getDocumentType } from "./middleware/upload";
import { runRegioBot } from "./regiobot";

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
  
  // BLOK 2: Mollie Payment Flow (Basic €9,95 / Pro €19,95)
  
  // POST /start - Create Mollie payment for plan subscription
  app.post("/start", async (req, res) => {
    try {
      const { email, plan } = req.body;
      
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
      
      const baseUrl = getBaseUrl(req);
      const amount = getPlanPrice(plan);
      const description = `${getPlanDisplayName(plan)} - Maandelijks abonnement`;
      
      // Create Mollie payment
      const payment = await mollieClient.payments.create({
        amount: {
          value: amount,
          currency: "EUR"
        },
        description,
        redirectUrl: `${baseUrl}/betaling-geslaagd?email=${encodeURIComponent(email)}`,
        webhookUrl: `${baseUrl}/api/mollie/webhook`,
        metadata: {
          email,
          plan,
          source: "openregio-signup"
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
      res.status(500).json({ error: "Kon betaling niet aanmaken" });
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
        const { email, plan } = payment.metadata as { email: string; plan: string };
        
        if (!email || !plan) {
          console.error("Payment metadata incomplete:", payment.metadata);
          return res.status(200).send("OK"); // Still return 200 to acknowledge webhook
        }
        
        console.log(`✓ Payment PAID for ${email} (${plan})`);
        
        // Check if user already exists
        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          // Generate random password and onboarding token
          const tempPassword = generateRandomPassword();
          const onboardingToken = generateOnboardingToken();
          const passwordHash = await bcrypt.hash(tempPassword, 10);
          
          // Create new user
          user = await storage.createUser({
            email,
            passwordHash,
            plan: plan as "basic" | "pro",
            role: "member",
            mustCompleteOnboarding: true,
            onboardingToken,
          });
          
          // Create onboarding token record (expires in 7 days)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          
          await storage.createOnboardingToken({
            userId: user.id,
            token: onboardingToken,
            expiresAt,
          });
          
          console.log(`✓ User created: ${user.id} (${email})`);
          console.log(`  Temporary password: ${tempPassword}`);
          console.log(`  Onboarding token: ${onboardingToken}`);
          console.log(`  Onboarding link: ${baseUrl}/first-login?token=${onboardingToken}`);
          
          // TODO: Send welcome email with temporary password and onboarding link
          // const onboardingLink = `${baseUrl}/first-login?token=${onboardingToken}`;
          // await sendWelcomeEmail(email, tempPassword, onboardingLink);
          
        } else {
          console.log(`✓ User already exists: ${user.id} (${email})`);
          
          // Update user plan if different
          if (user.plan !== plan) {
            await storage.updateUserPlan(user.id, plan as "basic" | "pro");
            console.log(`  Updated plan: ${user.plan} → ${plan}`);
          }
        }
        
        // Create subscription record
        const subscription = await storage.createSubscription({
          userId: user.id,
          molliePaymentId: payment.id,
          plan: plan as "basic" | "pro",
          status: "active",
        });
        
        console.log(`✓ Subscription created: ${subscription.id}`);
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
        email: user.email,
        plan: user.plan,
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
        { value: "retail", label: "Retail" },
        { value: "food", label: "Horeca" },
        { value: "services", label: "Diensten" },
        { value: "tech", label: "Technologie" },
        { value: "health", label: "Gezondheid" },
        { value: "education", label: "Onderwijs" },
      ];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Business Profile routes
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
  app.post("/api/regiobot/upload", requirePro, upload.single('file'), async (req, res) => {
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
  app.get("/api/regiobot/documents", requirePro, async (req, res) => {
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

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create post" });
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

  const httpServer = createServer(app);
  return httpServer;
}
