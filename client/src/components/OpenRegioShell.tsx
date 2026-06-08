import { ReactNode, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Home, Bot, Mail, FileSearch, BookOpen, Globe, TrendingUp,
  Users, CalendarDays, Lightbulb, Euro, MapPin, LogOut,
  Settings, ShieldCheck, BarChart2, Building2, FileText,
  Bell, Zap, Scale, Handshake, Newspaper, Activity, Shield,
} from "lucide-react";

type ChipColor = "red" | "orange" | "blue" | "green";

type NavItemProps = {
  icon: React.ElementType;
  href: string;
  label: string;
  currentPath: string;
  pijler?: "p1" | "p2" | "p3";
  chipLabel?: string | number;
  chipColor?: ChipColor;
};

function NavItem({ icon: Icon, href, label, currentPath, pijler, chipLabel, chipColor }: NavItemProps) {
  const actief = currentPath === href || currentPath.startsWith(href + "/");
  const pijlerClass = pijler ? ` or-${pijler}` : "";
  return (
    <Link
      href={href}
      className={`or-nav-item${pijlerClass}${actief ? " or-actief" : ""}`}
      data-testid={`nav-${href.replace(/\//g, "-")}`}
    >
      <span className="or-nav-icon">
        <Icon size={15} />
      </span>
      <span>{label}</span>
      {chipLabel !== undefined && (
        <span className={`or-nav-chip or-chip-${chipColor ?? "red"}`}>{chipLabel}</span>
      )}
    </Link>
  );
}

type PijlerHeaderProps = {
  num: ReactNode;
  name: string;
  numClass?: string;
};

function PijlerHeader({ num, name, numClass = "" }: PijlerHeaderProps) {
  return (
    <div className="or-pijler-nav-header">
      <div className={`or-pijler-nav-num ${numClass}`}>{num}</div>
      <div className="or-pijler-nav-name">{name}</div>
    </div>
  );
}

