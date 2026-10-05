import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  test(`O-ring copied results preserve squeeze warnings (${locale})`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const prefix = locale === "en" ? "/en" : "";
    const outside = locale === "en" ? "outside the guideline" : "buiten de richtwaarde";
    const copyButton = page.getByRole("button", {
      name: locale === "en" ? "Copy result" : "Kopieer resultaat",
      exact: true,
    });
    // At 30% squeeze and width factor 1.4, nominal fill is pi/(4*0.7*1.4)
    // = 80.14267%: geometry fits, but dynamic squeeze exceeds its guideline.
    for (const example of [
      { seal: "dynamisch", squeeze: 30, range: "10–16", warns: true },
      { seal: "statisch", squeeze: 0, range: "15–30", warns: true },
      { seal: "dynamisch", squeeze: 12, range: "10–16", warns: false },
    ]) {
      await page.goto(
        `${prefix}/tools/o-ring-grooves?cord=3.55&seal=${example.seal}&sq=${example.squeeze}&wf=1.4`,
        { waitUntil: "networkidle" },
      );
      const warning = page.getByRole("status").filter({ hasText: outside });
      let warningText = "";
      if (example.warns) {
        await expect(warning).toBeVisible();
        warningText = (await warning.textContent())!;
        expect(warningText).toContain(`Squeeze ${example.squeeze}%`);
        expect(warningText).toContain(example.range);
      } else {
        await expect(warning).toHaveCount(0);
      }
      await copyButton.click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain(`squeeze ${example.squeeze}%`);
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      if (example.warns) expect(copied).toContain(warningText);
      else expect(copied).not.toContain(outside);
    }
    await page.locator("#oring-squeeze").fill("30");
    await page.locator("#oring-width").fill("1.1");
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(copyButton).toHaveCount(0);
  });
}
