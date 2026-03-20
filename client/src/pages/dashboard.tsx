import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Download,
  UserPlus,
  Shield,
  BarChart3,
  Building2,
  TrendingUp,
  Monitor,
  FileText,
  FolderOpen,
  Gavel,
  Users,
  Share2,
  Landmark,
  Activity,
  Signal,
  ChevronRight,
  ScanText,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { IntelSignaal } from "@shared/schema";

const MODULE_CARDS = [
  {
    id: "groei",
    title: "Groei",
    subtitle: "Vergroot je zichtbaarheid in jouw regio",
    href: "/tools/website-scan",
    cta: "Open Groei",
    items: [
      { label: "Website Scan", href: "/tools/website-scan", icon: Monitor },
      { label: "Bedrijfsprofiel", href: "/bedrijfsprofiel", icon: Building2 },
      { label: "Zichtbaarheid", href: "/pro/visibility-settings", icon: Shield },
    ],
  },
  {
    id: "monitor",
    title: "Regio Monitor",
    subtitle: "Zie wat er verandert in jouw gemeente en regio",
    href: "/intel",
    cta: "Open Monitor",
    items: [
      { label: "Regio Intel", href: "/intel", icon: Signal },
      { label: "Regels & besluiten", href: "/beleidsmonitor", icon: Activity },
      { label: "Aanbestedingen", href: "/kansen/aanbestedingen", icon: Landmark },
    ],
  },
  {
    id: "actie",
    title: "Actiecentrum",
    subtitle: "Maak documenten en signalen direct bruikbaar",
    href: "/tools/brief-analyse",
    cta: "Open Acties",
    items: [
      { label: "Brief begrijpen", href: "/tools/brief-analyse", icon: ScanText },
      { label: "Mijn documenten", href: "/woo-bibliotheek", icon: FolderOpen },
      { label: "Verzoek indienen", href: "/woo-wizard", icon: Gavel },
    ],
  },
  {
    id: "netwerk",
    title: "Samenwerken",
    subtitle: "Vind deals, partners en lokale kansen",
    href: "/kansen/regio-deals",
    cta: "Open Samenwerken",
    items: [
      { label: "Regio Deals", href: "/kansen/regio-deals", icon: Landmark },
      { label: "Community", href: "/community", icon: Share2 },
      { label: "RegioCrew", href: "/regiocrew", icon: Users },
    ],
  },
] as const;

const RECENTE_ACTIES = [
  { label: "Brief begrijpen", sub: "Upload of plak een overheidsbrief", href: "/tools/brief-analyse", icon: ScanText },
  { label: "Verzoek indienen", sub: "Maak een WOO-verzoek aan", href: "/woo-wizard", icon: Gavel },
  { label: "Mijn documenten", sub: "Bekijk jouw documentenbibliotheek", href: "/woo-bibliotheek", icon: FolderOpen },
];

const FALLBACK_UPDATES = [
  { id: "u1", titel: "Nieuwe aanbesteding gepubliceerd", samenvatting: "Gemeente zoekt lokale leveranciers voor groenonderhoud", categorie: "subsidies" },
  { id: "u2", titel: "Gemeentelijke verordening aangepast", samenvatting: "Horeca- en terraspermits vereisen aanpassing per juli", categorie: "beleid" },
  { id: "u3", titel: "Openbare update verkeersmaatregelen", samenvatting: "Tijdelijke omleidingen in het centrum tot najaar", categorie: "wetgeving" },
];

const MAX_UPDATES = 3;

