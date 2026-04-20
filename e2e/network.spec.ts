import { test, expect } from "@playwright/test";
import { registerAndAuth, waitForReactQuery } from "./helpers";

test.describe("Network-pagina", () => {
  test("rendert tab-toggle, leden- en posts-tab voor ingelogde gebruiker", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "basic", "network-view");
    await page.goto("/network");
    await expect(page.getByTestId("page-network")).toBeVisible();
    await expect(page.getByTestId("text-page-title")).toHaveText(/Netwerk/i);

    const tabLeden = page.getByTestId("tab-leden");
    const tabPosts = page.getByTestId("tab-posts");
    await expect(tabLeden).toBeVisible();
    await expect(tabPosts).toBeVisible();

    await tabLeden.click();
    await waitForReactQuery(page);
    // Filters voor leden
    await expect(page.getByTestId("input-search")).toBeVisible();
    await expect(page.getByTestId("select-region")).toBeVisible();

    await tabPosts.click();
    await waitForReactQuery(page);
    await expect(page.getByTestId("select-type")).toBeVisible();
    // Gast ziet de "nieuwe post"-knop ook (aanmaak vereist login server-side)
    await expect(page.getByTestId("button-new-post")).toBeVisible();
  });

  test("ingelogde gebruiker kan post plaatsen en weer verwijderen", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "basic", "network");

    await page.goto("/network");
    await page.getByTestId("tab-posts").click();
    await waitForReactQuery(page);

    const stamp = Date.now().toString(36);
    const title = `E2E netwerk-post ${stamp}`;
    const body = `Automatisch gegenereerd via Playwright (${stamp}). Deze post wordt direct verwijderd.`;

    await page.getByTestId("button-new-post").click();
    await expect(page.getByTestId("input-post-title")).toBeVisible();

    await page.getByTestId("input-post-title").fill(title);
    await page.getByTestId("input-post-body").fill(body);
    await page.getByTestId("button-submit-post").click();

    // Wacht tot het dialog sluit en de nieuwe post zichtbaar is
    const newPostCard = page.locator(`[data-testid^="card-post-"]`, { hasText: title });
    await expect(newPostCard).toBeVisible({ timeout: 15_000 });

    // Verwijder-knop alleen voor eigenaar/admin
    const deleteBtn = newPostCard.locator('[data-testid^="button-delete-"]');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Post moet weg zijn
    await expect(page.locator(`[data-testid^="card-post-"]`, { hasText: title })).toHaveCount(0, {
      timeout: 15_000,
    });
  });
});
