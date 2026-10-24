import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  for (const invalid of ["unknown", "", "constructor"]) {
    test(`O-ring invalid direction ${invalid || "blank"} preserves URL and recovers (${locale})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const direction = page.getByLabel(locale === "en" ? "Direction" : "Richting", {
        exact: true,
      });
      const copy = page.getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      });
      await page.goto(
        `${prefix}/tools/o-ring-grooves?cord=3.55&dir=${invalid}&seal=statisch&sq=20&wf=1.4&keep=example#calculator`,
        { waitUntil: "networkidle" },
      );
      for (let reload = 0; reload < 2; reload++) {
        await expect(direction).toHaveAttribute("aria-invalid", "true");
        await expect(direction).toHaveAttribute("aria-describedby", "oring-direction-error");
        await expect(page.locator("#oring-direction-error")).toHaveText(
          locale === "en" ? "Choose a supported direction." : "Kies een ondersteunde richting.",
        );
        await expect(copy).toHaveCount(0);
        await expect(page.locator("figure")).toHaveCount(0);
        await expect(page.locator("dl[aria-live]")).toHaveCount(0);
        await expect(page.getByRole("table")).toBeVisible();
        await expect(page.getByRole("table")).toContainText("2,84 mm");
        await expect.poll(() => new URL(page.url()).searchParams.get("dir")).toBe(invalid);
        await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
        await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
        if (reload === 0) await page.reload({ waitUntil: "networkidle" });
      }
      for (const valid of ["axiaal", "radiaal"]) {
        await direction.selectOption(valid);
        const axial = valid === "axiaal";
        const label =
          locale === "en"
            ? `Groove depth (${axial ? "axial" : "radial"})`
            : `Groefdiepte (${axial ? "axiaal" : "radiaal"})`;
        await expect(direction).toHaveAttribute("aria-invalid", "false");
        await expect(page.getByText(label, { exact: true })).toBeVisible();
        await expect(page.locator("figure svg")).toHaveAttribute(
          "aria-label",
          new RegExp(axial ? "axial|axiale" : "radial|radiale"),
        );
        await expect(page.locator("figure")).toContainText("t 2,84");
        await copy.click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain(`${label} = 2,84 mm`);
        await expect.poll(() => new URL(page.url()).searchParams.get("dir")).toBe(valid);
        await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
        await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
        await page.reload({ waitUntil: "networkidle" });
        await expect(direction).toHaveValue(valid);
        await expect(page.getByText(label, { exact: true })).toBeVisible();
      }
    });
  }
  test(`O-ring missing direction retains radial default (${locale})`, async ({ page }) => {
    await page.goto(`${prefix}/tools/o-ring-grooves?cord=3.55#calculator`, {
      waitUntil: "networkidle",
    });
    await expect(
      page.getByLabel(locale === "en" ? "Direction" : "Richting", { exact: true }),
    ).toHaveValue("radiaal");
    await expect(
      page.getByText(locale === "en" ? "Groove depth (radial)" : "Groefdiepte (radiaal)", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator("figure")).toContainText("t 2,84");
    await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
  });
}
