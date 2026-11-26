import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const route = `${locale === "en" ? "/en" : ""}/tools/edges`;
  for (const raw of ["", "bogus", "constructor", "-1", "Infinity", "99"]) {
    test(`bending thickness retains ${JSON.stringify(raw)} and recovers (${locale})`, async ({
      page,
    }) => {
      await page.goto(
        `${route}?t=${raw}&material=staal&kind=haaks&hole=6&edge=10&interruption=5&bendLength=100&ba_t=3&ba_r=3&ba_a=60&ba_l1=30&ba_l2=30&keep=sentinel#thickness`,
      );
      const select = page.locator("#kanten-thickness");
      const main = select.locator("xpath=ancestor::section[1]");
      const clearance = page
        .locator("details")
        .filter({ hasText: /Extra controle:|Additional check:/ });
      const free = page
        .locator("details")
        .filter({ hasText: /Aanvullend: uitslag|Additional: flat pattern/ });
      const invalid = async (language: "nl" | "en") => {
        await expect(select).toHaveValue("");
        await expect(select.locator("option:checked")).toHaveText(
          language === "nl" ? "Kies een dikte" : "Choose a thickness",
        );
        await expect(select).toHaveAttribute("aria-invalid", "true");
        await expect(select).toHaveAttribute("aria-describedby", "kanten-thickness-error");
        await expect(page.locator("#kanten-thickness-error")).toHaveText(
          language === "nl" ? "Kies een dikte uit de lijst." : "Choose a thickness from the list.",
        );
        await expect(main.locator("dl")).toHaveCount(0);
        await expect(main.getByRole("button")).toHaveCount(0);
        await expect(page.locator("table.ref-table")).toBeVisible();
        await expect(page.locator("table.ref-table tr.is-active")).toHaveCount(0);
        await expect(page.getByRole("heading", { name: /^(Doorsnede|Section)$/ })).toHaveCount(0);
        await expect.poll(() => new URL(page.url()).searchParams.get("t")).toBe(raw);
        expect(new URL(page.url()).searchParams.get("keep")).toBe("sentinel");
        expect(new URL(page.url()).hash).toBe("#thickness");
      };
      await invalid(locale);
      await page.reload();
      await invalid(locale);
      const language = locale === "nl" ? "en" : "nl";
      await page
        .locator('select[aria-label="Taal rekenhulp"], select[aria-label="Calculator language"]')
        .selectOption(language);
      await invalid(language);
      await clearance.locator(":scope > summary").click();
      await expect(
        clearance.getByText(
          language === "nl"
            ? "Kies een geldige dikte voor de afstandscontrole."
            : "Choose a supported thickness for the clearance check.",
        ),
      ).toBeVisible();
      await expect(clearance.locator("dl")).toHaveCount(0);
      await expect(clearance.getByRole("button")).toHaveCount(0);
      await expect(clearance.getByText(/^5\.00%/)).toBeVisible();
      await clearance
        .getByLabel(language === "nl" ? "Som onderbrekingen (mm)" : "Total interruptions (mm)")
        .fill("6");
      await free.locator(":scope > summary").click();
      await free.locator("#edge-angle").fill("75");
      await expect(free.locator("dl")).toBeVisible();
      await invalid(language);
      await page.reload();
      await invalid(language);
      await clearance.locator(":scope > summary").click();
      await select.selectOption("3");
      await expect(select).not.toHaveAttribute("aria-invalid", "true");
      await expect(main.locator("dl")).toBeVisible();
      await expect(
        main.getByRole("button", { name: /^(Copy result|Kopieer resultaat)$/ }),
      ).toBeVisible();
      await expect(page.locator("table.ref-table tr.is-active")).toHaveText("32,7512,41620,1");
      await expect(clearance.getByText(/Te dichtbij:|Too close:/)).toBeVisible();
      await expect(
        clearance.getByRole("button", { name: /^(Copy result|Kopieer resultaat)$/ }),
      ).toBeVisible();
      await select.selectOption("2");
      await expect(
        clearance.getByText(/Gatrand buiten de minimale|Hole edge outside the minimum/),
      ).toBeVisible();
    });
  }
  test(`bending missing thickness and existing numeric aliases (${locale})`, async ({ page }) => {
    for (const query of ["", "t=2.00", "t=02", "t=3.00"]) {
      await page.goto(`${route}?${query}`);
      await expect(page.locator("#kanten-thickness")).toHaveValue(query === "t=3.00" ? "3" : "2");
      await expect(page.locator("#kanten-thickness-error")).toHaveCount(0);
      await expect(page.locator("table.ref-table tr.is-active")).toHaveCount(1);
      if (query)
        await expect.poll(() => new URL(page.url()).searchParams.get("t")).toBe(query.slice(2));
    }
  });
  test(`bending thickness material and kind recover independently (${locale})`, async ({
    page,
  }) => {
    for (const order of [
      ["thickness", "material", "kind"],
      ["kind", "material", "thickness"],
    ]) {
      await page.goto(`${route}?t=&kind=&material=constructor`);
      const main = page.locator("#kanten-thickness").locator("xpath=ancestor::section[1]");
      for (const [index, key] of order.entries()) {
        await expect(page.locator(`#kanten-${key}`)).toHaveAttribute("aria-invalid", "true");
        await page
          .locator(`#kanten-${key}`)
          .selectOption({ thickness: "3", material: "staal", kind: "haaks" }[key]!);
        if (index < 2) await expect(main.locator("dl")).toHaveCount(0);
      }
      await expect(main.locator("dl")).toBeVisible();
      await expect(page.locator("table.ref-table tr.is-active")).toHaveText("32,7512,41620,1");
    }
  });
}
