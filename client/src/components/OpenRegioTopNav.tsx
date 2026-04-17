import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const TABS = [
  { label: "Dashboard", href: "/vandaag", match: ["/vandaag"] },
  { label: "Netwerk", href: "/network", match: ["/network"] },
  { label: "RegioBot", href: "/regiobot", match: ["/regiobot"] },
  { label: "Upgrade", href: "/lidmaatschap", match: ["/lidmaatschap"] },
];

function getInitials(first?: string | null, last?: string | null, fallback = "OR") {
  const a = (first?.[0] || "").toUpperCase();
  const b = (last?.[0] || "").toUpperCase();
  if (a || b) return (a + b) || fallback;
  return fallback;
}

export function OpenRegioTopNav() {
  const { user, profile } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sluit mobiel-menu automatisch bij routewissel
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isPro = user?.plan === "pro";
  const planLabel = isPro ? "Pro" : "Basic";
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    profile?.name ||
    "Gebruiker";
  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <header className="openregio-topnav" data-testid="openregio-topnav">
      <div className="openregio-topnav-inner">
        <Link
          href="/vandaag"
          className="openregio-topnav-logo"
          data-testid="link-topnav-logo"
        >
          <span className="openregio-topnav-logo-dark">Open</span>
          <span className="openregio-topnav-logo-blue">Regio</span>
        </Link>

        <nav className="openregio-topnav-tabs" aria-label="Hoofdnavigatie">
          {TABS.map((t) => {
            const active = t.match.some((m) => location === m || location.startsWith(m + "/"));
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`openregio-topnav-tab ${active ? "is-active" : ""}`}
                data-testid={`tab-${t.label.toLowerCase()}`}
                aria-current={active ? "page" : undefined}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="openregio-topnav-user" data-testid="topnav-user">
          <div className="openregio-topnav-avatar" aria-hidden="true">
            {initials}
          </div>
          <span className="openregio-topnav-username" data-testid="text-topnav-name">
            {displayName}
          </span>
          <span className="openregio-topnav-dot" aria-hidden="true">·</span>
          <span
            className={`openregio-topnav-plan ${isPro ? "is-pro" : "is-basic"}`}
            data-testid="text-topnav-plan"
          >
            {planLabel}
          </span>
        </div>

        <button
          type="button"
          className="openregio-topnav-burger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Menu sluiten" : "Menu openen"}
          aria-expanded={mobileOpen}
          aria-controls="openregio-topnav-mobile"
          data-testid="button-topnav-burger"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="openregio-topnav-mobile"
          className="openregio-topnav-mobile"
          data-testid="topnav-mobile"
        >
          {TABS.map((t) => {
            const active = t.match.some((m) => location === m || location.startsWith(m + "/"));
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`openregio-topnav-mobile-tab ${active ? "is-active" : ""}`}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-tab-${t.label.toLowerCase()}`}
              >
                {t.label}
              </Link>
            );
          })}
          <div className="openregio-topnav-mobile-user">
            <div className="openregio-topnav-avatar" aria-hidden="true">{initials}</div>
            <div>
              <div
                className="openregio-topnav-username"
                data-testid="text-topnav-mobile-name"
              >
                {displayName}
              </div>
              <div
                className={`openregio-topnav-plan ${isPro ? "is-pro" : "is-basic"}`}
                data-testid="text-topnav-mobile-plan"
              >
                {planLabel}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
