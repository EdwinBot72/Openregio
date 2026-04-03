import cron from "node-cron";
import { storage } from "../storage";
import type { InsertIntelSignaal } from "@shared/schema";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, ms = 10_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseRssItems(xml: string): Array<{
  titel: string;
  desc: string;
  link: string;
  pubDate: string | undefined;
}> {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return items.map((m) => {
    const item = m[1];
    const titel =
      (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) ??
        item.match(/<title>(.*?)<\/title>/s))?.[1]?.trim() ?? "";
    const desc =
      (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/s) ??
        item.match(/<description>([\s\S]*?)<\/description>/s))?.[1]
        ?.replace(/<[^>]+>/g, "")
        ?.trim() ?? "";
    const link =
      item.match(/<link>(.*?)<\/link>/s)?.[1]?.trim() ??
      item.match(/<link\s*\/?>(.*?)<\/link>/s)?.[1]?.trim() ?? "";
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1]?.trim();
    return { titel, desc, link, pubDate };
  });
}

// ─── Relevantiefilter ─────────────────────────────────────────────────────────
// Filtert items die duidelijk NIET voor ondernemers relevant zijn:
// sport, entertainment, buitenland, criminaliteit, etc.

const EXCLUDE_KEYWORDS = [
  // Sport & entertainment
  "voetbal", "wielrenner", "tennis", "zwemmen", "olympisch", "eredivisie",
  "Champions League", "formule 1", "schaatsen", "sport",
  // Criminaliteit & politie
  "verdachte", "aangehouden", "politie", "schietpartij", "moordzaak", "rechtbank",
  // Buitenlands nieuws niet-zakelijk
  "Oekraïne", "Rusland", "Gaza", "Israël", "oorlog", "conflict", "aanslag",
  // Entertainment
  "acteur", "zangeres", "artiest", "televisie", "film", "serie",
  // Overig niet-zakelijk
  "overlijden", "brand", "storm", "aardbeving",
];

const REQUIRE_AT_LEAST_ONE = [
  // Subsidies & financieel
  "subsidie", "financiering", "lening", "fonds", "investering", "cofinanciering",
  "krediet", "tegemoetkoming", "voucher",
  // Regelgeving
  "wet", "regelgeving", "verordening", "besluit", "wijziging", "maatregel",
  "verplichting", "belasting", "btw", "accijns", "heffing",
  // Ondernemen direct
  "ondernemer", "mkb", "zzp", "bedrijf", "werkgever", "ondernemen",
  "kvk", "kamer van koophandel", "aanbesteding", "tender", "opdracht",
  // Vergunningen & procedures
  "vergunning", "omgevingsvergunning", "bestemmingsplan", "procedures",
  // Sectoren
  "detailhandel", "horeca", "agrarisch", "landbouw", "techniek", "bouw",
  "zorg", "retail", "handel",
  // Arbeidsmarkt ondernemer-perspectief
  "cao", "minimumloon", "arbeidsmarkt", "personeel", "zzp-er", "flex",
  // RVO-specifiek
  "rvo", "rijksdienst", "stimulering", "innovatie",
];

function isRelevantForOndernemer(titel: string, desc: string): boolean {
  const text = (titel + " " + desc).toLowerCase();

  // Uitfilteren als duidelijk niet-zakelijk
  for (const kw of EXCLUDE_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) return false;
  }

  // Accepteren als minstens één zakelijk sleutelwoord matcht
  for (const kw of REQUIRE_AT_LEAST_ONE) {
    if (text.includes(kw.toLowerCase())) return true;
  }

  // Twijfelgevallen: afwijzen (liever geen ruis)
  return false;
}

// ─── Feed-definities ─────────────────────────────────────────────────────────

type FeedDef = {
  url: string;
  bron: string;
  categorie: "wetgeving" | "beleid" | "financieel" | "subsidies";
  urgentie: "hoog" | "normaal" | "info";
  prefix: string;
  maxItems: number;
  alwaysRelevant?: boolean; // bronnen die per definitie zakelijk zijn, geen filter nodig
};

