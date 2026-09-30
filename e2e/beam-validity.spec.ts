import { test, expect } from "./support/fixtures.ts";

// Independent centre-load reference: I=10*40³/12, M=F*L/4,
// sigma=M*20/I, delta=F*L³/(48*210000*I). At F=3000:
// sigma=281.25 MPa and delta=5.580357142857 mm (under 10 mm but above yield).
for (const locale of ["nl", "en"] as const) {
  test(`beam screening and copied output respect yield (${locale})`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const prefix = locale === "en" ? "/en" : "";
    const warning =
      locale === "en" ? "not a verified deflection check" : "geen geldige doorbuigingstoets";
    const pass = locale === "en" ? "stays within the specified" : "blijft binnen de opgegeven";
    const fail = locale === "en" ? "exceeds the specified" : "overschrijdt de opgegeven";
    const base = `${prefix}/calculators/beam-deflection?type=opgelegd&loadKind=puntlast&section=rechthoek&b=40&h=10&axis=strong&material=staal&L=1000&posA=500`;
    const cases = [
      { url: `${base}&f=3000&allow=10`, invalid: true, conclusion: warning, stress: "281" },
      // Exact boundary: square a=6 => I=108, c=3; F=940,L=36 => M=8460, sigma=235.
      {
        url: `${prefix}/calculators/beam-deflection?type=opgelegd&loadKind=puntlast&section=vierkant&a=6&material=staal&L=36&posA=18&f=940&allow=10`,
        invalid: true,
        conclusion: warning,
        stress: "235",
      },
      { url: `${base}&f=1000&allow=10`, invalid: false, conclusion: pass, stress: "93" },
      { url: `${base}&f=1000&allow=1`, invalid: false, conclusion: fail, stress: "93" },
    ];
    for (const example of cases) {
      await page.goto(example.url, { waitUntil: "networkidle" });
      await expect(page.getByRole("status").filter({ hasText: example.conclusion })).toBeVisible();
      if (example.invalid) {
        await expect(page.getByText(pass, { exact: false })).toHaveCount(0);
        await expect(page.getByText(fail, { exact: false })).toHaveCount(0);
      } else {
        await expect(page.getByText(warning, { exact: false })).toHaveCount(0);
      }
      await page
        .getByRole("button", {
          name: locale === "en" ? "Copy result" : "Kopieer resultaat",
          exact: true,
        })
        .click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain(example.conclusion);
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain(`σ_max = ${example.stress}`);
      if (example.invalid) {
        expect(copied).not.toContain(pass);
        expect(copied).not.toContain(fail);
      }
    }
  });
}
