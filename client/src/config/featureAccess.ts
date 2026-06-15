export type Plan = "pending" | "basic" | "pro" | "coaching" | "admin";

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
  sectorregels:         { pending: "geen", basic: "volledig",       pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  wat_komt_eraan:        { pending: "geen", basic: "preview",         pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  documenten_opvragen:  { pending: "geen", basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  avg_controleslagen:   { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  woo_verzoeken:        { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  brief_analyse:        { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  regel_agent:          { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  conceptbrieven:       { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  // Pijler 2
  website_scan:         { pending: "geen", basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  vindbaarheid:         { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  bedrijfsprofiel:      { pending: "geen", basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  seo_tools:            { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  // Pijler 3
  netwerk:              { pending: "geen", basic: "alleen_bekijken", pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  lokale_acties:        { pending: "geen", basic: "plaatsen",        pro: "plaatsen",  coaching: "plaatsen",  admin: "plaatsen" },
  marktplaats:          { pending: "geen", basic: "reageren",        pro: "plaatsen",  coaching: "plaatsen",  admin: "plaatsen" },
  blog_lezen:           { pending: "geen", basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  blog_publiceren:      { pending: "geen", basic: "geen",            pro: "plaatsen",  coaching: "plaatsen",  admin: "plaatsen" },
  // Extra
  ai_ondersteuning:     { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  regio_updates:        { pending: "geen", basic: "volledig",        pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  dossiers_opslaan:     { pending: "geen", basic: "geen",            pro: "volledig",  coaching: "volledig",  admin: "volledig" },
  // Beheer
  gebruikersbeheer:     { pending: "geen", basic: "geen",            pro: "geen",      coaching: "geen",      admin: "volledig" },
  contentbeheer:        { pending: "geen", basic: "geen",            pro: "geen",      coaching: "geen",      admin: "volledig" },
  gemeentebeheer:       { pending: "geen", basic: "geen",            pro: "geen",      coaching: "geen",      admin: "volledig" },
  affiliatebeheer:      { pending: "geen", basic: "geen",            pro: "geen",      coaching: "geen",      admin: "volledig" },
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

export function getAccessLevel(plan: Plan | undefined | null, feature: FeatureKey): AccessLevel {
  if (!plan || plan === "pending") return "geen";
  const p: Plan = plan;
  return FEATURE_ACCESS[feature]?.[p] ?? "geen";
}

export function hasFullAccess(plan: Plan | undefined, feature: FeatureKey): boolean {
  const level = getAccessLevel(plan, feature);
  return level === "volledig" || level === "plaatsen";
}