const FEEDS: FeedDef[] = [
  // ── Rijksoverheid ────────────────────────────────────────────────────────
  {
    url: "https://feeds.rijksoverheid.nl/nieuws.rss",
    bron: "Rijksoverheid",
    categorie: "wetgeving",
    urgentie: "normaal",
    prefix: "rvo-nieuws",
    maxItems: 15,
  },
  // ── Rijksdienst voor Ondernemend Nederland (RVO) ─────────────────────────
  // RVO publiceert uitsluitend ondernemer-relevante content (subsidies, regels)
  {
    url: "https://www.rvo.nl/rss/nieuws",
    bron: "RVO.nl",
    categorie: "subsidies",
    urgentie: "normaal",
    prefix: "rvo-rss",
    maxItems: 12,
    alwaysRelevant: true,
  },
  // ── KVK (Kamer van Koophandel) ───────────────────────────────────────────
  {
    url: "https://www.kvk.nl/rss.xml",
    bron: "KVK",
    categorie: "beleid",
    urgentie: "normaal",
    prefix: "kvk-rss",
    maxItems: 10,
    alwaysRelevant: true,
  },
  // ── Ondernemersplein (kvk.nl/ondernemersplein) ───────────────────────────
  {
    url: "https://www.ondernemersplein.kvk.nl/feed/",
    bron: "Ondernemersplein",
    categorie: "beleid",
    urgentie: "normaal",
    prefix: "oplein",
    maxItems: 10,
    alwaysRelevant: true,
  },
  // ── MKB-Nederland ────────────────────────────────────────────────────────
  {
    url: "https://www.mkb.nl/rss",
    bron: "MKB-Nederland",
    categorie: "beleid",
    urgentie: "normaal",
    prefix: "mkb-nl",
    maxItems: 8,
    alwaysRelevant: true,
  },
  // ── Belastingdienst – Nieuws voor ondernemers ────────────────────────────
  {
    url: "https://www.belastingdienst.nl/rss/nieuws.rss",
    bron: "Belastingdienst",
    categorie: "financieel",
    urgentie: "normaal",
    prefix: "bd-nieuws",
    maxItems: 8,
    alwaysRelevant: true,
  },
  // ── Rijksoverheid – Subsidies & financiering ─────────────────────────────
  {
    url: "https://feeds.rijksoverheid.nl/onderwerpen/subsidies-en-financiering.rss",
    bron: "Rijksoverheid – Subsidies",
    categorie: "subsidies",
    urgentie: "hoog",
    prefix: "rvo-subsidies",
    maxItems: 10,
    alwaysRelevant: true,
  },
];

// ─── Generieke RSS-fetcher ───────────────────────────────────────────────────

async function fetchFeed(feed: FeedDef): Promise<InsertIntelSignaal[]> {
  try {
    const res = await fetchWithTimeout(feed.url, 12_000);
    if (!res.ok) {
      console.warn(`[IntelCron] ${feed.bron} antwoordde ${res.status} — overgeslagen`);
      return [];
    }
    const text = await res.text();
    if (!text.includes("<item>")) {
      console.warn(`[IntelCron] ${feed.bron} gaf geen RSS terug — overgeslagen`);
      return [];
    }
    const items = parseRssItems(text).slice(0, feed.maxItems);
    const signalen: InsertIntelSignaal[] = [];
    for (const { titel, desc, link, pubDate } of items) {
      if (!titel) continue;

      // Relevantiecheck — sla over als duidelijk niet voor ondernemers
      if (!feed.alwaysRelevant && !isRelevantForOndernemer(titel, desc)) {
        console.log(`[IntelCron] ${feed.bron}: overgeslagen (niet relevant) — "${titel.slice(0, 60)}"`);
        continue;
      }

      const externalId = link
        ? `${feed.prefix}-${Buffer.from(link).toString("base64").slice(0, 64)}`
        : undefined;
      signalen.push({
        categorie: feed.categorie,
        urgentie: feed.urgentie,
        titel: titel.slice(0, 512),
        samenvatting: desc.slice(0, 2000) || "Geen samenvatting beschikbaar.",
        bron: feed.bron,
        regio: "Nationaal",
        datum: pubDate ? new Date(pubDate) : new Date(),
        bronUrl: link || undefined,
        isPublished: true,
        externalId,
      } satisfies InsertIntelSignaal);
    }
    console.log(`[IntelCron] ${feed.bron}: ${signalen.length} relevante signalen opgehaald`);
    return signalen;
  } catch (err) {
    console.error(`[IntelCron] Fout bij ${feed.bron}:`, (err as Error).message);
    return [];
  }
}

