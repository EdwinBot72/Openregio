import type { CSSProperties } from "react";
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
  ArrowUpRight,
  ChevronRight,
  MapPin,
  Plus,
  Building2,
  AlertCircle,
  Newspaper,
  Map as MapIcon,
  Compass,
  Tag,
  HelpCircle,
  FileText,
  MessageSquare,
  Briefcase,
  Pencil,
  Sparkles,
  Mail,
  ShieldAlert,
  CalendarDays,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import type { Post, IntelSignaal, LokaalAanbod, Bedrijfsprofiel, LokaleActie } from "@shared/schema";
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

/* OpenRegio palet (donkerblauw / blauw / oranje) + tints */
const C = {
  donker: "#0b2240",
  blauw: "#1f5fae",
  oranje: "#f28a1a",
  oranjeDiep: "#c2410c",
  donkerTintBg: "#eef2f9",
  donkerTintBgZacht: "#f4f7fc",
  blauwTintBg: "#eaf2ff",
  blauwTintBgZacht: "#f5f9ff",
  oranjeTintBg: "#fff2e0",
  oranjeTintBgZacht: "#fff8ef",
  border: "#e6ebf2",
  borderBlauw: "#cfe1ff",
  borderOranje: "#fde6c8",
  tekst: "#475569",
  tekstZacht: "#64748b",
  tekstHeelZacht: "#94a3b8",
};

/* Urgentie → OpenRegio tints (geen rainbow). Legacy "laag" wordt behandeld als "info". */
const URGENTIE_KLEUR: Record<string, { bg: string; fg: string; label: string }> = {
  hoog: { bg: C.oranjeTintBg, fg: C.oranjeDiep, label: "Urgent" },
  normaal: { bg: C.blauwTintBg, fg: C.blauw, label: "Update" },
  info: { bg: C.donkerTintBg, fg: C.donker, label: "Info" },
  laag: { bg: C.donkerTintBg, fg: C.donker, label: "Info" },
};

const POST_TYPE_LABEL: Record<string, string> = {
  vraag: "Vraag",
  aanbieding: "Aanbod",
  aanbod: "Aanbod",
  lead: "Lead",
  event: "Event",
  update: "Update",
};

const POST_TYPE_ICON: Record<string, typeof Bell> = {
  vraag: HelpCircle,
  aanbieding: Sparkles,
  aanbod: Sparkles,
  lead: TrendingUp,
  event: Bell,
  update: Newspaper,
};

const DOSSIER_STATUS: Record<string, { label: string; icon: typeof Bell; tint: "blauw" | "donker" | "oranje" }> = {
  intake: { label: "Intake", icon: Compass, tint: "blauw" },
  extracted: { label: "Geanalyseerd", icon: FileText, tint: "donker" },
  questions: { label: "Vragen open", icon: HelpCircle, tint: "oranje" },
  response_received: { label: "Antwoord binnen", icon: MessageSquare, tint: "blauw" },
  generated: { label: "Concept klaar", icon: FileText, tint: "blauw" },
  sent: { label: "Verzonden", icon: ArrowUpRight, tint: "blauw" },
  ingebreke_gesteld: { label: "Ingebreke gesteld", icon: AlertCircle, tint: "oranje" },
  closed: { label: "Afgesloten", icon: CheckCircle2, tint: "donker" },
};

const TINT_BG: Record<"blauw" | "donker" | "oranje", string> = {
  blauw: C.blauwTintBg,
  donker: C.donkerTintBg,
  oranje: C.oranjeTintBg,
};

const TINT_FG: Record<"blauw" | "donker" | "oranje", string> = {
  blauw: C.blauw,
  donker: C.donker,
  oranje: C.oranjeDiep,
};

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

