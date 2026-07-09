export interface Gemeente {
  naam: string;
  inwoners: number;
  groeigebied?: boolean;
}

export interface Provincie {
  naam: string;
  gemeentes: Gemeente[];
}

export const PROVINCIES: Provincie[] = [
  {
    naam: "Noord-Holland",
    gemeentes: [
      { naam: "Amsterdam", inwoners: 921000 },
      { naam: "Haarlem", inwoners: 163000 },
      { naam: "Zaanstad", inwoners: 156000 },
      { naam: "Haarlemmermeer", inwoners: 155000 },
      { naam: "Purmerend", inwoners: 82000 },
      { naam: "Hoorn", inwoners: 73000 },
      { naam: "Alkmaar", inwoners: 108000 },
      { naam: "Amstelveen", inwoners: 93000 },
      { naam: "Den Helder", inwoners: 56000 },
      { naam: "Velsen", inwoners: 68000 },
    ],
  },
  {
    naam: "Zuid-Holland",
    gemeentes: [
      { naam: "Rotterdam", inwoners: 652000 },
      { naam: "Den Haag", inwoners: 548000 },
      { naam: "Leiden", inwoners: 125000 },
      { naam: "Dordrecht", inwoners: 119000 },
      { naam: "Zoetermeer", inwoners: 124000 },
      { naam: "Westland", inwoners: 111000 },
      { naam: "Alphen aan den Rijn", inwoners: 112000 },
      { naam: "Delft", inwoners: 103000 },
      { naam: "Nissewaard", inwoners: 86000 },
      { naam: "Gouda", inwoners: 73000 },
      { naam: "Lansingerland", inwoners: 62000, groeigebied: true },
    ],
  },
  {
    naam: "Noord-Brabant",
    gemeentes: [
      { naam: "Eindhoven", inwoners: 234000 },
      { naam: "Tilburg", inwoners: 222000 },
      { naam: "Breda", inwoners: 185000 },
      { naam: "'s-Hertogenbosch", inwoners: 155000 },
      { naam: "Helmond", inwoners: 92000 },
      { naam: "Oss", inwoners: 92000 },
      { naam: "Bergen op Zoom", inwoners: 67000 },
      { naam: "Waalwijk", inwoners: 47000, groeigebied: true },
    ],
  },
  {
    naam: "Gelderland",
    gemeentes: [
      { naam: "Nijmegen", inwoners: 179000 },
      { naam: "Arnhem", inwoners: 160000 },
      { naam: "Apeldoorn", inwoners: 164000 },
      { naam: "Ede", inwoners: 116000 },
      { naam: "Doetinchem", inwoners: 57000 },
      { naam: "Harderwijk", inwoners: 46000 },
      { naam: "Wageningen", inwoners: 38000 },
    ],
  },
  {
    naam: "Utrecht",
    gemeentes: [
      { naam: "Utrecht", inwoners: 361000 },
      { naam: "Amersfoort", inwoners: 156000 },
      { naam: "Nieuwegein", inwoners: 63000 },
      { naam: "Veenendaal", inwoners: 65000 },
      { naam: "Houten", inwoners: 50000, groeigebied: true },
      { naam: "Zeist", inwoners: 63000 },
      { naam: "Soest", inwoners: 47000 },
    ],
  },
  {
    naam: "Overijssel",
    gemeentes: [
      { naam: "Enschede", inwoners: 160000 },
      { naam: "Zwolle", inwoners: 131000 },
      { naam: "Deventer", inwoners: 100000 },
      { naam: "Hengelo", inwoners: 80000 },
      { naam: "Almelo", inwoners: 72000 },
      { naam: "Kampen", inwoners: 53000 },
    ],
  },
  {
    naam: "Flevoland",
    gemeentes: [
      { naam: "Almere", inwoners: 215000, groeigebied: true },
      { naam: "Lelystad", inwoners: 78000, groeigebied: true },
      { naam: "Dronten", inwoners: 41000, groeigebied: true },
      { naam: "Zeewolde", inwoners: 22000, groeigebied: true },
    ],
  },
  {
    naam: "Friesland",
    gemeentes: [
      { naam: "Leeuwarden", inwoners: 123000 },
      { naam: "Súdwest-Fryslân", inwoners: 89000 },
      { naam: "Smallingerland", inwoners: 55000 },
      { naam: "Heerenveen", inwoners: 50000 },
      { naam: "Waadhoeke", inwoners: 46000 },
    ],
  },
  {
    naam: "Groningen",
    gemeentes: [
      { naam: "Groningen", inwoners: 232000 },
      { naam: "Westerkwartier", inwoners: 64000 },
      { naam: "Oldambt", inwoners: 38000 },
      { naam: "Midden-Groningen", inwoners: 61000 },
    ],
  },
  {
    naam: "Drenthe",
    gemeentes: [
      { naam: "Emmen", inwoners: 107000 },
      { naam: "Assen", inwoners: 67000 },
      { naam: "Hoogeveen", inwoners: 54000 },
      { naam: "Meppel", inwoners: 34000 },
    ],
  },
  {
    naam: "Zeeland",
    gemeentes: [
      { naam: "Terneuzen", inwoners: 55000 },
      { naam: "Middelburg", inwoners: 49000 },
      { naam: "Vlissingen", inwoners: 44000 },
      { naam: "Goes", inwoners: 38000 },
    ],
  },
  {
    naam: "Limburg",
    gemeentes: [
      { naam: "Maastricht", inwoners: 122000 },
      { naam: "Venlo", inwoners: 101000 },
      { naam: "Sittard-Geleen", inwoners: 95000 },
      { naam: "Heerlen", inwoners: 86000 },
      { naam: "Roermond", inwoners: 58000 },
      { naam: "Weert", inwoners: 49000 },
    ],
  },
];

