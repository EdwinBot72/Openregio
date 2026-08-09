// ────────────────────────────────────────────────────────────────────────────
// OpenRegio — Briefsoorten voor de brieven-motor.
//
// Elke briefsoort levert: een vaste structuur, de échte juridische grondslag
// (standaard-artikelen uit de Awb/Woo die stabiel en verifieerbaar zijn), een
// controleslag voor de gebruiker en een jurist-check-disclaimer.
//
// Uitgangspunt: het AI-model mág GEEN wetsartikelen, kenmerken, data of feiten
// verzinnen. Het gebruikt uitsluitend de grondslag die hier per briefsoort staat
// en de gegevens die de gebruiker invult. OpenRegio schrijft mee; de mens beslist.
// ────────────────────────────────────────────────────────────────────────────

export type Brieftype = "woo_verzoek" | "bezwaar" | "zienswijze" | "regels_vraag";

export interface BriefSpec {
  type: Brieftype;
  label: string;
  // Korte uitleg voor de gebruiker: wanneer gebruik je deze brief?
  wanneer: string;
  // Echte juridische grondslag die in de prompt gaat (stabiele standaard-artikelen).
  grondslag: string;
  // De vaste opbouw van de brief (secties in volgorde).
  structuur: string[];
  // Controleslag: wat de gebruiker zelf moet nakijken vóór verzending.
  controleslag: string[];
  // Verplichte invoervelden (naast optionele context).
  verplichteVelden: string[];
}

const JURIST_DISCLAIMER =
  "Deze brief is een concept, opgesteld met AI-ondersteuning. Het is geen " +
  "juridisch advies. Controleer de gegevens, de exacte termijn en het kenmerk " +
  "in je eigen besluit. Bij een belangrijk of spoedeisend belang: laat de brief " +
  "nakijken door een jurist of het Juridisch Loket. Jij beslist wat je verstuurt.";

const MENS_BESLIST =
  "OpenRegio schrijft mee, jij beslist. Pas de tekst aan waar die niet klopt met " +
  "jouw situatie voordat je verstuurt.";

