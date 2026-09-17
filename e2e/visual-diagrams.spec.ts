import { test, expect } from "./support/fixtures.ts";

/**
 * QA-002: screenshot baselines for the reactive SVG technical diagrams
 * (src/components/toolkit/schema.tsx). Desktop-only for now — one stable
 * baseline set is worth more than two half-maintained ones while this
 * suite is new. Run `npx playwright test --update-snapshots` after an
 * intentional diagram change.
 */
test.describe("Technical diagram snapshots", () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the destructuring pattern here, even when no fixture is used.
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Visual baselines are desktop-only for now.");
  });

  test("seeger-grooves: shaft groove at Ø20", async ({ page }) => {
    await page.goto("/tools/seeger-grooves", { waitUntil: "networkidle" });
    await page.fill("#circlip-diameter", "20");
    await expect(page.locator("figure").first()).toHaveScreenshot("seeger-shaft-20.png");
  });

  test("o-ring-grooves: radial groove at cord 3.55", async ({ page }) => {
    await page.goto("/tools/o-ring-grooves", { waitUntil: "networkidle" });
    await expect(page.locator("figure").first()).toHaveScreenshot("oring-radial-355.png");
  });

  test("keyways: key section at shaft Ø20", async ({ page }) => {
    await page.goto("/tools/keyways", { waitUntil: "networkidle" });
    await page.fill("#key-diameter", "20");
    await expect(page.locator("figure").first()).toHaveScreenshot("keyway-20.png");
  });

  test("bearing-fits: cross-section at d=20, D=47", async ({ page }) => {
    await page.goto("/tools/bearing-fits", { waitUntil: "networkidle" });
    await page.fill("#bearing-diameter", "20");
    await page.fill("#bearing-housing-diameter", "47");
    await expect(page.locator("figure").first()).toHaveScreenshot("bearing-fit-20-47.png");
  });

  test("fasteners: joint section at M8", async ({ page }) => {
    await page.goto("/tools/fasteners", { waitUntil: "networkidle" });
    await expect(page.locator("figure").first()).toHaveScreenshot("fastener-m8.png");
  });

  test("buckling: pinned-pinned round section", async ({ page }) => {
    await page.goto("/calculators/buckling", { waitUntil: "networkidle" });
    await expect(page.locator("figure").first()).toHaveScreenshot("buckling-default.png");
  });

  test("beam-deflection: simply supported, centred load", async ({ page }) => {
    await page.goto("/calculators/beam-deflection", { waitUntil: "networkidle" });
    await expect(page.locator("figure").first()).toHaveScreenshot("beam-deflection-default.png");
  });
});
