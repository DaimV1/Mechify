import { test, expect } from "./support/fixtures.ts";

/**
 * QA-001: invalid or out-of-range input must fail gracefully — a helpful
 * message, never a raw NaN/Infinity or an unhandled crash reaching the UI.
 */
test.describe("Invalid input handling", () => {
  test("fit-tolerances: Ø0 asks for a positive diameter and never shows NaN/Infinity", async ({
    page,
    consoleErrors,
  }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await page.fill("#fit-diameter", "0");
    await expect(page.getByText(/groter dan 0/)).toBeVisible();
    await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test("seeger-grooves: an out-of-table diameter shows the nearest-size hint, not a crash", async ({
    page,
    consoleErrors,
  }) => {
    await page.goto("/tools/seeger-grooves", { waitUntil: "networkidle" });
    await page.fill("#circlip-diameter", "23");
    await expect(page.getByText(/Geen standaard seegerring/)).toBeVisible();
    await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test("pneumatic-cylinder: a negative force is rejected, not silently computed", async ({
    page,
    consoleErrors,
  }) => {
    await page.goto("/calculators/pneumatic-cylinder", { waitUntil: "networkidle" });
    await page.fill("#pneu-force", "-100");
    await expect(page.getByText(/Vul een kracht en druk groter dan 0 in/)).toBeVisible();
    await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test("o-ring-grooves: an overfilled geometry is flagged invalid and blocks copy", async ({
    page,
  }) => {
    await page.goto("/tools/o-ring-grooves", { waitUntil: "networkidle" });
    await page.fill("#oring-squeeze", "30");
    await page.fill("#oring-width", "1.1");
    await expect(page.getByText(/Ongeldige geometrie/)).toBeVisible();
    // An invalid/overfilled result must never offer a "copy as if valid" action.
    await expect(page.getByRole("button", { name: "Kopieer resultaat" })).toHaveCount(0);
  });
});
