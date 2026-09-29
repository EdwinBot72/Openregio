// ─────────────────────────────────────────────────────────────
// Woo-verzoeken die OpenRegio namens een ondernemer indient.
//
// Vaste teksten (geen AI): het verzoek zelf, de machtiging en de
// ingebrekestelling bij te laat beslissen. Twee soorten:
//  • brief — de stukken achter een brief die de ondernemer kreeg
//  • regel — de achtergrond van een nieuwe of gewijzigde regel/verordening
// OpenRegio treedt op als gemachtigde (art. 2:1 Awb); de ondernemer is verzoeker.
// ─────────────────────────────────────────────────────────────

export type WooBron = "brief" | "regel";

export interface WooInvoer {
  bron: WooBron;
  orgaan: string;
  onderwerp: string;
  kenmerk?: string;
  datumBrief?: string;
  regelNaam?: string;
  regelLink?: string;
  periode?: string;
  extra?: string;
  ondernemer: { naam: string; bedrijf?: string; adres: string; postcodePlaats: string };
}

const OPENREGIO = {
  naam: "Stroombox, handelend onder de naam OpenRegio",
  adres: "Van Meeuwenstraat 19",
  postcodePlaats: "2064 LD Spaarndam",
  email: process.env.WOO_INBOX || "info@openregio.nl",
};

const datumNL = (d: Date) => d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

/** De verzoeker: het bedrijf (met contactpersoon) als dat is ingevuld, anders de persoon. */
function wieVerzoekt(o: WooInvoer["ondernemer"]): string {
  return o.bedrijf
    ? `${o.bedrijf}, ${o.adres}, ${o.postcodePlaats} (contactpersoon: ${o.naam})`
    : `${o.naam}, ${o.adres}, ${o.postcodePlaats}`;
}
const verzoekerNaam = (o: WooInvoer["ondernemer"]) => o.bedrijf || o.naam;

function documenten(v: WooInvoer): string[] {
  const periode = v.periode?.trim() ? ` over de periode ${v.periode.trim()}` : "";
  const lijst = v.bron === "brief"
    ? [
        "het volledige dossier dat ten grondslag ligt aan de genoemde brief, waaronder rapporten van bevindingen, controleverslagen, foto's, metingen en aantekeningen;",
        "het besluit of de besluiten waarop de brief berust, met de bijbehorende besluitvormingsstukken;",
        "het mandaat-, volmacht- of machtigingsbesluit op grond waarvan de brief is opgesteld en ondertekend;",
        `interne notities, e-mails en andere correspondentie over deze zaak, binnen uw organisatie en met derden${periode};`,
        "adviezen, juridisch of anderszins, die over deze zaak zijn uitgebracht.",
      ]
    : [
        `het voorstel en het besluit tot vaststelling of wijziging van ${v.regelNaam || v.onderwerp}, met alle bijlagen;`,
        "de adviezen die bij de voorbereiding zijn uitgebracht, waaronder juridische adviezen;",
        "onderzoeken en effectrapportages, waaronder stukken over de gevolgen voor ondernemers (zoals een MKB-toets);",
        "de inspraak- en zienswijzereacties en de reactienota daarop;",
        `correspondentie met ondernemers, ondernemersverenigingen, belangenorganisaties en andere overheden over deze regel${periode};`,
        "evaluaties van de voorgaande regeling, voor zover aanwezig.",
      ];
  if (v.extra?.trim()) lijst.push(`${v.extra.trim().replace(/[.;]*$/, "")}.`);
  return lijst;
}

/** Tekst van de machtiging die de ondernemer in de app aanvaardt. */
export function machtigingTekst(v: WooInvoer): string {
  return `${wieVerzoekt(v.ondernemer)} machtigt ${OPENREGIO.naam} (KvK 55672671) om namens ${verzoekerNaam(v.ondernemer)} een verzoek op grond van de Wet open overheid in te dienen bij ${v.orgaan} over "${v.onderwerp}", en de correspondentie over dit verzoek te voeren, waaronder het ontvangen van documenten en het versturen van een ingebrekestelling bij te laat beslissen. Deze machtiging geldt alleen voor dit verzoek en kan altijd worden ingetrokken.`;
}

