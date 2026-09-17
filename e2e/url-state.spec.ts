import { test, expect } from "./support/fixtures.ts";

/** QA-001: input state must round-trip through the URL so a link reproduces the same calculation. */
test.describe("URL state persistence", () => {
  test("keyways: diameter input updates the URL and survives a reload", async ({ page }) => {
    await page.goto("/tools/keyways", { waitUntil: "networkidle" });
    await page.fill("#key-diameter", "35");
    await expect(page).toHaveURL(/d=35/);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("#key-diameter")).toHaveValue("35");
  });

  test("fit-tolerances: fit selection updates the URL and survives a reload", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await page.selectOption("#fit-select", "H7/g6");
    await expect(page).toHaveURL(/fit=H7%2Fg6/);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("#fit-select")).toHaveValue("H7/g6");
  });
});
