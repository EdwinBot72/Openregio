import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import type { IntelSignaal } from "@shared/schema";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Euro,
  Eye,
  FileText,
  Globe,
  MapPin,
  MessageSquare,
  Monitor,
  Newspaper,
  Scale,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  SECTOR_CONFIG,
  SECTOR_TILES,
  type SectorKey,
} from "@/config/sectors";

// ─── Design tokens ────────────────────────────────────────────────────────────
const PANEL = "rounded-md border border-border bg-card";
const PANEL_HEADER = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2 border-b border-border bg-muted/40";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

function formatDatum(d: Date) {
  return d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
}

// ─── Last-visit tracking ──────────────────────────────────────────────────────
const LS_KEY = "vandaag_last_visit";

function useLastVisit(): Date | null {
  const [lastVisit] = useState<Date | null>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? new Date(stored) : null;
    } catch { return null; }
  });
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, new Date().toISOString()); } catch { /* noop */ }
  }, []);
  return lastVisit;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────
function rankSignalen(
  signalen: IntelSignaal[],
  userSector?: string | null,
  userRegio?: string | null,
): IntelSignaal[] {
  const urgOrd: Record<string, number> = { hoog: 0, normaal: 1, info: 2 };
  return [...signalen].sort((a, b) => {
    const riskDiff = (urgOrd[a.urgentie] ?? 2) - (urgOrd[b.urgentie] ?? 2);
    if (riskDiff !== 0) return riskDiff;
    const aD = new Date(a.datum ?? a.createdAt ?? 0).getTime();
    const bD = new Date(b.datum ?? b.createdAt ?? 0).getTime();
    if (aD !== bD) return aD - bD;
    const aReg = !userRegio || a.regio === "Nationaal" || a.regio === userRegio;
    const bReg = !userRegio || b.regio === "Nationaal" || b.regio === userRegio;
    if (aReg && !bReg) return -1;
    if (!aReg && bReg) return 1;
    const aSect = !a.sector || a.sector === "alle" || a.sector === userSector;
    const bSect = !b.sector || b.sector === "alle" || b.sector === userSector;
    if (aSect && !bSect) return -1;
    if (!aSect && bSect) return 1;
    const aCr = new Date(a.createdAt ?? 0).getTime();
    const bCr = new Date(b.createdAt ?? 0).getTime();
    return bCr - aCr;
  });
}

// ─── Category dot ─────────────────────────────────────────────────────────────
const CAT_DOT: Record<string, string> = {
  wetgeving: "bg-blue-500",
  beleid: "bg-purple-500",
  financieel: "bg-amber-500",
  subsidies: "bg-emerald-500",
};

// ─── Urgency badge ─────────────────────────────────────────────────────────────
function UrgentieBadge({ urgentie }: { urgentie: string }) {
  if (urgentie === "hoog") return <Badge variant="destructive" className="text-xs shrink-0">Urgent</Badge>;
  if (urgentie === "normaal") return <Badge variant="secondary" className="text-xs shrink-0">Normaal</Badge>;
  return <Badge variant="outline" className="text-xs shrink-0">Info</Badge>;
}

