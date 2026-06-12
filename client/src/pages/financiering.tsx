import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Info, Euro, Users, X } from "lucide-react";

type Categorie = "Alle" | "Crowdfunding" | "Lening" | "EU-fonds" | "Regionaal" | "Subsidie";

interface FinancieringsOptie {
  naam: string;
  categorie: Exclude<Categorie, "Alle">;
  beschrijving: string;
  bedrag: string;
  doelgroep: string;
  url: string;
}

const OPTIES: FinancieringsOptie[] = [
  // Crowdfunding
  {
    naam: "Collin Crowdfund",
    categorie: "Crowdfunding",
    beschrijving: "Zakelijk crowdfunden via een community van particuliere investeerders. Gericht op MKB met solide trackrecord.",
    bedrag: "€25.000 – €2.500.000",
    doelgroep: "MKB, groeiende bedrijven",
    url: "https://www.collincrowdfund.nl",
  },
  {
    naam: "Oneplanetcrowd",
    categorie: "Crowdfunding",
    beschrijving: "Duurzaam crowdfunden voor groene en sociale projecten. Leningen en obligaties voor impact-gedreven ondernemers.",
    bedrag: "€50.000 – €5.000.000",
    doelgroep: "Duurzame ondernemers, coöperaties",
    url: "https://www.oneplanetcrowd.com",
  },
  {
    naam: "Geldvoorelkaar",
    categorie: "Crowdfunding",
    beschrijving: "Grootste P2P-platform van Nederland voor zakelijke leningen. Snelle beoordeling, breed investeerdersnetwerk.",
    bedrag: "€20.000 – €2.000.000",
    doelgroep: "MKB, zelfstandigen",
    url: "https://www.geldvoorelkaar.nl",
  },
  {
    naam: "Duocrowd",
    categorie: "Crowdfunding",
    beschrijving: "Regionale crowdfundingplatform met focus op lokale ondernemers en woonprojecten.",
    bedrag: "€10.000 – €750.000",
    doelgroep: "Regionale ondernemers, vastgoed",
    url: "https://www.duocrowd.nl",
  },
  {
    naam: "Voordekunst",
    categorie: "Crowdfunding",
    beschrijving: "Crowdfundingplatform specifiek voor culturele en creatieve projecten in Nederland.",
    bedrag: "€500 – €100.000",
    doelgroep: "Culturele sector, creatieve industrie",
    url: "https://www.voordekunst.nl",
  },
  // Leningen & Garanties
  {
    naam: "Qredits Microkrediet",
    categorie: "Lening",
    beschrijving: "Microfinanciering van de overheid voor starters en kleine ondernemers die niet terecht kunnen bij een bank.",
    bedrag: "€5.000 – €250.000",
    doelgroep: "Starters, ZZP, kleine MKB",
    url: "https://www.qredits.nl",
  },
  {
    naam: "BMKB – Borgstelling MKB",
    categorie: "Lening",
    beschrijving: "Overheidsgarantie waarmee de overheid borg staat voor een deel van je banklening. Verhoogt je leencapaciteit.",
    bedrag: "Tot €1.500.000 garantie",
    doelgroep: "MKB, startups",
    url: "https://www.rvo.nl/subsidies-financiering/bmkb",
  },
  {
    naam: "GO – Garantie Ondernemingsfinanciering",
    categorie: "Lening",
    beschrijving: "Overheidsgarantie voor grotere leningen en bankgaranties. Bedoeld voor middelgrote bedrijven.",
    bedrag: "€1.500.000 – €150.000.000",
    doelgroep: "Middelgroot bedrijf",
    url: "https://www.rvo.nl/subsidies-financiering/go",
  },
  {
    naam: "Invest-NL",
    categorie: "Lening",
    beschrijving: "Nationale investeringsinstelling voor risicodragende financiering van duurzame en innovatieve projecten.",
    bedrag: "€5.000.000+",
    doelgroep: "Innovatieve scale-ups, infra",
    url: "https://www.invest-nl.nl",
  },
  // EU-fondsen
  {
    naam: "EFRO – Europees Fonds Regionale Ontwikkeling",
    categorie: "EU-fonds",
    beschrijving: "EU-subsidie voor innovatie en regionale economische ontwikkeling. Uitvoering via provincies en ROPs.",
    bedrag: "Per project variabel",
    doelgroep: "MKB, samenwerkingsverbanden",
    url: "https://www.europaom.nl/fondsen/efro",
  },
  {
    naam: "ESF+ – Europees Sociaal Fonds",
    categorie: "EU-fonds",
    beschrijving: "EU-subsidie voor werkgelegenheid, scholing en sociale inclusie. Via UWV, gemeenten en regio's.",
    bedrag: "Per traject variabel",
    doelgroep: "Werkgevers, opleiders",
    url: "https://www.esf.nl",
  },
  {
    naam: "Interreg",
    categorie: "EU-fonds",
    beschrijving: "EU-programma voor grensoverschrijdende samenwerking tussen regio's. Projecten met buitenlandse partners.",
    bedrag: "€500.000 – €5.000.000",
    doelgroep: "Samenwerkende organisaties",
    url: "https://www.interreg.nl",
  },
  {
    naam: "Horizon Europe",
    categorie: "EU-fonds",
    beschrijving: "Grootste EU-onderzoeks- en innovatieprogramma. Open voor bedrijven, kennisinstellingen en consortia.",
    bedrag: "Per call variabel",
    doelgroep: "Innovatieve bedrijven, kennisinstellingen",
    url: "https://www.nwo.nl/horizon-europe",
  },
  // Regionaal (ROM's)
  {
    naam: "Oost NL",
    categorie: "Regionaal",
    beschrijving: "Regionale ontwikkelingsmaatschappij voor Gelderland en Overijssel. Investeert in innovatieve MKB-bedrijven.",
    bedrag: "€50.000 – €5.000.000",
    doelgroep: "MKB Gelderland & Overijssel",
    url: "https://www.oostnl.nl",
  },
  {
    naam: "BOM – Brabantse Ontwikkelingsmaatschappij",
    categorie: "Regionaal",
    beschrijving: "Financiering en ondersteuning voor ondernemers in Noord-Brabant. Leningen, participaties en garanties.",
    bedrag: "€100.000 – €10.000.000",
    doelgroep: "MKB Noord-Brabant",
    url: "https://www.bom.nl",
  },
  {
    naam: "LIOF – Limburg Invest",
    categorie: "Regionaal",
    beschrijving: "Regionale investeringsmaatschappij voor Limburg. Risicokapitaal en leningen voor groeiende bedrijven.",
    bedrag: "€50.000 – €5.000.000",
    doelgroep: "MKB Limburg",
    url: "https://www.liof.nl",
  },
  {
    naam: "InnovationQuarter",
    categorie: "Regionaal",
    beschrijving: "Regionale ontwikkelingsmaatschappij voor Zuid-Holland. Investeert in tech, life sciences en cleantech.",
    bedrag: "€100.000 – €10.000.000",
    doelgroep: "MKB Zuid-Holland",
    url: "https://www.innovationquarter.nl",
  },
  // Subsidies & Fiscaal
  {
    naam: "WBSO – R&D-aftrek",
    categorie: "Subsidie",
    beschrijving: "Fiscale aftrek voor research & development. Verlaagt de loonkosten van je R&D-medewerkers aanzienlijk.",
    bedrag: "32–40% van R&D-loonkosten",
    doelgroep: "Bedrijven met R&D-activiteiten",
    url: "https://www.rvo.nl/subsidies-financiering/wbso",
  },
  {
    naam: "EIA – Energie Investering",
    categorie: "Subsidie",
    beschrijving: "Fiscale aftrek voor investeringen in energiezuinige bedrijfsmiddelen. Aanvragen via RVO.",
    bedrag: "45,5% extra aftrek",
    doelgroep: "Ondernemers met energiezuinige investeringen",
    url: "https://www.rvo.nl/subsidies-financiering/eia",
  },
  {
    naam: "MIA/Vamil – Milieu-investeringen",
    categorie: "Subsidie",
    beschrijving: "Fiscale voordelen voor milieuvriendelijke investeringen. Combineerbaar met de EIA.",
    bedrag: "27–36% extra aftrek",
    doelgroep: "Ondernemers met milieu-investeringen",
    url: "https://www.rvo.nl/subsidies-financiering/mia-vamil",
  },
  {
    naam: "Topsectoren subsidies",
    categorie: "Subsidie",
    beschrijving: "PPS-toeslagen en MIT-subsidies voor innovatie binnen de negen Nederlandse topsectoren.",
    bedrag: "Variabel per regeling",
    doelgroep: "Innovatieve MKB per topsector",
    url: "https://www.rvo.nl/subsidies-financiering/topsectoren",
  },
];

