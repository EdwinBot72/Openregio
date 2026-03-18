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

// ─── Rijksoverheid Open Data ─────────────────────────────────────────────────
// Haalt de 10 meest recente documenten op via de Rijksoverheid API
async function fetchRijksoverheidDocs(): Promise<InsertIntelSignaal[]> {
  const url =
    "https://opendata.rijksoverheid.nl/v1/infotypes/document?output=json&rows=10&offset=0";
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const json = await res.json();
    const docs: any[] = json.results ?? json.items ?? json ?? [];
    return docs.map((doc: any) => {
      const id = String(doc.id ?? doc.documentnummer ?? doc.identifier ?? "");
      return {
        categorie: "wetgeving" as const,
        urgentie: "normaal" as const,
        titel: String(doc.title ?? doc.naam ?? "Onbekend document").slice(0, 512),
        samenvatting: String(doc.description ?? doc.omschrijving ?? "Geen samenvatting beschikbaar."),
        bron: "Rijksoverheid",
        regio: "Nationaal",
        datum: doc.publicationdate ? new Date(doc.publicationdate) : new Date(),
        bronUrl: doc.url ?? doc.link ?? undefined,
        isPublished: true,
        externalId: id ? `rijksoverheid-${id}` : undefined,
      } satisfies InsertIntelSignaal;
    });
  } catch (err) {
    console.error("[IntelCron] Rijksoverheid fetch fout:", err);
    return [];
  }
}

// ─── RVO.nl subsidie-nieuws (RSS) ───────────────────────────────────────────
async function fetchRvoSubsidies(): Promise<InsertIntelSignaal[]> {
  const url = "https://www.rvo.nl/rss.xml";
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const text = await res.text();
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8);
    return items
      .map((m) => {
        const item = m[1];
        const titel = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ?? item.match(/<title>(.*?)<\/title>/))?.[1] ?? "";
        const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ?? item.match(/<description>(.*?)<\/description>/))?.[1]?.replace(/<[^>]+>/g, "") ?? "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
        if (!titel) return null;
        return {
          categorie: "subsidies" as const,
          urgentie: "normaal" as const,
          titel: titel.slice(0, 512),
          samenvatting: desc.slice(0, 2000) || "Geen samenvatting.",
          bron: "RVO.nl",
          regio: "Nationaal",
          datum: pubDate ? new Date(pubDate) : new Date(),
          bronUrl: link || undefined,
          isPublished: true,
          externalId: link ? `rvo-${Buffer.from(link).toString("base64").slice(0, 60)}` : undefined,
        } satisfies InsertIntelSignaal;
      })
      .filter(Boolean) as InsertIntelSignaal[];
  } catch (err) {
    console.error("[IntelCron] RVO RSS fetch fout:", err);
    return [];
  }
}

// ─── Hoofdfunctie ─────────────────────────────────────────────────────────
export async function runIntelFetch(): Promise<number> {
  console.log("[IntelCron] Fetch-ronde gestart");
  const [rijksoverheidDocs, rvoSubsidies] = await Promise.all([
    fetchRijksoverheidDocs(),
    fetchRvoSubsidies(),
  ]);

  const candidates = [...rijksoverheidDocs, ...rvoSubsidies];
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
}
