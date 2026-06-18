import { QueryClient, QueryFunction } from "@tanstack/react-query";

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function isTokenExpiredResponse(res: Response): boolean {
  // Treat every 401 as a potential expired/missing token and attempt a silent refresh.
  // The refresh endpoint itself will reject if no valid refresh token is present,
  // which covers the case of a genuinely unauthenticated user.
  return res.status === 401;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isFormData = data instanceof FormData;
  const fetchOpts: RequestInit = {
    method,
    headers: data && !isFormData ? { "Content-Type": "application/json" } : {},
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  };

  let res = await fetch(url, fetchOpts);

  if (isTokenExpiredResponse(res)) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await fetch(url, fetchOpts);
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

function isSearchParamsObject(obj: unknown): obj is { search: Record<string, string | number | boolean> } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "search" in obj &&
    typeof (obj as any).search === "object" &&
    (obj as any).search !== null &&
    !Array.isArray((obj as any).search)
  );
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const pathSegments: string[] = [];
    const searchParams = new URLSearchParams();

    for (const part of queryKey) {
      if (typeof part === "string" || typeof part === "number" || typeof part === "boolean") {
        pathSegments.push(String(part));
      } else if (isSearchParamsObject(part)) {
        for (const [key, value] of Object.entries(part.search)) {
          if (value !== undefined && value !== null) {
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
              searchParams.append(key, String(value));
            }
          }
        }
      }
    }

    let url = pathSegments.join("/");
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    let res = await fetch(url, { credentials: "include" });

    if (isTokenExpiredResponse(res)) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        res = await fetch(url, { credentials: "include" });
        if (res.status === 401) {
          if (unauthorizedBehavior === "returnNull") return null;
          await throwIfResNotOk(res);
        }
      } else {
        if (unauthorizedBehavior === "returnNull") return null;
        await throwIfResNotOk(res);
      }
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Extracts a human-readable message from API errors thrown by apiRequest.
 * Errors follow the format "<status>: <body>" where body may be JSON.
 */
export function parseApiError(err: unknown, fallback = "Er ging iets mis. Probeer het opnieuw."): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const match = raw.match(/^(\d{3}):\s*([\s\S]*)/);
  if (!match) return raw || fallback;

  const status = parseInt(match[1], 10);

  if (status === 429) return "Te veel aanvragen. Wacht even en probeer het opnieuw.";
  if (status === 503) {
    let extra = "";
    try { extra = JSON.parse(match[2])?.error ?? ""; } catch { extra = match[2] ?? ""; }
    return `Service tijdelijk niet beschikbaar.${extra ? ` ${extra}` : ""}`;
  }

  try {
    const parsed = JSON.parse(match[2]);
    return parsed?.error ?? parsed?.message ?? fallback;
  } catch {
    return match[2] || fallback;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
