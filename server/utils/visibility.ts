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

/**
 * Check if a viewer can see a specific field based on visibility settings.
 * 
 * Business Logic:
 * - PRO-exclusive: Only PRO members can ADJUST visibility settings (via requirePro middleware)
 * - Visibility rules apply equally to ALL viewers (Basic + PRO)
 * - Basic members get all fields private by DEFAULT
 * - When a PRO owner sets "members", ALL logged-in users can see (not just PRO)
 * 
 * No plan-check needed: The PRO feature is configuration rights, not read access.
 */
export function canViewField(
  viewer: { id: string; region?: string | null } | null | undefined,
  owner: { id: string; region?: string | null },
  fieldVisibility: VisibilityLevel
): boolean {
  // Owner can always see their own fields
  if (viewer && viewer.id === owner.id) return true;

  switch (fieldVisibility) {
    case "public":
      // Anyone (logged in or not) can see
      return true;
    case "members":
      // Any logged-in member (Basic or PRO) can see
      return !!viewer;
    case "region_only":
      // Only logged-in members from the same region can see
      return !!viewer && !!viewer.region && viewer.region === owner.region;
    case "private":
      // Only the owner can see (already checked above)
      return false;
    default:
      // Fallback to private for safety
      return false;
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
