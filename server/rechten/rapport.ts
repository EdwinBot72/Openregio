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
import { eerste, zinRond } from "./zin";
import { vindJuridischeTaal } from "./taal";

export type Label = "vaststaand" | "interpretatie" | "te_controleren";
export interface RapportPunt {
  tekst: string; label: Label;
  /** Letterlijk citaat uit de brief. */
  bron?: string;
  /** Wettelijke basis — alleen op verzoek getoond. */
  wet?: string;
  /** Alleen bij juridische taal: het begrip, wat je controleert en wat je ermee kunt. */
  term?: string; controleer?: string; ermee?: string;
}
export interface RapportSectie { titel: string; uitleg?: string; punten: RapportPunt[] }
export interface Conceptbrief { titel: string; tekst: string }
export interface Rapport {
  kop: { afzender?: string; kenmerk?: string; datum?: string; documenttype: string };
  secties: RapportSectie[];
  conceptbrieven: Conceptbrief[];
  aiGebruikt: boolean;
  /** Overheidsbrief: kan ook door "Besluit controleren". */
  besluitcontrole: boolean;
  /** Hoeveel tekst er is doorzocht, en of de brief langer was dan de grens. */
  omvang: { tekens: number; ingekort: boolean };
}

const MAX_TEKENS = 150_000;

// ── AI-extractie ─────────────────────────────────────────────
const RECHTSVORMEN = ["eenmanszaak", "vof", "bv", "nv", "stichting", "vereniging", "privepersoon", "onbekend"] as const;
const HOEDANIGHEDEN = ["werkgever", "vergunninghouder", "aanvrager", "belastingplichtige", "eigenaar", "gebruiker", "overtreder", "contractspartij", "onbekend"] as const;
const DOCTYPES = ["besluit", "aanslag", "last_onder_dwangsom", "bestuursdwang", "boete", "voornemen", "informatieverzoek", "aanmaning", "overig"] as const;
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

/** Lange brief: het lokale model krijgt briefhoofd én slot (ondertekening, "namens"), niet alleen het begin. */
function kopEnStaart(tekst: string): string {
  if (tekst.length <= 8000) return tekst;
  return `${tekst.slice(0, 5000)}\n\n[… middendeel van de brief weggelaten …]\n\n${tekst.slice(-3000)}`;
}