export const BRIEFTYPES: Record<Brieftype, BriefSpec> = {
  woo_verzoek: {
    type: "woo_verzoek",
    label: "WOO-verzoek (informatie opvragen)",
    wanneer:
      "Je wilt documenten of informatie opvragen bij een bestuursorgaan (gemeente, " +
      "provincie, waterschap, ministerie).",
    grondslag:
      "Wet open overheid (Woo). Verzoek om publieke informatie: artikel 4.1 Woo. " +
      "Het bestuursorgaan beslist in beginsel binnen 4 weken (artikel 4.4, eerste lid, " +
      "Woo), met een mogelijke verdaging van 2 weken. Wees concreet over welke " +
      "documenten of welk onderwerp het betreft; een Woo-verzoek hoeft niet te worden " +
      "gemotiveerd.",
    structuur: [
      "Aanhef: 'Geachte heer/mevrouw,'",
      "Inleiding: dat je op grond van de Wet open overheid (artikel 4.1 Woo) om informatie verzoekt",
      "Onderwerp en periode: waar de informatie over gaat en welke periode",
      "Concrete lijst van gevraagde documenten/informatie",
      "Verzoek om digitale aanlevering en, indien van toepassing, om een kostenoverzicht vooraf",
      "Verwijzing naar de beslistermijn van 4 weken (artikel 4.4, eerste lid, Woo)",
      "Afsluiting met naam, adres en datum",
    ],
    controleslag: [
      "Klopt de naam van het bestuursorgaan en het adres?",
      "Zijn de gevraagde documenten concreet genoeg omschreven?",
      "Heb je een periode of kenmerk toegevoegd waar dat helpt?",
      "Bewaar een kopie en noteer de verzenddatum (de termijn van 4 weken loopt daarvandaan).",
    ],
    verplichteVelden: ["bestuursorgaan", "onderwerp"],
  },

  bezwaar: {
    type: "bezwaar",
    label: "Bezwaarschrift (reageren op een besluit)",
    wanneer:
      "Je hebt een besluit ontvangen waar je het niet mee eens bent: een geweigerde of " +
      "verleende vergunning, een handhavingsbesluit of een last onder dwangsom.",
    grondslag:
      "Algemene wet bestuursrecht (Awb). Tegen een besluit (artikel 1:3 Awb) kun je " +
      "bezwaar maken bij het bestuursorgaan dat het besluit nam (artikel 7:1 Awb). " +
      "De termijn is 6 weken (artikel 6:7 Awb) en begint op de dag ná bekendmaking van " +
      "het besluit (artikel 6:8 Awb). Een bezwaarschrift moet ten minste bevatten: naam " +
      "en adres van de indiener, de dagtekening, een omschrijving van het besluit " +
      "(datum en kenmerk) en de gronden van het bezwaar (artikel 6:5 Awb). Kom je nog " +
      "niet aan de gronden toe, dan mag je 'pro forma' bezwaar maken en de motivering " +
      "later aanvullen; het bestuursorgaan geeft daarvoor een hersteltermijn " +
      "(artikel 6:6 Awb). Bezwaar schorst de werking van het besluit niet (artikel 6:16 " +
      "Awb); bij spoed kun je de voorzieningenrechter om een voorlopige voorziening " +
      "vragen (artikel 8:81 Awb).",
    structuur: [
      "Aanhef: 'Geachte heer/mevrouw,'",
      "Inleiding: dat je bezwaar maakt op grond van artikel 7:1 Awb tegen het genoemde besluit",
      "Aanduiding van het besluit: datum en kenmerk (of: 'kenmerk nog aanvullen')",
      "De gronden: puntsgewijs waarom je het er niet mee eens bent (feitelijk, zakelijk)",
      "Indien de gronden nog ontbreken: expliciet vermelden dat dit een pro-formabezwaar is en dat je om een termijn voor aanvulling verzoekt (artikel 6:6 Awb)",
      "Verzoek: wat je van het bestuursorgaan vraagt (het besluit herzien/intrekken)",
      "Indien spoed: vermelden dat je een voorlopige voorziening overweegt (artikel 8:81 Awb)",
      "Afsluiting met naam, adres, dagtekening en handtekening (artikel 6:5 Awb)",
    ],
    controleslag: [
      "Staat de exacte datum en het kenmerk van je besluit in de brief?",
      "Ben je binnen 6 weken na de bekendmaking (artikel 6:7 Awb)? Controleer de datum op je besluit.",
      "Staan naam, adres, dagtekening en handtekening erin (artikel 6:5 Awb)?",
      "Zijn je gronden feitelijk en zakelijk opgeschreven, zonder verwijten?",
      "Heeft het besluit gevolgen die niet kunnen wachten? Overweeg dan een voorlopige voorziening (artikel 8:81 Awb).",
      "Verstuur aangetekend of bewaar een verzendbewijs.",
    ],
    verplichteVelden: ["bestuursorgaan", "onderwerp"],
  },

  zienswijze: {
    type: "zienswijze",
    label: "Zienswijze (reageren op een voorgenomen besluit)",
    wanneer:
      "Er ligt een ontwerpbesluit of een voornemen (bijvoorbeeld een aangekondigde " +
      "handhaving of een ontwerp-vergunning) en je wilt reageren vóórdat het definitief wordt.",
    grondslag:
      "Algemene wet bestuursrecht (Awb). Voordat een bestuursorgaan een voor jou " +
      "nadelig besluit neemt waar je het niet mee eens zult zijn, kun je je zienswijze " +
      "geven (artikel 4:8 Awb). Bij de uniforme openbare voorbereidingsprocedure ligt " +
      "een ontwerpbesluit ter inzage en kun je binnen 6 weken een zienswijze indienen " +
      "(afdeling 3.4 Awb, artikelen 3:15 en 3:16 Awb). Een zienswijze is vormvrij, maar " +
      "wordt sterker als je concreet en onderbouwd bent.",
    structuur: [
      "Aanhef: 'Geachte heer/mevrouw,'",
      "Inleiding: dat je een zienswijze indient op het genoemde ontwerpbesluit/voornemen (artikel 4:8 of afdeling 3.4 Awb)",
      "Aanduiding van het ontwerpbesluit/voornemen: datum, kenmerk of dossiernummer",
      "Je zienswijze: puntsgewijs wat er volgens jou niet klopt of ontbreekt, met onderbouwing",
      "Verzoek: wat je het bestuursorgaan vraagt te heroverwegen of aan te passen",
      "Afsluiting met naam, adres en dagtekening",
    ],
    controleslag: [
      "Ben je binnen de inzagetermijn (vaak 6 weken, artikel 3:16 Awb)? Controleer de kennisgeving.",
      "Staat het kenmerk/dossiernummer van het ontwerpbesluit erin?",
      "Zijn je punten concreet en onderbouwd?",
      "Bewaar een kopie en een verzendbewijs.",
    ],
    verplichteVelden: ["bestuursorgaan", "onderwerp"],
  },

  regels_vraag: {
    type: "regels_vraag",
    label: "Vraag over gemeentelijke regels",
    wanneer:
      "Je wilt weten welke regels gelden, hoe een regel wordt toegepast, of op welke " +
      "grondslag de gemeente iets van je vraagt — zonder dat er (nog) een besluit ligt.",
    grondslag:
      "Dit is een informatie- en verduidelijkingsverzoek, geen formele procedure. Vraag " +
      "de gemeente naar de van toepassing zijnde regeling (bijvoorbeeld een verordening, " +
      "de APV of een beleidsregel) en naar de concrete grondslag. Gaat het om het " +
      "opvragen van onderliggende documenten, dan kan dat via de Wet open overheid " +
      "(artikel 4.1 Woo). Verzin geen regelingsnamen of artikelnummers; vraag de gemeente " +
      "die expliciet te benoemen.",
    structuur: [
      "Aanhef: 'Geachte heer/mevrouw,'",
      "Inleiding: je situatie in één of twee zinnen",
      "Je concrete vragen: puntsgewijs (welke regel geldt, welke grondslag, hoe wordt die toegepast)",
      "Verzoek om de naam van de regeling en het artikel te benoemen, en om onderliggende stukken (eventueel via artikel 4.1 Woo)",
      "Verzoek om een reactietermijn",
      "Afsluiting met naam, adres en datum",
    ],
    controleslag: [
      "Zijn je vragen concreet en per punt te beantwoorden?",
      "Heb je gevraagd naar de exacte regeling én het artikel (zodat je het zelf kunt nalezen)?",
      "Wil je ook documenten? Verwijs dan naar artikel 4.1 Woo.",
      "Bewaar een kopie en noteer de verzenddatum.",
    ],
    verplichteVelden: ["bestuursorgaan", "onderwerp"],
  },
};

