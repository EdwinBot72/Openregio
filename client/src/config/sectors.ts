import {
  Store,
  Utensils,
  Wrench,
  Tractor,
  TrendingUp,
  Eye,
  FileText,
  Users,
} from "lucide-react";

// ─── Sector types ────────────────────────────────────────────────────────────

export type SectorKey = "detailhandel" | "horeca" | "techniek" | "agrarisch";

// ─── Vier vaste categorieën — dezelfde structuur in elke sector ───────────────

export type CategorieKey =
  | "kansen"
  | "zichtbaarheid"
  | "regels"
  | "samenwerking";

export const CATEGORIE_META: Record<
  CategorieKey,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  kansen: {
    label: "Kansen in de markt",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  zichtbaarheid: {
    label: "Zichtbaarheid & groei",
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  regels: {
    label: "Regels & ontwikkelingen",
    icon: FileText,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  samenwerking: {
    label: "Samenwerking & netwerk",
    icon: Users,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
};

// ─── Sector-specifieke inhoud per categorie ───────────────────────────────────

export interface SectorCategorieContent {
  sub: string;
  href: string;
}

export interface SectorConfig {
  label: string;
  icon: React.ElementType;
  kleur: string;
  bg: string;
  categorieen: Record<CategorieKey, SectorCategorieContent>;
}

export const SECTOR_CONFIG: Record<SectorKey, SectorConfig> = {
  detailhandel: {
    label: "Detailhandel",
    icon: Store,
    kleur: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    categorieen: {
      kansen: {
        sub: "Lokale acties, winkelgebied-kansen, regionale vraag",
        href: "/intel",
      },
      zichtbaarheid: {
        sub: "Online vindbaarheid, profielverbetering, websitekansen",
        href: "/bedrijfsprofiel",
      },
      regels: {
        sub: "Lokale regels, centrumbeleid, ontwikkelingen in de regio",
        href: "/intel",
      },
      samenwerking: {
        sub: "Samenwerkingen, lokale initiatieven, ondernemerscontact",
        href: "/network",
      },
    },
  },

  horeca: {
    label: "Horeca",
    icon: Utensils,
    kleur: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    categorieen: {
      kansen: {
        sub: "Arrangementen, events, seizoenskansen, lokale vraag",
        href: "/intel",
      },
      zichtbaarheid: {
        sub: "Lokaal zoeken, reviews, website en profieloptimalisatie",
        href: "/bedrijfsprofiel",
      },
      regels: {
        sub: "Actuele regels, vergunningen, gemeentelijke ontwikkelingen",
        href: "/intel",
      },
      samenwerking: {
        sub: "Regionale samenwerkingen, events, gezamenlijke promotie",
        href: "/network",
      },
    },
  },

  techniek: {
    label: "Techniek",
    icon: Wrench,
    kleur: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10",
    categorieen: {
      kansen: {
        sub: "Opdrachten, regionale vraag, groeikansen",
        href: "/intel",
      },
      zichtbaarheid: {
        sub: "Profieloptimalisatie, vertrouwen, online uitstraling",
        href: "/bedrijfsprofiel",
      },
      regels: {
        sub: "Regelgeving, aanbestedingen, ontwikkelingen die impact hebben",
        href: "/intel",
      },
      samenwerking: {
        sub: "Samenwerking met andere bedrijven, lokaal netwerk, doorverwijzingen",
        href: "/network",
      },
    },
  },

  agrarisch: {
    label: "Agrarisch",
    icon: Tractor,
    kleur: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    categorieen: {
      kansen: {
        sub: "Afzet, regionale vraag, nieuwe mogelijkheden",
        href: "/intel",
      },
      zichtbaarheid: {
        sub: "Zichtbaarheid, positionering, bedrijfsprofiel",
        href: "/bedrijfsprofiel",
      },
      regels: {
        sub: "Beleid, ruimte, sector-signalen, regelgeving",
        href: "/intel",
      },
      samenwerking: {
        sub: "Samenwerking, ketencontact, regionale verbinding",
        href: "/network",
      },
    },
  },
};

// ─── Sector tiles (voor onboarding + filters) ─────────────────────────────────

export const SECTOR_TILES: Array<{
  key: SectorKey;
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = [
  {
    key: "detailhandel",
    label: "Detailhandel",
    sub: "Winkels en retail",
    icon: Store,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-900/60",
  },
  {
    key: "horeca",
    label: "Horeca",
    sub: "Restaurants en cafés",
    icon: Utensils,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-900/60",
  },
  {
    key: "techniek",
    label: "Techniek",
    sub: "Installatie en ambacht",
    icon: Wrench,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/40",
    border: "border-slate-200 dark:border-slate-700/60",
  },
  {
    key: "agrarisch",
    label: "Agrarisch",
    sub: "Landbouw en natuur",
    icon: Tractor,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-900/60",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const CATEGORIE_KEYS: CategorieKey[] = [
  "kansen",
  "zichtbaarheid",
  "regels",
  "samenwerking",
];

export function getSectorConfig(sector: string | null | undefined): SectorConfig | null {
  if (!sector) return null;
  return SECTOR_CONFIG[sector as SectorKey] ?? null;
}
