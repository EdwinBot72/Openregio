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
import { Home, Users, Bot, Building2, User, LogOut, MessageCircle, Newspaper, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/",
  },
  {
    title: "Netwerk",
    icon: Users,
    url: "/network",
  },
  {
    title: "Community",
    icon: Newspaper,
    url: "/community",
  },
  {
    title: "Chat",
    icon: MessageCircle,
    url: "/chat",
  },
  {
    title: "RegioBot",
    icon: Bot,
    url: "/regiobot",
  },
  {
    title: "Coöperatie",
    icon: Building2,
    url: "/cooperative",
  },
];

export function AppSidebar() {
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
                      <item.icon className="h-4 w-4" />
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
                <SidebarMenuButton asChild data-testid="link-profile">
                  <a href="/profile">
                    <User className="h-4 w-4" />
                    <span>Mijn Profiel</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-lidmaatschap">
                  <a href="/lidmaatschap">
                    <CreditCard className="h-4 w-4" />
                    <span>Lidmaatschap</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">Jan de Vries</p>
            <p className="text-xs text-muted-foreground truncate">jan@bakkerij.nl</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-logout">
          <LogOut className="h-4 w-4" />
          Uitloggen
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
