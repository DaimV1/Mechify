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

/**
 * Both copy actions used to swallow a denied clipboard permission silently
 * (no user-visible feedback at all). They now surface the same explicit
 * denial message as the drive-power calculator's bespoke copy controls.
 */
test.describe("Copy result and copy link report clipboard denial", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "clipboard", {
        configurable: true,
        get: () => ({ writeText: () => Promise.reject(new Error("denied")) }),
      });
    });
  });

  test("copy result shows a denial message", async ({ page }) => {
    await page.goto("/tools/keyways", { waitUntil: "networkidle" });
    await page.fill("#key-diameter", "20");
    await page.getByRole("button", { name: "Kopieer resultaat" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Kopiëren niet toegestaan. Selecteer de tekst om handmatig te kopiëren.",
    );
  });

  test("copy link shows a denial message", async ({ page }) => {
    await page.goto("/tools/keyways", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Kopieer link" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Kopiëren niet toegestaan. Selecteer de tekst om handmatig te kopiëren.",
    );
  });

  test("fit-tolerances CAD callout shows a denial message", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Kopieer maataanduiding" }).first().click();
    await expect(page.getByRole("status")).toHaveText(
      "Kopiëren niet toegestaan. Selecteer de tekst om handmatig te kopiëren.",
    );
  });

  test("macro library copy code shows a denial message", async ({ page }) => {
    await page.goto("/en/cad/macros", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Copy code", exact: true }).first().click();
    await expect(page.getByRole("status")).toHaveText(
      "Copying isn't allowed. Select the code to copy it manually.",
    );
  });
});
