import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Download,
  UserPlus,
  Shield,
  BarChart3,
  Building2,
  Monitor,
  FolderOpen,
  Gavel,
  Users,
  Share2,
  Landmark,
  Activity,
  Signal,
  ChevronRight,
  ScanText,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { IntelSignaal } from "@shared/schema";

const MODULE_CARDS = [
  {
    id: "groei",
    title: "Groei",
    subtitle: "Maak je bedrijf beter vindbaar en zichtbaarder in jouw regio.",
    href: "/tools/website-scan",
    cta: "Open Groei",
    accent: "from-blue-500/20 to-cyan-400/10",
    items: [
      { label: "Website Scan", href: "/tools/website-scan", icon: Monitor },
      { label: "Bedrijfsprofiel", href: "/bedrijfsprofiel", icon: Building2 },
      { label: "Zichtbaarheid", href: "/pro/visibility-settings", icon: Shield },
    ],
  },
  {
    id: "monitor",
    title: "Regio Monitor",
    subtitle: "Volg openbare veranderingen die impact hebben op jouw bedrijf.",
    href: "/intel",
    cta: "Open Monitor",
    accent: "from-emerald-500/20 to-teal-400/10",
    items: [
      { label: "Regio Intel", href: "/intel", icon: Signal },
      { label: "Regels & besluiten", href: "/beleidsmonitor", icon: Activity },
      { label: "Aanbestedingen", href: "/kansen/aanbestedingen", icon: Landmark },
    ],
  },
  {
    id: "actie",
    title: "Documenten",
    subtitle: "Maak brieven en documenten sneller duidelijk en bruikbaar.",
    href: "/tools/brief-analyse",
    cta: "Open Documenten",
    accent: "from-violet-500/20 to-fuchsia-400/10",
    items: [
      { label: "Brief begrijpen", href: "/tools/brief-analyse", icon: ScanText },
      { label: "Mijn documenten", href: "/woo-bibliotheek", icon: FolderOpen },
      { label: "Verzoek indienen", href: "/woo-wizard", icon: Gavel },
    ],
  },
  {
    id: "netwerk",
    title: "Samenwerken",
    subtitle: "Vind deals, partners en lokale kansen om samen te groeien.",
    href: "/kansen/regio-deals",
    cta: "Open Samenwerken",
    accent: "from-amber-500/20 to-orange-400/10",
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

const CATEGORIE_KLEUREN: Record<string, string> = {
  subsidies: "text-emerald-400 bg-emerald-500/10",
  financieel: "text-amber-400 bg-amber-500/10",
  wetgeving: "text-blue-400 bg-blue-500/10",
  beleid: "text-purple-400 bg-purple-500/10",
};

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
      <div className="space-y-5 pb-8">
        <Skeleton className="h-56 w-full rounded-[32px]" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 rounded-[30px]" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-52 rounded-[30px]" />
          <Skeleton className="h-52 rounded-[30px]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pb-8">
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
      : [...realUpdates, ...FALLBACK_UPDATES.slice(0, MAX_UPDATES - realUpdates.length)];

  return (
    <div className="space-y-6 pb-8">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-[1.55fr_0.8fr]" data-testid="section-hero">

        <div
          className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111b3a] via-[#122347] to-[#0a6a5e] p-7 text-white shadow-2xl shadow-black/20 md:p-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              Vandaag starten
            </span>
            <Badge
              variant={isPro ? "default" : "outline"}
              className="text-xs rounded-full border-white/15 bg-white/5 text-slate-200"
              data-testid="badge-plan"
            >
              {isPro ? "Pro" : "Basis"}
            </Badge>
          </div>

          <h1
            className="mt-5 text-3xl font-black leading-tight tracking-tight text-white md:text-5xl"
            data-testid="text-welcome"
          >
            Welkom terug, {displayName}. Pak direct groei, inzicht en lokale kansen.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/80 md:text-base">
            Maak je bedrijf zichtbaarder, volg wat er openbaar verandert in jouw regio en zet documenten sneller om in actie.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/tools/website-scan">
              <button
                className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:opacity-90 active:scale-95"
                data-testid="button-hero-websitescan"
              >
                Website analyse starten
              </button>
            </Link>
            <Link href="/intel">
              <button
                className="rounded-2xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
                data-testid="button-hero-updates"
              >
                Regio-updates bekijken
              </button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div
            className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm dark:bg-white/5 bg-card"
            data-testid="card-stat-signalen"
          >
            <p className="text-sm font-semibold text-muted-foreground dark:text-slate-300">Actuele signalen</p>
            <p className="mt-4 text-4xl font-black tracking-tight text-foreground dark:text-white">{signaalCount}</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400">voor jouw regio</p>
            <Link href="/intel">
              <div className="mt-5 rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 cursor-pointer ring-1 ring-emerald-400/15 hover-elevate">
                {hogeImpact === 0 ? "Geen hoge impact" : `${hogeImpact} hoge impact ${hogeImpact === 1 ? "signaal" : "signalen"}`}
              </div>
            </Link>
          </div>

          <div
            className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm dark:bg-white/5 bg-card"
            data-testid="card-stat-taken"
          >
            <p className="text-sm font-semibold text-muted-foreground dark:text-slate-300">Open taken</p>
            <p className="mt-4 text-4xl font-black tracking-tight text-foreground dark:text-white">{openTaken}</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400">subsidies & kansen</p>
            <Link href="/kansen/aanbestedingen">
              <div className="mt-5 rounded-2xl bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 cursor-pointer ring-1 ring-orange-400/15 hover-elevate">
                {openTaken === 0 ? "Geen open kansen" : `${openTaken} ${openTaken === 1 ? "kans" : "kansen"} te benutten`}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Platform uitleg strip ────────────────────────────────────────────── */}
      <section className="rounded-[28px] border border-white/10 bg-white/5 dark:bg-white/5 bg-card px-6 py-5" data-testid="section-platform-intro">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground dark:text-slate-400 mb-4">
          Wat OpenRegio voor jou doet
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: TrendingUp,  color: "text-blue-400",   bg: "bg-blue-500/10",   label: "Groei",          desc: "Word beter gevonden in jouw regio" },
            { icon: Signal,      color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Regio Monitor",  desc: "Volg signalen en regelgeving" },
            { icon: ScanText,    color: "text-violet-400",  bg: "bg-violet-500/10",  label: "Documenten",     desc: "Begrijp brieven en maak verzoeken" },
            { icon: Users,       color: "text-amber-400",   bg: "bg-amber-500/10",   label: "Samenwerken",    desc: "Vind deals en lokale partners" },
          ].map(({ icon: Icon, color, bg, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className={`rounded-xl p-2 shrink-0 ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground dark:text-white leading-none">{label}</p>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400 mt-1 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vier modulekaarten ───────────────────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4" data-testid="section-modules">
        {MODULE_CARDS.map((card) => (
          <div
            key={card.id}
            className="rounded-[30px] border border-white/10 bg-white/5 dark:bg-white/5 bg-card p-6 backdrop-blur-sm shadow-xl shadow-black/10 flex flex-col"
            data-testid={`card-module-${card.id}`}
          >
            <div className={`mb-5 rounded-2xl bg-gradient-to-br ${card.accent} p-4 ring-1 ring-white/10`}>
              <p className="text-base font-bold tracking-tight text-foreground dark:text-white">{card.title}</p>
              <p className="mt-2 min-h-[48px] text-sm leading-snug text-muted-foreground dark:text-slate-300">{card.subtitle}</p>
            </div>

            <div className="space-y-2 flex-1">
              {card.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={item.label}>
                    <div
                      className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-black/5 dark:bg-black/20 px-4 py-3 text-sm font-medium text-foreground dark:text-slate-200 cursor-pointer hover-elevate"
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
              <button
                className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 active:scale-95"
                data-testid={`button-module-${card.id}`}
              >
                {card.cta}
              </button>
            </Link>
          </div>
        ))}
      </section>

      {/* ── Updates + Acties ─────────────────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-2" data-testid="section-updates-acties">

        <div className="rounded-[30px] border border-white/10 bg-white/5 dark:bg-white/5 bg-card p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-bold tracking-tight text-foreground dark:text-white">Laatste regio-updates</h2>
            <Link href="/intel">
              <button
                className="text-sm font-semibold text-cyan-600 dark:text-cyan-300 hover:underline"
                data-testid="button-alles-updates"
              >
                Alles bekijken
              </button>
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {updates.map((item) => (
              <Link href="/intel" key={item.id}>
                <div
                  className="rounded-2xl border border-white/10 bg-black/5 dark:bg-black/20 px-4 py-4 cursor-pointer hover-elevate"
                  data-testid={`card-update-${item.id}`}
                >
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground dark:text-white flex-1 min-w-0">{item.titel}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${CATEGORIE_KLEUREN[item.categorie] ?? "text-muted-foreground bg-muted"}`}>
                      {item.categorie}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-slate-400 line-clamp-1">{item.samenvatting}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/5 dark:bg-white/5 bg-card p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-bold tracking-tight text-foreground dark:text-white">Recente acties</h2>
            <Link href="/woo-bibliotheek">
              <button
                className="text-sm font-semibold text-cyan-600 dark:text-cyan-300 hover:underline"
                data-testid="button-meer-acties"
              >
                Meer acties
              </button>
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {RECENTE_ACTIES.map((actie) => {
              const Icon = actie.icon;
              return (
                <Link href={actie.href} key={actie.label}>
                  <div
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/5 dark:bg-black/20 px-4 py-4 cursor-pointer hover-elevate"
                    data-testid={`card-actie-${actie.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className="rounded-xl bg-white/5 dark:bg-white/10 p-2 shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground dark:text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground dark:text-white">{actie.label}</p>
                      <p className="text-xs text-muted-foreground dark:text-slate-400 truncate">{actie.sub}</p>
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
        <section className="space-y-3 pt-2 border-t border-white/10" data-testid="section-admin">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground dark:text-slate-400">Extra / Admin</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                testid: "card-admin-export",
                icon: Download,
                label: "Leden export",
                content: (
                  <div className="flex flex-wrap gap-2">
                    <a href="/api/export/nieuwe-leden?days=7&format=csv">
                      <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground dark:text-white hover-elevate" data-testid="button-export-csv-7">CSV 7d</button>
                    </a>
                    <a href="/api/export/nieuwe-leden?days=30&format=csv">
                      <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground dark:text-white hover-elevate" data-testid="button-export-csv-30">CSV 30d</button>
                    </a>
                  </div>
                ),
              },
            ].map((item) => (
              <div key={item.testid} className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 bg-card p-4 space-y-3" data-testid={item.testid}>
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground dark:text-white">{item.label}</p>
                </div>
                {item.content}
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 bg-card p-4 space-y-3" data-testid="card-admin-create-user">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground dark:text-white">Gebruiker aanmaken</p>
              </div>
              <Link href="/admin/users">
                <button className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition" data-testid="button-admin-create-user">
                  Nieuw account
                  <ArrowRight className="inline w-3 h-3 ml-1" />
                </button>
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 bg-card p-4 space-y-3" data-testid="card-admin-cockpit">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground dark:text-white">Rapporten</p>
              </div>
              <Link href="/admin/inzicht">
                <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground dark:text-white hover-elevate" data-testid="button-admin-rapporten">
                  Bekijk <ArrowRight className="inline w-3 h-3 ml-1" />
                </button>
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 bg-card p-4 space-y-3" data-testid="card-admin-beheer">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground dark:text-white">Beheer</p>
              </div>
              <Link href="/admin">
                <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground dark:text-white hover-elevate" data-testid="button-admin-beheer">
                  Naar beheer <ArrowRight className="inline w-3 h-3 ml-1" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
