import { test, expect } from "./support/fixtures.ts";

const correction = { nl: "Kies haaks of scherp.", en: "Choose right angle or sharp." };
for (const locale of ["nl", "en"] as const) {
  const route = `${locale === "en" ? "/en" : ""}/tools/edges`;
  for (const raw of ["", "bogus", "constructor", "__proto__"]) {
    test(`bending kind retains ${JSON.stringify(raw)}, switches locale and recovers both tables (${locale})`, async ({
      page,
    }) => {
      await page.goto(
        `${route}?kind=${raw}&t=2&material=staal&hole=6&edge=10&flange=15&interruption=5&bendLength=100&ba_t=3&ba_r=3&ba_a=60&ba_l1=30&ba_l2=30&keep=sentinel#kind-state`,
      );
      const select = page.locator("#kanten-kind");
      const main = select.locator("xpath=ancestor::section[1]");
      const clearance = page
        .locator("details")
        .filter({ hasText: /Extra controle:|Additional check:/ });
      const free = page
        .locator("details")
        .filter({ hasText: /Aanvullend: uitslag|Additional: flat pattern/ });
      const assertShared = async (kind: string) => {
        await expect.poll(() => new URL(page.url()).searchParams.get("kind")).toBe(kind);
        const url = new URL(page.url());
        for (const [key, value] of Object.entries({
          keep: "sentinel",
          ba_t: "3",
          ba_r: "3",
          ba_a: "60",
          ba_l1: "30",
          ba_l2: "30",
          hole: "6",
          edge: "10",
        }))
          expect(url.searchParams.get(key)).toBe(value);
        expect(url.hash).toBe("#kind-state");
      };
      const invalid = async (language: "nl" | "en") => {
        await expect(select).toHaveValue("");
        await expect(select.locator("option:checked")).toHaveText(
          language === "nl" ? "Kies een kant" : "Choose a bend",
        );
        await expect(select).toHaveAttribute("aria-invalid", "true");
        await expect(select).toHaveAttribute("aria-describedby", "kanten-kind-error");
        await expect(page.locator("#kanten-kind-error")).toHaveCount(1);
        await expect(page.locator("#kanten-kind-error")).toHaveText(correction[language]);
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
      await clearance.locator("summary").click();
      await expect(
        clearance.getByText(
          nextLocale === "en"
            ? "Choose right angle or sharp for the clearance check."
            : "Kies haaks of scherp voor de afstandscontrole.",
        ),
      ).toBeVisible();
      await expect(clearance.locator("dl")).toHaveCount(0);
      await expect(clearance.getByRole("button")).toHaveCount(0);
      await expect(clearance.getByText(/^5\.00%/)).toBeVisible();
      await free.locator("summary").click();
      await expect(free.locator("#edge-t")).toHaveValue("3");
      await expect(free.locator("dl")).toBeVisible();
      await expect(
        free.getByRole("button", { name: /^(Copy result|Kopieer resultaat)$/ }),
      ).toBeVisible();
      // Both independent panel writers must retain the invalid kind and hash.
      await free.locator("#edge-angle").fill("75");
      await expect.poll(() => new URL(page.url()).searchParams.get("ba_a")).toBe("75");
      await free.locator("#edge-angle").fill("60");
      await clearance
        .getByLabel(nextLocale === "en" ? "Total interruptions (mm)" : "Som onderbrekingen (mm)")
        .fill("6");
      await expect(clearance.getByText(/^6\.00%/)).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get("interruption")).toBe("6");
      await invalid(nextLocale);
      for (const kind of ["haaks", "scherp"] as const) {
        await select.selectOption(kind);
        await expect(select).not.toHaveAttribute("aria-invalid", "true");
        await expect(page.locator("#kanten-kind-error")).toHaveCount(0);
        await expect(main.locator("dl")).toBeVisible();
        await expect(
          main.getByRole("button", { name: /^(Copy result|Kopieer resultaat)$/ }),
        ).toBeVisible();
        await expect(page.locator("table.ref-table tr.is-active")).toHaveText(
          kind === "haaks" ? "21,889,11213,8" : "21,312,41220,65",
        );
        await expect(page.getByRole("heading", { name: /^(Doorsnede|Section)$/ })).toBeVisible();
        await expect(
          clearance.getByText(
            kind === "haaks"
              ? /Gatrand buiten de minimale|Hole edge outside the minimum/
              : /Te dichtbij:|Too close:/,
          ),
        ).toBeVisible();
        await expect(
          clearance.getByRole("button", { name: /^(Copy result|Kopieer resultaat)$/ }),
        ).toBeVisible();
        await assertShared(kind);
        await page.reload();
        await expect(select).toHaveValue(kind);
        await expect(main.locator("dl")).toBeVisible();
        await assertShared(kind);
        await clearance.locator("summary").click();
      }
    });
  }
  test(`bending missing kind keeps right-angle default (${locale})`, async ({ page }) => {
    await page.goto(`${route}?keep=sentinel#kind-state`);
    await expect(page.locator("#kanten-kind")).toHaveValue("haaks");
    await expect(page.locator("#kanten-kind-error")).toHaveCount(0);
    await expect(page.locator("table.ref-table tr.is-active")).toHaveText("21,889,11213,8");
    expect(new URL(page.url()).searchParams.get("keep")).toBe("sentinel");
    expect(new URL(page.url()).hash).toBe("#kind-state");
  });
}
