export type Plan = "basic" | "pro" | "coaching" | "admin";

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
  sectorregels:         { basic: "volledig",       pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  wat_komt_eraan:       { basic: "preview",         pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  documenten_opvragen:  { basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  avg_controleslagen:   { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  woo_verzoeken:        { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  brief_analyse:        { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  regel_agent:          { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  conceptbrieven:       { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  // Pijler 2
  website_scan:         { basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  vindbaarheid:         { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  bedrijfsprofiel:      { basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  seo_tools:            { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  // Pijler 3
  netwerk:              { basic: "alleen_bekijken", pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  lokale_acties:        { basic: "plaatsen",        pro: "plaatsen",  coaching: "plaatsen",  admin: "plaatsen" },
  marktplaats:          { basic: "reageren",        pro: "plaatsen",  coaching: "plaatsen",  admin: "plaatsen" },
  blog_lezen:           { basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  blog_publiceren:      { basic: "geen",            pro: "plaatsen",  coaching: "plaatsen",  admin: "plaatsen" },
  // Extra
  ai_ondersteuning:     { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  regio_updates:        { basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  dossiers_opslaan:     { basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  // Beheer
  gebruikersbeheer:     { basic: "geen",            pro: "geen",      coaching: "geen",      admin: "volledig" },
  contentbeheer:        { basic: "geen",            pro: "geen",      coaching: "geen",      admin: "volledig" },
  gemeentebeheer:       { basic: "geen",            pro: "geen",      coaching: "geen",      admin: "volledig" },
  affiliatebeheer:      { basic: "geen",            pro: "geen",      coaching: "geen",      admin: "volledig" },
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
  const p: Plan = plan ?? "basic";
  return FEATURE_ACCESS[feature]?.[p] ?? "geen";
}

export function hasFullAccess(plan: Plan | undefined, feature: FeatureKey): boolean {
  const level = getAccessLevel(plan, feature);
  return level === "volledig" || level === "plaatsen";
}
