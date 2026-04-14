import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";
import type { IntelSignaal } from "@shared/schema";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Euro,
  Eye,
  FileText,
  Globe,
  MessageSquare,
  Monitor,
  Newspaper,
  Scale,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  SECTOR_CONFIG,
  SECTOR_TILES,
  type SectorKey,
} from "@/config/sectors";

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
function rankSignalen(signalen: IntelSignaal[], userSector?: string | null, userRegio?: string | null): IntelSignaal[] {
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
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ProfielData = {
  naam?: string; beschrijving?: string; websiteUrl?: string;
  telefoon?: string; adres?: string; kvkNummer?: string; regio?: string;
};
type CursusItem = { id: string; title: string; completed: boolean; minutes: number; daysLeft: number; };
type Aanbesteding = {
  id: string; title: string; buyer: string; description: string | null;
  deadline: string | null; daysLeft: number | null; publicationDate: string | null; url: string | null;
};

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
    } finally { setSaving(null); }
  };
  return (
    <div className="rounded-2xl border border-[#b8c8d8] bg-white/80 overflow-hidden shadow-sm mb-4" data-testid="section-sector-onboarding">
      <div className="bg-[#3f6f9f] px-5 py-4 text-white text-base font-bold uppercase tracking-wide flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        In welke sector ben je actief?
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {SECTOR_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.key}
              onClick={() => handleKies(tile.key)}
              disabled={!!saving}
              data-testid={`button-sector-${tile.key}`}
              className="flex items-center gap-2 rounded-2xl bg-[#5c93c6] text-white text-left px-4 py-3 text-sm font-semibold shadow-sm hover-elevate active-elevate-2 disabled:opacity-50"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tile.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Card header ─────────────────────────────────────────────────────────────
function CardHeader({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`px-5 py-4 border-b border-[#d2dbe4] text-base font-bold uppercase tracking-wide ${light ? "text-[#35587e] bg-[#edf3f8]" : "text-white bg-[#3f6f9f]"}`}>
      {children}
    </div>
  );
}

