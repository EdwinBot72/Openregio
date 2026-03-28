import cron from "node-cron";
import { storage } from "../storage";
import type { InsertOndernemerThema } from "@shared/schema";

// ─── Thema-definities ────────────────────────────────────────────────────────

const THEMA_DEFS = [
  {
    themaId: "energie",
    titel: "Energietransitie & kosten",
    trefwoorden: ["energie", "energieprijs", "gas", "stroom", "zonnepanelen", "verduurzaming", "warmtepomp", "EV"],
  },
  {
    themaId: "regelgeving",
    titel: "EU-regelgeving & duurzaamheidsrapportage",
    trefwoorden: ["CSRD", "ESG", "duurzaamheid", "EU", "regelgeving", "wetgeving", "rapportage", "Fit for 55"],
  },
  {
    themaId: "arbeidsmarkt",
    titel: "Arbeidsmarkt & personeel",
    trefwoorden: ["arbeidsmarkt", "personeel", "cao", "minimumloon", "uitzendkracht", "arbeid", "werknemer", "loon"],
  },
  {
    themaId: "ai",
    titel: "AI & digitalisering",
    trefwoorden: ["AI", "kunstmatige intelligentie", "digitalisering", "technologie", "automatisering", "chatbot", "software"],
  },
  {
    themaId: "circulair",
    titel: "Circulaire economie & lokaal inkopen",
    trefwoorden: ["circulair", "duurzaam", "recycling", "aanbesteding", "inkopen", "lokaal", "grondstof"],
  },
  {
    themaId: "financiering",
    titel: "Financiering & inflatie",
    trefwoorden: ["inflatie", "rente", "financiering", "lening", "subsidie", "fonds", "mkb", "kosten", "krediet"],
  },
] as const;

// ─── Gemini helper ───────────────────────────────────────────────────────────

async function genAI() {
  const { GoogleGenAI } = await import("@google/genai");
  return new GoogleGenAI({
    apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
    ...(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
      ? { httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL! } }
      : {}),
  });
}

// ─── Refresh één thema ───────────────────────────────────────────────────────

async function refreshThema(
  thema: (typeof THEMA_DEFS)[number],
  signaalContext: string
): Promise<InsertOndernemerThema | null> {
  try {
    const ai = await genAI();

    const prompt = `Je bent een adviseur voor Nederlandse mkb-ondernemers (zzp, detailhandel, horeca, bouw, zorg, transport).

Thema: **${thema.titel}**

Recente nieuwsitems uit Nederland (maximaal 10):
${signaalContext || "(geen recente signalen beschikbaar — gebruik algemene actuele kennis)"}

Taak: schrijf een korte, actuele analyse van dit thema voor lokale ondernemers in Nederland. Wees concreet, positief van toon en praktisch.

Geef je antwoord ALLEEN als geldig JSON (geen markdown, geen uitleg buiten de JSON):
{
  "samenvatting": "2-3 zinnen over wat er speelt en waarom dit belangrijk is voor ondernemers. Verwijs naar actuele ontwikkelingen.",
  "tag": "één van: Hoog impact | Kans | Actueel | Nieuwe verplichtingen | Let op",
  "acties": [
    "concrete actie 1 die een ondernemer nu kan ondernemen",
    "concrete actie 2",
    "concrete actie 3"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    let raw = response.text?.trim() ?? "";
    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    // Extract first JSON object
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`Geen JSON gevonden: ${raw.slice(0, 100)}`);

    const parsed = JSON.parse(jsonMatch[0]);
    const samenvatting = String(parsed.samenvatting ?? "").slice(0, 1000);
    const tag = String(parsed.tag ?? "Actueel").slice(0, 50);
    const acties: string[] = Array.isArray(parsed.acties)
      ? parsed.acties.slice(0, 3).map((a: unknown) => String(a).slice(0, 300))
      : [];

    if (!samenvatting || acties.length === 0) throw new Error("Onvolledig AI-antwoord");

    console.log(`[ThemaRefresh] ✓ ${thema.themaId} vernieuwd`);
    return {
      themaId: thema.themaId,
      titel: thema.titel,
      tag,
      samenvatting,
      acties,
      bijgewerktOp: new Date(),
    };
  } catch (err) {
    console.error(`[ThemaRefresh] ✗ ${thema.themaId}:`, (err as Error).message);
    return null;
  }
}

// ─── Hoofdfunctie ─────────────────────────────────────────────────────────────

export async function runThemaRefresh(): Promise<void> {
  console.log("[ThemaRefresh] Wekelijkse thema-refresh gestart");

  // Haal recente signalen op als context voor Gemini
  const alleSignalen = await storage.getIntelSignalen();
  const recentSignalen = alleSignalen.slice(0, 40); // maximaal 40 voor context

  let vernieuwd = 0;

  for (const thema of THEMA_DEFS) {
    // Filter signalen die relevant zijn voor dit thema op basis van trefwoorden
    const relevant = recentSignalen.filter((s) =>
      thema.trefwoorden.some(
        (kw) =>
          s.titel.toLowerCase().includes(kw.toLowerCase()) ||
          s.samenvatting.toLowerCase().includes(kw.toLowerCase())
      )
    );

    // Bouw context string: max 10 relevante signalen, anders meest recente
    const contextSignalen = relevant.length >= 3 ? relevant.slice(0, 10) : recentSignalen.slice(0, 10);
    const signaalContext = contextSignalen
      .map((s, i) => `${i + 1}. ${s.titel}: ${s.samenvatting.slice(0, 200)}`)
      .join("\n");

    const result = await refreshThema(thema, signaalContext);
    if (result) {
      await storage.upsertOndernemerThema(result);
      vernieuwd++;
    }
  }

  console.log(`[ThemaRefresh] Klaar — ${vernieuwd}/${THEMA_DEFS.length} thema's vernieuwd`);
}

// ─── Wekelijkse cron-taak ────────────────────────────────────────────────────

export function startThemaRefreshCron(): void {
  // Elke maandag om 07:00 Nederlandse tijd
  cron.schedule(
    "0 7 * * 1",
    async () => {
      try {
        await runThemaRefresh();
      } catch (err) {
        console.error("[ThemaRefresh] Onverwachte fout:", err);
      }
    },
    { timezone: "Europe/Amsterdam" }
  );
  console.log("[ThemaRefresh] Wekelijkse cron-taak geregistreerd (maandag 07:00 AMS)");
}

// ─── Startup-check (na migraties aan te roepen) ────────────────────────────

export async function runThemaRefreshIfEmpty(): Promise<void> {
  try {
    const bestaand = await storage.getOndernemerThemas();
    if (bestaand.length === 0) {
      console.log("[ThemaRefresh] Geen thema's in DB — directe refresh gestart");
      await runThemaRefresh();
    } else {
      console.log(`[ThemaRefresh] DB bevat al ${bestaand.length} thema's — geen opstartrefresh nodig`);
    }
  } catch (err) {
    console.error("[ThemaRefresh] Opstartfout:", (err as Error).message);
  }
}
