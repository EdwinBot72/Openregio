import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuery } from "@tanstack/react-query";
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
    tekst:
      "OpenRegio monitort dagelijks overheidskanalen, publicatiebladen en gemeentewebsites op relevante wijzigingen.",
  },
  {
    nr: "2",
    titel: "Gefilterd voor jouw regio",
    tekst:
      "Alleen signalen die relevant zijn voor ondernemers in jouw regio en sector worden doorgestuurd.",
  },
  {
    nr: "3",
    titel: "Actie en follow-up",
    tekst:
      "Via RegioBot kun je direct vragen stellen over een signaal of een Woo-verzoek opstellen voor meer informatie.",
  },
];

const FILTER_LABELS: Record<FilterKey, string> = {
  alle: "Alle",
  wetgeving: "Wetgeving",
  beleid: "Beleid",
  financieel: "Financieel",
  subsidies: "Subsidies",
};

function SignaalSkeleton() {
  return (
    <div className="rounded-3xl bg-card border p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
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
    </div>
  );
}

export default function IntelPage() {
  usePageTitle("Regio Intel");
  const { user } = useAuth();
  const [actieveFilter, setActieveFilter] = useState<FilterKey>("alle");

  const queryParams = actieveFilter !== "alle" ? `?categorie=${actieveFilter}` : "";
  const {
    data: signalen,
    isLoading,
    isError,
  } = useQuery<IntelSignaal[]>({
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
    <div className="space-y-6 pb-8">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-800 p-7 text-white shadow-lg md:p-9"
        data-testid="section-intel-hero"
      >
        <div className="flex items-center gap-2 mb-4">
          <Landmark className="h-4 w-4 opacity-75" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            OpenRegio Intel
          </span>
        </div>
        <h1 className="text-2xl font-black leading-tight tracking-tight md:text-4xl">
          Altijd op de hoogte van wat telt
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75 md:text-base">
          Regelgeving, lokaal beleid, subsidies en financiële wijzigingen — gefilterd op jouw regio en direct toepasbaar.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/regiobot">
            <button
              className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:opacity-90 active:scale-95"
              data-testid="button-intel-regiobot"
            >
              Stel een vraag via RegioBot
              <ArrowRight className="inline ml-2 h-4 w-4" />
            </button>
          </Link>
          <Link href="/woo-wizard">
            <button
              className="rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
              data-testid="button-intel-woo"
            >
              Woo-verzoek opstellen
            </button>
          </Link>
        </div>
      </div>

      {/* ── Bronblokken ──────────────────────────────────────────────────────── */}
      <section data-testid="section-bronnen">
        <h2 className="text-lg font-bold tracking-tight mb-4">Wat volgen we voor jou?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BRONNEN.map((bron) => (
            <button
              key={bron.id}
              onClick={() => setActieveFilter(bron.id as FilterKey)}
              className="rounded-3xl bg-card border p-5 text-left space-y-3 cursor-pointer hover-elevate active-elevate-2 transition-all"
              data-testid={`card-bron-${bron.id}`}
            >
              <div className={`w-10 h-10 rounded-xl ${bron.bg} flex items-center justify-center`}>
                <bron.icon className={`h-5 w-5 ${bron.kleur}`} />
              </div>
              <p className="font-semibold text-sm text-foreground">{bron.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{bron.omschrijving}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Signalen ─────────────────────────────────────────────────────────── */}
      <section data-testid="section-signalen">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold tracking-tight">Actuele signalen</h2>
          <div className="flex gap-2 flex-wrap" data-testid="filter-chips">
            {(["alle", "wetgeving", "beleid", "financieel", "subsidies"] as FilterKey[]).map(
              (filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={actieveFilter === filter ? "default" : "outline"}
                  onClick={() => setActieveFilter(filter)}
                  data-testid={`filter-chip-${filter}`}
                >
                  {FILTER_LABELS[filter]}
                </Button>
              )
            )}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <SignaalSkeleton key={n} />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-3xl bg-card border p-8 text-center">
            <p className="text-muted-foreground">Kon signalen niet laden. Probeer het later opnieuw.</p>
          </div>
        )}

        {!isLoading && !isError && gefilterdeSignalen.length === 0 && (
          <div className="rounded-3xl bg-card border p-8 text-center">
            <p className="text-muted-foreground">Geen signalen gevonden voor dit filter.</p>
          </div>
        )}

        {!isLoading && !isError && gefilterdeSignalen.length > 0 && (
          <div className="space-y-3">
            {gefilterdeSignalen.map((signaal) => {
              const urgentie = (signaal.urgentie ?? "normaal") as keyof typeof URGENTIE_CONFIG;
              const urgentieConfig = URGENTIE_CONFIG[urgentie] ?? URGENTIE_CONFIG.normaal;
              const UrgentieIcon = urgentieConfig.icon;
              const bronConfig = BRONNEN.find((b) => b.id === signaal.categorie);

              return (
                <div
                  key={signaal.id}
                  className="rounded-3xl bg-card border p-5"
                  data-testid={`card-signaal-${signaal.id}`}
                >
                  <div className="flex items-start gap-4">
                    {bronConfig && (
                      <div
                        className={`w-10 h-10 rounded-xl ${bronConfig.bg} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <bronConfig.icon className={`h-5 w-5 ${bronConfig.kleur}`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge
                          variant={urgentieConfig.variant}
                          className="text-xs gap-1"
                          data-testid={`badge-urgentie-${signaal.id}`}
                        >
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
                      <h3
                        className="font-semibold text-base mb-1"
                        data-testid={`text-signaal-titel-${signaal.id}`}
                      >
                        {signaal.titel}
                      </h3>
                      <p
                        className="text-sm text-muted-foreground leading-relaxed"
                        data-testid={`text-signaal-samenvatting-${signaal.id}`}
                      >
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
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            data-testid={`button-vraag-regiobot-${signaal.id}`}
                          >
                            <ChevronRight className="h-3 w-3" />
                            Vraag RegioBot
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Hoe werkt het ────────────────────────────────────────────────────── */}
      <section data-testid="section-hoe-werkt-het">
        <div className="rounded-3xl bg-card border p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Hoe werkt OpenRegio Intel?</h2>
          </div>
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
        </div>
      </section>

      {/* ── CTA upgrade ──────────────────────────────────────────────────────── */}
      {user && user.plan === "basic" && (
        <div className="rounded-3xl bg-card border p-6" data-testid="section-upgrade-cta">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
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
        </div>
      )}
    </div>
  );
}
