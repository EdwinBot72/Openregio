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
  Network,
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
  LayoutGrid,
  CheckCircle,
  MessageSquare,
  MessageCircle,
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

/** Dagelijkse kernacties — altijd zichtbaar, geen submenu */
export const KERN_NAV: NavSection[] = [
  {
    id: "vandaag",
    title: "Vandaag",
    icon: Sparkles,
    url: "/aan-de-slag",
  },
  {
    id: "basischeck",
    title: "Lokale Basischeck",
    icon: CheckCircle,
    url: "/basischeck",
  },
  {
    id: "brief",
    title: "Brief begrijpen",
    icon: ScanText,
    url: "/tools/brief-analyse",
  },
  {
    id: "regiobot",
    title: "RegioBot AI",
    icon: Bot,
    url: "/regiobot",
    proOnly: true,
  },
  {
    id: "bedrijf",
    title: "Mijn bedrijf",
    icon: Building2,
    url: "/bedrijfsprofiel",
  },
];

/** Groeien, kansen en netwerk — uitklapbare secties */
export const GROEI_NAV: NavSection[] = [
  {
    id: "kansen",
    title: "Kansen in de regio",
    icon: Signal,
    sub: [
      { title: "Kansen overzicht", url: "/kansen-in-de-buurt", icon: LayoutGrid },
      { title: "Regio-updates", url: "/intel", icon: Signal },
      { title: "Aanbestedingen", url: "/kansen/aanbestedingen", icon: Landmark },
      { title: "Gemeente-updates", url: "/kansen/gemeente-updates", icon: Megaphone },
      { title: "Subsidies & financiering", url: "/kansen/financiering", icon: Euro },
      { title: "Regio Deals", url: "/kansen/regio-deals", icon: Handshake },
    ],
  },
  {
    id: "netwerk",
    title: "Netwerk & marktplaats",
    icon: Users,
    sub: [
      { title: "Leden & netwerk", url: "/network", icon: Network },
      { title: "Ondernemers bij mij", url: "/regiocrew", icon: Users },
      { title: "Vraag & aanbod", url: "/lokaal-marktplaats", icon: ArrowLeftRight },
      { title: "Koop Lokaal", url: "/koop-lokaal", icon: Store },
      { title: "Website check", url: "/tools/website-scan", icon: Monitor },
    ],
  },
  {
    id: "documenten",
    title: "Documenten",
    icon: FileText,
    proOnly: true,
    sub: [
      { title: "Regelgeving-assistent", url: "/woo-bot", icon: FileText },
      { title: "Verzoek indienen", url: "/woo-wizard", icon: Gavel },
      { title: "Mijn documenten", url: "/woo-bibliotheek", icon: FolderOpen },
    ],
  },
];

/** Minder gebruikte functies — ingeklapt tenzij actief */
export const EXTRA_NAV: NavSection[] = [
  { id: "community", title: "Community", icon: MessageSquare, url: "/community" },
  { id: "chat", title: "Chat", icon: MessageCircle, url: "/chat" },
  { id: "cooperatie", title: "Coöperatie", icon: HeartHandshake, url: "/cooperative" },
  { id: "affiliate", title: "Affiliate & doorverwijzen", icon: Share2, url: "/affiliate" },
];

export const ACCOUNT_NAV = [
  { title: "Lidmaatschap", url: "/lidmaatschap", icon: CreditCard },
  { title: "Privacy & Gegevens", url: "/privacy-dashboard", icon: Shield },
];

/** Legacy — backward compat for any remaining references */
export const APP_NAV: NavSection[] = [...KERN_NAV, ...GROEI_NAV];