// ─── Sector onboarding ────────────────────────────────────────────────────────
function SectorOnboarding() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState<SectorKey | null>(null);

  const handleKies = async (key: SectorKey) => {
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
    <div className={`${PANEL} p-4 mb-4`} data-testid="section-sector-onboarding">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm">In welke sector ben je actief?</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            We tonen dan de meest relevante signalen voor jouw branche.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SECTOR_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.key}
              onClick={() => handleKies(tile.key)}
              disabled={!!saving}
              data-testid={`button-sector-${tile.key}`}
              className="flex items-center gap-2 rounded-md border border-border bg-muted/40 hover-elevate active-elevate-2 p-2.5 text-left transition disabled:opacity-50"
            >
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground">{tile.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ProfielData = {
  naam?: string;
  beschrijving?: string;
  websiteUrl?: string;
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

type Aanbesteding = {
  id: string;
  title: string;
  buyer: string;
  description: string | null;
  deadline: string | null;
  daysLeft: number | null;
  publicationDate: string | null;
  url: string | null;
};

// ─── Portal nav button ─────────────────────────────────────────────────────────
function PortalNavBtn({
  icon: Icon,
  label,
  href,
  testid,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  testid: string;
}) {
  return (
    <Link href={href}>
      <button
        data-testid={testid}
        className="flex items-center justify-between gap-2 w-full rounded-md border border-border bg-primary/5 hover-elevate active-elevate-2 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </span>
        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
      </button>
    </Link>
  );
}

// ─── Portal action row ────────────────────────────────────────────────────────
function ActionRow({
  label,
  sub,
  href,
  testid,
}: {
  label: string;
  sub?: string;
  href: string;
  testid: string;
}) {
  return (
    <Link href={href}>
      <div
        data-testid={testid}
        className="flex items-start gap-2 py-2 border-b border-border last:border-0 hover-elevate cursor-pointer rounded-md px-1 -mx-1"
      >
        <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{sub}</p>}
        </div>
        <ArrowUpRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
      </div>
    </Link>
  );
}

