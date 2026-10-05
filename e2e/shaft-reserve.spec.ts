import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  test(`shaft reserve and exports describe allowable stress (${locale})`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/shaft-diameter?t=50&tau=40&d=16`, {
      waitUntil: "networkidle",
    });
    const status = page.getByRole("status").filter({ hasText: "R <" });
    await expect(status).toContainText(
      locale === "en"
        ? "exceeds the entered allowable stress"
        : "overschrijdt de ingevoerde toelaatbare spanning",
    );
    // Independently: 16 * 50000 / (pi * 16^3) = 62.1699 MPa; 40/tau = 0.643398.
    await expect(
      page.locator("dd").filter({ hasText: locale === "en" ? "62.2 N/mm²" : "62,2 N/mm²" }),
    ).toBeVisible();
    await expect(
      page.locator("dd").filter({ hasText: locale === "en" ? "0.64" : "0,64" }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      })
      .click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain(locale === "en" ? "R = 0.64" : "R = 0,64");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain((await status.textContent())!);
    expect(copied).not.toMatch(/shaft yields|de as vloeit|S_F/);
  });

  test(`shaft invalid shared states survive reload without exports (${locale})`, async ({
    page,
  }) => {
    const route = `${locale === "en" ? "/en" : ""}/tools/shaft-diameter`;
    const copy = page.getByRole("button", {
      name: locale === "en" ? "Copy result" : "Kopieer resultaat",
      exact: true,
    });
    await page.goto(`${route}?t=50&tau=40&d=16`, { waitUntil: "networkidle" });
    await page.locator("#shaft-torque").fill("");
    await expect.poll(() => new URL(page.url()).searchParams.get("t")).toBe("");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("#shaft-torque")).toHaveValue("");
    await expect(copy).toHaveCount(0);
    await expect(
      page.getByText(locale === "en" ? /No result to copy/ : /Geen resultaat om te kopiëren/),
    ).toBeVisible();
    for (const query of ["t=0&tau=40", "t=bad&tau=40", "t=50&tau=", "t=50&tau=0", "t=50&tau=bad"]) {
      await page.goto(`${route}?${query}&d=16`, { waitUntil: "networkidle" });
      await page.reload({ waitUntil: "networkidle" });
      await expect(copy).toHaveCount(0);
      await expect(page.locator("dd")).toHaveCount(0);
      for (const [key, value] of new URLSearchParams(query))
        expect(new URL(page.url()).searchParams.get(key)).toBe(value);
    }
    await page.locator("#shaft-tau-allow").fill("40");
    await expect(copy).toBeVisible();
  });
}