const CATEGORIE_KLEUREN: Record<Exclude<Categorie, "Alle">, string> = {
  Crowdfunding: "bg-blue-100 text-blue-800",
  Lening:       "bg-amber-100 text-amber-800",
  "EU-fonds":   "bg-purple-100 text-purple-800",
  Regionaal:    "bg-teal-100 text-teal-800",
  Subsidie:     "bg-green-100 text-green-800",
};

const CATEGORIEEN: Categorie[] = ["Alle", "Crowdfunding", "Lening", "EU-fonds", "Regionaal", "Subsidie"];

export default function FinancieringPage() {
  const [actieveCategorie, setActieveCategorie] = useState<Categorie>("Alle");
  const [zoekterm, setZoekterm] = useState("");

  const gefilterd = useMemo(() => {
    return OPTIES.filter((o) => {
      const matchCategorie = actieveCategorie === "Alle" || o.categorie === actieveCategorie;
      const lc = zoekterm.toLowerCase();
      const matchZoek =
        !zoekterm ||
        o.naam.toLowerCase().includes(lc) ||
        o.beschrijving.toLowerCase().includes(lc) ||
        o.doelgroep.toLowerCase().includes(lc);
      return matchCategorie && matchZoek;
    });
  }, [actieveCategorie, zoekterm]);

  const aantalPerCategorie = useMemo(() => {
    const counts: Record<string, number> = { Alle: OPTIES.length };
    OPTIES.forEach((o) => {
      counts[o.categorie] = (counts[o.categorie] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="max-w-4xl mx-auto" data-testid="page-financiering">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" data-testid="text-page-title">
          Crowdfund & Financiering
        </h1>
        <p className="text-muted-foreground text-sm">
          Overzicht van financieringsmogelijkheden voor regionale ondernemers — van crowdfunding tot EU-fondsen.
        </p>
      </div>

      {/* Zoekbalk */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 pr-9"
          placeholder="Zoek op naam, doelgroep of beschrijving…"
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
          data-testid="input-zoek"
        />
        {zoekterm && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover-elevate rounded"
            onClick={() => setZoekterm("")}
            data-testid="button-clear-zoek"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categorie-filter */}
      <div className="flex flex-wrap gap-2 mb-6" data-testid="filter-categorien">
        {CATEGORIEEN.map((cat) => (
          <Button
            key={cat}
            variant={actieveCategorie === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActieveCategorie(cat)}
            data-testid={`filter-${cat.toLowerCase()}`}
          >
            {cat}
            <span className="ml-1.5 text-xs opacity-70">
              {aantalPerCategorie[cat] ?? 0}
            </span>
          </Button>
        ))}
      </div>

      {/* Resultaattelling */}
      {zoekterm || actieveCategorie !== "Alle" ? (
        <p className="text-sm text-muted-foreground mb-4" data-testid="text-result-count">
          {gefilterd.length} optie{gefilterd.length !== 1 ? "s" : ""} gevonden
          {actieveCategorie !== "Alle" && <span> in <strong>{actieveCategorie}</strong></span>}
          {zoekterm && <span> voor "<strong>{zoekterm}</strong>"</span>}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          {OPTIES.length} financieringsopties voor Nederlandse ondernemers
        </p>
      )}

      {/* Geen resultaten */}
      {gefilterd.length === 0 && (
        <div className="text-center py-16 text-muted-foreground" data-testid="state-no-results">
          <Euro className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">Geen opties gevonden</p>
          <p className="text-xs">Probeer een andere zoekterm of categorie.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => { setZoekterm(""); setActieveCategorie("Alle"); }}
            data-testid="button-reset-filter"
          >
            Alle opties tonen
          </Button>
        </div>
      )}

      {/* Kaarten */}
      <div className="space-y-4">
        {gefilterd.map((optie) => (
          <Card key={optie.naam} data-testid={`card-optie-${optie.naam.replace(/\s+/g, "-").toLowerCase()}`}>
            <CardHeader className="pb-2 pt-4 px-5 flex flex-row flex-wrap items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm" data-testid="text-optie-naam">
                  {optie.naam}
                </h2>
              </div>
              <Badge
                variant="outline"
                className={`text-xs flex-shrink-0 ${CATEGORIE_KLEUREN[optie.categorie]}`}
                data-testid="badge-categorie"
              >
                {optie.categorie}
              </Badge>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed" data-testid="text-optie-beschrijving">
                {optie.beschrijving}
              </p>
              <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5" data-testid="text-optie-bedrag">
                  <Euro className="w-3.5 h-3.5 flex-shrink-0" />
                  {optie.bedrag}
                </span>
                <span className="flex items-center gap-1.5" data-testid="text-optie-doelgroep">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  {optie.doelgroep}
                </span>
              </div>
              <Button variant="outline" size="sm" asChild data-testid="button-meer-info">
                <a href={optie.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Meer informatie
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Helpblok onderaan */}
      {gefilterd.length > 0 && (
        <Card className="mt-8 mb-2">
          <CardContent className="pt-5 pb-5 flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Hulp nodig bij het aanvragen?</p>
              <p className="text-xs leading-relaxed">
                Het{" "}
                <a
                  href="https://www.rvo.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  RVO-ondernemersloket
                </a>{" "}
                en de{" "}
                <a
                  href="https://www.kvk.nl/financiering"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  KVK Financieringsdesk
                </a>{" "}
                helpen je bij het vinden en aanvragen van passende financiering.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
