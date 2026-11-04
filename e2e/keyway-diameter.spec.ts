import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const path = `${locale === "en" ? "/en" : ""}/tools/keyways`;
  const resultName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  const cadName = locale === "en" ? "Copy callout" : "Kopieer maataanduiding";
  for (const remembered of [null, "40"]) {
    test(`keyway blank survives reload with remembered ${remembered} (${locale})`, async ({
      page,
    }) => {
      await page.addInitScript((value) => {
        if (value) sessionStorage.setItem("mechify-diameter", value);
        else sessionStorage.removeItem("mechify-diameter");
      }, remembered);
      await page.goto(`${path}?d=&widthFit=N9-JS9&keep=example#calculator`, {
        waitUntil: "networkidle",
      });
      const input = page.locator("#key-diameter");
      for (let reload = 0; reload < 2; reload++) {
        await expect(input).toHaveValue("");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAttribute("aria-describedby", "key-diameter-error");
        await expect(page.locator("#key-diameter-error")).toHaveText(
          locale === "en" ? "Enter a shaft Ø in whole mm." : "Vul een as-Ø in hele mm in.",
        );
        await expect.poll(() => new URL(page.url()).searchParams.get("d")).toBe("");
        await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
        await expect.poll(() => new URL(page.url()).searchParams.get("widthFit")).toBe("N9-JS9");
        await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
        await expect(page.locator("dl")).toHaveCount(0);
        await expect(page.getByRole("button", { name: resultName, exact: true })).toHaveCount(0);
        await expect(page.getByRole("button", { name: cadName, exact: true })).toHaveCount(0);
        await expect(page.locator("svg").filter({ hasText: "t₁" })).not.toContainText(/t₁ \d/);
        await expect(page.locator("table")).toHaveCount(1);
        await page.reload({ waitUntil: "networkidle" });
      }
      await input.fill("20");
      await expect(input).toHaveAttribute("aria-invalid", "false");
      await expect(page.locator("dl")).toContainText("3,5 +0,1/0 mm");
      await expect(page.getByRole("button", { name: cadName, exact: true })).toBeVisible();
      await input.fill("");
      await expect.poll(() => new URL(page.url()).searchParams.get("d")).toBe("");
      await page.reload({ waitUntil: "networkidle" });
      await expect(input).toHaveValue("");
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(input).toHaveValue(remembered ?? "20");
    });
  }
  for (const raw of ["bad", "Infinity", "20.5", "-1", "0", "6", "111"]) {
    test(`keyway invalid diameter ${raw} stays explicit (${locale})`, async ({ page }) => {
      await page.goto(`${path}?d=${encodeURIComponent(raw)}`, { waitUntil: "networkidle" });
      const input = page.locator("#key-diameter");
      await expect(input).toHaveValue(raw);
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#key-diameter-error")).toBeVisible();
      await expect(page.locator("dl")).toHaveCount(0);
      await expect(page.getByRole("button", { name: cadName, exact: true })).toHaveCount(0);
      await page.reload({ waitUntil: "networkidle" });
      await expect(input).toHaveValue(raw);
      await expect.poll(() => new URL(page.url()).searchParams.get("d")).toBe(raw);
      for (const [diameter, key] of [
        ["7", "2 × 2"],
        ["22", "6 × 6"],
        ["23", "8 × 7"],
        ["110", "28 × 16"],
      ]) {
        await input.fill(diameter);
        await expect(input).toHaveAttribute("aria-invalid", "false");
        await expect(page.locator("dl")).toContainText(key);
      }
    });
  }
}
