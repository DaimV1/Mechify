import { test, expect } from "./support/fixtures.ts";

/** QA-001: switching the calc-helper language must actually translate visible copy, on every route it's tried. */
test.describe("Locale switch", () => {
  test("fit-tolerances: NL heading switches to EN", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Nominale passing" })).toBeVisible();

    await page.selectOption('select[aria-label="Taal rekenhulp"]', "en");
    await expect(page.getByRole("heading", { name: "Nominal fit" })).toBeVisible();
  });

  test("iso-2768: locale switch also translates the provenance badge", async ({ page }) => {
    await page.goto("/tools/iso-2768", { waitUntil: "networkidle" });
    await expect(page.getByText("NORM IN HERZIENING")).toBeVisible();

    await page.selectOption('select[aria-label="Taal rekenhulp"]', "en");
    await expect(page.getByText("STANDARD UNDER REVISION")).toBeVisible();
    await expect(page.getByText("NORM IN HERZIENING")).toHaveCount(0);
  });

  test("locale choice survives client-side navigation to another tool", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await page.selectOption('select[aria-label="Taal rekenhulp"]', "en");
    await page.goto("/tools/keyways", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Key at shaft Ø" })).toBeVisible();
  });
});
