import { test, expect } from "@playwright/test";
import { registerAndAuth, waitForReactQuery } from "./helpers";

test.describe("Vandaag-pagina", () => {
  test("redirect-veilig: ongeauthenticeerde gebruiker ziet geen dashboard", async ({ page }) => {
    await page.goto("/vandaag");
    await waitForReactQuery(page);
    // Pagina rendert niets (return null) of redirect — in beide gevallen mag het dashboard niet zichtbaar zijn
    await expect(page.getByTestId("page-vandaag")).toHaveCount(0);
  });

  test("ingelogde basisgebruiker ziet begroeting, plan-badge en stat-cards", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "basic", "vandaag");

    await page.goto("/vandaag");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-vandaag")).toBeVisible();
    await expect(page.getByTestId("text-greeting")).toBeVisible();
    await expect(page.getByTestId("badge-plan")).toHaveText(/Basic|Basis/i);

    // Stat-cards laden allemaal
    await expect(page.getByTestId("stat-totaal")).toBeVisible();
    await expect(page.getByTestId("stat-basic")).toBeVisible();
    await expect(page.getByTestId("stat-pro")).toBeVisible();

    // Snelle links naar de andere kernpagina's
    await expect(page.getByTestId("quick-netwerk")).toBeVisible();
    await expect(page.getByTestId("quick-regiobot")).toBeVisible();

    // Upgrade-promo voor niet-Pro gebruikers
    await expect(page.getByTestId("card-upgrade-promo")).toBeVisible();
    await expect(page.getByTestId("button-upgrade-pro")).toHaveAttribute(
      "href",
      "/lidmaatschap?plan=pro",
    );
  });

  test("Pro-lid ziet geen upgrade-promo en pro-badge", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "pro", "vandaag-pro");

    await page.goto("/vandaag");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-vandaag")).toBeVisible();
    await expect(page.getByTestId("badge-plan")).toHaveText(/Pro/i);
    await expect(page.getByTestId("card-upgrade-promo")).toHaveCount(0);
    await expect(page.getByTestId("button-upgrade-header")).toHaveCount(0);
  });
});
