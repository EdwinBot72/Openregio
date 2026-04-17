import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, LogOut, Settings, Bot } from "lucide-react";
import { MAIN_NAV, type NavSection } from "@/config/navigation";
import { queryClient } from "@/lib/queryClient";

type TopTab = {
  id: string;
  label: string;
  href?: string;
  match: string[];
  sub?: { label: string; href: string; proOnly?: boolean; adminOnly?: boolean; comingSoon?: boolean }[];
};

function buildTabs(isAdmin: boolean): TopTab[] {
  const tabs: TopTab[] = MAIN_NAV.filter((s) => !s.adminOnly || isAdmin).map(
    (s: NavSection) => ({
      id: s.id,
      label: s.title,
      href: s.url,
      match: s.url
        ? [s.url]
        : s.sub?.map((x) => x.url) ?? [],
      sub: s.sub?.map((x) => ({
        label: x.title,
        href: x.url,
        proOnly: x.proOnly,
        adminOnly: x.adminOnly,
        comingSoon: x.comingSoon,
      })),
    }),
  );

  // RegioBot als losse tab (geen onderdeel van MAIN_NAV).
  // Bewust voor iedereen zichtbaar; de pagina zelf regelt feature-gating.
  tabs.splice(4, 0, {
    id: "regiobot",
    label: "RegioBot",
    href: "/regiobot",
    match: ["/regiobot"],
  });

  return tabs;
}

function getInitials(first?: string | null, last?: string | null, fallback = "OR") {
  const a = (first?.[0] || "").toUpperCase();
  const b = (last?.[0] || "").toUpperCase();
  if (a || b) return (a + b) || fallback;
  return fallback;
}

function isActive(currentLocation: string, paths: string[]) {
  return paths.some((p) => currentLocation === p || currentLocation.startsWith(p + "/"));
}

