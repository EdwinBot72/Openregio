export type Beroep =
  | "bakker" | "fietsenmaker" | "loodgieter" | "kapper"
  | "restaurant" | "elektricien" | "fysiotherapeut" | "schilder"
  | "timmerman" | "aannemer" | "dakdekker" | "stukadoor"
  | "tegelzetter" | "autogarage" | "autorijschool" | "schoonheidsspecialiste"
  | "nagelstudio" | "masseur" | "tandarts" | "dierenarts"
  | "opticiën" | "bloemist" | "slager" | "hoveniersbedrijf"
  | "schoonmaakbedrijf" | "accountant" | "makelaar" | "ijssalon"
  | "catering" | "advocaat";

export type BeroepCategorie =
  | "bouw" | "technisch" | "zorg" | "verzorging"
  | "horeca" | "voedsel" | "mobiliteit" | "zakelijk"
  | "tuin" | "schoonmaak";

export interface BeroepData {
  label: string;
  categorie: BeroepCategorie;
  primaireTermen: string[];
  longTail: string[];
  zoekvragen: string[];
  wijkTip: string;
  spoedScore: number;
}

export const BEROEP_DATA: Record<Beroep, BeroepData> = {
  // ── BOUW ───────────────────────────────────────────────────────
  schilder: {
    label: "Schilder",
    categorie: "bouw",
    primaireTermen: ["{beroep} {stad}", "schildersbedrijf {stad}", "{beroep} {stad} binnen", "{beroep} {stad} buiten"],
    longTail: ["{beroep} {stad} appartement", "schilderwerk offerte {stad}", "{beroep} {stad} kozijnen", "binnenschilder {stad} betrouwbaar", "{beroep} {stad} snel"],
    zoekvragen: ["goede {beroep} {stad}?", "wat kost een {beroep} in {stad}?", "{beroep} {stad} referenties?"],
    wijkTip: "Fotogalerij per project met buurtvermelding werkt goed: 'Project Jordaan — voordeur en kozijnen'.",
    spoedScore: 1,
  },
  timmerman: {
    label: "Timmerman",
    categorie: "bouw",
    primaireTermen: ["{beroep} {stad}", "timmerbedrijf {stad}", "kozijnen plaatsen {stad}", "vloer leggen {stad}"],
    longTail: ["{beroep} {stad} dakkapel", "maatwerk meubels {stad}", "{beroep} {stad} keuken plaatsen", "trap renoveren {stad}", "{beroep} {stad} erkend"],
    zoekvragen: ["goede {beroep} {stad}?", "wat kost een {beroep} in {stad}?", "{beroep} kozijnen {stad} offerteaanvraag?"],
    wijkTip: "Maatwerk en renovatie scoren goed als je wijk- en buurtprojecten vermeldt: 'actief in de Rivierenbuurt en Oud-Zuid'.",
    spoedScore: 2,
  },
  aannemer: {
    label: "Aannemer",
    categorie: "bouw",
    primaireTermen: ["aannemer {stad}", "aannemersbedrijf {stad}", "verbouwing {stad}", "renovatie {stad}"],
    longTail: ["aannemer {stad} uitbouw", "verbouwen badkamer {stad}", "aannemer erkend {stad} kozijnen", "aannemer {stad} snel offerte", "renovatie woning {stad} midden"],
    zoekvragen: ["betrouwbare aannemer {stad}?", "wat kost een verbouwing {stad}?", "aannemer {stad} vergunning aanvraag?"],
    wijkTip: "Vergunningsplichtige verbouwingen zijn urgent — maak een aparte pagina '/uitbouw-{stad}' om direct gevonden te worden.",
    spoedScore: 2,
  },
  dakdekker: {
    label: "Dakdekker",
    categorie: "bouw",
    primaireTermen: ["{beroep} {stad}", "dak repareren {stad}", "daklekkage {stad}", "dakdekkersbedrijf {stad}"],
    longTail: ["{beroep} spoed {stad}", "plat dak repareren {stad}", "dakpannen vervangen {stad}", "zinkwerk {stad}", "{beroep} {stad} erkend VCA"],
    zoekvragen: ["{beroep} spoed {stad}?", "wat kost een nieuw dak in {stad}?", "{beroep} lekkage reparatie {stad} snel?"],
    wijkTip: "Spoedterm 'lekkage' trekt veel urgente zoekopdrachten. Maak een aparte pagina '/daklekkage-spoed-{stad}' met telefoonnummer bovenaan.",
    spoedScore: 4,
  },
  stukadoor: {
    label: "Stukadoor",
    categorie: "bouw",
    primaireTermen: ["{beroep} {stad}", "stucwerk {stad}", "spuiten wanden {stad}", "stukadoorsbedrijf {stad}"],
    longTail: ["{beroep} {stad} nieuwbouw", "sierpleister {stad}", "stucwerk {stad} prijs per m2", "plafond stuken {stad}", "{beroep} erkend {stad}"],
    zoekvragen: ["wat kost stucwerk in {stad}?", "{beroep} {stad} nieuwbouw?", "goede {beroep} {stad}?"],
    wijkTip: "Vermeld nieuwbouwprojecten en woningcorporaties in de regio — stukadoors worden hier in grote aantallen ingehuurd.",
    spoedScore: 1,
  },
  tegelzetter: {
    label: "Tegelzetter",
    categorie: "bouw",
    primaireTermen: ["{beroep} {stad}", "tegels leggen {stad}", "badkamer betegelen {stad}", "tegelwerk {stad}"],
    longTail: ["{beroep} {stad} badkamer renovatie", "tegels vloer {stad} prijs", "{beroep} {stad} keuken", "grote formaat tegels {stad}", "{beroep} erkend {stad}"],
    zoekvragen: ["wat kost tegelen in {stad}?", "{beroep} badkamer {stad} offerte?", "goede {beroep} {stad}?"],
    wijkTip: "Badkamerrenovaties zijn populair in oudere stadswijken. Maak een pagina '/badkamer-renovatie-{stad}' gericht op oudere woningen.",
    spoedScore: 1,
  },
  // ── TECHNISCH ──────────────────────────────────────────────────
  loodgieter: {
    label: "Loodgieter",
    categorie: "technisch",
    primaireTermen: ["{beroep} {stad}", "{beroep} spoed {stad}", "CV ketel storing {stad}", "lekkage reparatie {stad}"],
    longTail: ["{beroep} 24 uur {stad}", "verstopt toilet {stad} centrum", "waterleiding repareren {stad}", "erkende installateur {stad}", "{beroep} weekend {stad}"],
    zoekvragen: ["{beroep} met spoed nodig {stad}?", "wat kost een {beroep} in {stad}?", "erkend installateur {stad}?"],
    wijkTip: "Spoedtermen scoren het hoogst. Zet 'spoed' en '24 uur' prominent op je homepage. Maak een aparte spoedpagina met telefoonnummer bovenaan.",
    spoedScore: 5,
  },
  elektricien: {
    label: "Elektricien",
    categorie: "technisch",
    primaireTermen: ["{beroep} {stad}", "electricien {stad}", "elektra storing {stad}", "{beroep} {stad} erkend"],
    longTail: ["{beroep} spoed {stad}", "groepenkast vervangen {stad}", "stopcontact plaatsen {stad}", "{beroep} zonnepanelen {stad}", "meterkast uitbreiden {stad}"],
    zoekvragen: ["elektra storing {stad} wie bellen?", "erkend {beroep} {stad}?", "{beroep} {stad} particulier?"],
    wijkTip: "Vermeld je VCA/ISSO-certificaten op elke pagina — dit verhoogt vertrouwen én SEO-relevantie voor professionele zoekopdrachten.",
    spoedScore: 4,
  },
  // ── MOBILITEIT ─────────────────────────────────────────────────
  fietsenmaker: {
    label: "Fietsenmaker",
    categorie: "mobiliteit",
    primaireTermen: ["{beroep} {stad}", "fiets reparatie {stad}", "fiets band plakken {stad}", "{beroep} {stad} noord"],
    longTail: ["fiets reparatie {stad} aan huis", "elektrische fiets reparatie {stad}", "{beroep} open zondag {stad}", "goedkope fiets revisie {stad}", "fiets ophaalservice {stad}"],
    zoekvragen: ["{beroep} in de buurt {stad}?", "fiets ophaalservice {stad}?", "hoeveel kost een fiets revisie {stad}?"],
    wijkTip: "Maak een pagina per stadsdeel: /fietsenmaker-{stad}-noord, /fietsenmaker-{stad}-west. Vermeld metro- en tramhaltes bij jou in de buurt.",
    spoedScore: 2,
  },
  autogarage: {
    label: "Autogarage",
    categorie: "mobiliteit",
    primaireTermen: ["autogarage {stad}", "APK {stad}", "auto reparatie {stad}", "garage {stad} erkend"],
    longTail: ["APK keuring {stad} goedkoop", "autogarage {stad} merkgebonden", "remmen vervangen {stad}", "banden wisselen {stad}", "autogarage {stad} snel afspraak"],
    zoekvragen: ["goedkope APK {stad}?", "autogarage {stad} open zaterdag?", "spoedafspraak autogarage {stad}?"],
    wijkTip: "APK-datum nadert? Maak een Google-advertentie gericht op 'APK {stad} goedkoop' — hoge conversie want mensen moeten snel geboekt zijn.",
    spoedScore: 3,
  },
  autorijschool: {
    label: "Autorijschool",
    categorie: "mobiliteit",
    primaireTermen: ["autorijschool {stad}", "rijlessen {stad}", "rijbewijs halen {stad}", "rijschool {stad}"],
    longTail: ["autorijschool {stad} intensief", "spoedcursus rijbewijs {stad}", "goedkope rijlessen {stad}", "autorijschool {stad} jong slagingspercentage", "rijschool {stad} automatisch"],
    zoekvragen: ["beste autorijschool {stad}?", "wat kost een rijbewijs in {stad}?", "autorijschool {stad} slagingspercentage?"],
    wijkTip: "Slagingspercentages zijn goud in dit segment. Publiceer je eigen statistieken: 'In {stad} slagen onze leerlingen gemiddeld in X pogingen'.",
    spoedScore: 1,
  },
  // ── ZORG ───────────────────────────────────────────────────────
  fysiotherapeut: {
    label: "Fysiotherapeut",
    categorie: "zorg",
    primaireTermen: ["{beroep} {stad}", "fysio {stad}", "{beroep} {stad} centrum", "fysiotherapie {stad}"],
    longTail: ["{beroep} {stad} rugklachten", "sportfysio {stad}", "{beroep} {stad} direct toegankelijk", "kinderfysio {stad}", "{beroep} {stad} avond weekend"],
    zoekvragen: ["{beroep} zonder verwijzing {stad}?", "beste {beroep} {stad} voor rug?", "{beroep} {stad} zorgverzekering?"],
    wijkTip: "Maak specialisatiepagina's: rugklachten, sportblessures, zwangerschapsklachten. Lokale zoekopdrachten zijn vaak specifiek op klacht.",
    spoedScore: 2,
  },
  tandarts: {
    label: "Tandarts",
    categorie: "zorg",
    primaireTermen: ["{beroep} {stad}", "{beroep} {stad} spoed", "{beroep} {stad} nieuw patient", "tandartspraktijk {stad}"],
    longTail: ["{beroep} {stad} implantaten", "{beroep} {stad} tanden bleken", "{beroep} {stad} kinderen", "orthodontist {stad}", "{beroep} {stad} zorgverzekering"],
    zoekvragen: ["nieuwe {beroep} {stad}?", "spoed {beroep} {stad} weekend?", "{beroep} {stad} nieuw patient inschrijven?"],
    wijkTip: "Veel mensen zoeken actief naar een tandarts in hun wijk — maak een pagina per stadsdeel die je bedient voor maximale lokale zichtbaarheid.",
    spoedScore: 3,
  },
  dierenarts: {
    label: "Dierenarts",
    categorie: "zorg",
    primaireTermen: ["{beroep} {stad}", "dierenkliniek {stad}", "{beroep} {stad} spoed", "veterinair {stad}"],
    longTail: ["{beroep} {stad} kat hond", "{beroep} {stad} nacht spoed", "{beroep} {stad} kleine dieren", "vaccinatie hond {stad}", "{beroep} {stad} goedkoop"],
    zoekvragen: ["spoed {beroep} {stad}?", "goedkope {beroep} {stad}?", "{beroep} {stad} open zondag?"],
    wijkTip: "Spoedgevallen en nachtservice scoren zeer hoog. Maak een duidelijke spoedpagina met je telefoonnummer en openingstijden bovenaan.",
    spoedScore: 5,
  },
  masseur: {
    label: "Masseur",
    categorie: "zorg",
    primaireTermen: ["masseur {stad}", "massagepraktijk {stad}", "massage {stad}", "massagetherapie {stad}"],
    longTail: ["sportmassage {stad}", "ontspanningsmassage {stad}", "masseur {stad} bedrijven", "hot stone massage {stad}", "masseur {stad} huis aan huis"],
    zoekvragen: ["goede masseur {stad}?", "sportmassage {stad} prijs?", "masseur aan huis {stad}?"],
    wijkTip: "Bedrijfsmassage is een snel groeiend segment — richt een aparte pagina in voor bedrijven in {stad} en omgeving.",
    spoedScore: 1,
  },
  opticiën: {
    label: "Opticien",
    categorie: "zorg",
    primaireTermen: ["opticien {stad}", "brillen {stad}", "contactlenzen {stad}", "oogmeting {stad}"],
    longTail: ["opticien {stad} online afspraak", "montuur op maat {stad}", "opticien {stad} kind bril", "zonnebril op sterkte {stad}", "opticien {stad} zorgverzekering"],
    zoekvragen: ["goede opticien {stad}?", "oogmeting {stad} prijs?", "opticien {stad} zorgverzekering?"],
    wijkTip: "Oogmeting en briladvies zijn zoekopdrachten waarbij mensen altijd lokaal zoeken. Maak pagina's per dienst én per wijk.",
    spoedScore: 1,
  },
  // ── PERSOONLIJKE VERZORGING ────────────────────────────────────
  kapper: {
    label: "Kapper",
    categorie: "verzorging",
    primaireTermen: ["{beroep} {stad}", "{beroep} {stad} centrum", "heren {beroep} {stad}", "dames {beroep} {stad}"],
    longTail: ["{beroep} {stad} afspraak", "goedkope {beroep} {stad} zuid", "{beroep} open zondag {stad}", "balayage {stad} {beroep}", "{beroep} kind {stad}"],
    zoekvragen: ["{beroep} zonder afspraak {stad}?", "beste {beroep} {stad} voor krullen?", "{beroep} {stad} avond openingstijden?"],
    wijkTip: "Online boeken verlaagt de drempel. Vermeld technieken (balayage, krullencoupe, kinderknippen) als aparte diensten — mensen zoeken hierop.",
    spoedScore: 1,
  },
  schoonheidsspecialiste: {
    label: "Schoonheidsspecialiste",
    categorie: "verzorging",
    primaireTermen: ["schoonheidsspecialiste {stad}", "schoonheidssalon {stad}", "gezichtsbehandeling {stad}", "beautysalon {stad}"],
    longTail: ["schoonheidsspecialiste {stad} wenkbrauwen", "huidverzorging {stad}", "laserontharing {stad}", "schoonheidssalon {stad} afspraak online", "schoonheidsspecialiste {stad} acne"],
    zoekvragen: ["goede schoonheidssalon {stad}?", "gezichtsbehandeling {stad} prijs?", "schoonheidsspecialiste {stad} open zondag?"],
    wijkTip: "Specialistische behandelingen (laserontharing, microneedling) trekken hogere waarde klanten en scoren goed in lokale zoekopdrachten.",
    spoedScore: 1,
  },
  nagelstudio: {
    label: "Nagelstudio",
    categorie: "verzorging",
    primaireTermen: ["nagelstudio {stad}", "nagels {stad}", "gelnagels {stad}", "nagelsalon {stad}"],
    longTail: ["nagelstudio {stad} acryl", "manicure pedicure {stad}", "nagelstudio {stad} afspraak", "gelnagels {stad} goedkoop", "nagelstudio {stad} open zondag"],
    zoekvragen: ["nagelstudio {stad} prijs?", "gelnagels {stad} hoe lang?", "beste nagelstudio {stad}?"],
    wijkTip: "Foto's van nageldesigns op Instagram en Google profiel met stadsnaam erin zijn dé manier om nieuwe klanten te trekken in je buurt.",
    spoedScore: 1,
  },
  // ── HORECA ─────────────────────────────────────────────────────
  bakker: {
    label: "Bakker",
    categorie: "horeca",
    primaireTermen: ["{beroep} {stad}", "brood kopen {stad}", "bakkerij {stad} centrum", "ambachtelijke {beroep} {stad}"],
    longTail: ["vers brood zaterdag {stad}", "glutenvrij brood {stad}", "biologische {beroep} {stad}", "croissants {stad} centrum", "zuurdesem brood {stad}"],
    zoekvragen: ["hoe laat is de bakker open in {stad}?", "waar koop ik zuurdesem in {stad}?", "bakker bezorging aan huis {stad}?"],
    wijkTip: "Maak een pagina per buurt die je bezorgt. Noem wijknames in productteksten: 'geliefd in Lombok, Zuilen en Overvecht'.",
    spoedScore: 1,
  },
  restaurant: {
    label: "Restaurant",
    categorie: "horeca",
    primaireTermen: ["restaurant {stad}", "eten {stad} centrum", "restaurant {stad} reserveren", "diner {stad}"],
    longTail: ["romantisch restaurant {stad}", "restaurant {stad} verjaardag", "restaurant {stad} vegetarisch", "lunch {stad} centrum", "terras {stad} zomer"],
    zoekvragen: ["goed restaurant {stad} voor vanavond?", "restaurant {stad} open zondag?", "restaurant {stad} kinderen welkom?"],
    wijkTip: "Vermeld aanloopstraten en bezienswaardigheden dichtbij: 'op 2 minuten van het station'. Dit helpt bij navigatiezoekopdrachten.",
    spoedScore: 1,
  },
  ijssalon: {
    label: "IJssalon",
    categorie: "horeca",
    primaireTermen: ["ijssalon {stad}", "ijs kopen {stad}", "ambachtelijk ijs {stad}", "gelateria {stad}"],
    longTail: ["beste ijs {stad}", "veganistisch ijs {stad}", "ijssalon {stad} centrum open", "ijs bezorgen {stad}", "ijssalon {stad} feestje"],
    zoekvragen: ["beste ijssalon {stad}?", "ijssalon {stad} open op zondag?", "ambachtelijk ijs {stad} welke smaken?"],
    wijkTip: "Seizoensmenu's en bijzondere smaken op je website en Google profiel trekken mensen die actief zoeken naar iets nieuws in hun stad.",
    spoedScore: 1,
  },
  catering: {
    label: "Cateringbedrijf",
    categorie: "horeca",
    primaireTermen: ["catering {stad}", "cateringbedrijf {stad}", "catering bedrijfsfeest {stad}", "eten laten bezorgen {stad}"],
    longTail: ["catering {stad} bruiloft", "lunch catering {stad} kantoor", "bitterballen catering {stad}", "catering {stad} verjaardag thuis", "catering offerte {stad}"],
    zoekvragen: ["catering {stad} prijs per persoon?", "catering {stad} bruiloft aanbeveling?", "catering op maat {stad}?"],
    wijkTip: "Bedrijfslocaties in industrieterreinen en kantoorparken zijn vruchtbare terreinen — maak een pagina gericht op kantoorlunches in {stad}.",
    spoedScore: 1,
  },
  // ── VOEDSEL ────────────────────────────────────────────────────
  slager: {
    label: "Slager",
    categorie: "voedsel",
    primaireTermen: ["slager {stad}", "slagerij {stad}", "vlees kopen {stad}", "ambachtelijke slager {stad}"],
    longTail: ["slager {stad} biologisch vlees", "BBQ pakketten {stad}", "slager {stad} bezorging", "ambachtelijke worst {stad}", "slager {stad} halal"],
    zoekvragen: ["goede slager {stad}?", "slager {stad} open zaterdag?", "halal slager {stad}?"],
    wijkTip: "Speciale aanbiedingen voor feestdagen (Kerst, Pasen, BBQ-seizoen) met stadsnaam genereren extra organisch verkeer op precies het juiste moment.",
    spoedScore: 1,
  },
  // ── ZAKELIJK ───────────────────────────────────────────────────
  accountant: {
    label: "Accountant/Boekhouder",
    categorie: "zakelijk",
    primaireTermen: ["accountant {stad}", "boekhouder {stad}", "administratiekantoor {stad}", "belastingaangifte {stad}"],
    longTail: ["accountant {stad} zzp", "boekhouder {stad} mkb", "jaarrekening {stad} goedkoop", "accountant {stad} startende ondernemer", "boekhoudpakket {stad}"],
    zoekvragen: ["goede accountant {stad} voor zzp?", "wat kost een boekhouder in {stad}?", "accountant {stad} eerste gesprek gratis?"],
    wijkTip: "ZZP'ers zijn een enorme doelgroep. Maak een aparte landingspagina '/accountant-{stad}-zzp' met specifieke tarieven en diensten voor zelfstandigen.",
    spoedScore: 1,
  },
  makelaar: {
    label: "Makelaar",
    categorie: "zakelijk",
    primaireTermen: ["makelaar {stad}", "huis kopen {stad}", "huis verkopen {stad}", "makelaardij {stad}"],
    longTail: ["makelaar {stad} kosten", "aankoopmakelaar {stad}", "verkoopmakelaar {stad}", "makelaar {stad} beoordelingen", "makelaar {stad} woningmarkt"],
    zoekvragen: ["beste makelaar {stad}?", "wat kost een makelaar in {stad}?", "makelaar {stad} gratis waardebepaling?"],
    wijkTip: "Wijk-specifieke marktinformatie ('Huizenprijzen in de Rivierenbuurt stijgen met X%') trekt zowel kopers als verkopers organisch aan.",
    spoedScore: 1,
  },
  advocaat: {
    label: "Advocaat",
    categorie: "zakelijk",
    primaireTermen: ["advocaat {stad}", "advocatenkantoor {stad}", "juridisch advies {stad}", "advocaat {stad} ondernemingsrecht"],
    longTail: ["advocaat {stad} arbeidsrecht", "scheidingsadvocaat {stad}", "advocaat {stad} huurrecht", "advocaat {stad} gratis eerste gesprek", "advocaat {stad} zzp"],
    zoekvragen: ["advocaat {stad} eerste gesprek gratis?", "goedkope advocaat {stad}?", "advocaat {stad} ondernemers?"],
    wijkTip: "Rechtsgebied-specifieke pagina's ('/arbeidsrecht-advocaat-{stad}') trekken zoekopdrachten van mensen met een specifiek probleem — de meest converterende doelgroep.",
    spoedScore: 3,
  },
  // ── TUIN/GROEN ─────────────────────────────────────────────────
  hoveniersbedrijf: {
    label: "Hoveniersbedrijf",
    categorie: "tuin",
    primaireTermen: ["hoveniersbedrijf {stad}", "hovenier {stad}", "tuin aanleggen {stad}", "tuinonderhoud {stad}"],
    longTail: ["hovenier {stad} bestrating", "tuinontwerp {stad}", "hovenier {stad} seizoensonderhoud", "tuin renoveren {stad}", "hovenier {stad} gazon aanleggen"],
    zoekvragen: ["goede hovenier {stad}?", "wat kost tuin aanleggen {stad}?", "hovenier {stad} offerte gratis?"],
    wijkTip: "Seizoenstijden (voorjaar en herfst) zijn piekdagen voor zoekopdrachten. Publiceer seizoensgerichte content met stadsnaam voor maximale zichtbaarheid.",
    spoedScore: 1,
  },
  bloemist: {
    label: "Bloemist",
    categorie: "tuin",
    primaireTermen: ["bloemist {stad}", "bloemen kopen {stad}", "bloemenwinkel {stad}", "bloemist {stad} bezorging"],
    longTail: ["bloemist {stad} rouwstuk", "bruidsboeket {stad}", "bloemist {stad} trouwen", "bloemen bezorgen {stad} zelfde dag", "bloemist {stad} open zondag"],
    zoekvragen: ["bloemist {stad} open op zondag?", "bloemen bezorgen {stad} vandaag?", "bruidsboeket {stad} prijs?"],
    wijkTip: "Bezorging op dezelfde dag met een grote straal trekt veel impulskopen. Vermeld alle buurten en wijken die je bedient in je bezorgpagina.",
    spoedScore: 2,
  },
  // ── SCHOONMAAK ─────────────────────────────────────────────────
  schoonmaakbedrijf: {
    label: "Schoonmaakbedrijf",
    categorie: "schoonmaak",
    primaireTermen: ["schoonmaakbedrijf {stad}", "schoonmaker {stad}", "schoonmaakdienst {stad}", "kantoor schoonmaken {stad}"],
    longTail: ["schoonmaakbedrijf {stad} particulier", "ramen lappen {stad}", "eindschoonmaak {stad}", "schoonmaakbedrijf {stad} zzp contract", "schoonmaakbedrijf {stad} erkend"],
    zoekvragen: ["schoonmaakbedrijf {stad} prijs?", "schoonmaker {stad} particulier?", "eindschoonmaak {stad} huurwoning?"],
    wijkTip: "Particuliere schoonmaak groeit sterk. Maak een aparte pagina voor 'thuisschoonmaak {stad}' naast je B2B-diensten — compleet andere zoekopdrachten.",
    spoedScore: 1,
  },
};

