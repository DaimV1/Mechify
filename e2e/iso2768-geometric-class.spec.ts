import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  const warning =
    locale === "en" ? "Geometric tolerances omitted" : "Geometrische toleranties ontbreken";
  const dimensionalWarning =
    locale === "en" ? "Dimensional tolerances omitted" : "Dimensionele toleranties ontbreken";
  const geoLabel = locale === "en" ? "Straightness / flatness" : "Rechtheid / vlakheid";
  for (const key of ["gc", "form"]) {
    for (const invalid of ["unknown", "", "constructor"]) {
      test(`ISO 2768 invalid ${key} ${invalid || "blank"} stays explicit (${locale})`, async ({
        page,
        context,
      }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        await page.goto(
          `${prefix}/tools/iso-2768?${key}=${invalid}&d=50&leg=50&lc=m&gl=100&keep=example`,
          { waitUntil: "networkidle" },
        );
        const select = page.locator("#iso2768-geo-class");
        const section = select.locator("xpath=ancestor::section[1]");
        for (let reload = 0; reload < 2; reload++) {
          await expect(select).toHaveAttribute("aria-invalid", "true");
          await expect(select).toHaveAttribute("aria-describedby", "iso2768-geo-class-error");
          await expect(page.locator("#iso2768-geo-class-error")).toBeVisible();
          await expect(section.locator("dl")).toHaveCount(0);
          await expect(page.locator("dl")).toContainText("±0,3 mm");
          await expect(section.locator("table")).toHaveCount(3);
          await expect.poll(() => new URL(page.url()).searchParams.get("gc")).toBe(invalid);
          await expect.poll(() => new URL(page.url()).searchParams.has("form")).toBe(false);
          await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
          const buttons = page.getByRole("button", { name: copyName, exact: true });
          await expect(buttons).toHaveCount(2);
          for (const button of await buttons.all()) {
            await button.click();
            const copied = await page.evaluate(() => navigator.clipboard.readText());
            expect(copied).toContain(warning);
            expect(copied).toContain("±0,3 mm");
            expect(copied).not.toMatch(
              /Straightness\/flatness \(|Rechtheid\/vlakheid \(|Circular run-out,|Rondloop,|NaN|function Object/,
            );
          }
          await expect(page.locator("main")).not.toContainText("function Object");
          await expect(page.locator("main")).not.toContainText("NaN");
          if (reload === 0) await page.reload({ waitUntil: "networkidle" });
        }
        await select.selectOption("K");
        await expect(select).toHaveAttribute("aria-invalid", "false");
        await expect(section.locator("dl")).toContainText(geoLabel);
        await expect(section.locator("dl")).toContainText("0,2 mm");
        await page.getByRole("button", { name: copyName, exact: true }).last().click();
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        expect(copied).not.toContain(warning);
        expect(copied).toContain(
          locale === "en" ? "total zone 0,2 mm (not ±)" : "totale zone 0,2 mm (geen ±)",
        );
        await expect.poll(() => new URL(page.url()).searchParams.get("gc")).toBe("K");
      });
    }
  }
  test(`ISO 2768 missing geometric class keeps K (${locale})`, async ({ page }) => {
    await page.goto(`${prefix}/tools/iso-2768?gl=100`, { waitUntil: "networkidle" });
    const select = page.locator("#iso2768-geo-class");
    await expect(select).toHaveValue("K");
    await expect(select).toHaveAttribute("aria-invalid", "false");
    await expect(select.locator("xpath=ancestor::section[1]").locator("dl")).toContainText(
      "0,2 mm",
    );
  });
  test(`ISO 2768 both invalid classes omit both result families (${locale})`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${prefix}/tools/iso-2768?lc=constructor&gc=constructor&d=50&leg=50&gl=100`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("dl")).toHaveCount(0);
    for (const button of await page.getByRole("button", { name: copyName, exact: true }).all()) {
      await button.click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain(warning);
      expect(copied).toContain(dimensionalWarning);
      expect(copied).not.toMatch(/NaN|function Object|±0°/);
    }
    await page.locator("#iso2768-linear-class").selectOption("m");
    await expect(page.locator("dl")).toContainText("±0,3 mm");
    await expect(page.locator("#iso2768-geo-class")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#iso2768-geo-class").selectOption("K");
    await expect(page.locator("dl")).toHaveCount(2);
  });
}
