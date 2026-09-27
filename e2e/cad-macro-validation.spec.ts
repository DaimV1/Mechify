import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  test(`CAD macro validation is explicit and keyboard-operable (${locale})`, async ({ page }) => {
    await page.goto(`/cad/macros?lang=${locale}`, { waitUntil: "networkidle" });

    await expect(page.getByTestId("macro-validation")).toHaveCount(14);
    await expect(
      page.getByText(locale === "nl" ? "Geen compile- of runtimetest in CAD." : "No compile or runtime test in CAD."),
    ).toBeVisible();
    await expect(page.getByText(locale === "nl" ? "Uitgevoerd in CAD" : "Executed in CAD")).toHaveCount(14);

    const download = page.getByRole("link", {
      name: locale === "nl" ? "Download Exporteer naar STEP (.bas)" : "Download Export to STEP (.bas)",
    }).first();
    await download.focus();
    await expect(download).toBeFocused();

    const details = page.getByText(
      locale === "nl" ? "Bekijk VBA-code voor Exporteer naar STEP" : "View VBA code for Export to STEP",
      { exact: true },
    ).first();
    await details.focus();
    await page.keyboard.press("Enter");
    await expect(details.locator("xpath=..")).toHaveAttribute("open", "");

    await expect(page.getByRole("button", {
      name: locale === "nl" ? "Kopieer code voor Exporteer naar STEP" : "Copy code for Export to STEP",
    }).first()).toBeVisible();
  });
}