export const BEROEP_CATEGORIEEN: Record<BeroepCategorie, { label: string; beroepen: Beroep[] }> = {
  bouw: { label: "Bouw & verbouw", beroepen: ["aannemer", "timmerman", "schilder", "dakdekker", "stukadoor", "tegelzetter"] },
  technisch: { label: "Technisch", beroepen: ["loodgieter", "elektricien"] },
  mobiliteit: { label: "Mobiliteit", beroepen: ["fietsenmaker", "autogarage", "autorijschool"] },
  zorg: { label: "Zorg & gezondheid", beroepen: ["fysiotherapeut", "tandarts", "dierenarts", "masseur", "opticiën"] },
  verzorging: { label: "Persoonlijke verzorging", beroepen: ["kapper", "schoonheidsspecialiste", "nagelstudio"] },
  horeca: { label: "Horeca", beroepen: ["bakker", "restaurant", "ijssalon", "catering"] },
  voedsel: { label: "Voedsel & drank", beroepen: ["slager"] },
  zakelijk: { label: "Zakelijke diensten", beroepen: ["accountant", "makelaar", "advocaat"] },
  tuin: { label: "Tuin & groen", beroepen: ["hoveniersbedrijf", "bloemist"] },
  schoonmaak: { label: "Schoonmaak", beroepen: ["schoonmaakbedrijf"] },
};

