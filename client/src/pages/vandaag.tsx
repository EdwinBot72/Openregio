import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IntelSignaal } from "@shared/schema";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Euro,
  FileText,
  Globe,
  Landmark,
  MapPin,
  Newspaper,
  Scale,
  Sparkles,
  TrendingUp,
  Zap,
  Circle,
  CalendarDays,
} from "lucide-react";
import {
  SECTOR_CONFIG,
  SECTOR_TILES,
  type SectorKey,
} from "@/config/sectors";

// ─── Design tokens ───────────────────────────────────────────────────────────
const CARD = "rounded-[28px] border border-[#e4dfd2] dark:border-border bg-white dark:bg-card shadow-sm";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const uur = new Date().getHours();
  if (uur < 6) return "Goedenacht";
  if (uur < 12) return "Goedemorgen";
  if (uur < 18) return "Goedemiddag";
  return "Goedenavond";
}

function formatDatum(d: Date) {
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ─── Last-visit tracking (localStorage) ──────────────────────────────────────
const LS_KEY = "vandaag_last_visit";

function useLastVisit() {
  const prevRef = useRef<Date | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    prevRef.current = stored ? new Date(stored) : null;
    localStorage.setItem(LS_KEY, new Date().toISOString());
  }, []);
  return prevRef.current;
}

// ─── Urgency badge ────────────────────────────────────────────────────────────
function UrgentieBadge({ urgentie }: { urgentie: string }) {
  if (urgentie === "hoog") return <Badge variant="destructive" className="text-xs shrink-0">Urgent</Badge>;
  if (urgentie === "normaal") return <Badge variant="secondary" className="text-xs shrink-0">Normaal</Badge>;
  return <Badge variant="outline" className="text-xs shrink-0">Info</Badge>;
}

// ─── Category dot color ───────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  wetgeving: "bg-blue-500",
  beleid: "bg-purple-500",
  financieel: "bg-amber-500",
  subsidies: "bg-emerald-500",
};

