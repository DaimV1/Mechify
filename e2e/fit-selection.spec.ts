import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  for (const value of ["unknown", "", "constructor"]) {
    test(`invalid fit=${value} is preserved and recovers (${locale})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(`${prefix}/tools/fit-tolerances?d=20&fit=${value}#main`, {
        waitUntil: "networkidle",
      });
      const select = page.locator("#fit-select");
      const panel = page.locator("section").filter({ has: select });
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt) await page.reload({ waitUntil: "networkidle" });
        await expect(select).toHaveAttribute("aria-invalid", "true");
        await expect(select).toHaveAccessibleDescription(
          locale === "en" ? "Choose a supported fit." : "Kies een ondersteunde passing.",
        );
        await expect(select).toHaveValue("");
        expect(new URL(page.url()).searchParams.get("fit")).toBe(value);
        expect(new URL(page.url()).hash).toBe("#main");
        await expect(panel.locator("dl")).toHaveCount(0);
        await expect(panel.getByRole("button", { name: copyName, exact: true })).toHaveCount(0);
        await expect(
          panel.getByRole("button", {
            name: locale === "en" ? "Copy callout" : "Kopieer maataanduiding",
            exact: true,
          }),
        ).toHaveCount(0);
        await expect(panel.locator('a[href*="bearing-fits"]')).toHaveCount(0);
        await expect(page.locator("table.ref-table")).toHaveCount(3);
      }
      await select.selectOption("H7/p6");
      await expect(select).toHaveAttribute("aria-invalid", "false");
      await expect(page.locator("#fit-selection-error")).toHaveCount(0);
      const clearance = panel.locator("dl > div").filter({
        has: page.getByText(locale === "en" ? "Clearance min … max" : "Speling min … max", {
          exact: true,
        }),
      });
      await expect(clearance.locator("dd")).toHaveText("-0,035 … -0,001 mm");
      await panel.getByRole("button", { name: copyName, exact: true }).click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain("H7/p6");
      expect(copied).toContain("-0,035");
      expect(copied).toContain("-0,001");
      expect(new URL(page.url()).searchParams.get("fit")).toBe("H7/p6");
      expect(new URL(page.url()).hash).toBe("#main");
      await page.reload({ waitUntil: "networkidle" });
      await expect(select).toHaveValue("H7/p6");
      await expect(panel.locator("dl")).toHaveCount(1);
    });
  }

  test(`missing fit retains H7/h6 default (${locale})`, async ({ page }) => {
    await page.goto(`${prefix}/tools/fit-tolerances?d=20`, { waitUntil: "networkidle" });
    await expect(page.locator("#fit-select")).toHaveValue("H7/h6");
    await expect(page.locator("#fit-select")).toHaveAttribute("aria-invalid", "false");
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
  });
}