export function isBrieftype(x: unknown): x is Brieftype {
  return typeof x === "string" && x in BRIEFTYPES;
}

// Bouwt de system-prompt met harde regels tegen verzonnen recht.
export function buildSystemPrompt(spec: BriefSpec): string {
  return `Je bent een zorgvuldige Nederlandse briefschrijver voor OpenRegio. Je helpt burgers en ondernemers een correcte, respectvolle brief aan de overheid op te stellen.

Je schrijft nu een: ${spec.label}.
Wanneer gebruik je deze brief: ${spec.wanneer}

JURIDISCHE GRONDSLAG (gebruik uitsluitend dit; verzin niets):
${spec.grondslag}

HARDE REGELS:
- Verzin NOOIT wetsartikelen, kenmerken, data, bedragen of feiten. Gebruik alleen de grondslag hierboven en de gegevens die de gebruiker aanlevert.
- Ontbreekt een gegeven (zoals het kenmerk of de datum van het besluit)? Zet dan een duidelijke invulplaats, bijvoorbeeld "[kenmerk van uw besluit]", en verzin het niet.
- Gebruik formeel maar toegankelijk Nederlands. Kort, zakelijk, zonder verwijten.
- Geen dreigende, activistische of "wappie"-toon. Rustig, feitelijk, en gericht op je recht.
- Volg exact deze structuur, in deze volgorde:
${spec.structuur.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}

Lever je antwoord in exact drie duidelijk gescheiden blokken, met deze koppen:
=== BRIEF ===
<de volledige brief, klaar om te kopiëren>
=== CONTROLESLAG ===
${spec.controleslag.map((c) => `- ${c}`).join("\n")}
=== LET OP ===
${JURIST_DISCLAIMER}
${MENS_BESLIST}

Neem de CONTROLESLAG en LET OP letterlijk over zoals hierboven gegeven.`;
}

export function buildUserPrompt(
  spec: BriefSpec,
  input: { bestuursorgaan: string; onderwerp: string; context?: string; gevraagd?: string; datum: string },
): string {
  return [
    `Stel de brief op met deze gegevens:`,
    ``,
    `Bestuursorgaan: ${input.bestuursorgaan}`,
    `Onderwerp: ${input.onderwerp}`,
    input.context ? `Achtergrond/situatie: ${input.context}` : ``,
    input.gevraagd ? `Specifiek gevraagd/gronden: ${input.gevraagd}` : ``,
    `Datum van vandaag: ${input.datum}`,
    ``,
    `Schrijf nu de ${spec.label}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
