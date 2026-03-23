import cron from "node-cron";
import { storage } from "../storage";
import type { InsertIntelSignaal } from "@shared/schema";

const RSS_FEEDS = [
  {
    url: "https://feeds.nos.nl/nosnieuwseconomie",
    bron: "NOS Economie",
    defaultCategorie: "financieel" as const,
    defaultUrgentie: "normaal" as const,
  },
  {
    url: "https://feeds.nos.nl/nosnieuwsbinnenland",
    bron: "NOS Binnenland",
    defaultCategorie: "beleid" as const,
    defaultUrgentie: "normaal" as const,
  },
  {
    url: "https://www.nu.nl/rss/Economie",
    bron: "NU.nl Economie",
    defaultCategorie: "financieel" as const,
    defaultUrgentie: "normaal" as const,
  },
  {
    url: "https://www.nu.nl/rss/Politiek",
    bron: "NU.nl Politiek",
    defaultCategorie: "beleid" as const,
    defaultUrgentie: "normaal" as const,
  },
];

const SUBSIDIE_KEYWORDS = [
  "subsidie", "subsidies", "fonds", "financiering", "steunmaatregel",
  "regeling", "voucher", "mkb-fonds", "stimulerings",
];
const WETGEVING_KEYWORDS = [
  "wet ", "wetsvoorstel", "wetgeving", "besluit", "verordening",
  "amvb", "richtlijn", "regeling", "aanpassing wet", "kamer stemt",
];
const BELEID_KEYWORDS = [
  "beleid", "maatregel", "gemeente", "overheid", "kabinet", "minister",
  "akkoord", "afspraken", "coalitie", "plan van aanpak",
];

type IntelCategorie = "wetgeving" | "beleid" | "financieel" | "subsidies";
type IntelUrgentie = "hoog" | "normaal" | "info";

function bepaalCategorie(
  titel: string,
  desc: string,
  defaultCat: IntelCategorie
): IntelCategorie {
  const haystack = (titel + " " + desc).toLowerCase();
  if (SUBSIDIE_KEYWORDS.some((k) => haystack.includes(k))) return "subsidies";
  if (WETGEVING_KEYWORDS.some((k) => haystack.includes(k))) return "wetgeving";
  if (BELEID_KEYWORDS.some((k) => haystack.includes(k))) return "beleid";
  return defaultCat;
}

const HOOG_KEYWORDS = [
  "per direct", "direct ingegaan", "spoedwet", "noodmaatregel",
  "urgent", "crisis", "alarm", "waarschuwing",
];

function bepaalUrgentie(titel: string, desc: string): IntelUrgentie {
  const haystack = (titel + " " + desc).toLowerCase();
  if (HOOG_KEYWORDS.some((k) => haystack.includes(k))) return "hoog";
  return "normaal";
}

function parseRssDate(pubDate?: string): Date {
  if (!pubDate) return new Date();
  const d = new Date(pubDate);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function fetchWithTimeout(url: string, ms = 12_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function extractCdataOrPlain(xml: string, tag: string): string {
  const cdataMatch = new RegExp(
    `<${tag}><\\!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`,
    "s"
  ).exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = new RegExp(`<${tag}>(.*?)<\\/${tag}>`, "s").exec(xml);
  return plainMatch ? plainMatch[1].replace(/<[^>]+>/g, "").trim() : "";
}

async function fetchRssFeed(
  url: string,
  bron: string,
  defaultCategorie: IntelCategorie,
  defaultUrgentie: IntelUrgentie,
  maxItems = 8
): Promise<InsertIntelSignaal[]> {
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      console.error(`[IntelCron] ${bron}: HTTP ${res.status}`);
      return [];
    }
    const text = await res.text();
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(
      0,
      maxItems
    );
    const results: InsertIntelSignaal[] = [];
    for (const m of items) {
      const item = m[1];
      const titel = extractCdataOrPlain(item, "title");
      if (!titel) continue;
      const desc = extractCdataOrPlain(item, "description").slice(0, 2000);
      const link = (item.match(/<link>(.*?)<\/link>/) ?? item.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/))?.[1]?.trim() ?? "";
      const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) )?.[1];

      const categorie = bepaalCategorie(titel, desc, defaultCategorie);
      const urgentie = bepaalUrgentie(titel, desc);
      const externalId = link
        ? `rss-${Buffer.from(link).toString("base64").slice(0, 60)}`
        : undefined;

      results.push({
        categorie,
        urgentie,
        titel: titel.slice(0, 512),
        samenvatting: desc || "Geen samenvatting beschikbaar.",
        bron,
        regio: "Nationaal",
        datum: parseRssDate(pubDate),
        bronUrl: link || undefined,
        isPublished: true,
        externalId,
      });
    }
    console.log(`[IntelCron] ${bron}: ${results.length} items gevonden`);
    return results;
  } catch (err) {
    console.error(`[IntelCron] ${bron} fetch fout:`, (err as Error).message);
    return [];
  }
}

export async function runIntelFetch(): Promise<number> {
  console.log("[IntelCron] Fetch-ronde gestart");

  const allResults = await Promise.all(
    RSS_FEEDS.map((f) =>
      fetchRssFeed(f.url, f.bron, f.defaultCategorie, f.defaultUrgentie)
    )
  );

  const candidates = allResults.flat();
  let nieuw = 0;

  for (const kandidaat of candidates) {
    if (!kandidaat.externalId) {
      await storage.createIntelSignaal(kandidaat);
      nieuw++;
      continue;
    }
    const bestaand = await storage.getIntelSignaalByExternalId(
      kandidaat.externalId
    );
    if (!bestaand) {
      await storage.createIntelSignaal(kandidaat);
      nieuw++;
    }
  }

  console.log(
    `[IntelCron] Fetch-ronde klaar — ${nieuw} nieuwe signalen opgeslagen`
  );
  return nieuw;
}

export function startIntelCron() {
  cron.schedule(
    "0 6 * * *",
    async () => {
      try {
        await runIntelFetch();
      } catch (err) {
        console.error("[IntelCron] Onverwachte fout:", err);
      }
    },
    { timezone: "Europe/Amsterdam" }
  );
  console.log("[IntelCron] Dagelijkse cron-taak geregistreerd (06:00 AMS)");
}
