import { test, expect } from "./support/fixtures.ts";
import { TOOL_ROUTES } from "./support/routes.ts";

const boltRoute = TOOL_ROUTES.find((route) => route.id === "bolted-joint");
if (!boltRoute) throw new Error("Live bolted-joint route missing from registry");
const boltHref = boltRoute.href;

test("bolted joint rejects invalid/empty inputs without stale output", async ({ page }) => {
  await page.goto(boltHref);
  for (const [id, invalid, valid] of [
    ["phi", "1.2", "0.25"],
    ["fz", "21", "1"],
    ["fa", "-1", "5"],
    ["fa", "", "5"],
    ["fz", "", "1"],
    ["fkreq", "-1", "10"],
  ]) {
    await page.fill(`#bolted-joint-${id}`, invalid);
    await expect(page.getByText(/Vul alle velden geldig in/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Kopieer resultaat" })).toHaveCount(0);
    await page.fill(`#bolted-joint-${id}`, valid);
  }
});

test("separation and copy preserve model limits through a shared URL", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`${boltHref}?fv=20&fz=0&phi=0.5&fa=40&fkreq=0`);
  await expect(page.getByText(/grens van loskomen bereikt/)).toBeVisible();
  await expect(page.getByText("Niet bepaald", { exact: true })).toHaveCount(3);
  await expect(page.getByText(/voldoende marge tegen vloeien/)).toHaveCount(0);
  await page.getByRole("button", { name: "Kopieer resultaat" }).click();
  const copy = await page.evaluate(() => navigator.clipboard.readText());
  expect(copy).toContain("F_Kerf = 0 kN");
  expect(copy).toContain("grens van loskomen bereikt");
  expect(copy).toContain("S_F = Niet bepaald");
  await page.getByRole("button", { name: "Kopieer link" }).click();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  await page.goto(url);
  await expect(page.locator("#bolted-joint-fa")).toHaveValue("40");
  await expect(page.getByText(/grens van loskomen bereikt/)).toBeVisible();
});

test("insufficient clamp requirement is distinguished from separation", async ({ page }) => {
  await page.goto(`${boltHref}?fv=20&fz=1&phi=0.25&fa=8&fkreq=14`);
  await expect(page.getByText(/vereiste restklemkracht niet gehaald/)).toBeVisible();
  await expect(page.getByText("13 kN", { exact: true })).toBeVisible();
  await expect(page.getByText("21 kN", { exact: true })).toBeVisible();
  await expect(page.getByText(/grens van loskomen bereikt/)).toHaveCount(0);
});
