import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";
import type { IntelSignaal } from "@shared/schema";

type ProfielData = {
  naam?: string;
  beschrijving?: string;
  websiteUrl?: string;
  regio?: string;
};
type CursusItem = { id: string; title: string; completed: boolean; minutes: number; daysLeft: number };
type Aanbesteding = {
  id: string;
  title: string;
  buyer: string;
  daysLeft: number | null;
};

const URG_LABEL: Record<string, string> = {
  hoog: "Urgent",
  normaal: "Normaal",
  info: "Info",
};

function rankSignalen(s: IntelSignaal[]): IntelSignaal[] {
  const o: Record<string, number> = { hoog: 0, normaal: 1, info: 2 };
  return [...s].sort((a, b) => {
    const d = (o[a.urgentie] ?? 2) - (o[b.urgentie] ?? 2);
    if (d !== 0) return d;
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
  });
}

export default function VandaagPage() {
  usePageTitle("Vandaag");
  const { user, isLoading: authLoading } = useAuth();
  const { setOpen, isMobile } = useSidebar();

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [setOpen, isMobile]);

  const isPro = user?.plan === "pro";
  const planLabel = isPro ? "Pro-bijdrager" : "Basis-lid";

  const { data: profiel } = useQuery<ProfielData | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });
  const { data: intelSignalen = [], isLoading: intelLoading } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen"],
    enabled: !!user,
  });
  const { data: cursusData, isLoading: cursusLoading } = useQuery<{
    items: CursusItem[];
  }>({
    queryKey: ["/api/cursussen"],
    enabled: !!user,
  });
  const { data: documentenData } = useQuery<
    { documents: { id: string }[] } | { id: string }[]
  >({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  const userRegio = profiel?.regio || user?.region || "";
  const { data: aanbestedingenData } = useQuery<{ items: Aanbesteding[] }>({
    queryKey: ["/api/tenderned/aanbestedingen", userRegio],
    queryFn: () =>
      fetch(
        `/api/tenderned/aanbestedingen?gemeente=${encodeURIComponent(userRegio)}&limit=4`,
        { credentials: "include" }
      ).then((r) => {
        if (!r.ok) throw new Error("nb");
        return r.json();
      }),
    enabled: !!userRegio,
    staleTime: 15 * 60 * 1000,
  });

  let documentenAantal = 0;
  if (Array.isArray(documentenData)) documentenAantal = documentenData.length;
  else if (documentenData && "documents" in documentenData)
    documentenAantal = documentenData.documents.length;

  const cursusItems = cursusData?.items ?? [];
  const actiefKansen = cursusItems.filter((i) => !i.completed);
  const aanbestedingen = aanbestedingenData?.items ?? [];

  const signalenGerankt = rankSignalen(intelSignalen);
  const topSignalen = signalenGerankt.slice(0, 5);
  const totaalSignalen = signalenGerankt.length;
  const aantalUrgent = signalenGerankt.filter((s) => s.urgentie === "hoog").length;

  const displayName =
    user?.firstName || profiel?.naam || user?.businessName || "ondernemer";
  const bedrijfsnaam = profiel?.naam || user?.businessName || "—";

  if (authLoading) {
    return (
      <div className="openregio-dashboard" data-testid="skeleton-vandaag">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="openregio-dashboard-stats">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-[18px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="openregio-dashboard" data-testid="page-vandaag">
      {/* Header met begroeting + plan badge */}
      <div className="openregio-dashboard-header">
        <div>
          <h1 data-testid="text-greeting">Welkom terug, {displayName}</h1>
          <p className="openregio-subtitle" style={{ marginBottom: 0 }}>
            Lokale signalen, kansen en regelgeving voor jouw onderneming
            {userRegio ? ` in ${userRegio}` : ""}.
          </p>
        </div>
        <span
          className={`openregio-plan-badge ${
            isPro ? "openregio-plan-pro" : "openregio-plan-basic"
          }`}
          data-testid="badge-plan"
        >
          {planLabel}
        </span>
      </div>

      {/* 3 stat cards */}
      <div className="openregio-dashboard-stats">
        <div className="openregio-stat-card" data-testid="stat-signalen">
          <h3>Signalen</h3>
          <p className="openregio-stat-number">{intelLoading ? "—" : totaalSignalen}</p>
        </div>
        <div className="openregio-stat-card" data-testid="stat-urgent">
          <h3>Urgent</h3>
          <p className="openregio-stat-number">{intelLoading ? "—" : aantalUrgent}</p>
        </div>
        <div className="openregio-stat-card" data-testid="stat-documenten">
          <h3>Documenten</h3>
          <p className="openregio-stat-number">{documentenAantal}</p>
        </div>
      </div>

      {/* Hoofd-grid: 1fr / 300px */}
      <div className="openregio-dashboard-content">
        {/* MAIN COLUMN */}
        <div className="openregio-dashboard-main">
          {/* Profiel-samenvatting */}
          <div className="openregio-card" data-testid="card-profile-summary">
            <h2>Jouw onderneming</h2>
            <div className="openregio-profile-summary">
              <p>
                <strong>{bedrijfsnaam}</strong>
              </p>
              {userRegio && (
                <p>
                  <span className="openregio-category" data-testid="text-regio">
                    {userRegio}
                  </span>
                </p>
              )}
              {profiel?.beschrijving && (
                <p data-testid="text-beschrijving">{profiel.beschrijving}</p>
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

          {/* Wet- en regelgeving */}
          <div className="openregio-card" data-testid="card-regelgeving">
            <h2>Wet- en regelgeving</h2>
            {intelLoading ? (
              <ul>
                {[1, 2, 3].map((i) => (
                  <li key={i}>
                    <Skeleton className="h-4 w-full" />
                  </li>
                ))}
              </ul>
            ) : topSignalen.length === 0 ? (
              <p>Geen actuele signalen — kom later terug.</p>
            ) : (
              <ul>
                {topSignalen.map((s) => (
                  <li key={s.id} data-testid={`signaal-${s.id}`}>
                    <Link
                      href="/regels/updates"
                      style={{ color: "inherit", textDecoration: "none", flex: 1 }}
                    >
                      <strong style={{ color: "#0f172a", fontWeight: 600 }}>
                        {s.titel}
                      </strong>
                      <span style={{ color: "#94a3b8", marginLeft: 6 }}>
                        · {s.categorie} · {URG_LABEL[s.urgentie] ?? s.urgentie}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/regels/updates"
              className="openregio-button openregio-button-outline openregio-button-small"
              data-testid="button-alle-signalen"
            >
              Alle signalen
            </Link>
          </div>

          {/* Open kansen */}
          <div className="openregio-card" data-testid="card-kansen">
            <h2>Open kansen & acties</h2>
            {cursusLoading ? (
              <ul>
                {[1, 2].map((i) => (
                  <li key={i}>
                    <Skeleton className="h-4 w-full" />
                  </li>
                ))}
              </ul>
            ) : actiefKansen.length === 0 && aanbestedingen.length === 0 ? (
              <p>Alles op orde — geen openstaande acties.</p>
            ) : (
              <ul>
                {actiefKansen.slice(0, 3).map((k) => (
                  <li key={k.id} data-testid={`kans-${k.id}`}>
                    <Link
                      href="/vandaag/acties"
                      style={{ color: "inherit", textDecoration: "none", flex: 1 }}
                    >
                      <strong style={{ color: "#0f172a", fontWeight: 600 }}>
                        {k.title}
                      </strong>
                      <span style={{ color: "#94a3b8", marginLeft: 6 }}>
                        · {k.minutes} min · nog {k.daysLeft}{" "}
                        {k.daysLeft === 1 ? "dag" : "dagen"}
                      </span>
                    </Link>
                  </li>
                ))}
                {aanbestedingen.slice(0, 3).map((a) => (
                  <li key={a.id} data-testid={`aanbesteding-${a.id}`}>
                    <Link
                      href="/kansen/opdrachten"
                      style={{ color: "inherit", textDecoration: "none", flex: 1 }}
                    >
                      <strong style={{ color: "#0f172a", fontWeight: 600 }}>
                        {a.title}
                      </strong>
                      <span style={{ color: "#94a3b8", marginLeft: 6 }}>
                        · Aanbesteding · {a.buyer}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/kansen/opdrachten"
              className="openregio-button openregio-button-outline openregio-button-small"
              data-testid="button-alle-kansen"
            >
              Alle kansen
            </Link>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="openregio-dashboard-sidebar">
          <div className="openregio-card" data-testid="card-quick-links">
            <h3>Snel naar</h3>
            <ul className="openregio-quick-links">
              <li>
                <Link href="/netwerk" data-testid="quick-netwerk">
                  Netwerk & Kansenbord
                </Link>
              </li>
              <li>
                <Link href="/regels/updates" data-testid="quick-monitor">
                  Regelgeving Monitor
                </Link>
              </li>
              <li>
                <Link href="/regels/woo" data-testid="quick-woo">
                  WOO-bibliotheek
                </Link>
              </li>
              <li>
                <Link href="/regiobot" data-testid="quick-regiobot">
                  RegioBot
                </Link>
              </li>
              <li>
                <Link href="/informatie/kennisbank" data-testid="quick-kennisbank">
                  Kennisbank
                </Link>
              </li>
            </ul>
          </div>

          {!isPro && (
            <div className="openregio-card openregio-upgrade-card" data-testid="card-upgrade-promo">
              <h3>Word Pro-bijdrager</h3>
              <p>
                Krijg toegang tot RegioBot, WOO-bibliotheek en printbare overzichten.
              </p>
              <Link
                href="/lidmaatschap?plan=pro"
                className="openregio-button openregio-button-pro"
                data-testid="button-upgrade-pro"
              >
                Upgrade naar Pro
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
