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

/** Retain custom-angle functionality and avoid prerender hydration recovery for shared inputs. */
test("edges: custom-angle flat pattern survives a shared URL", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/tools/edges?ba_t=2&ba_r=2&ba_a=60&ba_l1=30&ba_l2=30", {
    waitUntil: "networkidle",
  });
  const extra = page.locator("details").filter({ has: page.locator("#edge-angle") });
  await extra.locator("summary").click();
  await expect(page.locator("#edge-angle")).toHaveValue("60");
  // Independent geometry: K=.4, BA=pi/3*2.8=2.93215;
  // BD=8*tan(pi/6)-BA=1.68665; flat=60-BD=58.31335 mm.
  await expect(extra).toContainText("58,31 mm");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("#edge-angle")).toHaveValue("60");
  expect(errors).toEqual([]);
});

test("edges: incomplete and impossible legs omit flat length and survive reload", async ({
  page,
}) => {
  await page.goto("/tools/edges?ba_t=2&ba_r=2&ba_a=90&ba_l1=30&ba_l2=30");
  const extra = page.locator("details").filter({ has: page.locator("#edge-angle") });
  await extra.locator("summary").click();
  await expect(extra).toContainText("56,4 mm");
  for (const value of ["", "-1", "3.99"]) {
    await page.locator("#edge-leg1").fill(value);
    await expect(extra).not.toContainText("56,4 mm");
    await expect(extra).toContainText("twee geldige buitenmaten");
  }
  await page.locator("#edge-leg1").fill("");
  await expect(page).toHaveURL(/ba_l1=&/);
  await page.reload();
  await extra.locator("summary").click();
  await expect(page.locator("#edge-leg1")).toHaveValue("");
  await expect(extra).toContainText("twee geldige buitenmaten");
});
