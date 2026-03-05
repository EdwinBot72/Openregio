import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  LayoutDashboard,
  Building2,
  User,
  LogOut,
  Shield,
  Eye,
  Share2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Landmark,
  Megaphone,
  MapPin,
  Activity,
  FolderOpen,
  Bot,
  Gavel,
  Monitor,
  BookMarked,
  ScanText,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { getLogoutUrl } from "@/lib/authUtils";
import { useLocation } from "wouter";

type NavSubItem = {
  title: string;
  url: string;
  icon: React.ElementType;
};

type NavSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  url?: string;
  sub?: NavSubItem[];
};

const navSections: NavSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    id: "informatie",
    title: "Informatie",
    icon: BookOpen,
    sub: [
      { title: "Regels", url: "/beleidsmonitor", icon: Activity },
      { title: "Besluiten", url: "/kansen/gemeente-updates", icon: Megaphone },
      { title: "RegioBot", url: "/regiobot", icon: Bot },
      { title: "Aanbestedingen", url: "/kansen/aanbestedingen", icon: Landmark },
      { title: "Kennisbank", url: "/informatie/kennisbank", icon: BookMarked },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    icon: Wrench,
    sub: [
      { title: "Brief analyse", url: "/tools/brief-analyse", icon: ScanText },
      { title: "Informatie opvragen", url: "/woo-wizard", icon: Gavel },
      { title: "Documenten", url: "/woo-bibliotheek", icon: FolderOpen },
    ],
  },
  {
    id: "zichtbaarheid",
    title: "Zichtbaarheid",
    icon: Eye,
    sub: [
      { title: "Website check", url: "/zichtbaarheid/website-onderhoud", icon: Monitor },
      { title: "Lokale vindbaarheid", url: "/zichtbaarheid/vindbaarheid", icon: MapPin },
    ],
  },
];

function NavSectionItem({ section, currentPath }: { section: NavSection; currentPath: string }) {
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
          <a href={section.url} className="flex items-center gap-2">
            <section.icon className="h-4 w-4" />
            <span>{section.title}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

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
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </SidebarMenuButton>

      {open && section.sub && (
        <SidebarMenuSub>
          {section.sub.map((sub) => {
            const subActive = currentPath === sub.url || currentPath.startsWith(sub.url + "/");
            return (
              <SidebarMenuSubItem key={sub.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={subActive}
                  data-testid={`link-sub-${sub.url.replace(/\//g, "-").replace(/^-/, "")}`}
                >
                  <a href={sub.url} className="flex items-center gap-2">
                    <sub.icon className="h-3.5 w-3.5" />
                    <span>{sub.title}</span>
                  </a>
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
  const [location] = useLocation();

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

  const displayName = profile?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Gebruiker";
  const displayEmail = profile?.email || user?.email || "";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-accent font-bold text-xl">OR</span>
          </div>
          <div>
            <h2 className="font-accent font-bold text-lg">OpenRegio</h2>
            <p className="text-xs text-muted-foreground">Regelgeving transparant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSections.map((section) => (
                <NavSectionItem key={section.id} section={section} currentPath={location} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/bedrijfsprofiel"} data-testid="link-bedrijfsprofiel">
                  <a href="/bedrijfsprofiel" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Bedrijfsprofiel</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/privacy-dashboard"} data-testid="link-privacy-dashboard">
                  <a href="/privacy-dashboard" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Privacy & Gegevens</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.plan === "pro" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/pro/visibility-settings"} data-testid="link-visibility-settings">
                    <a href="/pro/visibility-settings" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Zichtbaarheidsbeheer</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/affiliate"} data-testid="link-affiliate">
                  <a href="/affiliate" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Affiliate</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.startsWith("/admin")} data-testid="link-admin">
                      <a href="/admin/users" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Beheer</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-sidebar-name">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-sidebar-email">{displayEmail}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                asChild
                data-testid="link-profiel"
              >
                <a href="/bedrijfsprofiel">
                  <User className="h-4 w-4" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                asChild
                data-testid="button-logout"
              >
                <a href={getLogoutUrl()}>
                  <LogOut className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
