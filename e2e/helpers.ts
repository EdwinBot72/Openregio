import { APIRequestContext, BrowserContext, Page, expect, request } from "@playwright/test";

export type Plan = "basic" | "pro";

export interface RegisteredUser {
  email: string;
  password: string;
  plan: Plan;
}

function uniqueEmail(prefix: string): string {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return `${prefix}-${stamp}@e2e.openregio.test`;
}

/**
 * Register a new user via the JSON API and import the resulting cookies into
 * the given browser context so that subsequent page navigations are signed in.
 */
export async function registerAndAuth(
  context: BrowserContext,
  baseURL: string,
  plan: Plan = "basic",
  prefix = "e2e",
): Promise<RegisteredUser> {
  const email = uniqueEmail(prefix);
  const password = "Test1234!";

  const api = await request.newContext({ baseURL });
  const res = await api.post("/api/auth/register", {
    data: { email, password, plan, firstName: "E2E", lastName: "Tester" },
  });
  expect(res.ok(), `register failed: ${res.status()} ${await res.text()}`).toBeTruthy();

  // Re-login om mustCompleteOnboarding automatisch te wissen (zie jwtAuth.login).
  const loginRes = await api.post("/api/auth/login", { data: { email, password } });
  expect(loginRes.ok(), `login failed: ${loginRes.status()} ${await loginRes.text()}`).toBeTruthy();

  const cookies = (await api.storageState()).cookies;
  await context.addCookies(cookies);
  await api.dispose();

  return { email, password, plan };
}

/**
 * Wait until the network is idle-ish so React Query has resolved its initial
 * fetches before we start asserting against the DOM.
 */
export async function waitForReactQuery(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
}
