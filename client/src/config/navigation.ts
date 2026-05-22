import {
  CalendarDays,
  TrendingUp,
  Scale,
  BarChart3,
  User,
  ShieldCheck,
  Newspaper,
  Zap,
  Landmark,
  Euro,
  MapPin,
  Handshake,
  Bell,
  HelpCircle,
  FileText,
  Library,
  Eye,
  Building2,
  Globe,
  BarChart2,
  Users,
  Settings,
  Compass,
  BarChart,
  Shield,
  Upload,
} from "lucide-react";

export type NavSubItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  proOnly?: boolean;
  proLocked?: boolean;
  adminOnly?: boolean;
  comingSoon?: boolean;
};

export type NavSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  url?: string;
  sub?: NavSubItem[];
  adminOnly?: boolean;
  pijler?: number;
};

/** Definitieve hoofdnavigatie — 5 secties + Beheer (admin) */
export const MAIN_NAV: NavSection[] = [
  // 1 ── Vandaag (geen submenu — alles op één overzichtspagina)
  {
    id: "vandaag",
    title: "Vandaag",
    icon: CalendarDays,
    url: "/vandaag",
  },

  // 2 ── Kansen
  {
    id: "kansen",
    title: "Kansen",
    icon: TrendingUp,
    sub: [
      { title: "Opdrachten", url: "/kansen/opdrachten", icon: Landmark },
      { title: "Subsidies", url: "/kansen/subsidies", icon: Euro },
      { title: "In de buurt", url: "/kansen/in-de-buurt", icon: MapPin },
      { title: "Marktanalyse", url: "/kansen/marktanalyse", icon: BarChart },
      { title: "Marktplaats (vraag & rommelmarkt)", url: "/lokaal-marktplaats", icon: Handshake },
      { title: "Lokale acties", url: "/lokale-acties", icon: CalendarDays },
      { title: "Samenwerkingen", url: "/network", icon: Users },
    ],
  },

  // 3 ── Grip op Regels (Pijler 1)
  {
    id: "regels",
    title: "Grip op Regels",
    icon: Scale,
    url: "/regels",
    pijler: 1,
    sub: [
      { title: "Overzicht", url: "/regels", icon: Scale },
      { title: "Sectorregels", url: "/regels/sectorregels", icon: Shield },
      { title: "Wat komt eraan?", url: "/regels/ontwikkelingen", icon: Bell },
      { title: "Updates", url: "/regels/updates", icon: Newspaper },
      { title: "Hulp bij regels", url: "/regels/help", icon: HelpCircle },
      { title: "Document analyseren", url: "/regels/documenten", icon: Upload },
      { title: "Woo-bibliotheek", url: "/regels/woo", icon: Library, proOnly: true },
    ],
  },

  // 4 ── Groei
  {
    id: "groei",
    title: "Groei",
    icon: BarChart3,
    sub: [
      { title: "Zichtbaarheid", url: "/groei/zichtbaarheid", icon: Eye, proOnly: true },
      { title: "Profiel", url: "/groei/profiel", icon: Building2 },
      { title: "Website-check", url: "/groei/website-check", icon: Globe, proOnly: true },
      { title: "RegioScan", url: "/pro/regioscan", icon: Compass, proLocked: true },
    ],
  },

  // 5 ── Mijn account
  {
    id: "account",
    title: "Mijn account",
    icon: User,
    sub: [
      { title: "Voortgang", url: "/account/voortgang", icon: BarChart3, comingSoon: true },
      { title: "Instellingen", url: "/account/instellingen", icon: Settings },
      { title: "Affiliate", url: "/account/affiliate", icon: Euro },
    ],
  },

  // 6 ── Beheer (alleen admin)
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
      { title: "Cursussen", url: "/admin/cursussen", icon: Zap },
      { title: "Regio & WOO", url: "/admin/woo", icon: MapPin },
      { title: "Intel signalen", url: "/admin/intel", icon: Bell },
      { title: "Systeem", url: "/admin/inzicht", icon: Settings },
    ],
  },
];

export const ACCOUNT_NAV = [
  { title: "Instellingen", url: "/account/instellingen", icon: Settings },
  { title: "Affiliate", url: "/account/affiliate", icon: Euro },
];

/** Legacy — backward compat */
export const KERN_NAV = MAIN_NAV;
export const GROEI_NAV: NavSection[] = [];
export const EXTRA_NAV: NavSection[] = [];
export const APP_NAV: NavSection[] = MAIN_NAV;
