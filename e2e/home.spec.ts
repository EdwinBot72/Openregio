import { test, expect } from "@playwright/test";
import { waitForReactQuery } from "./helpers";

test.describe("Homepage gezond ondernemen", () => {
  test("hero toont titel en beide CTA-knoppen", async ({ page }) => {
    await page.goto("/");
    await waitForReactQuery(page);

    const hero = page.getByTestId("text-hero-title");
    await expect(hero).toBeVisible();
    await expect(hero).toContainText(/gezond/i);
    await expect(hero).toContainText(/ondernemen/i);

    await expect(page.getByTestId("button-hero-cta")).toBeVisible();
    await expect(page.getByTestId("button-hero-cta")).toContainText(/gezond ondernemen/i);
    await expect(page.getByTestId("button-hero-regiobot")).toBeVisible();
  });

  test("vier pijlerkaarten zijn zichtbaar", async ({ page }) => {
    await page.goto("/");
    await waitForReactQuery(page);

    const pijlers = [
      "gezond-card-financieel-gezond",
      "gezond-card-bestuurlijk-gezond",
      "gezond-card-mentaal-gezond",
      "gezond-card-strategisch-gezond",
    ];
    for (const id of pijlers) {
      await expect(page.getByTestId(id)).toBeVisible();
    }

    // Het uitlegblok onder de pijlers blijft ook gedekt.
    await expect(
      page.getByText("Wat bedoelen wij met gezond ondernemen?", { exact: false }),
    ).toBeVisible();

    // Beide vereiste wrapper-testids moeten naast elkaar bestaan.
    await expect(page.getByTestId("section-pijlers")).toBeVisible();
    await expect(page.getByTestId("section-gezond")).toBeVisible();
  });

  test("Lokale verbinding sectie toont 6 tegels en CTA naar lidmaatschap", async ({ page }) => {
    await page.goto("/");
    await waitForReactQuery(page);

    // Sectie zelf
    const sectie = page.getByTestId("section-lokale-verbinding");
    await expect(sectie).toBeVisible();
    await expect(sectie).toContainText("Voor ondernemers die meer echte klanten en relaties willen");

    // Alle zes inspiratie-tegels moeten zichtbaar zijn.
    const tegelIds = [
      "lokale-tegel-ouderenavond-bij-de-pizzeria",
      "lokale-tegel-studentenactie",
      "lokale-tegel-workshop-organiseren",
      "lokale-tegel-samenwerken-met-de-sportclub",
      "lokale-tegel-nagelstyliste-bij-verzorgingshuis",
      "lokale-tegel-buurtactie-opzetten",
    ];
    for (const id of tegelIds) {
      await expect(page.getByTestId(id)).toBeVisible();
    }

    // CTA "Start lokale actie" — uitgelogd verwijst naar /lidmaatschap?plan=pro.
    const cta = page.getByTestId("button-start-lokale-actie");
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toBe("/lidmaatschap?plan=pro");
  });

  test("klikken op hero-CTA scrolt naar #gezond-pijlers", async ({ page }) => {
    // Forceer een kleinere viewport zodat de pijler-sectie zeker
    // niet al direct zichtbaar is na laden.
    await page.setViewportSize({ width: 1024, height: 600 });
    await page.goto("/");
    await waitForReactQuery(page);
    await page.evaluate(() => window.scrollTo(0, 0));

    const target = page.locator("#gezond-pijlers");
    await expect(target).toHaveCount(1);

    // Voorwaarde: doel ligt nog buiten de viewport en pagina is bovenaan.
    await expect(target).not.toBeInViewport();
    const startScroll = await page.evaluate(() => window.scrollY);
    expect(startScroll).toBeLessThan(10);

    await page.getByTestId("button-hero-cta").click();

    // Effect: doel komt in beeld én pagina is daadwerkelijk gescrold.
    await expect(target).toBeInViewport({ timeout: 5_000 });
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 5_000 })
      .toBeGreaterThan(startScroll + 50);
  });
});
