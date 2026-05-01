import { test, expect } from "@playwright/test";
import { registerAndAuth, waitForReactQuery } from "./helpers";

test.describe("/lokale-acties", () => {
  test("Pro-lid kan een lokale actie aanmaken en ziet hem terug", async ({
    page,
    context,
    baseURL,
  }) => {
    await registerAndAuth(context, baseURL!, "pro", "e2e-acties-pro");

    await page.goto("/lokale-acties");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-lokale-acties")).toBeVisible();
    await expect(page.getByTestId("text-pagina-titel")).toHaveText("Lokale acties");

    // Pro-lid ziet de "Nieuwe actie" knop
    const nieuwBtn = page.getByTestId("button-nieuwe-actie");
    await expect(nieuwBtn).toBeVisible();
    await nieuwBtn.click();

    const titel = `E2E Buurtevent ${Date.now()}`;
    await page.getByTestId("input-form-titel").fill(titel);
    await page.getByTestId("textarea-form-beschrijving")
      .fill("Een gezellige buurtbijeenkomst voor alle ondernemers in onze regio met hapjes en drankjes.");
    await page.getByTestId("input-form-locatie").fill("Café Centraal, Hoofdstraat 12");
    await page.getByTestId("input-form-regio").fill("E2E-Stad");

    await page.getByTestId("button-opslaan").click();

    // Wacht tot dialog sluit
    await expect(page.getByTestId("button-opslaan")).toBeHidden({ timeout: 10_000 });

    // De nieuwe actie staat in de lijst
    await expect(page.getByTestId("lijst-acties")).toContainText(titel);
  });

  test("Basic-lid ziet upgrade-teaser en geen aanmaak-knop", async ({
    page,
    context,
    baseURL,
  }) => {
    await registerAndAuth(context, baseURL!, "basic", "e2e-acties-basic");

    await page.goto("/lokale-acties");
    await waitForReactQuery(page);

    await expect(page.getByTestId("page-lokale-acties")).toBeVisible();
    await expect(page.getByTestId("button-nieuwe-actie")).toHaveCount(0);
    await expect(page.getByTestId("button-upgrade-pro")).toBeVisible();
    await expect(page.getByTestId("card-pro-teaser")).toBeVisible();
  });

  test("Vandaag toont de Lokale-acties sectie", async ({
    page,
    context,
    baseURL,
  }) => {
    await registerAndAuth(context, baseURL!, "basic", "e2e-acties-vandaag");

    await page.goto("/vandaag");
    await waitForReactQuery(page);

    await expect(page.getByTestId("section-lokale-acties")).toBeVisible();
  });

  test("Basic-lid kan geen actie aanmaken via API (403)", async ({
    request,
    baseURL,
  }) => {
    const ctx = await import("@playwright/test").then((m) => m.request.newContext({ baseURL }));
    const stamp = Date.now().toString(36);
    const email = `e2e-basic-api-${stamp}@e2e.openregio.test`;
    await ctx.post("/api/auth/register", {
      data: { email, password: "Test1234!", plan: "basic", firstName: "B", lastName: "T" },
    });
    await ctx.post("/api/auth/login", { data: { email, password: "Test1234!" } });

    const create = await ctx.post("/api/lokale-acties", {
      data: {
        titel: "Probeer als Basic",
        beschrijving: "Een lange genoeg beschrijving voor validatie test.",
        locatie: "Ergens",
        regio: "Test",
        doelgroep: "iedereen",
      },
    });
    expect([401, 403]).toContain(create.status());
    await ctx.dispose();
  });

  test("Server weigert onveilige externeLink schemes (javascript:/data:)", async ({
    context,
    baseURL,
  }) => {
    await registerAndAuth(context, baseURL!, "pro", "e2e-unsafe-url");

    const base = {
      titel: "Veilige titel test",
      beschrijving: "Beschrijving die voldoet aan de minimale lengte voor validatie.",
      locatie: "Plein",
      regio: "TestStad",
      doelgroep: "iedereen",
    };

    for (const link of ["javascript:alert(1)", "data:text/html,<script>", "ftp://example.com/x"]) {
      const res = await context.request.post("/api/lokale-acties", {
        data: { ...base, externeLink: link },
      });
      expect(res.status(), `verwachte 400 voor ${link}`).toBe(400);
    }

    // Geldige https-link wordt geaccepteerd
    const ok = await context.request.post("/api/lokale-acties", {
      data: { ...base, externeLink: "https://example.com/event" },
    });
    expect(ok.ok()).toBeTruthy();
  });

  test("Server weigert ongeldig contactEmail", async ({ context, baseURL }) => {
    await registerAndAuth(context, baseURL!, "pro", "e2e-bad-email");
    const res = await context.request.post("/api/lokale-acties", {
      data: {
        titel: "Titel met genoeg tekens",
        beschrijving: "Beschrijving lang genoeg om validatie te halen.",
        locatie: "Plein", regio: "TestStad", doelgroep: "iedereen",
        contactEmail: "geen-geldig-emailadres",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("Pro maakt actie aan en ziet deze terug op /vandaag", async ({
    page,
    context,
    baseURL,
  }) => {
    await registerAndAuth(context, baseURL!, "pro", "e2e-vandaag-pro");

    // Maak actie via API
    const titel = `Vandaag-actie ${Date.now()}`;
    const create = await context.request.post("/api/lokale-acties", {
      data: {
        titel,
        beschrijving: "Een actie voor de Vandaag-integratie test, lang genoeg.",
        locatie: "Centraal",
        regio: "E2E-Vandaag-Stad",
        doelgroep: "iedereen",
        datum: new Date(Date.now() + 86400000).toISOString(), // morgen, zorgt voor positionering
      },
    });
    expect(create.ok()).toBeTruthy();

    await page.goto("/vandaag");
    await waitForReactQuery(page);
    await expect(page.getByTestId("section-lokale-acties")).toBeVisible();
    // Sectie toont fallback (landelijk) wanneer gebruiker geen regio heeft;
    // de zojuist aangemaakte actie hoort dan in top-3 te staan.
    await expect(page.getByTestId("section-lokale-acties")).toContainText(titel);
  });

  test("Sorteren op regio en op datum werkt", async ({
    page,
    context,
    baseURL,
  }) => {
    await registerAndAuth(context, baseURL!, "pro", "e2e-sort-pro");

    // Maak 2 acties: 'A' regio Amersfoort (datum +14d), 'Z' regio Zwolle (datum +1d)
    const stamp = Date.now();
    const titelA = `A-Workshop ${stamp}`;
    const titelZ = `Z-Avondmarkt ${stamp}`;
    await context.request.post("/api/lokale-acties", {
      data: {
        titel: titelA, beschrijving: "Workshop in Amersfoort, lang genoeg.",
        locatie: "Bibliotheek", regio: "Amersfoort", doelgroep: "ondernemers",
        datum: new Date(Date.now() + 14*86400000).toISOString(),
      },
    });
    await context.request.post("/api/lokale-acties", {
      data: {
        titel: titelZ, beschrijving: "Avondmarkt in Zwolle, lang genoeg.",
        locatie: "Centrum", regio: "Zwolle", doelgroep: "iedereen",
        datum: new Date(Date.now() + 1*86400000).toISOString(),
      },
    });

    await page.goto("/lokale-acties");
    await waitForReactQuery(page);

    // Default sort = datum: Z (eerder) staat boven A
    const lijst = page.getByTestId("lijst-acties");
    const titlesByDatum = await lijst.locator("[data-testid^='text-titel-']").allTextContents();
    const idxZ_d = titlesByDatum.findIndex((t) => t.includes(titelZ));
    const idxA_d = titlesByDatum.findIndex((t) => t.includes(titelA));
    expect(idxZ_d).toBeGreaterThanOrEqual(0);
    expect(idxA_d).toBeGreaterThanOrEqual(0);
    expect(idxZ_d).toBeLessThan(idxA_d);

    // Schakel naar sorteren op regio: A (Amersfoort) komt nu boven Z (Zwolle)
    await page.getByTestId("select-sortering").click();
    await page.getByRole("option", { name: "Sorteer op regio" }).click();
    await waitForReactQuery(page);

    const titlesByRegio = await lijst.locator("[data-testid^='text-titel-']").allTextContents();
    const idxA_r = titlesByRegio.findIndex((t) => t.includes(titelA));
    const idxZ_r = titlesByRegio.findIndex((t) => t.includes(titelZ));
    expect(idxA_r).toBeLessThan(idxZ_r);
  });

  test("Klik op kaart opent detail-modal", async ({
    page,
    context,
    baseURL,
  }) => {
    await registerAndAuth(context, baseURL!, "pro", "e2e-detail-pro");

    const titel = `Detail-test ${Date.now()}`;
    await context.request.post("/api/lokale-acties", {
      data: {
        titel, beschrijving: "Beschrijving voor detail-modal test, lang genoeg.",
        locatie: "Plein 1", regio: "TestStad", doelgroep: "iedereen",
      },
    });

    await page.goto("/lokale-acties");
    await waitForReactQuery(page);

    await page.getByTestId("lijst-acties").locator("[data-testid^='card-actie-']").first().click();
    await expect(page.getByTestId("dialog-detail-actie")).toBeVisible();
    await expect(page.getByTestId("text-detail-titel")).toContainText(titel);
    await expect(page.getByTestId("text-detail-beschrijving")).toContainText("detail-modal");
  });

  test("Niet-eigenaar kan andermans actie niet bewerken/verwijderen", async ({
    baseURL,
  }) => {
    const { request: pwRequest } = await import("@playwright/test");

    // Pro-eigenaar 1
    const ctx1 = await pwRequest.newContext({ baseURL });
    const email1 = `e2e-pro-owner-${Date.now().toString(36)}@e2e.openregio.test`;
    await ctx1.post("/api/auth/register", {
      data: { email: email1, password: "Test1234!", plan: "pro", firstName: "P1", lastName: "T" },
    });
    await ctx1.post("/api/auth/login", { data: { email: email1, password: "Test1234!" } });

    const createRes = await ctx1.post("/api/lokale-acties", {
      data: {
        titel: "Eigenaar's actie",
        beschrijving: "Beschrijving van actie van Pro 1, lang genoeg.",
        locatie: "Hoofdstraat 1",
        regio: "TestStad",
        doelgroep: "iedereen",
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    const id = created.id;

    // Pro-vreemdeling
    const ctx2 = await pwRequest.newContext({ baseURL });
    const email2 = `e2e-pro-other-${Date.now().toString(36)}@e2e.openregio.test`;
    await ctx2.post("/api/auth/register", {
      data: { email: email2, password: "Test1234!", plan: "pro", firstName: "P2", lastName: "T" },
    });
    await ctx2.post("/api/auth/login", { data: { email: email2, password: "Test1234!" } });

    const patchRes = await ctx2.patch(`/api/lokale-acties/${id}`, {
      data: { titel: "Hijack poging" },
    });
    expect([403, 404]).toContain(patchRes.status());

    const delRes = await ctx2.delete(`/api/lokale-acties/${id}`);
    expect([403, 404]).toContain(delRes.status());

    await ctx1.dispose();
    await ctx2.dispose();
  });
});
