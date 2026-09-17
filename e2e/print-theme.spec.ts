import { test, expect } from "./support/fixtures.ts";

/**
 * THEME-001 (audit, 17 sept 2026): the dark screen theme must not survive
 * onto a printed page — a near-black background either burns through ink
 * or, when "print background graphics" is off, leaves light text invisible
 * on white paper.
 */
test.describe("Print theme", () => {
  test("body background is white and result tiles are legible under print media", async ({
    page,
  }) => {
    await page.goto("/tools/iso-2768", { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe("rgb(255, 255, 255)");

    const tileBg = await page.evaluate(() => {
      const tile = document.querySelector("dl div");
      return tile ? getComputedStyle(tile).backgroundColor : null;
    });
    expect(tileBg).toBe("rgb(255, 255, 255)");

    const sourceBadgeVisible = await page.getByText("NORM IN HERZIENING").isVisible();
    expect(sourceBadgeVisible).toBe(true);
  });

  test("screen-only chrome (nav, footer) is hidden under print media", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });

    await expect(page.locator("footer")).toBeHidden();
    await expect(page.locator(".header nav")).toBeHidden();
  });
});