export type CompetitieNiveau = "hoog" | "midden" | "laag";

export interface GemeenteScore {
  gemeente: string;
  provincie: string;
  inwoners: number;
  vraagScore: number;
  competitie: CompetitieNiveau;
  kansScore: number;
  groeigebied: boolean;
}

const SPOED_FACTOR: Record<string, number> = {
  loodgieter: 1.6,
  elektricien: 1.5,
  dierenarts: 1.4,
  dakdekker: 1.4,
  advocaat: 1.3,
  tandarts: 1.3,
  autogarage: 1.2,
  fysiotherapeut: 1.1,
  schoonheidsspecialiste: 1.1,
  kapper: 1.1,
  nagelstudio: 1.0,
  masseur: 1.0,
  bakker: 1.0,
  restaurant: 1.1,
  ijssalon: 0.8,
  bloemist: 1.0,
  slager: 0.9,
  schilder: 1.0,
  timmerman: 1.0,
  aannemer: 1.0,
  dakdekker2: 1.1,
  stukadoor: 0.9,
  tegelzetter: 0.9,
  fietsenmaker: 1.1,
  autorijschool: 1.0,
  opticiën: 0.9,
  hoveniersbedrijf: 0.9,
  schoonmaakbedrijf: 1.0,
  accountant: 1.0,
  makelaar: 1.0,
  catering: 0.9,
};

export interface BeroepKans {
  beroep: string;
  label: string;
  vraagScore: number;
  kansScore: number;
  competitie: CompetitieNiveau;
  groeigebied: boolean;
}

export const BEROEP_LABELS: Record<string, string> = {
  loodgieter: "Loodgieter",
  elektricien: "Elektricien",
  dierenarts: "Dierenarts",
  dakdekker: "Dakdekker",
  advocaat: "Advocaat",
  tandarts: "Tandarts",
  autogarage: "Autogarage",
  fysiotherapeut: "Fysiotherapeut",
  schoonheidsspecialiste: "Schoonheidsspecialiste",
  kapper: "Kapper",
  nagelstudio: "Nagelstudio",
  masseur: "Masseur",
  bakker: "Bakker",
  restaurant: "Restaurant",
  ijssalon: "IJssalon",
  bloemist: "Bloemist",
  slager: "Slager",
  schilder: "Schilder",
  timmerman: "Timmerman",
  aannemer: "Aannemer",
  stukadoor: "Stukadoor",
  tegelzetter: "Tegelzetter",
  fietsenmaker: "Fietsenmaker",
  autorijschool: "Autorijschool",
  "opticiën": "Opticiën",
  hoveniersbedrijf: "Hoveniersbedrijf",
  schoonmaakbedrijf: "Schoonmaakbedrijf",
  accountant: "Accountant",
  makelaar: "Makelaar",
  catering: "Catering",
};