async function aiExtractie(tekst: string): Promise<{ ex: Extractie; ok: boolean }> {
  if (!process.env.OPENAI_API_KEY) return { ex: LEEG, ok: false };
  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEEM },
        { role: "user", content: userPrompt(kopEnStaart(tekst)) },
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
const RECHTSVORM_DUIDING: Record<Rv, RapportPunt> = {
  eenmanszaak: { tekst: "Bij een eenmanszaak ben je als eigenaar persoonlijk aansprakelijk, ook met je privévermogen. Een brief aan je onderneming raakt dus jou persoonlijk.", label: "interpretatie" },
  vof: { tekst: "Bij een vof zijn de vennoten ieder hoofdelijk aansprakelijk voor de schulden van de vof — ook met privévermogen.", label: "interpretatie" },
  bv: { tekst: "Een bv is een zelfstandige rechtspersoon. In beginsel is de bv aansprakelijk, niet jij persoonlijk als aandeelhouder of bestuurder.", label: "interpretatie" },
  nv: { tekst: "Een nv is een zelfstandige rechtspersoon. In beginsel is de nv aansprakelijk, niet de aandeelhouders of bestuurders persoonlijk.", label: "interpretatie" },
  stichting: { tekst: "Een stichting is een zelfstandige rechtspersoon. In beginsel is de stichting aansprakelijk, niet de bestuurders persoonlijk.", label: "interpretatie" },
  vereniging: { tekst: "Een vereniging is een rechtspersoon. Bij een vereniging zonder notariële akte (beperkte rechtsbevoegdheid) kunnen bestuurders wel persoonlijk aansprakelijk zijn.", label: "interpretatie", wet: "art. 2:30 BW" },
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
  boete: "Boetebesluit", voornemen: "Voornemen (nog geen definitief besluit)", informatieverzoek: "Informatieverzoek / vordering", aanmaning: "Aanmaning / betalingsverzoek", overig: "Brief",
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
function detecteerSoort(t: string): { dt: Dt; bron?: string } {
  const heeftBezwaar = /bezwaar\s+(maken|indienen)|kunt u .{0,60}bezwaar/i.test(t);
  const regels: [Dt, RegExp, boolean?][] = [
    ["informatieverzoek", /(vorder(en|ing)[^.]{0,40}inlichtingen|verzoek(en)?\s+(wij\s+)?u[^.]{0,40}(inlichtingen|informatie|gegevens)[^.]{0,40}(te\s+verstrekken|toe\s+te\s+sturen|aan\s+te\s+leveren))/i, true],
    ["voornemen", /(voornemen|vooraankondiging|zijn\s+(wij\s+)?voornemens|zijn\s+wij\s+van\s+plan)/i, true],
    ["last_onder_dwangsom", /last\s+onder\s+dwangsom|dwangsom/i],
    ["bestuursdwang", /bestuursdwang/i],
    ["boete", /bestuurlijke\s+boete|boete\s+op\s+te\s+leggen|leggen\s+wij\s+u\s+een\s+boete|boetebeschikking/i],
    ["aanslag", /naheffingsaanslag|aanslagbiljet|(belasting)?aanslag/i],
    ["aanmaning", /\baanmaning\b|incasso|sommatie|(betalings)?herinnering|ingebrekestelling|openstaande?\s+(schuld|bedrag|vordering|post)/i],
    ["besluit", /\bbesluit\b|beschikking|hebben\s+(wij\s+)?besloten|besluiten\s+wij/i],
  ];
  for (const [dt, re, alleenZonderBezwaar] of regels) {
    if (alleenZonderBezwaar && heeftBezwaar) continue;
    const f = eerste(t, re);
    // "Wij hebben u eerder een aanslag gestuurd" = verwijzing naar een oud besluit, geen nieuw besluit.
    if (f && (dt === "aanslag" || dt === "besluit") && /\b(eerder|eerdere|reeds|vorige)\b/i.test(f.zin)) continue;
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

/** Zoekt de rechtsvorm alleen in de adressering — niet in het briefhoofd van de afzender. */
function detecteerRechtsvorm(adressering: string): { rv: Rv; bron?: string; zeker: boolean } {
  const kop = adressering;
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

const ORG_WOORD = /(gemeente|waterschap|hoogheemraadschap|wetterskip|provincie|belastingdienst|belastingen|ministerie|rijksdienst|\buwv\b|\bcjib\b|\bduo\b|\bsvb\b|\bnvwa\b|inspectie|omgevingsdienst|incasso|deurwaarder|advocat|\bB\.\s?V\.|\bBV\b|\bN\.\s?V\.|bureau)/i;
/** Afzender uit het briefhoofd: eerste regel(s) vóór de adressering die op een organisatie lijken. */
function detecteerAfzender(t: string): string | null {
  const regels = t.slice(0, 800).split(/\n/).map((r) => r.trim()).filter(Boolean).slice(0, 6);
  for (const r of regels) {
    if (/^(aan|t\.a\.v|datum|kenmerk|betreft|onderwerp|geachte)\b/i.test(r)) break;
    if (r.length <= 80 && ORG_WOORD.test(r)) return r;
  }
  return null;
}
/** "namens het college van burgemeester en wethouders" e.d. — alleen bestuursorganen. */
const NAMENS_ORGAAN = /namens\s+((?:het\s+)?(?:college\s+van\s+burgemeester\s+en\s+wethouders|burgemeester\s+en\s+wethouders|de\s+burgemeester|gedeputeerde\s+staten|(?:het\s+)?dagelijks\s+bestuur[^\n,.]{0,40}|de\s+inspecteur[^\n,.]{0,40}|de\s+minister[^\n,.]{0,60}|de\s+staatssecretaris[^\n,.]{0,60}|de\s+heffingsambtenaar[^\n,.]{0,40}|de\s+invorderingsambtenaar[^\n,.]{0,40}|de\s+directeur[^\n,.]{0,40}))/i;

const NIET_ONDERTEKEND = /(niet\s+(persoonlijk\s+)?ondertekend|zonder\s+handtekening|geldig\s+zonder\s+handtekening|automatisch\s+(aangemaakt|verzonden|gegenereerd|verwerkt)|(computer|systeem)\s*(gegenereerd|aangemaakt))/i;
const BEHANDELAAR = /(behandeld\s+door|behandelaar|contactpersoon|inlichtingen\s+bij|opgemaakt\s+door|zaakbehandelaar)\s*:?\s*([^\n]{3,70})/i;
const IBAN = /\bNL\s?\d{2}\s?[A-Z]{4}(?:\s?\d{4}){2}\s?\d{2}\b/;

// ── Reactiebrief: alleen bevoegdheid en herkomst, nooit de inhoud ──
interface BriefGegevens {
  overheid: boolean; org: string; afdeling: string | null; kenmerk: string | null; datum: string | null;
  namens: string | null; ondertekenaar: string | null; functie: string | null; behandelaar: string | null;
  opdrachtgever: string | null; incasso: boolean;
}

/**
 * Vaste brief (geen AI) waarin de ontvanger vraagt wie bevoegd is, wie de brief heeft
 * opgemaakt en ondertekend, en op grond waarvan. Gaat bewust niet in op de inhoud.
 */
function verificatiebrief(g: BriefGegevens): Conceptbrief {
  const verwijzing = [g.datum && `van ${g.datum}`, g.kenmerk && `met kenmerk ${g.kenmerk}`].filter(Boolean).join(" ");
  const ondertekend = g.ondertekenaar ? `${g.ondertekenaar}${g.functie ? ` (${g.functie})` : ""}` : null;
  const vragen: string[] = [];
  if (g.overheid) {
    vragen.push(g.namens
      ? `Uw brief is ondertekend namens ${g.namens}. Heeft dit bestuursorgaan zelf besloten, of is in mandaat besloten? Op welke datum is het besluit genomen?`
      : "Welk bestuursorgaan heeft dit besluit genomen, en op welke datum? Uit de brief blijkt niet namens wie is ondertekend.");
    vragen.push(ondertekend
      ? `Op grond van welk mandaat- of machtigingsbesluit was ${ondertekend} bevoegd deze brief te ondertekenen? Graag de vindplaats of een kopie van dat besluit.`
      : "Wie (naam en functie) heeft deze brief ondertekend, en op grond van welk mandaat- of machtigingsbesluit? Graag de vindplaats of een kopie van dat besluit.");
    vragen.push(g.behandelaar
      ? `U noemt ${g.behandelaar} als behandelaar. Heeft deze persoon de brief ook opgesteld? Zo niet: wie (naam en functie) heeft de brief opgemaakt?`
      : "Wie (naam en functie) heeft deze brief opgemaakt?");
    vragen.push("Op welk wettelijk voorschrift berust de bevoegdheid van het bestuursorgaan om mij dit op te leggen? Graag het artikel en de wet of verordening.");
  } else {
    vragen.push(g.opdrachtgever
      ? `U schrijft namens ${g.opdrachtgever}. Graag een bewijs van uw opdracht of volmacht.`
      : "Namens wie treedt u op? Graag de naam van uw opdrachtgever en een bewijs van uw opdracht of volmacht.");
    vragen.push("Op welke overeenkomst, factuur, beslissing of welk vonnis berust de vordering? Graag een kopie.");
    vragen.push("Wie (naam en functie) heeft deze brief opgemaakt en ondertekend, en is die persoon bevoegd uw organisatie te vertegenwoordigen?");
    if (g.incasso) vragen.push("Onder welk nummer staat u ingeschreven in het incassoregister van Justis?");
  }
  const aan = [g.org, g.afdeling].filter(Boolean).join("\n") || "[Naam van de afzender]";
  const regels = [
    "[Je naam / bedrijfsnaam]",
    "[Adres]",
    "[Postcode en plaats]",
    "",
    aan,
    "[Adres van de afzender]",
    "",
    "[Plaats], [datum]",
    "",
    `Betreft: uw brief${verwijzing ? ` ${verwijzing}` : ""}`,
    "",
    "Geachte heer, mevrouw,",
    "",
    `Ik heb uw brief${verwijzing ? ` ${verwijzing}` : ""} ontvangen. Voordat ik inhoudelijk reageer, wil ik vaststellen wie mij dit oplegt en of die daartoe bevoegd is. Ik verzoek u daarom om de volgende gegevens:`,
    "",
    ...vragen.map((v, i) => `${i + 1}. ${v}`),
    "",
    g.overheid
      ? "Ik ga pas op de inhoud in nadat ik deze gegevens heb ontvangen."
      : "Ik ga pas op de inhoud in nadat ik deze gegevens heb ontvangen. Tot die tijd verzoek ik u de invordering op te schorten en geen kosten in rekening te brengen.",
  ];
  regels.push("", "Met vriendelijke groet,", "", "[Naam]", "[Handtekening]");
  return { titel: g.overheid ? "Verzoek: wie besliste, wie tekende, met welke bevoegdheid?" : "Verzoek: namens wie en op grond waarvan?", tekst: regels.join("\n") };
}

// ── Rapport bouwen ───────────────────────────────────────────
export async function maakRechtenRapport(brieftekst: string): Promise<Rapport> {
  // Tot ca. 50 pagina's: de vaste controles doorzoeken de hele brief.
  const tekst = brieftekst.slice(0, MAX_TEKENS);
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
  const bedragen = detecteerBedragen(tekst);
  const secties: RapportSectie[] = [];
  const vragen: RapportPunt[] = [];
  const vraag = (t: string) => vragen.push({ tekst: t, label: "te_controleren" });

  // 1. Van wie komt deze brief?
  const van: RapportPunt[] = [];
  const briefhoofd = detecteerAfzender(tekst);
  const org = briefhoofd || ex.instantie || "";
  const afdeling = ex.afdeling && !org.toLowerCase().includes(ex.afdeling.toLowerCase()) ? ex.afdeling : null;
  // Eerst op de naam van de organisatie; de afdeling ("Team Belastingen") alleen als de naam niets zegt.
  const orgSoort: OrgSoort = !org ? "onbekend"
    : soortOrganisatie(org) !== "onbekend" ? soortOrganisatie(org) : soortOrganisatie(`${org} ${afdeling || ""}`);
  /** Overheid of (vermoedelijk) overheid: dan gelden bestuursorgaan, mandaat en Awb. */
  const overheid = orgSoort !== "bedrijf";
  if (org) van.push(feit(`Afzender volgens de brief: ${[org, afdeling].filter(Boolean).join(", ").replace(/\.$/, "")}.`, briefhoofd, ex.instantie, afdeling));
  van.push(ORG_DUIDING[orgSoort]);
  const opdrachtVast = eerste(tekst, /(?:[Nn]amens|[Ii]n\s+opdracht\s+van)\s+(?:onze|mijn)\s+(?:opdrachtgever|cliënte?|client)\s*,?\s*([A-Z][\wÀ-ÿ&'-]*(?:\s+(?:[A-Z][\wÀ-ÿ&'-]*|B\.V\.|N\.V\.|&))*)/);
  const opdrachtgever = ex.in_opdracht_van || opdrachtVast?.m[1].trim() || null;
  if (opdrachtgever) {
    van.push(feit(`De afzender schrijft in opdracht van / namens: ${opdrachtgever}.`, opdrachtVast?.zin, opdrachtgever));
    vraag(`Kan ${org || "de afzender"} de opdracht of volmacht van ${opdrachtgever} laten zien?`);
  } else if (orgSoort === "uitvoerder" || orgSoort === "bedrijf") {
    van.push({ tekst: "De brief vermeldt niet duidelijk namens welke overheid of opdrachtgever de afzender handelt.", label: "te_controleren" });
    vraag("Namens welke overheid of opdrachtgever handelt u, en op grond waarvan (opdracht, volmacht, samenwerkingsregeling)?");
  }
  if (orgSoort === "bedrijf" && bedragen.length) vraag("Op welk besluit, vonnis, dwangbevel of welke overeenkomst is deze vordering gebaseerd? Graag een kopie.");
  if (orgSoort === "onbekend") vraag("Welke organisatie heeft deze brief verstuurd, en in welke hoedanigheid?");

  // 2. Wie besliste, wie ondertekende, wie maakte hem op?
  const wie: RapportPunt[] = [];
  const namensVast = eerste(tekst, NAMENS_ORGAAN);
  const namens = overheid ? (namensVast?.m[1].replace(/\s+/g, " ") || ex.namens) : null;
  if (!overheid) {
    wie.push({ tekst: "Een bedrijf neemt geen besluit zoals een overheid dat doet. Waar het om gaat: namens wie het schrijft, en of het daarvoor een opdracht heeft (zie hierboven).", label: "interpretatie" });
  } else if (namens) {
    wie.push(feit(`Verantwoordelijk (getekend namens): ${namens}.`, namensVast?.zin, namens));
    wie.push({ tekst: "“Namens” betekent: de ondertekenaar beslist niet op eigen gezag, maar in mandaat voor dit bestuursorgaan. Een algemeen mandaat moet schriftelijk zijn verleend; je mag vragen welk mandaatbesluit het is. Mandaatbesluiten worden vaak gepubliceerd op officielebekendmakingen.nl.", label: "interpretatie", wet: "art. 10:5 en 10:10 Awb" });
    vraag(`Op grond van welk mandaatbesluit is namens ${namens} ondertekend? Graag de vindplaats of een kopie.`);
  } else {
    wie.push({ tekst: "De brief vermeldt niet namens welk bestuursorgaan is besloten. Bij een besluit dat een medewerker in mandaat neemt, moet dat wel vermeld staan.", label: "te_controleren", wet: "art. 10:10 Awb" });
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
    vraag(overheid ? "Wie (naam en functie) heeft dit besluit genomen en ondertekend?" : "Wie (naam en functie) heeft deze brief ondertekend?");
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
  for (const b of overheid ? bevindingen.filter((b) => /bevoeg|mandaat|namens/i.test(`${b.titel} ${b.grondslag}`)) : []) {
    wie.push({ tekst: `${b.titel}: ${b.toelichting}`, label: statusNaarLabel(b.status), bron: b.bewijs ? `“${b.bewijs}”` : undefined, wet: b.grondslag });
  }
  secties.push({
    titel: "1. Wie is de tegenpartij — en wie is ‘wij’?",
    uitleg: overheid
      ? "Een organisatie handelt nooit zelf. Er is altijd een orgaan dat beslist, iemand die (namens dat orgaan) tekent en iemand die de brief opstelt. Alleen wie daartoe bevoegd is, kan jou iets opleggen."
      : "Een bedrijf handelt via een bestuurder of iemand met een volmacht. Wie schrijft er, voor wie — en kan die dat laten zien?",
    punten: [...van, ...wie],
  });

  // 2. Juridische taal in deze brief
  const taal = vindJuridischeTaal(tekst);
  secties.push({
    titel: "2. Juridische taal in deze brief",
    uitleg: "Woorden in je brief die rechtsgevolg hebben. Per woord: wat het betekent, wat je controleert en wat je ermee kunt.",
    punten: taal.length
      ? taal.map<RapportPunt>((t) => ({ term: t.term, tekst: t.betekenis, controleer: t.controleer, ermee: t.ermee, label: "interpretatie", bron: `“${t.citaat}”`, wet: t.wet }))
      : [{ tekst: "Geen bekende juridische kernbegrippen gevonden in deze brief.", label: "interpretatie" }],
  });

  // 3. Is de brief echt?
  const echtPunten: RapportPunt[] = [
    { tekst: "Twijfel je of de brief echt is? Zoek zelf het telefoonnummer of e-mailadres op de officiële website van de instantie — niet het nummer uit de brief — en vraag of de brief van hen komt.", label: "interpretatie" },
  ];
  const iban = eerste(tekst, IBAN);
  if (iban) {
    echtPunten.push({ tekst: `De brief vraagt betaling op rekeningnummer ${iban.m[0]}. Controleer vóór je betaalt dat dit rekeningnummer van de instantie zelf is (bijv. via de officiële website of eerdere, zekere correspondentie).`, label: "te_controleren", bron: `“${iban.zin}”` });
  }
  secties.push({ titel: "5. Is de brief echt?", punten: echtPunten });

  // 4. Wat leggen ze je op en waarop baseren ze het?
  const wat: RapportPunt[] = [];
  wat.push(soort.bron
    ? { tekst: `Soort brief: ${DOCTYPE_TEKST[dt]}.`, label: "vaststaand", bron: soort.bron }
    : { tekst: `Soort brief: ${DOCTYPE_TEKST[dt]} (niet eenduidig te herkennen — controleer dit).`, label: "te_controleren" });
  const opdracht = eerste(tekst, /(u\s+dient|dient\s+u|u\s+bent\s+verplicht|u\s+moet|moet\s+u|wij\s+verzoeken\s+u|verzoeken\s+wij\s+u|wordt\s+u\s+verzocht|u\s+wordt\s+verzocht|wij\s+vorderen|leggen\s+wij\s+u)/i);
  if (opdracht) wat.push({ tekst: "Wat er van je gevraagd wordt (letterlijk).", label: "vaststaand", bron: `“${opdracht.zin}”` });
  else if (ex.verlangd_omschrijving) wat.push(feit(`Wat er van je verlangd wordt: ${ex.verlangd_omschrijving}.`, ex.verlangd_citaat, ex.verlangd_omschrijving));
  for (const z of bedragen) wat.push({ tekst: "Genoemd bedrag.", label: "vaststaand", bron: `“${z}”` });
  if (bedragen.length) vraag("Hoe is het bedrag berekend? Graag een specificatie.");
  // AI-grondslagen zonder echte inhoud (bijv. de voorbeeldtekst uit de opdracht) tellen niet mee.
  const aiGrond = ex.grondslagen.filter((g) => !/zoals genoemd|wet\/artikel/i.test(g.regel) && /\d|wet|verordening|besluit|regeling/i.test(g.regel));
  const grondslagen = aiGrond.length ? aiGrond : [...tekst.matchAll(/\b(?:artikel|art\.)\s*\d[\w:.]*(?:\s+lid\s+\d+)?\s+(?:van\s+)?(?:de|het)\s+[^.,;\n]{3,90}?(?=\s+en\s+(?:artikel|art\.)|[.,;\n]|$)/gi)]
    .slice(0, 6).map((m) => ({ regel: m[0].replace(/\s+/g, " ").trim(), citaat: m[0] }));
  const grond = grondslagen.map<RapportPunt>((g) => {
    const bron = bronVan(g.citaat, g.regel);
    return bron
      ? { tekst: `Grondslag volgens de brief: ${g.regel}. Of die regel dit echt toestaat, kun je nalezen op wetten.overheid.nl.`, label: "vaststaand", bron }
      : { tekst: `Mogelijke grondslag: ${g.regel} (niet letterlijk teruggevonden in je brief — controleer dit).`, label: "te_controleren" };
  });
  if (grond.length) wat.push(...grond);
  else if (!overheid) {
    wat.push({ tekst: "De brief noemt niet op welke overeenkomst, factuur of welk vonnis de vordering berust.", label: "te_controleren" });
  } else {
    wat.push({ tekst: "De brief noemt geen duidelijke wettelijke grondslag. Een besluit moet vermelden op welk wettelijk voorschrift het berust (zo mogelijk) en deugdelijk gemotiveerd zijn.", label: "te_controleren", wet: "art. 3:46 en 3:47 Awb" });
    vraag("Op welk wetsartikel of welke verordening baseert u dit?");
  }
  if (["boete", "last_onder_dwangsom", "bestuursdwang"].includes(dt)) vraag("Welke feiten liggen hieraan ten grondslag (bijv. het rapport van de controle, foto's of metingen)? Graag een kopie.");
  secties.push({ titel: "3. Wie zegt dat je iets moet of schuldig bent?", uitleg: "Een plicht of schuld ontstaat niet door een brief, maar uit de wet, een besluit, een overeenkomst of een vonnis. Waar baseert de afzender zich op?", punten: wat });

  // 5. Aan wie is de brief gericht — klopt dat?
  const positie: RapportPunt[] = [];
  const aanBlok = tekst.match(/^\s*(?:aan|t\.a\.v\.?)\s*:?\s*([^\n]+)/im)?.[1].trim() || "";
  if (ex.geadresseerde) positie.push(feit(`De brief is gericht aan: ${ex.geadresseerde}.`, ex.geadresseerde_citaat, ex.geadresseerde));
  else if (aanBlok) positie.push({ tekst: `De brief is gericht aan: ${aanBlok.replace(/\.$/, "")}.`, label: "vaststaand", bron: `“${aanBlok}”` });
  else positie.push({ tekst: "Niet duidelijk aan wie de brief precies gericht is. Controleer naam en rechtsvorm in de adressering.", label: "te_controleren" });
  const adressering = [ex.geadresseerde_citaat, ex.geadresseerde, aanBlok].filter((x): x is string => !!x && !!echt(x)).join("\n");
  const rechtsvorm = detecteerRechtsvorm(adressering);
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
  positie.push(overheid
    ? { tekst: "Een besluit moet gericht zijn aan de belanghebbende. Staat er een verkeerde naam of rechtsvorm, vraag dan om correctie.", label: "interpretatie", wet: "art. 1:2 Awb" }
    : { tekst: "Een vordering hoort gericht te zijn aan de partij met wie de overeenkomst is gesloten. Word je privé aangesproken voor iets van je onderneming (of andersom)? Betwist dat dan schriftelijk.", label: "interpretatie" });
  secties.push({ titel: "4. Aan wie is de brief gericht — klopt jouw rol?", punten: positie });

  // 7. Vragen die je kunt stellen
  if (!vragen.length) vragen.push({ tekst: "Geen openstaande vragen over wie de brief heeft gemaakt: afzender, verantwoordelijk orgaan en ondertekenaar staan erin. Controleer ze wel even zelf.", label: "interpretatie" });
  secties.push({ titel: "6. Vragen die je kunt stellen", uitleg: "Je mag dit gewoon vragen aan de afzender — telefonisch, per mail of schriftelijk. Bewaar het antwoord.", punten: vragen });

  // 8. Termijnen en je rechten
  const rechten: RapportPunt[] = detecteerTermijnen(tekst).map((z) => ({ tekst: "Termijn genoemd in de brief.", label: "vaststaand" as Label, bron: `“${z}”` }));
  const datum = parseDatum(datumTekst);
  if (overheid && BESLUITACHTIG.includes(dt)) {
    if (datum) {
      const uiterst = new Date(datum.getTime() + 42 * 86400000);
      rechten.push({ tekst: `Indicatief: uiterste bezwaardatum rond ${fmt(uiterst)} (zes weken na de briefdatum ${fmt(datum)}). De termijn loopt vanaf de dag ná bekendmaking — controleer de precieze datum en dien bij twijfel eerder in.`, label: "te_controleren", wet: "art. 6:7 en 6:8 Awb" });
    }
    rechten.push({ tekst: "Bezwaar maken: binnen zes weken, bij de instantie die het besluit nam. Heb je de antwoorden op je vragen nog niet? Dien dan op tijd een kort bezwaar in en vul de gronden later aan.", label: "interpretatie", wet: "art. 6:4, 6:6 en 6:7 Awb" });
    rechten.push({ tekst: "Bezwaar schort het besluit niet automatisch op. Bij spoed (lopende dwangsom, dreigende sluiting of beslag) kun je de voorzieningenrechter om schorsing vragen.", label: "interpretatie", wet: "art. 6:16 en 8:81 Awb" });
  }
  if (dt === "last_onder_dwangsom") {
    rechten.push({ tekst: "Een last onder dwangsom moet een begunstigingstermijn bevatten, en een verbeurde dwangsom wordt pas ingevorderd na een aparte invorderingsbeschikking — waartegen je opnieuw bezwaar kunt maken.", label: "interpretatie", wet: "art. 5:32a en 5:37 Awb" });
  }
  if (dt === "aanslag") rechten.push({ tekst: "Vraag bij bezwaar tegen een aanslag uitdrukkelijk om uitstel van betaling zolang het bezwaar loopt; of dat automatisch geldt, verschilt per belasting.", label: "te_controleren" });
  if (dt === "voornemen") rechten.push({ tekst: "Dit lijkt een voornemen, nog geen definitief besluit: je kunt eerst je zienswijze geven.", label: "interpretatie", wet: "art. 4:8 Awb" });
  if (dt === "informatieverzoek") rechten.push({ tekst: "Een toezichthouder mag inlichtingen vorderen voor zover dat redelijkerwijs nodig is; aan een rechtmatige vordering moet je meewerken.", label: "interpretatie", wet: "art. 5:13, 5:16 en 5:20 Awb" });
  if (overheid && dt === "aanmaning") rechten.push({ tekst: "Een aanmaning is meestal geen nieuw besluit, maar een herinnering aan een eerder besluit of aanslag. Vraag om welk besluit het gaat en of daartegen nog bezwaar of beroep loopt.", label: "interpretatie" });
  if (!overheid) {
    const kort = /binnen\s+(\d+|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|dertien)\s+dag/i.exec(tekst);
    const WOORD: Record<string, number> = { een: 1, "één": 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11, twaalf: 12, dertien: 13 };
    const dagen = kort ? (Number(kort[1]) || WOORD[kort[1].toLowerCase()] || 99) : 99;
    const incassokosten = eerste(tekst, /incassokosten|buitengerechtelijke\s+kosten/i);
    if (incassokosten) {
      rechten.push({ tekst: "Incassokosten mogen bij een consument pas worden gerekend na een aanmaning die je 14 dagen de tijd geeft om te betalen, gerekend vanaf de dag na ontvangst (de ‘14-dagenbrief’). Tussen bedrijven gelden andere regels.", label: "interpretatie", wet: "art. 6:96 lid 6 BW" });
      if (dagen < 14) rechten.push({ tekst: `Deze brief rekent al incassokosten en geeft je maar ${dagen} ${dagen === 1 ? "dag" : "dagen"}. Ben je consument en is er geen eerdere 14-dagenbrief gestuurd, dan zijn die kosten niet verschuldigd.`, label: "te_controleren", bron: `“${incassokosten.zin}”` });
    }
    if (/incasso/i.test(`${org} ${tekst}`)) rechten.push({ tekst: "Een incassobureau moet sinds 1 april 2024 ingeschreven staan in het incassoregister van Justis (Wet kwaliteit incassodienstverlening). Controleer dat voordat je betaalt.", label: "te_controleren" });
    if (/beslag|deurwaarder/i.test(tekst)) rechten.push({ tekst: "Beslag op je loon of spullen kan alleen met een executoriale titel, zoals een vonnis van de rechter. Een incassobureau kan zonder vonnis geen beslag leggen.", label: "interpretatie", wet: "art. 430 Wetboek van Burgerlijke Rechtsvordering" });
    rechten.push({ tekst: "Ben je het niet eens met de vordering? Laat dat schriftelijk en met redenen weten en bewaar een kopie. Wil het bedrijf toch betaald krijgen, dan moet het naar de rechter.", label: "interpretatie" });
  }
  rechten.push({ tekst: "Gaat het om een groot belang (hoge bedragen, sluiting, beslag)? Schakel dan een jurist of het Juridisch Loket in.", label: "interpretatie" });
  secties.push({ titel: "7. Wat kun je hiermee — termijnen en rechten", punten: rechten });
  secties.sort((x, y) => parseInt(x.titel, 10) - parseInt(y.titel, 10));

  return {
    kop: { afzender: org || undefined, kenmerk: kenmerk || undefined, datum: datumTekst || undefined, documenttype: DOCTYPE_TEKST[dt] },
    secties,
    conceptbrieven: [verificatiebrief({
      overheid, org, afdeling, kenmerk, datum: datumTekst, namens,
      ondertekenaar: ex.ondertekenaar, functie: ex.functie, behandelaar: ex.behandelaar || beh?.m[2].trim() || null,
      opdrachtgever, incasso: /incasso/i.test(`${org} ${tekst}`),
    })],
    aiGebruikt: ok,
    besluitcontrole: overheid,
    omvang: { tekens: tekst.length, ingekort: brieftekst.length > MAX_TEKENS },
  };
}
