import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  for (const invalid of ["unknown", "", "constructor"]) {
    test(`O-ring invalid application ${invalid || "blank"} preserves URL and recovers (${locale})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const prefix = locale === "en" ? "/en" : "";
      const application = page.getByLabel(locale === "en" ? "Application" : "Toepassing");
      const copy = page.getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      });
      await page.goto(
        `${prefix}/tools/o-ring-grooves?cord=3.55&seal=${invalid}&sq=20&wf=1.4#calculator`,
        { waitUntil: "networkidle" },
      );
      for (let reload = 0; reload < 2; reload++) {
        await expect(application).toHaveAttribute("aria-invalid", "true");
        await expect(application).toHaveAttribute("aria-describedby", "oring-seal-error");
        await expect(page.locator("#oring-seal-error")).toHaveText(
          locale === "en" ? "Choose a supported application." : "Kies een ondersteunde toepassing.",
        );
        await expect(copy).toHaveCount(0);
        await expect(page.getByText("2,84 mm", { exact: true })).toHaveCount(0);
        await expect(page.getByText(/15–30/)).toHaveCount(0);
        await expect.poll(() => new URL(page.url()).searchParams.get("seal")).toBe(invalid);
        await expect.poll(() => new URL(page.url()).hash).toBe("");
        if (reload === 0) await page.reload({ waitUntil: "networkidle" });
      }
      await application.selectOption("dynamisch");
      await expect(application).toHaveAttribute("aria-invalid", "false");
      await expect(page.locator("#oring-squeeze")).toHaveValue("12");
      await expect(copy).toBeVisible();
      await copy.click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain("3,12 mm");
      await expect.poll(() => new URL(page.url()).searchParams.get("seal")).toBe("dynamisch");
      await page.reload({ waitUntil: "networkidle" });
      await expect(application).toHaveValue("dynamisch");
      await expect(page.locator("#oring-squeeze")).toHaveValue("12");
    });
  }
  test(`O-ring missing application retains static default (${locale})`, async ({ page }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/o-ring-grooves?cord=3.55`, {
      waitUntil: "networkidle",
    });
    await expect(page.getByLabel(locale === "en" ? "Application" : "Toepassing")).toHaveValue(
      "statisch",
    );
    await expect(page.locator("#oring-squeeze")).toHaveValue("20");
  });
  test(`O-ring invalid application does not supply static squeeze (${locale})`, async ({
    page,
  }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/o-ring-grooves?seal=unknown`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("#oring-squeeze")).toHaveValue("");
    await expect(page.locator("#oring-seal-error")).toBeVisible();
    await expect.poll(() => new URL(page.url()).searchParams.get("seal")).toBe("unknown");
  });
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
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
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
