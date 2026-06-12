import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Zap,
  Globe,
  Users,
  Leaf,
  Bot,
  Building2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { IntelSignaal, OndernemerThema } from "@shared/schema";

type FilterKey = "alle" | "wetgeving" | "beleid" | "financieel" | "subsidies";

const BRONNEN = [
  {
    id: "wetgeving",
    label: "Wetgeving",
    icon: Gavel,
    omschrijving: "Rijkswetgeving en officieel nieuws van Rijksoverheid.nl, AMvB's en ministeriële regelingen die jouw sector raken",
    kleur: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: "beleid",
    label: "Beleid & overheid",
    icon: MapPin,
    omschrijving: "Persberichten van de Rijksoverheid, gemeentelijk en provinciaal beleid en raadsbesluiten",
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
  beleid: "Beleid & overheid",
  financieel: "Financieel",
  subsidies: "Subsidies",
};

// ── Stijl-configuratie per thema (frontend-only) ─────────────────────────────
type TagVariant = "destructive" | "secondary" | "outline";

type ThemaStijl = {
  icon: LucideIcon;
  kleur: string;
  bg: string;
  tagVariant: TagVariant;
  fallbackTag: string;
  fallbackSamenvatting: string;
  fallbackActies: string[];
};

const THEMA_STIJL: Record<string, ThemaStijl> = {
  energie: {
    icon: Zap,
    kleur: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    tagVariant: "destructive",
    fallbackTag: "Hoog impact",
    fallbackSamenvatting:
      "De energieprijzen blijven volatiel en de EU-doelstellingen uit Agenda 2030 verplichten ondernemers stapsgewijs te verduurzamen. Energiekosten zijn voor veel mkb-bedrijven nu de grootste kostenpost na personeel.",
    fallbackActies: [
      "Vraag een energie-audit aan via RVO — kosteloos voor mkb",
      "Dien vóór de deadline subsidie aan voor zonnepanelen of isolatie (ISDE-regeling)",
      "Check of jouw pand voldoet aan energielabel C-verplichting voor kantoren (2023+)",
    ],
  },
  regelgeving: {
    icon: Globe,
    kleur: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    tagVariant: "secondary",
    fallbackTag: "Nieuwe verplichtingen",
    fallbackSamenvatting:
      "De Corporate Sustainability Reporting Directive (CSRD) en andere EU-wetgeving uit het Fit for 55-pakket raken steeds meer bedrijven. Ketenverantwoordelijkheid (CSDDD) verplicht je ook te rapporteren over leveranciers.",
    fallbackActies: [
      "Controleer of jouw bedrijf al onder CSRD-rapportageplicht valt (>250 medewerkers of mkb-keten)",
      "Inventariseer je CO₂-uitstoot in scope 1, 2 en 3",
      "Stel een duurzaamheidsplan op als onderdeel van je bedrijfsstrategie",
    ],
  },
  arbeidsmarkt: {
    icon: Users,
    kleur: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    tagVariant: "secondary",
    fallbackTag: "Actueel",
    fallbackSamenvatting:
      "Personeelstekorten zijn structureel. De WTTA verandert de spelregels voor uitzendkrachten. Tegelijk verhogen gemeenten het minimumloon en groeien de cao-loonstijgingen.",
    fallbackActies: [
      "Bereken de impact van WTTA op jouw inleenconstructies (start 2025)",
      "Verken samenwerkingen met regionale onderwijsinstellingen voor stagiairs en BBL-ers",
      "Bekijk of je in aanmerking komt voor SLIM-subsidie voor personeelsontwikkeling",
    ],
  },
  ai: {
    icon: Bot,
    kleur: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    tagVariant: "outline",
    fallbackTag: "Kans",
    fallbackSamenvatting:
      "De EU AI Act treedt gefaseerd in werking tot 2026. Voor mkb biedt AI concrete kansen in klantenservice, planning en marketing. Tegelijk zijn er verplichtingen rondom transparantie en menselijk toezicht.",
    fallbackActies: [
      "Identificeer 1-3 processen in je bedrijf waarbij AI direct tijd bespaart",
      "Check of jouw AI-toepassingen onder de 'hoog-risico' categorie van de AI Act vallen",
      "Volg de AI-cursussen via Digitaliseringshulp.nl (KVK-initiatief)",
    ],
  },
  circulair: {
    icon: Leaf,
    kleur: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    tagVariant: "outline",
    fallbackTag: "Kans",
    fallbackSamenvatting:
      "Gemeenten zijn wettelijk verplicht een groeiend deel van hun inkopen circulair te doen. Dit creëert concrete opdrachten voor lokale ondernemers. De nationale Circulaire Economie-strategie 2050 stuurt op halvering van grondstoffengebruik.",
    fallbackActies: [
      "Registreer je bedrijf bij lokale circulaire samenwerkingsverbanden",
      "Bekijk aanbestedingen.nl op circulaire opdrachten in jouw regio",
      "Verken productleasen of terugnameregelingen als nieuw businessmodel",
    ],
  },
  financiering: {
    icon: Building2,
    kleur: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    tagVariant: "secondary",
    fallbackTag: "Let op",
    fallbackSamenvatting:
      "Hogere rentes maken bancaire financiering duurder. Tegelijk zijn er gerichte fondsen voor verduurzaming en innovatie. Inflatie heeft de kostprijs van veel bedrijven structureel verhoogd.",
    fallbackActies: [
      "Vraag een groeigesprek aan bij jouw bank of Qredits (mkb-financier)",
      "Verken BMKB-Groen voor gegarandeerde leningen voor duurzame investeringen",
      "Analyseer je marges opnieuw — inflatieprik in kosten vereist prijsherziening",
    ],
  },
};

const THEMA_VOLGORDE = ["energie", "regelgeving", "arbeidsmarkt", "ai", "circulair", "financiering"];

type MergedThema = {
  themaId: string;
  titel: string;
  tag: string;
  tagVariant: TagVariant;
  samenvatting: string;
  acties: string[];
  icon: LucideIcon;
  kleur: string;
  bg: string;
  bijgewerktOp?: Date | string | null;
  isAI: boolean;
};

function tagVariantForLabel(tag: string): TagVariant {
  if (tag.toLowerCase().includes("hoog") || tag.toLowerCase().includes("urgent")) return "destructive";
  if (tag.toLowerCase().includes("kans")) return "outline";
  return "secondary";
}

function mergeThemas(dbThemas: OndernemerThema[]): MergedThema[] {
  const dbMap = new Map(dbThemas.map((t) => [t.themaId, t]));
  return THEMA_VOLGORDE.map((id) => {
    const stijl = THEMA_STIJL[id];
    const db = dbMap.get(id);
    if (db) {
      return {
        themaId: id,
        titel: db.titel,
        tag: db.tag,
        tagVariant: tagVariantForLabel(db.tag),
        samenvatting: db.samenvatting,
        acties: db.acties,
        icon: stijl.icon,
        kleur: stijl.kleur,
        bg: stijl.bg,
        bijgewerktOp: db.bijgewerktOp,
        isAI: true,
      };
    }
    return {
      themaId: id,
      titel: id === "energie" ? "Energietransitie & kosten"
        : id === "regelgeving" ? "EU-regelgeving & duurzaamheidsrapportage"
        : id === "arbeidsmarkt" ? "Arbeidsmarkt & personeel"
        : id === "ai" ? "AI & digitalisering"
        : id === "circulair" ? "Circulaire economie & lokaal inkopen"
        : "Financiering & inflatie",
      tag: stijl.fallbackTag,
      tagVariant: stijl.tagVariant,
      samenvatting: stijl.fallbackSamenvatting,
      acties: stijl.fallbackActies,
      icon: stijl.icon,
      kleur: stijl.kleur,
      bg: stijl.bg,
      bijgewerktOp: null,
      isAI: false,
    };
  });
}

function ThemaCard({ thema }: { thema: MergedThema }) {
  const [open, setOpen] = useState(false);
  const Icon = thema.icon;

  const bijgewerktLabel = thema.bijgewerktOp
    ? new Date(thema.bijgewerktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <Card
      data-testid={`card-thema-${thema.themaId}`}
      className="cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${thema.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${thema.kleur}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={thema.tagVariant} className="text-xs">{thema.tag}</Badge>
              {thema.isAI && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="h-2.5 w-2.5" />
                  AI
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-snug">{thema.titel}</h3>
            {bijgewerktLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">Bijgewerkt op {bijgewerktLabel}</p>
            )}
          </div>
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{thema.samenvatting}</p>
        {open && (
          <div className="pt-2 border-t space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wat kun jij nu doen?</p>
            <ul className="space-y-2">
              {thema.acties.map((actie, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <div className={`w-5 h-5 rounded-full ${thema.bg} flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${thema.kleur}`}>
                    {i + 1}
                  </div>
                  {actie}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
              <Link href="/regiobot" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" data-testid={`button-thema-regiobot-${thema.themaId}`}>
                  Stel een vraag via RegioBot
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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

  const { data: dbThemas } = useQuery<OndernemerThema[]>({
    queryKey: ["/api/intel/themas"],
    staleTime: 1000 * 60 * 60, // 1 uur cache
  });

  const gefilterdeSignalen = signalen ?? [];
  const themaLijst = mergeThemas(dbThemas ?? []);

  const formatDatum = (dateVal: string | Date) =>
    new Date(dateVal).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-6">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-7 text-white shadow-lg md:p-9"
        data-testid="section-intel-hero"
      >
        <div className="flex items-center gap-2 mb-4">
          <Landmark className="h-4 w-4 opacity-75" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            OpenRegio Intel
          </span>
        </div>
        <h1 className="text-2xl font-black leading-tight tracking-tight md:text-4xl text-white">
          Wat speelt er voor ondernemers?
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75 md:text-base">
          Grote trends en beleidswijzigingen vertaald naar concrete impact voor jouw bedrijf — van energietransitie en EU-regelgeving tot arbeidsmarkt en digitalisering.
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

      {/* ── Thema's voor ondernemers ─────────────────────────────────────────── */}
      <section data-testid="section-themas">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">Thema's die spelen voor ondernemers</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
          Grote economische en beleidsmatige ontwikkelingen, vertaald naar concrete impact voor jouw bedrijf. Klik een thema aan voor praktische actiepunten.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {themaLijst.map((thema) => (
            <ThemaCard key={thema.themaId} thema={thema} />
          ))}
        </div>
      </section>

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
              const photoUrl = signaal.photoUrl;

              return (
                <div
                  key={signaal.id}
                  className="rounded-3xl bg-card border p-5"
                  data-testid={`card-signaal-${signaal.id}`}
                >
                  <div className="flex items-start gap-4">
                    {photoUrl ? (
                      <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <img
                          src={photoUrl}
                          alt={signaal.titel}
                          className="w-full h-full object-cover"
                          data-testid={`img-signaal-${signaal.id}`}
                        />
                      </div>
                    ) : bronConfig ? (
                      <div
                        className={`w-10 h-10 rounded-xl ${bronConfig.bg} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <bronConfig.icon className={`h-5 w-5 ${bronConfig.kleur}`} />
                      </div>
                    ) : null}
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
