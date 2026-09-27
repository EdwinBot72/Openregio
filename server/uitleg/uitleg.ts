// ─────────────────────────────────────────────────────────────
// Uitleg van een brief of contract — voor de Brievenagent en Contractagent.
//
// Twee lagen:
//  • In gewone taal en juridisch uitgelegd — door het lokale AI-model,
//    alleen op basis van de tekst (label: duiding, geen feit).
//  • Begrippen, termijnen en bedragen — zonder AI, letterlijk uit de tekst.
// Deze uitleg controleert niet wie bevoegd is; dat doet "Brief analyseren".
// ─────────────────────────────────────────────────────────────
import { vindJuridischeTaal } from "../rechten/taal";
import { vindContractTaal } from "./contracttaal";
import { detecteerBedragen, detecteerDatum, detecteerKenmerk, detecteerTermijnen, kopEnStaart } from "../rechten/rapport";

export type UitlegSoort = "brief" | "contract";

export interface Begrip { term: string; citaat: string; betekenis: string; controleer: string; ermee: string; wet?: string; letOp?: boolean }

export interface Uitleg {
  soort: UitlegSoort;
  kop: { onderwerp?: string; afzender?: string; datum?: string; kenmerk?: string };
  partijen: string[];
  gewoneTaal: string[];
  juridisch: string[];
  watMoetJe: string[];
  verplichtingen: { jij: string[]; zij: string[] };
  termijnen: string[];
  bedragen: string[];
  begrippen: Begrip[];
  aiGebruikt: boolean;
  omvang: { tekens: number; ingekort: boolean };
}

const MAX_TEKENS = 150_000;

const SYSTEEM = `Je legt Nederlandse brieven en contracten uit aan een ondernemer zonder juridische achtergrond.
Regels:
- Gebruik ALLEEN wat in de tekst staat. Verzin niets. Weet je iets niet, zeg dan "Staat niet in de tekst".
- Schrijf in eenvoudig Nederlands (taalniveau B1): korte zinnen, geen vakjargon zonder uitleg.
- Geef geen oordeel over of de ondernemer gelijk heeft, en geef geen advies om wel of niet te betalen of te tekenen.
- Antwoord uitsluitend met geldige JSON, zonder uitleg eromheen.`;

function prompt(soort: UitlegSoort, tekst: string): string {
  if (soort === "contract") {
    return `Leg dit contract uit. Geef deze JSON terug:
{
 "onderwerp": "waar gaat het contract over, in maximaal 10 woorden",
 "partijen": ["naam en rol van elke partij, bijv. 'Bakkerij X (klant)'"],
 "gewone_taal": ["3 tot 6 korte zinnen: wat spreken partijen af, in gewone taal"],
 "juridisch": ["3 tot 6 korte zinnen: wat betekent dit juridisch — wat voor soort overeenkomst is het, welke rechten en plichten ontstaan, wat gebeurt er als iemand zich niet aan de afspraken houdt"],
 "verplichtingen_jij": ["wat moet de ondernemer (de ontvanger van dit contract) doen of betalen"],
 "verplichtingen_zij": ["wat moet de andere partij doen of leveren"]
}

CONTRACT:
"""
${tekst}
"""`;
  }
  return `Leg deze brief uit. Geef deze JSON terug:
{
 "onderwerp": "waar gaat de brief over, in maximaal 10 woorden",
 "afzender": "wie stuurt de brief",
 "gewone_taal": ["3 tot 6 korte zinnen: wat staat er in de brief, in gewone taal"],
 "juridisch": ["3 tot 6 korte zinnen: wat betekent dit juridisch — wat voor soort brief is het (bijv. besluit, aanmaning, voornemen, informatieverzoek), wat zijn de gevolgen, welke rechten heeft de ontvanger"],
 "wat_moet_je": ["wat wordt er van de ontvanger gevraagd, met datum of termijn als die in de brief staat"]
}

BRIEF:
"""
${tekst}
"""`;
}

const lijst = (x: unknown, max = 8): string[] =>
  (Array.isArray(x) ? x : typeof x === "string" ? [x] : [])
    .map((v) => String(v ?? "").trim())
    .filter((v) => v && v.toLowerCase() !== "null")
    .map((v) => v.slice(0, 400))
    .slice(0, max);
const tekstOf = (x: unknown): string | undefined => {
  const s = String(x ?? "").trim();
  return s && s.toLowerCase() !== "null" ? s.slice(0, 200) : undefined;
};

async function aiUitleg(soort: UitlegSoort, tekst: string): Promise<Record<string, unknown> | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI();
    const c = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEEM }, { role: "user", content: prompt(soort, kopEnStaart(tekst)) }],
      temperature: 0.2,
      max_tokens: 900,
    });
    const m = (c.choices[0]?.message?.content || "").match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch (e: any) {
    console.error("[Uitleg] AI mislukt:", e?.message || e);
    return null;
  }
}

export async function maakUitleg(invoer: string, soort: UitlegSoort): Promise<Uitleg> {
  const tekst = invoer.slice(0, MAX_TEKENS);
  const ai = await aiUitleg(soort, tekst);
  const begrippen: Begrip[] = soort === "contract" ? vindContractTaal(tekst) : vindJuridischeTaal(tekst);

  const gewoneTaal = lijst(ai?.gewone_taal);
  return {
    soort,
    kop: {
      onderwerp: tekstOf(ai?.onderwerp),
      afzender: soort === "brief" ? tekstOf(ai?.afzender) : undefined,
      datum: detecteerDatum(tekst) || undefined,
      kenmerk: detecteerKenmerk(tekst) || undefined,
    },
    partijen: soort === "contract" ? lijst(ai?.partijen, 6) : [],
    gewoneTaal: gewoneTaal.length ? gewoneTaal : ["Het automatisch uitleggen lukte deze keer niet. Hieronder staan wel de belangrijke begrippen, termijnen en bedragen uit de tekst."],
    juridisch: lijst(ai?.juridisch),
    watMoetJe: soort === "brief" ? lijst(ai?.wat_moet_je) : [],
    verplichtingen: soort === "contract" ? { jij: lijst(ai?.verplichtingen_jij), zij: lijst(ai?.verplichtingen_zij) } : { jij: [], zij: [] },
    termijnen: detecteerTermijnen(tekst),
    bedragen: detecteerBedragen(tekst),
    begrippen,
    aiGebruikt: !!ai && gewoneTaal.length > 0,
    omvang: { tekens: tekst.length, ingekort: invoer.length > MAX_TEKENS },
  };
}