export const CHECKLIST_ITEMS = [
  { id: "titel", titel: "Paginatitel met stad + beroep", uitleg: 'bijv. "Fietsenmaker Amsterdam | Bike Repair Noord"', prioriteit: "hoog" as const },
  { id: "meta", titel: "Meta description met locatie", uitleg: 'bijv. "Uw fietsenmaker in Amsterdam Noord. Bandenpech, remmen, revisies — snelle service."', prioriteit: "hoog" as const },
  { id: "h1", titel: "H1 bevat beroep + plaatsnaam", uitleg: 'bijv. "Bakkerij in Haarlem — ambachtelijk brood sinds 1987"', prioriteit: "hoog" as const },
  { id: "adres", titel: "Adres en wijk op elke pagina", uitleg: "Zet straat, stad en wijk in de footer — Google koppelt dit aan lokale zoekopdrachten", prioriteit: "hoog" as const },
  { id: "gbp", titel: "Google Bedrijfsprofiel volledig ingevuld", uitleg: "Naam, categorie, adres, openingstijden, foto's, beschrijving — alles compleet", prioriteit: "hoog" as const },
  { id: "landingspagina", titel: "Regio-specifieke landingspagina", uitleg: "bijv. /loodgieter-tilburg of /kapper-amsterdam-oost — één pagina per kern/wijk", prioriteit: "midden" as const },
  { id: "wijkwoorden", titel: "Wijk- en buurtwoorden in tekst", uitleg: 'Noem buurten die je bedient: "ook in de Jordaan, Oud-West en De Pijp"', prioriteit: "midden" as const },
  { id: "schema", titel: "Schema markup: LocalBusiness", uitleg: "Voeg JSON-LD toe met naam, adres, openingstijden en geo-coördinaten", prioriteit: "midden" as const },
  { id: "reviews", titel: "Klantreviews met plaatsnaam", uitleg: "Vraag klanten hun wijk te vermelden — versterkt lokale relevantie in Google", prioriteit: "midden" as const },
  { id: "nap", titel: "NAP-consistentie (Naam, Adres, Telefoon)", uitleg: "Zorg dat je bedrijfsnaam, adres en telefoonnummer overal identiek zijn (website, Google, socials)", prioriteit: "midden" as const },
  { id: "foto", titel: "Foto's met lokale context", uitleg: "Upload foto's van je pand, buurt of met klanten — Google gebruikt beeldlocatie voor lokale ranking", prioriteit: "midden" as const },
  { id: "faq", titel: "FAQ-sectie met lokale vragen", uitleg: 'bijv. "Bezorgt u ook in Haarlem Schalkwijk?" of "Kom je ook naar IJburg?"', prioriteit: "laag" as const },
  { id: "tel", titel: "Telefoon als klikbare link (mobiel)", uitleg: "tel:-link zodat Google zeker weet dat je een lokaal bedrijf bent met direct contact", prioriteit: "laag" as const },
  { id: "backlinks", titel: "Lokale backlinks (gemeente, krant)", uitleg: "Links van de gemeente, lokale krant of ondernemersvereniging boosten je lokale autoriteit", prioriteit: "laag" as const },
];
