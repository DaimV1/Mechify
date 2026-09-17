import { test, expect } from "./support/fixtures.ts";

/**
 * QA-001: "copy result" must put the full result — including the new
 * provenance line from META-001 — on the clipboard, not just a stale or
 * partial string.
 */
test.describe("Copy result", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("keyways: copy result includes the dimensions and the source metadata line", async ({
    page,
  }) => {
    await page.goto("/tools/keyways", { waitUntil: "networkidle" });
    await page.fill("#key-diameter", "20");
    await page.getByRole("button", { name: "Kopieer resultaat" }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("Spie b × h");
    expect(clipboardText).toContain("DIN 6885-1:2021");
    expect(clipboardText).toContain("Gecontroleerd 2026-09-17");
  });

  test("copy-link puts the current URL (with query state) on the clipboard", async ({ page }) => {
    await page.goto("/tools/keyways", { waitUntil: "networkidle" });
    await page.fill("#key-diameter", "20");
    await page.getByRole("button", { name: "Kopieer link" }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("d=20");
  });
});
