import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  test(`circlip groove limits and minimum width agree across outputs (${locale})`, async ({
    page,
    context,
  }, testInfo) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/seeger-grooves?kind=as&d=20`, {
      waitUntil: "networkidle",
    });
    const results = page.locator("dl");
    const diagram = page.locator("figure").first();
    await expect(results).toContainText("Ø18,87–19 mm");
    await expect(results).toContainText("≥1,3 mm (W)");
    await expect(results).toContainText(
      locale === "nl" ? "Groefdiepte (nominale referentie)" : "Groove depth (nominal reference)",
    );
    await expect(diagram).toContainText("d₂ Ø18,87–19 mm");
    await expect(diagram).toContainText("W ≥1,3");
    await expect(diagram).toContainText("t 0,5 (ref.)");
    await testInfo.attach(`circlip-shaft-20-${locale}`, {
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
    expect(copied).toContain("Ø18,87–19 mm");
    expect(copied).toContain("≥1,3 mm (W)");
    expect(copied).toContain(locale === "nl" ? "geen bovengrens" : "does not establish an upper");
    expect(copied).toContain("https://rcwebcatalog.s3.amazonaws.com/dsh.pdf");
    await page.locator("#circlip-diameter").fill("25");
    await expect(results).toContainText("0,55 mm");
    const depthLabel = diagram.locator("svg text").filter({ hasText: /^t 0,55 \(ref\.\)$/ });
    await expect(depthLabel).toBeVisible();
    // Measure rendered glyph bounds: text can be present but clipped by the SVG viewport.
    await page.evaluate(() => document.fonts.ready);
    const bounds = await depthLabel.evaluate((element) => {
      const text = element as SVGGraphicsElement;
      const box = text.getBBox();
      const viewport = text.ownerSVGElement!.viewBox.baseVal;
      return {
        left: box.x - viewport.x,
        right: viewport.x + viewport.width - (box.x + box.width),
      };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeGreaterThanOrEqual(0);
    await testInfo.attach(`circlip-shaft-25-${locale}`, {
      body: await diagram.screenshot({ animations: "disabled" }),
      contentType: "image/png",
    });
    await page
      .getByRole("button", {
        name: locale === "nl" ? "Kopieer resultaat" : "Copy result",
        exact: true,
      })
      .click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("0,55 mm");
    await page.locator("#circlip-diameter").fill("20");
    await page.locator("#circlip-kind").selectOption("boring");
    await expect(results).toContainText("Ø21–21,13 mm");
    await expect(results).not.toContainText("≥");
    await expect(diagram).not.toContainText("≥");
    await testInfo.attach(`circlip-bore-20-${locale}`, {
      body: await diagram.screenshot({ animations: "disabled" }),
      contentType: "image/png",
    });
    await page.locator("#circlip-kind").selectOption("as");
    await page.locator("#circlip-diameter").fill("40");
    await expect(results).not.toContainText("≥");
    await page.locator("#circlip-diameter").fill("35");
    await expect(page.getByRole("status")).toContainText(
      locale === "nl" ? "Niet geverifieerd" : "Not verified",
    );
  });
}
