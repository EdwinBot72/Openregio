import { User, DEFAULT_VISIBILITY_SETTINGS, VISIBILITY_LEVELS, VisibilityLevel } from "@shared/schema";

export function parseVisibilitySettings(settingsJson: string | null | undefined): Record<string, VisibilityLevel> {
  if (!settingsJson) {
    return { ...DEFAULT_VISIBILITY_SETTINGS };
  }
  
  try {
    const parsed = JSON.parse(settingsJson);
    const result: Record<string, VisibilityLevel> = { ...DEFAULT_VISIBILITY_SETTINGS };
    
    for (const key of Object.keys(DEFAULT_VISIBILITY_SETTINGS)) {
      if (parsed[key] && VISIBILITY_LEVELS.includes(parsed[key])) {
        result[key] = parsed[key] as VisibilityLevel;
      }
    }
    
    return result;
  } catch {
    return { ...DEFAULT_VISIBILITY_SETTINGS };
  }
}

export function canViewField(
  viewer: { id: string; region?: string | null } | null | undefined,
  owner: { id: string; region?: string | null },
  fieldVisibility: VisibilityLevel
): boolean {
  // Owner can always see their own fields
  if (viewer && viewer.id === owner.id) return true;

  switch (fieldVisibility) {
    case "public":
      return true;
    case "members":
      return !!viewer;
    case "region_only":
      return !!viewer && viewer.region === owner.region;
    case "private":
      return false;
    default:
      return true; // fallback to public
  }
}

export function getVisibleFields(
  viewer: { id: string; region?: string | null } | null | undefined,
  owner: { id: string; region?: string | null; visibilitySettings?: string | null }
): Record<string, boolean> {
  const settings = parseVisibilitySettings(owner.visibilitySettings);
  const result: Record<string, boolean> = {};
  
  for (const [fieldName, visibility] of Object.entries(settings)) {
    result[fieldName] = canViewField(viewer, owner, visibility);
  }
  
  return result;
}

export const VISIBILITY_OPTIONS = VISIBILITY_LEVELS;

export const VISIBILITY_LABELS: Record<VisibilityLevel, string> = {
  public: "Openbaar",
  members: "Alleen leden",
  region_only: "Alleen mijn regio",
  private: "Privé",
};

export const FIELD_LABELS: Record<string, string> = {
  company_name: "Bedrijfsnaam",
  phone: "Telefoon",
  address: "Adres",
  website: "Website",
  description: "Beschrijving",
};
