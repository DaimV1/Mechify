import { test, expect } from "./support/fixtures.ts";

const fields = [
  {
    key: "d",
    id: "iso2768-size",
    restore: "50",
    omitted: /Ø\/L|Radius\/afschuining:|Radius\/chamfer:/,
  },
  { key: "leg", id: "iso2768-leg", restore: "50", omitted: /Hoek \(been|Angle \(leg/ },
  {
    key: "gl",
    id: "iso2768-geo-length",
    restore: "100",
    omitted:
      /Rechtheid\/vlakheid \(|Straightness\/flatness \(|Loodrechtheid \(|Perpendicularity \(|Symmetrie \(|Symmetry \(/,
  },
] as const;

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  const warnings =
    locale === "en"
      ? [
          "Linear and radius/chamfer tolerances omitted",
          "Angular tolerance omitted",
          "Length-dependent geometric tolerances omitted",
        ]
      : [
          "Lineaire en radius-/afschuiningstoleranties ontbreken",
          "Hoektolerantie ontbreekt",
          "Lengteafhankelijke geometrische toleranties ontbreken",
        ];
  for (const [index, field] of fields.entries()) {
    for (const raw of ["", "bad", "Infinity", "0", "-1"]) {
      test(`ISO numeric ${field.key} ${raw || "blank"} stays explicit (${locale})`, async ({
        page,
        context,
      }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        const query = new URLSearchParams({
          d: "50",
          leg: "50",
          gl: "100",
          lc: "m",
          gc: "K",
          keep: "example",
        });
        query.set(field.key, raw);
        await page.goto(`${prefix}/tools/iso-2768?${query}`, { waitUntil: "networkidle" });
        const input = page.locator(`#${field.id}`);
        for (let reload = 0; reload < 2; reload++) {
          await expect(input).toHaveValue(raw);
          await expect(input).toHaveAttribute("aria-invalid", "true");
          await expect(input).toHaveAttribute("aria-describedby", `${field.id}-error`);
          await expect(page.locator(`#${field.id}-error`)).toBeVisible();
          await expect.poll(() => new URL(page.url()).searchParams.get(field.key)).toBe(raw);
          await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
          const dimensions = page.locator("dl").first();
          const geometry = page.locator("dl").last();
          if (field.key === "d") {
            await expect(dimensions.locator("dd").nth(0)).toHaveText("—");
            await expect(dimensions.locator("dd").nth(1)).toHaveText("—");
            await expect(dimensions.locator("dd").nth(2)).toHaveText("±0°30'");
          } else if (field.key === "leg") {
            await expect(dimensions.locator("dd").nth(0)).toHaveText("±0,3 mm");
            await expect(dimensions.locator("dd").nth(2)).toHaveText("—");
          } else {
            await expect(geometry.locator("dd").nth(0)).toHaveText("—");
            await expect(geometry.locator("dd").nth(1)).toHaveText("—");
            await expect(geometry.locator("dd").nth(2)).toHaveText("—");
            await expect(dimensions.locator("dd").nth(0)).toHaveText("±0,3 mm");
          }
          await expect(geometry.locator("dd").nth(3)).toHaveText("0,2 mm");
          await expect(page.locator("table")).toHaveCount(6);
          for (const section of [
            page.locator("#iso2768-linear-class").locator("xpath=ancestor::section[1]"),
            page.locator("#iso2768-geo-class").locator("xpath=ancestor::section[1]"),
          ]) {
            await section.getByRole("button", { name: copyName, exact: true }).click();
            const copied = await page.evaluate(() => navigator.clipboard.readText());
            expect(copied).toContain(warnings[index]);
            expect(copied).not.toMatch(field.omitted);
            expect(copied).toContain(
              locale === "en"
                ? "total zone 0,2 mm (not ±, length-independent)"
                : "totale zone 0,2 mm (geen ±, onafh. van lengte)",
            );
            expect(copied).not.toMatch(/NaN|Infinity/);
          }
          if (reload === 0) await page.reload({ waitUntil: "networkidle" });
        }
        await input.fill(field.restore);
        await input.blur();
        await expect(input).not.toHaveAttribute("aria-invalid", "true");
        await expect
          .poll(() => new URL(page.url()).searchParams.get(field.key))
          .toBe(field.restore);
        await page.getByRole("button", { name: copyName, exact: true }).first().click();
        expect(await page.evaluate(() => navigator.clipboard.readText())).not.toContain(
          warnings[index],
        );
      });
    }
  }

  test(`ISO legacy blank len preserves all dimensions (${locale})`, async ({ page }) => {
    await page.goto(`${prefix}/tools/iso-2768?len=&keep=legacy`, { waitUntil: "networkidle" });
    for (let reload = 0; reload < 2; reload++) {
      for (const field of fields) {
        await expect(page.locator(`#${field.id}`)).toHaveValue("");
        await expect(page.locator(`#${field.id}`)).toHaveAttribute("aria-invalid", "true");
        await expect.poll(() => new URL(page.url()).searchParams.get(field.key)).toBe("");
      }
      await expect.poll(() => new URL(page.url()).searchParams.has("len")).toBe(false);
      if (reload === 0) await page.reload({ waitUntil: "networkidle" });
    }
  });

  test(`ISO defaults and independent coverage boundaries (${locale})`, async ({ page }) => {
    await page.goto(`${prefix}/tools/iso-2768`, { waitUntil: "networkidle" });
    for (const field of fields)
      await expect(page.locator(`#${field.id}`)).toHaveValue(field.restore);
    const dimensions = page.locator("dl").first().locator("dd");
    const geometry = page.locator("dl").last().locator("dd");
    await expect(dimensions.nth(2)).toHaveText("±0°30'");
    await page.locator("#iso2768-leg").fill("50.001");
    await expect(dimensions.nth(2)).toHaveText("±0°20'");
    await page.locator("#iso2768-size").fill("0.4");
    await page.locator("#iso2768-size").blur();
    await expect(page.locator("#iso2768-size")).toHaveAttribute("aria-invalid", "true");
    await expect(dimensions.nth(0)).toHaveText("—");
    await expect(dimensions.nth(1)).toHaveText("—");
    await page.locator("#iso2768-size").fill("0.5");
    await expect(dimensions.nth(0)).toHaveText("±0,1 mm");
    await expect(dimensions.nth(1)).toHaveText("±0,2 mm");
    await page.locator("#iso2768-size").fill("4001");
    await expect(dimensions.nth(0)).toHaveText("—");
    await expect(dimensions.nth(1)).toHaveText("±1 mm");
    await expect(page.locator("#iso2768-size")).not.toHaveAttribute("aria-invalid", "true");
    await page.locator("#iso2768-geo-length").fill("3000");
    await expect(geometry.nth(0)).toHaveText("0,8 mm");
    await expect(geometry.nth(1)).toHaveText("1 mm");
    await expect(geometry.nth(2)).toHaveText("1 mm");
    await page.locator("#iso2768-geo-length").fill("3001");
    for (let i = 0; i < 3; i++) await expect(geometry.nth(i)).toHaveText("—");
    await expect(geometry.nth(3)).toHaveText("0,2 mm");
  });
}