/** Het Woo-verzoek zoals OpenRegio het verstuurt. */
export function wooVerzoekTekst(v: WooInvoer, machtiging: { tekst: string; op: Date }, verzendDatum = new Date()): string {
  const onderwerpRegel = v.bron === "brief"
    ? `uw brief${v.datumBrief ? ` van ${v.datumBrief}` : ""}${v.kenmerk ? ` met kenmerk ${v.kenmerk}` : ""} (${v.onderwerp})`
    : `${v.regelNaam || v.onderwerp}${v.regelLink ? ` (${v.regelLink})` : ""}`;
  const regels = [
    OPENREGIO.naam,
    OPENREGIO.adres,
    OPENREGIO.postcodePlaats,
    OPENREGIO.email,
    "",
    `Aan: ${v.orgaan}`,
    "",
    `Spaarndam, ${datumNL(verzendDatum)}`,
    "",
    `Betreft: verzoek op grond van de Wet open overheid — ${v.onderwerp}${v.kenmerk ? ` (uw kenmerk ${v.kenmerk})` : ""}`,
    "",
    "Geachte heer, mevrouw,",
    "",
    `Namens ${wieVerzoekt(v.ondernemer)}, verzoek ik u op grond van de Wet open overheid (Woo) om openbaarmaking van documenten over ${onderwerpRegel}. OpenRegio treedt hierbij op als gemachtigde; de machtiging is onderaan deze brief opgenomen.`,
    "",
    "Het verzoek betreft:",
    "",
    ...documenten(v).map((d, i) => `${i + 1}. ${d}`),
    "",
  ];
  if (v.bron === "brief") {
    regels.push(`Voor zover deze documenten persoonsgegevens van ${verzoekerNaam(v.ondernemer)} bevatten, verzoek ik tevens om inzage in die gegevens op grond van artikel 15 van de Algemene verordening gegevensbescherming.`, "");
  }
  regels.push(
    "Ik verzoek u:",
    "- de documenten digitaal te verstrekken;",
    "- bij gehele of gedeeltelijke weigering per document de weigeringsgrond te vermelden en een inventarislijst mee te sturen;",
    "- de ontvangst van dit verzoek te bevestigen.",
    "",
    "U beslist binnen vier weken na ontvangst van dit verzoek; deze termijn kan met ten hoogste twee weken worden verdaagd.",
    "",
  );
  if (v.bron === "brief") {
    regels.push("Dit verzoek houdt geen erkenning in van enige verplichting, schuld of aansprakelijkheid, en geen instemming met de inhoud van de genoemde brief. Alle rechten blijven voorbehouden.", "");
  }
  regels.push(
    `Correspondentie over dit verzoek kunt u richten aan OpenRegio via ${OPENREGIO.email}.`,
    "",
    "Met vriendelijke groet,",
    "",
    `OpenRegio, gemachtigde van ${verzoekerNaam(v.ondernemer)}`,
    "",
    "—",
    `Machtiging (gegeven via openregio.nl op ${datumNL(machtiging.op)}):`,
    machtiging.tekst,
  );
  return regels.join("\n");
}

/** Ingebrekestelling bij te laat beslissen op een Woo-verzoek (geen dwangsom bij de Woo). */
export function wooIngebrekeTekst(opts: { orgaan: string; onderwerp: string; ondernemerNaam: string; ingediendOp: Date; deadline: Date }, vandaag = new Date()): string {
  return [
    OPENREGIO.naam,
    OPENREGIO.adres,
    OPENREGIO.postcodePlaats,
    OPENREGIO.email,
    "",
    `Aan: ${opts.orgaan}`,
    "",
    `Spaarndam, ${datumNL(vandaag)}`,
    "",
    `Betreft: ingebrekestelling — verzoek op grond van de Wet open overheid over ${opts.onderwerp}`,
    "",
    "Geachte heer, mevrouw,",
    "",
    `Op ${datumNL(opts.ingediendOp)} heeft OpenRegio namens ${opts.ondernemerNaam} bij u een verzoek op grond van de Wet open overheid ingediend over ${opts.onderwerp}. U had daarop uiterlijk op ${datumNL(opts.deadline)} moeten beslissen. Tot op heden hebben wij geen besluit ontvangen.`,
    "",
    "Hierbij stel ik u in gebreke. Ik verzoek u alsnog binnen twee weken na dagtekening van deze brief op het verzoek te beslissen.",
    "",
    "Blijft een besluit binnen die termijn uit, dan kan beroep worden ingesteld bij de rechtbank wegens niet tijdig beslissen.",
    "",
    "Met vriendelijke groet,",
    "",
    `OpenRegio, gemachtigde van ${opts.ondernemerNaam}`,
  ].join("\n");
}

/** Uiterste beslisdatum: vier weken na verzending (verdaging van twee weken niet meegerekend). */
export function wooDeadline(verzonden: Date): Date {
  return new Date(verzonden.getTime() + 28 * 86400000);
}
