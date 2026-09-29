import { test, expect } from "./support/fixtures.ts";

test("bearing shared blank stays invalid after reload", async ({ page }) => {
  await page.goto("/en/calculators/bearing-life?C=10&P=2&n=1500");
  await page.locator("#bearing-life-C").fill("");
  await expect(page).toHaveURL(/[?&]C=&/);
  await page.reload();
  await expect(page.locator("#bearing-life-C")).toHaveValue("");
  await expect(
    page.getByText("Enter C, P and the speed (all greater than 0).", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("L10 (basic)", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy result", exact: true })).toHaveCount(0);
});

test("bearing numerical result and warnings survive copy", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/calculators/bearing-life?C=4&P=2&n=12000&C0=1&P0=2");
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^L10 = 8(?:[,.]00)? x 10\^6 rev \(11 h\)$/m);
  expect(copied).toMatch(/S0 = C0\/P0 = 0[,.]5(?:0)?/);
  expect(copied).toMatch(/speed|Speed/);
  expect(copied).toContain("static load exceeds the recommended lower bound");
});

test("cylinder copy retains calculated force and column-capacity limitation", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=6&l=10");
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Recommended bore: Ø50 mm");
  expect(copied).toMatch(/^Extend force 1[., ]?178 N$/m);
  expect(copied).toContain("blocked/stalled case");
  expect(copied).toContain("not a verified column capacity");
});

test("cylinder shared blank force stays invalid after reload", async ({ page }) => {
  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=6");
  await page.locator("#pneu-force").fill("");
  await expect(page).toHaveURL(/[?&]f=&/);
  await page.reload();
  await expect(page.locator("#pneu-force")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Copy result", exact: true })).toHaveCount(0);
});
