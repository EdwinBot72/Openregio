import { test, expect } from "@playwright/test";

test.describe("Lidmaatschap-pagina", () => {
  test("toont basisplan, schakelt naar pro en linkt naar Mollie", async ({ page }) => {
    await page.goto("/lidmaatschap");

    await expect(page.getByTestId("page-lidmaatschap")).toBeVisible();
    await expect(page.getByTestId("text-page-title")).toHaveText(/Word lid/i);

    // Default: basis-plan zichtbaar
    await expect(page.getByTestId("card-upgrade-basic")).toBeVisible();
    await expect(page.getByTestId("text-plan-name")).toHaveText("Basis-lid");

    // Toggle naar pro
    await page.getByTestId("button-select-pro").click();
    await expect(page.getByTestId("card-upgrade-pro")).toBeVisible();
    await expect(page.getByTestId("text-plan-name")).toHaveText("Pro-bijdrager");
    await expect(page.getByTestId("text-plan-price")).toHaveText("€49");

    // Mollie payment-link aanwezig en wijst naar mollie
    const proLink = page.getByTestId("button-payment-link");
    await expect(proLink).toBeVisible();
    const proHref = await proLink.getAttribute("href");
    expect(proHref).toBeTruthy();
    expect(proHref!).toMatch(/mollie\.com/);

    // Terug naar basis
    await page.getByTestId("button-select-basic").click();
    await expect(page.getByTestId("text-plan-name")).toHaveText("Basis-lid");
    const basicHref = await page.getByTestId("button-payment-link").getAttribute("href");
    expect(basicHref).toMatch(/mollie\.com/);
  });

  test("respecteert ?plan=pro query parameter", async ({ page }) => {
    await page.goto("/lidmaatschap?plan=pro");
    await expect(page.getByTestId("text-plan-name")).toHaveText("Pro-bijdrager");
    await expect(page.getByTestId("card-upgrade-pro")).toBeVisible();
  });
});