// ─── Signal row ───────────────────────────────────────────────────────────────
function SignaalRow({ signaal }: { signaal: IntelSignaal }) {
  const dot = CAT_DOT[signaal.categorie] ?? "bg-muted-foreground";
  return (
    <Link href="/regels/updates">
      <div className="flex items-start gap-2 py-2 border-b border-border last:border-0 hover-elevate cursor-pointer rounded-md px-1 -mx-1">
        <span className={`inline-block w-2 h-2 rounded-full ${dot} shrink-0 mt-1`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">{signaal.titel}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{signaal.categorie}</p>
        </div>
        {signaal.urgentie === "hoog" && (
          <span className="text-[9px] font-bold text-destructive shrink-0 mt-0.5">URGENT</span>
        )}
      </div>
    </Link>
  );
}

// ─── Bottom panel item ────────────────────────────────────────────────────────
function BottomPanelLink({
  icon: Icon,
  label,
  href,
  testid,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  testid: string;
}) {
  return (
    <Link href={href}>
      <div
        data-testid={testid}
        className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0 hover-elevate cursor-pointer rounded-md px-1 -mx-1"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground">{label}</span>
        </span>
        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function VandaagPage() {
  usePageTitle("Vandaag");
  const { user, isLoading: authLoading } = useAuth();
  const lastVisit = useLastVisit();
  const [activeTab, setActiveTab] = useState<"nieuws" | "kansen">("nieuws");
  const { setOpen, isMobile } = useSidebar();
  const [location] = useLocation();

  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
    }
  }, [setOpen, isMobile]);

  const { data: profiel } = useQuery<ProfielData | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const { data: intelSignalen = [], isLoading: intelLoading } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen"],
    enabled: !!user,
  });

  const { data: cursusData, isLoading: cursusLoading } = useQuery<{
    today: string;
    items: CursusItem[];
    totaal: number;
  }>({
    queryKey: ["/api/cursussen"],
    enabled: !!user,
  });

  const { data: documentenData } = useQuery<{ documents: { id: string }[] } | { id: string }[]>({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  const userRegio = profiel?.regio || user?.region || "";
  const { data: aanbestedingenData } = useQuery<{
    gemeente: string;
    count: number;
    items: Aanbesteding[];
  }>({
    queryKey: ["/api/tenderned/aanbestedingen", userRegio],
    queryFn: () =>
      fetch(`/api/tenderned/aanbestedingen?gemeente=${encodeURIComponent(userRegio)}&limit=5`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Niet beschikbaar");
        return r.json();
      }),
    enabled: !!userRegio,
    staleTime: 15 * 60 * 1000,
  });

  // ── Derived data ─────────────────────────────────────────────────────────
  const cursusItems = cursusData?.items ?? [];

  let documentenAantal = 0;
  if (Array.isArray(documentenData)) {
    documentenAantal = documentenData.length;
  } else if (documentenData && "documents" in documentenData) {
    documentenAantal = (documentenData as { documents: { id: string }[] }).documents.length;
  }

  const hasSector = !!user?.sector;

  const signaalenGerankt = rankSignalen(intelSignalen, user?.sector, userRegio);
  const topSignalen = signaalenGerankt.slice(0, 4);
  const wooSignalen = signaalenGerankt.filter(
    (s) => s.categorie === "wetgeving" || s.categorie === "beleid"
  ).slice(0, 3);
  const actiefKansen = cursusItems.filter((i) => !i.completed).slice(0, 4);
  const openAanbestedingen = aanbestedingenData?.items?.slice(0, 4) ?? [];

  const isNieuwFn = (datum: Date) => !!lastVisit && datum > lastVisit;

  // Feed items for Nieuws tab
  const feedItems = signaalenGerankt
    .slice(0, 6)
    .map((s) => ({
      id: `intel-${s.id}`,
      titel: s.titel,
      tekst: s.samenvatting,
      label: s.categorie,
      urgentie: s.urgentie,
      dotColor: CAT_DOT[s.categorie] ?? "bg-muted-foreground",
      isNieuw: isNieuwFn(new Date(s.datum ?? s.createdAt ?? 0)),
    }));

  const displayName = user?.firstName || profiel?.naam || user?.businessName || "ondernemer";

  // ── Loading state ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="p-4 space-y-4" data-testid="skeleton-vandaag">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-full bg-muted/20 dark:bg-background" data-testid="page-vandaag">

      {/* ── Portal Header ──────────────────────────────────────────────────── */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">OR</span>
            </div>
            <span className="font-bold text-base text-foreground hidden sm:block">OpenRegio</span>
          </div>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Zoek..."
                data-testid="input-portal-search"
                className="w-full rounded-md border border-border bg-muted/40 pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button size="sm" variant="outline" data-testid="button-zoek-filter">
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Zoek en Filter
            </Button>
          </div>
          <div className="text-xs text-muted-foreground shrink-0 hidden md:block">
            {getGreeting()}, {displayName} &middot; {formatDatum(new Date())}
          </div>
        </div>
      </div>

      {/* ── RegioMarkt banner ──────────────────────────────────────────────── */}
      <div
        className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-2"
        data-testid="banner-regiomarkt"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold text-foreground">RegioMarkt</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            &mdash; Lokale kansen, samenwerkingen en aanbestedingen in jouw regio
          </span>
        </div>
        <Link href="/kansen/in-de-buurt">
          <button className="text-xs font-semibold text-primary hover:underline" data-testid="link-regiomarkt">
            Bekijk alles
          </button>
        </Link>
      </div>

      {/* ── Horizontal nav tabs ────────────────────────────────────────────── */}
      <div className="bg-primary px-4 flex items-center gap-1" data-testid="portal-nav-tabs">
        {[
          { id: "info", label: "Info / Toepassingen", icon: Monitor, href: "/vandaag" },
          { id: "kansen", label: "Kansen / Acties", icon: TrendingUp, href: "/kansen/opdrachten" },
          { id: "regels", label: "Regels", icon: Scale, href: "/regels/updates" },
          { id: "groei", label: "Groei", icon: BarChart3, href: "/groei/profiel" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/vandaag"
              ? location === "/vandaag"
              : location.startsWith(tab.href.split("/").slice(0, 2).join("/"));
          return (
            <Link key={tab.id} href={tab.href}>
              <button
                data-testid={`tab-portal-${tab.id}`}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-white border-b-2 border-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            </Link>
          );
        })}
      </div>

      {/* ── Main 3-column content ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-0 min-h-0">

        {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
        <aside className="border-r border-border bg-background flex flex-col gap-0 lg:flex lg:flex-col">

          {/* INFO / TOEPASSINGEN */}
          <div>
            <div className={PANEL_HEADER} data-testid="section-info-toepassingen">
              INFO / TOEPASSINGEN
            </div>
            <div className="p-2 flex flex-col gap-1.5">
              <PortalNavBtn icon={Monitor} label="Monitor" href="/vandaag/updates" testid="nav-monitor" />
              <PortalNavBtn icon={Eye} label="Inzichten" href="/regels/updates" testid="nav-inzichten" />
              <PortalNavBtn icon={FileText} label="Documenten" href="/regels/documenten" testid="nav-documenten" />
              <div className="flex gap-1.5 mt-0.5">
                <Link href="/regels/woo" className="flex-1">
                  <button
                    data-testid="nav-woo-bibliotheek"
                    className="flex items-center justify-center gap-1 w-full rounded-md border border-border bg-muted/40 hover-elevate active-elevate-2 px-2 py-1.5"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-foreground">WOO</span>
                  </button>
                </Link>
                <Link href="/regels/check" className="flex-1">
                  <button
                    data-testid="nav-check-situatie"
                    className="flex items-center justify-center gap-1 w-full rounded-md border border-border bg-muted/40 hover-elevate active-elevate-2 px-2 py-1.5"
                  >
                    <Scale className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-foreground">Check</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* WOO INZICHTEN */}
          <div className="border-t border-border">
            <Link href="/regels/woo">
              <div className={`${PANEL_HEADER} flex items-center justify-between cursor-pointer hover:bg-muted/60`} data-testid="section-woo-inzichten">
                <span>WOO INZICHTEN</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </Link>
            <div className="px-3 py-2">
              {intelLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-8 rounded" />)}
                </div>
              ) : wooSignalen.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Geen recente WOO signalen.</p>
              ) : (
                wooSignalen.map((s) => <SignaalRow key={s.id} signaal={s} />)
              )}
            </div>
          </div>

          {/* REGIOBOT */}
          <div className="border-t border-border">
            <div className={PANEL_HEADER} data-testid="section-regiobot">
              REGIOBOT
            </div>
            <div className="p-2">
              <Link href="/regiobot">
                <button
                  data-testid="nav-regiobot"
                  className="flex items-center gap-2 w-full rounded-md border border-border bg-primary/5 hover-elevate active-elevate-2 px-3 py-2.5 text-left"
                >
                  <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">Zoek in regels</p>
                    <p className="text-[10px] text-muted-foreground">en besluiten</p>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* COMMUNITY */}
          <div className="border-t border-border">
            <div className={PANEL_HEADER} data-testid="section-community-left">
              COMMUNITY
            </div>
            <div className="p-2 flex flex-col gap-1.5">
              <PortalNavBtn icon={Users} label="Club & Partners" href="/community" testid="nav-club-partners" />
              <PortalNavBtn icon={Calendar} label="Evenementen" href="/community" testid="nav-evenementen" />
            </div>
          </div>
        </aside>

        {/* ── CENTER COLUMN ───────────────────────────────────────────────── */}
        <main className="min-w-0 flex flex-col">

          {/* Sector onboarding (only if no sector set) */}
          {!hasSector && (
            <div className="p-4">
              <SectorOnboarding />
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex items-center gap-0 border-b border-border bg-background px-4 sticky top-0 z-10">
            <button
              data-testid="tab-nieuws"
              onClick={() => setActiveTab("nieuws")}
              className={`px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === "nieuws"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Nieuws / Updates
            </button>
            <button
              data-testid="tab-kansen"
              onClick={() => setActiveTab("kansen")}
              className={`px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === "kansen"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Kansen / Acties
            </button>
            <div className="ml-auto flex items-center gap-1 py-2">
              <Link href="/regels/updates">
                <Button size="sm" variant="outline" data-testid="btn-signaleren">
                  <Bell className="h-3.5 w-3.5 mr-1" />
                  Signaleren
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-5">

            {/* ── NIEUWS / UPDATES tab content ──────────────────────────── */}
            {activeTab === "nieuws" && (
              <>
                {/* REGELS section */}
                <section data-testid="section-regels">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-foreground">Regels</h2>
                      {topSignalen.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className={`inline-block w-2 h-2 rounded-full ${CAT_DOT[s.categorie] ?? "bg-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <Link href="/regels/updates">
                      <button className="text-xs font-semibold text-primary hover:underline" data-testid="link-alle-regels">
                        Alle regels
                      </button>
                    </Link>
                  </div>
                  <div className={`${PANEL} overflow-hidden`}>
                    <div
                      className="w-full h-36 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 flex items-end p-3"
                      data-testid="img-regels"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">Lokale regelgeving &amp; groei</span>
                      </div>
                    </div>
                    <div className="p-3">
                      {intelLoading ? (
                        <Skeleton className="h-12 rounded" />
                      ) : topSignalen[0] ? (
                        <>
                          <Link href="/regels/updates">
                            <p className="text-sm font-bold text-foreground hover:underline cursor-pointer leading-snug mb-1.5">
                              {topSignalen[0].titel}
                            </p>
                          </Link>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {topSignalen[0].samenvatting}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Klein maar fijn, doorlopend herstel en groei voor lokale ondernemers in jouw regio. Ontdek hoe regelgeving jouw bedrijf raakt en wat je kunt ondernemen.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* News feed items */}
                {feedItems.length > 0 && (
                  <section>
                    <div className={`${PANEL} p-3`}>
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <Newspaper className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-bold text-foreground">Nieuws / Updates</span>
                        </div>
                        <Link href="/vandaag/updates">
                          <button className="text-[10px] font-semibold text-primary hover:underline">Alle updates</button>
                        </Link>
                      </div>
                      {feedItems.map((item) => (
                        <Link key={item.id} href="/regels/updates">
                          <div
                            data-testid={`feed-item-${item.id}`}
                            className="flex items-start gap-2 py-2 border-b border-border last:border-0 hover-elevate cursor-pointer rounded-md px-1 -mx-1"
                          >
                            <span className={`inline-block w-2 h-2 rounded-full ${item.dotColor} shrink-0 mt-1`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                {item.isNieuw && (
                                  <span className="inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    Nieuw
                                  </span>
                                )}
                                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</span>
                                {item.urgentie === "hoog" && <UrgentieBadge urgentie="hoog" />}
                              </div>
                              <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">{item.titel}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ── KANSEN / ACTIES tab content ────────────────────────────── */}
            {activeTab === "kansen" && (
              <section data-testid="section-kansen-acties">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h2 className="text-sm font-bold text-foreground">Kansen &amp; Acties</h2>
                  <Link href="/vandaag/acties">
                    <button className="text-xs font-semibold text-primary hover:underline" data-testid="link-alle-acties">
                      Alle acties
                    </button>
                  </Link>
                </div>
                <div className={`${PANEL}`}>
                  {cursusLoading ? (
                    <div className="p-3 space-y-2">
                      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 rounded" />)}
                    </div>
                  ) : actiefKansen.length === 0 && openAanbestedingen.length === 0 ? (
                    <div className="p-4 text-center">
                      <CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground">Alle acties zijn voltooid. Goed gedaan!</p>
                    </div>
                  ) : (
                    <div className="p-3">
                      {actiefKansen.slice(0, 2).map((item) => (
                        <ActionRow
                          key={item.id}
                          label={item.title}
                          sub={`${item.minutes} min · nog ${item.daysLeft} ${item.daysLeft === 1 ? "dag" : "dagen"}`}
                          href="/vandaag/acties"
                          testid={`action-cursus-${item.id}`}
                        />
                      ))}
                      {openAanbestedingen.slice(0, 4).map((item) => (
                        <ActionRow
                          key={item.id}
                          label={item.title}
                          sub={`${item.buyer}${item.daysLeft !== null ? ` · nog ${item.daysLeft} dagen` : ""}`}
                          href="/kansen/opdrachten"
                          testid={`action-aanbesteding-${item.id}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href="/kansen/opdrachten" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs" data-testid="btn-naar-opdrachten">
                      <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                      Alle opdrachten
                    </Button>
                  </Link>
                  <Link href="/kansen/subsidies" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs" data-testid="btn-naar-subsidies">
                      <Euro className="h-3.5 w-3.5 mr-1.5" />
                      Subsidies
                    </Button>
                  </Link>
                </div>
              </section>
            )}
          </div>
        </main>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <aside className="border-l border-border bg-background flex flex-col">

          {/* DOCUMENTEN / MONITOR */}
          <div>
            <div className={PANEL_HEADER} data-testid="section-documenten-monitor">
              DOCUMENTEN / MONITOR
            </div>
            <div className="px-3 py-2">
              <Link href="/regels/documenten">
                <div className="flex items-center justify-between gap-2 py-2 border-b border-border hover-elevate cursor-pointer rounded-md px-1 -mx-1">
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">Document analyseren</p>
                      <p className="text-[10px] text-muted-foreground">Brief of besluit begrijpen</p>
                    </div>
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              </Link>
              <Link href="/vandaag/updates">
                <div className="flex items-center justify-between gap-2 py-2 border-b border-border hover-elevate cursor-pointer rounded-md px-1 -mx-1">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">Rapportage</p>
                      <p className="text-[10px] text-muted-foreground">
                        {documentenAantal > 0 ? `${documentenAantal} docs geanalyseerd` : "Bekijk overzicht"}
                      </p>
                    </div>
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              </Link>
              <Link href="/regels/woo">
                <div className="flex items-center justify-between gap-2 py-2 hover-elevate cursor-pointer rounded-md px-1 -mx-1">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="text-xs font-semibold text-foreground">WOO Verzoeken</p>
                  </span>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              </Link>
            </div>
          </div>

          {/* ACTIES / SIGNALEN */}
          <div className="border-t border-border flex-1">
            <div className={PANEL_HEADER} data-testid="section-acties-signalen">
              ACTIES / SIGNALEN
            </div>
            <div className="px-3 py-2">
              {intelLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 rounded" />)}
                </div>
              ) : topSignalen.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Geen actieve signalen.</p>
              ) : (
                <>
                  {topSignalen.map((s) => (
                    <Link key={s.id} href="/regels/updates">
                      <div
                        data-testid={`signaal-right-${s.id}`}
                        className="flex items-start gap-2 py-2 border-b border-border last:border-0 hover-elevate cursor-pointer rounded-md px-1 -mx-1"
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          s.urgentie === "hoog" ? "bg-destructive/10" :
                          s.categorie === "wetgeving" ? "bg-blue-500/10" :
                          s.categorie === "beleid" ? "bg-purple-500/10" :
                          s.categorie === "financieel" ? "bg-amber-500/10" :
                          "bg-emerald-500/10"
                        }`}>
                          {s.categorie === "wetgeving" ? <Scale className="h-3.5 w-3.5 text-blue-500" /> :
                           s.categorie === "financieel" || s.categorie === "subsidies" ? <Euro className="h-3.5 w-3.5 text-amber-500" /> :
                           <Bell className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">{s.titel}</p>
                          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{s.categorie}</p>
                        </div>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                  <div className="mt-2">
                    <Link href="/regels/updates">
                      <Button size="sm" variant="outline" className="w-full text-xs" data-testid="btn-alle-signalen">
                        Alle signalen bekijken
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Bottom 3-column panels ─────────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-border bg-background"
        data-testid="section-bottom-panels"
      >
        {/* Community */}
        <div className="border-r border-border last:border-r-0">
          <div className={`${PANEL_HEADER} text-xs`}>COMMUNITY</div>
          <div className="p-3">
            <BottomPanelLink icon={Users} label="Club &amp; Partners" href="/community" testid="bottom-club-partners" />
            <BottomPanelLink icon={Calendar} label="Evenementen" href="/community" testid="bottom-evenementen" />
          </div>
        </div>
        {/* Kennisbank / Inzichten */}
        <div className="border-r border-border last:border-r-0">
          <div className={`${PANEL_HEADER} text-xs`}>KENNISBANK / INZICHTEN</div>
          <div className="p-3">
            <BottomPanelLink icon={Eye} label="Intel &amp; Overheid Monitor" href="/vandaag/updates" testid="bottom-intel-monitor" />
            <BottomPanelLink icon={BookOpen} label="Kennisbank Dossiers" href="/informatie/kennisbank" testid="bottom-kennisbank" />
          </div>
        </div>
        {/* Updates / Provincie */}
        <div>
          <div className="flex items-center justify-between pr-2">
            <div className={`${PANEL_HEADER} flex-1 text-xs`}>UPDATES / PROVINCIE</div>
            <Link href="/vandaag/updates">
              <button className="text-[10px] font-semibold text-primary hover:underline whitespace-nowrap">
                Alles bekijken
              </button>
            </Link>
          </div>
          <div className="p-3">
            <BottomPanelLink icon={Newspaper} label="Regio Reports" href="/vandaag/updates" testid="bottom-regio-reports" />
            <BottomPanelLink icon={Building2} label="Provincie Updates" href="/vandaag/updates" testid="bottom-provincie-updates" />
          </div>
        </div>
      </div>

      {/* ── Kennisbank wide block ──────────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-border"
        data-testid="section-kennisbank-wide"
      >
        {/* Kennisbank links */}
        <div className="bg-background border-r border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">KENNISBANK</h3>
          </div>
          <div className="flex flex-col gap-1">
            <BottomPanelLink icon={Users} label="Club &amp; Partners" href="/community" testid="kennisbank-club" />
            <BottomPanelLink icon={Calendar} label="Evenementen" href="/community" testid="kennisbank-evenementen" />
            <BottomPanelLink icon={Eye} label="Intel &amp; Overheid Monitor" href="/vandaag/updates" testid="kennisbank-intel" />
            <BottomPanelLink icon={MessageSquare} label="Vraag Hulp aan Groeilab" href="/regiobot" testid="kennisbank-groeilab" />
            <BottomPanelLink icon={BookOpen} label="Kennisbank Dossiers" href="/informatie/kennisbank" testid="kennisbank-dossiers" />
            <BottomPanelLink icon={Globe} label="Initiatieven in de regio" href="/kansen/in-de-buurt" testid="kennisbank-initiatieven" />
          </div>
        </div>

        {/* Updates / Provincie featured */}
        <div className="bg-background p-4" data-testid="section-updates-provincie">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">UPDATES / PROVINCIE</h3>
          </div>
          <div className="rounded-md overflow-hidden border border-border">
            <div className="w-full h-28 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 flex items-end p-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">Regio nieuws</span>
              </div>
            </div>
            <div className="p-3">
              {intelLoading ? (
                <Skeleton className="h-12 rounded" />
              ) : topSignalen[1] ? (
                <>
                  <Link href="/vandaag/updates">
                    <p className="text-sm font-bold text-foreground hover:underline cursor-pointer leading-snug mb-1">
                      {topSignalen[1].titel}
                    </p>
                  </Link>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {topSignalen[1].samenvatting}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-foreground leading-snug mb-1">
                    Klein maar fijn, doorlopend herstel en groei
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Blijf op de hoogte van de laatste provinciale updates en regionale ontwikkelingen die van invloed zijn op jouw bedrijfsvoering in de regio.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