/** Geeft voor een specifieke gemeente alle beroepen gesorteerd op kansscore (hoog = meeste kans). */
export function berekenBeroepKansenPerGemeente(gemeenteNaam: string): BeroepKans[] {
  let gem: Gemeente | undefined;
  let groeigebied = false;

  for (const prov of PROVINCIES) {
    const found = prov.gemeentes.find(
      (g) => g.naam.toLowerCase() === gemeenteNaam.toLowerCase()
    );
    if (found) {
      gem = found;
      groeigebied = found.groeigebied ?? false;
      break;
    }
  }

  if (!gem) return [];

  const competitie: CompetitieNiveau =
    gem.inwoners > 150000 ? "hoog" :
    gem.inwoners > 60000 ? "midden" : "laag";

  const competitieFactor =
    competitie === "laag" ? 1.6 :
    competitie === "midden" ? 1.1 : 0.75;

  const result: BeroepKans[] = [];

  for (const [beroep, factor] of Object.entries(SPOED_FACTOR)) {
    if (beroep === "dakdekker2") continue;
    const base = gem.inwoners / 10000;
    const vraagScore = Math.round(base * factor * (groeigebied ? 1.25 : 1.0));
    const kansScore = Math.round(vraagScore * competitieFactor);
    result.push({
      beroep,
      label: BEROEP_LABELS[beroep] ?? beroep,
      vraagScore,
      kansScore,
      competitie,
      groeigebied,
    });
  }

  return result.sort((a, b) => b.kansScore - a.kansScore);
}

export function genereerGemeenteTips(score: GemeenteScore, rank: number): string[] {
  const tips: string[] = [];

  if (score.competitie === "laag") {
    tips.push("Weinig concurrentie hier: met een goed ingevuld Google-profiel en een paar reviews val je al snel op.");
  } else if (score.competitie === "midden") {
    tips.push("Gemiddelde concurrentie: onderscheid je met klantreviews en duidelijke foto's van je werk.");
  } else {
    tips.push("Veel concurrentie in deze gemeente: investeer in een sterk Google-profiel, actief reviews verzamelen en lokale content op je website.");
  }

  if (score.groeigebied) {
    tips.push("Groeigebied: hier komen veel nieuwe inwoners bij — zij kennen de lokale aanbieders nog niet, dus dit is het moment om je zichtbaar te maken.");
  }

  if (rank <= 3) {
    tips.push("Dit is een van de kansrijkste gemeenten voor jouw beroep — overweeg hier als eerste te adverteren of content op te richten.");
  } else if (score.inwoners > 150000) {
    tips.push("Grote gemeente met veel potentiële klanten, maar ook meer concurrentie — richt je op een duidelijke niche of specialisatie.");
  }

  return tips;
}

export function berekenGemeenteScores(beroep: string, spoedScore: number): GemeenteScore[] {
  const factor = SPOED_FACTOR[beroep] ?? 1.0;
  const scores: GemeenteScore[] = [];

  for (const prov of PROVINCIES) {
    for (const gem of prov.gemeentes) {
      const base = gem.inwoners / 10000;
      const vraagScore = Math.round(base * factor * (gem.groeigebied ? 1.25 : 1.0));

      const competitie: CompetitieNiveau =
        gem.inwoners > 150000 ? "hoog" :
        gem.inwoners > 60000 ? "midden" : "laag";

      const competitieFactor = competitie === "laag" ? 1.6 : competitie === "midden" ? 1.1 : 0.75;
      const kansScore = Math.round(vraagScore * competitieFactor);

      scores.push({
        gemeente: gem.naam,
        provincie: prov.naam,
        inwoners: gem.inwoners,
        vraagScore,
        competitie,
        kansScore,
        groeigebied: gem.groeigebied ?? false,
      });
    }
  }

  return scores.sort((a, b) => b.kansScore - a.kansScore);
}
