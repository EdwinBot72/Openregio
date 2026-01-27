import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Users, Bot, Building2, User, LogOut, MessageCircle, CreditCard, Shield, Eye, UserPlus, BookOpen, Settings, Share2, FolderOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl, getLogoutUrl } from "@/lib/authUtils";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
    color: "text-regio-graph",
  },
  {
    title: "Netwerk",
    icon: Users,
    url: "/network",
    color: "text-regio-blue",
  },
  {
    title: "RegioCrew",
    icon: UserPlus,
    url: "/regiocrew",
    color: "text-regio-blue",
  },
  {
    title: "Chat",
    icon: MessageCircle,
    url: "/chat",
    color: "text-regio-blue",
  },
  {
    title: "RegioBot",
    icon: Bot,
    url: "/regiobot",
    color: "text-regio-purple",
  },
  {
    title: "WOO-bibliotheek",
    icon: FolderOpen,
    url: "/woo-bibliotheek",
    color: "text-regio-purple",
  },
  {
    title: "Coöperatie",
    icon: Building2,
    url: "/cooperative",
    color: "text-regio-graph",
  },
];

export function AppSidebar() {
  const { user, profile, isLoading } = useAuth();

  // Helper to get user initials
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
            <p className="text-xs text-muted-foreground">Coöperatief platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigatie</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`link-${item.title.toLowerCase()}`}>
                    <a href={item.url}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-bedrijfsprofiel">
                  <a href="/bedrijfsprofiel">
                    <Building2 className="h-4 w-4 text-regio-blue" />
                    <span>Bedrijfsprofiel</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-lidmaatschap">
                  <a href="/lidmaatschap">
                    <CreditCard className="h-4 w-4 text-regio-alert" />
                    <span>Lidmaatschap</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-privacy-dashboard">
                  <a href="/privacy-dashboard">
                    <Shield className="h-4 w-4 text-regio-graph" />
                    <span>Privacy & Gegevens</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.plan === "pro" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-testid="link-visibility-settings">
                    <a href="/pro/visibility-settings">
                      <Eye className="h-4 w-4 text-regio-blue" />
                      <span>Zichtbaarheidsbeheer</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-affiliate">
                  <a href="/affiliate">
                    <Share2 className="h-4 w-4 text-regio-alert" />
                    <span>Affiliate</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Beheer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-testid="link-admin-blogs">
                    <a href="/admin/blogs">
                      <BookOpen className="h-4 w-4 text-regio-purple" />
                      <span>Blogs</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9">
                {user.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={displayName} />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" data-testid="text-user-name">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">{displayEmail}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              data-testid="button-logout"
              onClick={async () => {
                try {
                  await fetch(getLogoutUrl(), { 
                    method: "POST", 
                    credentials: "include" 
                  });
                  window.location.href = "/";
                } catch (e) {
                  window.location.href = "/";
                }
              }}
            >
              <LogOut className="h-4 w-4" />
              Uitloggen
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full gap-2"
            data-testid="button-login"
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
          >
            <User className="h-4 w-4" />
            Inloggen
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
