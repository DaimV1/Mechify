import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  test(`header stays visible and anchors clear it (${locale})`, async ({ page }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/fit-tolerances`, {
      waitUntil: "networkidle",
    });
    const header = page.locator("header.header");
    await page.evaluate(() => window.scrollTo(0, 700));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
    await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);
    await expect(header).toBeVisible();

    // Native hash navigation must leave a real calculator field below the bar.
    await page.evaluate(() => {
      window.location.hash = "fit-diameter";
    });
    await expect
      .poll(async () => {
        const field = await page.locator("#fit-diameter").boundingBox();
        const bar = await header.boundingBox();
        return !!field && !!bar && field.y >= bar.y + bar.height;
      })
      .toBe(true);

    await page.emulateMedia({ media: "print" });
    await expect(header).toHaveCSS("position", "static");
    await expect(header).toHaveCSS("box-shadow", "none");
  });
}

test("short mobile viewport can scroll every menu link and restore focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 240 });
  await page.goto("/toolkit", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 700));
  const toggle = page.locator(".menu-button");
  await toggle.click();
  const nav = page.locator("#navigation");
  await expect(nav).toBeVisible();
  for (let index = 0; index < 4; index++) {
    await page.keyboard.press("Tab");
    const link = nav.locator("a").nth(index);
    await expect(link).toBeFocused();
    const box = await link.boundingBox();
    expect(box?.y).toBeGreaterThanOrEqual(76);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(240);
  }
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("desktop article contents stays below the header", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Article sidebar is desktop only");
  await page.goto("/topics/koppel-en-toerental", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 850));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(800);
  const toc = page.locator(".article-toc");
  await expect(toc).toBeVisible();
  await expect
    .poll(async () => {
      const box = await toc.boundingBox();
      const bar = await page.locator("header.header").boundingBox();
      return !!box && !!bar && box.y >= bar.y + bar.height && box.y <= 110;
    })
    .toBe(true);
});
