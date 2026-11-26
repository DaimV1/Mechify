import { test, expect } from "./support/fixtures.ts";

const correction = {
  nl: "Kies staal, aluminium, RVS of hoogsterkte.",
  en: "Choose steel, aluminium, stainless steel or high-strength.",
};
for (const locale of ["nl", "en"] as const) {
  const route = `${locale === "en" ? "/en" : ""}/tools/edges`;
  for (const raw of ["", "bogus", "constructor", "__proto__"]) {
    test(`bending material retains ${JSON.stringify(raw)}, switches locale and recovers all materials (${locale})`, async ({
      page,
    }) => {
      await page.goto(
        `${route}?material=${raw}&t=3&kind=haaks&hole=6&edge=13&flange=15&interruption=5&bendLength=100&ba_t=3&ba_r=3&ba_a=60&ba_l1=30&ba_l2=30&keep=sentinel#kind-state`,
      );
      const select = page.locator("#kanten-material");
      const main = select.locator("xpath=ancestor::section[1]");
      const clearance = page
        .locator("details")
        .filter({ hasText: /Extra controle:|Additional check:/ });
      const free = page
        .locator("details")
        .filter({ hasText: /Aanvullend: uitslag|Additional: flat pattern/ });
      const assertShared = async (material: string) => {
        await expect.poll(() => new URL(page.url()).searchParams.get("material")).toBe(material);
        const url = new URL(page.url());
        for (const [key, value] of Object.entries({
          keep: "sentinel",
          ba_t: "3",
          ba_r: "3",
          ba_a: "60",
          ba_l1: "30",
          ba_l2: "30",
          hole: "6",
          edge: "13",
        }))
          expect(url.searchParams.get(key)).toBe(value);
        expect(url.hash).toBe("#kind-state");
      };
      const invalid = async (language: "nl" | "en") => {
        await expect(select).toHaveValue("");
        await expect(select.locator("option:checked")).toHaveText(
          language === "nl" ? "Kies een materiaal" : "Choose a material",
        );
        await expect(select).toHaveAttribute("aria-invalid", "true");
        await expect(select).toHaveAttribute("aria-describedby", "kanten-material-error");
        await expect(page.locator("#kanten-material-error")).toHaveCount(1);
        await expect(page.locator("#kanten-material-error")).toHaveText(correction[language]);
        await expect(main.locator("dl")).toHaveCount(0);
        await expect(main.getByRole("button")).toHaveCount(0);
        await expect(page.locator("table.ref-table")).toHaveCount(0);
        await expect(page.getByRole("heading", { name: /^(Doorsnede|Section)$/ })).toHaveCount(0);
        await assertShared(raw);
      };
      await invalid(locale);
      await page.reload();
      await invalid(locale);
      const nextLocale = locale === "nl" ? "en" : "nl";
      await page
        .locator('select[aria-label="Taal rekenhulp"], select[aria-label="Calculator language"]')
        .selectOption(nextLocale);
      await expect(page).toHaveURL(
        new RegExp(`${nextLocale === "en" ? "/en" : ""}/tools/edges\\?`),
      );
      await invalid(nextLocale);
      await page.reload();
      await invalid(nextLocale);
      await clearance.locator(":scope > summary").click();
      await expect(
        clearance.getByText(
          nextLocale === "en"
            ? "Choose a supported material for the clearance check."
            : "Kies een geldig materiaal voor de afstandscontrole.",
        ),
      ).toBeVisible();
      await expect(clearance.locator("dl")).toHaveCount(0);
      await expect(clearance.getByRole("button")).toHaveCount(0);
      await expect(clearance.getByText(/^5\.00%/)).toBeVisible();
      await free.locator(":scope > summary").click();
      await expect(free.locator("#edge-t")).toHaveValue("3");
      await expect(free.locator("dl")).toBeVisible();
      await expect(
        free.getByRole("button", { name: /^(Copy result|Kopieer resultaat)$/ }),
      ).toBeVisible();
      // Both independent panel writers must retain the invalid material and hash.
      await free.locator("#edge-angle").fill("75");
      await expect.poll(() => new URL(page.url()).searchParams.get("ba_a")).toBe("75");
      await free.locator("#edge-angle").fill("60");
      await clearance
        .getByLabel(nextLocale === "en" ? "Total interruptions (mm)" : "Som onderbrekingen (mm)")
        .fill("6");
      await expect(clearance.getByText(/^6\.00%/)).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get("interruption")).toBe("6");
      await invalid(nextLocale);
      for (const material of ["staal", "alu", "rvs", "hoogsterkte"] as const) {
        await select.selectOption(material);
        await expect(select).not.toHaveAttribute("aria-invalid", "true");
        await expect(page.locator("#kanten-material-error")).toHaveCount(0);
        await expect(main.locator("dl")).toBeVisible();
        await expect(
          main.getByRole("button", { name: /^(Copy result|Kopieer resultaat)$/ }),
        ).toBeVisible();
        await expect(page.locator("table.ref-table tr.is-active")).toHaveText(
          {
            staal: "32,7512,41620,1",
            alu: "32,512,41620,1",
            rvs: "33,7515,122024,75",
            hoogsterkte: "3—16,82423,45",
          }[material],
        );
        await expect(page.getByRole("heading", { name: /^(Doorsnede|Section)$/ })).toBeVisible();
        await expect(
          clearance.getByText(
            material === "staal" || material === "alu"
              ? /Gatrand buiten de minimale|Hole edge outside the minimum/
              : /Te dichtbij:|Too close:/,
          ),
        ).toBeVisible();
        await expect(
          clearance.getByRole("button", { name: /^(Copy result|Kopieer resultaat)$/ }),
        ).toBeVisible();
        await assertShared(material);
        await page.reload();
        await expect(select).toHaveValue(material);
        await expect(main.locator("dl")).toBeVisible();
        await assertShared(material);
        await clearance.locator(":scope > summary").click();
      }
    });
  }
  test(`bending missing material keeps steel default (${locale})`, async ({ page }) => {
    await page.goto(`${route}?keep=sentinel#kind-state`);
    await expect(page.locator("#kanten-material")).toHaveValue("staal");
    await expect(page.locator("#kanten-material-error")).toHaveCount(0);
    await expect(page.locator("table.ref-table tr.is-active")).toHaveText("21,889,11213,8");
    expect(new URL(page.url()).searchParams.get("keep")).toBe("sentinel");
    expect(new URL(page.url()).hash).toBe("#kind-state");
  });
}

