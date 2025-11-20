import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEntrepreneurSchema, strictEntrepreneurSchema, insertProposalSchema, insertVoteSchema, insertChatRoomSchema, insertChatMessageSchema, insertPostSchema, insertUserProfileSchema, insertSubscriptionSchema, insertBedrijfsprofielSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { createMollieClient } from "@mollie/api-client";
import { setupSimpleAuth } from "./simpleAuth";
import { attachUser } from "./middleware/auth";
import { seedMasterAccount } from "./seed";
import { generateRandomPassword, generateOnboardingToken, getPlanPrice, getPlanDisplayName } from "./utils/auth";
import bcrypt from "bcrypt";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize email/password auth (API endpoints)
  setupSimpleAuth(app);
  
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
        redirectUrl: `${baseUrl}/payment-success?email=${encodeURIComponent(email)}&plan=${plan}`,
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
          
          console.log(`✓ User created: ${user.id} (${email})`);
          console.log(`  Temporary password: ${tempPassword}`);
          console.log(`  Onboarding token: ${onboardingToken}`);
          
          // TODO: Send welcome email with temporary password and onboarding link
          // const onboardingLink = `${baseUrl}/onboarding?token=${onboardingToken}`;
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
      if (!req.session.userId) {
        return res.status(401).json({ error: "Niet ingelogd" });
      }

      const profiel = await storage.getBedrijfsprofielByUserId(req.session.userId);
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
      if (!req.session.userId) {
        return res.status(401).json({ error: "Niet ingelogd" });
      }

      const validationResult = insertBedrijfsprofielSchema.safeParse({
        ...req.body,
        gebruikerId: req.session.userId,
      });

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const existingProfiel = await storage.getBedrijfsprofielByUserId(req.session.userId);

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
  app.get("/api/proposals/summary", async (req, res) => {
    try {
      const userId = "user-jan";
      const summaries = await storage.getProposalSummaries(userId);
      res.json(summaries);
    } catch (error) {
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

  app.post("/api/proposals/:id/vote", async (req, res) => {
    try {
      const { choice } = req.body;
      const userId = "user-jan";
      
      const validatedVote = insertVoteSchema.parse({
        proposalId: req.params.id,
        userId,
        choice,
      });
      
      const vote = await storage.createVote(validatedVote);
      const voteCounts = await storage.getVoteCounts(req.params.id);
      
      res.status(201).json({ vote, voteCounts });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      if (error instanceof Error) {
        if (error.message === "Proposal not found") {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === "Cannot vote on closed proposal") {
          return res.status(403).json({ error: error.message });
        }
        if (error.message === "User has already voted on this proposal") {
          return res.status(409).json({ error: error.message });
        }
      }
      
      res.status(500).json({ error: "Failed to vote on proposal" });
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

  // RegioBot chat route with intent support
  app.post("/api/regiobot/chat", async (req, res) => {
    try {
      const { message, intent } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      // Intent-based system prompts
      const intentPrompts: Record<string, string> = {
        general: `Je bent RegioBot, een vriendelijke AI-assistent voor lokale ondernemers in Nederland. Je helpt met:
- Het schrijven van social media posts en marketing teksten
- Het creëren van aantrekkelijke aanbiedingen
- Lokale SEO tips en strategieën
- Klantbereik vergroten
- Slimme automatiseringen

Wees altijd behulpzaam, professioneel en positief. Schrijf in het Nederlands en houd rekening met de lokale context van Nederlandse ondernemers.`,

        social_post: `Je bent RegioBot, een expert social media content creator voor lokale ondernemers in Nederland.
        
Je taak: Schrijf een overtuigende, authentieke social media post die past bij lokale Nederlandse ondernemers.

Richtlijnen:
- Schrijf in een vriendelijke, toegankelijke toon
- Gebruik waar gepast emoji's (max 2-3)
- Houd het kort en krachtig (max 150 woorden)
- Voeg een duidelijke call-to-action toe
- Focus op lokale verbinding en gemeenschap
- Schrijf in het Nederlands

Output formaat: Geef alleen de kant-en-klare post terug, zonder extra uitleg of aanhalingstekens.`,

        offer: `Je bent RegioBot, een marketing specialist voor lokale aanbiedingen in Nederland.

Je taak: Creëer een aantrekkelijke aanbieding of promotie voor een lokale ondernemer.

Richtlijnen:
- Maak de aanbieding concreet en waardevol
- Gebruik urgentie (beperkte tijd/aantal)
- Vermeld duidelijk de voordelen
- Schrijf een pakkende titel
- Voeg voorwaarden toe indien relevant
- Houd het lokaal en persoonlijk
- Schrijf in het Nederlands

Output formaat:
**[Titel van aanbieding]**

[Beschrijving van de aanbieding met details]

**Geldig:** [periode]
**Voorwaarden:** [indien van toepassing]`,

        seo: `Je bent RegioBot, een lokale SEO expert voor Nederlandse ondernemers.

Je taak: Geef concrete, praktische SEO tips specifiek voor lokale vindbaarheid.

Richtlijnen:
- Focus op lokale zoekwoorden en Google My Business
- Geef actionable tips (geen algemene theorie)
- Leg uit waarom het belangrijk is
- Vermeld quick wins
- Houd het toegankelijk voor niet-technische ondernemers
- Schrijf in het Nederlands

Output formaat: Duidelijke, genummerde stappen of tips.`,

        legal_explain: `Je bent RegioBot, een toegankelijke juridische uitlegger voor Nederlandse ondernemers.

Je taak: Leg juridische documenten, brieven of regelgeving uit in begrijpelijke taal.

Richtlijnen:
- Vertaal jargon naar dagelijkse taal
- Vat de belangrijkste punten samen
- Leg consequenties en acties uit
- Wees helder over wat ondernemer moet doen
- Geef disclaimer: dit is geen juridisch advies
- Schrijf in het Nederlands

Output formaat: Heldere samenvatting met bullet points voor belangrijkste punten.`,

        check_text: `Je bent RegioBot, een professionele copy editor voor Nederlandse zakelijke communicatie.

Je taak: Controleer en verbeter de aangeleverde tekst.

Richtlijnen:
- Check spelling, grammatica en zinsbouw
- Verbeter leesbaarheid en toon
- Behoud de bedoeling en persoonlijkheid
- Geef feedback over wat je veranderd hebt
- Schrijf in het Nederlands

Output formaat:
**Verbeterde versie:**
[Verbeterde tekst]

**Aanpassingen:**
- [Wat je veranderd hebt en waarom]`,
      };

      // Get system prompt based on intent, defaults to general
      const systemPrompt = intentPrompts[intent || "general"] || intentPrompts.general;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

      const response = completion.choices[0]?.message?.content || "Sorry, ik kon geen antwoord genereren.";
      res.json({ response, intent: intent || "general" });
    } catch (error) {
      console.error("RegioBot error:", error);
      res.status(500).json({ error: "Failed to get response from RegioBot" });
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
          value: plan === "pro" ? "19.99" : "9.99"
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
                value: plan === "pro" ? "19.99" : "9.99"
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

  const httpServer = createServer(app);
  return httpServer;
}
