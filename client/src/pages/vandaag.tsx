import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function VandaagPage() {
  usePageTitle("Vandaag");
  const { user, isLoading: authLoading } = useAuth();

  const isPro = user?.plan === "pro";
  const planLabel = isPro ? "Pro-bijdrager" : "Basic lid";

  const { data: profiel } = useQuery<ProfielData | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<CooperatiefStats>({
    queryKey: ["/api/cooperatief-stats"],
    enabled: !!user,
  });

  const displayFirstName =
    user?.firstName ||
    (profiel?.naam ? profiel.naam.split(" ")[0] : "") ||
    "ondernemer";
  const bedrijfsnaam = profiel?.naam || user?.businessName || "Mijn onderneming";
  const categorieLabel = profiel?.categorieId
    ? CATEGORIE_LABELS[profiel.categorieId] ?? profiel.categorieId
    : "";

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
      {/* Begroeting + Upgrade-knop */}
      <div className="openregio-greeting">
        <h1 data-testid="text-greeting">
          Welkom, {displayFirstName}
          <span className="openregio-greeting-wave" role="img" aria-label="zwaaiende hand">
            👋
          </span>
        </h1>
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
          className={`openregio-plan-badge ${
            isPro ? "openregio-plan-pro" : "openregio-plan-basic"
          }`}
          data-testid="badge-plan"
        >
          {planLabel}
        </span>
      </div>

      {/* Ledenstats: totaal / basic / pro */}
      <div className="openregio-dashboard-stats">
        <div className="openregio-stat-card" data-testid="stat-totaal">
          <h3>Totaal leden</h3>
          <p className="openregio-stat-number">
            {statsLoading ? "—" : stats?.totalMembers ?? 0}
          </p>
        </div>
        <div className="openregio-stat-card" data-testid="stat-basic">
          <h3>Basic leden</h3>
          <p className="openregio-stat-number">
            {statsLoading ? "—" : stats?.basicMembers ?? 0}
          </p>
        </div>
        <div className="openregio-stat-card" data-testid="stat-pro">
          <h3>Pro leden</h3>
          <p className="openregio-stat-number">
            {statsLoading ? "—" : stats?.proMembers ?? 0}
          </p>
        </div>
      </div>

      {/* Hoofd-grid: profiel/snelle links links — upgrade + nieuws rechts */}
      <div className="openregio-dashboard-content">
        <div className="openregio-dashboard-main">
          {/* Jouw profiel */}
          <div className="openregio-card" data-testid="card-profile-summary">
            <h2>Jouw profiel</h2>
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

          {/* Snelle links */}
          <div className="openregio-card" data-testid="card-quick-links">
            <h2>Snelle links</h2>
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

        <div className="openregio-dashboard-sidebar">
          {/* Donkerblauwe upgrade kaart met expliciete prijs */}
          {!isPro && (
            <div className="openregio-card openregio-upgrade-card" data-testid="card-upgrade-promo">
              <h3>Upgrade naar Pro</h3>
              <p>Krijg toegang tot RegioBot AI en nog veel meer features</p>
              <Link
                href="/lidmaatschap?plan=pro"
                className="openregio-button openregio-button-pro"
                data-testid="button-upgrade-pro"
              >
                Upgrade nu — €19,95/mnd
              </Link>
            </div>
          )}

          {/* Laatste nieuws */}
          <div className="openregio-laatste-nieuws" data-testid="card-laatste-nieuws">
            <h3>Laatste nieuws</h3>
            <p>Binnenkort meer updates over het coöperatief!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