// ─── Kans feed item ─────────────────────────────────────────────────────────
function FeedCard({ label, sub, href, testid }: { label: string; sub: string; href: string; testid: string }) {
  return (
    <Link href={href}>
      <div
        data-testid={testid}
        className="rounded-2xl border border-[#cfdae6] bg-[#f6f9fc] px-5 py-4 flex items-center justify-between hover:bg-white transition cursor-pointer"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-[#314f72] leading-snug line-clamp-2">{label}</div>
          <div className="text-xs text-slate-500 mt-1 line-clamp-1">{sub}</div>
        </div>
        <div className="h-9 w-9 rounded-xl bg-[#d9e7f3] flex items-center justify-center shrink-0 ml-3">
          <ArrowUpRight className="h-4 w-4 text-[#2f679a]" />
        </div>
      </div>
    </Link>
  );
}

// ─── Sidebar nav button ───────────────────────────────────────────────────────
function NavBtn({ icon: Icon, label, href, testid }: { icon: React.ElementType; label: string; href: string; testid: string }) {
  return (
    <Link href={href}>
      <button
        data-testid={testid}
        className="w-full rounded-2xl bg-[#5c93c6] text-white text-left px-5 py-4 text-sm font-semibold shadow-sm hover-elevate active-elevate-2 flex items-center gap-3"
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </button>
    </Link>
  );
}

// ─── Light list item ──────────────────────────────────────────────────────────
function ListItem({ label, href, testid, color = "bg-[#eef3f8] text-[#35587e]" }: { label: string; href: string; testid: string; color?: string }) {
  return (
    <Link href={href}>
      <div
        data-testid={testid}
        className={`rounded-2xl px-4 py-4 text-sm font-semibold cursor-pointer hover-elevate ${color}`}
      >
        {label}
      </div>
    </Link>
  );
}

// ─── Urgentie pill ──────────────────────────────────────────────────────────
function UrgPill({ urgentie }: { urgentie: string }) {
  if (urgentie === "hoog") return <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">URGENT</span>;
  if (urgentie === "normaal") return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Normaal</span>;
  return null;
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function VandaagPage() {
  usePageTitle("Vandaag");
  const { user, isLoading: authLoading } = useAuth();
  const lastVisit = useLastVisit();
  const [activeTab, setActiveTab] = useState<"feed" | "kansen" | "regels" | "kennisbank">("feed");
  const { setOpen, isMobile } = useSidebar();

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [setOpen, isMobile]);

  const { data: profiel } = useQuery<ProfielData | null>({ queryKey: ["/api/business-profile/me"], enabled: !!user });
  const { data: intelSignalen = [], isLoading: intelLoading } = useQuery<IntelSignaal[]>({ queryKey: ["/api/intel/signalen"], enabled: !!user });
  const { data: cursusData, isLoading: cursusLoading } = useQuery<{ today: string; items: CursusItem[]; totaal: number }>({ queryKey: ["/api/cursussen"], enabled: !!user });
  const { data: documentenData } = useQuery<{ documents: { id: string }[] } | { id: string }[]>({ queryKey: ["/api/documents"], enabled: !!user });

  const userRegio = profiel?.regio || user?.region || "";
  const { data: aanbestedingenData } = useQuery<{ gemeente: string; count: number; items: Aanbesteding[] }>({
    queryKey: ["/api/tenderned/aanbestedingen", userRegio],
    queryFn: () =>
      fetch(`/api/tenderned/aanbestedingen?gemeente=${encodeURIComponent(userRegio)}&limit=6`, { credentials: "include" })
        .then((r) => { if (!r.ok) throw new Error("Niet beschikbaar"); return r.json(); }),
    enabled: !!userRegio,
    staleTime: 15 * 60 * 1000,
  });

  // ── Derived data ─────────────────────────────────────────────────────────
  const cursusItems = cursusData?.items ?? [];
  const hasSector = !!user?.sector;
  const displayName = user?.firstName || profiel?.naam || user?.businessName || "ondernemer";

  let documentenAantal = 0;
  if (Array.isArray(documentenData)) documentenAantal = documentenData.length;
  else if (documentenData && "documents" in documentenData) documentenAantal = (documentenData as { documents: { id: string }[] }).documents.length;

  const signaalenGerankt = rankSignalen(intelSignalen, user?.sector, userRegio);
  const topSignalen = signaalenGerankt.slice(0, 6);
  const wooSignalen = signaalenGerankt.filter((s) => s.categorie === "wetgeving" || s.categorie === "beleid").slice(0, 2);
  const actiefKansen = cursusItems.filter((i) => !i.completed).slice(0, 3);
  const openAanbestedingen = aanbestedingenData?.items?.slice(0, 4) ?? [];

  const isNieuwFn = (datum: Date) => !!lastVisit && datum > lastVisit;

  // Feed: merged & sorted intel + aanbestedingen, newest first, max 8
  const feedItems = [
    ...signaalenGerankt.slice(0, 6).map((s) => ({
      id: `intel-${s.id}`,
      label: s.titel,
      sub: `${s.categorie} · ${s.urgentie === "hoog" ? "Urgent" : "Signaal"}`,
      href: "/regels/updates",
      isNieuw: isNieuwFn(new Date(s.datum ?? s.createdAt ?? 0)),
      datum: new Date(s.datum ?? s.createdAt ?? 0).getTime(),
    })),
    ...openAanbestedingen.map((a) => ({
      id: `kans-${a.id}`,
      label: a.title,
      sub: `Aanbesteding · ${a.buyer}`,
      href: "/kansen/opdrachten",
      isNieuw: a.publicationDate ? isNieuwFn(new Date(a.publicationDate)) : false,
      datum: a.publicationDate ? new Date(a.publicationDate).getTime() : 0,
    })),
  ]
    .sort((a, b) => b.datum - a.datum)
    .slice(0, 8);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#e8edf3] p-6" data-testid="skeleton-vandaag">
        <div className="mx-auto max-w-[1400px] space-y-4">
          <Skeleton className="h-24 rounded-[28px]" />
          <Skeleton className="h-14 rounded-[28px]" />
          <Skeleton className="h-12 rounded-2xl" />
          <div className="grid grid-cols-3 gap-5">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const TABS = [
    { id: "feed" as const, label: "Feed" },
    { id: "kansen" as const, label: "Kansen" },
    { id: "regels" as const, label: "Regels" },
    { id: "kennisbank" as const, label: "Kennisbank" },
  ];

  return (
    <div className="min-h-screen bg-[#e8edf3] dark:bg-background p-4 md:p-8" data-testid="page-vandaag">
      <div className="mx-auto max-w-[1400px] rounded-[28px] border border-[#b8c7d8] dark:border-border bg-gradient-to-b from-[#eef3f8] to-[#dfe8f0] dark:from-card dark:to-background shadow-[0_20px_60px_rgba(49,78,112,0.15)] overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="px-6 pt-6 pb-5 border-b border-[#c3d0de] dark:border-border bg-[#edf2f7] dark:bg-card">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-[240px]">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#70b844] via-[#3990c8] to-[#24517d] shadow-inner shrink-0" />
              <div className="text-4xl leading-none font-black tracking-tight text-[#21486f] dark:text-foreground">OPENREGIO</div>
            </div>
            <div className="flex-1 flex items-center gap-3 rounded-2xl border border-[#b7c7d7] dark:border-border bg-white/80 dark:bg-muted/30 px-4 py-2.5 shadow-inner min-w-0">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                placeholder="Zoek in signalen, kansen en regelgeving..."
                data-testid="input-portal-search"
                className="flex-1 bg-transparent outline-none text-base placeholder:text-slate-400 text-[#21486f] dark:text-foreground min-w-0"
              />
              <button
                data-testid="button-zoek-filter"
                className="rounded-xl bg-[#2f679a] px-5 py-2 text-white text-sm font-semibold shadow-sm shrink-0 hover-elevate active-elevate-2"
              >
                Zoek en Filter
              </button>
            </div>
            <div className="text-sm text-[#516f8d] dark:text-muted-foreground hidden lg:block shrink-0">
              Welkom, {displayName}
            </div>
          </div>
        </header>

        <main className="p-5 space-y-5">

          {/* ── RegioMarkt banner ─────────────────────────────────────────── */}
          <section
            className="rounded-2xl border border-[#c0cddd] bg-white/70 dark:bg-card px-6 py-5 shadow-sm"
            data-testid="banner-regiomarkt"
          >
            <h1 className="text-3xl font-bold tracking-tight text-[#294f78] dark:text-foreground">RegioMarkt</h1>
            <p className="text-sm text-[#516f8d] dark:text-muted-foreground mt-1">
              Lokale kansen, samenwerkingen en aanbestedingen in jouw regio
              {userRegio ? ` · ${userRegio}` : ""}
            </p>
          </section>

          {/* ── Top tabs ──────────────────────────────────────────────────── */}
          <section className="grid grid-cols-4 gap-3" data-testid="portal-nav-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                data-testid={`tab-portal-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl border px-5 py-5 text-lg font-semibold shadow-sm transition-all hover-elevate ${
                  activeTab === tab.id
                    ? "border-[#2d6a9f] bg-[#2f679a] text-white"
                    : "border-[#bacedf] bg-[#dfe9f3] dark:bg-muted text-[#35587e] dark:text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </section>

          {/* ── Sector onboarding (if no sector) ─────────────────────────── */}
          {!hasSector && <SectorOnboarding />}

          {/* ── Main 3-column grid ────────────────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] gap-5 items-start">

            {/* LEFT COLUMN */}
            <aside className="space-y-4" data-testid="section-left-column">

              {/* Info / Toepassingen */}
              <div className="rounded-2xl border border-[#b8c8d8] bg-white/80 dark:bg-card overflow-hidden shadow-sm">
                <CardHeader>Info / Toepassingen</CardHeader>
                <div className="p-4 space-y-3">
                  <NavBtn icon={Monitor} label="Monitor" href="/vandaag/updates" testid="nav-monitor" />
                  <NavBtn icon={Eye} label="Inzichten" href="/regels/updates" testid="nav-inzichten" />
                  <NavBtn icon={FileText} label="Documenten" href="/regels/documenten" testid="nav-documenten" />
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link href="/regels/woo">
                      <div data-testid="nav-woo" className="rounded-2xl bg-[#4f87bb] dark:bg-primary/70 h-16 flex items-center justify-center cursor-pointer hover-elevate">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                    </Link>
                    <Link href="/regels/check">
                      <div data-testid="nav-check" className="rounded-2xl bg-[#84a9c9] dark:bg-primary/40 h-16 flex items-center justify-center cursor-pointer hover-elevate">
                        <Scale className="h-5 w-5 text-white" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Wet & Regelgeving */}
              <div className="rounded-2xl border border-[#b8c8d8] bg-white/80 dark:bg-card overflow-hidden shadow-sm">
                <CardHeader>Wet &amp; Regelgeving</CardHeader>
                <div className="p-4 space-y-3">
                  {intelLoading ? (
                    <>
                      <Skeleton className="h-14 rounded-2xl" />
                      <Skeleton className="h-14 rounded-2xl" />
                    </>
                  ) : wooSignalen.length > 0 ? (
                    wooSignalen.map((s) => (
                      <Link key={s.id} href="/regels/updates">
                        <div
                          data-testid={`woo-signaal-${s.id}`}
                          className="rounded-2xl bg-[#eef3f8] dark:bg-muted border border-[#c8d4e0] dark:border-border px-4 py-4 text-sm font-semibold text-[#35587e] dark:text-foreground cursor-pointer hover-elevate leading-snug"
                        >
                          {s.titel}
                          {s.urgentie === "hoog" && <UrgPill urgentie="hoog" />}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <>
                      <ListItem label="Nieuwe regels" href="/regels/updates" testid="woo-new-rules" />
                      <ListItem label="Kennisbank dossiers" href="/informatie/kennisbank" testid="woo-kennisbank" />
                    </>
                  )}
                </div>
              </div>

              {/* RegioBot */}
              <div className="rounded-2xl border border-[#b8c8d8] bg-white/80 dark:bg-card overflow-hidden shadow-sm">
                <CardHeader light>REGIOBOT</CardHeader>
                <Link href="/regiobot">
                  <div className="p-5 text-sm text-[#35587e] dark:text-muted-foreground font-medium cursor-pointer hover-elevate" data-testid="nav-regiobot">
                    Zoek in wet- en regelgeving met AI
                  </div>
                </Link>
              </div>

            </aside>

            {/* CENTER COLUMN */}
            <section className="space-y-4 min-w-0" data-testid="section-center">

              {/* Feed / tab content */}
              <div className="rounded-2xl border border-[#b8c8d8] bg-white/85 dark:bg-card overflow-hidden shadow-sm">
                {/* Sub-tabs */}
                <div className="flex items-center border-b border-[#d2dbe4] dark:border-border bg-[#eef3f8] dark:bg-muted/40 text-[#385b80] dark:text-muted-foreground font-semibold text-sm">
                  <button
                    data-testid="tab-nieuws"
                    onClick={() => setActiveTab("feed")}
                    className={`px-5 py-4 border-r border-[#d2dbe4] dark:border-border transition-colors ${activeTab === "feed" ? "bg-white dark:bg-card text-[#2f679a] dark:text-primary" : "hover:bg-white/60"}`}
                  >
                    Feed
                  </button>
                  <button
                    data-testid="tab-kansen"
                    onClick={() => setActiveTab("kansen")}
                    className={`px-5 py-4 border-r border-[#d2dbe4] dark:border-border transition-colors ${activeTab === "kansen" ? "bg-white dark:bg-card text-[#2f679a] dark:text-primary" : "hover:bg-white/60"}`}
                  >
                    Kansen
                  </button>
                  <div className="ml-auto px-5 py-4">
                    <Link href="/regels/updates">
                      <button data-testid="btn-signaleren" className="text-xs font-semibold text-[#2f679a] dark:text-primary hover:underline flex items-center gap-1">
                        <Bell className="h-3.5 w-3.5" />
                        Signalen
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold text-[#304f73] dark:text-foreground mb-4">
                    {activeTab === "feed" ? "Vandaag in jouw regio" : "Kansen & Acties"}
                  </h2>

                  {/* FEED tab */}
                  {activeTab === "feed" && (
                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1" data-testid="section-feed">
                      {intelLoading || cursusLoading ? (
                        [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
                      ) : feedItems.length === 0 ? (
                        <div className="text-center py-8 text-[#516f8d] dark:text-muted-foreground text-sm">
                          Geen updates beschikbaar. Kom later terug.
                        </div>
                      ) : (
                        feedItems.map((item) => (
                          <FeedCard key={item.id} label={item.label} sub={item.sub} href={item.href} testid={`feed-item-${item.id}`} />
                        ))
                      )}
                    </div>
                  )}

                  {/* KANSEN tab */}
                  {activeTab === "kansen" && (
                    <div className="space-y-3" data-testid="section-kansen-acties">
                      {cursusLoading ? (
                        [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
                      ) : actiefKansen.length === 0 && openAanbestedingen.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="h-8 w-8 text-[#2f679a] mx-auto mb-2" />
                          <p className="text-sm text-[#516f8d] dark:text-muted-foreground">Alle acties voltooid!</p>
                        </div>
                      ) : (
                        <>
                          {actiefKansen.map((item) => (
                            <FeedCard
                              key={item.id}
                              label={item.title}
                              sub={`${item.minutes} min · nog ${item.daysLeft} ${item.daysLeft === 1 ? "dag" : "dagen"}`}
                              href="/vandaag/acties"
                              testid={`action-cursus-${item.id}`}
                            />
                          ))}
                          {openAanbestedingen.map((item) => (
                            <FeedCard
                              key={item.id}
                              label={item.title}
                              sub={`Aanbesteding · ${item.buyer}${item.daysLeft !== null ? ` · nog ${item.daysLeft} dagen` : ""}`}
                              href="/kansen/opdrachten"
                              testid={`action-aanbesteding-${item.id}`}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* REGELS tab */}
                  {activeTab === "regels" && (
                    <div className="space-y-3" data-testid="section-regels-tab">
                      {intelLoading ? (
                        [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
                      ) : topSignalen.length === 0 ? (
                        <p className="text-sm text-[#516f8d] py-4">Geen regelupdates beschikbaar.</p>
                      ) : (
                        topSignalen.map((s) => (
                          <FeedCard
                            key={s.id}
                            label={s.titel}
                            sub={`${s.categorie} · ${s.urgentie === "hoog" ? "Urgent" : "Signaal"}`}
                            href="/regels/updates"
                            testid={`regels-signaal-${s.id}`}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {/* KENNISBANK tab */}
                  {activeTab === "kennisbank" && (
                    <div className="space-y-3" data-testid="section-kennisbank-tab">
                      {[
                        { label: "Praktische dossiers", sub: "Stap-voor-stap handleidingen", href: "/informatie/kennisbank", testid: "kb-dossiers" },
                        { label: "Wetgeving Monitor", sub: "Alle actuele wetswijzigingen", href: "/regels/updates", testid: "kb-wetgeving" },
                        { label: "Intel & Overheid Monitor", sub: "Signalen van overheidsinstanties", href: "/vandaag/updates", testid: "kb-intel" },
                        { label: "Vraag Hulp aan Groeilab", sub: "AI-assistent voor ondernemers", href: "/regiobot", testid: "kb-groeilab" },
                        { label: "Kennisbank Dossiers", sub: "Uitgebreide sectordossiers", href: "/informatie/kennisbank", testid: "kb-dossiers-2" },
                        { label: "Initiatieven in de regio", sub: "Samenwerkingskansen", href: "/kansen/in-de-buurt", testid: "kb-initiatieven" },
                      ].map((item) => (
                        <FeedCard key={item.testid} label={item.label} sub={item.sub} href={item.href} testid={item.testid} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Wet- en regelgeving card (always visible below feed) */}
              <div className="rounded-2xl border border-[#b8c8d8] bg-white/85 dark:bg-card overflow-hidden shadow-sm" data-testid="section-regels">
                <div className="px-5 py-4 border-b border-[#d2dbe4] dark:border-border text-xl font-bold text-[#304f73] dark:text-foreground">
                  Wet- en regelgeving
                </div>
                <div className="p-4">
                  <div className="h-44 rounded-2xl bg-gradient-to-r from-[#8cb0ce] via-[#dbe8f4] to-[#d8c970] dark:from-primary/30 dark:via-primary/10 dark:to-muted" data-testid="img-regels" />
                  {intelLoading ? (
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-6 w-3/4 rounded" />
                      <Skeleton className="h-4 w-full rounded" />
                    </div>
                  ) : topSignalen[0] ? (
                    <Link href="/regels/updates">
                      <h3 className="mt-4 text-lg font-bold text-[#304f73] dark:text-foreground hover:underline cursor-pointer leading-snug">
                        {topSignalen[0].titel}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-muted-foreground line-clamp-3">
                        {topSignalen[0].samenvatting}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <h3 className="mt-4 text-lg font-bold text-[#304f73] dark:text-foreground">
                        Klein maar fijn, doorlopend herstel en groei
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-muted-foreground">
                        Regionale briefing over verandering, impact en wat jij vandaag moet regelen.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN */}
            <aside className="space-y-4" data-testid="section-right-column">

              {/* Documenten / Monitor */}
              <div className="rounded-2xl border border-[#b8c8d8] bg-white/85 dark:bg-card overflow-hidden shadow-sm">
                <CardHeader light>Documenten / Monitor</CardHeader>
                <div className="p-4 space-y-3" data-testid="section-documenten-monitor">
                  <ListItem
                    label="Vraag documentatie aan..."
                    href="/regels/documenten"
                    testid="doc-aanvragen"
                    color="bg-[#eef4ef] text-[#3f6f46] dark:bg-emerald-900/20 dark:text-emerald-300"
                  />
                  <ListItem
                    label={`Rapportages${documentenAantal > 0 ? ` (${documentenAantal})` : ""}`}
                    href="/vandaag/updates"
                    testid="doc-rapportages"
                  />
                  <ListItem
                    label="WOO Verzoeken"
                    href="/regels/woo"
                    testid="doc-woo"
                  />
                </div>
              </div>

              {/* Acties / Signalen */}
              <div className="rounded-2xl border border-[#b8c8d8] bg-white/85 dark:bg-card overflow-hidden shadow-sm">
                <CardHeader light>Acties / Signalen</CardHeader>
                <div className="p-4 space-y-3" data-testid="section-acties-signalen">
                  {intelLoading ? (
                    [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-2xl" />)
                  ) : topSignalen.length === 0 ? (
                    <p className="text-sm text-[#516f8d] py-2">Geen actieve signalen.</p>
                  ) : (
                    topSignalen.slice(0, 4).map((s, idx) => {
                      const colors = [
                        "bg-[#eef7ee] text-[#4c7c40] dark:bg-emerald-900/20 dark:text-emerald-300",
                        "bg-[#faf3e9] text-[#9b7a36] dark:bg-amber-900/20 dark:text-amber-300",
                        "bg-[#f5f7fa] text-[#445e77] dark:bg-muted dark:text-muted-foreground",
                        "bg-[#f5f7fa] text-[#445e77] dark:bg-muted dark:text-muted-foreground",
                      ];
                      return (
                        <Link key={s.id} href="/regels/updates">
                          <div
                            data-testid={`signaal-right-${s.id}`}
                            className={`rounded-2xl px-4 py-4 text-sm font-semibold cursor-pointer hover-elevate leading-snug ${colors[idx] ?? colors[2]}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="line-clamp-2">{s.titel}</span>
                              {s.urgentie === "hoog" && <UrgPill urgentie="hoog" />}
                            </div>
                            <span className="text-[11px] opacity-70 capitalize mt-0.5 block">{s.categorie}</span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                  {topSignalen.length > 4 && (
                    <Link href="/regels/updates">
                      <button data-testid="btn-alle-signalen" className="w-full text-sm font-semibold text-[#2f679a] dark:text-primary hover:underline pt-1">
                        Alle signalen bekijken →
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </section>

          {/* ── Bottom 3-column panels ────────────────────────────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5" data-testid="section-bottom-panels">
            <div className="rounded-2xl border border-[#b8c8d8] bg-white/80 dark:bg-card overflow-hidden shadow-sm">
              <CardHeader light>Kennisbank</CardHeader>
              <div className="p-4 space-y-3">
                <ListItem label="Praktische dossiers" href="/informatie/kennisbank" testid="bottom-dossiers" />
                <ListItem label="Uitleg &amp; handleidingen" href="/informatie/kennisbank" testid="bottom-handleidingen" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#b8c8d8] bg-white/80 dark:bg-card overflow-hidden shadow-sm">
              <CardHeader light>Kennisbank / Regelgeving</CardHeader>
              <div className="p-4 space-y-3">
                <ListItem label="Wetgeving Monitor" href="/regels/updates" testid="bottom-wetgeving" />
                <ListItem label="Kennisbank Dossiers" href="/informatie/kennisbank" testid="bottom-kennisbank" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#b8c8d8] bg-white/80 dark:bg-card overflow-hidden shadow-sm">
              <CardHeader light>Updates / Provincie</CardHeader>
              <div className="p-4 space-y-3">
                <ListItem label="Regio Reports" href="/vandaag/updates" testid="bottom-regio-reports" />
                <ListItem label="Provincie Updates" href="/vandaag/updates" testid="bottom-provincie-updates" />
              </div>
            </div>
          </section>

          {/* ── Bottom 2-wide panels ──────────────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5" data-testid="section-kennisbank-wide">

            {/* Kennisbank featured */}
            <div className="rounded-2xl border border-[#b8c8d8] bg-white/75 dark:bg-card overflow-hidden shadow-sm">
              <CardHeader light>Kennisbank</CardHeader>
              <div className="p-4 grid grid-cols-2 gap-3">
                <Link href="/informatie/kennisbank">
                  <div data-testid="kennisbank-featured" className="rounded-2xl bg-[#2f679a] text-white p-5 text-sm font-bold cursor-pointer hover-elevate">
                    Praktische dossiers
                  </div>
                </Link>
                <ListItem label="Uitleg &amp; handleidingen" href="/informatie/kennisbank" testid="kennisbank-handleidingen" color="bg-[#dfe9f3] text-[#35587e] dark:bg-muted dark:text-foreground" />
                <ListItem label="Intel &amp; Overheid Monitor" href="/vandaag/updates" testid="kennisbank-intel" />
                <ListItem label="Kennisbank Dossiers" href="/informatie/kennisbank" testid="kennisbank-dossiers" />
              </div>
            </div>

            {/* Updates/Provincie featured */}
            <div className="rounded-2xl border border-[#b8c8d8] bg-white/75 dark:bg-card overflow-hidden shadow-sm" data-testid="section-updates-provincie">
              <CardHeader light>Updates / Provincie</CardHeader>
              <div className="p-4">
                <div className="h-28 rounded-2xl bg-gradient-to-r from-[#c9da8f] via-[#e8f0cc] to-[#7fa2c4] dark:from-primary/20 dark:via-primary/10 dark:to-muted" />
                {intelLoading ? (
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                  </div>
                ) : topSignalen[1] ? (
                  <Link href="/vandaag/updates">
                    <h3 className="mt-4 text-lg font-bold text-[#304f73] dark:text-foreground hover:underline cursor-pointer leading-snug">
                      {topSignalen[1].titel}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-muted-foreground line-clamp-2">
                      {topSignalen[1].samenvatting}
                    </p>
                  </Link>
                ) : (
                  <>
                    <h3 className="mt-4 text-lg font-bold text-[#304f73] dark:text-foreground">
                      Klein maar fijn, doorlopend herstel en groei
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-muted-foreground">
                      Snel scanbare feed met regionale updates, regelgeving en kennisblokken in één doorlopende scroll.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

        </main>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="px-8 py-6 border-t border-[#c3d0de] dark:border-border text-center text-sm tracking-wide text-[#516f8d] dark:text-muted-foreground bg-[#e8eef4] dark:bg-muted/30">
          Feed &nbsp;|&nbsp; Kansen &nbsp;|&nbsp; Regels &nbsp;|&nbsp; Kennisbank
        </footer>

      </div>
    </div>
  );
}
