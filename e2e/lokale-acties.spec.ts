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
