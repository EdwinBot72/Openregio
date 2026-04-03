import {
  Sparkles,
  Eye,
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
  TrendingUp,
  Settings,
  CheckCircle,
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
  proOnly?: boolean;
};

/** Hoofdnavigatie — outcome-based, geen tool-namen */
export const MAIN_NAV: NavSection[] = [
  {
    id: "vandaag",
    title: "Vandaag",
    icon: Sparkles,
    url: "/dashboard",
  },
  {
    id: "beter-worden",
    title: "Ik wil beter worden",
    icon: TrendingUp,
    sub: [
      { title: "Website check", url: "/tools/website-scan", icon: Monitor },
      { title: "Lokale Basischeck", url: "/basischeck", icon: CheckCircle },
      { title: "Regelgeving verkenner", url: "/regelgeving-verkenner", icon: BookOpen },
    ],
  },
  {
    id: "kansen-zien",
    title: "Ik wil kansen zien",
    icon: Signal,
    sub: [
      { title: "Kansen overzicht", url: "/kansen-in-de-buurt", icon: LayoutGrid },
      { title: "Aanbestedingen", url: "/kansen/aanbestedingen", icon: Landmark },
      { title: "Subsidies & financiering", url: "/kansen/financiering", icon: Euro },
      { title: "Regio-updates", url: "/intel", icon: Signal },
    ],
  },
  {
    id: "brief-checken",
    title: "Brief laten checken",
    icon: ScanText,
    url: "/tools/brief-analyse",
  },
  {
    id: "profiel-live",
    title: "Profiel live zetten",
    icon: Eye,
    url: "/bedrijfsprofiel",
  },
  {
    id: "bibliotheek",
    title: "Bibliotheek",
    icon: BookOpen,
    proOnly: true,
    sub: [
      { title: "Regelgeving-assistent", url: "/regiobot", icon: Bot },
      { title: "WOO-documenten", url: "/woo-bibliotheek", icon: FolderOpen },
      { title: "Verzoek indienen", url: "/woo-wizard", icon: Gavel },
    ],
  },
  {
    id: "mijn-bedrijf",
    title: "Mijn bedrijf",
    icon: Building2,
    url: "/bedrijfsprofiel",
  },
  {
    id: "instellingen",
    title: "Instellingen",
    icon: Settings,
    sub: [
      { title: "Lidmaatschap", url: "/lidmaatschap", icon: CreditCard },
      { title: "Privacy & Gegevens", url: "/privacy-dashboard", icon: Shield },
    ],
  },
];

export const ACCOUNT_NAV = [
  { title: "Lidmaatschap", url: "/lidmaatschap", icon: CreditCard },
  { title: "Privacy & Gegevens", url: "/privacy-dashboard", icon: Shield },
];

/** Legacy — backward compat for any remaining references */
export const KERN_NAV = MAIN_NAV;
export const GROEI_NAV: NavSection[] = [];
export const EXTRA_NAV: NavSection[] = [];
export const APP_NAV: NavSection[] = MAIN_NAV;
