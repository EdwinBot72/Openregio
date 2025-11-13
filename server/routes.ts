import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEntrepreneurSchema, strictEntrepreneurSchema, insertProposalSchema, insertChatRoomSchema, insertChatMessageSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Proposals routes
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

  app.post("/api/proposals/:id/vote", async (req, res) => {
    try {
      const { voteType } = req.body;
      if (!["for", "against", "abstain"].includes(voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }
      const proposal = await storage.voteOnProposal(req.params.id, voteType);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
