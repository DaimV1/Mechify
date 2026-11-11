import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const path = `${locale === "en" ? "/en" : ""}/tools/seeger-grooves`;
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  for (const kind of ["as", "boring"] as const) {
    for (const remembered of [null, "40"]) {
      test(`circlip ${kind} blank persists, remembered ${remembered} (${locale})`, async ({
        page,
        context,
      }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        await page.addInitScript((value) => {
          if (value) sessionStorage.setItem("mechify-diameter", value);
          else sessionStorage.removeItem("mechify-diameter");
        }, remembered);
        await page.goto(`${path}?kind=${kind}&d=&keep=example#calculator`, {
          waitUntil: "networkidle",
        });
        const input = page.locator("#circlip-diameter");
        for (let reload = 0; reload < 2; reload++) {
          await expect(input).toHaveValue("");
          await expect(input).toHaveAttribute("aria-invalid", "true");
          await expect(input).toHaveAccessibleDescription(
            locale === "en" ? "Enter a diameter in whole mm." : "Vul een diameter in hele mm in.",
          );
          await expect.poll(() => new URL(page.url()).searchParams.get("d")).toBe("");
          expect(new URL(page.url()).searchParams.get("kind")).toBe(kind);
          expect(new URL(page.url()).searchParams.get("keep")).toBe("example");
          expect(new URL(page.url()).hash).toBe("#calculator");
          await expect(page.locator("dl")).toHaveCount(0);
          await expect(page.getByRole("button", { name: copyName, exact: true })).toHaveCount(0);
          await expect(page.locator("table")).toHaveCount(1);
          const diagram = page
            .locator('svg[role="img"]')
            .filter({ has: page.locator("text", { hasText: "d₁" }) });
          for (const label of ["d₁", "d₂", "b", "t"]) {
            await expect(
              diagram.locator("text", { hasText: new RegExp(`^${label}$`) }),
            ).toHaveCount(1);
          }
          await expect(diagram).not.toContainText(/(?:d₁|d₂|W|t) [≥]?\d/);
          await page.reload({ waitUntil: "networkidle" });
        }
        await input.fill("20");
        await expect(input).toHaveAttribute("aria-invalid", "false");
        await expect(page.locator("dl")).toContainText(
          kind === "as" ? "Ø18,87–19 mm" : "Ø21–21,13 mm",
        );
        await page.getByRole("button", { name: copyName, exact: true }).click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain(kind === "as" ? "Ø18,87–19 mm" : "Ø21–21,13 mm");
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain(kind === "as" ? "≥1,3 mm (W)" : "1,1 mm (W)");
        await input.fill("");
        await expect.poll(() => new URL(page.url()).searchParams.get("d")).toBe("");
        await page.reload({ waitUntil: "networkidle" });
        await expect(input).toHaveValue("");
        await page.goto(`${path}?kind=${kind}`, { waitUntil: "networkidle" });
        await expect(input).toHaveValue(remembered ?? "20");
        await expect(page.locator("dl")).toBeVisible();
      });
    }
    for (const raw of [
      "bad",
      "Infinity",
      "20.5",
      "-1",
      "0",
      "2",
      "99",
      "101",
      ...(kind === "boring" ? ["3"] : []),
    ]) {
      test(`circlip ${kind} invalid ${raw} stays explicit (${locale})`, async ({ page }) => {
        await page.goto(
          `${path}?kind=${kind}&d=${encodeURIComponent(raw)}&keep=example#calculator`,
          { waitUntil: "networkidle" },
        );
        const input = page.locator("#circlip-diameter");
        await expect(input).toHaveValue(raw);
        await expect(input).toHaveAttribute("aria-invalid", "true");
        const error = page.locator("#circlip-diameter-error");
        await expect(error).toBeVisible();
        await expect(input).toHaveAccessibleDescription(await error.innerText());
        const diagram = page
          .locator('svg[role="img"]')
          .filter({ has: page.locator("text", { hasText: "d₁" }) });
        await expect(diagram).not.toContainText(/(?:d₁|d₂|W|t) [≥]?\d/);
        for (const selectedKind of [kind === "as" ? "boring" : "as", kind]) {
          await page.locator("#circlip-kind").selectOption(selectedKind);
          await expect.poll(() => new URL(page.url()).searchParams.get("kind")).toBe(selectedKind);
          expect(new URL(page.url()).searchParams.get("d")).toBe(raw);
          expect(new URL(page.url()).searchParams.get("keep")).toBe("example");
          expect(new URL(page.url()).hash).toBe("#calculator");
        }
        await expect(page.locator("dl")).toHaveCount(0);
        await expect(page.getByRole("button", { name: copyName, exact: true })).toHaveCount(0);
        await page.reload({ waitUntil: "networkidle" });
        await expect(input).toHaveValue(raw);
        for (const diameter of [kind === "as" ? "3" : "8", "20", "40", "100"]) {
          await input.fill(diameter);
          await expect(input).toHaveAttribute("aria-invalid", "false");
          await expect(page.locator("dl")).toBeVisible();
        }
      });
    }
  }
}
