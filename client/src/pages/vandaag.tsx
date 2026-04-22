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
  FileText,
  Newspaper,
  ArrowRight,
  MapPin,
  Plus,
  FolderOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import type { Post, IntelSignaal, LokaalAanbod } from "@shared/schema";

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

type NieuwsItem = {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
};
type NieuwsResponse = { items: NieuwsItem[]; fetchedAt: string };

type WooDossierItem = {
  id: number;
  subject?: string | null;
  authority?: string | null;
  status?: string | null;
  createdAt?: string | null;
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

function relativeTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  try {
    return formatDistanceToNow(new Date(value as string), { addSuffix: true, locale: nl });
  } catch {
    return "";
  }
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

function LegeStaat({ icon: Icon, tekst, cta }: { icon: typeof Bell; tekst: string; cta?: { href: string; label: string } }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px 12px",
        color: "#94a3b8",
        fontSize: 13,
      }}
    >
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

  const { data: dossiers = [] } = useQuery<WooDossierItem[]>({
    queryKey: ["/api/woo/dossiers"],
    enabled: !!user,
  });

  const { data: nieuwsResp, isLoading: nieuwsLoading } = useQuery<NieuwsResponse>({
    queryKey: ["/api/news"],
    enabled: !!user,
  });
  const nieuws = nieuwsResp?.items ?? [];

  const isPro = user?.plan === "pro";
  const planLabel = isPro ? "Pro-bijdrager" : "Basic lid";
  const displayFirstName =
    user?.firstName ||
    (profiel?.naam ? profiel.naam.split(" ")[0] : "") ||
    "ondernemer";
  const bedrijfsnaam = profiel?.naam || (user as any)?.businessName || "Mijn onderneming";
  const categorieLabel = profiel?.categorieId
    ? CATEGORIE_LABELS[profiel.categorieId] ?? profiel.categorieId
    : "";
  const regioLabel = profiel?.regio || (user as any)?.region || "jouw regio";

  const topSignalen = [...signalen]
    .sort((a, b) => {
      const order: Record<string, number> = { hoog: 0, normaal: 1, laag: 2 };
      const ua = order[a.urgentie ?? "normaal"] ?? 1;
      const ub = order[b.urgentie ?? "normaal"] ?? 1;
      if (ua !== ub) return ua - ub;
      return new Date(b.datum as any).getTime() - new Date(a.datum as any).getTime();
    })
    .slice(0, 3);

  const vragenPosts = posts
    .filter((p) => p.type === "vraag" || p.type === "lead")
    .slice(0, 3);

  const topMarkt = marktItems.slice(0, 3);

  const topDossiers = dossiers.slice(0, 3);

  const topNieuws = nieuws.slice(0, 3);

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

      <div className="openregio-greeting-plan">
        <span
          className={`openregio-plan-badge ${isPro ? "openregio-plan-pro" : "openregio-plan-basic"}`}
          data-testid="badge-plan"
        >
          {planLabel}
        </span>
        {stats && (
          <span style={{ marginLeft: 10, fontSize: 12, color: "#64748b" }} data-testid="text-leden-totaal">
            {stats.totalMembers} ondernemers in OpenRegio
          </span>
        )}
      </div>

      {/* 1. Wat vraagt nu aandacht — intel signalen */}
      <section className="openregio-card" data-testid="section-aandacht" style={{ marginTop: 16 }}>
        <SectieKop
          titel="Wat vraagt nu aandacht?"
          subtitel="Updates en regelwijzigingen die voor jouw regio en sector relevant zijn."
          bekijkAlles="/regels/updates"
        />
        {signalenLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : topSignalen.length === 0 ? (
          <LegeStaat
            icon={Bell}
            tekst="Geen nieuwe signalen vandaag. We checken doorlopend nieuwe bronnen."
            cta={{ href: "/regels/updates", label: "Bekijk archief" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topSignalen.map((s) => {
              const u = URGENTIE_KLEUR[s.urgentie ?? "normaal"] ?? URGENTIE_KLEUR.normaal;
              return (
                <Link
                  key={s.id}
                  href="/regels/updates"
                  data-testid={`item-signaal-${s.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "14px 16px",
                    border: "1px solid #e6ebf2",
                    borderRadius: 14,
                    textDecoration: "none",
                    color: "inherit",
                    background: "#fafbfd",
                    transition: "border-color .15s, background .15s",
                  }}
                  className="hover-elevate"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        background: u.bg,
                        color: u.fg,
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {u.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <MapPin className="h-3 w-3" />
                      {s.regio}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {relativeTime(s.datum as any)}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", lineHeight: 1.4 }}>
                    {s.titel}
                  </div>
                  {s.samenvatting && (
                    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {s.samenvatting}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Vragen & samenwerken — posts */}
      <section className="openregio-card" data-testid="section-vragen" style={{ marginTop: 16 }}>
        <SectieKop
          titel="Vragen & samenwerken"
          subtitel="Wat ondernemers nu delen — vragen, leads en gezamenlijke acties."
          bekijkAlles="/network"
          bekijkAllesLabel="Naar netwerk"
        />
        {postsLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : vragenPosts.length === 0 ? (
          <LegeStaat
            icon={Users}
            tekst="Nog geen openstaande vragen. Plaats zelf de eerste!"
            cta={{ href: "/network", label: "Plaats vraag" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vragenPosts.map((p) => (
              <Link
                key={p.id}
                href="/network"
                data-testid={`item-post-${p.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "12px 14px",
                  border: "1px solid #e6ebf2",
                  borderRadius: 12,
                  textDecoration: "none",
                  color: "inherit",
                  background: "#fff",
                }}
                className="hover-elevate"
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      background: "#f0f4ff",
                      color: "#1f5fae",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {POST_TYPE_LABEL[p.type] ?? p.type}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{p.region}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {relativeTime(p.createdAt as any)}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240" }}>{p.title}</div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#475569",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.body}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Lokale marktplaats — vraag/aanbod & rommelmarkt */}
      <section className="openregio-card" data-testid="section-marktplaats" style={{ marginTop: 16 }}>
        <SectieKop
          titel="Lokale marktplaats"
          subtitel="Vraag & aanbod tussen ondernemers — diensten, ruimte, materieel en de rommelmarkt."
          bekijkAlles="/lokaal-marktplaats"
          bekijkAllesLabel="Open marktplaats"
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {topMarkt.map((m) => (
                <Link
                  key={m.id}
                  href="/lokaal-marktplaats"
                  data-testid={`item-markt-${m.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "12px 14px",
                    border: "1px solid #e6ebf2",
                    borderRadius: 12,
                    textDecoration: "none",
                    color: "inherit",
                    background: "#fff",
                  }}
                  className="hover-elevate"
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        background: m.type === "bied" ? "#ecfdf5" : "#eff6ff",
                        color: m.type === "bied" ? "#047857" : "#1f5fae",
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {m.type === "bied" ? "Ik bied" : "Ik zoek"}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{m.regio}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", lineHeight: 1.35 }}>
                    {m.titel}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
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
                <Plus className="h-3.5 w-3.5" /> Plaats vraag of aanbod
              </Link>
            </div>
          </>
        )}
      </section>

      {/* 4. Lopende dossiers + Laatste nieuws — twee kolommen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <section className="openregio-card" data-testid="section-dossiers" style={{ marginBottom: 0 }}>
          <SectieKop
            titel="Lopende dossiers"
            subtitel="Gezamenlijke vragen aan de overheid via Woo-trajecten."
            bekijkAlles="/regels/woo"
          />
          {topDossiers.length === 0 ? (
            <LegeStaat
              icon={FolderOpen}
              tekst="Nog geen lopende dossiers."
              cta={{ href: "/regels/woo", label: "Bekijk Woo-bibliotheek" }}
            />
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {topDossiers.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/regels/woo`}
                    data-testid={`item-dossier-${d.id}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      padding: "10px 12px",
                      border: "1px solid #e6ebf2",
                      borderRadius: 10,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                    className="hover-elevate"
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2240" }}>
                      {d.subject || `Dossier #${d.id}`}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      {d.authority || "Overheid"}
                      {d.status && <> · {d.status}</>}
                      {d.createdAt && <> · {relativeTime(d.createdAt)}</>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="openregio-card" data-testid="section-nieuws" style={{ marginBottom: 0 }}>
          <SectieKop
            titel="Laatste nieuws"
            subtitel="Berichten met AI-context en lokale impact."
            bekijkAlles="/nieuws"
            bekijkAllesLabel="Naar nieuws"
          />
          {nieuwsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : topNieuws.length === 0 ? (
            <LegeStaat
              icon={Newspaper}
              tekst="Geen recente artikelen."
              cta={{ href: "/nieuws", label: "Open nieuws" }}
            />
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {topNieuws.map((n) => (
                <li key={n.id}>
                  <Link
                    href="/nieuws"
                    data-testid={`item-nieuws-${n.id}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      padding: "10px 12px",
                      border: "1px solid #e6ebf2",
                      borderRadius: 10,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                    className="hover-elevate"
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2240", lineHeight: 1.35 }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {relativeTime(n.publishedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Upgrade-promo onderaan voor basic users */}
      {!isPro && (
        <div
          className="openregio-card openregio-upgrade-card"
          data-testid="card-upgrade-promo"
          style={{ marginTop: 16 }}
        >
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
