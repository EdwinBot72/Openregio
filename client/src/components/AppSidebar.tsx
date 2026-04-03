import { useState } from "react";
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
  Shield,
  ChevronDown,
  ChevronRight,
  MapPin,
  Gavel,
  Users,
  BarChart2,
  ShieldCheck,
  Building2,
  Landmark,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { MAIN_NAV, type NavSection } from "@/config/navigation";

const adminSubItems = [
  { title: "Admin Cockpit", url: "/admin", icon: ShieldCheck },
  { title: "Woo-monitoring", url: "/admin/woo", icon: Gavel },
  { title: "Regio-beheer", url: "/admin/regios", icon: MapPin },
  { title: "Platform-inzicht", url: "/admin/inzicht", icon: BarChart2 },
  { title: "Gebruikers", url: "/admin/users", icon: Users },
  { title: "Ondernemers", url: "/admin/ondernemers", icon: Building2 },
  { title: "Regio Intel", url: "/admin/intel", icon: Landmark },
];

function AdminNavSection({ currentPath }: { currentPath: string }) {
  const isActive = currentPath.startsWith("/admin");
  const [open, setOpen] = useState(isActive);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive && !open}
        onClick={() => setOpen((v) => !v)}
        data-testid="toggle-nav-admin"
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Beheer</span>
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub>
          {adminSubItems.map((item) => {
            const subActive = currentPath === item.url || (item.url !== "/admin" && currentPath.startsWith(item.url + "/"));
            return (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={subActive}
                  data-testid={`link-admin-${item.url.replace(/\//g, "-").replace(/^-/, "")}`}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.title}</span>
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

function NavSectionItem({
  section,
  currentPath,
  isPro,
  isMaster,
}: {
  section: NavSection;
  currentPath: string;
  isPro: boolean;
  isMaster: boolean;
}) {
  const isActive = section.url
    ? currentPath === section.url
    : section.sub?.some((s) => currentPath === s.url || currentPath.startsWith(s.url + "/"));

  const [open, setOpen] = useState(isActive ?? false);

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
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const visibleSub = section.sub?.filter(
    (s) => (!s.proOnly || isPro) && (!s.masterOnly || isMaster)
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive && !open}
        onClick={() => setOpen((v) => !v)}
        data-testid={`toggle-nav-${section.id}`}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <section.icon className="h-4 w-4" />
          <span>{section.title}</span>
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </SidebarMenuButton>

      {open && visibleSub && (
        <SidebarMenuSub>
          {visibleSub.map((sub) => {
            const subActive =
              currentPath === sub.url || currentPath.startsWith(sub.url + "/");
            return (
              <SidebarMenuSubItem key={sub.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={subActive}
                  data-testid={`link-sub-${sub.url.replace(/\//g, "-").replace(/^-/, "")}`}
                >
                  <Link href={sub.url} className="flex items-center gap-2">
                    <sub.icon className="h-3.5 w-3.5" />
                    <span>{sub.title}</span>
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
  const isMaster = user?.role === "master" || user?.role === "admin";

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
            <Badge variant="secondary" className="ml-auto text-[10px] shrink-0">Pro</Badge>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* ── HOOFDNAVIGATIE ─────────────────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map((section) => {
                if (section.proOnly && !isPro) {
                  return (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton asChild data-testid={`link-nav-${section.id}-upgrade`}>
                        <Link href="/lidmaatschap" className="flex items-center gap-2 text-muted-foreground">
                          <section.icon className="h-4 w-4" />
                          <span>{section.title} — Pro</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                return (
                  <NavSectionItem
                    key={section.id}
                    section={section}
                    currentPath={location}
                    isPro={isPro}
                    isMaster={isMaster}
                  />
                );
              })}

              {user?.isAdmin && (
                <AdminNavSection currentPath={location} />
              )}
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
              <p className="text-sm font-medium truncate leading-none" data-testid="text-sidebar-name">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5" data-testid="text-sidebar-email">
                {displayEmail}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" asChild data-testid="link-profiel">
                <Link href="/bedrijfsprofiel">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-logout" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
