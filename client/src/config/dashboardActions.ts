import {
  FileSearch,
  Gavel,
  Activity,
  Globe,
  Search,
  Users,
  FolderOpen,
  Eye,
  Bot,
  Landmark,
  MessageSquare,
} from "lucide-react";

export type DashboardAction = {
  id: string;
  label: string;
  description: (isPro: boolean) => string;
  icon: React.ElementType;
  href: (isPro: boolean) => string;
  cta: (isPro: boolean) => string;
  color: (isPro: boolean) => string;
  bg: (isPro: boolean) => string;
  proOnly: (isPro: boolean) => boolean;
  badge: (isPro: boolean) => string | undefined;
};

export const DASHBOARD_ACTIONS: DashboardAction[] = [
  // --- ACTIES ---
  {
    id: "brief",
    label: "Brief begrijpen",
    description: () =>
      "Plak een overheidsbrief en ontvang direct uitleg, termijnen en aanbevolen acties. Geen verrassingen meer — alleen inzicht.",
    icon: FileSearch,
    href: () => "/tools/brief-analyse",
    cta: (isPro) => (isPro ? "Brief analyseren" : "Analyse starten"),
    color: () => "text-blue-600 dark:text-blue-400",
    bg: () => "bg-blue-50 dark:bg-blue-950/40",
    proOnly: () => false,
    badge: (isPro) => (isPro ? undefined : "Beperkt"),
  },
  {
    id: "woo",
    label: "Verzoek indienen",
    description: (isPro) =>
      isPro
        ? "Vraag officiële overheidsinformatie op die anderen niet gebruiken. Bouw dossiers op en creëer een strategisch voordeel."
        : "Haal officiële overheidsinformatie op die publiek beschikbaar is maar moeilijk toegankelijk. Beschikbaar voor Pro-bijdragers.",
    icon: Gavel,
    href: (isPro) => (isPro ? "/woo-wizard" : "/lidmaatschap?plan=pro"),
    cta: (isPro) => (isPro ? "Verzoek starten" : "Ontgrendelen"),
    color: (isPro) =>
      isPro ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground",
    bg: (isPro) => (isPro ? "bg-orange-50 dark:bg-orange-950/40" : "bg-muted/40"),
    proOnly: (isPro) => !isPro,
    badge: (isPro) => (!isPro ? "Pro" : undefined),
  },
  {
    id: "regio",
    label: "Regio volgen",
    description: () =>
      "Beleidsupdates, aanbestedingen en subsidies in jouw gemeente — dagelijks ververst. Wie het eerst weet, heeft een voorsprong.",
    icon: Activity,
    href: () => "/kansen/gemeente-updates",
    cta: () => "Regio volgen",
    color: () => "text-emerald-600 dark:text-emerald-400",
    bg: () => "bg-emerald-50 dark:bg-emerald-950/40",
    proOnly: () => false,
    badge: () => undefined,
  },
  {
    id: "regiobot",
    label: "RegioBot",
    description: (isPro) =>
      isPro
        ? "Analyseer besluiten, voer mandaat-checks uit en genereer vervolgvragen op basis van jouw eigen dossiers."
        : "AI-assistent voor regelgevingsanalyse en juridische vragen. Beschikbaar voor Pro-bijdragers.",
    icon: Bot,
    href: (isPro) => (isPro ? "/regiobot" : "/lidmaatschap?plan=pro"),
    cta: (isPro) => (isPro ? "RegioBot openen" : "Ontgrendelen"),
    color: (isPro) =>
      isPro ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground",
    bg: (isPro) => (isPro ? "bg-indigo-50 dark:bg-indigo-950/40" : "bg-muted/40"),
    proOnly: (isPro) => !isPro,
    badge: (isPro) => (!isPro ? "Pro" : undefined),
  },
  // --- BEHEER ---
  {
    id: "documenten",
    label: "Mijn documenten",
    description: () =>
      "Beheer jouw persoonlijke documentenbibliotheek. Upload brieven, besluiten en mandaatregisters — RegioBot gebruikt ze als bron.",
    icon: FolderOpen,
    href: () => "/woo-bibliotheek",
    cta: () => "Naar documenten",
    color: () => "text-violet-600 dark:text-violet-400",
    bg: () => "bg-violet-50 dark:bg-violet-950/40",
    proOnly: () => false,
    badge: () => undefined,
  },
  {
    id: "profiel",
    label: "Bedrijfsprofiel",
    description: () =>
      "Beheer jouw zichtbaarheid op het platform en stel in wie welke informatie over jouw bedrijf kan zien.",
    icon: Eye,
    href: () => "/bedrijfsprofiel",
    cta: () => "Profiel beheren",
    color: () => "text-slate-600 dark:text-slate-400",
    bg: () => "bg-slate-50 dark:bg-slate-950/40",
    proOnly: () => false,
    badge: () => undefined,
  },
  {
    id: "website-scan",
    label: "Website Scan",
    description: (isPro) =>
      isPro
        ? "Analyseer jouw website op vindbaarheid, lokale aanwezigheid en technische kwaliteit. Krijg concrete verbeterpunten."
        : "Uitgebreide scan van jouw website: vindbaarheid, lokale aanwezigheid, technische kwaliteit. Beschikbaar voor Pro-bijdragers.",
    icon: Globe,
    href: (isPro) => (isPro ? "/tools/website-scan" : "/lidmaatschap?plan=pro"),
    cta: (isPro) => (isPro ? "Scan starten" : "Ontgrendelen"),
    color: (isPro) =>
      isPro ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground",
    bg: (isPro) => (isPro ? "bg-blue-50 dark:bg-blue-950/40" : "bg-muted/40"),
    proOnly: (isPro) => !isPro,
    badge: (isPro) => (!isPro ? "Pro" : undefined),
  },
  {
    id: "regelgeving",
    label: "Regelgeving verkenner",
    description: () =>
      "Zoek door officiële verordeningen, beleidsregels en besluiten van gemeenten door heel Nederland. Gebruik als basis voor een verzoek.",
    icon: Search,
    href: () => "/regelgeving-verkenner",
    cta: () => "Verkenner openen",
    color: () => "text-orange-600 dark:text-orange-400",
    bg: () => "bg-orange-50 dark:bg-orange-950/40",
    proOnly: () => false,
    badge: () => undefined,
  },
  // --- NETWERK ---
  {
    id: "samenwerken",
    label: "RegioCrew",
    description: (isPro) =>
      isPro
        ? "Start projecten, plaats aanvragen bij RegioCrew en lanceer initiatieven in jouw regio."
        : "Bekijk samenwerkingen en join bestaande RegioCrew projecten.",
    icon: Users,
    href: () => "/regiocrew",
    cta: () => "Naar RegioCrew",
    color: () => "text-violet-600 dark:text-violet-400",
    bg: () => "bg-violet-50 dark:bg-violet-950/40",
    proOnly: () => false,
    badge: () => undefined,
  },
  {
    id: "deals",
    label: "Regio Deals",
    description: () => "Lokale deals en samenwerkingen tussen ondernemers in jouw regio.",
    icon: Landmark,
    href: () => "/kansen/regio-deals",
    cta: () => "Deals bekijken",
    color: () => "text-emerald-600 dark:text-emerald-400",
    bg: () => "bg-emerald-50 dark:bg-emerald-950/40",
    proOnly: () => false,
    badge: () => undefined,
  },
  {
    id: "community",
    label: "Community",
    description: () =>
      "Verbind met andere ondernemers uit jouw regio. Wissel inzichten uit, stel vragen en leer van ervaringen van vakgenoten.",
    icon: MessageSquare,
    href: () => "/community",
    cta: () => "Naar Community",
    color: () => "text-teal-600 dark:text-teal-400",
    bg: () => "bg-teal-50 dark:bg-teal-950/40",
    proOnly: () => false,
    badge: () => undefined,
  },
];
