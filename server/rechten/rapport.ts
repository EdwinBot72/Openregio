// ─────────────────────────────────────────────────────────────
// "Ken je positie, gebruik je rechten" — rechtenrapport bij een overheidsbrief.
//
// Taakverdeling (bewust, om verzinsels te voorkomen):
//  • De AI leest ALLEEN uit wat in de brief staat en citeert letterlijk.
//    Elk citaat wordt daarna gecontroleerd tegen de brieftekst; niet
//    teruggevonden = geen bron + label "te_controleren".
//  • Rechten, termijnen en wetsartikelen komen uit vaste regels in deze file
//    (alleen artikelen waarvan de betekenis vaststaat).
//  • De Awb-controles komen uit controleerBesluit() (deterministisch, geen AI).
// ─────────────────────────────────────────────────────────────
import { controleerBesluit, type Bevinding } from "../brieftypes";

export type Label = "vaststaand" | "interpretatie" | "te_controleren";
export interface RapportPunt { tekst: string; label: Label; bron?: string }
export interface RapportSectie { titel: string; uitleg?: string; punten: RapportPunt[] }
export interface Conceptbrief { titel: string; tekst: string }
export interface Rapport {
  kop: { afzender?: string; kenmerk?: string; datum?: string; documenttype: string };
  secties: RapportSectie[];
  conceptbrieven: Conceptbrief[];
  aiGebruikt: boolean;
}

// ── AI-extractie ─────────────────────────────────────────────
const RECHTSVORMEN = ["eenmanszaak", "vof", "bv", "nv", "stichting", "vereniging", "privepersoon", "onbekend"] as const;
const HOEDANIGHEDEN = ["werkgever", "vergunninghouder", "aanvrager", "belastingplichtige", "eigenaar", "gebruiker", "overtreder", "contractspartij", "onbekend"] as const;
const DOCTYPES = ["besluit", "aanslag", "last_onder_dwangsom", "bestuursdwang", "boete", "voornemen", "informatieverzoek", "overig"] as const;
const VERLANGD = ["betalen", "informatie_verstrekken", "stoppen_activiteit", "vergunning_aanvragen", "voorwaarden_naleven", "overig"] as const;

type Rv = typeof RECHTSVORMEN[number];
type Hd = typeof HOEDANIGHEDEN[number];
type Dt = typeof DOCTYPES[number];
type Vl = typeof VERLANGD[number];

interface Extractie {
  geadresseerde: string | null; geadresseerde_citaat: string | null;
  rechtsvorm: Rv; rechtsvorm_citaat: string | null;
  bestuurder_persoonlijk: boolean;
  hoedanigheid: Hd; hoedanigheid_citaat: string | null;
  instantie: string | null; afdeling: string | null; ondertekenaar: string | null; functie: string | null; namens: string | null; afzender_citaat: string | null;
  behandelaar: string | null; in_opdracht_van: string | null;
  documenttype: Dt; documenttype_citaat: string | null;
  verlangd_soort: Vl; verlangd_omschrijving: string | null; bedrag: string | null; verlangd_citaat: string | null;
  termijnen: { omschrijving: string; citaat: string | null }[];
  grondslagen: { regel: string; citaat: string | null }[];
  kenmerk: string | null; datum_brief: string | null;
}

const LEEG: Extractie = {
  geadresseerde: null, geadresseerde_citaat: null, rechtsvorm: "onbekend", rechtsvorm_citaat: null,
  bestuurder_persoonlijk: false, hoedanigheid: "onbekend", hoedanigheid_citaat: null,
  instantie: null, afdeling: null, ondertekenaar: null, functie: null, namens: null, afzender_citaat: null,
  behandelaar: null, in_opdracht_van: null,
  documenttype: "overig", documenttype_citaat: null,
  verlangd_soort: "overig", verlangd_omschrijving: null, bedrag: null, verlangd_citaat: null,
  termijnen: [], grondslagen: [], kenmerk: null, datum_brief: null,
};

const SYSTEEM = `Je leest een brief van een overheidsinstantie (gemeente, Belastingdienst, provincie, toezichthouder) aan een ondernemer.
Je haalt ALLEEN feiten uit de tekst. Verzin niets en vul niets aan. Staat iets niet in de brief, gebruik dan null (of "onbekend"/"overig").
Bij velden die op _citaat eindigen geef je een LETTERLIJK stukje tekst uit de brief (exact overgenomen, maximaal 25 woorden).
Antwoord uitsluitend met geldige JSON, zonder uitleg.`;

