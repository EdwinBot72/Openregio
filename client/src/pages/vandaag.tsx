import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  TrendingUp,
  Users,
  Store,
  FolderOpen,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Plus,
  Building2,
  AlertCircle,
  Newspaper,
  Map as MapIcon,
  Sparkles,
  Compass,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import type { Post, IntelSignaal, LokaalAanbod, Bedrijfsprofiel } from "@shared/schema";
import { BusinessMapView } from "@/components/BusinessMapView";

type ProfielData = {
  naam?: string;
  beschrijving?: string;
  websiteUrl?: string;
  regio?: string;
  categorieId?: string;
};

type CooperatiefStats = {
  totalMembers: number;
  basicMembers: number;
  proMembers: number;
};

type WooDossierItem = {
  id: number;
  subject: string;
  authority: string;
  status: string | null;
  createdAt?: string | null;
};

type NieuwsItem = {
  id: string;
  title: string;
  link: string;
  source?: string;
  publishedAt: string;
};

type NieuwsResponse = {
  items: NieuwsItem[];
  fetchedAt: string;
};

const CATEGORIE_LABELS: Record<string, string> = {
  retail: "Retail & Winkels",
  food: "Horeca & Voeding",
  services: "Zakelijke Diensten",
  tech: "Technologie & ICT",
  health: "Gezondheid & Welzijn",
  education: "Onderwijs & Training",
  creative: "Creatief & Media",
  construction: "Bouw & Renovatie",
  agriculture: "Landbouw & Tuinbouw",
  transport: "Transport & Logistiek",
};

const URGENTIE_KLEUR: Record<string, { bg: string; fg: string; label: string }> = {
  hoog: { bg: "#fef2f2", fg: "#b91c1c", label: "Urgent" },
  normaal: { bg: "#eff6ff", fg: "#1f5fae", label: "Update" },
  laag: { bg: "#f8fafc", fg: "#64748b", label: "Info" },
};

const POST_TYPE_LABEL: Record<string, string> = {
  vraag: "Vraag",
  aanbieding: "Aanbod",
  aanbod: "Aanbod",
  lead: "Lead",
  event: "Event",
  update: "Update",
};

// Dossiers met deze status vragen actie van de ondernemer
const ACTIE_DOSSIER_STATUSSEN = new Set(["intake", "extracted", "questions", "response_received"]);
const OPEN_DOSSIER_STATUSSEN = new Set([
  "intake", "extracted", "questions", "generated", "sent", "response_received", "ingebreke_gesteld",
]);

function relativeTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: nl });
}

