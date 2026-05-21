import type { User, UserProfile } from "@shared/schema";

export interface AuthUser {
  user: {
    id: string;
    email: string;
    plan: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    businessName: string | null;
    bio: string | null;
    category: string | null;
    sector: string | null;
    region: string | null;
    mustCompleteOnboarding: boolean;
    isAdmin: boolean;
    emailNewsDigest?: boolean;
  };
  profile?: UserProfile;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return await response.json();
}

export function getLoginUrl(): string {
  return "/login";
}

export function getLogoutUrl(): string {
  return "/api/auth/logout";
}
