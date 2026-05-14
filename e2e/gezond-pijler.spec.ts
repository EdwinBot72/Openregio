import { test, expect } from "@playwright/test";
import { waitForReactQuery } from "./helpers";

type PijlerSpec = {
  slug: string;
  title: string;
  intro: string;
  /** Eerste module-link op de pijlerpagina — pad waar de klik naar moet leiden. */
  firstModuleHref: string;
};

const PIJLERS: PijlerSpec[] = [
  {
    slug: "financieel",
    title: "Financieel gezond ondernemen",
    intro: "Vind opdrachten, subsidies en kansen in je regio voordat ze elders weglopen.",
    firstModuleHref: "/kansen/opdrachten",
  },
  {
    slug: "bestuurlijk",
    title: "Bestuurlijk gezond ondernemen",
    intro: "Begrijp gemeentebrieven en regels — en zet WOO-verzoeken in zonder juridische kennis.",
    firstModuleHref: "/regiobot",
  },
  {
    slug: "mentaal",
    title: "Mentaal gezond ondernemen",
    intro: "Sta er niet alleen voor: deel signalen en pak zaken samen met andere ondernemers aan.",
    firstModuleHref: "/vandaag/samen",
  },
  {
    slug: "strategisch",
    title: "Strategisch gezond ondernemen",
    intro: "Weet wat er in je regio speelt — en welke ondernemers het raakt — voordat het je raakt.",
    firstModuleHref: "/vandaag/updates",
  },
];

test.describe("Gezond-pijlerpagina's", () => {
  for (const pijler of PIJLERS) {
    test(`/gezond/${pijler.slug} toont titel, intro en drie acties`, async ({ page }) => {
      await page.goto(`/gezond/${pijler.slug}`);
      await waitForReactQuery(page);

      await expect(page.getByTestId(`page-pijler-${pijler.slug}`)).toBeVisible();

      const title = page.getByTestId("text-pijler-title");
      await expect(title).toBeVisible();
      await expect(title).toContainText(pijler.title);

      const intro = page.getByTestId("text-pijler-intro");
      await expect(intro).toBeVisible();
      await expect(intro).toContainText(pijler.intro);

      // Drie concrete acties moeten alle drie zichtbaar zijn.
      await expect(page.getByTestId("section-pijler-acties")).toBeVisible();
      for (let i = 0; i < 3; i++) {
        await expect(page.getByTestId(`item-actie-${i}`)).toBeVisible();
      }
      // Er mogen niet meer dan drie acties zijn.
      await expect(page.getByTestId("item-actie-3")).toHaveCount(0);
    });

    test(`/gezond/${pijler.slug}: eerste module-link navigeert naar de juiste tool`, async ({
      page,
    }) => {
      await page.goto(`/gezond/${pijler.slug}`);
      await waitForReactQuery(page);
      await expect(page.getByTestId(`page-pijler-${pijler.slug}`)).toBeVisible();

      const moduleTestId = `link-module-${pijler.firstModuleHref.replace(/\//g, "-")}`;
      const moduleLink = page.getByTestId(moduleTestId);
      await expect(moduleLink).toBeVisible();
      await expect(moduleLink).toHaveAttribute("href", pijler.firstModuleHref);

      await moduleLink.click();
      // De meeste module-routes zijn auth-protected, dus na de klik komen we
      // ofwel op de module zelf ofwel op /login terecht — in beide gevallen
      // is de pijlerpagina verlaten en is de routing dus geslaagd.
      await expect(page).not.toHaveURL(new RegExp(`/gezond/${pijler.slug}$`));
      const url = new URL(page.url());
      expect(
        url.pathname === pijler.firstModuleHref || url.pathname === "/login",
        `verwachtte ${pijler.firstModuleHref} of /login, kreeg ${url.pathname}`,
      ).toBeTruthy();
    });
  }

  for (const pijler of PIJLERS) {
    test(`homepage: klik op pijlerkaart-${pijler.slug} belandt op /gezond/${pijler.slug}`, async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.getByTestId("section-gezond-pijlers")).toBeVisible();

      const card = page.getByTestId(`link-gezond-card-${pijler.slug}`);
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute("href", `/gezond/${pijler.slug}`);

      await card.click();
      await expect(page).toHaveURL(new RegExp(`/gezond/${pijler.slug}$`));
      await expect(page.getByTestId(`page-pijler-${pijler.slug}`)).toBeVisible();
      await expect(page.getByTestId("text-pijler-title")).toContainText(pijler.title);
    });
  }

  test("klik op een 'andere pijler'-link navigeert naar de juiste pijlerpagina", async ({ page }) => {
    // Start op de eerste pijler.
    await page.goto("/gezond/financieel");
    await waitForReactQuery(page);
    await expect(page.getByTestId("page-pijler-financieel")).toBeVisible();

    // Klik op de 'bestuurlijk'-link in de "andere pijlers"-sectie.
    const anderePijlerLink = page.getByTestId("link-andere-pijler-bestuurlijk");
    await expect(anderePijlerLink).toBeVisible();
    await anderePijlerLink.click();

    // We belanden op de bestuurlijk-pagina.
    await expect(page).toHaveURL(/\/gezond\/bestuurlijk$/);
    await expect(page.getByTestId("page-pijler-bestuurlijk")).toBeVisible();
    await expect(page.getByTestId("text-pijler-title")).toContainText(
      "Bestuurlijk gezond ondernemen",
    );

    // Klik vanaf hier door naar de derde pijler.
    const naarMentaal = page.getByTestId("link-andere-pijler-mentaal");
    await expect(naarMentaal).toBeVisible();
    await naarMentaal.click();

    await expect(page).toHaveURL(/\/gezond\/mentaal$/);
    await expect(page.getByTestId("page-pijler-mentaal")).toBeVisible();
    await expect(page.getByTestId("text-pijler-title")).toContainText(
      "Mentaal gezond ondernemen",
    );
  });

  test("eigen pijler verschijnt niet als 'andere pijler'-link", async ({ page }) => {
    await page.goto("/gezond/strategisch");
    await waitForReactQuery(page);

    // De pagina-eigen slug mag NIET in de andere-pijlers-sectie staan.
    await expect(page.getByTestId("link-andere-pijler-strategisch")).toHaveCount(0);

    // De andere drie wel.
    await expect(page.getByTestId("link-andere-pijler-financieel")).toBeVisible();
    await expect(page.getByTestId("link-andere-pijler-bestuurlijk")).toBeVisible();
    await expect(page.getByTestId("link-andere-pijler-mentaal")).toBeVisible();
  });
});
