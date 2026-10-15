import { test, expect } from "./support/fixtures.ts";
import { TOOL_ROUTES } from "./support/routes.ts";

const boltRoute = TOOL_ROUTES.find((route) => route.id === "bolted-joint");
if (!boltRoute) throw new Error("Live bolted-joint route missing from registry");
const boltHref = boltRoute.href;

for (const locale of ["nl", "en"] as const) {
  for (const value of ["unknown", "", "constructor"]) {
    test(`bolted joint ${locale} invalid property class ${JSON.stringify(value)} is correctable`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const prefix = locale === "en" ? "/en" : "";
      await page.goto(`${prefix}${boltHref}?m=M10&c=${value}&fv=20&fz=1&phi=0.25&fa=5&fkreq=10`, {
        waitUntil: "networkidle",
      });
      const select = page.locator("#bolted-joint-class");
      const copy = page.getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      });
      const safety = page
        .locator("dl > div")
        .filter({
          has: page.getByText(
            locale === "en" ? "Static safety against yield S_F" : "Veiligheid tegen vloeien S_F",
            { exact: true },
          ),
        })
        .locator("dd");
      for (let pass = 0; pass < 2; pass++) {
        if (pass) await page.reload({ waitUntil: "networkidle" });
        await expect(select).toHaveAttribute("aria-invalid", "true");
        await expect(select).toHaveAccessibleDescription(
          locale === "en"
            ? "Choose a property class from the list to calculate safety against yielding."
            : "Kies een sterkteklasse uit de lijst om de veiligheid tegen vloeien te berekenen.",
        );
        await expect(page.locator("dl")).toHaveCount(0);
        await expect(copy).toHaveCount(0);
        expect(new URL(page.url()).searchParams.get("c")).toBe(value);
      }
      await select.selectOption("12.9");
      await expect(select).not.toHaveAttribute("aria-invalid");
      await expect(safety).toHaveText("3,09");
      await expect(page.getByText("349,1 N/mm²", { exact: true })).toBeVisible();
      await copy.click();
      const text = await page.evaluate(() => navigator.clipboard.readText());
      expect(text).toContain(locale === "en" ? "M10, class 12.9" : "M10, klasse 12.9");
      expect(text).toContain("S_F = 3,09");
      await expect.poll(() => new URL(page.url()).searchParams.get("c")).toBe("12.9");
      await page.reload({ waitUntil: "networkidle" });
      await expect(select).toHaveValue("12.9");
      await expect(safety).toHaveText("3,09");
    });
  }
  test(`bolted joint ${locale} missing property class keeps default and simultaneous invalid selections remain correctable`, async ({
    page,
  }) => {
    const prefix = locale === "en" ? "/en" : "";
    await page.goto(`${prefix}${boltHref}`);
    await expect(page.locator("#bolted-joint-class")).toHaveValue("8.8");
    await page.goto(`${prefix}${boltHref}?m=constructor&c=constructor`);
    await expect(page.locator("#bolted-joint-size")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#bolted-joint-class")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#bolted-joint-class").selectOption("12.9");
    await expect(page.locator("dl")).toHaveCount(0);
    await page.locator("#bolted-joint-size").selectOption("M10");
    await expect(page.getByText("349,1 N/mm²", { exact: true })).toBeVisible();
  });
}

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
