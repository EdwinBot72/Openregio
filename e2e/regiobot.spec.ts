import { test, expect } from "@playwright/test";
import { registerAndAuth, waitForReactQuery } from "./helpers";

test.describe("RegioBot-pagina", () => {
  test("toont Pro-gate met upgrade-link voor niet-Pro gebruikers", async ({ page, context, baseURL }) => {
    // Registreer een basisgebruiker, geen Pro
    await registerAndAuth(context, baseURL!, "basic", "rb-basic");

    await page.goto("/regiobot");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-regiobot-gate")).toBeVisible();
    const upgradeLink = page.getByTestId("button-upgrade-pro");
    await expect(upgradeLink).toBeVisible();
    await expect(upgradeLink).toHaveAttribute("href", "/lidmaatschap?plan=pro");

    // Volg de link en verwacht de Pro-tab actief op de lidmaatschap-pagina
    await upgradeLink.click();
    await expect(page).toHaveURL(/\/lidmaatschap\?plan=pro/);
    await expect(page.getByTestId("text-plan-name")).toHaveText("Pro-bijdrager");
  });

  test("Pro-lid ziet de chat-interface met intro-bericht", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "pro", "rb-pro");

    await page.goto("/regiobot");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-regiobot")).toBeVisible();
    await expect(page.getByTestId("card-context")).toBeVisible();
    await expect(page.getByTestId("card-suggestions")).toBeVisible();
    await expect(page.getByTestId("card-chat")).toBeVisible();
    await expect(page.getByTestId("textarea-question")).toBeVisible();
    await expect(page.getByTestId("button-submit")).toBeVisible();

    // Intro-bot-bericht aanwezig
    await expect(page.getByTestId("message-bot-0")).toBeVisible();

    // Suggestie klikken vult de textarea
    await page.getByTestId("suggestion-mandaat_check").click();
    await expect(page.getByTestId("textarea-question")).not.toHaveValue("");
  });
});
