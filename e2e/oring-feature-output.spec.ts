import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  for (const direction of ["radiaal", "axiaal"] as const) {
    test(`O-ring feature estimate agrees across outputs (${locale}, ${direction})`, async ({
      page,
      context,
    }, testInfo) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(
        `${locale === "en" ? "/en" : ""}/tools/o-ring-grooves?cord=3.55&dir=${direction}&sq=20&wf=1.4`,
        { waitUntil: "networkidle" },
      );
      const notice =
        locale === "nl"
          ? "Voorlopige schatting — productietoleranties niet bepaald."
          : "Preliminary estimate — manufacturing tolerances not determined.";
      const depth =
        locale === "nl"
          ? `Groefdiepte (${direction})`
          : `Groove depth (${direction === "radiaal" ? "radial" : "axial"})`;
      const width = locale === "nl" ? "Groefbreedte" : "Groove width";
      const diagram = page.locator("figure").first();
      const results = page.locator("dl");
      await expect(results.locator("dt").first()).toHaveText(depth);
      await expect(results).toContainText("2,84 mm");
      await expect(results).toContainText("4,97 mm");
      await expect(diagram).toContainText("t 2,84");
      await expect(diagram).toContainText("b 4,97");
      await expect(diagram).toContainText(notice);
      await expect(diagram.locator("svg circle")).toHaveCount(0);
      await expect(diagram.locator("svg[role=img]")).toHaveAttribute("aria-label", /t .* b /);
      await page.evaluate(() => document.fonts.ready);
      await testInfo.attach(`oring-${direction}-${locale}`, {
        body: await diagram.screenshot({ animations: "disabled" }),
        contentType: "image/png",
      });
      await page
        .getByRole("button", {
          name: locale === "nl" ? "Kopieer resultaat" : "Copy result",
          exact: true,
        })
        .click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied.startsWith(`${depth} = 2,84 mm\n${width} = 4,97 mm`)).toBe(true);
      expect(copied).toContain(notice);
      expect(copied).toContain("squeeze 20%");
      // Changing the input must update all three representations, not just the initial render.
      await page.locator("#oring-squeeze").fill("25");
      await expect(results).toContainText("2,66 mm");
      await expect(diagram).toContainText("t 2,66");
      await page
        .getByRole("button", {
          name: locale === "nl" ? "Kopieer resultaat" : "Copy result",
          exact: true,
        })
        .click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain(`${depth} = 2,66 mm`);
    });
  }
}
