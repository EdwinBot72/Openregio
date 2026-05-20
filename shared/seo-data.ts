export type Beroep =
  | "bakker" | "fietsenmaker" | "loodgieter" | "kapper"
  | "restaurant" | "elektricien" | "fysiotherapeut" | "schilder";

export interface BeroepData {
  label: string;
  primaireTermen: string[];
  longTail: string[];
  zoekvragen: string[];
  wijkTip: string;
  spoedScore: number;
}

export const BEROEP_DATA: Record<Beroep, BeroepData> = {
  bakker: {
    label: "Bakker",
    primaireTermen: [
      "{beroep} {stad}",
      "brood kopen {stad}",
      "bakkerij {stad} centrum",
      "ambachtelijke {beroep} {stad}",
    ],
    longTail: [
      "vers brood zaterdag {stad}",
      "glutenvrij brood {stad}",
      "biologische {beroep} {stad} oost",
      "croissants {stad} centrum",
      "zuurdesem brood {stad}",
    ],
    zoekvragen: [
      "hoe laat is de bakker open in {stad}?",
      "waar koop ik zuurdesem in {stad}?",
      "bakker bezorging aan huis {stad}",
    ],
    wijkTip:
      "Maak een pagina per buurt die je bezorgt. Noem wijknames in productteksten: 'geliefd in Lombok, Zuilen en Overvecht'.",
    spoedScore: 1,
  },
  fietsenmaker: {
    label: "Fietsenmaker",
    primaireTermen: [
      "{beroep} {stad}",
      "fiets reparatie {stad}",
      "fiets band plakken {stad}",
      "{beroep} {stad} noord",
    ],
    longTail: [
      "fiets reparatie {stad} aan huis",
      "elektrische fiets reparatie {stad}",
      "{beroep} open zondag {stad}",
      "goedkope fiets revisie {stad} oost",
      "fiets ophaalservice {stad}",
    ],
    zoekvragen: [
      "{beroep} in de buurt {stad}?",
      "fiets ophaalservice {stad}?",
      "hoeveel kost een fiets revisie {stad}?",
    ],
    wijkTip:
      "Maak een pagina per stadsdeel: /fietsenmaker-{stad}-noord, /fietsenmaker-{stad}-west. Vermeld metrostations en tramhaltes bij jou in de buurt.",
    spoedScore: 2,
  },
  loodgieter: {
    label: "Loodgieter",
    primaireTermen: [
      "{beroep} {stad}",
      "{beroep} spoed {stad}",
      "CV ketel storing {stad}",
      "lekkage reparatie {stad}",
    ],
    longTail: [
      "{beroep} 24 uur {stad}",
      "{beroep} Scheveningen",
      "verstopt toilet {stad} centrum",
      "waterleiding repareren {stad} laak",
      "erkende installateur {stad}",
    ],
    zoekvragen: [
      "{beroep} met spoed nodig {stad}?",
      "wat kost een {beroep} in {stad}?",
      "erkend installateur {stad} wateringse veld?",
    ],
    wijkTip:
      "Spoedtermen scoren het hoogst. Zet 'spoed' en '24 uur' prominent op je homepage. Maak een aparte spoedpagina met je telefoonnummer bovenaan.",
    spoedScore: 5,
  },
  kapper: {
    label: "Kapper",
    primaireTermen: [
      "{beroep} {stad}",
      "{beroep} {stad} centrum",
      "heren {beroep} {stad}",
      "dames {beroep} {stad}",
    ],
    longTail: [
      "{beroep} {stad} kralingen afspraak",
      "goedkope {beroep} {stad} zuid",
      "{beroep} open zondag {stad}",
      "balayage {stad} {beroep}",
      "{beroep} kind {stad} noord",
    ],
    zoekvragen: [
      "{beroep} zonder afspraak {stad}?",
      "beste {beroep} {stad} voor krullen?",
      "{beroep} {stad} avond openingstijden?",
    ],
    wijkTip:
      "Online boeken verlaagt de drempel. Vermeld technieken (balayage, krullencoupe, kinderknippen) als aparte diensten — mensen zoeken hierop.",
    spoedScore: 1,
  },
  restaurant: {
    label: "Restaurant",
    primaireTermen: [
      "restaurant {stad}",
      "eten {stad} centrum",
      "restaurant {stad} reserveren",
      "diner {stad}",
    ],
    longTail: [
      "romantisch restaurant {stad}",
      "restaurant {stad} verjaardag",
      "restaurant {stad} vegetarisch",
      "lunch {stad} centrum",
      "terras {stad} zomer",
    ],
    zoekvragen: [
      "goed restaurant {stad} voor vanavond?",
      "restaurant {stad} open zondag?",
      "restaurant {stad} kinderen welkom?",
    ],
    wijkTip:
      "Vermeld aanloopstraten en bezienswaardigheden dichtbij: 'op 2 minuten van het station' of 'naast het stadspark'. Dit helpt bij navigatiezoekopdrachten.",
    spoedScore: 1,
  },
  elektricien: {
    label: "Elektricien",
    primaireTermen: [
      "{beroep} {stad}",
      "electricien {stad}",
      "elektra storing {stad}",
      "{beroep} {stad} erkend",
    ],
    longTail: [
      "{beroep} spoed {stad}",
      "groepenkast vervangen {stad}",
      "stopcontact plaatsen {stad}",
      "{beroep} zonnepanelen {stad}",
      "meterkast uitbreiden {stad}",
    ],
    zoekvragen: [
      "elektra storing {stad} wie bellen?",
      "erkend {beroep} {stad}?",
      "{beroep} {stad} particulier?",
    ],
    wijkTip:
      "Vermeld je VCA/ISSO-certificaten en erkend installateur status op elke pagina — dit verhoogt vertrouwen én SEO-relevantie voor professionele zoekopdrachten.",
    spoedScore: 4,
  },
  fysiotherapeut: {
    label: "Fysiotherapeut",
    primaireTermen: [
      "{beroep} {stad}",
      "fysio {stad}",
      "{beroep} {stad} centrum",
      "fysiotherapie {stad}",
    ],
    longTail: [
      "{beroep} {stad} rugklachten",
      "sportfysio {stad}",
      "{beroep} {stad} direct toegankelijk",
      "kinderfysio {stad}",
      "{beroep} {stad} avond weekend",
    ],
    zoekvragen: [
      "{beroep} zonder verwijzing {stad}?",
      "beste {beroep} {stad} voor rug?",
      "{beroep} {stad} zorgverzekering?",
    ],
    wijkTip:
      "Maak specialisatiepagina's: rugklachten, sportblessures, zwangerschapsklachten. Lokale zoekopdrachten zijn vaak specifiek op klacht — niet alleen op beroep.",
    spoedScore: 2,
  },
  schilder: {
    label: "Schilder",
    primaireTermen: [
      "{beroep} {stad}",
      "schildersbedrijf {stad}",
      "{beroep} {stad} binnen",
      "{beroep} {stad} buiten",
    ],
    longTail: [
      "{beroep} {stad} appartement",
      "schilderwerk offerte {stad}",
      "{beroep} {stad} kozijnen",
      "binnenschilder {stad} betrouwbaar",
      "{beroep} {stad} snel",
    ],
    zoekvragen: [
      "goede {beroep} {stad}?",
      "wat kost een {beroep} in {stad}?",
      "{beroep} {stad} referenties?",
    ],
    wijkTip:
      "Fotogalerij per project met buurtvermelding werkt goed: 'Project Jordaan — voordeur en kozijnen'. Dit genereert organisch lokale zoekwoordcombinaties.",
    spoedScore: 1,
  },
};

