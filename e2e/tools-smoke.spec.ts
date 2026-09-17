import { test, expect } from "./support/fixtures.ts";
import { TOOL_ROUTES } from "./support/routes.ts";

/**
 * QA-001: every live tool must load cleanly — a heading, no console errors,
 * no accidental 404 — on both the desktop and mobile Playwright projects
 * (see playwright.config.ts). This is the floor the audit asked for:
 * "a calculator can be numerically correct but operationally wrong."
 */
for (const route of TOOL_ROUTES) {
  test(`${route.id} (${route.href}) loads cleanly`, async ({ page, consoleErrors }) => {
    await page.goto(route.href, { waitUntil: "networkidle" });

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Pagina niet gevonden")).toHaveCount(0);
    await expect(page.locator(".calc-workbench")).toHaveCount(1);

    expect(
      consoleErrors,
      `console/page errors on ${route.href}: ${consoleErrors.join("; ")}`,
    ).toEqual([]);
  });
}
