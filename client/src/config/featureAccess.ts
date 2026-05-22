export type Plan = "basis" | "pro" | "admin";

export type AccessLevel =
  | "volledig"
  | "preview"
  | "alleen_bekijken"
  | "reageren"
  | "plaatsen"
  | "geen";

export type FeatureKey =
  // Pijler 1 — Grip op Regels
  | "sectorregels"
  | "wat_komt_eraan"
  | "documenten_opvragen"
  | "avg_controleslagen"
  | "woo_verzoeken"
  | "brief_analyse"
  | "regel_agent"
  | "conceptbrieven"
  // Pijler 2 — Lokale Zichtbaarheid
  | "website_scan"
  | "vindbaarheid"
  | "bedrijfsprofiel"
  | "seo_tools"
  // Pijler 3 — Lokale Kracht
  | "netwerk"
  | "lokale_acties"
  | "marktplaats"
  | "blog_lezen"
  | "blog_publiceren"
  // Extra
  | "ai_ondersteuning"
  | "regio_updates"
  | "dossiers_opslaan"
  // Beheer (admin only)
  | "gebruikersbeheer"
  | "contentbeheer"
  | "gemeentebeheer"
  | "affiliatebeheer";

type FeatureRow = Record<Plan, AccessLevel>;

export const FEATURE_ACCESS: Record<FeatureKey, FeatureRow> = {
  // Pijler 1
  sectorregels:         { basis: "volledig",       pro: "volledig",  admin: "volledig" },
  wat_komt_eraan:       { basis: "preview",         pro: "volledig",  admin: "volledig" },
  documenten_opvragen:  { basis: "volledig",        pro: "volledig",  admin: "volledig" },
  avg_controleslagen:   { basis: "geen",            pro: "volledig",  admin: "volledig" },
  woo_verzoeken:        { basis: "geen",            pro: "volledig",  admin: "volledig" },
  brief_analyse:        { basis: "geen",            pro: "volledig",  admin: "volledig" },
  regel_agent:          { basis: "geen",            pro: "volledig",  admin: "volledig" },
  conceptbrieven:       { basis: "geen",            pro: "volledig",  admin: "volledig" },
  // Pijler 2
  website_scan:         { basis: "volledig",        pro: "volledig",  admin: "volledig" },
  vindbaarheid:         { basis: "geen",            pro: "volledig",  admin: "volledig" },
  bedrijfsprofiel:      { basis: "volledig",        pro: "volledig",  admin: "volledig" },
  seo_tools:            { basis: "geen",            pro: "volledig",  admin: "volledig" },
  // Pijler 3
  netwerk:              { basis: "alleen_bekijken", pro: "volledig",  admin: "volledig" },
  lokale_acties:        { basis: "plaatsen",        pro: "plaatsen",  admin: "plaatsen" },
  marktplaats:          { basis: "reageren",        pro: "plaatsen",  admin: "plaatsen" },
  blog_lezen:           { basis: "volledig",        pro: "volledig",  admin: "volledig" },
  blog_publiceren:      { basis: "geen",            pro: "plaatsen",  admin: "plaatsen" },
  // Extra
  ai_ondersteuning:     { basis: "geen",            pro: "volledig",  admin: "volledig" },
  regio_updates:        { basis: "volledig",        pro: "volledig",  admin: "volledig" },
  dossiers_opslaan:     { basis: "geen",            pro: "volledig",  admin: "volledig" },
  // Beheer
  gebruikersbeheer:     { basis: "geen",            pro: "geen",      admin: "volledig" },
  contentbeheer:        { basis: "geen",            pro: "geen",      admin: "volledig" },
  gemeentebeheer:       { basis: "geen",            pro: "geen",      admin: "volledig" },
  affiliatebeheer:      { basis: "geen",            pro: "geen",      admin: "volledig" },
};

export const BADGE_LABELS: Record<AccessLevel, string> = {
  volledig:        "Beschikbaar",
  preview:         "Pro nodig",
  alleen_bekijken: "Alleen bekijken",
  reageren:        "Reageren",
  plaatsen:        "Plaatsen",
  geen:            "Pro nodig",
};

export const BADGE_COLORS: Record<AccessLevel, string> = {
  volledig:        "#16a34a",
  preview:         "#9333ea",
  alleen_bekijken: "#2563eb",
  reageren:        "#d97706",
  plaatsen:        "#16a34a",
  geen:            "#9333ea",
};

export function getAccessLevel(plan: Plan | undefined, feature: FeatureKey): AccessLevel {
  const p: Plan = plan ?? "basis";
  return FEATURE_ACCESS[feature]?.[p] ?? "geen";
}

export function hasFullAccess(plan: Plan | undefined, feature: FeatureKey): boolean {
  const level = getAccessLevel(plan, feature);
  return level === "volledig" || level === "plaatsen";
}