function getInitials(firstName: string | null, lastName: string | null, email: string): string {
  const fn = (firstName || "").trim();
  const ln = (lastName || "").trim();
  if (fn && ln) return (fn[0] + ln[0]).toUpperCase();
  if (fn) return fn.slice(0, 2).toUpperCase();
  return (email || "??").slice(0, 2).toUpperCase();
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

  const bedrijfslabel = useMemo(() => {
    if (!user) return "";
    const sector = (user as any).businessName || user.sector || user.category || "Ondernemer";
    const region = user.region || "Nederland";
    return `${sector} · ${region}`;
  }, [user]);

  const isPro = (user as any)?.plan === "pro" || (user as any)?.subscription === "pro";
  const isAdmin = user?.role === "admin" || user?.role === "master" || (user as any)?.isAdmin;

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
      <div className="or-layout">

        {/* ══ SIDEBAR ══ */}
        <aside className="or-sidebar">

          {/* HEAD: Brand + User */}
          <div className="or-sb-head">
            <Link href="/vandaag" className="or-sb-brand" data-testid="link-home">
              <div className="or-sb-brand-mark">
                <MapPin size={17} />
              </div>
              <span className="or-sb-brand-name">
                <span className="or-open">Open</span><span className="or-regio">Regio</span>
              </span>
            </Link>
            <div className="or-sb-user">
              <div className="or-sb-user-av">{initials}</div>
              <div className="or-sb-user-info">
                <div className="or-sb-user-name">{naam}</div>
                <div className="or-sb-user-biz">{bedrijfslabel}</div>
              </div>
              {isPro && <span className="or-plan-badge">PRO</span>}
            </div>
          </div>

          {/* BODY: Nav */}
          <div className="or-sb-body">

            {/* Overzicht */}
            <div className="or-sec-label">Overzicht</div>
            <NavItem
              icon={Home}
              href="/vandaag"
              label="Vandaag"
              currentPath={location}
              chipLabel={notifCount > 0 ? notifCount : undefined}
              chipColor="red"
            />
            <NavItem
              icon={Bot}
              href="/regiobot"
              label="RegioBot"
              currentPath={location}
            />

            <div className="or-sb-div" />

            {/* Pijler 1: Grip op Regels */}
            <PijlerHeader num="1" name="GRIP OP REGELS" numClass="or-num-p1" />
            <NavItem
              icon={Shield}
              href="/regels/sectorregels"
              label="Sectorregels"
              currentPath={location}
              pijler="p1"
            />
            <NavItem
              icon={Bell}
              href="/regels/ontwikkelingen"
              label="Wat komt eraan?"
              currentPath={location}
              pijler="p1"
            />
            <NavItem
              icon={FileText}
              href="/regels/documenten"
              label="Documenten opvragen"
              currentPath={location}
              pijler="p1"
            />

            <div className="or-sb-div" />

            {/* Pijler 2: Lokale Zichtbaarheid */}
            <PijlerHeader num="2" name="LOKALE ZICHTBAARHEID" numClass="or-num-p2" />
            <NavItem
              icon={Globe}
              href="/groei/website-check"
              label="Website scan"
              currentPath={location}
              pijler="p2"
            />
            <NavItem
              icon={TrendingUp}
              href="/groei/zichtbaarheid"
              label="Vindbaarheid"
              currentPath={location}
              pijler="p2"
            />
            <NavItem
              icon={Building2}
              href="/groei/profiel"
              label="Bedrijfsprofiel"
              currentPath={location}
              pijler="p2"
            />

            <div className="or-sb-div" />

            {/* Pijler 3: Lokale Kracht */}
            <PijlerHeader num="3" name="LOKALE KRACHT" numClass="or-num-p3" />
            <NavItem
              icon={Users}
              href="/network"
              label="Netwerk"
              currentPath={location}
              pijler="p3"
            />
            <NavItem
              icon={CalendarDays}
              href="/lokale-acties"
              label="Lokale acties"
              currentPath={location}
              pijler="p3"
            />
            <NavItem
              icon={Handshake}
              href="/lokaal-marktplaats"
              label="Marktplaats"
              currentPath={location}
              pijler="p3"
            />
            <NavItem
              icon={Newspaper}
              href="/blogs"
              label="Blog"
              currentPath={location}
              pijler="p3"
            />

            <div className="or-sb-div" />

            {/* Verdien mee */}
            <PijlerHeader
              num={<Euro size={11} />}
              name="VERDIEN MEE"
              numClass="or-num-euro"
            />
            <NavItem
              icon={Euro}
              href="/account/affiliate"
              label="Affiliate"
              currentPath={location}
              chipLabel="Actief"
              chipColor="green"
            />
            <NavItem
              icon={Settings}
              href="/account/instellingen"
              label="Instellingen"
              currentPath={location}
            />

            {isAdmin && (
              <>
                <div className="or-sb-div" />
                <PijlerHeader
                  num={<ShieldCheck size={11} />}
                  name="BEHEER"
                  numClass="or-num-admin"
                />
                <NavItem icon={BarChart2} href="/admin" label="Dashboard" currentPath={location} />
                <NavItem icon={Users} href="/admin/users" label="Gebruikers" currentPath={location} />
                <NavItem icon={Building2} href="/admin/ondernemers" label="Ondernemers" currentPath={location} />
                <NavItem icon={FileText} href="/admin/blogs" label="Content" currentPath={location} />
                <NavItem icon={MapPin} href="/admin/woo" label="Regio & WOO" currentPath={location} />
              </>
            )}

          </div>

          {/* FOOTER: Health bar + Logout */}
          <div className="or-sb-foot">
            <div className="or-health-block">
              <div className="or-health-top">
                <span className="or-health-lbl">Bedrijfsgezondheid</span>
                <span className="or-health-val">72/100</span>
              </div>
              <div className="or-health-bar">
                <div className="or-health-fill" style={{ width: "72%" }} />
              </div>
            </div>
            <button
              type="button"
              className="or-sb-logout"
              title="Uitloggen"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut size={14} />
              <span>Uitloggen</span>
            </button>
          </div>

        </aside>

        {/* ══ CONTENT ══ */}
        <main className="or-content protected-content" data-testid="main-content">
          {children}
        </main>

      </div>
    </div>
  );
}

export default OpenRegioShell;
