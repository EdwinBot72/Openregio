import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser, type AuthUser } from "@/lib/authUtils";

export function useAuth() {
  const query = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: query.data?.user ?? null,
    profile: query.data?.profile ?? null,
    isAuthenticated: !!query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
