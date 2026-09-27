// ─────────────────────────────────────────────────────────────
// Uitleg van een brief of contract — voor de Brievenagent en Contractagent.
//
// Lagen:
//  • In gewone taal — door het lokale AI-model, alleen op basis van de tekst.
//  • Juridisch — bij brieven vaste, gecontroleerde tekst per soort brief (geen AI);
//    bij contracten door het AI-model, beperkt tot wat uit de tekst blijkt.
//  • Begrippen, termijnen en bedragen — zonder AI, letterlijk uit de tekst.
// Deze uitleg controleert niet wie bevoegd is; dat doet "Brief analyseren".
// ─────────────────────────────────────────────────────────────
import { vindJuridischeTaal } from "../rechten/taal";
import { vindContractTaal } from "./contracttaal";
import { detecteerBedragen, detecteerDatum, detecteerKenmerk, detecteerSoort, detecteerTermijnen, kopEnStaart, type Dt } from "../rechten/rapport";

export type UitlegSoort = "brief" | "contract";

export interface Begrip { term: string; citaat: string; betekenis: string; controleer: string; ermee: string; wet?: string; letOp?: boolean }

export interface Uitleg {
  soort: UitlegSoort;
  kop: { onderwerp?: string; afzender?: string; datum?: string; kenmerk?: string };
  partijen: string[];
  gewoneTaal: string[];
  juridisch: string[];
  watMoetJe: string[];
  /** Contract: per partij wat die moet doen. */
  verplichtingen: { partij: string; moet: string[] }[];
  /** Brief: soort brief zoals zonder AI herkend. */
  soortBrief?: string;
  termijnen: string[];
  bedragen: string[];
  begrippen: Begrip[];
  aiGebruikt: boolean;
  omvang: { tekens: number; ingekort: boolean };
}

const MAX_TEKENS = 150_000;

// Juridische duiding van een brief: vaste, gecontroleerde tekst per soort (geen AI).
const SOORT_NAAM: Record<Dt, string> = {
  besluit: "Besluit", aanslag: "Aanslag", last_onder_dwangsom: "Last onder dwangsom", bestuursdwang: "Last onder bestuursdwang",
  boete: "Bestuurlijke boete", voornemen: "Voornemen", informatieverzoek: "Informatieverzoek", aanmaning: "Aanmaning / betalingsverzoek", overig: "Brief",
};
const JURIDISCH: Record<Dt, string[]> = {
  besluit: [
    "Dit is een besluit van een overheidsorgaan: een beslissing die rechtsgevolgen voor je heeft.",
    "Een besluit geldt ook als je het er niet mee eens bent — totdat het wordt ingetrokken, in bezwaar wordt herroepen of door de rechter wordt vernietigd.",
    "Je kunt binnen zes weken bezwaar maken bij het orgaan dat het besluit nam. Die termijn is streng.",
  ],
  last_onder_dwangsom: [
    "Dit is een besluit: een last onder dwangsom. Dat is een herstelsanctie, geen straf — het doel is dat de overtreding stopt.",
    "Doe je binnen de gegeven termijn (de begunstigingstermijn) wat er wordt gevraagd, dan betaal je niets. Doe je dat niet, dan verbeur je de dwangsom tot het maximum.",
    "Een verbeurde dwangsom wordt pas ingevorderd met een apart invorderingsbesluit, waartegen je opnieuw bezwaar kunt maken.",
    "Tegen de last kun je binnen zes weken bezwaar maken. Bezwaar houdt de dwangsom niet automatisch tegen; bij spoed kun je de voorzieningenrechter om schorsing vragen.",
  ],
  bestuursdwang: [
    "Dit is een besluit: een last onder bestuursdwang. De overheid mag de overtreding zelf ongedaan maken als jij dat niet op tijd doet.",
    "De kosten daarvan kunnen bij jou in rekening worden gebracht.",
    "Tegen de last kun je binnen zes weken bezwaar maken; bij spoed kun je de voorzieningenrechter om schorsing vragen.",
  ],
  boete: [
    "Dit is een bestuurlijke boete: een straf voor een overtreding, opgelegd door een overheidsorgaan in plaats van door een rechter.",
    "Het orgaan moet de overtreding kunnen bewijzen en de hoogte van de boete kunnen verantwoorden.",
    "Je kunt binnen zes weken bezwaar maken tegen het boetebesluit.",
  ],
  aanslag: [
    "Dit is een aanslag: een besluit waarin een belasting of heffing voor je wordt vastgesteld.",
    "Je kunt binnen zes weken bezwaar maken. Vraag daarbij om uitstel van betaling zolang het bezwaar loopt.",
  ],
  voornemen: [
    "Dit is nog geen definitief besluit, maar een voornemen: de afzender is van plan iets te beslissen.",
    "Je kunt eerst je zienswijze geven — mondeling of schriftelijk. Die moet worden meegewogen bij het besluit.",
  ],
  informatieverzoek: [
    "Dit is een verzoek of vordering om informatie.",
    "Een toezichthouder mag inlichtingen vorderen voor zover dat redelijkerwijs nodig is; aan een rechtmatige vordering moet je meewerken.",
    "Je mag vragen waarvoor de informatie nodig is en op welke bevoegdheid de vordering berust.",
  ],
  aanmaning: [
    "Dit is een aanmaning of betalingsverzoek: de afzender vindt dat je nog iets moet betalen.",
    "Een aanmaning is meestal geen nieuw besluit. De betalingsplicht moet voortkomen uit iets anders: een besluit, een aanslag, een overeenkomst of een vonnis.",
    "Vraag bij twijfel om het onderliggende stuk en een specificatie van het bedrag.",
  ],
  overig: [
    "Uit de tekst is niet eenduidig op te maken wat voor soort brief dit juridisch is.",
    "Staat er een bezwaarclausule in (‘binnen zes weken bezwaar maken’), dan is het waarschijnlijk een besluit waartegen je kunt opkomen.",
  ],
};
const JURIDISCH_BEDRIJF = [
  "Deze brief komt van een bedrijf, niet van een overheid. Het is een vordering, geen besluit.",
  "Een bedrijf kan zonder vonnis van de rechter geen beslag leggen.",
  "Ben je het niet eens met de vordering, laat dat dan schriftelijk en met redenen weten; wil het bedrijf toch betaald krijgen, dan moet het naar de rechter.",
];