// ─── Opschonen oude niet-relevante bronnen ──────────────────────────────────
// Verwijdert signalen van bronnen die algemeen nieuws bevatten (NOS, NU.nl)
// zodat alleen ondernemer-relevante content overblijft.
const DEPRECATED_BRONNEN = [
  "NOS Binnenland",
  "NOS Politiek",
  "NOS Economie",
  "NU.nl Economie",
];

export async function cleanupDeprecatedSignalen(): Promise<number> {
  const alle = await storage.getIntelSignalen();
  const teVerwijderen = alle.filter((s) => DEPRECATED_BRONNEN.includes(s.bron));
  let verwijderd = 0;
  for (const signaal of teVerwijderen) {
    await storage.deleteIntelSignaal(signaal.id);
    verwijderd++;
  }
  if (verwijderd > 0) {
    console.log(`[IntelCron] Opschoning: ${verwijderd} niet-relevante signalen verwijderd (NOS/NU.nl)`);
  }
  return verwijderd;
}

// ─── Hoofdfunctie ─────────────────────────────────────────────────────────
export async function runIntelFetch(): Promise<number> {
  console.log("[IntelCron] Fetch-ronde gestart");

  // Verwijder eerst signalen van niet-relevante bronnen
  await cleanupDeprecatedSignalen();

  const results = await Promise.all(FEEDS.map(fetchFeed));
  const candidates = results.flat();
  let nieuw = 0;

  for (const kandidaat of candidates) {
    if (!kandidaat.externalId) {
      await storage.createIntelSignaal(kandidaat);
      nieuw++;
      continue;
    }
    const bestaand = await storage.getIntelSignaalByExternalId(kandidaat.externalId);
    if (!bestaand) {
      await storage.createIntelSignaal(kandidaat);
      nieuw++;
    }
  }

  console.log(`[IntelCron] Fetch-ronde klaar — ${nieuw} nieuwe signalen opgeslagen`);
  return nieuw;
}

// ─── Dagelijkse cron-taak ────────────────────────────────────────────────────
// Elke dag om 06:00 Nederlandse tijd
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

  // Altijd: verwijder oude niet-relevante signalen bij opstarten
  // Daarna: populeer de DB als de tabel leeg is (bijv. productie-deploy)
  setImmediate(async () => {
    try {
      // Stap 1: opschonen van NOS/NU.nl signalen (altijd)
      const verwijderd = await cleanupDeprecatedSignalen();

      // Stap 2: fetch nieuwe signalen als de DB leeg is na opschoning
      const bestaand = await storage.getIntelSignalen();
      if (bestaand.length === 0) {
        console.log("[IntelCron] Geen relevante signalen in DB — directe opstartfetch gestart");
        await runIntelFetch();
      } else {
        console.log(`[IntelCron] DB bevat ${bestaand.length} relevante signalen${verwijderd > 0 ? ` (${verwijderd} opgeschoond)` : ""}`);
      }
    } catch (err) {
      console.error("[IntelCron] Opstartfetch fout:", (err as Error).message);
    }
  });
}
