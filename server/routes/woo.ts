import { Router } from "express";
import {
  EXTRACT_MODE_SYSTEM,
  EXTRACT_MODE_USER,
  GENERATE_MODE_SYSTEM,
  GENERATE_MODE_USER,
  QUESTIONS_GENERATOR_SYSTEM,
  intakeSchema,
  extractSchema,
  questionsSchema,
  generateSchema,
  simpleGenerateSchema,
  saveDossierSchema,
  extractOutputSchema,
  generateOutputSchema,
  questionsOutputSchema,
  zodToJsonSchema,
  calculateDeadline,
  DEFAULT_CHECKLIST,
  WOO_MODEL,
} from "../plugins/woo";
import type { IStorage } from "../storage";

interface AuthenticatedRequest {
  user?: { id: string };
}

export function createWooRouter(
  storage: IStorage,
  requireAuth: (req: any, res: any, next: any) => void
): Router {
  const router = Router();

  router.get("/regions", async (_req, res) => {
    try {
      const regions = await storage.getWooRegions();
      res.json(regions);
    } catch (err: any) {
      console.error("Error fetching WOO regions:", err);
      res.status(500).json({ error: "Kon regio's niet ophalen" });
    }
  });

  router.get("/authorities", async (_req, res) => {
    try {
      const authorities = await storage.getWooAuthorities();
      res.json(authorities);
    } catch (err: any) {
      console.error("Error fetching WOO authorities:", err);
      res.status(500).json({ error: "Kon bestuursorganen niet ophalen" });
    }
  });

  router.post("/generate", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          error: "WOO Generator is tijdelijk niet beschikbaar",
          details: "De AI-configuratie is nog niet voltooid.",
          action: "Vraag de beheerder om OPENAI_API_KEY te configureren.",
        });
      }

      const parsed = simpleGenerateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Onvolledige aanvraag",
          details: parsed.error.errors,
        });
      }

      const { authority, subject, context, requestedDocuments } = parsed.data;
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const today = new Date().toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const simplePrompt = `Je bent een expert in het opstellen van WOO-verzoeken (Wet open overheid).
Genereer een professionele, juridisch correcte WOO-brief die direct gebruikt kan worden.

Bestuursorgaan: ${authority}
Onderwerp: ${subject}
${context ? `Context: ${context}` : ""}
${requestedDocuments ? `Gevraagde stukken: ${requestedDocuments}` : ""}
Datum: ${today}

Maak een complete brief met checklist.`;

      const completion = await openai.chat.completions.create({
        model: WOO_MODEL,
        messages: [
          { role: "user", content: simplePrompt },
        ],
        temperature: 0.7,
      });

      const generatedContent = completion.choices[0]?.message?.content || "";

      res.json({
        success: true,
        letter: generatedContent,
        checklist: DEFAULT_CHECKLIST.map((item) => `- ${item}`).join("\n"),
        fullContent: generatedContent,
        metadata: {
          authority,
          subject,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error("WOO Generator error:", err);
      res.status(500).json({
        error: "WOO-brief genereren mislukt",
        message: err?.message ?? String(err),
        action: "Probeer het opnieuw of neem contact op met support.",
      });
    }
  });

  router.post("/dossiers", requireAuth, async (req, res) => {
    try {
      const parsed = saveDossierSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Onvolledige aanvraag",
          details: parsed.error.errors,
        });
      }

      const authReq = req as AuthenticatedRequest;
      const dossier = await storage.createWooDossier({
        userId: authReq.user!.id,
        ...parsed.data,
        context: parsed.data.context || null,
        requestedDocuments: parsed.data.requestedDocuments || null,
        checklist: parsed.data.checklist || null,
      });

      res.status(201).json(dossier);
    } catch (err: any) {
      console.error("Create dossier error:", err);
      res.status(500).json({ error: "Dossier opslaan mislukt" });
    }
  });

  router.get("/dossiers", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const dossiers = await storage.getWooDossiers(authReq.user!.id);
      res.json(dossiers);
    } catch (err: any) {
      console.error("Get dossiers error:", err);
      res.status(500).json({ error: "Dossiers ophalen mislukt" });
    }
  });

  router.get("/dossiers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Ongeldig dossier ID" });
      }

      const authReq = req as AuthenticatedRequest;
      const dossier = await storage.getWooDossier(id, authReq.user!.id);
      if (!dossier) {
        return res.status(404).json({ error: "Dossier niet gevonden" });
      }

      res.json(dossier);
    } catch (err: any) {
      console.error("Get dossier error:", err);
      res.status(500).json({ error: "Dossier ophalen mislukt" });
    }
  });

  router.post("/wizard/intake", requireAuth, async (req, res) => {
    try {
      const parsed = intakeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Bestuursorgaan en onderwerp zijn verplicht",
          details: parsed.error.errors,
        });
      }

      const authReq = req as AuthenticatedRequest;
      const dossier = await storage.createWooDossier({
        userId: authReq.user!.id,
        authority: parsed.data.authority,
        subject: parsed.data.subject,
        uploadedDocument: parsed.data.uploadedDocument || null,
        location: parsed.data.location || null,
        purpose: parsed.data.purpose || null,
        userQuestion: parsed.data.userQuestion || null,
        status: "intake",
      });

      res.status(201).json(dossier);
    } catch (err: any) {
      console.error("WOO intake error:", err);
      res.status(500).json({ error: "Intake opslaan mislukt" });
    }
  });

  router.post("/wizard/extract", requireAuth, async (req, res) => {
    try {
      const parsed = extractSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Dossier ID en documenttekst zijn verplicht",
          details: parsed.error.errors,
        });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "OpenAI API niet geconfigureerd" });
      }

      const { dossierId, documentText } = parsed.data;
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const jsonSchema = zodToJsonSchema(extractOutputSchema);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: EXTRACT_MODE_SYSTEM },
          { role: "user", content: EXTRACT_MODE_USER(documentText) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "extract_output",
            strict: true,
            schema: jsonSchema,
          },
        },
      });

      const extractedData = JSON.parse(
        response.choices[0].message.content || "{}"
      );

      const authReq = req as AuthenticatedRequest;
      await storage.updateWooDossier(dossierId, authReq.user!.id, {
        extractedData,
        status: "extracted",
      });

      res.json({ success: true, extractedData });
    } catch (err: any) {
      console.error("WOO extract error:", err);
      res.status(500).json({ error: "Analyse mislukt", message: err?.message });
    }
  });

  router.post("/wizard/questions", requireAuth, async (req, res) => {
    try {
      const parsed = questionsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Dossier ID is verplicht",
          details: parsed.error.errors,
        });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "OpenAI API niet geconfigureerd" });
      }

      const { dossierId, extractedData, purpose, userQuestion } = parsed.data;
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const jsonSchema = zodToJsonSchema(questionsOutputSchema);

      const userPrompt = `Genereer een vragenlijst voor een WOO-verzoek.

Doel: ${purpose || "onderzoek"}
Gebruikersvraag: ${userQuestion || "Alle relevante documenten"}

Geëxtraheerde data:
${JSON.stringify(extractedData, null, 2)}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: QUESTIONS_GENERATOR_SYSTEM },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "questions_output",
            strict: true,
            schema: jsonSchema,
          },
        },
      });

      const result = JSON.parse(
        response.choices[0].message.content || '{"suggestedQuestions":[]}'
      );

      const documentList = result.suggestedQuestions.map((q: any) => ({
        category: q.category,
        documents: q.documents,
        priority: q.priority,
        rationale: q.rationale,
      }));

      const authReq = req as AuthenticatedRequest;
      await storage.updateWooDossier(dossierId, authReq.user!.id, {
        documentList,
        status: "questions",
      });

      res.json({
        success: true,
        documentList,
        aanvullendeVragen: result.aanvullendeVragen || [],
      });
    } catch (err: any) {
      console.error("WOO questions error:", err);
      res.status(500).json({
        error: "Vraagset genereren mislukt",
        message: err?.message,
      });
    }
  });

  router.post("/wizard/generate", requireAuth, async (req, res) => {
    try {
      const parsed = generateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Vereiste velden ontbreken",
          details: parsed.error.errors,
        });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "OpenAI API niet geconfigureerd" });
      }

      const {
        dossierId,
        authority,
        subject,
        extractedData,
        selectedQuestions,
        location,
        senderName,
        senderAddress,
        senderEmail,
      } = parsed.data;

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const jsonSchema = zodToJsonSchema(generateOutputSchema);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: GENERATE_MODE_SYSTEM },
          {
            role: "user",
            content: GENERATE_MODE_USER({
              authority,
              subject,
              extractedData,
              selectedQuestions: selectedQuestions || [],
              location,
              senderName: senderName || undefined,
              senderAddress: senderAddress || undefined,
              senderEmail: senderEmail || undefined,
            }),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "generate_output",
            strict: true,
            schema: jsonSchema,
          },
        },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      const fullLetter = [
        result.wooVerzoek?.briefhoofd || "",
        "",
        `Betreft: ${result.wooVerzoek?.onderwerpregel || subject}`,
        "",
        result.wooVerzoek?.inhoud || "",
        "",
        result.wooVerzoek?.afsluiting || "",
      ].join("\n");

      const authReq = req as AuthenticatedRequest;
      await storage.updateWooDossier(dossierId, authReq.user!.id, {
        generatedLetter: fullLetter,
        checklist: JSON.stringify(result.checklist || DEFAULT_CHECKLIST),
        requestedDocuments: JSON.stringify(result.inventarislijst || []),
        status: "generated",
        deadline: calculateDeadline(),
      });

      res.json({
        success: true,
        wooVerzoek: result.wooVerzoek,
        inventarislijst: result.inventarislijst,
        ingebrekestelling: result.ingebrekestelling,
        bezwaarschrift: result.bezwaarschrift,
        checklist: result.checklist || DEFAULT_CHECKLIST,
        metadata: result.metadata || {
          gegenereerd: new Date().toISOString(),
          termijn: "4 weken",
          deadlineDatum: calculateDeadline().toLocaleDateString("nl-NL"),
        },
        letter: fullLetter,
      });
    } catch (err: any) {
      console.error("WOO generate error:", err);
      res.status(500).json({
        error: "Brief genereren mislukt",
        message: err?.message,
      });
    }
  });

  router.patch("/dossiers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Ongeldig dossier ID" });
      }

      const authReq = req as AuthenticatedRequest;
      const updated = await storage.updateWooDossier(id, authReq.user!.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Dossier niet gevonden" });
      }

      res.json(updated);
    } catch (err: any) {
      console.error("Update dossier error:", err);
      res.status(500).json({ error: "Dossier bijwerken mislukt" });
    }
  });

  return router;
}