function userPrompt(tekst: string): string {
  return `Geef deze JSON terug (kort, alleen wat in de brief staat):
{
 "geadresseerde": naam aan wie de brief gericht is (persoon of bedrijf) of null,
 "geadresseerde_citaat": letterlijk citaat van die adressering of null,
 "bestuurder_persoonlijk": true als een bestuurder/directeur persoonlijk (privé) wordt aangesproken, anders false,
 "hoedanigheid": een van ${HOEDANIGHEDEN.map((x) => `"${x}"`).join(", ")},
 "instantie": naam van de instantie die de brief stuurt of null,
 "afdeling": afdeling of null,
 "ondertekenaar": naam van wie ondertekent of null,
 "functie": functie van de ondertekenaar of null,
 "namens": namens wie getekend is (bijv. "namens burgemeester en wethouders") of null,
 "in_opdracht_van": als de afzender (bijv. een bedrijf of incassobureau) schrijft in opdracht van of namens een andere organisatie: die organisatie, anders null,
 "behandelaar": naam van de behandelaar/contactpersoon als die genoemd wordt (bijv. bij "behandeld door" of "contactpersoon") of null,
 "verlangd_soort": een van ${VERLANGD.map((x) => `"${x}"`).join(", ")},
 "verlangd_omschrijving": korte omschrijving van wat er van de ondernemer verlangd wordt of null,
 "verlangd_citaat": letterlijk citaat daarvan of null,
 "grondslagen": [{"regel": "wet/artikel/verordening zoals genoemd in de brief", "citaat": "letterlijk citaat"}]
}

BRIEF:
"""
${tekst}
"""`;
}

function kies<T extends string>(waarde: unknown, toegestaan: readonly T[], standaard: T): T {
  const v = String(waarde ?? "").toLowerCase().trim().replace(/[ .-]/g, "_").replace("é", "e");
  return (toegestaan as readonly string[]).includes(v) ? (v as T) : standaard;
}
const str = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s && s.toLowerCase() !== "null" ? s.slice(0, 400) : null;
};

async function aiExtractie(tekst: string): Promise<{ ex: Extractie; ok: boolean }> {
  if (!process.env.OPENAI_API_KEY) return { ex: LEEG, ok: false };
  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEEM },
        { role: "user", content: userPrompt(tekst.slice(0, 8000)) },
      ],
      temperature: 0.1,
      max_tokens: 700,
    });
    const raw = completion.choices[0]?.message?.content || "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return { ex: LEEG, ok: false };
    const j = JSON.parse(m[0]);
    const lijst = (x: unknown) => (Array.isArray(x) ? x : []);
    return {
      ok: true,
      ex: {
        ...LEEG,
        geadresseerde: str(j.geadresseerde), geadresseerde_citaat: str(j.geadresseerde_citaat),
        bestuurder_persoonlijk: j.bestuurder_persoonlijk === true,
        hoedanigheid: kies(j.hoedanigheid, HOEDANIGHEDEN, "onbekend"),
        instantie: str(j.instantie), afdeling: str(j.afdeling), ondertekenaar: str(j.ondertekenaar),
        functie: str(j.functie), namens: str(j.namens),
        behandelaar: str(j.behandelaar), in_opdracht_van: str(j.in_opdracht_van),
        verlangd_soort: kies(j.verlangd_soort, VERLANGD, "overig"), verlangd_omschrijving: str(j.verlangd_omschrijving),
        verlangd_citaat: str(j.verlangd_citaat),
        grondslagen: lijst(j.grondslagen).map((g: any) => ({ regel: str(g?.regel) || "", citaat: str(g?.citaat) })).filter((g) => g.regel).slice(0, 8),
      },
    };
  } catch (e: any) {
    console.error("[RechtenRapport] AI-extractie mislukt:", e?.message || e);
    return { ex: LEEG, ok: false };
  }
}

