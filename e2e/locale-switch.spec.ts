import { test, expect } from "./support/fixtures.ts";

/** QA-001: switching the calc-helper language must actually translate visible copy, on every route it's tried. */
test.describe("Locale switch", () => {
  test("fit-tolerances: NL heading switches to EN", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Nominale passing" })).toBeVisible();

    await page.selectOption('select[aria-label="Taal rekenhulp"]', "en");
    await expect(page.getByRole("heading", { name: "Nominal fit" })).toBeVisible();
  });

  test("iso-2768: locale switch also translates the provenance badge", async ({ page }) => {
    await page.goto("/tools/iso-2768", { waitUntil: "networkidle" });
    await expect(page.getByText("NORM IN HERZIENING")).toBeVisible();

    await page.selectOption('select[aria-label="Taal rekenhulp"]', "en");
    await expect(page.getByText("STANDARD UNDER REVISION")).toBeVisible();
    await expect(page.getByText("NORM IN HERZIENING")).toHaveCount(0);
  });

  test("English locale survives client-side navigation to the toolkit", async ({ page }) => {
    await page.goto("/tools/fit-tolerances", { waitUntil: "networkidle" });
    await page.selectOption('select[aria-label="Taal rekenhulp"]', "en");
    await page.locator('a[href="/en/toolkit"]:visible').first().click();
    await expect(page).toHaveURL(/\/en\/toolkit$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test("English SSR URL owns language, preserves shared inputs and has matching metadata", async ({
  page,
  consoleErrors,
}) => {
  await page.goto("/tools/fit-tolerances?d=30#main", { waitUntil: "networkidle" });
  await page.selectOption('select[aria-label="Taal rekenhulp"]', "en");
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === "/en/tools/fit-tolerances" &&
      url.searchParams.get("d") === "30" &&
      url.searchParams.get("fit") === "H7/h6" &&
      url.hash === "#main",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.mechify.nl/en/tools/fit-tolerances",
  );
  await page.goto("/en/tools/fit-tolerances", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Nominal fit" })).toBeVisible();
  await expect(page.locator('a[href="/en/toolkit"]').first()).toHaveAttribute(
    "href",
    "/en/toolkit",
  );
  expect(consoleErrors).toEqual([]);
});
