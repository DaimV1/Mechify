import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  for (const example of [
    {
      route: "shaft-diameter?t=50&tau=40&d=16",
      assumption:
        locale === "en"
          ? "Torsional stress from a given torque only."
          : "Alleen torsiespanning uit een gegeven koppel.",
      verification:
        locale === "en" ? "For a shaft that also carries bending" : "Voor een as die ook buiging",
    },
    {
      route: "bearing-life?C=10&P=2&n=1500",
      assumption:
        locale === "en" ? "Only the basic life formula" : "Alleen de basis-levensduurformule",
      verification:
        locale === "en"
          ? "For a final life calculation"
          : "Voor een definitieve levensduurberekening",
    },
  ]) {
    test(`engineering conditions remain visible and survive copy (${locale}, ${example.route})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(`${locale === "en" ? "/en" : ""}/calculators/${example.route}`, {
        waitUntil: "networkidle",
      });
      const details = page
        .locator("details")
        .filter({
          has: page.locator("summary", {
            hasText: locale === "en" ? "Source details" : "Brondetails",
          }),
        });
      await expect(details).not.toHaveAttribute("open");
      const verification = page.locator("p").filter({ hasText: example.verification });
      const assumptions = page.locator("p").filter({ hasText: example.assumption });
      await expect(verification).toBeVisible();
      await expect(verification).toContainText(locale === "en" ? "Before use:" : "Voor gebruik:");
      await expect(assumptions).toBeVisible();
      await page
        .getByRole("button", {
          name: locale === "en" ? "Copy result" : "Kopieer resultaat",
          exact: true,
        })
        .click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain((await verification.textContent())!);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
        (await assumptions.textContent())!,
      );
      await details.locator("summary").focus();
      await page.keyboard.press("Enter");
      await expect(details).toHaveAttribute("open", "");
      await expect(details).toContainText(locale === "en" ? "Checked" : "Gecontroleerd");
    });
  }
}
