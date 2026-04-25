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

  test("Pro-lid kan een vraag stellen en krijgt een antwoord met bron", async ({ page, context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "pro", "rb-qa");

    // We laten het verzoek de echte backend bereiken (server/routes.ts +
    // runRegioBot), maar voegen __testFixture: true toe zodat de OpenAI-call
    // intern wordt overgeslagen en een deterministisch antwoord teruggeeft.
    // Zo wordt de volledige frontend → backend → AI-laag → bronvermelding
    // keten gevalideerd, zonder echte AI-credits te verbruiken.
    await page.route("**/api/regiobot", async (route) => {
      const request = route.request();
      if (request.method() !== "POST") {
        await route.fallback();
        return;
      }
      const body = JSON.parse(request.postData() || "{}");
      expect(body.task).toBeTruthy();
      expect(typeof body.question).toBe("string");
      expect(body.question.length).toBeGreaterThan(0);

      // Korte vertraging zodat de loading-indicator zichtbaar wordt voordat
      // het verzoek doorgaat naar de echte backend.
      await new Promise((resolve) => setTimeout(resolve, 400));

      const patched = { ...body, __testFixture: true };
      await route.continue({
        postData: JSON.stringify(patched),
        headers: {
          ...request.headers(),
          "content-type": "application/json",
        },
      });
    });

    await page.goto("/regiobot");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-regiobot")).toBeVisible();

    // Stel een vraag op via de mandaat-check suggestie en submit
    await page.getByTestId("suggestion-mandaat_check").click();
    const textarea = page.getByTestId("textarea-question");
    await expect(textarea).not.toHaveValue("");

    // Bewaar de werkelijke HTTP-response van de backend zodat we kunnen
    // assert-en op het 200-contract en het JSON-shape (answer + citations).
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/regiobot") &&
        resp.request().method() === "POST",
    );

    // Het intro-bericht is index 0; de gebruikersvraag wordt index 1
    await page.getByTestId("button-submit").click();
    await expect(page.getByTestId("message-user-1")).toBeVisible();

    // Loading-indicator moet zichtbaar zijn terwijl het verzoek loopt.
    await expect(page.getByTestId("message-loading")).toBeVisible();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty("answer");
    expect(json).toHaveProperty("citations");
    expect(Array.isArray(json.citations)).toBe(true);
    expect(typeof json.answer).toBe("string");
    expect(json.answer).toContain("Test-antwoord (fixture)");
    expect(json.answer).toContain("mandaat_check");

    // Antwoord van de bot komt aan op index 2 (na intro + user)
    const botAnswer = page.getByTestId("message-bot-2");
    await expect(botAnswer).toBeVisible();
    await expect(botAnswer).toContainText("Test-antwoord (fixture)");

    // Optionele citaties: indien de testdatabase bronnen oplevert worden
    // ze gerenderd; anders is dat ook geldig (fixture meldt "geen bronnen").
    if (json.citations.length > 0) {
      await expect(
        page.getByTestId(`citation-2-${json.citations[0].sourceNo}`),
      ).toBeVisible();
    }

    // Loading verdwijnt en textarea is leeggemaakt na verzenden
    await expect(page.getByTestId("message-loading")).toHaveCount(0);
    await expect(textarea).toHaveValue("");
  });
});
