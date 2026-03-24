import { useMemo, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react";

type Urgentie = "Hoog" | "Gemiddeld" | "Laag";

type KansKaart = {
  id: number;
  regio: string;
  titel: string;
  waarom: string;
  voorWie: string[];
  kans: string;
  urgentie: Urgentie;
};

const KANSEN: KansKaart[] = [
  {
    id: 1,
    regio: "Haarlem & omgeving",
    titel: "Veel vraag naar websitehulp",
    waarom:
      "Steeds meer ondernemers willen beter gevonden worden, maar sterk lokaal aanbod is nog beperkt zichtbaar.",
    voorWie: ["Webbouwers", "Marketeers", "Fotografen"],
    kans: "Bied een snelle websitescan of opfrisbeurt aan voor lokale ondernemers.",
    urgentie: "Hoog",
  },
  {
    id: 2,
    regio: "Haarlem & omgeving",
    titel: "Ondernemers zoeken hulp met brieven",
    waarom:
      "Veel ondernemers lopen vast op officiële brieven, formulieren en onduidelijke communicatie.",
    voorWie: ["Ondersteuners", "Schrijvers", "Adviseurs"],
    kans: "Bied praktische uitleg of hulp bij documenten zonder juridisch gedoe.",
    urgentie: "Gemiddeld",
  },
  {
    id: 3,
    regio: "Haarlem & omgeving",
    titel: "Lokale samenwerking blijft liggen",
    waarom:
      "Er is behoefte aan samenwerking, maar concrete matches en acties komen niet vanzelf op gang.",
    voorWie: ["Lokale ondernemers", "Organisatoren", "Verbinders"],
    kans: "Start een lokale actie, bundel of samenwerkingsaanbod.",
    urgentie: "Gemiddeld",
  },
  {
    id: 4,
    regio: "Alkmaar & omgeving",
    titel: "Vraag naar digitale hulp groeit",
    waarom:
      "Kleine ondernemers zoeken vaker hulp bij websites, reviews en online zichtbaarheid.",
    voorWie: ["Freelancers", "Bureaus", "VA's"],
    kans: "Bied maandelijkse hulp of een laagdrempelige instapservice aan.",
    urgentie: "Hoog",
  },
  {
    id: 5,
    regio: "Alkmaar & omgeving",
    titel: "Meer behoefte aan lokale promotie",
    waarom:
      "Ondernemers willen beter zichtbaar zijn, maar missen vaak een simpele regionale aanpak.",
    voorWie: ["Marketeers", "Contentmakers", "Ontwerpers"],
    kans: "Bied lokale zichtbaarheidspakketten of reviewhulp aan.",
    urgentie: "Gemiddeld",
  },
  {
    id: 6,
    regio: "Wormer & omgeving",
    titel: "Praktische ondernemershulp blijft schaars",
    waarom:
      "Voor kleine ondernemers is directe hulp bij websites, formulieren en zichtbaarheid niet altijd makkelijk te vinden.",
    voorWie: ["Allround ondersteuners", "Webhelpers", "Freelancers"],
    kans: "Positioneer jezelf als snelle, duidelijke hulp in de buurt.",
    urgentie: "Hoog",
  },
  {
    id: 7,
    regio: "Wormer & omgeving",
    titel: "Vraag & aanbod komt niet goed samen",
    waarom:
      "Ondernemers zoeken lokaal contact, maar veel kansen blijven versnipperd en onzichtbaar.",
    voorWie: ["Verbinders", "Lokale initiatieven", "Ondernemersnetwerken"],
    kans: "Breng vraag en aanbod lokaal samen met een simpele regionale actie.",
    urgentie: "Gemiddeld",
  },
];

const REGIO_S = ["Haarlem & omgeving", "Alkmaar & omgeving", "Wormer & omgeving"];

const UITLEG = [
  {
    icon: TrendingUp,
    label: "Wat je hier ziet",
    titel: "Kansen die opvallen",
    tekst:
      "Geen ruis, maar signalen waar je als ondernemer direct iets mee kunt.",
  },
  {
    icon: Users,
    label: "Voor wie",
    titel: "Ondernemers die willen groeien",
    tekst:
      "Handig als je beter zichtbaar wilt zijn, lokale kansen wilt pakken of samenwerkingen zoekt.",
  },
  {
    icon: Zap,
    label: "Wat je ermee kunt",
    titel: "Direct schakelen",
    tekst:
      "Gebruik deze signalen om een dienst aan te bieden, lokaal contact te leggen of sneller in te spelen op vraag.",
  },
];

function UrgentieBadge({ urgentie }: { urgentie: Urgentie }) {
  if (urgentie === "Hoog") {
    return (
      <Badge variant="destructive" className="text-xs shrink-0">
        Hoog
      </Badge>
    );
  }
  if (urgentie === "Gemiddeld") {
    return (
      <Badge variant="secondary" className="text-xs shrink-0">
        Gemiddeld
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs shrink-0">
      Laag
    </Badge>
  );
}

export default function KansenInDeBuurtPage() {
  usePageTitle("Kansen in de buurt");
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "master";

  const [geselecteerdeRegio, setGeselecteerdeRegio] = useState(REGIO_S[0]);

  const kansen = useMemo(
    () => KANSEN.filter((k) => k.regio === geselecteerdeRegio),
    [geselecteerdeRegio]
  );

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 p-7 text-white shadow-lg md:p-9"
        data-testid="section-hero"
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 opacity-75" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Kansen in de buurt
          </span>
        </div>
        <h1 className="text-2xl font-black leading-tight tracking-tight md:text-4xl">
          Hier liggen nu kansen
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75 md:text-base">
          Zie in één oogopslag waar in jouw regio vraag groeit, waar ondernemers
          hulp zoeken en waar jij op kunt inspelen.
        </p>

        <div className="mt-6 flex flex-wrap gap-3" data-testid="regio-selector">
          {REGIO_S.map((regio) => {
            const actief = geselecteerdeRegio === regio;
            return (
              <button
                key={regio}
                onClick={() => setGeselecteerdeRegio(regio)}
                data-testid={`button-regio-${regio.split(" ")[0].toLowerCase()}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  actief
                    ? "bg-white text-slate-900"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {regio}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Uitlegblokken ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3" data-testid="section-uitleg">
        {UITLEG.map((blok) => {
          const Icon = blok.icon;
          return (
            <Card key={blok.label}>
              <CardContent className="pt-5 pb-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{blok.label}</p>
                </div>
                <p className="font-semibold text-sm">{blok.titel}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {blok.tekst}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Kansen-kaarten ───────────────────────────────────────────────────── */}
      <section data-testid="section-kansen">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold" data-testid="text-regio-naam">
              {geselecteerdeRegio}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Dit valt nu op in jouw buurt.
            </p>
          </div>
          <Link href="/intel">
            <Button variant="outline" size="sm" data-testid="button-alle-signalen">
              Alle signalen bekijken
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {kansen.map((kaart) => (
            <Card key={kaart.id} data-testid={`card-kans-${kaart.id}`}>
              <CardContent className="pt-5 pb-5 space-y-4">
                {/* Koptekst */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-base leading-snug" data-testid={`text-kans-titel-${kaart.id}`}>
                    {kaart.titel}
                  </h3>
                  <UrgentieBadge urgentie={kaart.urgentie} />
                </div>

                {/* Waarom */}
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-kans-waarom-${kaart.id}`}>
                  <span className="font-medium text-foreground">Waarom dit opvalt: </span>
                  {kaart.waarom}
                </p>

                {/* Voor wie */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Voor wie
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {kaart.voorWie.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Wat jij kunt doen */}
                <div className="rounded-xl bg-muted/50 p-4 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Wat jij kunt doen
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed" data-testid={`text-kans-actie-${kaart.id}`}>
                    {kaart.kans}
                  </p>
                </div>

                {/* Acties */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href="/lokaal-marktplaats">
                    <Button size="sm" data-testid={`button-kans-bekijk-${kaart.id}`}>
                      Inspelen op kans
                    </Button>
                  </Link>
                  <Link href="/regiocrew">
                    <Button
                      size="sm"
                      variant="outline"
                      data-testid={`button-kans-samenwerken-${kaart.id}`}
                    >
                      Samenwerken
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Afsluittekst ─────────────────────────────────────────────────────── */}
      <Card data-testid="section-info">
        <CardContent className="pt-5 pb-5">
          <h3 className="font-semibold mb-2">Snel gezien, snel gebruikt</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Deze pagina laat je zien waar beweging zit in jouw regio. Geen
            eindeloze rapporten, maar kansen die je in één oogopslag kunt lezen
            en meteen kunt gebruiken.
          </p>
        </CardContent>
      </Card>

      {/* ── Pro upgrade ───────────────────────────────────────────────────────── */}
      {!isPro && (
        <Card data-testid="section-upgrade-cta">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Meer kansen en diepere signalen zien?</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Met Pro zie je uitgebreidere kansen, meer regionale signalen en
                  slimme hulp om sneller in te spelen op wat er speelt in jouw buurt.
                </p>
                <Link href="/lidmaatschap">
                  <Button size="sm" data-testid="button-upgrade-pro">
                    Bekijk Pro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