function categorieBadgeVariant(cat: string): "default" | "secondary" | "outline" {
  if (cat === "subsidies" || cat === "financieel") return "default";
  if (cat === "wetgeving") return "secondary";
  return "outline";
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: bedrijfsprofiel } = useQuery<{ naam: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const { data: intelSignalen = [] } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="p-6 space-y-5">
        <Skeleton className="h-52 w-full rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-52 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-52 rounded-3xl" />
          <Skeleton className="h-52 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Log opnieuw in om door te gaan.</p>
      </div>
    );
  }

  const isPro = user.plan === "pro";
  const isAdmin = user.isAdmin || false;
  const displayName = bedrijfsprofiel?.naam || user.firstName || "ondernemer";
  const signaalCount = intelSignalen.length;
  const hogeImpact = intelSignalen.filter(
    (s) => s.categorie === "wetgeving" || s.categorie === "beleid"
  ).length;
  const openTaken = intelSignalen.filter(
    (s) => s.categorie === "subsidies" || s.categorie === "financieel"
  ).length;

  const realUpdates = intelSignalen.slice(0, MAX_UPDATES).map((s) => ({
    id: String(s.id),
    titel: s.titel,
    samenvatting: s.samenvatting || s.titel,
    categorie: s.categorie,
  }));
  const updates =
    realUpdates.length >= MAX_UPDATES
      ? realUpdates
      : [
          ...realUpdates,
          ...FALLBACK_UPDATES.slice(0, MAX_UPDATES - realUpdates.length),
        ];

  return (
    <div className="space-y-6 pb-8">

      {/* ── Hero sectie ──────────────────────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-[1.6fr_0.75fr]" data-testid="section-hero">

        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-7 text-white shadow-lg md:p-9">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90">
              Vandaag starten
            </span>
            <Badge
              variant={isPro ? "default" : "outline"}
              className="text-xs border-white/30 text-white bg-white/10"
              data-testid="badge-plan"
            >
              {isPro ? "Pro" : "Basis"}
            </Badge>
          </div>
          <h1
            className="mt-5 text-2xl font-black leading-tight tracking-tight md:text-4xl"
            data-testid="text-welcome"
          >
            Welkom terug, {displayName}. Pak direct groei, inzicht en lokale kansen.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/75 md:text-base">
            Maak je bedrijf zichtbaarder, volg wat er speelt in jouw regio en zet documenten sneller om in actie.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools/website-scan">
              <button
                className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:opacity-90 active:scale-95"
                data-testid="button-hero-websitescan"
              >
                Website analyse starten
              </button>
            </Link>
            <Link href="/intel">
              <button
                className="rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
                data-testid="button-hero-updates"
              >
                Regio-updates bekijken
              </button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-3xl bg-card border p-5 shadow-sm" data-testid="card-stat-signalen">
            <p className="text-sm font-medium text-muted-foreground">Actuele signalen</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-foreground">{signaalCount}</p>
            <p className="text-sm text-muted-foreground">voor jouw regio</p>
            <Link href="/intel">
              <div className="mt-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 cursor-pointer hover-elevate">
                {hogeImpact} hoge impact {hogeImpact === 1 ? "signaal" : "signalen"}
              </div>
            </Link>
          </div>

          <div className="rounded-3xl bg-card border p-5 shadow-sm" data-testid="card-stat-taken">
            <p className="text-sm font-medium text-muted-foreground">Open taken</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-foreground">{openTaken}</p>
            <p className="text-sm text-muted-foreground">subsidies & kansen</p>
            <Link href="/kansen/aanbestedingen">
              <div className="mt-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 px-3 py-2 text-sm font-medium text-orange-700 dark:text-orange-400 cursor-pointer hover-elevate">
                {hogeImpact} hoge impact {hogeImpact === 1 ? "maatregel" : "maatregelen"}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Vier modulekaarten ───────────────────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-testid="section-modules">
        {MODULE_CARDS.map((card) => (
          <div
            key={card.id}
            className="rounded-3xl bg-card border p-6 shadow-sm flex flex-col"
            data-testid={`card-module-${card.id}`}
          >
            <p className="text-lg font-bold tracking-tight text-foreground">{card.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground leading-snug min-h-[40px]">{card.subtitle}</p>
            <div className="mt-4 space-y-1.5 flex-1">
              {card.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={item.label}>
                    <div
                      className="flex items-center gap-2.5 rounded-2xl bg-muted px-3 py-2 text-sm font-medium text-foreground cursor-pointer hover-elevate"
                      data-testid={`link-module-${card.id}-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href={card.href}>
              <Button
                className="mt-5 w-full rounded-2xl"
                data-testid={`button-module-${card.id}`}
              >
                {card.cta}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        ))}
      </section>

      {/* ── Updates + Acties ─────────────────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-2" data-testid="section-updates-acties">

        <div className="rounded-3xl bg-card border p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-bold tracking-tight">Laatste regio-updates</h2>
            <Link href="/intel">
              <Button variant="ghost" size="sm" data-testid="button-alles-updates">
                Alles bekijken
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {updates.map((item) => (
              <Link href="/intel" key={item.id}>
                <div
                  className="rounded-2xl border px-4 py-3.5 cursor-pointer hover-elevate"
                  data-testid={`card-update-${item.id}`}
                >
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground flex-1 min-w-0">{item.titel}</p>
                    <Badge variant={categorieBadgeVariant(item.categorie)} className="text-[10px] shrink-0">
                      {item.categorie}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{item.samenvatting}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-card border p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-bold tracking-tight">Recente acties</h2>
            <Link href="/woo-bibliotheek">
              <Button variant="ghost" size="sm" data-testid="button-meer-acties">
                Meer acties
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {RECENTE_ACTIES.map((actie) => {
              const Icon = actie.icon;
              return (
                <Link href={actie.href} key={actie.label}>
                  <div
                    className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 cursor-pointer hover-elevate"
                    data-testid={`card-actie-${actie.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className="rounded-xl bg-muted p-2 shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{actie.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{actie.sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Admin ────────────────────────────────────────────────────────────── */}
      {isAdmin && (
        <section className="space-y-3 pt-2 border-t" data-testid="section-admin">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Extra / Admin</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-card border p-4 space-y-3" data-testid="card-admin-export">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Leden export</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="/api/export/nieuwe-leden?days=7&format=csv">
                  <Button size="sm" variant="outline" data-testid="button-export-csv-7">CSV 7d</Button>
                </a>
                <a href="/api/export/nieuwe-leden?days=30&format=csv">
                  <Button size="sm" variant="outline" data-testid="button-export-csv-30">CSV 30d</Button>
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-card border p-4 space-y-3" data-testid="card-admin-create-user">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Gebruiker aanmaken</p>
              </div>
              <Link href="/admin/users">
                <Button size="sm" data-testid="button-admin-create-user">
                  Nieuw account
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl bg-card border p-4 space-y-3" data-testid="card-admin-cockpit">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Rapporten</p>
              </div>
              <Link href="/admin/inzicht">
                <Button size="sm" variant="outline" data-testid="button-admin-rapporten">
                  Bekijk
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl bg-card border p-4 space-y-3" data-testid="card-admin-beheer">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Beheer</p>
              </div>
              <Link href="/admin">
                <Button size="sm" variant="outline" data-testid="button-admin-beheer">
                  Naar beheer
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
