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
- Ontbreekt een gegeven (zoals het kenmerk of de datum van het besluit)? Zet dan een duidelijke invulplaats, bijvoorbeeld "[kenmerk van uw besluit]" of "[datum van uw besluit]", en verzin het niet. Maak van het onderwerp NOOIT zelf een kenmerk of datum.
- Voeg GEEN bewijs, documenten, metingen, aantallen of gebeurtenissen toe die de gebruiker niet zelf heeft genoemd. Dus niet "ik heb een meetrapport", geen verzonnen aantallen dagen, geen verzonnen data. Verwoord alleen wat de gebruiker aandroeg; is dat te vaag, gebruik dan een invulplaats zoals "[uw onderbouwing]".
- Reken of vul zelf geen termijnen of datums in (schrijf niet "[datum + 2 weken]"): benoem de termijn algemeen zoals in de grondslag en laat de gebruiker de datum invullen.
- Neem de door de gebruiker aangeleverde gronden/onderbouwing WOORDELIJK over (hooguit licht opgemaakt tot nette, hele zinnen). Voeg geen voorbeelden, bewijsstukken, cijfers of details toe die er niet staan. Draagt de gebruiker geen onderbouwing aan, zet dan "[uw onderbouwing]" en verzin niets.
- Dit is een brief in het bestuursrecht. Eén verzonnen feit of bewijsstuk kan zich tegen de indiener keren. Bij twijfel: minder invullen en een invulplaats laten staan.
- Gebruik formeel maar toegankelijk Nederlands. Kort, zakelijk, zonder verwijten.
- Geen dreigende, activistische of "wappie"-toon. Rustig, feitelijk, en gericht op je recht.
- Schrijf volledige, lopende zinnen. De structuurpunten hieronder zijn INSTRUCTIES voor jou; neem ze nooit letterlijk over en begin geen zin met "Dat".
- Zet bovenaan de brief de plaats en de datum (gebruik "[plaats]" als de plaats onbekend is), daaronder het bestuursorgaan als geadresseerde, en pas daarna de aanhef.
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

// ────────────────────────────────────────────────────────────────────────────
// CONTROLE-CHECK — beoordeelt een ONTVANGEN besluit/brief van de overheid.
//
// Dit is geen brief-generator maar een controle: het model beoordeelt UITSLUITEND
// de aangeleverde besluittekst. Het kijkt of elk punt er wél/niet in staat en
// verzint niets. Ontbrekende of gebrekkige punten worden mogelijke gronden voor
// bezwaar — met de woorden van de gebruiker, niet met verzonnen feiten.
// ────────────────────────────────────────────────────────────────────────────

export interface ControlePunt {
  titel: string;
  vraag: string; // Wat controleer je?
  grondslag: string; // Waarom het ertoe doet (echt Awb-artikel).
}

export const CONTROLE_PUNTEN: ControlePunt[] = [
  {
    titel: "Wie heeft het opgemaakt (naam en functie)",
    vraag: "Staat er een naam én functie van de persoon die het besluit nam of ondertekende?",
    grondslag:
      "Een besluit hoort herleidbaar te zijn tot een verantwoordelijke persoon. Een louter anoniem 'de gemeente' zonder naam of functie is een signaal om door te vragen.",
  },
  {
    titel: "Bevoegdheid en mandaat",
    vraag: "Is vermeld namens welk bevoegd bestuursorgaan is besloten en op welke grondslag/mandaat de ondertekenaar handelde?",
    grondslag:
      "Bij een gemandateerd besluit moet worden vermeld namens welk bestuursorgaan het is genomen (artikel 10:10 Awb). Ontbreekt dat, dan is de bevoegdheid niet controleerbaar.",
  },
  {
    titel: "Wettelijke grondslag",
    vraag: "Noemt het besluit de wettelijke basis (welke wet, welk artikel of welke verordening)?",
    grondslag:
      "Een belastend besluit hoort te berusten op een kenbare wettelijke grondslag. Zonder vermelde grondslag kun je niet nagaan of de bevoegdheid bestaat.",
  },
  {
    titel: "Motivering",
    vraag: "Is uitgelegd waaróm dit besluit is genomen, met concrete redenen?",
    grondslag: "Een besluit moet deugdelijk zijn gemotiveerd (artikel 3:46 Awb).",
  },
  {
    titel: "Zorgvuldige feiten",
    vraag: "Blijkt dat de gemeente de feiten heeft onderzocht en jouw kant heeft meegewogen?",
    grondslag: "Een besluit moet zorgvuldig worden voorbereid; de nodige feiten en belangen worden vergaard (artikel 3:2 Awb).",
  },
  {
    titel: "Horen / vooraankondiging",
    vraag: "Is er een waarschuwing of gelegenheid tot een zienswijze geweest vóór dit besluit?",
    grondslag: "Bij een belastend besluit hoort de belanghebbende in beginsel eerst gehoord te worden (artikel 4:8 Awb).",
  },
  {
    titel: "Evenredigheid",
    vraag: "Staat de maatregel (en de termijn/hoogte) in redelijke verhouding tot wat er speelt?",
    grondslag: "De nadelige gevolgen mogen niet onevenredig zijn in verhouding tot het doel (artikel 3:4, tweede lid, Awb).",
  },
  {
    titel: "Begunstigingstermijn (bij last onder dwangsom)",
    vraag: "Krijg je een redelijke termijn om de situatie te herstellen vóór de dwangsom gaat lopen?",
    grondslag: "Bij een last onder dwangsom hoort een begunstigingstermijn die redelijk is om aan de last te voldoen (artikel 5:32a, tweede lid, Awb).",
  },
  {
    titel: "Rechtsmiddelenclausule en termijn",
    vraag: "Staat erin hoe, bij wie en binnen welke termijn (6 weken) je bezwaar of beroep kunt maken?",
    grondslag: "Onder een besluit hoort te staan welk rechtsmiddel openstaat, bij wie en binnen welke termijn (artikel 3:45 Awb); de bezwaartermijn is 6 weken (artikel 6:7 Awb).",
  },
];

