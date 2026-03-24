import {
  Sparkles,
  Eye,
  Building2,
  Monitor,
  Globe,
  Signal,
  Landmark,
  Megaphone,
  Euro,
  Users,
  ArrowLeftRight,
  Store,
  Handshake,
  HeartHandshake,
  FileText,
  ScanText,
  Gavel,
  FolderOpen,
  Bot,
  CreditCard,
  Share2,
  Shield,
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

export const APP_NAV: NavSection[] = [
  {
    id: "vandaag",
    title: "Vandaag",
    icon: Sparkles,
    url: "/aan-de-slag",
  },
  {
    id: "zichtbaarheid",
    title: "Klanten & zichtbaarheid",
    icon: Eye,
    sub: [
      { title: "Mijn bedrijf", url: "/bedrijfsprofiel", icon: Building2 },
      { title: "Website check", url: "/tools/website-scan", icon: Monitor },
      { title: "Hulp met mijn website", url: "/zichtbaarheid/website-onderhoud", icon: Globe },
    ],
  },
  {
    id: "kansen",
    title: "Kansen in de buurt",
    icon: Signal,
    sub: [
      { title: "Wat speelt er?", url: "/intel", icon: Signal },
      { title: "Aanbestedingen", url: "/kansen/aanbestedingen", icon: Landmark },
      { title: "Gemeente-updates", url: "/kansen/gemeente-updates", icon: Megaphone },
      { title: "Subsidies & financiering", url: "/kansen/financiering", icon: Euro },
    ],
  },
  {
    id: "samenwerken",
    title: "Samenwerken",
    icon: Users,
    sub: [
      { title: "Ondernemers in de buurt", url: "/regiocrew", icon: Users },
      { title: "Vraag & aanbod", url: "/lokaal-marktplaats", icon: ArrowLeftRight },
      { title: "Koop Lokaal", url: "/koop-lokaal", icon: Store },
      { title: "Regio Deals", url: "/kansen/regio-deals", icon: Handshake },
    ],
  },
  {
    id: "cooperatie",
    title: "Coöperatie",
    icon: HeartHandshake,
    url: "/cooperative",
  },
  {
    id: "documenten",
    title: "Brieven & documenten",
    icon: FileText,
    proOnly: true,
    sub: [
      { title: "Brief bekijken", url: "/tools/brief-analyse", icon: ScanText },
      { title: "Verzoek maken", url: "/woo-wizard", icon: Gavel },
      { title: "Mijn documenten", url: "/woo-bibliotheek", icon: FolderOpen },
      { title: "Regelgeving-assistent", url: "/woo-bot", icon: FileText },
      { title: "RegioBot AI", url: "/regiobot", icon: Bot },
    ],
  },
];

export const ACCOUNT_NAV = [
  { title: "Mijn gegevens", url: "/bedrijfsprofiel", icon: Building2 },
  { title: "Lidmaatschap", url: "/lidmaatschap", icon: CreditCard },
  { title: "Privacy & Gegevens", url: "/privacy-dashboard", icon: Shield },
  { title: "Affiliate", url: "/affiliate", icon: Share2 },
];
