import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gavel,
  Landmark,
  TrendingUp,
  Banknote,
  Bell,
  ArrowRight,
  Clock,
  ExternalLink,
  AlertTriangle,
  Info,
  Lightbulb,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { IntelSignaal } from "@shared/schema";

type FilterKey = "alle" | "wetgeving" | "beleid" | "financieel" | "subsidies";

const BRONNEN = [
  {
    id: "wetgeving",
    label: "Wetgeving",
    icon: Gavel,
    omschrijving: "Rijkswetgeving, AMvB's en ministeriële regelingen die jouw sector raken",
    kleur: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: "beleid",
    label: "Lokaal beleid",
    icon: MapPin,
    omschrijving: "Gemeentelijk en provinciaal beleid, verordeningen en raadsbesluiten",
    kleur: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    id: "financieel",
    label: "Financieel",
    icon: TrendingUp,
    omschrijving: "Fiscale wijzigingen, tariefsverhogingen en financiële randvoorwaarden",
    kleur: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    id: "subsidies",
    label: "Subsidies",
    icon: Banknote,
    omschrijving: "Nieuwe subsidieregelingen, fondsen en aanvraagperioden",
    kleur: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
  },
];

const URGENTIE_CONFIG = {
  hoog: { label: "Urgent", variant: "destructive" as const, icon: AlertTriangle },
  normaal: { label: "Actueel", variant: "secondary" as const, icon: Bell },
  info: { label: "Info", variant: "outline" as const, icon: Info },
};

const STAPPEN = [
  {
    nr: "1",
    titel: "Signalen verzameld",
    tekst: "OpenRegio monitort dagelijks overheidskanalen, publicatiebladen en gemeentewebsites op relevante wijzigingen.",
  },
  {
    nr: "2",
    titel: "Gefilterd voor jouw regio",
    tekst: "Alleen signalen die relevant zijn voor ondernemers in jouw regio en sector worden doorgestuurd.",
  },
  {
    nr: "3",
    titel: "Actie en follow-up",
    tekst: "Via RegioBot kun je direct vragen stellen over een signaal of een Woo-verzoek opstellen voor meer informatie.",
  },
];

function SignaalSkeleton() {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-4">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IntelPage() {
  const { user } = useAuth();
  const [actieveFilter, setActieveFilter] = useState<FilterKey>("alle");

  const queryParams = actieveFilter !== "alle" ? `?categorie=${actieveFilter}` : "";
  const { data: signalen, isLoading, isError } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen", actieveFilter],
    queryFn: () => fetch(`/api/intel/signalen${queryParams}`).then((r) => r.json()),
  });

  const gefilterdeSignalen = signalen ?? [];

  const formatDatum = (dateVal: string | Date) =>
    new Date(dateVal).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">OpenRegio Intel</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-accent mb-3">
            Altijd op de hoogte van wat telt
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Regelgeving, lokaal beleid, subsidies en financiële wijzigingen — gefilterd op jouw regio en direct toepasbaar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/regiobot">
              <Button variant="secondary" data-testid="button-intel-regiobot">
                Stel een vraag via RegioBot
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/woo-wizard">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="button-intel-woo">
                Woo-verzoek opstellen
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bronblokken */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Wat volgen we voor jou?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BRONNEN.map((bron) => (
            <Card
              key={bron.id}
              className="cursor-pointer hover-elevate"
              onClick={() => setActieveFilter(bron.id as FilterKey)}
              data-testid={`card-bron-${bron.id}`}
            >
              <CardContent className="p-4 space-y-2">
                <div className={`w-10 h-10 rounded-lg ${bron.bg} flex items-center justify-center`}>
                  <bron.icon className={`h-5 w-5 ${bron.kleur}`} />
                </div>
                <p className="font-semibold text-sm">{bron.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{bron.omschrijving}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Signalen */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold">Actuele signalen</h2>
          <div className="flex gap-2 flex-wrap" data-testid="filter-chips">
            {(["alle", "wetgeving", "beleid", "financieel", "subsidies"] as FilterKey[]).map((filter) => {
              const labels: Record<FilterKey, string> = {
                alle: "Alle",
                wetgeving: "Wetgeving",
                beleid: "Beleid",
                financieel: "Financieel",
                subsidies: "Subsidies",
              };
              return (
                <Button
                  key={filter}
                  size="sm"
                  variant={actieveFilter === filter ? "default" : "outline"}
                  onClick={() => setActieveFilter(filter)}
                  data-testid={`filter-chip-${filter}`}
                >
                  {labels[filter]}
                </Button>
              );
            })}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => <SignaalSkeleton key={n} />)}
          </div>
        )}

        {isError && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Kon signalen niet laden. Probeer het later opnieuw.</p>
          </Card>
        )}

        {!isLoading && !isError && gefilterdeSignalen.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Geen signalen gevonden voor dit filter.</p>
          </Card>
        )}

        {!isLoading && !isError && gefilterdeSignalen.length > 0 && (
          <div className="space-y-4">
            {gefilterdeSignalen.map((signaal) => {
              const urgentie = (signaal.urgentie ?? "normaal") as keyof typeof URGENTIE_CONFIG;
              const urgentieConfig = URGENTIE_CONFIG[urgentie] ?? URGENTIE_CONFIG.normaal;
              const UrgentieIcon = urgentieConfig.icon;
              const bronConfig = BRONNEN.find((b) => b.id === signaal.categorie);

              return (
                <Card key={signaal.id} data-testid={`card-signaal-${signaal.id}`}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      {bronConfig && (
                        <div className={`w-10 h-10 rounded-lg ${bronConfig.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <bronConfig.icon className={`h-5 w-5 ${bronConfig.kleur}`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant={urgentieConfig.variant} className="text-xs gap-1" data-testid={`badge-urgentie-${signaal.id}`}>
                            <UrgentieIcon className="h-3 w-3" />
                            {urgentieConfig.label}
                          </Badge>
                          {bronConfig && (
                            <Badge variant="outline" className="text-xs">
                              {bronConfig.label}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {signaal.regio}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDatum(signaal.datum)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base mb-1" data-testid={`text-signaal-titel-${signaal.id}`}>
                          {signaal.titel}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-signaal-samenvatting-${signaal.id}`}>
                          {signaal.samenvatting}
                        </p>
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <span className="text-xs text-muted-foreground">Bron: {signaal.bron}</span>
                          {signaal.bronUrl && (
                            <a
                              href={signaal.bronUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              data-testid={`link-bron-${signaal.id}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Bron bekijken
                            </a>
                          )}
                          <Link href="/regiobot">
                            <button
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                              data-testid={`button-vraag-regiobot-${signaal.id}`}
                            >
                              <ChevronRight className="h-3 w-3" />
                              Vraag RegioBot
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Hoe werkt het */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-primary" />
              Hoe werkt OpenRegio Intel?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {STAPPEN.map((stap) => (
                <div key={stap.nr} className="flex items-start gap-4" data-testid={`stap-${stap.nr}`}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                    {stap.nr}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{stap.titel}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{stap.tekst}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA voor niet-pro leden */}
      {user && user.plan === "basic" && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Meer uit Intel halen?</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Upgrade naar Pro voor directe signaalnotificaties, persoonlijke regio-filters en onbeperkte RegioBot-vragen over signalen.
                </p>
                <Link href="/lidmaatschap?plan=pro">
                  <Button size="sm" data-testid="button-intel-upgrade">
                    Bekijk Pro-abonnement
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
