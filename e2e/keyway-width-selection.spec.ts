import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const shaft = locale === "en" ? "Shaft keyway · width b" : "Spiebaan as · breedte b";
  const hub = locale === "en" ? "Hub keyway · width b" : "Spiebaan naaf · breedte b";
  const label =
    locale === "en" ? "Shaft / hub width fit (optional)" : "Breedtepassing as / naaf (optioneel)";
  test(`keyway explicit width pairs agree in results and copy (${locale})`, async ({
    page,
    context,
  }, testInfo) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${prefix}/tools/keyways?d=20&keep=example#calculator`, {
      waitUntil: "networkidle",
    });
    const select = page.getByLabel(label, { exact: true });
    await expect(select).toHaveValue("none");
    await expect(page.locator("dl")).not.toContainText(shaft);
    await expect.poll(() => new URL(page.url()).searchParams.has("widthFit")).toBe(false);
    for (const [fit, shaftValue, hubValue] of [
      ["P9-P9", "6 P9 (-0,012 / -0,042 mm)", "6 P9 (-0,012 / -0,042 mm)"],
      ["N9-JS9", "6 N9 (+0,000 / -0,030 mm)", "6 JS9 (+0,015 / -0,015 mm)"],
      ["H9-D10", "6 H9 (+0,030 / +0,000 mm)", "6 D10 (+0,078 / +0,030 mm)"],
    ]) {
      await select.selectOption(fit);
      await expect(page.locator("dl")).toContainText(shaftValue);
      await expect(page.locator("dl")).toContainText(hubValue);
      for (const name of [
        locale === "en" ? "Copy result" : "Kopieer resultaat",
        locale === "en" ? "Copy callout" : "Kopieer maataanduiding",
      ]) {
        await page.getByRole("button", { name, exact: true }).click();
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        expect(copied).toContain(`${shaft}: ${shaftValue}`);
        expect(copied).toContain(`${hub}: ${hubValue}`);
        expect(copied).toContain("3,5 +0,1/0 mm");
        if (fit === "H9-D10")
          expect(copied).toContain(locale === "en" ? "Shop/UNI" : "Werkplaats-/UNI");
      }
      await expect.poll(() => new URL(page.url()).searchParams.get("widthFit")).toBe(fit);
      await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
      await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
      await page.reload({ waitUntil: "networkidle" });
      await expect(select).toHaveValue(fit);
      await expect(page.locator("dl")).toContainText(hubValue);
      if (fit === "N9-JS9") {
        await page.evaluate(() => document.fonts.ready);
        const calculatorPanel = select.locator("xpath=ancestor::section[1]");
        await expect(calculatorPanel).toHaveCount(1);
        await testInfo.attach(`keyway-width-${locale}`, {
          body: await calculatorPanel.screenshot({ animations: "disabled" }),
          contentType: "image/png",
        });
      }
    }
    await select.selectOption("N9-JS9");
    await page.locator("#key-diameter").fill("7");
    await expect(page.locator("dl")).toContainText("2 JS9 (+0,0125 / -0,0125 mm)");
    await page.locator("#key-diameter").fill("6");
    await expect(page.locator("dl")).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: locale === "en" ? "Copy callout" : "Kopieer maataanduiding",
        exact: true,
      }),
    ).toHaveCount(0);
  });

  for (const invalid of ["unknown", "", "constructor"]) {
    test(`keyway invalid width pair ${invalid || "blank"} is preserved (${locale})`, async ({
      page,
    }) => {
      await page.goto(`${prefix}/tools/keyways?d=20&widthFit=${invalid}&keep=example#calculator`, {
        waitUntil: "networkidle",
      });
      const select = page.getByLabel(label, { exact: true });
      for (let n = 0; n < 2; n++) {
        await expect(select).toHaveAttribute("aria-invalid", "true");
        await expect(select).toHaveAttribute("aria-describedby", "key-width-fit-error");
        await expect(page.locator("#key-width-fit-error")).toBeVisible();
        await expect(page.locator("dl")).not.toContainText(shaft);
        await expect(page.locator("dl")).toContainText("3,5 +0,1/0 mm");
        await expect(page.getByRole("rowheader", { name: "P9", exact: true })).toBeVisible();
        await expect.poll(() => new URL(page.url()).searchParams.get("widthFit")).toBe(invalid);
        await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
        if (n === 0) await page.reload({ waitUntil: "networkidle" });
      }
      await select.selectOption("N9-JS9");
      await expect(select).toHaveAttribute("aria-invalid", "false");
      await expect(page.locator("dl")).toContainText("6 JS9 (+0,015 / -0,015 mm)");
      await select.selectOption("none");
      await expect.poll(() => new URL(page.url()).searchParams.has("widthFit")).toBe(false);
      await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
      await expect(page.locator("dl")).not.toContainText(hub);
    });
  }
}
