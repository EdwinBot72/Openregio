import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Helper to check if object is a search params object
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
    // QueryKey contract:
    // - Primitives (string/number/boolean) → path segments
    // - { search: Record<string, primitive> } → query params
    // - Other objects → ignored (react-query options/signals)
    //
    // Examples:
    //   ['/api/entrepreneurs'] → '/api/entrepreneurs'
    //   ['/api/entrepreneurs', 'ent-123'] → '/api/entrepreneurs/ent-123'
    //   ['/api/billing/subscription', { search: { userId: 'user-jan' } }] → '/api/billing/subscription?userId=user-jan'
    //   ['/api/recipes', 123, { search: { format: 'json' } }] → '/api/recipes/123?format=json'
    
    const pathSegments: string[] = [];
    const searchParams = new URLSearchParams();
    
    for (const part of queryKey) {
      // Primitives become path segments
      if (typeof part === "string" || typeof part === "number" || typeof part === "boolean") {
        pathSegments.push(String(part));
      } 
      // { search: ... } objects become query params
      else if (isSearchParamsObject(part)) {
        for (const [key, value] of Object.entries(part.search)) {
          if (value !== undefined && value !== null) {
            // Only primitive values allowed in search params
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
              searchParams.append(key, String(value));
            }
          }
        }
      }
      // Ignore all other objects (react-query options/signals)
    }
    
    // Build fresh URL for each request
    let url = pathSegments.join("/");
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

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
