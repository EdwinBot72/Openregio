import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { MAIN_NAV, type NavSection } from "@/config/navigation";

// ── Generieke nav-sectie ──────────────────────────────────────────────────────

function NavSectionItem({
  section,
  currentPath,
  isPro,
  isAdmin,
  badgeCount,
}: {
  section: NavSection;
  currentPath: string;
  isPro: boolean;
  isAdmin: boolean;
  badgeCount?: number;
}) {
  // isActive: controleer zowel de sectie-url als alle sub-routes
  const isActive =
    (section.url
      ? currentPath === section.url || currentPath.startsWith(section.url + "/")
      : false) ||
    (section.sub?.some(
      (s) => currentPath === s.url || currentPath.startsWith(s.url + "/")
    ) ?? false);

  const [open, setOpen] = useState(isActive);

  // Sync open-state when the active section changes (e.g. after redirects or deep links)
  useEffect(() => {
    if (isActive) {
      setOpen(true);
    }
  }, [isActive]);

  // Direct-link (geen sub-items)
  if (section.url && !section.sub) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          data-testid={`link-nav-${section.id}`}
        >
          <Link href={section.url} className="flex items-center gap-2">
            <section.icon className="h-4 w-4" />
            <span>{section.title}</span>
            {badgeCount && badgeCount > 0 ? (
              <Badge
                variant="secondary"
                className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-orange-100 text-orange-700 border-orange-200"
                data-testid={`badge-unread-${section.id}`}
              >
                {badgeCount > 9 ? "9+" : badgeCount}
              </Badge>
            ) : null}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Alleen zichtbare sub-items op basis van rol.
  // proOnly = alleen voor Pro zichtbaar.
  // proLocked = altijd zichtbaar; voor niet-Pro met "Pro"-badge en upgrade-link.
  const visibleSub = section.sub?.filter(
    (s) => (!s.proOnly || isPro || isAdmin) && (!s.adminOnly || isAdmin)
  );

  // Gedeeld icoon-element: pijler-cirkel of gewoon icoon
  const SectionIcon = () =>
    section.pijler != null ? (
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted-foreground/30 text-sidebar-foreground"
        }`}
      >
        {section.pijler}
      </span>
    ) : (
      <section.icon className="h-4 w-4 shrink-0" />
    );

  return (
    <SidebarMenuItem>
      {section.url ? (
        // Sectie met URL: label navigeert, chevron togglet submenu
        <div className="flex items-center w-full rounded-md">
          <SidebarMenuButton
            asChild
            isActive={isActive}
            data-testid={`link-nav-${section.id}`}
            className="flex-1 justify-start"
            onClick={() => setOpen(true)}
          >
            <Link href={section.url} className="flex items-center gap-2">
              <SectionIcon />
              <span>{section.title}</span>
            </Link>
          </SidebarMenuButton>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
            className="flex items-center justify-center h-8 w-7 shrink-0 text-muted-foreground hover:text-foreground rounded-md"
            data-testid={`toggle-nav-${section.id}`}
            aria-label="Submenu uitklappen"
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ) : (
        // Sectie zonder URL: hele knop is een toggle
        <SidebarMenuButton
          isActive={isActive && !open}
          onClick={() => setOpen((v) => !v)}
          data-testid={`toggle-nav-${section.id}`}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <SectionIcon />
            <span>{section.title}</span>
          </span>
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </SidebarMenuButton>
      )}

      {open && (
        <SidebarMenuSub>
          {visibleSub?.map((sub) => {
            const subActive =
              currentPath === sub.url || currentPath.startsWith(sub.url + "/");
            const showProBadge = sub.proLocked && !isPro && !isAdmin;
            return (
              <SidebarMenuSubItem key={`${sub.url}-${sub.title}`}>
                <SidebarMenuSubButton
                  asChild
                  isActive={subActive}
                  data-testid={`link-sub-${sub.url.replace(/\//g, "-").replace(/^-/, "")}`}
                >
                  <Link href={sub.url} className="flex items-center gap-2">
                    <sub.icon className="h-3.5 w-3.5" />
                    <span>{sub.title}</span>
                    {showProBadge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[9px] px-1.5 py-0 h-4 bg-orange-100 text-orange-700 border-orange-200"
                        data-testid={`badge-pro-${sub.url.replace(/\//g, "-").replace(/^-/, "")}`}
                      >
                        Pro
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

// ── AppSidebar ────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const { user, profile, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
    } finally {
      queryClient.clear();
      setLocation("/");
    }
  };

  const isPro = user?.plan === "pro";
  const isAdmin = user?.role === "master" || user?.role === "admin" || !!user?.isAdmin;

  // Ongelezen leden-updates → badge bij "Vandaag"
  const { data: unread } = useQuery<{ count: number }>({
    queryKey: ["/api/news/unread-count"],
    enabled: !!user,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5,
  });
  const unreadCount = unread?.count ?? 0;

  const getInitials = () => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
    }
    if (profile?.name) {
      const parts = profile.name.split(" ");
      return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : profile.name.substring(0, 2).toUpperCase();
    }
    return "OR";
  };

  const displayName =
    profile?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Gebruiker";
  const displayEmail = profile?.email || user?.email || "";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-accent font-bold text-xl">OR</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-accent font-bold text-lg leading-none">OpenRegio</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Voor lokale ondernemers</p>
          </div>
          {isPro && (
            <Badge variant="secondary" className="ml-auto text-[10px] shrink-0">
              Pro
            </Badge>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map((section) => {
                if (section.adminOnly && !isAdmin) return null;

                return (
                  <NavSectionItem
                    key={section.id}
                    section={section}
                    currentPath={location}
                    isPro={isPro}
                    isAdmin={isAdmin}
                    badgeCount={section.id === "vandaag" ? unreadCount : undefined}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile?.avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate leading-none"
                data-testid="text-sidebar-name"
              >
                {displayName}
              </p>
              <p
                className="text-xs text-muted-foreground truncate mt-0.5"
                data-testid="text-sidebar-email"
              >
                {displayEmail}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" asChild data-testid="link-profiel">
                <Link href="/groei/profiel">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-logout"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