for (const locale of ["nl", "en"] as const) {
  test(`bending simultaneous invalid selections recover independently (${locale})`, async ({
    page,
  }) => {
    const route = `${locale === "en" ? "/en" : ""}/tools/edges`;
    for (const first of ["material", "kind"] as const) {
      await page.goto(`${route}?material=constructor&kind=&t=3&keep=sentinel#both-invalid`);
      const material = page.locator("#kanten-material");
      const kind = page.locator("#kanten-kind");
      const main = material.locator("xpath=ancestor::section[1]");
      for (const key of ["material", "kind"]) {
        await expect(page.locator(`#kanten-${key}`)).toHaveAttribute(
          "aria-describedby",
          `kanten-${key}-error`,
        );
        await expect(page.locator(`#kanten-${key}-error`)).toHaveCount(1);
      }
      await expect(main.locator("dl")).toHaveCount(0);
      if (first === "material") await material.selectOption("rvs");
      else await kind.selectOption("scherp");
      const remaining = first === "material" ? "kind" : "material";
      await expect(page.locator(`#kanten-${remaining}`)).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator(`#kanten-${first}-error`)).toHaveCount(0);
      await expect(main.locator("dl")).toHaveCount(0);
      await expect(main.getByRole("button")).toHaveCount(0);
      await expect(page.locator("table.ref-table")).toHaveCount(0);
      expect(new URL(page.url()).searchParams.get(remaining)).toBe(
        remaining === "kind" ? "" : "constructor",
      );
      await page.reload();
      await expect(page.locator(`#kanten-${remaining}`)).toHaveAttribute("aria-invalid", "true");
      if (remaining === "kind") await kind.selectOption("scherp");
      else await material.selectOption("rvs");
      await expect(main.locator("dl")).toBeVisible();
      await expect(page.locator('[id^="kanten-"][aria-invalid="true"]')).toHaveCount(0);
      // Preserve supported sharp rows too, including the existing unavailable Ri.
      for (const [value, row] of Object.entries({
        staal: "32,5121,32434,95",
        alu: "32,8621,32434,95",
        rvs: "33,7321,52436,05",
        hoogsterkte: "3—21,152433,75",
      })) {
        await material.selectOption(value);
        await expect(page.locator("table.ref-table tr.is-active")).toHaveText(row);
      }
      expect(new URL(page.url()).searchParams.get("keep")).toBe("sentinel");
      expect(new URL(page.url()).hash).toBe("#both-invalid");
    }
  });
}