const SYSTEEM = `Je legt Nederlandse brieven en contracten uit aan een ondernemer zonder juridische achtergrond.
Regels:
- Gebruik ALLEEN wat in de tekst staat. Verzin niets. Weet je iets niet, zeg dan "Staat niet in de tekst".
- Schrijf in eenvoudig Nederlands (taalniveau B1): korte zinnen, geen vakjargon zonder uitleg.
- Geef geen oordeel over of de ondernemer gelijk heeft, en geef geen advies om wel of niet te betalen of te tekenen.
- Parafraseer dicht bij de tekst. Liever de woorden uit het document dan eigen woorden.
- Antwoord uitsluitend met geldige JSON, zonder uitleg eromheen.`;

function prompt(soort: UitlegSoort, tekst: string): string {
  if (soort === "contract") {
    return `Leg dit contract uit. Geef deze JSON terug:
{
 "onderwerp": "waar gaat het contract over, in maximaal 10 woorden",
 "partijen": ["naam en rol van elke partij, bijv. 'Bakkerij X (klant)'"],
 "gewone_taal": ["3 tot 6 korte zinnen: wat spreken partijen af, in gewone taal"],
 "juridisch": ["2 tot 4 korte zinnen: wat voor soort overeenkomst is het, en wat gebeurt er als iemand zich niet aan de afspraken houdt — alleen wat uit de tekst blijkt"],
 "verplichtingen": [{"partij": "naam van de partij zoals in het contract", "moet": ["wat deze partij moet doen, leveren of betalen"]}]
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
 "wat_moet_je": ["wat wordt er van de ontvanger gevraagd, met datum of termijn als die in de brief staat"]
}
Gebruik zoveel mogelijk de woorden uit de brief zelf. Voeg geen oordeel toe.

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
      temperature: 0.1,
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
  const dt = detecteerSoort(tekst).dt;
  const vanBedrijf = /incasso|deurwaarder|\bB\.\s?V\.[^\n]{0,40}\n/i.test(tekst.slice(0, 400)) && !/gemeente|provincie|waterschap|belastingdienst/i.test(tekst.slice(0, 400));
  const verplichtingen = (Array.isArray(ai?.verplichtingen) ? (ai!.verplichtingen as any[]) : [])
    .map((v) => ({ partij: tekstOf(v?.partij) || "", moet: lijst(v?.moet, 6) }))
    .filter((v) => v.partij && v.moet.length)
    .slice(0, 4);
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
    juridisch: soort === "brief" ? (vanBedrijf ? JURIDISCH_BEDRIJF : JURIDISCH[dt]) : lijst(ai?.juridisch, 4),
    watMoetJe: soort === "brief" ? lijst(ai?.wat_moet_je) : [],
    verplichtingen: soort === "contract" ? verplichtingen : [],
    soortBrief: soort === "brief" ? (vanBedrijf ? "Vordering van een bedrijf" : SOORT_NAAM[dt]) : undefined,
    termijnen: detecteerTermijnen(tekst),
    bedragen: detecteerBedragen(tekst),
    begrippen,
    aiGebruikt: !!ai && gewoneTaal.length > 0,
    omvang: { tekens: tekst.length, ingekort: invoer.length > MAX_TEKENS },
  };
}