function daysSince(value: string | Date | null | undefined): number {
  if (!value) return 9999;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 9999;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function SectieKop({
  titel,
  subtitel,
  bekijkAlles,
  bekijkAllesLabel = "Bekijk alles",
}: {
  titel: string;
  subtitel?: string;
  bekijkAlles?: string;
  bekijkAllesLabel?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 14,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0b2240", margin: 0, letterSpacing: "-.2px" }}>
          {titel}
        </h2>
        {subtitel && (
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", lineHeight: 1.5 }}>
            {subtitel}
          </p>
        )}
      </div>
      {bekijkAlles && (
        <Link
          href={bekijkAlles}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1f5fae",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
          data-testid={`link-bekijk-alles-${titel.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {bekijkAllesLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function LegeStaat({
  icon: Icon,
  tekst,
  cta,
}: {
  icon: typeof Bell;
  tekst: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div style={{ textAlign: "center", padding: "20px 12px", color: "#94a3b8", fontSize: 13 }}>
      <Icon className="h-7 w-7" style={{ margin: "0 auto 8px", opacity: 0.45 }} />
      <p style={{ margin: 0 }}>{tekst}</p>
      {cta && (
        <Link
          href={cta.href}
          className="openregio-button openregio-button-outline openregio-button-small"
          style={{ marginTop: 12, display: "inline-flex" }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function KpiTile({
  icon: Icon,
  value,
  label,
  sub,
  href,
  testId,
}: {
  icon: typeof Bell;
  value: number | string;
  label: string;
  sub: string;
  href: string;
  testId: string;
}) {
  return (
    <Link
      href={href}
      data-testid={testId}
      style={{
        display: "block",
        background: "#fff",
        border: "1px solid #e6ebf2",
        borderRadius: 16,
        padding: "16px 18px",
        textDecoration: "none",
        color: "inherit",
      }}
      className="hover-elevate"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div
          style={{
            background: "#eff6ff",
            color: "#1f5fae",
            borderRadius: 12,
            padding: 9,
            display: "inline-flex",
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".4px" }}>
          Nu
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#0b2240", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{sub}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "#475569" }}>{label}</div>
    </Link>
  );
}

export default function VandaagPage() {
  usePageTitle("Vandaag");
  const { user, isLoading: authLoading } = useAuth();

  const { data: profiel } = useQuery<ProfielData | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const { data: stats } = useQuery<CooperatiefStats>({
    queryKey: ["/api/cooperatief-stats"],
    enabled: !!user,
  });

  const { data: signalen = [], isLoading: signalenLoading } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen"],
    enabled: !!user,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });

  const { data: marktItems = [], isLoading: marktLoading } = useQuery<LokaalAanbod[]>({
    queryKey: ["/api/lokaal-marktplaats"],
    enabled: !!user,
  });

  const { data: dossiers = [], isLoading: dossiersLoading } = useQuery<WooDossierItem[]>({
    queryKey: ["/api/woo/dossiers"],
    enabled: !!user,
  });

  const { data: nieuwsData, isLoading: nieuwsLoading } = useQuery<NieuwsResponse>({
    queryKey: ["/api/news"],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });
  const topNieuws = (nieuwsData?.items ?? []).slice(0, 3);

  const { data: bedrijven = [], isLoading: bedrijvenLoading } = useQuery<Bedrijfsprofiel[]>({
    queryKey: ["/api/business-profiles/public"],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isPro = user?.plan === "pro";
  const planLabel = isPro ? "Pro-bijdrager" : "Basic lid";
  const displayFirstName =
    user?.firstName ||
    (profiel?.naam ? profiel.naam.split(" ")[0] : "") ||
    "ondernemer";
  const bedrijfsnaam = profiel?.naam || user?.businessName || "Mijn onderneming";
  const categorieLabel = profiel?.categorieId
    ? CATEGORIE_LABELS[profiel.categorieId] ?? profiel.categorieId
    : "";
  const regioLabel = profiel?.regio || user?.region || "jouw regio";

  // Sorteer signalen: urgent eerst, dan datum
  const sortedSignalen = [...signalen].sort((a, b) => {
    const order: Record<string, number> = { hoog: 0, normaal: 1, laag: 2 };
    const ua = order[a.urgentie] ?? 1;
    const ub = order[b.urgentie] ?? 1;
    if (ua !== ub) return ua - ub;
    const da = a.datum ? new Date(a.datum).getTime() : 0;
    const db = b.datum ? new Date(b.datum).getTime() : 0;
    return db - da;
  });

  // KPI-tellingen
  const updatesDezeWeek = signalen.filter((s) => daysSince(s.datum) <= 7).length;
  const acties = dossiers.filter((d) => d.status && ACTIE_DOSSIER_STATUSSEN.has(d.status)).length;
  const kansenCount = posts.filter((p) => {
    const t = p.type;
    return (t === "vraag" || t === "aanbod" || t === "aanbieding" || t === "lead" || t === "event")
      && daysSince(p.createdAt) <= 7;
  }).length;
  const dossiersOpen = dossiers.filter((d) => !d.status || OPEN_DOSSIER_STATUSSEN.has(d.status)).length;

  // Aandacht-feed: combineer top signaal + top dossier-actie + top kans (post)
  type AandachtItem =
    | { kind: "signaal"; data: IntelSignaal }
    | { kind: "dossier"; data: WooDossierItem }
    | { kind: "kans"; data: Post };

  const aandachtItems: AandachtItem[] = [];
  const topSignaal = sortedSignalen[0];
  if (topSignaal) aandachtItems.push({ kind: "signaal", data: topSignaal });
  const topActieDossier = dossiers.find((d) => d.status && ACTIE_DOSSIER_STATUSSEN.has(d.status));
  if (topActieDossier) aandachtItems.push({ kind: "dossier", data: topActieDossier });
  const topKans = posts
    .filter((p) => p.type === "lead" || p.type === "vraag" || p.type === "event")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  if (topKans) aandachtItems.push({ kind: "kans", data: topKans });
  if (aandachtItems.length < 3) {
    sortedSignalen.slice(1).forEach((s) => {
      if (aandachtItems.length < 3) aandachtItems.push({ kind: "signaal", data: s });
    });
  }

  // "Acties voor jou" — dossiers die actie vragen
  const actieDossiers = dossiers
    .filter((d) => d.status && ACTIE_DOSSIER_STATUSSEN.has(d.status))
    .slice(0, 4);

  // Posts: alle types vraag/aanbod/lead/event, 3 nieuwste
  const samenwerkPosts = posts
    .filter((p) => ["vraag", "aanbod", "aanbieding", "lead", "event"].includes(p.type))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Marktplaats: 3 nieuwste op createdAt
  const topMarkt = [...marktItems]
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    })
    .slice(0, 3);

  // Dossiers: 3 nieuwste op createdAt
  const topDossiers = [...dossiers]
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    })
    .slice(0, 3);

  if (authLoading) {
    return (
      <div className="openregio-dashboard" data-testid="skeleton-vandaag">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="openregio-dashboard" data-testid="page-vandaag">
      {/* Begroeting */}
      <div className="openregio-greeting">
        <div>
          <h1 data-testid="text-greeting">
            Welkom, {displayFirstName}
            <span className="openregio-greeting-wave" role="img" aria-label="zwaaiende hand">
              👋
            </span>
          </h1>
          <p style={{ color: "#475569", fontSize: 14, margin: "6px 0 0", lineHeight: 1.6 }}>
            Dit speelt nu in <strong style={{ color: "#0b2240" }}>{regioLabel}</strong>
            {categorieLabel && <> voor <strong style={{ color: "#0b2240" }}>{categorieLabel.toLowerCase()}</strong></>} —
            samengebracht voor {bedrijfsnaam}.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/groei/profiel"
            className="openregio-button openregio-button-outline"
            data-testid="button-profiel-bekijken"
          >
            Profiel bekijken
          </Link>
          {!isPro && (
            <Link
              href="/lidmaatschap?plan=pro"
              className="openregio-button openregio-button-pro"
              data-testid="button-upgrade-header"
            >
              Upgrade naar Pro
            </Link>
          )}
        </div>
      </div>

      <div className="openregio-greeting-plan" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span
          className={`openregio-plan-badge ${isPro ? "openregio-plan-pro" : "openregio-plan-basic"}`}
          data-testid="badge-plan"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <span>{planLabel}</span>
          <span style={{ opacity: 0.55 }}>·</span>
          <span style={{ fontWeight: 700 }}>{bedrijfsnaam}</span>
          {categorieLabel && (
            <>
              <span style={{ opacity: 0.55 }}>·</span>
              <span style={{ fontWeight: 600 }}>{categorieLabel}</span>
            </>
          )}
        </span>
        {stats && (
          <span style={{ fontSize: 12, color: "#64748b" }} data-testid="text-leden-totaal">
            {stats.totalMembers} ondernemers in OpenRegio
          </span>
        )}
      </div>

      {/* KPI-tegels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 18,
          marginBottom: 18,
        }}
        data-testid="kpi-grid"
      >
        <KpiTile
          icon={Bell}
          value={updatesDezeWeek}
          sub="nieuw"
          label="Updates deze week"
          href="/regels/updates"
          testId="kpi-updates"
        />
        <KpiTile
          icon={CheckCircle2}
          value={acties}
          sub="open"
          label="Acties voor jou"
          href="/regels/woo"
          testId="kpi-acties"
        />
        <KpiTile
          icon={TrendingUp}
          value={kansenCount}
          sub="recent"
          label="Kansen in netwerk"
          href="/network"
          testId="kpi-kansen"
        />
        <KpiTile
          icon={FolderOpen}
          value={dossiersOpen}
          sub="lopend"
          label="Lopende dossiers"
          href="/regels/woo"
          testId="kpi-dossiers"
        />
      </div>

      {/* RegioScan-CTA: voor Pro een directe ingang, voor Basic een teaser */}
      {isPro ? (
        <Link
          href="/pro/regioscan"
          data-testid="cta-regioscan-pro"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 14,
            padding: "16px 18px",
            border: "1px solid #cfe1ff",
            borderRadius: 14,
            background: "linear-gradient(135deg, #eaf2ff 0%, #f7faff 100%)",
            color: "inherit",
            textDecoration: "none",
            marginBottom: 16,
          }}
          className="hover-elevate"
        >
          <span style={{ display: "inline-flex", width: 44, height: 44, borderRadius: 12, background: "#1f5fae", alignItems: "center", justifyContent: "center" }}>
            <Compass className="h-5 w-5" style={{ color: "#fff" }} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", flex: "1 1 220px" }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "#1f5fae" }}>
              Pro · RegioScan
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0b2240" }}>Doe je RegioScan</span>
            <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              Brancheafhankelijke scan met regels, kansen, op te vragen documenten en concept Woo-verzoek voor {regioLabel}.
            </span>
          </span>
          <span className="openregio-button openregio-button-primary" style={{ flexShrink: 0 }}>
            Start scan
            <ArrowRight className="h-4 w-4" style={{ marginLeft: 6, display: "inline-block" }} />
          </span>
        </Link>
      ) : (
        <div
          data-testid="cta-regioscan-teaser"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 14,
            padding: "16px 18px",
            border: "1px solid #fde6c8",
            borderRadius: 14,
            background: "linear-gradient(135deg, #fff7ed 0%, #fffbf3 100%)",
            marginBottom: 16,
          }}
        >
          <span style={{ display: "inline-flex", width: 44, height: 44, borderRadius: 12, background: "#f28a1a", alignItems: "center", justifyContent: "center" }}>
            <Compass className="h-5 w-5" style={{ color: "#fff" }} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", flex: "1 1 220px" }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "#c2410c" }}>
              Pro-functie · RegioScan
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0b2240" }}>Brengt jouw regels en kansen in kaart</span>
            <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              Lokale besluiten, kansen, op te vragen documenten en een concept Woo-verzoek — inclusief in Pro.
            </span>
          </span>
          <Link
            href="/lidmaatschap?plan=pro"
            className="openregio-button openregio-button-pro"
            style={{ flexShrink: 0 }}
            data-testid="cta-regioscan-upgrade"
          >
            Upgrade naar Pro
          </Link>
        </div>
      )}

      {/* Ledenstats — community in cijfers */}
      <div className="openregio-dashboard-stats" data-testid="section-ledenstats" style={{ marginTop: 16 }}>
        <div className="openregio-stat-card" data-testid="stat-totaal">
          <h3>Totaal leden</h3>
          <p className="openregio-stat-number" data-testid="text-stat-totaal">
            {stats ? stats.totalMembers : "—"}
          </p>
        </div>
        <div className="openregio-stat-card" data-testid="stat-basic">
          <h3>Basic leden</h3>
          <p className="openregio-stat-number" data-testid="text-stat-basic">
            {stats ? stats.basicMembers : "—"}
          </p>
        </div>
        <div className="openregio-stat-card" data-testid="stat-pro">
          <h3>Pro leden</h3>
          <p className="openregio-stat-number" data-testid="text-stat-pro">
            {stats ? stats.proMembers : "—"}
          </p>
        </div>
      </div>

      {/* Kaart — wie zit waar */}
      <section className="openregio-card" data-testid="section-ledenkaart" style={{ marginTop: 16 }}>
        <SectieKop
          titel="Wie zit waar?"
          subtitel="Klik op een marker om het bedrijfsprofiel te bekijken."
          bekijkAlles="/network"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", margin: "4px 0 12px" }}>
          <MapIcon className="h-4 w-4" style={{ color: "#1f5fae" }} />
          <span data-testid="text-kaart-aantal">
            {bedrijvenLoading ? "Bedrijven worden geladen…" : `${bedrijven.length} bedrijven op de kaart`}
          </span>
        </div>
        {bedrijvenLoading ? (
          <Skeleton className="h-[500px] w-full rounded-lg" />
        ) : bedrijven.length === 0 ? (
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }} data-testid="text-kaart-leeg">
            Er zijn nog geen bedrijven met regio bekend.
          </p>
        ) : (
          <BusinessMapView businesses={bedrijven} />
        )}
      </section>

      {/* 1. Wat vraagt nu aandacht — gemixte feed */}
      <section className="openregio-card" data-testid="section-aandacht">
        <SectieKop
          titel="Wat vraagt nu aandacht?"
          subtitel="De belangrijkste regelupdate, openstaande dossier-actie en lopende kans bij elkaar."
          bekijkAlles="/regels/updates"
        />
        {signalenLoading || dossiersLoading || postsLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : aandachtItems.length === 0 ? (
          <LegeStaat
            icon={Bell}
            tekst="Geen actuele zaken die nu aandacht vragen."
            cta={{ href: "/regels/updates", label: "Bekijk archief" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {aandachtItems.map((item, i) => {
              if (item.kind === "signaal") {
                const s = item.data;
                const u = URGENTIE_KLEUR[s.urgentie] ?? URGENTIE_KLEUR.normaal;
                return (
                  <Link
                    key={`s-${s.id}`}
                    href="/regels/updates"
                    data-testid={`item-aandacht-signaal-${s.id}`}
                    style={{
                      display: "flex", flexDirection: "column", gap: 6,
                      padding: "14px 16px", border: "1px solid #e6ebf2", borderRadius: 14,
                      textDecoration: "none", color: "inherit", background: "#fafbfd",
                    }}
                    className="hover-elevate"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", background: u.bg, color: u.fg, padding: "3px 8px", borderRadius: 999 }}>
                        Regelupdate · {u.label}
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <MapPin className="h-3 w-3" />{s.regio}
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{relativeTime(s.datum)}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", lineHeight: 1.4 }}>{s.titel}</div>
                    {s.samenvatting && (
                      <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.samenvatting}
                      </div>
                    )}
                  </Link>
                );
              }
              if (item.kind === "dossier") {
                const d = item.data;
                return (
                  <Link
                    key={`d-${d.id}`}
                    href="/regels/woo"
                    data-testid={`item-aandacht-dossier-${d.id}`}
                    style={{
                      display: "flex", flexDirection: "column", gap: 6,
                      padding: "14px 16px", border: "1px solid #fed7aa", borderRadius: 14,
                      textDecoration: "none", color: "inherit", background: "#fff7ed",
                    }}
                    className="hover-elevate"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", background: "#fff", color: "#c2410c", padding: "3px 8px", borderRadius: 999 }}>
                        Actie · Dossier
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{d.authority}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{d.status}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", lineHeight: 1.4 }}>{d.subject}</div>
                    <div style={{ fontSize: 13, color: "#475569" }}>Open dit dossier en zet de volgende stap.</div>
                  </Link>
                );
              }
              const p = item.data;
              return (
                <Link
                  key={`p-${p.id}-${i}`}
                  href="/network"
                  data-testid={`item-aandacht-kans-${p.id}`}
                  style={{
                    display: "flex", flexDirection: "column", gap: 6,
                    padding: "14px 16px", border: "1px solid #d1fae5", borderRadius: 14,
                    textDecoration: "none", color: "inherit", background: "#ecfdf5",
                  }}
                  className="hover-elevate"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", background: "#fff", color: "#047857", padding: "3px 8px", borderRadius: 999 }}>
                      Kans · {POST_TYPE_LABEL[p.type] ?? p.type}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{p.region}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{relativeTime(p.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", lineHeight: 1.4 }}>{p.title}</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Acties voor jou — dossiers die actie vragen */}
      <section className="openregio-card" data-testid="section-acties" style={{ marginTop: 16 }}>
        <SectieKop
          titel="Acties voor jou"
          subtitel="Concrete vervolgstappen op je eigen dossiers."
          bekijkAlles="/regels/woo"
        />
        {dossiersLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : actieDossiers.length === 0 ? (
          <LegeStaat
            icon={CheckCircle2}
            tekst="Geen openstaande acties — alles bij. Mooi!"
          />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {actieDossiers.map((d) => (
              <li key={d.id}>
                <Link
                  href="/regels/woo"
                  data-testid={`item-actie-${d.id}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    padding: "12px 14px", border: "1px solid #e6ebf2", borderRadius: 12,
                    textDecoration: "none", color: "inherit",
                  }}
                  className="hover-elevate"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <AlertCircle className="h-4 w-4" style={{ color: "#c2410c", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0b2240", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.subject}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {d.authority} · {d.status}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" style={{ color: "#94a3b8", flexShrink: 0 }} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Samenwerken & vragen — alle post types */}
      <section className="openregio-card" data-testid="section-vragen" style={{ marginTop: 16 }}>
        <SectieKop
          titel="Samenwerken & vragen"
          subtitel="Wat ondernemers nu delen — vragen, aanbod, leads en events."
          bekijkAlles="/network"
          bekijkAllesLabel="Naar netwerk"
        />
        {postsLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : samenwerkPosts.length === 0 ? (
          <LegeStaat
            icon={Users}
            tekst="Nog niets gedeeld. Plaats zelf de eerste!"
            cta={{ href: "/network", label: "Plaats post" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {samenwerkPosts.map((p) => (
              <Link
                key={p.id}
                href="/network"
                data-testid={`item-post-${p.id}`}
                style={{
                  display: "flex", flexDirection: "column", gap: 4,
                  padding: "12px 14px", border: "1px solid #e6ebf2", borderRadius: 12,
                  textDecoration: "none", color: "inherit", background: "#fff",
                }}
                className="hover-elevate"
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", background: "#f0f4ff", color: "#1f5fae", padding: "2px 8px", borderRadius: 999 }}>
                    {POST_TYPE_LABEL[p.type] ?? p.type}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{p.region}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{relativeTime(p.createdAt)}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240" }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {p.body}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Lokale marktplaats */}
      <section className="openregio-card" data-testid="section-marktplaats" style={{ marginTop: 16 }}>
        <SectieKop
          titel="Lokale marktplaats"
          subtitel="Vraag & aanbod tussen ondernemers — diensten, ruimte, materieel en de rommelmarkt."
          bekijkAlles="/lokaal-marktplaats"
          bekijkAllesLabel="Bekijk alles"
        />
        {marktLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : topMarkt.length === 0 ? (
          <LegeStaat
            icon={Store}
            tekst="Nog geen aanbod. Wees de eerste — plaats je vraag of aanbod."
            cta={{ href: "/lokaal-marktplaats", label: "Plaats aanbod" }}
          />
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {topMarkt.map((m) => (
                <Link
                  key={m.id}
                  href="/lokaal-marktplaats"
                  data-testid={`item-markt-${m.id}`}
                  style={{
                    display: "flex", flexDirection: "column", gap: 6,
                    padding: "12px 14px", border: "1px solid #e6ebf2", borderRadius: 12,
                    textDecoration: "none", color: "inherit", background: "#fff",
                  }}
                  className="hover-elevate"
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                      background: m.type === "bied" ? "#ecfdf5" : "#eff6ff",
                      color: m.type === "bied" ? "#047857" : "#1f5fae",
                      padding: "2px 8px", borderRadius: 999,
                    }}>
                      {m.type === "bied" ? "Ik bied" : "Ik zoek"}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{m.regio}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", lineHeight: 1.35 }}>{m.titel}</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {m.beschrijving}
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              <Link
                href="/lokaal-marktplaats"
                className="openregio-button openregio-button-outline openregio-button-small"
                data-testid="button-plaats-marktplaats"
              >
                <Plus className="h-3.5 w-3.5" /> Plaats aanbod
              </Link>
            </div>
          </>
        )}
      </section>

      {/* 5. Gezamenlijke dossiers */}
      <section className="openregio-card" data-testid="section-dossiers" style={{ marginTop: 16 }}>
        <SectieKop
          titel="Gezamenlijke dossiers"
          subtitel="Wat ondernemers samen oppakken via Woo-trajecten richting overheid."
          bekijkAlles="/regels/woo"
        />
        {dossiersLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : topDossiers.length === 0 ? (
          <LegeStaat
            icon={FolderOpen}
            tekst="Nog geen lopende dossiers."
            cta={{ href: "/regels/woo", label: "Bekijk Woo-bibliotheek" }}
          />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {topDossiers.map((d) => {
              const statusKleur = d.status && ACTIE_DOSSIER_STATUSSEN.has(d.status)
                ? { bg: "#fff7ed", fg: "#c2410c" }
                : d.status === "closed"
                  ? { bg: "#f1f5f9", fg: "#475569" }
                  : { bg: "#eff6ff", fg: "#1f5fae" };
              // Geen dossier-specifieke route beschikbaar; fallback naar Woo-bibliotheek
              // met dossier id als hash voor toekomstige scroll/anchor.
              const dossierHref = `/regels/woo#dossier-${d.id}`;
              return (
                <li key={d.id}>
                  <Link
                    href={dossierHref}
                    data-testid={`item-dossier-${d.id}`}
                    style={{
                      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
                      padding: "12px 14px", border: "1px solid #e6ebf2", borderRadius: 10,
                      textDecoration: "none", color: "inherit",
                    }}
                    className="hover-elevate"
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0b2240" }}>{d.subject}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        {d.authority}
                        {d.createdAt && <> · {relativeTime(d.createdAt)}</>}
                      </div>
                    </div>
                    {d.status && (
                      <span
                        data-testid={`badge-dossier-status-${d.id}`}
                        style={{
                          fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px",
                          background: statusKleur.bg, color: statusKleur.fg,
                          padding: "3px 8px", borderRadius: 999, flexShrink: 0, whiteSpace: "nowrap",
                        }}
                      >
                        {d.status}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 6. Jouw profiel + Snelle links */}
      <div className="openregio-dashboard-content" style={{ marginTop: 16 }}>
        <div className="openregio-dashboard-main">
          <div className="openregio-card" data-testid="card-profile-summary">
            <h2 style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "#0b2240" }}>
              <Building2 className="h-4 w-4" style={{ color: "#1f5fae" }} />
              Jouw profiel
            </h2>
            <div className="openregio-profile-summary">
              <p>
                <strong data-testid="text-bedrijfsnaam">{bedrijfsnaam}</strong>
              </p>
              {categorieLabel && (
                <p>
                  <span className="openregio-category" data-testid="text-categorie">
                    {categorieLabel}
                  </span>
                </p>
              )}
              {regioLabel && (
                <p style={{ fontSize: 13, color: "#475569", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MapPin className="h-3.5 w-3.5" style={{ color: "#94a3b8" }} />
                  <span data-testid="text-profiel-regio">{regioLabel}</span>
                </p>
              )}
              {profiel?.beschrijving && (
                <p data-testid="text-beschrijving" style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                  {profiel.beschrijving}
                </p>
              )}
            </div>
            <Link
              href="/groei/profiel"
              className="openregio-button openregio-button-outline openregio-button-small"
              data-testid="button-profile-edit"
            >
              Profiel bewerken
            </Link>
          </div>
        </div>
        <div className="openregio-dashboard-sidebar">
          <div className="openregio-card" data-testid="card-quick-links">
            <h2 style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "#0b2240" }}>
              <Sparkles className="h-4 w-4" style={{ color: "#1f5fae" }} />
              Snelle links
            </h2>
            <ul className="openregio-quick-links">
              <li>
                <Link href="/network" data-testid="quick-netwerk">
                  Ontdek het netwerk
                </Link>
              </li>
              <li>
                <Link href="/regiobot" data-testid="quick-regiobot">
                  Vraag iets aan RegioBot
                </Link>
              </li>
              <li>
                <Link href="/regels/updates" data-testid="quick-regelgeving">
                  Regelgeving & signalen
                </Link>
              </li>
              <li>
                <Link href="/groei/profiel" data-testid="quick-profiel">
                  Bewerk je bedrijfsprofiel
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nieuws — 3 recente berichten met bron */}
      <div className="openregio-card" data-testid="card-nieuws" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: "#0b2240" }}>
            <Newspaper className="h-4 w-4" style={{ color: "#1f5fae" }} />
            Nieuws met context
          </h3>
          <Link
            href="/nieuws"
            data-testid="link-meer-nieuws"
            style={{ fontSize: 13, fontWeight: 600, color: "#1f5fae", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            Alles bekijken <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {nieuwsLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {!nieuwsLoading && topNieuws.length === 0 && (
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }} data-testid="text-geen-nieuws">
            Er is op dit moment geen nieuws beschikbaar.
          </p>
        )}

        {!nieuwsLoading && topNieuws.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {topNieuws.map((n) => (
              <li key={n.id} data-testid={`item-nieuws-${n.id}`}>
                <Link
                  href="/nieuws"
                  className="hover-elevate"
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e6ebf2",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span>{new Date(n.publishedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                    {n.source && (
                      <>
                        <span style={{ color: "#cbd5e1" }}>•</span>
                        <span data-testid={`text-bron-${n.id}`}>{n.source}</span>
                      </>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0b2240", lineHeight: 1.45 }}>
                    {n.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Upgrade-promo onderaan voor basic users */}
      {!isPro && (
        <div className="openregio-card openregio-upgrade-card" data-testid="card-upgrade-promo" style={{ marginTop: 16 }}>
          <h3>Upgrade naar Pro</h3>
          <p>Krijg toegang tot RegioBot AI, alle signalen, Woo-bibliotheek en meer.</p>
          <Link
            href="/lidmaatschap?plan=pro"
            className="openregio-button openregio-button-pro"
            data-testid="button-upgrade-pro"
          >
            Upgrade nu — €19,95/mnd
          </Link>
        </div>
      )}
    </div>
  );
}
