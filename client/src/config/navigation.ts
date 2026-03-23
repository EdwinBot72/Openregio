import {
  LayoutDashboard,
  Activity,
  Megaphone,
  Landmark,
  Bot,
  Gavel,
  FileText,
  FolderOpen,
  Newspaper,
  Eye,
  Building2,
  Monitor,
  Shield,
  Users,
  Share2,
  ScanText,
  Signal,
} from "lucide-react";

export type NavSubItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  proOnly?: boolean;
};

export type NavSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  url?: string;
  sub?: NavSubItem[];
};

export const APP_NAV: NavSection[] = [
  {
    id: "overzicht",
    title: "Overzicht",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    id: "intel",
    title: "Regio Intel",
    icon: Signal,
    url: "/intel",
  },
  {
    id: "regio",
    title: "Regio volgen",
    icon: Activity,
    sub: [
      { title: "Brief begrijpen", url: "/tools/brief-analyse", icon: ScanText },
      { title: "Regels & besluiten", url: "/beleidsmonitor", icon: Activity },
      { title: "Gemeente-updates", url: "/kansen/gemeente-updates", icon: Megaphone },
      { title: "Aanbestedingen", url: "/kansen/aanbestedingen", icon: Landmark },
    ],
  },
  {
    id: "documenten",
    title: "Wetgeving & Regelgeving",
    icon: FileText,
    sub: [
      { title: "Regelgeving verkenner", url: "/regelgeving-verkenner", icon: Activity },
      { title: "Verzoek indienen", url: "/woo-wizard", icon: Gavel },
      { title: "Mijn documenten", url: "/woo-bibliotheek", icon: FolderOpen },
      { title: "Regelgeving-assistent", url: "/woo-bot", icon: Newspaper },
      { title: "RegioBot", url: "/regiobot", icon: Bot, proOnly: true },
    ],
  },
  {
    id: "zichtbaarheid",
    title: "Zichtbaarheid",
    icon: Eye,
    sub: [
      { title: "Bedrijfsprofiel", url: "/bedrijfsprofiel", icon: Building2 },
      { title: "Website Scan", url: "/tools/website-scan", icon: Monitor, proOnly: true },
    ],
  },
  {
    id: "netwerk",
    title: "Netwerk",
    icon: Users,
    sub: [
      { title: "RegioCrew", url: "/regiocrew", icon: Users },
      { title: "Regio Deals", url: "/kansen/regio-deals", icon: Landmark },
      { title: "Community", url: "/community", icon: Share2 },
      { title: "Privacy & zichtbaarheid", url: "/pro/visibility-settings", icon: Shield, proOnly: true },
    ],
  },
];

export const ACCOUNT_NAV = [
  { title: "Privacy & Gegevens", url: "/privacy-dashboard", icon: Shield },
  { title: "Affiliate", url: "/affiliate", icon: Share2 },
];