export function OpenRegioTopNav() {
  const { user, profile } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  }, [location]);

  // Sluit dropdowns bij klik buiten de nav, of bij Escape-toets
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setUserMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const isPro = user?.plan === "pro";
  const isAdmin = user?.role === "admin" || user?.role === "master";
  const planLabel = isPro ? "Pro" : "Basic";
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    profile?.name ||
    "Gebruiker";
  const initials = getInitials(user?.firstName, user?.lastName);
  const tabs = buildTabs(isAdmin);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* noop */
    }
    queryClient.clear();
    setLocation("/login");
  }

  return (
    <header className="openregio-topnav" data-testid="openregio-topnav" ref={navRef}>
      <div className="openregio-topnav-inner">
        <Link
          href={user ? "/vandaag" : "/"}
          className="openregio-topnav-logo"
          data-testid="link-topnav-logo"
        >
          <span className="openregio-topnav-logo-dark">Open</span>
          <span className="openregio-topnav-logo-blue">Regio</span>
        </Link>

        <nav className="openregio-topnav-tabs" aria-label="Hoofdnavigatie">
          {tabs.map((t) => {
            const active = isActive(location, t.match);
            const hasSub = !!t.sub && t.sub.length > 0;
            const isOpen = openDropdown === t.id;

            // Tab met dropdown
            if (hasSub) {
              const visibleSub = t.sub!.filter(
                (s) => (!s.proOnly || isPro || isAdmin) && (!s.adminOnly || isAdmin),
              );
              return (
                <div key={t.id} className="openregio-topnav-tab-wrap">
                  <button
                    type="button"
                    className={`openregio-topnav-tab ${active ? "is-active" : ""}`}
                    onClick={() => setOpenDropdown(isOpen ? null : t.id)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    data-testid={`tab-${t.id}`}
                  >
                    {t.label}
                    <ChevronDown className="h-3.5 w-3.5 ml-1 inline-block" />
                  </button>
                  {isOpen && (
                    <div
                      className="openregio-topnav-dropdown"
                      role="menu"
                      data-testid={`dropdown-${t.id}`}
                    >
                      {visibleSub.map((s) => {
                        if (s.comingSoon) {
                          return (
                            <div
                              key={s.href}
                              className="openregio-topnav-dropdown-item openregio-topnav-dropdown-item-disabled"
                              role="menuitem"
                              aria-disabled="true"
                              data-testid={`dropdown-item-${s.href.replace(/\//g, "-").replace(/^-/, "")}`}
                            >
                              {s.label}
                              <span className="openregio-topnav-pill-soon">Binnenkort</span>
                            </div>
                          );
                        }
                        return (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="openregio-topnav-dropdown-item"
                            role="menuitem"
                            data-testid={`dropdown-item-${s.href.replace(/\//g, "-").replace(/^-/, "")}`}
                          >
                            {s.label}
                            {s.proOnly && !isPro && !isAdmin && (
                              <span className="openregio-topnav-pill-pro">Pro</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Direct-link tab
            return (
              <Link
                key={t.id}
                href={t.href!}
                className={`openregio-topnav-tab ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                data-testid={`tab-${t.id}`}
              >
                {t.id === "regiobot" && <Bot className="h-3.5 w-3.5 mr-1 inline-block" />}
                {t.label}
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="openregio-topnav-right">
            {!isPro && !isAdmin && (
              <Link
                href="/lidmaatschap?plan=pro"
                className="openregio-button openregio-button-pro openregio-button-small"
                data-testid="link-topnav-upgrade"
              >
                Upgrade
              </Link>
            )}
            <div className="openregio-topnav-user-wrap">
              <button
                type="button"
                className="openregio-topnav-user openregio-topnav-user-button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                data-testid="button-topnav-user"
              >
                <div className="openregio-topnav-avatar" aria-hidden="true">
                  {initials}
                </div>
                <span
                  className="openregio-topnav-username"
                  data-testid="text-topnav-name"
                >
                  {displayName}
                </span>
                <span
                  className={`openregio-topnav-plan ${isPro ? "is-pro" : "is-basic"}`}
                  data-testid="text-topnav-plan"
                >
                  {planLabel}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {userMenuOpen && (
                <div
                  className="openregio-topnav-dropdown openregio-topnav-dropdown-right"
                  role="menu"
                  data-testid="dropdown-user"
                >
                  <Link
                    href="/account/instellingen"
                    className="openregio-topnav-dropdown-item"
                    role="menuitem"
                    data-testid="dropdown-item-instellingen"
                  >
                    <Settings className="h-3.5 w-3.5 mr-2 inline-block" />
                    Instellingen
                  </Link>
                  <Link
                    href="/groei/profiel"
                    className="openregio-topnav-dropdown-item"
                    role="menuitem"
                    data-testid="dropdown-item-profiel"
                  >
                    Bedrijfsprofiel
                  </Link>
                  <button
                    type="button"
                    className="openregio-topnav-dropdown-item openregio-topnav-dropdown-logout"
                    role="menuitem"
                    onClick={handleLogout}
                    data-testid="button-topnav-logout"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2 inline-block" />
                    Uitloggen
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="openregio-topnav-right" data-testid="topnav-guest">
            <Link
              href="/login"
              className="openregio-topnav-tab"
              data-testid="link-topnav-login"
            >
              Inloggen
            </Link>
            <Link
              href="/lidmaatschap"
              className="openregio-button openregio-button-pro openregio-button-small"
              data-testid="link-topnav-signup"
            >
              Word lid
            </Link>
          </div>
        )}

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
          {tabs.map((t) => {
            const active = isActive(location, t.match);
            const visibleSub = t.sub?.filter(
              (s) => (!s.proOnly || isPro || isAdmin) && (!s.adminOnly || isAdmin),
            );
            return (
              <div key={t.id} className="openregio-topnav-mobile-section">
                {t.href ? (
                  <Link
                    href={t.href}
                    className={`openregio-topnav-mobile-tab ${active ? "is-active" : ""}`}
                    data-testid={`mobile-tab-${t.id}`}
                  >
                    {t.label}
                  </Link>
                ) : (
                  <div
                    className={`openregio-topnav-mobile-tab ${active ? "is-active" : ""}`}
                  >
                    {t.label}
                  </div>
                )}
                {visibleSub && visibleSub.length > 0 && (
                  <div className="openregio-topnav-mobile-sub">
                    {visibleSub.map((s) => {
                      if (s.comingSoon) {
                        return (
                          <div
                            key={s.href}
                            className="openregio-topnav-mobile-subitem openregio-topnav-dropdown-item-disabled"
                            aria-disabled="true"
                            data-testid={`mobile-subitem-${s.href.replace(/\//g, "-").replace(/^-/, "")}`}
                          >
                            {s.label}
                            <span className="openregio-topnav-pill-soon">Binnenkort</span>
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="openregio-topnav-mobile-subitem"
                          data-testid={`mobile-subitem-${s.href.replace(/\//g, "-").replace(/^-/, "")}`}
                        >
                          {s.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {user ? (
            <>
              <div className="openregio-topnav-mobile-user">
                <div className="openregio-topnav-avatar" aria-hidden="true">
                  {initials}
                </div>
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
              {!isPro && !isAdmin && (
                <Link
                  href="/lidmaatschap?plan=pro"
                  className="openregio-button openregio-button-pro"
                  data-testid="link-topnav-mobile-upgrade"
                >
                  Upgrade naar Pro
                </Link>
              )}
              <button
                type="button"
                className="openregio-topnav-mobile-tab openregio-topnav-dropdown-logout"
                onClick={handleLogout}
                data-testid="button-topnav-mobile-logout"
              >
                Uitloggen
              </button>
            </>
          ) : (
            <div
              className="openregio-topnav-mobile-user"
              style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}
            >
              <Link
                href="/login"
                className="openregio-topnav-mobile-tab"
                data-testid="link-topnav-mobile-login"
              >
                Inloggen
              </Link>
              <Link
                href="/lidmaatschap"
                className="openregio-button openregio-button-pro openregio-button-small"
                data-testid="link-topnav-mobile-signup"
              >
                Word lid
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
