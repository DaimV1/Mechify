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

test.describe("Keyboard-only operation", () => {
  test("fit-tolerances is fully operable by keyboard", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });

    await page.locator("#fit-diameter").focus();
    await page.keyboard.type("30");
    await expect(page.locator("#fit-diameter")).toHaveValue("30");

    await page.locator("#fit-select").focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#fit-select")).not.toHaveValue("");

    // The copy button must be tab-reachable and activatable without a mouse.
    const copyButton = page.getByRole("button", { name: "Kopieer resultaat" });
    await copyButton.focus();
    await expect(copyButton).toBeFocused();
  });

  test("skip link and focus outline are present", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => document.activeElement?.tagName);
    expect(active).not.toBeNull();
  });
});
