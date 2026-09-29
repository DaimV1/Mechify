import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./support/fixtures.ts";
import { TOOL_ROUTES } from "./support/routes.ts";

/**
 * QA-002: axe scan on every live tool, gating on serious/critical violations
 * only (per the audit's "zero serious a11y violations in audited routes").
 * Moderate/minor findings are printed for visibility but don't fail the
 * build — those are tracked as follow-up polish, not a release blocker.
 */
for (const route of TOOL_ROUTES) {
  test(`${route.id} (${route.href}) has no serious/critical a11y violations`, async ({ page }) => {
    await page.goto(route.href, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    const minor = results.violations.filter(
      (v) => v.impact !== "serious" && v.impact !== "critical",
    );
    if (minor.length) {
      console.log(
        `${route.href}: ${minor.length} non-blocking a11y finding(s): ${minor.map((v) => v.id).join(", ")}`,
      );
    }

    expect(
      blocking,
      blocking.map((v) => `${v.id}: ${v.description} (${v.nodes.length} node(s))`).join("\n"),
    ).toEqual([]);
  });
}

async function tabTo(
  page: import("@playwright/test").Page,
  target: import("@playwright/test").Locator,
) {
  for (let n = 0; n < 70; n++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((node) => node === document.activeElement)) return;
  }
  throw new Error("Control was not reachable with Tab");
}

test.describe("Keyboard-only operation", () => {
  test("skip link activates main, then calculator controls and copy are tab reachable", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const skip = page.locator("a.skip");
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await expect(skip).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
    const diameter = page.locator("#fit-diameter");
    await tabTo(page, diameter);
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type("30");
    await expect(diameter).toHaveValue("30");
    await tabTo(page, page.locator("#fit-select"));
    const original = await page.locator("#fit-select").inputValue();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#fit-select")).not.toHaveValue(original);
    const copy = page.getByRole("button", { name: "Kopieer resultaat" });
    await tabTo(page, copy);
    await expect(copy).toBeFocused();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("30");
  });
});