/* ─────────────────────────────────────────────────────────────
   SectieKop — leidend icoon links, icon-button rechts (geen zin-link)
───────────────────────────────────────────────────────────── */
function SectieKop({
  icon: Icon,
  tint = "blauw",
  titel,
  subtitel,
  bekijkAlles,
  bekijkAllesAriaLabel,
  bekijkAllesTestId,
  rechts,
}: {
  icon: typeof Bell;
  tint?: "blauw" | "donker" | "oranje";
  titel: string;
  subtitel?: string;
  bekijkAlles?: string;
  bekijkAllesAriaLabel?: string;
  bekijkAllesTestId?: string;
  rechts?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: "1 1 220px" }}>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            width: 32,
            height: 32,
            borderRadius: 10,
            background: TINT_BG[tint],
            color: TINT_FG[tint],
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: C.donker,
              margin: 0,
              letterSpacing: "-.2px",
              lineHeight: 1.2,
            }}
          >
            {titel}
          </h2>
          {subtitel && (
            <p
              style={{
                fontSize: 12,
                color: C.tekstZacht,
                margin: "2px 0 0",
                lineHeight: 1.45,
              }}
            >
              {subtitel}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {rechts}
        {bekijkAlles && (
          <Link
            href={bekijkAlles}
            aria-label={bekijkAllesAriaLabel ?? `Bekijk alles van ${titel}`}
            data-testid={bekijkAllesTestId ?? `link-bekijk-alles-${titel.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover-elevate"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "transparent",
              color: C.blauw,
              border: `1px solid ${C.border}`,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
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
    <div style={{ textAlign: "center", padding: "18px 12px", color: C.tekstHeelZacht, fontSize: 13 }}>
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

/* ─────────────────────────────────────────────────────────────
   KPI-tegel — trendy met accent-onderlijn (or-kpi-trendy)
───────────────────────────────────────────────────────────── */
function KpiTile({
  icon: Icon,
  value,
  label,
  sub,
  href,
  testId,
  accent,
  accentBg,
}: {
  icon: typeof Bell;
  value: number | string;
  label: string;
  sub: string;
  href: string;
  testId: string;
  accent: string;
  accentBg: string;
}) {
  return (
    <Link
      href={href}
      data-testid={testId}
      style={{
        display: "block",
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "14px 16px",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        ["--or-accent" as string]: accent,
      } as CSSProperties}
      className="hover-elevate or-kpi-trendy"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span
          style={{
            background: accentBg,
            color: accent,
            borderRadius: 10,
            padding: 8,
            display: "inline-flex",
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span style={{ fontSize: 10, fontWeight: 800, color: C.tekstHeelZacht, textTransform: "uppercase", letterSpacing: ".5px" }}>
          Nu
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: C.donker, lineHeight: 1, letterSpacing: "-.5px" }}>{value}</span>
        <span style={{ fontSize: 11, color: C.tekstZacht, fontWeight: 700 }}>{sub}</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: C.tekst, fontWeight: 600 }}>{label}</div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mini-icoon "status" voor lijstitems (ipv blanco bolletje)
───────────────────────────────────────────────────────────── */
function StatusIcon({
  icon: Icon,
  tint,
}: {
  icon: typeof Bell;
  tint: "blauw" | "donker" | "oranje";
}) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        width: 28,
        height: 28,
        borderRadius: 9,
        background: TINT_BG[tint],
        color: TINT_FG[tint],
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

/* Compacte chip — vervangt veel rainbow-pillen */
function Chip({
  icon: Icon,
  tint,
  label,
  testId,
}: {
  icon?: typeof Bell;
  tint: "blauw" | "donker" | "oranje";
  label: string;
  testId?: string;
}) {
  return (
    <span
      data-testid={testId}
      style={{
        fontSize: 10,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: ".4px",
        background: TINT_BG[tint],
        color: TINT_FG[tint],
        padding: "3px 8px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
      }}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </span>
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

  const { data: lokaleActies = [], isLoading: actiesLoading } = useQuery<LokaleActie[]>({
    queryKey: ["/api/lokale-acties"],
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

  const sortedSignalen = [...signalen].sort((a, b) => {
    const order: Record<string, number> = { hoog: 0, normaal: 1, info: 2, laag: 2 };
    const ua = order[a.urgentie] ?? 1;
    const ub = order[b.urgentie] ?? 1;
    if (ua !== ub) return ua - ub;
    const da = a.datum ? new Date(a.datum).getTime() : 0;
    const db = b.datum ? new Date(b.datum).getTime() : 0;
    return db - da;
  });

  const updatesDezeWeek = signalen.filter((s) => daysSince(s.datum) <= 7).length;
  const acties = dossiers.filter((d) => d.status && ACTIE_DOSSIER_STATUSSEN.has(d.status)).length;
  const kansenCount = posts.filter((p) => {
    const t = p.type;
    return (t === "vraag" || t === "aanbod" || t === "aanbieding" || t === "lead" || t === "event")
      && daysSince(p.createdAt) <= 7;
  }).length;
  const dossiersOpen = dossiers.filter((d) => !d.status || OPEN_DOSSIER_STATUSSEN.has(d.status)).length;

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

  const actieDossiers = dossiers
    .filter((d) => d.status && ACTIE_DOSSIER_STATUSSEN.has(d.status))
    .slice(0, 4);

  const samenwerkPosts = posts
    .filter((p) => ["vraag", "aanbod", "aanbieding", "lead", "event"].includes(p.type))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const topMarkt = [...marktItems]
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    })
    .slice(0, 3);

  const eigenRegio = (user?.region ?? "").trim().toLowerCase();
  const actiesEigenRegio = eigenRegio
    ? lokaleActies.filter((a) => a.regio.toLowerCase().includes(eigenRegio))
    : [];
  // Top 3 voor eigen regio. Als gebruiker geen regio heeft of er nog geen acties in eigen regio zijn,
  // tonen we de eerstvolgende landelijke acties zodat de sectie altijd nuttig is.
  const actiesBasis = actiesEigenRegio.length > 0 ? actiesEigenRegio : lokaleActies;
  const topActies = [...actiesBasis]
    .sort((a, b) => {
      // Toekomstige datum eerst (dichtstbij eerst), dan doorlopende acties op createdAt
      const ad = a.datum ? new Date(a.datum).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.datum ? new Date(b.datum).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    })
    .slice(0, 3);
  const toontEigenRegio = eigenRegio !== "" && actiesEigenRegio.length > 0;

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
      {/* Begroeting — geen emoji meer, compacter */}
      <div className="openregio-greeting">
        <div style={{ minWidth: 0 }}>
          <h1 data-testid="text-greeting" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>Welkom, {displayFirstName}</span>
          </h1>
          <p style={{ color: C.tekst, fontSize: 13, margin: "4px 0 0", lineHeight: 1.55 }}>
            Dit speelt nu in <strong style={{ color: C.donker }}>{regioLabel}</strong>
            {categorieLabel && <> voor <strong style={{ color: C.donker }}>{categorieLabel.toLowerCase()}</strong></>} —
            samengebracht voor {bedrijfsnaam}.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/groei/profiel"
            className="openregio-button openregio-button-outline openregio-button-small"
            data-testid="button-profiel-bekijken"
          >
            Profiel bekijken
          </Link>
          {!isPro && (
            <Link
              href="/lidmaatschap?plan=pro"
              className="openregio-button openregio-button-pro openregio-button-small"
              data-testid="button-upgrade-header"
            >
              Upgrade naar Pro
            </Link>
          )}
        </div>
      </div>

      <div
        className="openregio-greeting-plan"
        style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
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
          <span style={{ fontSize: 12, color: C.tekstZacht }} data-testid="text-leden-totaal">
            {stats.totalMembers} ondernemers in OpenRegio
          </span>
        )}
      </div>

      {/* KPI-tegels — trendy met accent-onderlijn */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 10,
          marginBottom: 14,
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
          accent={C.blauw}
          accentBg={C.blauwTintBg}
        />
        <KpiTile
          icon={CheckCircle2}
          value={acties}
          sub="open"
          label="Acties voor jou"
          href="/regels/woo"
          testId="kpi-acties"
          accent={C.oranjeDiep}
          accentBg={C.oranjeTintBg}
        />
        <KpiTile
          icon={TrendingUp}
          value={kansenCount}
          sub="recent"
          label="Kansen in netwerk"
          href="/network"
          testId="kpi-kansen"
          accent={C.donker}
          accentBg={C.donkerTintBg}
        />
        <KpiTile
          icon={FolderOpen}
          value={dossiersOpen}
          sub="lopend"
          label="Lopende dossiers"
          href="/regels/woo"
          testId="kpi-dossiers"
          accent={C.blauw}
          accentBg={C.blauwTintBg}
        />
      </div>

      {/* RegioScan-CTA — compactere banner */}
      {isPro ? (
        <Link
          href="/pro/regioscan"
          data-testid="cta-regioscan-pro"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            border: `1px solid ${C.borderBlauw}`,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${C.blauwTintBg} 0%, ${C.blauwTintBgZacht} 100%)`,
            color: "inherit",
            textDecoration: "none",
            marginBottom: 16,
          }}
          className="hover-elevate"
        >
          <span style={{ display: "inline-flex", width: 36, height: 36, borderRadius: 10, background: C.blauw, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Compass className="h-4 w-4" style={{ color: "#fff" }} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", flex: "1 1 220px", gap: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: C.blauw }}>
              Pro · RegioScan
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.donker, lineHeight: 1.3 }}>
              Doe je RegioScan voor {regioLabel}
            </span>
            <span style={{ fontSize: 12, color: C.tekst, lineHeight: 1.45 }}>
              Brancheafhankelijke regels, kansen, op te vragen documenten en concept Woo-verzoek.
            </span>
          </span>
          <span
            aria-hidden
            className="openregio-button openregio-button-primary openregio-button-small"
            style={{ flexShrink: 0 }}
          >
            Start scan
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      ) : (
        <div
          data-testid="cta-regioscan-teaser"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            border: `1px solid ${C.borderOranje}`,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${C.oranjeTintBg} 0%, ${C.oranjeTintBgZacht} 100%)`,
            marginBottom: 16,
          }}
        >
          <span style={{ display: "inline-flex", width: 36, height: 36, borderRadius: 10, background: C.oranje, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Compass className="h-4 w-4" style={{ color: "#fff" }} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", flex: "1 1 220px", gap: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: C.oranjeDiep }}>
              Pro · RegioScan
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.donker, lineHeight: 1.3 }}>
              Brengt jouw regels en kansen in kaart
            </span>
            <span style={{ fontSize: 12, color: C.tekst, lineHeight: 1.45 }}>
              Lokale besluiten, kansen, op te vragen documenten en concept Woo-verzoek — inclusief in Pro.
            </span>
          </span>
          <Link
            href="/lidmaatschap?plan=pro"
            className="openregio-button openregio-button-pro openregio-button-small"
            style={{ flexShrink: 0 }}
            data-testid="cta-regioscan-upgrade"
          >
            Upgrade
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* 1. Wat vraagt nu aandacht? */}
      <section
        className="openregio-card"
        data-testid="section-aandacht"
        style={{ padding: "18px 20px", borderRadius: 18 }}
      >
        <SectieKop
          icon={AlertCircle}
          tint="oranje"
          titel="Wat vraagt nu aandacht?"
          subtitel={`Belangrijkste regelupdate, openstaande dossier-actie en lopende kans voor ${displayFirstName}.`}
          bekijkAlles="/regels/updates"
          bekijkAllesAriaLabel="Bekijk alle regelupdates"
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 10,
            }}
          >
            {aandachtItems.map((item) => {
              if (item.kind === "signaal") {
                const s = item.data;
                const u = URGENTIE_KLEUR[s.urgentie] ?? URGENTIE_KLEUR.normaal;
                const tint: "blauw" | "donker" | "oranje" =
                  s.urgentie === "hoog"
                    ? "oranje"
                    : (s.urgentie === "info" || (s.urgentie as string) === "laag")
                      ? "donker"
                      : "blauw";
                return (
                  <Link
                    key={`s-${s.id}`}
                    href="/regels/updates"
                    data-testid={`item-aandacht-signaal-${s.id}`}
                    style={{
                      display: "flex", flexDirection: "column", gap: 8,
                      padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 12,
                      textDecoration: "none", color: "inherit", background: "#fff",
                    }}
                    className="hover-elevate"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <Chip icon={Newspaper} tint={tint} label={`Regelupdate · ${u.label}`} />
                      <span style={{ display: "inline-flex", borderRadius: 8, padding: 5, background: u.bg, color: u.fg }}>
                        <Newspaper className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.donker, lineHeight: 1.4 }}>{s.titel}</div>
                    {s.samenvatting && (
                      <div style={{ fontSize: 12, color: C.tekst, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.samenvatting}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 2, fontSize: 11, color: C.tekstHeelZacht, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <MapPin className="h-3 w-3" />{s.regio}
                      </span>
                      <span>{relativeTime(s.datum)}</span>
                    </div>
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
                      display: "flex", flexDirection: "column", gap: 8,
                      padding: "12px 14px", border: `1px solid ${C.borderOranje}`, borderRadius: 12,
                      textDecoration: "none", color: "inherit", background: C.oranjeTintBgZacht,
                    }}
                    className="hover-elevate"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <Chip icon={AlertCircle} tint="oranje" label="Actie · Dossier" />
                      <span style={{ display: "inline-flex", borderRadius: 8, padding: 5, background: "#fff", color: C.oranjeDiep }}>
                        <AlertCircle className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.donker, lineHeight: 1.4 }}>{d.subject}</div>
                    <div style={{ fontSize: 12, color: C.tekst, lineHeight: 1.5 }}>
                      Open dit dossier en zet de volgende stap.
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 2, fontSize: 11, color: C.tekstHeelZacht, flexWrap: "wrap" }}>
                      <span>{d.authority}</span>
                      {d.status && <span>· {DOSSIER_STATUS[d.status]?.label ?? d.status}</span>}
                    </div>
                  </Link>
                );
              }
              const p = item.data;
              const PostIcon = POST_TYPE_ICON[p.type] ?? TrendingUp;
              return (
                <Link
                  key={`p-${p.id}`}
                  href="/network"
                  data-testid={`item-aandacht-kans-${p.id}`}
                  style={{
                    display: "flex", flexDirection: "column", gap: 8,
                    padding: "12px 14px", border: `1px solid ${C.borderBlauw}`, borderRadius: 12,
                    textDecoration: "none", color: "inherit", background: C.blauwTintBgZacht,
                  }}
                  className="hover-elevate"
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <Chip icon={PostIcon} tint="blauw" label={`Kans · ${POST_TYPE_LABEL[p.type] ?? p.type}`} />
                    <span style={{ display: "inline-flex", borderRadius: 8, padding: 5, background: "#fff", color: C.blauw }}>
                      <TrendingUp className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.donker, lineHeight: 1.4 }}>{p.title}</div>
                  {p.body && (
                    <div style={{ fontSize: 12, color: C.tekst, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.body}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 2, fontSize: 11, color: C.tekstHeelZacht, flexWrap: "wrap" }}>
                    <span>{p.region}</span>
                    <span>· {relativeTime(p.createdAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 1b. Hulp bij regels — snelle ingang naar de drie hulp-flows */}
      <section
        className="openregio-card"
        data-testid="section-hulp-bij-regels"
        style={{ marginTop: 14 }}
      >
        <SectieKop
          icon={HelpCircle}
          tint="blauw"
          titel="Hulp bij regels"
          subtitel="Korte hulplijnen voor de drie meest voorkomende situaties — start direct."
          bekijkAlles="/regels/help"
          bekijkAllesAriaLabel="Alle hulp-flows"
          bekijkAllesTestId="link-bekijk-alles-hulp-bij-regels"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {[
            {
              id: "brief-ontvangen",
              titel: "Brief ontvangen",
              desc: "Van gemeente, provincie of overheid? Krijg direct een concept-reactie.",
              Icon: Mail,
              tint: "blauw" as const,
            },
            {
              id: "regel-onduidelijk",
              titel: "Regel niet duidelijk",
              desc: "Een regel of besluit raakt je bedrijf — krijg een concept-vraag aan de instantie.",
              Icon: HelpCircle,
              tint: "donker" as const,
            },
            {
              id: "controle-vergunning-boete",
              titel: "Controle, vergunning of boete",
              desc: "Een handhaver, vergunning of boete? Zie wat je rechten en stappen zijn.",
              Icon: ShieldAlert,
              tint: "oranje" as const,
            },
          ].map(({ id, titel, desc, Icon, tint }) => (
            <Link
              key={id}
              href={`/regels/help/${id}`}
              data-testid={`item-hulp-flow-${id}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "12px 14px",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                textDecoration: "none",
                color: "inherit",
                background: C.blauwTintBgZacht,
              }}
              className="hover-elevate"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: TINT_BG[tint],
                    color: TINT_FG[tint],
                    flexShrink: 0,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.donker, lineHeight: 1.3 }}>
                  {titel}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.tekst,
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {desc}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.blauw,
                  marginTop: "auto",
                  paddingTop: 2,
                }}
              >
                Start <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Twee-kolom rij */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 14,
          marginTop: 14,
          alignItems: "start",
        }}
      >
        <section
          className="openregio-card"
          data-testid="section-vragen"
          style={{ padding: "18px 20px", borderRadius: 18 }}
        >
          <SectieKop
            icon={Users}
            tint="blauw"
            titel="Samenwerken & vragen"
            subtitel="Wat ondernemers nu delen — vragen, aanbod, leads en events."
            bekijkAlles="/network"
            bekijkAllesAriaLabel="Naar netwerk"
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
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {samenwerkPosts.map((p) => {
                const PostIcon = POST_TYPE_ICON[p.type] ?? Newspaper;
                return (
                  <li key={p.id}>
                    <Link
                      href="/network"
                      data-testid={`item-post-${p.id}`}
                      style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                        padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 12,
                        textDecoration: "none", color: "inherit", background: "#fff",
                      }}
                      className="hover-elevate"
                    >
                      <StatusIcon icon={PostIcon} tint="blauw" />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
                          <Chip tint="blauw" label={POST_TYPE_LABEL[p.type] ?? p.type} />
                          <span style={{ fontSize: 11, color: C.tekstHeelZacht }}>{relativeTime(p.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.donker, lineHeight: 1.35 }}>{p.title}</div>
                        {p.body && (
                          <div style={{ fontSize: 12, color: C.tekstZacht, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 2 }}>
                            {p.body}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: C.tekstHeelZacht, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <MapPin className="h-3 w-3" />{p.region}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          className="openregio-card"
          data-testid="section-acties"
          style={{ padding: "18px 20px", borderRadius: 18 }}
        >
          <SectieKop
            icon={CheckCircle2}
            tint="oranje"
            titel="Acties voor jou"
            subtitel="Concrete vervolgstappen op je eigen dossiers."
            bekijkAlles="/regels/woo"
            bekijkAllesAriaLabel="Bekijk alle dossiers"
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
              {actieDossiers.map((d) => {
                const meta = d.status ? DOSSIER_STATUS[d.status] : undefined;
                const Icon = meta?.icon ?? Compass;
                const tint = meta?.tint ?? "blauw";
                const subLabel = meta?.label ?? d.status ?? "Open";
                return (
                  <li key={d.id}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                        padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 12,
                        background: "#fff",
                      }}
                    >
                      <div style={{ display: "flex", gap: 10, minWidth: 0, flex: 1, alignItems: "center" }}>
                        <StatusIcon icon={Icon} tint={tint} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.donker, lineHeight: 1.35 }}>
                            {d.subject}
                          </div>
                          <div style={{ fontSize: 11, color: C.tekstZacht, marginTop: 2 }}>
                            {subLabel} · {d.authority}
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/regels/woo"
                        aria-label={`Open dossier ${d.subject}`}
                        data-testid={`item-actie-${d.id}`}
                        className="hover-elevate"
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 32, height: 32, borderRadius: 999, background: "transparent",
                          color: C.blauw, border: `1px solid ${C.border}`, textDecoration: "none", flexShrink: 0,
                        }}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* 3. Gezamenlijke dossiers */}
      <section
        className="openregio-card"
        data-testid="section-dossiers"
        style={{ marginTop: 14, padding: "18px 20px", borderRadius: 18 }}
      >
        <SectieKop
          icon={FolderOpen}
          tint="donker"
          titel="Gezamenlijke dossiers"
          subtitel="Onderwerpen die meerdere ondernemers raken en slim gezamenlijk opgepakt kunnen worden."
          bekijkAlles="/regels/woo"
          bekijkAllesAriaLabel="Bekijk alle dossiers"
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 10,
            }}
          >
            {topDossiers.map((d) => {
              const meta = d.status ? DOSSIER_STATUS[d.status] : undefined;
              const tint: "blauw" | "donker" | "oranje" =
                meta?.tint ?? (d.status === "closed" ? "donker" : "blauw");
              const StatusIco = meta?.icon ?? FolderOpen;
              const dossierHref = `/regels/woo#dossier-${d.id}`;
              return (
                <Link
                  key={d.id}
                  href={dossierHref}
                  data-testid={`item-dossier-${d.id}`}
                  style={{
                    display: "flex", flexDirection: "column", gap: 8,
                    padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 12,
                    textDecoration: "none", color: "inherit", background: "#fff",
                  }}
                  className="hover-elevate"
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.donker, lineHeight: 1.3 }}>{d.subject}</h3>
                    {d.status && (
                      <Chip
                        tint={tint}
                        icon={StatusIco}
                        label={meta?.label ?? d.status}
                        testId={`badge-dossier-status-${d.id}`}
                      />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: C.tekstZacht }}>
                    {d.authority}
                    {d.createdAt && <> · {relativeTime(d.createdAt)}</>}
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                    <span
                      aria-hidden
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 999, background: C.blauwTintBg, color: C.blauw,
                      }}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            border: `1px dashed #cbd5e1`,
            borderRadius: 10,
            background: C.donkerTintBgZacht,
            fontSize: 12,
            color: C.tekst,
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: C.donker }}>Slimme opzet:</strong> ondernemers hoeven niet alles
          opnieuw uit te zoeken. Wat gezamenlijk speelt, kan worden gebundeld in vragen, documenten
          en dossiers.
        </div>
      </section>

      {/* 4. Lokale marktplaats */}
      <section
        className="openregio-card"
        data-testid="section-marktplaats"
        style={{ marginTop: 14, padding: "18px 20px", borderRadius: 18 }}
      >
        <SectieKop
          icon={Store}
          tint="blauw"
          titel="Lokale marktplaats"
          subtitel="Vraag & aanbod tussen ondernemers — diensten, ruimte, materieel en de rommelmarkt."
          bekijkAlles="/lokaal-marktplaats"
          bekijkAllesAriaLabel="Bekijk alle marktplaats-items"
          rechts={
            <Link
              href="/lokaal-marktplaats"
              className="openregio-button openregio-button-outline openregio-button-small"
              data-testid="button-plaats-marktplaats"
            >
              <Plus className="h-3.5 w-3.5" /> Plaats
            </Link>
          }
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {topMarkt.map((m) => {
              const isBied = m.type === "bied";
              const tint: "blauw" | "donker" = isBied ? "donker" : "blauw";
              return (
                <Link
                  key={m.id}
                  href="/lokaal-marktplaats"
                  data-testid={`item-markt-${m.id}`}
                  style={{
                    display: "flex", flexDirection: "column", gap: 6,
                    padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 12,
                    textDecoration: "none", color: "inherit", background: "#fff",
                  }}
                  className="hover-elevate"
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <Chip
                      icon={isBied ? Sparkles : HelpCircle}
                      tint={tint}
                      label={isBied ? "Ik bied" : "Ik zoek"}
                    />
                    <span style={{ fontSize: 11, color: C.tekstZacht }}>{m.regio}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.donker, lineHeight: 1.35 }}>{m.titel}</div>
                  <div style={{ fontSize: 12, color: C.tekstZacht, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {m.beschrijving}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4b. Lokale acties — evenementen door Pro-leden */}
      <section
        className="openregio-card"
        data-testid="section-lokale-acties"
        style={{ marginTop: 14, padding: "18px 20px", borderRadius: 18 }}
      >
        <SectieKop
          icon={CalendarDays}
          tint="oranje"
          titel={toontEigenRegio ? `Lokale acties in ${user?.region}` : "Lokale acties in jouw regio"}
          subtitel={
            toontEigenRegio
              ? "Evenementen, buurtacties en initiatieven van Pro-leden bij jou in de buurt."
              : eigenRegio
                ? "Nog geen acties in jouw regio gevonden — een greep uit recente landelijke acties."
                : "Vul je gemeente in bij je profiel zodat we acties uit jouw regio kunnen tonen."
          }
          bekijkAlles="/lokale-acties"
          bekijkAllesAriaLabel="Bekijk alle lokale acties"
          rechts={
            isPro ? (
              <Link
                href="/lokale-acties"
                className="openregio-button openregio-button-outline openregio-button-small"
                data-testid="button-start-lokale-actie-vandaag"
              >
                <Plus className="h-3.5 w-3.5" /> Start lokale actie
              </Link>
            ) : undefined
          }
        />
        {!isPro && (
          <div
            data-testid="teaser-basic-lokale-acties"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
              padding: "10px 12px", borderRadius: 12, border: `1px dashed ${C.border}`,
              background: C.oranjeTintBg, marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12, color: C.tekstZacht, lineHeight: 1.4 }}>
              <strong style={{ color: C.donker }}>Word Pro</strong> en organiseer zelf een lokale actie of evenement in je regio.
            </span>
            <Link
              href="/lidmaatschap?plan=pro"
              className="openregio-button openregio-button-primary openregio-button-small"
              data-testid="button-upgrade-pro-vandaag-acties"
            >
              Bekijk Pro
            </Link>
          </div>
        )}
        {actiesLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : topActies.length === 0 ? (
          <LegeStaat
            icon={CalendarDays}
            tekst={
              isPro
                ? "Nog geen lokale acties. Wees de eerste — organiseer iets in jouw regio."
                : "Nog geen lokale acties in jouw regio. Pro-leden plaatsen hier evenementen en initiatieven."
            }
            cta={{ href: "/lokale-acties", label: isPro ? "Start lokale actie" : "Bekijk lokale acties" }}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {topActies.map((a) => (
              <Link
                key={a.id}
                href="/lokale-acties"
                data-testid={`item-actie-${a.id}`}
                style={{
                  display: "flex", flexDirection: "column", gap: 6,
                  padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 12,
                  textDecoration: "none", color: "inherit", background: "#fff",
                }}
                className="hover-elevate"
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <Chip icon={Users} tint="oranje" label={a.doelgroep} />
                  {a.datum && (
                    <span style={{ fontSize: 11, color: C.tekstZacht }}>
                      {new Date(a.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.donker, lineHeight: 1.35 }}>{a.titel}</div>
                <div style={{ fontSize: 12, color: C.tekstZacht, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin className="h-3 w-3" /> {a.locatie} — {a.regio}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. Wie zit waar — kaart, compactere hoogte */}
      <section
        className="openregio-card"
        data-testid="section-ledenkaart"
        style={{ marginTop: 14, padding: "18px 20px", borderRadius: 18 }}
      >
        <SectieKop
          icon={MapIcon}
          tint="donker"
          titel="Wie zit waar?"
          subtitel="Klik op een marker om het bedrijfsprofiel te bekijken."
          bekijkAlles="/network"
          bekijkAllesAriaLabel="Naar netwerk"
          rechts={
            <span
              data-testid="text-kaart-aantal"
              style={{
                fontSize: 11, fontWeight: 700, color: C.tekstZacht,
                background: C.donkerTintBg, padding: "4px 10px", borderRadius: 999,
                display: "inline-flex", alignItems: "center", gap: 4,
              }}
            >
              <MapPin className="h-3 w-3" />
              {bedrijvenLoading ? "Laden…" : `${bedrijven.length} bedrijven`}
            </span>
          }
        />
        {bedrijvenLoading ? (
          <Skeleton className="h-[320px] w-full rounded-lg" />
        ) : bedrijven.length === 0 ? (
          <p style={{ fontSize: 13, color: C.tekstZacht, margin: 0 }} data-testid="text-kaart-leeg">
            Er zijn nog geen bedrijven met regio bekend.
          </p>
        ) : (
          <BusinessMapView businesses={bedrijven} heightClass="h-[320px]" />
        )}
      </section>

      {/* 6. Nieuws */}
      <section
        className="openregio-card"
        data-testid="card-nieuws"
        style={{ marginTop: 14, padding: "18px 20px", borderRadius: 18 }}
      >
        <SectieKop
          icon={Newspaper}
          tint="blauw"
          titel="Nieuws met context"
          subtitel="Selectie uit landelijke bronnen, relevant voor lokale ondernemers."
          bekijkAlles="/nieuws"
          bekijkAllesAriaLabel="Bekijk alle nieuwsitems"
          bekijkAllesTestId="link-volledig-nieuws"
        />

        {nieuwsLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!nieuwsLoading && topNieuws.length === 0 && (
          <p style={{ fontSize: 13, color: C.tekstZacht, margin: 0 }} data-testid="text-geen-nieuws">
            Er is op dit moment geen nieuws beschikbaar.
          </p>
        )}

        {!nieuwsLoading && topNieuws.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {topNieuws.map((n) => (
              <li key={n.id} data-testid={`item-nieuws-${n.id}`}>
                <Link
                  href="/nieuws"
                  className="hover-elevate"
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    textDecoration: "none",
                    color: "inherit",
                    background: "#fff",
                  }}
                >
                  <StatusIcon icon={Newspaper} tint="blauw" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.tekstHeelZacht, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span>{new Date(n.publishedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                      {n.source && (
                        <>
                          <span style={{ color: "#cbd5e1" }}>•</span>
                          <span data-testid={`text-bron-${n.id}`}>{n.source}</span>
                        </>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.donker, lineHeight: 1.4 }}>
                      {n.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 7. Jouw bedrijf — compacte strip ipv 3 kaarten */}
      <section
        className="openregio-card"
        data-testid="section-jouw-bedrijf"
        style={{ marginTop: 14, padding: "14px 18px", borderRadius: 18 }}
      >
        <div
          data-testid="strip-jouw-bedrijf"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              width: 44,
              height: 44,
              borderRadius: 12,
              background: C.donkerTintBg,
              color: C.donker,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Briefcase className="h-5 w-5" />
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: "1 1 240px" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.tekstHeelZacht, textTransform: "uppercase", letterSpacing: ".5px" }}>
              Jouw bedrijf
            </span>
            <div data-testid="card-bedrijfsnaam" style={{ display: "contents" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.donker, lineHeight: 1.2 }} data-testid="text-bedrijfsnaam">
                {bedrijfsnaam}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                fontSize: 12,
                color: C.tekstZacht,
              }}
            >
              <span data-testid="card-categorie" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Tag className="h-3.5 w-3.5" />
                <span data-testid="text-categorie">{categorieLabel || "Nog niet ingevuld"}</span>
              </span>
              <span style={{ color: "#cbd5e1" }}>·</span>
              <span data-testid="card-regio" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <MapPin className="h-3.5 w-3.5" />
                <span data-testid="text-profiel-regio">{regioLabel}</span>
              </span>
            </div>
          </div>
          <Link
            href="/groei/profiel"
            className="openregio-button openregio-button-outline openregio-button-small"
            data-testid="button-profile-edit"
            style={{ flexShrink: 0 }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Profiel bewerken
          </Link>
        </div>
      </section>

      {/* 8. Ledenstats — compacte horizontale rij met stat-pillen */}
      <div
        className="openregio-dashboard-stats"
        data-testid="section-ledenstats"
        style={{
          marginTop: 14,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Totaal leden", value: stats?.totalMembers, testId: "stat-totaal", textTestId: "text-stat-totaal", tint: "donker" as const },
          { label: "Basic leden", value: stats?.basicMembers, testId: "stat-basic", textTestId: "text-stat-basic", tint: "blauw" as const },
          { label: "Pro leden", value: stats?.proMembers, testId: "stat-pro", textTestId: "text-stat-pro", tint: "oranje" as const },
        ].map((s) => (
          <div
            key={s.testId}
            data-testid={s.testId}
            style={{
              flex: "1 1 160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "10px 14px",
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: TINT_BG[s.tint],
                  color: TINT_FG[s.tint],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users className="h-3.5 w-3.5" />
              </span>
              <h3
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.tekstZacht,
                  margin: 0,
                  letterSpacing: ".1px",
                }}
              >
                {s.label}
              </h3>
            </div>
            <p
              className="openregio-stat-number"
              data-testid={s.textTestId}
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: C.donker,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {s.value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* 9. Upgrade-promo — voor Basic alleen een dunne banner (Pro: niets) */}
      {!isPro && (
        <div
          className="openregio-card"
          data-testid="card-upgrade-promo"
          style={{
            marginTop: 14,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: `linear-gradient(135deg, ${C.oranjeTintBg} 0%, ${C.oranjeTintBgZacht} 100%)`,
            border: `1px solid ${C.borderOranje}`,
            borderRadius: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 8, background: C.oranje, color: "#fff", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.donker, flex: "1 1 240px" }}>
            Upgrade naar Pro voor RegioBot AI, Woo-bibliotheek en alle signalen.
          </span>
          <Link
            href="/lidmaatschap?plan=pro"
            data-testid="button-upgrade-pro"
            className="openregio-button openregio-button-pro openregio-button-small"
            style={{ flexShrink: 0 }}
          >
            €19,95/mnd
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
