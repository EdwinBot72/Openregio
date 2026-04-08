import {
  Sparkles,
  Building2,
  Monitor,
  Signal,
  Landmark,
  Euro,
  ScanText,
  Gavel,
  FolderOpen,
  Bot,
  CreditCard,
  Shield,
  LayoutGrid,
  BookOpen,
  Settings,
  CheckCircle,
  Link2,
  Coins,
  Users,
  FileText,
  BarChart2,
  ShieldCheck,
  MapPin,
  Files,
} from "lucide-react";

export type NavSubItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  proOnly?: boolean;
  adminOnly?: boolean;
};

export type NavSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  url?: string;
  sub?: NavSubItem[];
  adminOnly?: boolean;
};

/** Definitieve hoofdnavigatie — alle rollen */
export const MAIN_NAV: NavSection[] = [
  // 1 ── Dashboard
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Sparkles,
    url: "/dashboard",
  },

  // 2 ── Mijn bedrijf
  {
    id: "mijn-bedrijf",
    title: "Mijn bedrijf",
    icon: Building2,
    sub: [
      { title: "Bedrijfsprofiel", url: "/bedrijfsprofiel", icon: Building2 },
      { title: "Lokale Basischeck", url: "/lokale-basischeck", icon: CheckCircle },
      { title: "Website scan", url: "/tools/website-scan", icon: Monitor, proOnly: true },
    ],
  },

  // 3 ── Kansen
  {
    id: "kansen",
    title: "Kansen",
    icon: Signal,
    sub: [
      { title: "Kansen overzicht", url: "/kansen-in-de-buurt", icon: LayoutGrid },
      { title: "Aanbestedingen", url: "/kansen/aanbestedingen", icon: Landmark },
      { title: "Subsidies & financiering", url: "/kansen/financiering", icon: Euro },
      { title: "Regio-updates", url: "/intel", icon: Signal },
    ],
  },

  // 4 ── Analyse
  {
    id: "analyse",
    title: "Analyse",
    icon: ScanText,
    sub: [
      { title: "Brief laten checken", url: "/tools/brief-analyse", icon: FileText },
      { title: "Regelgeving verkenner", url: "/regelgeving-verkenner", icon: BookOpen },
      { title: "Regio Bieb", url: "/regiobot", icon: Bot, proOnly: true },
      { title: "WOO-documenten", url: "/woo-bibliotheek", icon: FolderOpen, proOnly: true },
      { title: "Mijn documenten", url: "/mijn-documenten", icon: Files, proOnly: true },
      { title: "WOO-verzoek opstellen", url: "/woo-wizard", icon: Gavel, proOnly: true },
    ],
  },

  // 4b ── Leden (iedereen)
  {
    id: "leden",
    title: "Leden",
    icon: Users,
    url: "/leden",
  },

  // 5 ── Affiliate (iedereen)
  {
    id: "affiliate",
    title: "Affiliate",
    icon: Link2,
    sub: [
      { title: "Mijn affiliate-link", url: "/affiliate", icon: Link2 },
      { title: "Commissie & beloningen", url: "/affiliate", icon: Coins },
      { title: "Mijn referrals", url: "/affiliate", icon: Users },
    ],
  },

  // 6 ── Account
  {
    id: "account",
    title: "Account",
    icon: Settings,
    sub: [
      { title: "Lidmaatschap", url: "/lidmaatschap", icon: CreditCard },
      { title: "Privacy & Gegevens", url: "/privacy-dashboard", icon: Shield },
    ],
  },

  // 7 ── Beheer (alleen admin)
  {
    id: "beheer",
    title: "Beheer",
    icon: ShieldCheck,
    adminOnly: true,
    sub: [
      { title: "Beheer dashboard", url: "/admin", icon: BarChart2 },
      { title: "Gebruikers", url: "/admin/users", icon: Users },
      { title: "Ondernemers", url: "/admin/ondernemers", icon: Building2 },
      { title: "Content", url: "/admin/blogs", icon: FileText },
      { title: "Regio & WOO", url: "/admin/woo", icon: MapPin },
      { title: "Systeem", url: "/admin/inzicht", icon: Settings },
    ],
  },
];

export const ACCOUNT_NAV = [
  { title: "Lidmaatschap", url: "/lidmaatschap", icon: CreditCard },
  { title: "Privacy & Gegevens", url: "/privacy-dashboard", icon: Shield },
];

/** Legacy — backward compat */
export const KERN_NAV = MAIN_NAV;
export const GROEI_NAV: NavSection[] = [];
export const EXTRA_NAV: NavSection[] = [];
export const APP_NAV: NavSection[] = MAIN_NAV;