// ─── Sector onboarding prompt ─────────────────────────────────────────────────
function SectorOnboarding() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState<SectorKey | null>(null);

  const handleKiesSector = async (key: SectorKey) => {
    setSaving(key);
    try {
      await apiRequest("PATCH", "/api/user/sector", { sector: key });
      await qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await qc.invalidateQueries({ queryKey: ["/api/intel/signalen"] });
      toast({ title: "Sector opgeslagen", description: `Je ziet nu content voor ${SECTOR_CONFIG[key].label}.` });
    } catch {
      toast({ title: "Fout", description: "Kon sector niet opslaan.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className={`${CARD} p-6`} data-testid="section-sector-onboarding">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm">In welke sector ben je actief?</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            We tonen dan de meest relevante signalen, kansen en regelgeving voor jouw branche.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SECTOR_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.key}
              onClick={() => handleKiesSector(tile.key)}
              disabled={!!saving}
              data-testid={`button-sector-${tile.key}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-muted/40 hover-elevate active-elevate-2 p-4 text-center transition disabled:opacity-50"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">{tile.label}</span>
              {saving === tile.key && <span className="text-[10px] text-muted-foreground">Opslaan…</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Highlight card (top 4) ──────────────────────────────────────────────────
type HighlightCard = {
  id: string;
  kleur: string;
  icon: React.ElementType;
  label: string;
  titel: string;
  tekst: string;
  href: string;
  badge?: React.ReactNode;
};

function HighlightKaart({ kaart }: { kaart: HighlightCard }) {
  const Icon = kaart.icon;
  return (
    <Link href={kaart.href}>
      <div
        className={`${CARD} p-5 cursor-pointer hover-elevate active-elevate-2 h-full flex flex-col gap-3`}
        data-testid={`card-highlight-${kaart.id}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kaart.kleur}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          {kaart.badge}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{kaart.label}</p>
          <h3 className="font-bold text-sm leading-snug text-foreground line-clamp-2">{kaart.titel}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 line-clamp-3">{kaart.tekst}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-primary">
          <span>Bekijken</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

// ─── Quick action tile ────────────────────────────────────────────────────────
type QuickAction = {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  href: string;
  kleur: string;
  testid: string;
};

function QuickActionTile({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  return (
    <Link href={action.href}>
      <div
        className="rounded-2xl border border-border bg-card hover-elevate active-elevate-2 p-4 flex flex-col gap-2.5 cursor-pointer h-full"
        data-testid={action.testid}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.kleur}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-snug">{action.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{action.sublabel}</p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground self-end mt-auto" />
      </div>
    </Link>
  );
}

// ─── Nieuws feed item ─────────────────────────────────────────────────────────
function NieuwFeedItem({ signaal, isNieuw }: { signaal: IntelSignaal; isNieuw: boolean }) {
  const dot = CAT_COLOR[signaal.categorie] ?? "bg-muted-foreground";
  return (
    <Link href="/regels/updates">
      <div
        className="flex items-start gap-3 py-3 border-b border-border last:border-0 hover-elevate cursor-pointer px-1 rounded-md -mx-1"
        data-testid={`feed-item-${signaal.id}`}
      >
        <div className="mt-1.5 shrink-0">
          <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {isNieuw && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                Nieuw
              </span>
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {signaal.categorie}
            </span>
            {signaal.urgentie === "hoog" && (
              <UrgentieBadge urgentie="hoog" />
            )}
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{signaal.titel}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{signaal.samenvatting}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      </div>
    </Link>
  );
}

// ─── Voortgangsblok ────────────────────────────────────────────────────────────
type ProfielData = {
  naam?: string;
  beschrijving?: string;
  website?: string;
  telefoon?: string;
  adres?: string;
  kvkNummer?: string;
  regio?: string;
};

type CursusItem = {
  id: string;
  title: string;
  completed: boolean;
  minutes: number;
  daysLeft: number;
};

function VoortgangsBlok({
  profiel,
  cursusItems,
  intelAantal,
}: {
  profiel: ProfielData | null | undefined;
  cursusItems: CursusItem[];
  intelAantal: number;
}) {
  const velden: (keyof ProfielData)[] = ["naam", "beschrijving", "website", "telefoon", "adres", "kvkNummer"];
  const ingevuld = profiel ? velden.filter((v) => !!profiel[v]).length : 0;
  const profielPct = Math.round((ingevuld / velden.length) * 100);

  const actiesTotaal = cursusItems.length;
  const actiesGedaan = cursusItems.filter((i) => i.completed).length;

  const stats = [
    {
      icon: Building2,
      label: "Bedrijfsprofiel",
      value: `${profielPct}%`,
      sub: profielPct < 100 ? "Nog niet compleet" : "Compleet",
      href: "/groei/profiel",
      testid: "stat-profiel",
    },
    {
      icon: Zap,
      label: "Acties deze week",
      value: `${actiesGedaan}/${actiesTotaal}`,
      sub: actiesGedaan === actiesTotaal && actiesTotaal > 0 ? "Alles gedaan!" : "Nog te doen",
      href: "/vandaag/acties",
      testid: "stat-acties",
    },
    {
      icon: Newspaper,
      label: "Signalen beschikbaar",
      value: String(intelAantal),
      sub: "Bekijk updates",
      href: "/regels/updates",
      testid: "stat-signalen",
    },
  ];

  return (
    <div className={`${CARD} p-6`} data-testid="section-voortgang">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="font-bold text-sm text-foreground">Jouw voortgang</h2>
        </div>
        <Link href="/account/voortgang">
          <button className="text-xs font-semibold text-primary hover:underline" data-testid="link-voortgang">
            Alles bekijken
          </button>
        </Link>
      </div>

      {/* Profiel progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Profiel compleetheid</span>
          <span className="font-semibold text-foreground">{profielPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden" data-testid="bar-profiel-pct">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${profielPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.href} key={stat.testid}>
              <div
                className="rounded-2xl border border-border bg-muted/30 hover-elevate p-3 cursor-pointer text-center"
                data-testid={stat.testid}
              >
                <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-base font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] font-semibold text-muted-foreground leading-tight">{stat.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VandaagPage() {
  usePageTitle("Vandaag");
  const { user, isLoading: authLoading } = useAuth();
  const lastVisit = useLastVisit();

  const { data: profiel } = useQuery<ProfielData | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const { data: intelSignalen = [], isLoading: intelLoading } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen"],
    enabled: !!user,
  });

  const { data: cursusData, isLoading: cursusLoading } = useQuery<{ today: string; items: CursusItem[]; totaal: number }>({
    queryKey: ["/api/cursussen"],
    enabled: !!user,
  });

  const cursusItems = cursusData?.items ?? [];

  if (authLoading) {
    return (
      <div className="space-y-5 pb-8" data-testid="skeleton-vandaag">
        <Skeleton className="h-44 w-full rounded-[28px]" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-44 rounded-[28px]" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-[28px] lg:col-span-2" />
          <Skeleton className="h-64 rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ── Compute derived data ─────────────────────────────────────────────────

  const displayName = user.firstName || profiel?.naam || user.businessName || "ondernemer";
  const hasSector = !!user.sector;
  const sectorConfig = (hasSector && user.sector && user.sector in SECTOR_CONFIG)
    ? SECTOR_CONFIG[user.sector as SectorKey]
    : null;

  // Prioritize by urgentie: hoog first
  const signaalenGesoorteerd = [...intelSignalen].sort((a, b) => {
    const ord = { hoog: 0, normaal: 1, info: 2 };
    return (ord[a.urgentie as keyof typeof ord] ?? 2) - (ord[b.urgentie as keyof typeof ord] ?? 2);
  });

  const hoogsteSignaal = signaalenGesoorteerd[0] ?? null;
  const risicoSignaal = signaalenGesoorteerd.find((s) => s.urgentie === "hoog") ?? signaalenGesoorteerd[1] ?? null;

  // Eerste onvoltooide cursus
  const eersteActie = cursusItems.find((i) => !i.completed) ?? cursusItems[0] ?? null;

  // ── Build highlight cards ────────────────────────────────────────────────

  const highlightCards: HighlightCard[] = [
    {
      id: "signaal",
      kleur: "bg-blue-500",
      icon: Bell,
      label: "Belangrijkste update",
      titel: hoogsteSignaal?.titel ?? "Geen actieve signalen",
      tekst: hoogsteSignaal?.samenvatting ?? "Je bent helemaal bijgewerkt. Kijk later terug voor nieuwe updates.",
      href: "/regels/updates",
      badge: hoogsteSignaal ? <UrgentieBadge urgentie={hoogsteSignaal.urgentie} /> : undefined,
    },
    {
      id: "kans",
      kleur: "bg-emerald-500",
      icon: TrendingUp,
      label: "Kansen voor jou",
      titel: "Bekijk actuele opdrachten en subsidies",
      tekst: sectorConfig
        ? `Actuele aanbestedingen, subsidies en lokale kansen voor ${sectorConfig.label}-ondernemers in jouw regio.`
        : "Ontdek aanbestedingen, subsidies en lokale kansen die voor jouw bedrijf interessant zijn.",
      href: "/kansen/opdrachten",
    },
    {
      id: "actie",
      kleur: "bg-violet-500",
      icon: Zap,
      label: "Actie van 5 minuten",
      titel: eersteActie?.title ?? "Geen open acties",
      tekst: eersteActie
        ? `${eersteActie.minutes} min · nog ${eersteActie.daysLeft} ${eersteActie.daysLeft === 1 ? "dag" : "dagen"} beschikbaar`
        : "Je hebt alle acties voor deze week voltooid. Kom snel terug.",
      href: "/vandaag/acties",
      badge: eersteActie && !eersteActie.completed
        ? <Badge variant="outline" className="text-xs shrink-0">{eersteActie.minutes} min</Badge>
        : eersteActie?.completed
        ? (
          <span className="flex items-center gap-1 text-xs text-primary font-semibold shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Gedaan
          </span>
        )
        : undefined,
    },
    {
      id: "risico",
      kleur: risicoSignaal?.urgentie === "hoog" ? "bg-rose-500" : "bg-amber-500",
      icon: AlertTriangle,
      label: "Let op",
      titel: risicoSignaal?.titel ?? "Geen risicosignalen",
      tekst: risicoSignaal?.samenvatting ?? "Er zijn momenteel geen urgente signalen voor jouw sector.",
      href: "/regels/updates",
      badge: risicoSignaal ? <UrgentieBadge urgentie={risicoSignaal.urgentie} /> : undefined,
    },
  ];

  // ── Quick actions ────────────────────────────────────────────────────────

  const quickActions: QuickAction[] = [
    {
      icon: Newspaper,
      label: "Regelgeving updates",
      sublabel: "Wat is er veranderd?",
      href: "/regels/updates",
      kleur: "bg-blue-500",
      testid: "quick-regels-updates",
    },
    {
      icon: Landmark,
      label: "Opdrachten & aanbestedingen",
      sublabel: "Open aanbestedingen bekijken",
      href: "/kansen/opdrachten",
      kleur: "bg-emerald-500",
      testid: "quick-opdrachten",
    },
    {
      icon: Euro,
      label: "Subsidies & financiering",
      sublabel: "Beschikbare subsidies",
      href: "/kansen/subsidies",
      kleur: "bg-amber-500",
      testid: "quick-subsidies",
    },
    {
      icon: Scale,
      label: "Raakt dit mijn bedrijf?",
      sublabel: "Check wet- en regelgeving",
      href: "/regels/check",
      kleur: "bg-violet-500",
      testid: "quick-check",
    },
    {
      icon: MapPin,
      label: "Kansen in de buurt",
      sublabel: "Lokale kansen in jouw gemeente",
      href: "/kansen/in-de-buurt",
      kleur: "bg-rose-500",
      testid: "quick-buurt",
    },
    {
      icon: FileText,
      label: "Document analyseren",
      sublabel: "Brief of besluit begrijpen",
      href: "/regels/documenten",
      kleur: "bg-slate-500",
      testid: "quick-documenten",
    },
  ];

  // ── Feed: nieuw since last visit ────────────────────────────────────────

  const feedSignalen = signaalenGesoorteerd.slice(0, 6);
  const isNieuwFn = (s: IntelSignaal) =>
    lastVisit && s.createdAt ? new Date(s.createdAt) > lastVisit : false;
  const nieuwCount = feedSignalen.filter(isNieuwFn).length;

  return (
    <div className="space-y-5 pb-8" data-testid="page-vandaag">

      {/* ── Sector onboarding prompt ─────────────────────────────────────── */}
      {!hasSector && <SectorOnboarding />}

      {/* ── Hero greeting ────────────────────────────────────────────────── */}
      <section
        className="overflow-hidden rounded-[28px] p-7 text-white"
        style={{ background: "linear-gradient(135deg, #0f2347 0%, #1a3666 55%, #1e4a8c 100%)" }}
        data-testid="section-greeting"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90" data-testid="badge-plan">
                {user.plan === "pro" ? "Pro-lid" : "Basis-lid"}
              </span>
              {sectorConfig && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90" data-testid="badge-sector">
                  {sectorConfig.label}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black leading-tight text-white md:text-3xl" data-testid="text-greeting">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-white/70 text-sm mt-1" data-testid="text-datum">
              {formatDatum(new Date())}
            </p>
          </div>

          {/* Signalen samenvatting */}
          {!intelLoading && (
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center min-w-[100px]" data-testid="stat-hero-signalen">
              <p className="text-2xl font-black text-white">{intelSignalen.length}</p>
              <p className="text-xs text-white/70 font-medium">signalen</p>
              {intelSignalen.filter((s) => s.urgentie === "hoog").length > 0 && (
                <p className="text-[10px] text-rose-300 font-semibold mt-0.5">
                  {intelSignalen.filter((s) => s.urgentie === "hoog").length} urgent
                </p>
              )}
            </div>
          )}
        </div>

        {/* Snelle navigatie knoppen */}
        <div className="flex flex-wrap gap-2 mt-5">
          <Link href="/regels/updates">
            <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="btn-hero-updates">
              <Bell className="h-3.5 w-3.5 mr-1.5" />
              Updates
            </Button>
          </Link>
          <Link href="/vandaag/acties">
            <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="btn-hero-acties">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Acties{cursusItems.length > 0 && ` (${cursusItems.filter(i => !i.completed).length})`}
            </Button>
          </Link>
          <Link href="/groei/profiel">
            <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="btn-hero-profiel">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Profiel
            </Button>
          </Link>
        </div>
      </section>

      {/* ── 4 Highlight cards ────────────────────────────────────────────── */}
      <section data-testid="section-highlights">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {intelLoading || cursusLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-44 rounded-[28px]" />
            ))
          ) : (
            highlightCards.map((kaart) => (
              <HighlightKaart key={kaart.id} kaart={kaart} />
            ))
          )}
        </div>
      </section>

      {/* ── Snelle acties ────────────────────────────────────────────────── */}
      <section data-testid="section-quick-actions">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold text-sm text-foreground">Snel naar</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => (
            <QuickActionTile key={action.testid} action={action} />
          ))}
        </div>
      </section>

      {/* ── Feed + Voortgang (2 kolommen op breed scherm) ─────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Feed: recente signalen */}
        <section className={`${CARD} p-6 lg:col-span-2`} data-testid="section-feed">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-foreground">
                Recente updates
                {nieuwCount > 0 && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {nieuwCount} nieuw
                  </span>
                )}
              </h2>
            </div>
            <Link href="/regels/updates">
              <button className="text-xs font-semibold text-primary hover:underline" data-testid="link-alle-updates">
                Alles bekijken
              </button>
            </Link>
          </div>

          {intelLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : feedSignalen.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nog geen updates beschikbaar.</p>
            </div>
          ) : (
            <div>
              {feedSignalen.map((s) => (
                <NieuwFeedItem key={s.id} signaal={s} isNieuw={isNieuwFn(s)} />
              ))}
            </div>
          )}
        </section>

        {/* Voortgangsblok */}
        <VoortgangsBlok
          profiel={profiel}
          cursusItems={cursusItems}
          intelAantal={intelSignalen.length}
        />
      </div>

    </div>
  );
}
