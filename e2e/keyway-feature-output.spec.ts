import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  test(`keyway feature depths agree across result, copy and diagram (${locale})`, async ({
    page,
    context,
  }, testInfo) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/keyways?d=20`, {
      waitUntil: "networkidle",
    });
    const shaft = locale === "nl" ? "Spiebaan as · diepte t₁" : "Shaft keyway · depth t₁";
    const hub = locale === "nl" ? "Spiebaan naaf · diepte t₂" : "Hub keyway · depth t₂";
    const results = page.locator("dl");
    await expect(results.locator("dt").first()).toHaveText(shaft);
    await expect(results).toContainText("3,5 +0,1/0 mm");
    await expect(results).toContainText("2,8 +0,1/0 mm");
    const diagram = page.locator("figure").first();
    await expect(diagram).toContainText("t₁ 3,5 +0,1/0");
    await expect(diagram).toContainText("t₂ 2,8 +0,1/0");
    await expect(diagram.locator("svg text").filter({ hasText: /^h / })).toHaveCount(0);
    await expect(diagram).toContainText(
      locale === "nl" ? "kies breedtepassing" : "select width fit",
    );
    await page.evaluate(() => document.fonts.ready);
    for (const label of await diagram.locator("svg text").all()) {
      const fits = await label.evaluate((element) => {
        const el = element as SVGGraphicsElement;
        const box = el.getBBox();
        const view = el.ownerSVGElement!.viewBox.baseVal;
        return box.x >= view.x && box.x + box.width <= view.x + view.width;
      });
      expect(fits).toBe(true);
    }
    await testInfo.attach(`keyway-20-${locale}`, {
      body: await diagram.screenshot({ animations: "disabled" }),
      contentType: "image/png",
    });
    for (const name of [
      locale === "nl" ? "Kopieer resultaat" : "Copy result",
      locale === "nl" ? "Kopieer maataanduiding" : "Copy callout",
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain(`${shaft}: 3,5 +0,1/0 mm`);
      expect(copied).toContain(`${hub}: 2,8 +0,1/0 mm`);
      expect(copied).toContain(
        locale === "nl" ? "Kies de breedtepassing" : "Select the shaft and hub width fits",
      );
      expect(copied).not.toContain("DIN 6885-A");
      expect(copied).not.toContain("P9");
    }
    // The independent reference classes remain available; no fit has been silently selected.
    await expect(page.getByRole("rowheader", { name: "P9", exact: true })).toBeVisible();
    await page.locator("#key-diameter").fill("6");
    await expect(
      page.getByRole("button", {
        name: locale === "nl" ? "Kopieer maataanduiding" : "Copy callout",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(diagram).not.toContainText("+0,1/0");
  });
}
