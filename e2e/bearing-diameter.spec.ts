import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const path = `${locale === "en" ? "/en" : ""}/tools/bearing-fits`;
  const resultName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  const cadName = locale === "en" ? "Copy callout" : "Kopieer maataanduiding";
  for (const remembered of [null, "40"]) {
    test(`bearing blank shaft diameter survives reload, remembered ${remembered} (${locale})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.addInitScript((value) => {
        if (value) sessionStorage.setItem("mechify-diameter", value);
        else sessionStorage.removeItem("mechify-diameter");
      }, remembered);
      await page.goto(`${path}?d=&D=47&load=normaal&side=vast&keep=example#calculator`, {
        waitUntil: "networkidle",
      });
      const input = page.locator("#bearing-diameter");
      for (let reload = 0; reload < 2; reload++) {
        await expect(input).toHaveValue("");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAccessibleDescription(
          locale === "en" ? "Enter a shaft Ø in whole mm." : "Vul een as-Ø in hele mm in.",
        );
        await expect.poll(() => new URL(page.url()).searchParams.get("d")).toBe("");
        for (const [key, value] of [
          ["D", "47"],
          ["load", "normaal"],
          ["side", "vast"],
          ["keep", "example"],
        ]) {
          expect(new URL(page.url()).searchParams.get(key)).toBe(value);
        }
        expect(new URL(page.url()).hash).toBe("#calculator");
        await expect(page.locator("dl")).toHaveCount(0);
        await expect(page.getByRole("button", { name: resultName, exact: true })).toHaveCount(0);
        await expect(page.getByRole("button", { name: cadName, exact: true })).toHaveCount(0);
        await expect(page.locator("table")).toHaveCount(3);
        await expect(page.locator("table").last()).toContainText("+0,007 / -0,018 mm");
        await page.reload({ waitUntil: "networkidle" });
      }
      await input.fill("20");
      await expect(input).toHaveAttribute("aria-invalid", "false");
      await page.getByRole("button", { name: resultName, exact: true }).click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain("20,002 / 20,015 mm");
      await page.getByRole("button", { name: cadName, exact: true }).first().click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe("Ø20k6 → 20,002 / 20,015 mm");
      await input.fill("");
      await expect.poll(() => new URL(page.url()).searchParams.get("d")).toBe("");
      await page.reload({ waitUntil: "networkidle" });
      await expect(input).toHaveValue("");
      await page.goto(`${path}?D=47`, { waitUntil: "networkidle" });
      await expect(input).toHaveValue(remembered ?? "20");
      await expect(page.locator("dl")).toBeVisible();
    });
  }
  for (const raw of ["bad", "Infinity", "20.5", "-1", "0", "3", "51"]) {
    test(`bearing invalid shaft diameter ${raw} stays explicit (${locale})`, async ({ page }) => {
      await page.goto(`${path}?d=${encodeURIComponent(raw)}&D=47`, { waitUntil: "networkidle" });
      const input = page.locator("#bearing-diameter");
      await expect(input).toHaveValue(raw);
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#bearing-diameter-error")).toBeVisible();
      await expect(page.locator("dl")).toHaveCount(0);
      await expect(page.getByRole("button", { name: cadName, exact: true })).toHaveCount(0);
      await page.reload({ waitUntil: "networkidle" });
      await expect(input).toHaveValue(raw);
      for (const diameter of ["4", "18", "19", "50"]) {
        await input.fill(diameter);
        await expect(input).toHaveAttribute("aria-invalid", "false");
        await expect(page.locator("dl")).toBeVisible();
      }
    });
  }
}
