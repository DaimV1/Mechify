import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  test(`drive result and copied formula use clear numeric notation (${locale})`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${locale === "en" ? "/en" : ""}/calculators/drive-power?p=0.75&n=1500&mode=torque`, {
      waitUntil: "networkidle",
    });
    // T = 750 / (2*pi*1500/60) = 15/pi = 4.774648293 N·m.
    const torque = locale === "en" ? "4.775" : "4,775";
    await expect(page.locator(".result-number")).toContainText(`${torque} N·m`);
    await expect(page.locator(".formula code")).toHaveText("P = T · 2πn / 60000");
    await page.getByRole("button", { name: locale === "en" ? /Copy result/ : /Kopieer resultaat/ }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain(`${torque} N·m`);
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("P = T · 2πn / 60000");
  });
}
