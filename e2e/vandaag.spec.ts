import { test, expect } from "@playwright/test";
import { registerAndAuth, waitForReactQuery } from "./helpers";

test.describe("Vandaag-pagina", () => {
  test("redirect-veilig: ongeauthenticeerde gebruiker ziet geen dashboard", async ({ page }) => {
    await page.goto("/vandaag");
    await waitForReactQuery(page);
    // Pagina rendert niets (return null) of redirect — in beide gevallen mag het dashboard niet zichtbaar zijn
    await expect(page.getByTestId("page-vandaag")).toHaveCount(0);
  });

  test("ingelogde basisgebruiker ziet hero, KPI-tegels en kernsecties", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "basic", "vandaag");

    await page.goto("/vandaag");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-vandaag")).toBeVisible();
    await expect(page.getByTestId("text-greeting")).toBeVisible();
    await expect(page.getByTestId("badge-plan")).toContainText(/Basic|Basis/i);

    // Hero CTA's
    await expect(page.getByTestId("button-profiel-bekijken")).toBeVisible();

    // 4 KPI-tegels
    await expect(page.getByTestId("kpi-updates")).toBeVisible();
    await expect(page.getByTestId("kpi-acties")).toBeVisible();
    await expect(page.getByTestId("kpi-kansen")).toBeVisible();
    await expect(page.getByTestId("kpi-dossiers")).toBeVisible();

    // Kernsecties
    await expect(page.getByTestId("section-aandacht")).toBeVisible();
    await expect(page.getByTestId("section-acties")).toBeVisible();
    await expect(page.getByTestId("section-vragen")).toBeVisible();
    await expect(page.getByTestId("section-marktplaats")).toBeVisible();
    await expect(page.getByTestId("section-dossiers")).toBeVisible();

    // Bedrijfsstrip + nieuwslink onderaan
    await expect(page.getByTestId("strip-jouw-bedrijf")).toBeVisible();
    await expect(page.getByTestId("link-volledig-nieuws")).toBeVisible();

    // Upgrade-promo voor niet-Pro gebruikers
    await expect(page.getByTestId("card-upgrade-promo")).toBeVisible();
    await expect(page.getByTestId("button-upgrade-pro")).toHaveAttribute(
      "href",
      "/lidmaatschap?plan=pro",
    );
  });

  test("legacy /vandaag/* paden redirecten naar nieuwe bestemmingen", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "basic", "vandaag-redirect");

    await page.goto("/vandaag/nieuws");
    await waitForReactQuery(page);
    await expect(page).toHaveURL(/\/nieuws$/);

    await page.goto("/vandaag/acties");
    await waitForReactQuery(page);
    await expect(page).toHaveURL(/\/vandaag$/);

    await page.goto("/vandaag/samen");
    await waitForReactQuery(page);
    await expect(page).toHaveURL(/\/vandaag$/);

    await page.goto("/vandaag/updates");
    await waitForReactQuery(page);
    await expect(page).toHaveURL(/\/regels\/updates$/);
  });

  test("Pro-lid ziet geen upgrade-promo en pro-badge", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "pro", "vandaag-pro");

    await page.goto("/vandaag");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-vandaag")).toBeVisible();
    await expect(page.getByTestId("badge-plan")).toContainText(/Pro/i);
    await expect(page.getByTestId("card-upgrade-promo")).toHaveCount(0);
    await expect(page.getByTestId("button-upgrade-header")).toHaveCount(0);
    // Profiel-CTA in hero blijft beschikbaar voor iedereen
    await expect(page.getByTestId("button-profiel-bekijken")).toBeVisible();
  });
});
