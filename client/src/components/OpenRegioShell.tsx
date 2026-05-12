import { ReactNode, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

type SidebarItem = {
  label: string;
  icon: string;
  url: string;
  badge?: number | string;
  pijler?: "p1" | "p2" | "p3";
};

type SidebarGroup = {
  label: string;
  items: SidebarItem[];
  className?: string;
};

const TOP_NAV: SidebarItem[] = [
  { label: "Dashboard", icon: "🏠", url: "/vandaag" },
  { label: "Mijn Regio", icon: "🗺️", url: "/regels/updates" },
  { label: "Netwerk", icon: "👥", url: "/network" },
];

const PIJLER_NAV: SidebarItem[] = [
  { label: "Grip op Regels", icon: "⚖️", url: "/pijler/grip", pijler: "p1" },
  { label: "Lokale Zichtbaarheid", icon: "🌐", url: "/pijler/zichtbaarheid", pijler: "p2" },
  { label: "Lokale Kracht", icon: "🤝", url: "/pijler/kracht", pijler: "p3" },
];

const OVERIG_NAV: SidebarItem[] = [
  { label: "Acties", icon: "📅", url: "/lokale-acties" },
  { label: "Marktplaats", icon: "🛒", url: "/lokaal-marktplaats" },
  { label: "Subsidies", icon: "€", url: "/kansen/subsidies" },
  { label: "Affiliate", icon: "💼", url: "/account/affiliate" },
  { label: "Instellingen", icon: "⚙️", url: "/account/instellingen" },
];

const ADMIN_NAV: SidebarItem[] = [
  { label: "Beheer dashboard", icon: "🛡️", url: "/admin" },
  { label: "Gebruikers", icon: "👤", url: "/admin/users" },
  { label: "Ondernemers", icon: "🏢", url: "/admin/ondernemers" },
];

function getInitials(firstName: string | null, lastName: string | null, email: string): string {
  const fn = (firstName || "").trim();
  const ln = (lastName || "").trim();
  if (fn && ln) return (fn[0] + ln[0]).toUpperCase();
  if (fn) return fn.slice(0, 2).toUpperCase();
  return (email || "??").slice(0, 2).toUpperCase();
}

function NavLink({ item, currentPath }: { item: SidebarItem; currentPath: string }) {
  const actief = currentPath === item.url || currentPath.startsWith(item.url + "/");
  const pijlerClass = item.pijler ? ` or-${item.pijler}` : "";
  return (
    <Link
      href={item.url}
      className={`or-nav-item${pijlerClass}${actief ? " or-actief" : ""}`}
      data-testid={`nav-${item.url.replace(/\//g, "-")}`}
    >
      <span className="or-nav-icon" aria-hidden>{item.icon}</span>
      <span>{item.label}</span>
      {item.badge !== undefined && <span className="or-nav-badge">{item.badge}</span>}
    </Link>
  );
}

function SidebarSection({ group, currentPath, extraClass }: { group: SidebarGroup; currentPath: string; extraClass?: string }) {
  return (
    <div className={`or-sidebar-sectie${extraClass ? " " + extraClass : ""}`}>
      <div className="or-sidebar-label">{group.label}</div>
      {group.items.map((item) => (
        <NavLink key={item.url} item={item} currentPath={currentPath} />
      ))}
    </div>
  );
}

export function OpenRegioShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const initials = useMemo(() => {
    if (!user) return "??";
    return getInitials(user.firstName, user.lastName, user.email);
  }, [user]);

  const naam = useMemo(() => {
    if (!user) return "Gast";
    const fn = (user.firstName || "").trim();
    const ln = (user.lastName || "").trim();
    if (fn || ln) return `${fn} ${ln}`.trim();
    return user.email.split("@")[0];
  }, [user]);

  const sectorLabel = useMemo(() => {
    if (!user) return "";
    const region = user.region || "Nederland";
    const sector = user.sector || user.category || "Ondernemer";
    return `${sector} · ${region}`;
  }, [user]);

  const isAdmin = user?.role === "admin" || user?.role === "master" || user?.isAdmin;

  // Notificaties (light): aantal nieuwe items in regels-updates of meldingen-feed
  const { data: meldingenData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
    staleTime: 60_000,
    retry: false,
  });
  const notifCount = meldingenData?.count ?? 0;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
    },
  });

  return (
    <div className="or-app" data-testid="layout-openregio-shell">
      {/* TOPBAR */}
      <header className="or-topbar">
        <Link href="/vandaag" className="or-topbar-logo" data-testid="link-home">
          <svg className="or-topbar-logo-pin" viewBox="0 0 28 34" fill="none" aria-hidden>
            <path d="M14 1C7.4 1 2 6.4 2 13C2 22 14 33 14 33C14 33 26 22 26 13C26 6.4 20.6 1 14 1Z" fill="#2563a8"/>
            <path d="M10 12C10 10.3 11.8 9 14 11C16.2 9 18 10.3 18 12C18 14.5 14 17 14 17C14 17 10 14.5 10 12Z" fill="white"/>
          </svg>
          <span><span className="or-open">OPEN</span><span className="or-regio">REGIO</span></span>
        </Link>

        <div className="or-topbar-sep" />

        <div className="or-topbar-search-wrap">
          <input
            className="or-topbar-search"
            type="text"
            placeholder="Zoek in OpenRegio..."
            data-testid="input-search"
          />
        </div>

        <button
          type="button"
          className="or-topbar-bell"
          title="Meldingen"
          onClick={() => setLocation("/regels/updates")}
          data-testid="button-notifications"
        >
          🔔
          {notifCount > 0 && <span className="or-notif-dot" />}
        </button>

        <Link href="/account/instellingen" className="or-topbar-avatar" data-testid="link-account">
          <span className="or-avatar-circle">{initials}</span>
          <span className="or-avatar-naam">{naam}</span>
          <span className="or-avatar-pijl">▾</span>
        </Link>
      </header>

      <div className="or-layout">
        {/* SIDEBAR */}
        <aside className="or-sidebar">
          <SidebarSection
            group={{ label: "Navigatie", items: TOP_NAV }}
            currentPath={location}
          />
          <hr className="or-sidebar-divider" />
          <SidebarSection
            group={{ label: "Drie Pijlers", items: PIJLER_NAV }}
            currentPath={location}
            extraClass="or-pijler-nav"
          />
          <hr className="or-sidebar-divider" />
          <SidebarSection
            group={{ label: "Overig", items: OVERIG_NAV }}
            currentPath={location}
          />
          {isAdmin && (
            <>
              <hr className="or-sidebar-divider" />
              <SidebarSection
                group={{ label: "Beheer", items: ADMIN_NAV }}
                currentPath={location}
              />
            </>
          )}

          <div className="or-sidebar-profiel">
            <div className="or-profiel-kaart">
              <div className="or-profiel-avatar">{initials}</div>
              <div className="or-profiel-info">
                <div className="or-profiel-naam">{naam}</div>
                <div className="or-profiel-sector">{sectorLabel}</div>
              </div>
              <button
                type="button"
                className="or-profiel-uitlog"
                title="Uitloggen"
                onClick={() => logoutMutation.mutate()}
                data-testid="button-logout"
              >
                ⏏
              </button>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="or-content protected-content" data-testid="main-content">
          {children}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="or-content-footer">
        <div className="or-footer-tekst">© 2026 OpenRegio · Sterke ondernemers. Sterke regio's.</div>
        <div className="or-footer-links">
          <Link href="/privacy" className="or-footer-link">Privacy</Link>
          <Link href="/voorwaarden" className="or-footer-link">Voorwaarden</Link>
          <Link href="/disclaimer" className="or-footer-link">Disclaimer</Link>
          <Link href="/cookiebeleid" className="or-footer-link">Cookies</Link>
        </div>
      </footer>
    </div>
  );
}

export default OpenRegioShell;
