import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const label = locale === "en" ? "Tolerance class" : "Tolerantieklasse";
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  const angleLabel = locale === "en" ? "Angular size" : "Hoekmaat";
  const warning =
    locale === "en" ? "Dimensional tolerances omitted" : "Dimensionele toleranties ontbreken";
  const geo = locale === "en" ? "Straightness/flatness" : "Rechtheid/vlakheid";

  for (const key of ["lc", "linear"]) {
    for (const invalid of ["unknown", "", "constructor"]) {
      test(`ISO 2768 invalid ${key} ${invalid || "blank"} stays explicit (${locale})`, async ({
        page,
        context,
      }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        await page.goto(
          `${prefix}/tools/iso-2768?${key}=${invalid}&d=50&leg=50&gc=K&gl=100&keep=example`,
          { waitUntil: "networkidle" },
        );
        const select = page.getByLabel(label, { exact: true });
        const panel = select.locator("xpath=ancestor::section[1]");
        for (let reload = 0; reload < 2; reload++) {
          await expect(select).toHaveAttribute("aria-invalid", "true");
          await expect(select).toHaveAttribute("aria-describedby", "iso2768-linear-class-error");
          await expect(page.locator("#iso2768-linear-class-error")).toBeVisible();
          await expect(panel.locator("dl")).toHaveCount(0);
          await expect(page.locator("dl")).toContainText(
            locale === "en" ? "Straightness / flatness" : "Rechtheid / vlakheid",
          );
          await expect(panel.locator("table")).toHaveCount(3);
          await expect.poll(() => new URL(page.url()).searchParams.get("lc")).toBe(invalid);
          await expect.poll(() => new URL(page.url()).searchParams.has("linear")).toBe(false);
          await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
          await page.getByRole("button", { name: copyName, exact: true }).first().click();
          const copied = await page.evaluate(() => navigator.clipboard.readText());
          expect(copied).toContain(warning);
          expect(copied).toContain(geo);
          expect(copied).not.toMatch(
            /Ø\/L|Angle \(leg|Hoek \(been|Radius\/|NaN|function Object|±0°/,
          );
          await expect(page.locator("main")).not.toContainText("NaN");
          await expect(page.locator("main")).not.toContainText("function Object");
          if (reload === 0) await page.reload({ waitUntil: "networkidle" });
        }
        await select.selectOption("m");
        await expect(select).toHaveAttribute("aria-invalid", "false");
        await expect(panel.locator("dl")).toContainText(angleLabel);
        await expect(panel.locator("dl")).toContainText("±0,3 mm");
        await expect(panel.locator("dl")).toContainText("±0°30'");
        await page.getByRole("button", { name: copyName, exact: true }).first().click();
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        expect(copied).toContain("±0°30'");
        expect(copied).toContain("±0,3 mm");
        expect(copied).not.toContain(warning);
        await expect.poll(() => new URL(page.url()).searchParams.get("lc")).toBe("m");
      });
    }
  }

  test(`ISO 2768 missing dimensional class keeps m (${locale})`, async ({ page }) => {
    await page.goto(`${prefix}/tools/iso-2768?d=50&leg=50`, { waitUntil: "networkidle" });
    const select = page.getByLabel(label, { exact: true });
    await expect(select).toHaveValue("m");
    await expect(select).toHaveAttribute("aria-invalid", "false");
    const panel = select.locator("xpath=ancestor::section[1]");
    await expect(panel.locator("dl")).toContainText("±0,3 mm");
    await expect(panel.locator("dl")).toContainText("±0°30'");
  });
}