// ── Citaatcontrole: staat het citaat echt in de brief? ───────
const norm = (s: string) =>
  s.toLowerCase().replace(/[“”„"'‘’`´]/g, "").replace(/[^\p{L}\p{N}€%]+/gu, " ").replace(/\s+/g, " ").trim();

function makeVerifier(brief: string) {
  const b = norm(brief);
  return (citaat: string | null | undefined): string | undefined => {
    if (!citaat) return undefined;
    const c = norm(citaat);
    if (c.length < 4) return undefined;
    if (b.includes(c)) return citaat;
    // Tolerant: ≥ 80% van de woorden (in volgorde) als aaneengesloten stuk terugvinden.
    const w = c.split(" ");
    if (w.length >= 5) {
      const n = Math.ceil(w.length * 0.8);
      for (let i = 0; i + n <= w.length; i++) if (b.includes(w.slice(i, i + n).join(" "))) return citaat;
    }
    return undefined;
  };
}

// ── Vaste teksten ────────────────────────────────────────────
const RECHTSVORM_DUIDING: Record<Rv, { tekst: string; label: Label; bron?: string }> = {
  eenmanszaak: { tekst: "Bij een eenmanszaak ben je als eigenaar persoonlijk aansprakelijk, ook met je privévermogen. Een brief aan je onderneming raakt dus jou persoonlijk.", label: "interpretatie" },
  vof: { tekst: "Bij een vof zijn de vennoten ieder hoofdelijk aansprakelijk voor de schulden van de vof — ook met privévermogen.", label: "interpretatie" },
  bv: { tekst: "Een bv is een zelfstandige rechtspersoon. In beginsel is de bv aansprakelijk, niet jij persoonlijk als aandeelhouder of bestuurder.", label: "interpretatie" },
  nv: { tekst: "Een nv is een zelfstandige rechtspersoon. In beginsel is de nv aansprakelijk, niet de aandeelhouders of bestuurders persoonlijk.", label: "interpretatie" },
  stichting: { tekst: "Een stichting is een zelfstandige rechtspersoon. In beginsel is de stichting aansprakelijk, niet de bestuurders persoonlijk.", label: "interpretatie" },
  vereniging: { tekst: "Een vereniging is een rechtspersoon. Bij een vereniging zonder notariële akte (beperkte rechtsbevoegdheid) kunnen bestuurders wel persoonlijk aansprakelijk zijn.", label: "interpretatie", bron: "art. 2:30 BW" },
  privepersoon: { tekst: "De brief is aan jou als privépersoon gericht. Controleer of dat klopt: gaat het over je onderneming, dan hoort de brief aan de juiste onderneming of rechtspersoon gericht te zijn.", label: "te_controleren" },
  onbekend: { tekst: "Uit de brief blijkt niet aan welke rechtsvorm hij gericht is. Controleer of de brief aan de juiste partij gericht is — jij persoonlijk, je eenmanszaak of je bv — want dat bepaalt wie aansprakelijk is.", label: "te_controleren" },
};

const HOEDANIGHEID_TEKST: Record<Hd, string> = {
  werkgever: "werkgever", vergunninghouder: "vergunninghouder", aanvrager: "aanvrager",
  belastingplichtige: "belastingplichtige", eigenaar: "eigenaar", gebruiker: "gebruiker",
  overtreder: "overtreder", contractspartij: "contractspartij", onbekend: "",
};

const DOCTYPE_TEKST: Record<Dt, string> = {
  besluit: "Besluit", aanslag: "Aanslag", last_onder_dwangsom: "Last onder dwangsom", bestuursdwang: "Last onder bestuursdwang",
  boete: "Boetebesluit", voornemen: "Voornemen (nog geen definitief besluit)", informatieverzoek: "Informatieverzoek / vordering", overig: "Brief",
};

const VERLANGD_TEKST: Record<Vl, string> = {
  betalen: "Betalen", informatie_verstrekken: "Informatie verstrekken", stoppen_activiteit: "Stoppen met een activiteit",
  vergunning_aanvragen: "Een vergunning aanvragen", voorwaarden_naleven: "Aan voorwaarden voldoen", overig: "Zie de brief",
};

const BESLUITACHTIG: Dt[] = ["besluit", "aanslag", "last_onder_dwangsom", "bestuursdwang", "boete"];

function statusNaarLabel(s: Bevinding["status"]): Label {
  return s === "gevonden" ? "vaststaand" : s === "niet_gevonden" ? "te_controleren" : "interpretatie";
}

// ── Datum + 6 weken (indicatief) ─────────────────────────────
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
function parseDatum(s: string | null): Date | null {
  if (!s) return null;
  const t = s.toLowerCase();
  let m = t.match(/(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})/);
  if (m) return new Date(Number(m[3]), MAANDEN.indexOf(m[2]), Number(m[1]));
  m = t.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return null;
}
const fmt = (d: Date) => `${d.getDate()} ${MAANDEN[d.getMonth()]} ${d.getFullYear()}`;

// ── Vaste herkenning (geen AI): betrouwbaar en direct ────────
/** De zin waarin een match staat, als letterlijk citaat. */
const AFKORTING = /(?:\b(?:art|nr|lid|bijv|ca|jl|resp|mr|dr|ir|drs|ing|mw|dhr|t\.a\.v|m\.b\.t|i\.v\.m|o\.a)|\b[A-Za-z])$/i;
/** Einde van een zin? Niet bij "5.000", "art. 5", "B.V." of "J. de Vries". */
function isEinde(t: string, i: number): boolean {
  const c = t[i];
  if (c === "\n") return true;
  if (c !== "." && c !== "!" && c !== "?") return false;
  const volgend = t[i + 1];
  if (volgend && !/\s/.test(volgend)) return false;
  return !AFKORTING.test(t.slice(Math.max(0, i - 8), i));
}
/** De zin waarin een match staat, als letterlijk citaat. */
function zinRond(t: string, idx: number, len: number): string {
  let a = idx; while (a > 0 && !isEinde(t, a - 1)) a--;
  let b = idx + len; while (b < t.length && !isEinde(t, b)) b++;
  const z = t.slice(a, b + 1).replace(/\s+/g, " ").trim();
  return z.length > 240 ? z.slice(0, 237) + "…" : z;
}
function eerste(t: string, re: RegExp): { m: RegExpMatchArray; zin: string } | null {
  const m = t.match(re);
  return m && m.index !== undefined ? { m, zin: zinRond(t, m.index, m[0].length) } : null;
}

function detecteerSoort(t: string): { dt: Dt; bron?: string } {
  const heeftBezwaar = /bezwaar\s+(maken|indienen)|kunt u .{0,60}bezwaar/i.test(t);
  const regels: [Dt, RegExp, boolean?][] = [
    ["informatieverzoek", /(vorder(en|ing)[^.]{0,40}inlichtingen|verzoek(en)?\s+(wij\s+)?u[^.]{0,40}(inlichtingen|informatie|gegevens)[^.]{0,40}(te\s+verstrekken|toe\s+te\s+sturen|aan\s+te\s+leveren))/i, true],
    ["voornemen", /(voornemen|vooraankondiging|zijn\s+(wij\s+)?voornemens|zijn\s+wij\s+van\s+plan)/i, true],
    ["last_onder_dwangsom", /last\s+onder\s+dwangsom|dwangsom/i],
    ["bestuursdwang", /bestuursdwang/i],
    ["boete", /bestuurlijke\s+boete|boete\s+op\s+te\s+leggen|leggen\s+wij\s+u\s+een\s+boete|boetebeschikking/i],
    ["aanslag", /naheffingsaanslag|aanslagbiljet|(belasting)?aanslag/i],
    ["besluit", /\bbesluit\b|beschikking|hebben\s+(wij\s+)?besloten|besluiten\s+wij/i],
  ];
  for (const [dt, re, alleenZonderBezwaar] of regels) {
    if (alleenZonderBezwaar && heeftBezwaar) continue;
    const f = eerste(t, re);
    if (f) return { dt, bron: `“${f.zin}”` };
  }
  return { dt: heeftBezwaar ? "besluit" : "overig" };
}

function detecteerKenmerk(t: string): string | null {
  const m = t.match(/(?:ons\s+kenmerk|uw\s+kenmerk|kenmerk|zaaknummer|dossiernummer|referentie)\s*[:.]?\s*([A-Z0-9][A-Z0-9\/._-]{3,})/i);
  return m ? m[1].replace(/[.,]$/, "") : null;
}

const MAAND_RE = "januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december";
function detecteerDatum(t: string): string | null {
  const kop = t.slice(0, 1500);
  const m = kop.match(new RegExp(`\\b(\\d{1,2}\\s+(?:${MAAND_RE})\\s+\\d{4})\\b`, "i")) || kop.match(/\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b/);
  return m ? m[1] : null;
}

function detecteerTermijnen(t: string): string[] {
  const res = new Set<string>();
  const patronen = [
    /binnen\s+(\d+|een|één|twee|drie|vier|vijf|zes|zeven|acht|tien|twaalf|veertien)\s+(werk)?(dagen|dag|weken|week|maanden|maand)/gi,
    new RegExp(`(uiterlijk|vóór|voor|tot)\\s+(\\d{1,2}\\s+(?:${MAAND_RE})\\s+\\d{4})`, "gi"),
  ];
  for (const re of patronen) for (const m of t.matchAll(re)) if (m.index !== undefined) res.add(zinRond(t, m.index, m[0].length));
  return [...res].slice(0, 6);
}

function detecteerBedragen(t: string): string[] {
  const res = new Set<string>();
  for (const m of t.matchAll(/(€\s?\d[\d.]*(,\d{2})?|\b\d[\d.]*(,\d{2})?\s?(euro|EUR)\b)/gi)) if (m.index !== undefined) res.add(zinRond(t, m.index, m[0].length));
  return [...res].slice(0, 3);
}

function detecteerRechtsvorm(t: string): { rv: Rv; bron?: string; zeker: boolean } {
  const kop = t.slice(0, 1200);
  const regels: [Rv, RegExp, boolean][] = [
    ["bv", /\bB\.\s?V\.|\bBV\b/, true],
    ["vof", /\bV\.\s?O\.\s?F\.|\bVOF\b|\bv\.o\.f\./i, true],
    ["nv", /\bN\.\s?V\.(?!\s?T)/, true],
    ["stichting", /\bstichting\b/i, true],
    ["vereniging", /\bvereniging\b/i, true],
    ["eenmanszaak", /eenmanszaak|h\.?o\.?d\.?n\.?|handelend\s+onder\s+de\s+naam/i, false],
  ];
  for (const [rv, re, zeker] of regels) {
    const f = eerste(kop, re);
    if (f) return { rv, bron: `“${f.zin}”`, zeker };
  }
  return { rv: "onbekend", zeker: false };
}

// ── Wie zit erachter? ────────────────────────────────────────
type OrgSoort = "gemeente" | "waterschap" | "provincie" | "rijk" | "uitvoerder" | "bedrijf" | "onbekend";
function soortOrganisatie(naam: string): OrgSoort {
  const n = naam.toLowerCase();
  if (/(incasso|deurwaarder|advocat|juridisch adviesbureau|\bb\.\s?v\.|\bbv\b|\bn\.v\.|intrum|flanderijn)/i.test(naam)) return "bedrijf";
  if (/(waternet|belastingsamenwerking|belastingen|gblt|bsgw|svhw|cocensus|bghu|omgevingsdienst|\brud\b|uitvoeringsdienst|veiligheidsregio|\bggd\b|werkbedrijf)/.test(n)) return "uitvoerder";
  if (/(gemeente|college van burgemeester|burgemeester)/.test(n)) return "gemeente";
  if (/(waterschap|hoogheemraadschap|wetterskip)/.test(n)) return "waterschap";
  if (/(provincie|gedeputeerde staten)/.test(n)) return "provincie";
  if (/(belastingdienst|ministerie|rijksdienst|\brvo\b|\buwv\b|\bcjib\b|\bduo\b|\bsvb\b|\bnvwa\b|inspectie|douane|toeslagen|kamer van koophandel|politie|openbaar ministerie)/.test(n)) return "rijk";
  return "onbekend";
}

const ORG_DUIDING: Record<OrgSoort, { tekst: string; label: Label }> = {
  gemeente: { tekst: "De brief komt van een gemeente: een overheidsorgaan. Een gemeente mag je alleen iets opleggen als een wet of verordening haar die bevoegdheid geeft én het juiste bestuursorgaan (meestal burgemeester en wethouders, of de burgemeester) het besluit neemt.", label: "interpretatie" },
  waterschap: { tekst: "De brief komt van een waterschap: een overheidsorgaan. Ook een waterschap mag alleen iets opleggen op grond van een wet of verordening, via het juiste bestuursorgaan of een daartoe aangewezen ambtenaar.", label: "interpretatie" },
  provincie: { tekst: "De brief komt van een provincie: een overheidsorgaan. Besluiten worden meestal genomen door gedeputeerde staten; controleer namens wie is getekend.", label: "interpretatie" },
  rijk: { tekst: "De brief komt van de rijksoverheid of een zelfstandig bestuursorgaan. Ook dan moet duidelijk zijn welk orgaan besluit en op welke wettelijke grondslag.", label: "interpretatie" },
  uitvoerder: { tekst: "Deze organisatie voert taken uit namens één of meer overheden (bijvoorbeeld belastingheffing, inning of handhaving). Ze beslist dus niet op eigen gezag: controleer namens welke overheid zij handelt en op grond waarvan (een samenwerkingsregeling, mandaat of opdracht).", label: "interpretatie" },
  bedrijf: { tekst: "Dit lijkt een bedrijf (bijv. incassobureau, deurwaarderskantoor of advocatenkantoor), geen overheidsorgaan. Een incassobureau legt zelf geen boete op, maar int namens een ander. Een gerechtsdeurwaarder mag alleen beslag leggen met een executoriale titel (zoals een vonnis of dwangbevel) of met toestemming van de rechter. Vraag namens wie het bedrijf handelt en op welk besluit, vonnis of welke overeenkomst de vordering berust.", label: "interpretatie" },
  onbekend: { tekst: "Uit de brief is niet duidelijk welke organisatie hem stuurt. Stel dat eerst vast voordat je betaalt of reageert.", label: "te_controleren" },
};

const NIET_ONDERTEKEND = /(niet\s+(persoonlijk\s+)?ondertekend|zonder\s+handtekening|geldig\s+zonder\s+handtekening|automatisch\s+(aangemaakt|verzonden|gegenereerd|verwerkt)|(computer|systeem)\s*(gegenereerd|aangemaakt))/i;
const BEHANDELAAR = /(behandeld\s+door|behandelaar|contactpersoon|inlichtingen\s+bij|opgemaakt\s+door|zaakbehandelaar)\s*:?\s*([^\n]{3,70})/i;
const IBAN = /\bNL\s?\d{2}\s?[A-Z]{4}(?:\s?\d{4}){2}\s?\d{2}\b/;

// ── Rapport bouwen ───────────────────────────────────────────
export async function maakRechtenRapport(brieftekst: string): Promise<Rapport> {
  const tekst = brieftekst.slice(0, 20000);
  const [{ ex, ok }, bevindingen] = await Promise.all([aiExtractie(tekst), Promise.resolve(controleerBesluit(tekst))]);
  const echt = makeVerifier(tekst);
  const bronVan = (...kandidaten: (string | null | undefined)[]) => {
    for (const k of kandidaten) { const v = echt(k); if (v) return `“${v}”`; }
    return undefined;
  };
  const feit = (tekst: string, ...kandidaten: (string | null | undefined)[]): RapportPunt => {
    const bron = bronVan(...kandidaten);
    return bron ? { tekst, label: "vaststaand", bron } : { tekst: `${tekst} (niet letterlijk teruggevonden in je brief — controleer dit)`, label: "te_controleren" };
  };

  const soort = detecteerSoort(tekst);
  const dt = soort.dt;
  const kenmerk = detecteerKenmerk(tekst);
  const datumTekst = detecteerDatum(tekst);
  const rechtsvorm = detecteerRechtsvorm(tekst);
  const bedragen = detecteerBedragen(tekst);
  const secties: RapportSectie[] = [];
  const vragen: RapportPunt[] = [];
  const vraag = (t: string) => vragen.push({ tekst: t, label: "te_controleren" });

  // 1. Van wie komt deze brief?
  const van: RapportPunt[] = [];
  const org = ex.instantie || "";
  const orgSoort: OrgSoort = org ? soortOrganisatie(`${org} ${ex.afdeling || ""}`) : "onbekend";
  if (org) van.push(feit(`Afzender volgens de brief: ${[ex.instantie, ex.afdeling].filter(Boolean).join(", ")}.`, ex.instantie, ex.afdeling));
  van.push(ORG_DUIDING[orgSoort]);
  if (ex.in_opdracht_van) {
    van.push(feit(`De afzender schrijft in opdracht van / namens: ${ex.in_opdracht_van}.`, ex.in_opdracht_van));
    vraag(`Kan ${org || "de afzender"} de opdracht of volmacht van ${ex.in_opdracht_van} laten zien?`);
  } else if (orgSoort === "uitvoerder" || orgSoort === "bedrijf") {
    van.push({ tekst: "De brief vermeldt niet duidelijk namens welke overheid of opdrachtgever de afzender handelt.", label: "te_controleren" });
    vraag("Namens welke overheid of opdrachtgever handelt u, en op grond waarvan (opdracht, volmacht, samenwerkingsregeling)?");
  }
  if (orgSoort === "bedrijf" && bedragen.length) vraag("Op welk besluit, vonnis, dwangbevel of welke overeenkomst is deze vordering gebaseerd? Graag een kopie.");
  if (orgSoort === "onbekend") vraag("Welke organisatie heeft deze brief verstuurd, en in welke hoedanigheid?");
  secties.push({ titel: "1. Van wie komt deze brief?", uitleg: "Is het echt een overheid — of een partij die namens een ander schrijft?", punten: van });

  // 2. Wie besliste, wie ondertekende, wie maakte hem op?
  const wie: RapportPunt[] = [];
  if (ex.namens) {
    wie.push(feit(`Verantwoordelijk (getekend namens): ${ex.namens}.`, ex.namens));
    wie.push({ tekst: "“Namens” betekent: de ondertekenaar beslist niet op eigen gezag, maar in mandaat voor dit bestuursorgaan. Een algemeen mandaat moet schriftelijk zijn verleend; je mag vragen welk mandaatbesluit het is. Mandaatbesluiten worden vaak gepubliceerd op officielebekendmakingen.nl.", label: "interpretatie", bron: "art. 10:5 en 10:10 Awb" });
    vraag(`Op grond van welk mandaatbesluit is namens ${ex.namens} ondertekend? Graag de vindplaats of een kopie.`);
  } else {
    wie.push({ tekst: "De brief vermeldt niet namens welk bestuursorgaan is besloten. Bij een besluit dat een medewerker in mandaat neemt, moet dat wel vermeld staan.", label: "te_controleren", bron: "art. 10:10 Awb" });
    vraag("Welk bestuursorgaan heeft dit besluit genomen?");
  }
  const zonderHandtekening = eerste(tekst, NIET_ONDERTEKEND);
  if (ex.ondertekenaar) {
    wie.push(feit(`Ondertekend door: ${[ex.ondertekenaar, ex.functie].filter(Boolean).join(", ")}.`, ex.ondertekenaar, ex.functie));
  } else if (ex.functie) {
    wie.push(feit(`Er staat alleen een functie onder de brief: ${ex.functie} — geen naam.`, ex.functie));
    vraag("Wie (naam en functie) heeft deze brief ondertekend?");
  } else if (!zonderHandtekening) {
    wie.push({ tekst: "Er staat geen naam van een ondertekenaar onder de brief.", label: "te_controleren" });
    vraag("Wie (naam en functie) heeft dit besluit genomen en ondertekend?");
  }
  if (zonderHandtekening) {
    wie.push({ tekst: "De brief is niet persoonlijk ondertekend / automatisch aangemaakt.", label: "vaststaand", bron: `“${zonderHandtekening.zin}”` });
    wie.push({ tekst: "Een brief zonder handtekening is niet automatisch ongeldig — automatisch aangemaakte besluiten komen veel voor. Er moet wél een verantwoordelijk bestuursorgaan achter staan, en je mag vragen wie dat is.", label: "interpretatie" });
  }
  const beh = eerste(tekst, BEHANDELAAR);
  if (ex.behandelaar || beh) {
    wie.push(ex.behandelaar
      ? feit(`Opgesteld / behandeld door: ${ex.behandelaar}.`, ex.behandelaar, beh?.zin)
      : { tekst: "Behandelaar of contactpersoon genoemd in de brief.", label: "vaststaand", bron: `“${beh!.zin}”` });
  } else {
    wie.push({ tekst: "Niet vermeld wie de brief heeft opgesteld of behandelt.", label: "te_controleren" });
    vraag("Welke medewerker heeft deze brief opgesteld en behandelt het dossier?");
  }
  for (const b of bevindingen.filter((b) => /bevoeg|mandaat|namens/i.test(`${b.titel} ${b.grondslag}`))) {
    wie.push({ tekst: `${b.titel}: ${b.toelichting}`, label: statusNaarLabel(b.status), bron: b.bewijs ? `“${b.bewijs}” — ${b.grondslag}` : b.grondslag });
  }
  secties.push({ titel: "2. Wie besliste, wie ondertekende, wie maakte hem op?", uitleg: "Drie verschillende rollen: het bestuursorgaan dat beslist, de persoon die (in mandaat) ondertekent, en de medewerker die de brief opstelt.", punten: wie });

  // 3. Is de brief echt?
  const echtPunten: RapportPunt[] = [
    { tekst: "Twijfel je of de brief echt is? Zoek zelf het telefoonnummer of e-mailadres op de officiële website van de instantie — niet het nummer uit de brief — en vraag of de brief van hen komt.", label: "interpretatie" },
  ];
  const iban = eerste(tekst, IBAN);
  if (iban) {
    echtPunten.push({ tekst: `De brief vraagt betaling op rekeningnummer ${iban.m[0]}. Controleer vóór je betaalt dat dit rekeningnummer van de instantie zelf is (bijv. via de officiële website of eerdere, zekere correspondentie).`, label: "te_controleren", bron: `“${iban.zin}”` });
  }
  secties.push({ titel: "3. Is de brief echt?", punten: echtPunten });

  // 4. Wat leggen ze je op en waarop baseren ze het?
  const wat: RapportPunt[] = [];
  wat.push(soort.bron
    ? { tekst: `Soort brief: ${DOCTYPE_TEKST[dt]}.`, label: "vaststaand", bron: soort.bron }
    : { tekst: `Soort brief: ${DOCTYPE_TEKST[dt]} (niet eenduidig te herkennen — controleer dit).`, label: "te_controleren" });
  const opdracht = eerste(tekst, /(u\s+dient|dient\s+u|u\s+moet|moet\s+u|wij\s+verzoeken\s+u|verzoeken\s+wij\s+u|wordt\s+u\s+verzocht|u\s+wordt\s+verzocht|wij\s+vorderen|leggen\s+wij\s+u)/i);
  if (opdracht) wat.push({ tekst: "Wat er van je gevraagd wordt (letterlijk).", label: "vaststaand", bron: `“${opdracht.zin}”` });
  else if (ex.verlangd_omschrijving) wat.push(feit(`Wat er van je verlangd wordt: ${ex.verlangd_omschrijving}.`, ex.verlangd_citaat, ex.verlangd_omschrijving));
  for (const z of bedragen) wat.push({ tekst: "Genoemd bedrag.", label: "vaststaand", bron: `“${z}”` });
  if (bedragen.length) vraag("Hoe is het bedrag berekend? Graag een specificatie.");
  const grond = ex.grondslagen.map<RapportPunt>((g) => {
    const bron = bronVan(g.citaat, g.regel);
    return bron
      ? { tekst: `Grondslag volgens de brief: ${g.regel}. Of die regel dit echt toestaat, kun je nalezen op wetten.overheid.nl.`, label: "vaststaand", bron }
      : { tekst: `Mogelijke grondslag: ${g.regel} (niet letterlijk teruggevonden in je brief — controleer dit).`, label: "te_controleren" };
  });
  if (grond.length) wat.push(...grond);
  else {
    wat.push({ tekst: "De brief noemt geen duidelijke wettelijke grondslag. Een besluit moet vermelden op welk wettelijk voorschrift het berust (zo mogelijk) en deugdelijk gemotiveerd zijn.", label: "te_controleren", bron: "art. 3:46 en 3:47 Awb" });
    vraag("Op welk wetsartikel of welke verordening baseert u dit?");
  }
  if (["boete", "last_onder_dwangsom", "bestuursdwang"].includes(dt)) vraag("Welke feiten liggen hieraan ten grondslag (bijv. het rapport van de controle, foto's of metingen)? Graag een kopie.");
  secties.push({ titel: "4. Wat leggen ze je op — en waarop baseren ze het?", punten: wat });

  // 5. Aan wie is de brief gericht — klopt dat?
  const positie: RapportPunt[] = [];
  if (ex.geadresseerde) positie.push(feit(`De brief is gericht aan: ${ex.geadresseerde}.`, ex.geadresseerde_citaat, ex.geadresseerde));
  else positie.push({ tekst: "Niet duidelijk aan wie de brief precies gericht is. Controleer naam en rechtsvorm in de adressering.", label: "te_controleren" });
  if (rechtsvorm.rv !== "onbekend") {
    positie.push({ tekst: rechtsvorm.zeker ? `Rechtsvorm volgens de adressering: ${rechtsvorm.rv}.` : `Waarschijnlijk een ${rechtsvorm.rv} (afgeleid uit de adressering — controleer dit).`, label: rechtsvorm.zeker ? "vaststaand" : "interpretatie", bron: rechtsvorm.bron });
  }
  positie.push(RECHTSVORM_DUIDING[rechtsvorm.rv]);
  if (ex.bestuurder_persoonlijk) {
    positie.push({ tekst: "Je wordt als bestuurder persoonlijk aangesproken. Persoonlijke aansprakelijkheid van een bestuurder is de uitzondering en moet apart onderbouwd worden.", label: "te_controleren" });
    vraag("Waarom word ik persoonlijk aangesproken en niet de onderneming?");
  }
  if (ex.hoedanigheid !== "onbekend") {
    const rol = HOEDANIGHEID_TEKST[ex.hoedanigheid];
    const f = eerste(tekst, new RegExp(`\\b${rol}`, "i"));
    positie.push(f
      ? { tekst: `Je wordt aangesproken als ${rol}.`, label: "vaststaand", bron: `“${f.zin}”` }
      : { tekst: `Uit de inhoud leid ik af dat je wordt aangesproken als ${rol} (niet letterlijk zo genoemd) — controleer of die rol klopt.`, label: "interpretatie" });
  }
  positie.push({ tekst: "Een besluit moet gericht zijn aan de belanghebbende. Staat er een verkeerde naam of rechtsvorm, vraag dan om correctie.", label: "interpretatie", bron: "art. 1:2 Awb" });
  secties.push({ titel: "5. Aan wie is de brief gericht — klopt dat?", punten: positie });

  // 6. Klopt het besluit? (vaste Awb-controles)
  const awb = bevindingen.filter((b) => !/bevoeg|mandaat|namens/i.test(`${b.titel} ${b.grondslag}`)).map<RapportPunt>((b) => ({
    tekst: `${b.titel}: ${b.toelichting}`, label: statusNaarLabel(b.status), bron: b.bewijs ? `“${b.bewijs}” — ${b.grondslag}` : b.grondslag,
  }));
  secties.push({ titel: "6. Klopt het besluit?", uitleg: "De punten die volgens de Algemene wet bestuursrecht in een besluit horen.", punten: awb });

  // 7. Vragen die je kunt stellen
  if (!vragen.length) vragen.push({ tekst: "Geen openstaande vragen over wie de brief heeft gemaakt: afzender, verantwoordelijk orgaan en ondertekenaar staan erin. Controleer ze wel even zelf.", label: "interpretatie" });
  secties.push({ titel: "7. Vragen die je kunt stellen", uitleg: "Je mag dit gewoon vragen aan de afzender — telefonisch, per mail of schriftelijk. Bewaar het antwoord.", punten: vragen });

  // 8. Termijnen en je rechten
  const rechten: RapportPunt[] = detecteerTermijnen(tekst).map((z) => ({ tekst: "Termijn genoemd in de brief.", label: "vaststaand" as Label, bron: `“${z}”` }));
  const datum = parseDatum(datumTekst);
  if (BESLUITACHTIG.includes(dt)) {
    if (datum) {
      const uiterst = new Date(datum.getTime() + 42 * 86400000);
      rechten.push({ tekst: `Indicatief: uiterste bezwaardatum rond ${fmt(uiterst)} (zes weken na de briefdatum ${fmt(datum)}). De termijn loopt vanaf de dag ná bekendmaking — controleer de precieze datum en dien bij twijfel eerder in.`, label: "te_controleren", bron: "art. 6:7 en 6:8 Awb" });
    }
    rechten.push({ tekst: "Bezwaar maken: binnen zes weken, bij de instantie die het besluit nam. Heb je de antwoorden op je vragen nog niet? Dien dan op tijd een kort bezwaar in en vul de gronden later aan.", label: "interpretatie", bron: "art. 6:4, 6:6 en 6:7 Awb" });
    rechten.push({ tekst: "Bezwaar schort het besluit niet automatisch op. Bij spoed (lopende dwangsom, dreigende sluiting of beslag) kun je de voorzieningenrechter om schorsing vragen.", label: "interpretatie", bron: "art. 6:16 en 8:81 Awb" });
  }
  if (dt === "last_onder_dwangsom") {
    rechten.push({ tekst: "Een last onder dwangsom moet een begunstigingstermijn bevatten, en een verbeurde dwangsom wordt pas ingevorderd na een aparte invorderingsbeschikking — waartegen je opnieuw bezwaar kunt maken.", label: "interpretatie", bron: "art. 5:32a en 5:37 Awb" });
  }
  if (dt === "aanslag") rechten.push({ tekst: "Vraag bij bezwaar tegen een aanslag uitdrukkelijk om uitstel van betaling zolang het bezwaar loopt; of dat automatisch geldt, verschilt per belasting.", label: "te_controleren" });
  if (dt === "voornemen") rechten.push({ tekst: "Dit lijkt een voornemen, nog geen definitief besluit: je kunt eerst je zienswijze geven.", label: "interpretatie", bron: "art. 4:8 Awb" });
  if (dt === "informatieverzoek") rechten.push({ tekst: "Een toezichthouder mag inlichtingen vorderen voor zover dat redelijkerwijs nodig is; aan een rechtmatige vordering moet je meewerken.", label: "interpretatie", bron: "art. 5:13, 5:16 en 5:20 Awb" });
  rechten.push({ tekst: "Gaat het om een groot belang (hoge bedragen, sluiting, beslag)? Schakel dan een jurist of het Juridisch Loket in.", label: "interpretatie" });
  secties.push({ titel: "8. Termijnen en je rechten", punten: rechten });

  return {
    kop: { afzender: ex.instantie || undefined, kenmerk: kenmerk || undefined, datum: datumTekst || undefined, documenttype: DOCTYPE_TEKST[dt] },
    secties,
    conceptbrieven: [],
    aiGebruikt: ok,
  };
}