const CONTROLE_DISCLAIMER =
  "Deze controle is een hulpmiddel op basis van alleen de tekst die jij hebt " +
  "geplakt, met AI-ondersteuning. Het is geen juridisch advies en geen volledige " +
  "toets. Een 'aandachtspunt' betekent niet automatisch dat het besluit onrechtmatig " +
  "is. Controleer alles zelf in je originele besluit en laat het bij een belangrijk " +
  "belang nakijken door een jurist of het Juridisch Loket. Jij beslist wat je doet.";

export function buildControleSystemPrompt(): string {
  return `Je bent een zorgvuldige controleur voor OpenRegio. Je beoordeelt een ONTVANGEN besluit of brief van de overheid voor een burger of ondernemer. Je schrijft GEEN brief; je controleert.

ABSOLUUT BELANGRIJK:
- Beoordeel UITSLUITEND de besluittekst die de gebruiker aanlevert. Verzin niets: geen feiten, geen namen, geen data, geen artikelen, geen citaten die er niet staan.
- Per controlepunt bepaal je of het in de aangeleverde tekst staat. Antwoord met één status: [IN ORDE], [ONTBREEKT] of [ONDUIDELIJK].
- Staat iets niet in de tekst, kies dan [ONTBREEKT] of [ONDUIDELIJK] — vul het NOOIT zelf in.
- Als je iets aanhaalt uit de tekst, gebruik dan een kort, letterlijk citaat tussen aanhalingstekens. Kun je niet letterlijk citeren, citeer dan niet.
- De artikelnummers die hieronder bij elk punt als "grondslag" staan, zijn ALLEEN voor jouw uitleg waaróm het punt telt. Presenteer ze NOOIT alsof ze in het besluit staan. Voor "Wettelijke grondslag" geldt: alleen [IN ORDE] als er in de besluittekst zélf letterlijk een wet, artikel of verordening wordt genoemd — citeer dat dan. Staat er geen enkele verwijzing in de tekst, dan is het [ONTBREEKT].
- Dit is bestuursrecht. Eén verzonnen constatering kan iemand schaden. Bij twijfel: [ONDUIDELIJK] en de gebruiker laten nakijken.
- Rustige, feitelijke toon. Geen dreiging, geen activisme.

Controleer deze punten, in deze volgorde:
${CONTROLE_PUNTEN.map((p, i) => `${i + 1}. ${p.titel} — ${p.vraag} (grondslag: ${p.grondslag})`).join("\n")}

Lever je antwoord in exact deze drie blokken:
=== CONTROLE ===
Per punt één regel: [STATUS] Titel — korte toelichting op basis van de tekst (met kort citaat als dat kan).
=== AANDACHTSPUNTEN ===
Alleen de punten met [ONTBREEKT] of [ONDUIDELIJK], als korte, feitelijke vraag/grond die de gebruiker kan gebruiken voor bezwaar. Formuleer als "Aandachtspunt: ..." Verzin geen onderbouwing; als de gebruiker iets moet aanvullen, schrijf "[uw onderbouwing]".
=== LET OP ===
${CONTROLE_DISCLAIMER}`;
}

export function buildControleUserPrompt(input: { besluitTekst: string; context?: string }): string {
  return [
    input.context ? `Situatie van de gebruiker: ${input.context}` : ``,
    ``,
    `Hieronder staat de ontvangen besluittekst. Controleer alleen deze tekst:`,
    `--- BEGIN BESLUITTEKST ---`,
    input.besluitTekst,
    `--- EINDE BESLUITTEKST ---`,
  ]
    .filter(Boolean)
    .join("\n");
}
