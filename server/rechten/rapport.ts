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
import { controleerBesluit, stelWooVerzoekOp, type Bevinding } from "../brieftypes";

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
  documenttype: "overig", documenttype_citaat: null,
  verlangd_soort: "overig", verlangd_omschrijving: null, bedrag: null, verlangd_citaat: null,
  termijnen: [], grondslagen: [], kenmerk: null, datum_brief: null,
};

const SYSTEEM = `Je leest een brief van een overheidsinstantie (gemeente, Belastingdienst, provincie, toezichthouder) aan een ondernemer.
Je haalt ALLEEN feiten uit de tekst. Verzin niets en vul niets aan. Staat iets niet in de brief, gebruik dan null (of "onbekend"/"overig").
Bij velden die op _citaat eindigen geef je een LETTERLIJK stukje tekst uit de brief (exact overgenomen, maximaal 25 woorden).
Antwoord uitsluitend met geldige JSON, zonder uitleg.`;

function userPrompt(tekst: string): string {
  return `Geef deze JSON terug:
{
 "geadresseerde": naam aan wie de brief gericht is (persoon of bedrijf) of null,
 "geadresseerde_citaat": citaat of null,
 "rechtsvorm": een van ${RECHTSVORMEN.map((x) => `"${x}"`).join(", ")},
 "rechtsvorm_citaat": citaat of null,
 "bestuurder_persoonlijk": true als een bestuurder/directeur persoonlijk wordt aangesproken, anders false,
 "hoedanigheid": een van ${HOEDANIGHEDEN.map((x) => `"${x}"`).join(", ")},
 "hoedanigheid_citaat": citaat of null,
 "instantie": naam van de instantie die de brief stuurt of null,
 "afdeling": afdeling of null,
 "ondertekenaar": naam van wie ondertekent of null,
 "functie": functie van de ondertekenaar of null,
 "namens": namens wie getekend is (bijv. "namens burgemeester en wethouders") of null,
 "afzender_citaat": citaat van de ondertekening of null,
 "documenttype": een van ${DOCTYPES.map((x) => `"${x}"`).join(", ")},
 "documenttype_citaat": citaat of null,
 "verlangd_soort": een van ${VERLANGD.map((x) => `"${x}"`).join(", ")},
 "verlangd_omschrijving": korte omschrijving van wat van de ondernemer verlangd wordt of null,
 "bedrag": genoemd bedrag of null,
 "verlangd_citaat": citaat of null,
 "termijnen": [{"omschrijving": "...", "citaat": "..."}],
 "grondslagen": [{"regel": "wet/artikel/verordening zoals genoemd in de brief", "citaat": "..."}],
 "kenmerk": kenmerk of zaaknummer of null,
 "datum_brief": datum van de brief zoals vermeld of null
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
      max_tokens: 1100,
    });
    const raw = completion.choices[0]?.message?.content || "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return { ex: LEEG, ok: false };
    const j = JSON.parse(m[0]);
    const lijst = (x: unknown) => (Array.isArray(x) ? x : []);
    return {
      ok: true,
      ex: {
        geadresseerde: str(j.geadresseerde), geadresseerde_citaat: str(j.geadresseerde_citaat),
        rechtsvorm: kies(j.rechtsvorm, RECHTSVORMEN, "onbekend"), rechtsvorm_citaat: str(j.rechtsvorm_citaat),
        bestuurder_persoonlijk: j.bestuurder_persoonlijk === true,
        hoedanigheid: kies(j.hoedanigheid, HOEDANIGHEDEN, "onbekend"), hoedanigheid_citaat: str(j.hoedanigheid_citaat),
        instantie: str(j.instantie), afdeling: str(j.afdeling), ondertekenaar: str(j.ondertekenaar),
        functie: str(j.functie), namens: str(j.namens), afzender_citaat: str(j.afzender_citaat),
        documenttype: kies(j.documenttype, DOCTYPES, "overig"), documenttype_citaat: str(j.documenttype_citaat),
        verlangd_soort: kies(j.verlangd_soort, VERLANGD, "overig"), verlangd_omschrijving: str(j.verlangd_omschrijving),
        bedrag: str(j.bedrag), verlangd_citaat: str(j.verlangd_citaat),
        termijnen: lijst(j.termijnen).map((t: any) => ({ omschrijving: str(t?.omschrijving) || "", citaat: str(t?.citaat) })).filter((t) => t.omschrijving).slice(0, 6),
        grondslagen: lijst(j.grondslagen).map((g: any) => ({ regel: str(g?.regel) || "", citaat: str(g?.citaat) })).filter((g) => g.regel).slice(0, 8),
        kenmerk: str(j.kenmerk), datum_brief: str(j.datum_brief),
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

// ── Rapport bouwen ───────────────────────────────────────────
export async function maakRechtenRapport(brieftekst: string): Promise<Rapport> {
  const tekst = brieftekst.slice(0, 20000);
  const [{ ex, ok }, bevindingen] = await Promise.all([aiExtractie(tekst), Promise.resolve(controleerBesluit(tekst))]);
  const echt = makeVerifier(tekst);
  const bronCitaat = (c: string | null | undefined) => { const v = echt(c); return v ? `“${v}”` : undefined; };
  const feit = (tekst: string, citaat: string | null | undefined): RapportPunt => {
    const bron = bronCitaat(citaat);
    return bron ? { tekst, label: "vaststaand", bron } : { tekst: `${tekst} (niet letterlijk teruggevonden in je brief — controleer dit)`, label: "te_controleren" };
  };
  const secties: RapportSectie[] = [];
  const dt = ex.documenttype;

  // 1. Juridische positie
  const positie: RapportPunt[] = [];
  if (ex.geadresseerde) positie.push(feit(`De brief is gericht aan: ${ex.geadresseerde}.`, ex.geadresseerde_citaat));
  else positie.push({ tekst: "Niet duidelijk aan wie de brief precies gericht is. Controleer naam en rechtsvorm in de adressering.", label: "te_controleren" });
  if (ex.rechtsvorm !== "onbekend" && ex.rechtsvorm !== "privepersoon" && bronCitaat(ex.rechtsvorm_citaat)) {
    positie.push({ tekst: `Rechtsvorm volgens de brief: ${ex.rechtsvorm}.`, label: "vaststaand", bron: bronCitaat(ex.rechtsvorm_citaat) });
  }
  positie.push(RECHTSVORM_DUIDING[ex.rechtsvorm]);
  if (ex.bestuurder_persoonlijk) {
    positie.push({ tekst: "Je wordt als bestuurder persoonlijk aangesproken. Persoonlijke aansprakelijkheid van een bestuurder is de uitzondering en moet apart onderbouwd worden. Vraag waarop dit gebaseerd is.", label: "te_controleren" });
  }
  if (ex.hoedanigheid !== "onbekend") {
    positie.push(feit(`Je wordt aangesproken als ${HOEDANIGHEID_TEKST[ex.hoedanigheid]}. De verplichtingen horen bij die rol — controleer of die rol klopt.`, ex.hoedanigheid_citaat));
  } else {
    positie.push({ tekst: "Uit de brief blijkt niet in welke hoedanigheid je wordt aangesproken (bijv. als werkgever, vergunninghouder of belastingplichtige). Vraag dit zo nodig na.", label: "te_controleren" });
  }
  positie.push({ tekst: "Een besluit moet gericht zijn aan de belanghebbende. Staat er een verkeerde naam of rechtsvorm, vraag dan om correctie.", label: "interpretatie", bron: "art. 1:2 Awb" });
  secties.push({ titel: "1. Je juridische positie", uitleg: "Wie wordt aangesproken en in welke rol — dat bepaalt wat er van je gevraagd mag worden.", punten: positie });

  // 2. Wat wordt verlangd
  const verlangd: RapportPunt[] = [];
  verlangd.push({ tekst: `Soort brief: ${DOCTYPE_TEKST[dt]}.`, label: bronCitaat(ex.documenttype_citaat) ? "vaststaand" : "interpretatie", bron: bronCitaat(ex.documenttype_citaat) });
  verlangd.push(feit(`Wat er van je verlangd wordt: ${VERLANGD_TEKST[ex.verlangd_soort]}${ex.verlangd_omschrijving ? ` — ${ex.verlangd_omschrijving}` : ""}.`, ex.verlangd_citaat));
  if (ex.bedrag) verlangd.push(feit(`Genoemd bedrag: ${ex.bedrag}.`, ex.verlangd_citaat));
  secties.push({ titel: "2. Wat er van je verlangd wordt", punten: verlangd });

  // 3. Grondslag
  const grond: RapportPunt[] = ex.grondslagen.map((g) => {
    const bron = bronCitaat(g.citaat) || (echt(g.regel) ? `“${g.regel}”` : undefined);
    return bron
      ? { tekst: `De brief noemt als grondslag: ${g.regel}. Of die regel deze verplichting echt toestaat, is een juridische vraag — controleer het artikel op wetten.overheid.nl.`, label: "vaststaand", bron }
      : { tekst: `Mogelijke grondslag: ${g.regel} (niet letterlijk teruggevonden in je brief — controleer dit).`, label: "te_controleren" };
  });
  if (!grond.length) {
    grond.push({ tekst: "De brief noemt geen duidelijke wettelijke grondslag. Een besluit moet deugdelijk gemotiveerd zijn en zo mogelijk vermelden op welk wettelijk voorschrift het berust. Vraag naar de grondslag.", label: "te_controleren", bron: "art. 3:46 en 3:47 Awb" });
  }
  secties.push({ titel: "3. De grondslag", uitleg: "Waar komt de verplichting vandaan?", punten: grond });

  // 4. Wie handelt en is die bevoegd
  const wie: RapportPunt[] = [];
  const afz = [ex.instantie, ex.afdeling].filter(Boolean).join(", ");
  if (afz) wie.push(feit(`Afzender: ${afz}.`, ex.afzender_citaat || ex.instantie));
  if (ex.ondertekenaar || ex.functie) wie.push(feit(`Ondertekend door: ${[ex.ondertekenaar, ex.functie].filter(Boolean).join(", ")}.`, ex.afzender_citaat));
  if (ex.namens) wie.push(feit(`Getekend ${ex.namens}.`, ex.afzender_citaat || ex.namens));
  const isBevoegdheid = (b: Bevinding) => /bevoeg|mandaat|ondertek|namens/i.test(`${b.titel} ${b.grondslag}`);
  for (const b of bevindingen.filter(isBevoegdheid)) wie.push({ tekst: `${b.titel}: ${b.toelichting}`, label: statusNaarLabel(b.status), bron: b.bewijs ? `“${b.bewijs}” — ${b.grondslag}` : b.grondslag });
  if (!wie.length) wie.push({ tekst: "Niet duidelijk wie de brief heeft opgesteld en ondertekend. Vraag wie besloten heeft en op welke bevoegdheid (of welk mandaat) dat berust.", label: "te_controleren", bron: "art. 10:10 Awb" });
  secties.push({ titel: "4. Wie handelt — en is die bevoegd?", punten: wie });

  // 5. Wat moet aantoonbaar zijn
  const aantoonbaar = bevindingen.filter((b) => !isBevoegdheid(b)).map<RapportPunt>((b) => ({
    tekst: `${b.titel}: ${b.toelichting}`, label: statusNaarLabel(b.status), bron: b.bewijs ? `“${b.bewijs}” — ${b.grondslag}` : b.grondslag,
  }));
  secties.push({ titel: "5. Wat moet aantoonbaar zijn", uitleg: "De punten die volgens de Algemene wet bestuursrecht in een besluit horen.", punten: aantoonbaar });

  // 6. Wat ontbreekt
  const ontbreekt: RapportPunt[] = bevindingen.filter((b) => b.status === "niet_gevonden").map((b) => ({ tekst: `${b.titel} — niet gevonden in de brief.`, label: "te_controleren" as Label, bron: b.grondslag }));
  if (!ex.grondslagen.length) ontbreekt.push({ tekst: "Wettelijke grondslag niet genoemd.", label: "te_controleren", bron: "art. 3:47 Awb" });
  if (!ex.ondertekenaar && !ex.namens) ontbreekt.push({ tekst: "Niet duidelijk wie ondertekend heeft / namens wie.", label: "te_controleren", bron: "art. 10:10 Awb" });
  if (!ontbreekt.length) ontbreekt.push({ tekst: "Geen opvallende ontbrekende onderdelen gevonden bij de standaardcontrole. Dat zegt niets over de inhoudelijke juistheid.", label: "interpretatie" });
  secties.push({ titel: "6. Ontbrekende informatie of documenten", punten: ontbreekt });

  // 7. Rechten en acties (vaste regels)
  const rechten: RapportPunt[] = [];
  if (BESLUITACHTIG.includes(dt)) {
    rechten.push({ tekst: "Bezwaar maken: binnen zes weken na de dag waarop het besluit is bekendgemaakt, bij de instantie die het besluit nam.", label: "interpretatie", bron: "art. 6:4, 6:7 en 6:8 Awb" });
    rechten.push({ tekst: "Nog niet alle informatie? Dien op tijd een kort (pro forma) bezwaar in en vul de gronden later aan — de instantie moet je daarvoor een termijn geven.", label: "interpretatie", bron: "art. 6:6 Awb" });
    rechten.push({ tekst: "In de bezwaarprocedure heb je recht om gehoord te worden en om vooraf de stukken in te zien.", label: "interpretatie", bron: "art. 7:2 en 7:4 Awb" });
    rechten.push({ tekst: "Bezwaar schort een besluit niet automatisch op. Is het spoedeisend (bijv. een lopende dwangsom of dreigende sluiting), dan kun je de voorzieningenrechter vragen het besluit te schorsen.", label: "interpretatie", bron: "art. 6:16 en 8:81 Awb" });
  }
  if (dt === "last_onder_dwangsom") {
    rechten.push({ tekst: "Een last onder dwangsom moet een begunstigingstermijn bevatten: de tijd om het zelf op te lossen voordat er een dwangsom verbeurt.", label: "interpretatie", bron: "art. 5:32a Awb" });
    rechten.push({ tekst: "Een verbeurde dwangsom wordt pas ingevorderd na een aparte invorderingsbeschikking — daartegen kun je opnieuw bezwaar maken.", label: "interpretatie", bron: "art. 5:37 Awb" });
  }
  if (dt === "aanslag") {
    rechten.push({ tekst: "Vraag bij bezwaar tegen een aanslag uitdrukkelijk om uitstel van betaling zolang het bezwaar loopt. Of dat automatisch geldt, verschilt per belasting.", label: "te_controleren" });
  }
  if (dt === "voornemen") {
    rechten.push({ tekst: "Dit lijkt een voornemen, nog geen definitief besluit. Je kunt eerst je zienswijze geven — doe dat binnen de genoemde termijn, dan moet je kant van het verhaal worden meegewogen.", label: "interpretatie", bron: "art. 4:8 Awb" });
  }
  if (dt === "informatieverzoek") {
    rechten.push({ tekst: "Een toezichthouder mag inlichtingen vorderen, maar alleen voor zover dat redelijkerwijs nodig is. Vraag op welke bevoegdheid de vordering berust en welke gegevens echt nodig zijn.", label: "interpretatie", bron: "art. 5:13 en 5:16 Awb" });
    rechten.push({ tekst: "Aan een rechtmatige vordering moet je wel meewerken — gelijkwaardig, niet tegenwerkend.", label: "interpretatie", bron: "art. 5:20 Awb" });
  }
  rechten.push({ tekst: "Je kunt de stukken opvragen die aan deze brief of dit besluit ten grondslag liggen, met een verzoek op grond van de Wet open overheid.", label: "interpretatie", bron: "art. 4.1 Woo" });
  if (["eenmanszaak", "vof", "privepersoon", "onbekend"].includes(ex.rechtsvorm)) {
    rechten.push({ tekst: "Als natuurlijk persoon mag je de persoonsgegevens inzien die de instantie over jou verwerkt.", label: "interpretatie", bron: "art. 15 AVG" });
  }
  rechten.push({ tekst: "Ben je ontevreden over hoe de instantie zich gedroeg (bejegening, niet reageren), dan kun je een klacht indienen bij die instantie en daarna bij de (Nationale of gemeentelijke) ombudsman.", label: "interpretatie", bron: "art. 9:1 Awb" });
  if (BESLUITACHTIG.includes(dt)) {
    rechten.push({ tekst: "Lijd je schade door een onrechtmatig besluit, dan kun je om schadevergoeding vragen.", label: "interpretatie", bron: "titel 8.4 Awb" });
  }
  secties.push({ titel: "7. Je rechten en mogelijke acties", punten: rechten });

  // 8. Termijnen
  const termijnen: RapportPunt[] = ex.termijnen.map((t) => feit(t.omschrijving, t.citaat));
  const datum = parseDatum(ex.datum_brief);
  if (BESLUITACHTIG.includes(dt) && datum) {
    const uiterst = new Date(datum.getTime() + 42 * 86400000);
    termijnen.push({ tekst: `Indicatief: uiterste bezwaardatum rond ${fmt(uiterst)} (zes weken na de briefdatum ${fmt(datum)}). De termijn loopt vanaf de dag ná bekendmaking — controleer de precieze datum en dien bij twijfel eerder in.`, label: "te_controleren", bron: "art. 6:7 en 6:8 Awb" });
  }
  if (!termijnen.length) termijnen.push({ tekst: "Geen termijn gevonden in de brief. Controleer de brief zelf op een reactietermijn of bezwaartermijn.", label: "te_controleren" });
  secties.push({ titel: "8. Belangrijke termijnen", punten: termijnen });

  // 9. Vervolgstap
  const stap: RapportPunt[] = [];
  if (BESLUITACHTIG.includes(dt)) stap.push({ tekst: "Noteer de bezwaartermijn. Vraag de ontbrekende stukken op (Woo-verzoek hieronder) en dien bij twijfel binnen de termijn een pro forma bezwaar in; de gronden kun je later aanvullen.", label: "interpretatie" });
  else if (dt === "voornemen") stap.push({ tekst: "Geef binnen de termijn je zienswijze (concept hieronder). Vraag zo nodig eerst de stukken op.", label: "interpretatie" });
  else if (dt === "informatieverzoek") stap.push({ tekst: "Vraag schriftelijk naar de bevoegdheid en het doel van de vordering, en lever daarna wat redelijkerwijs nodig is.", label: "interpretatie" });
  else stap.push({ tekst: "Vraag bij onduidelijkheid schriftelijk om uitleg: wat wordt er precies van je verlangd, op welke grondslag, en wat zijn de gevolgen als je niet reageert.", label: "interpretatie" });
  stap.push({ tekst: "Gaat het om een groot belang (hoge bedragen, sluiting, je bedrijfsvoering)? Schakel dan een jurist of het Juridisch Loket in.", label: "interpretatie" });
  secties.push({ titel: "9. Praktische vervolgstap", punten: stap });

  // 10. Conceptbrieven (sjablonen, geen AI)
  const inst = ex.instantie || "[naam instantie]";
  const kenm = ex.kenmerk || "[kenmerk]";
  const dat = ex.datum_brief || "[datum brief]";
  const conceptbrieven: Conceptbrief[] = [{ titel: "Woo-verzoek (stukken opvragen)", tekst: stelWooVerzoekOp(bevindingen) }];
  if (BESLUITACHTIG.includes(dt)) {
    conceptbrieven.push({
      titel: "Pro forma bezwaar",
      tekst: `[Je naam / bedrijfsnaam]\n[Adres]\n\nAan: ${inst}\n\nBetreft: bezwaar tegen besluit van ${dat}, kenmerk ${kenm}\n\nGeachte heer, mevrouw,\n\nHierbij maak ik bezwaar tegen uw besluit van ${dat} met kenmerk ${kenm}.\n\nDe gronden van mijn bezwaar zal ik nader aanvullen. Ik verzoek u mij daarvoor een redelijke termijn te geven (art. 6:6 Awb) en mij de op de zaak betrekking hebbende stukken toe te sturen (art. 7:4 Awb). Ik wil graag gehoord worden (art. 7:2 Awb).\n\nMet vriendelijke groet,\n\n[Naam]\n[Datum]\n[Handtekening]`,
    });
  }
  if (dt === "voornemen") {
    conceptbrieven.push({
      titel: "Zienswijze",
      tekst: `[Je naam / bedrijfsnaam]\n[Adres]\n\nAan: ${inst}\n\nBetreft: zienswijze op uw voornemen van ${dat}, kenmerk ${kenm}\n\nGeachte heer, mevrouw,\n\nIn reactie op uw voornemen geef ik hierbij mijn zienswijze (art. 4:8 Awb).\n\n[Beschrijf hier rustig en feitelijk jouw situatie, wat volgens jou niet klopt of onvoldoende is meegewogen, en welke gevolgen het voornemen voor je onderneming heeft.]\n\nIk verzoek u deze zienswijze mee te wegen voordat u een besluit neemt.\n\nMet vriendelijke groet,\n\n[Naam]\n[Datum]`,
    });
  }

  return {
    kop: { afzender: ex.instantie || undefined, kenmerk: ex.kenmerk || undefined, datum: ex.datum_brief || undefined, documenttype: DOCTYPE_TEKST[dt] },
    secties,
    conceptbrieven,
    aiGebruikt: ok,
  };
}
