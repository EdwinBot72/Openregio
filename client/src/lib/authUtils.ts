import type { User, UserProfile } from "@shared/schema";

export interface AuthUser {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
  profile: UserProfile;
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
  return "/api/auth/login";
}

export function getLogoutUrl(): string {
  return "/api/auth/logout";
}
