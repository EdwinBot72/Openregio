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

// ─── Feed-definities ─────────────────────────────────────────────────────────

type FeedDef = {
  url: string;
  bron: string;
  categorie: "wetgeving" | "beleid" | "financieel" | "subsidies";
  urgentie: "urgent" | "normaal" | "info";
  prefix: string;
  maxItems: number;
};

const FEEDS: FeedDef[] = [
  {
    url: "https://feeds.nos.nl/nosnieuwsbinnenland",
    bron: "NOS Binnenland",
    categorie: "beleid",
    urgentie: "normaal",
    prefix: "nos-binnenland",
    maxItems: 10,
  },
  {
    url: "https://feeds.nos.nl/nosnieuwspolitiek",
    bron: "NOS Politiek",
    categorie: "wetgeving",
    urgentie: "normaal",
    prefix: "nos-politiek",
    maxItems: 8,
  },
  {
    url: "https://feeds.nos.nl/nosnieuwseconomie",
    bron: "NOS Economie",
    categorie: "financieel",
    urgentie: "normaal",
    prefix: "nos-economie",
    maxItems: 8,
  },
  {
    url: "https://www.nu.nl/rss/Economie",
    bron: "NU.nl Economie",
    categorie: "subsidies",
    urgentie: "normaal",
    prefix: "nu-economie",
    maxItems: 8,
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
    console.log(`[IntelCron] ${feed.bron}: ${signalen.length} artikelen opgehaald`);
    return signalen;
  } catch (err) {
    console.error(`[IntelCron] Fout bij ${feed.bron}:`, (err as Error).message);
    return [];
  }
}

// ─── Hoofdfunctie ─────────────────────────────────────────────────────────
export async function runIntelFetch(): Promise<number> {
  console.log("[IntelCron] Fetch-ronde gestart");
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

  // Populeer de DB bij opstarten als de tabel leeg is (bijv. productie-deploy)
  setImmediate(async () => {
    try {
      const bestaand = await storage.getIntelSignalen();
      if (bestaand.length === 0) {
        console.log("[IntelCron] Geen signalen in DB — directe opstartfetch gestart");
        await runIntelFetch();
      } else {
        console.log(`[IntelCron] DB bevat al ${bestaand.length} signalen — geen opstartfetch nodig`);
      }
    } catch (err) {
      console.error("[IntelCron] Opstartfetch fout:", (err as Error).message);
    }
  });
}
