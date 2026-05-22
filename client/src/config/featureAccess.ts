export type Plan = "basis" | "pro" | "admin";

export type AccessLevel =
  | "volledig"
  | "teaser"
  | "alleen_bekijken"
  | "reageren"
  | "plaatsen"
  | "geen";

export type FeatureKey =
  // Grip op Regels
  | "sectorregels"
  | "wat_komt_eraan"
  | "documenten_opvragen"
  // Lokale Zichtbaarheid
  | "website_scan"
  | "vindbaarheid"
  | "bedrijfsprofiel"
  // Lokale Kracht
  | "netwerk"
  | "lokale_acties"
  | "marktplaats"
  | "blog";

type FeatureRow = Record<Plan, AccessLevel>;

export const FEATURE_ACCESS: Record<FeatureKey, FeatureRow> = {
  // Pijler 1 — Grip op Regels
  sectorregels:       { basis: "volledig",        pro: "volledig", admin: "volledig" },
  wat_komt_eraan:     { basis: "teaser",           pro: "volledig", admin: "volledig" },
  documenten_opvragen:{ basis: "volledig",         pro: "volledig", admin: "volledig" },
  // Pijler 2 — Lokale Zichtbaarheid
  website_scan:       { basis: "volledig",         pro: "volledig", admin: "volledig" },
  vindbaarheid:       { basis: "geen",             pro: "volledig", admin: "volledig" },
  bedrijfsprofiel:    { basis: "volledig",         pro: "volledig", admin: "volledig" },
  // Pijler 3 — Lokale Kracht
  netwerk:            { basis: "alleen_bekijken",  pro: "volledig", admin: "volledig" },
  lokale_acties:      { basis: "plaatsen",         pro: "plaatsen", admin: "plaatsen" },
  marktplaats:        { basis: "reageren",         pro: "plaatsen", admin: "plaatsen" },
  blog:               { basis: "volledig",         pro: "volledig", admin: "volledig" },
};

export const BADGE_LABELS: Record<AccessLevel, string> = {
  volledig:        "Beschikbaar",
  teaser:          "Pro nodig",
  alleen_bekijken: "Alleen bekijken",
  reageren:        "Reageren toegestaan",
  plaatsen:        "Plaatsen toegestaan",
  geen:            "Pro nodig",
};

export const BADGE_COLORS: Record<AccessLevel, string> = {
  volledig:        "#16a34a",
  teaser:          "#9333ea",
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