export const CHECKLIST_ITEMS = [
  {
    id: "titel",
    titel: "Paginatitel met stad + beroep",
    uitleg: 'bijv. "Fietsenmaker Amsterdam | Bike Repair Noord"',
    prioriteit: "hoog" as const,
  },
  {
    id: "meta",
    titel: "Meta description met locatie",
    uitleg: 'bijv. "Uw fietsenmaker in Amsterdam Noord. Bandenpech, remmen, revisies — snelle service."',
    prioriteit: "hoog" as const,
  },
  {
    id: "h1",
    titel: "H1 bevat beroep + plaatsnaam",
    uitleg: 'bijv. "Bakkerij in Haarlem — ambachtelijk brood sinds 1987"',
    prioriteit: "hoog" as const,
  },
  {
    id: "adres",
    titel: "Adres en wijk op elke pagina",
    uitleg: "Zet straat, stad en wijk in de footer — Google koppelt dit aan lokale zoekopdrachten",
    prioriteit: "hoog" as const,
  },
  {
    id: "landingspagina",
    titel: "Regio-specifieke landingspagina",
    uitleg: "bijv. /loodgieter-tilburg of /kapper-amsterdam-oost — één pagina per kern/wijk",
    prioriteit: "midden" as const,
  },
  {
    id: "wijkwoorden",
    titel: "Wijk- en buurtwoorden in je tekst",
    uitleg: 'Noem buurten die je bedient: "ook in de Jordaan, Oud-West en De Pijp"',
    prioriteit: "midden" as const,
  },
  {
    id: "schema",
    titel: "Schema markup: LocalBusiness",
    uitleg: "Voeg JSON-LD toe met naam, adres, openingstijden en geo-coördinaten",
    prioriteit: "midden" as const,
  },
  {
    id: "reviews",
    titel: "Klantreviews met plaatsnaam",
    uitleg: "Vraag klanten hun wijk te vermelden — versterkt lokale relevantie in Google",
    prioriteit: "midden" as const,
  },
  {
    id: "faq",
    titel: "FAQ-sectie met lokale vragen",
    uitleg: 'bijv. "Bezorgt u ook in Haarlem Schalkwijk?" of "Kom je ook naar IJburg?"',
    prioriteit: "laag" as const,
  },
  {
    id: "tel",
    titel: "Telefoon als klikbare link (mobiel)",
    uitleg: "tel:-link zodat Google zeker weet dat je een lokaal bedrijf bent met direct contact",
    prioriteit: "laag" as const,
  },
];
