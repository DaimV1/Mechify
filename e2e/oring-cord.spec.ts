import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const label = locale === "en" ? "Cord diameter (mm)" : "Koorddiameter (mm)";
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  for (const invalid of ["", "nope", "NaN", "Infinity", "1e309", "0", "-3.55", "4"]) {
    test(`O-ring invalid cord ${invalid || "blank"} persists and recovers (${locale})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(
        `${prefix}/tools/o-ring-grooves?cord=${encodeURIComponent(invalid)}&keep=example#calculator`,
        { waitUntil: "networkidle" },
      );
      const cord = page.getByLabel(label, { exact: true });
      const copy = page.getByRole("button", { name: copyName, exact: true });
      for (let reload = 0; reload < 2; reload++) {
        await expect(cord).toHaveValue("");
        await expect(cord.locator("option:checked")).toHaveText(
          locale === "en" ? "Choose cord diameter" : "Kies koorddiameter",
        );
        await expect(cord).toHaveAttribute("aria-invalid", "true");
        await expect(cord).toHaveAttribute("aria-describedby", "oring-cord-error");
        await expect(page.locator("#oring-cord-error")).toHaveText(
          locale === "en"
            ? "Choose a supported cord diameter."
            : "Kies een ondersteunde koorddiameter.",
        );
        await expect(copy).toHaveCount(0);
        await expect(page.locator("dl[aria-live]")).toHaveCount(0);
        await expect(page.locator("figure svg")).toBeVisible();
        await expect(page.locator("figure svg")).not.toContainText(/\d/);
        await expect(page.getByRole("table")).toContainText("2,84 mm");
        await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(5);
        await expect(page.locator("tr.is-active")).toHaveCount(0);
        await expect.poll(() => new URL(page.url()).searchParams.get("cord")).toBe(invalid);
        await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
        await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
        if (reload === 0) await page.reload({ waitUntil: "networkidle" });
      }
      await cord.selectOption("3.55");
      await expect(cord).toHaveAttribute("aria-invalid", "false");
      await expect(page.locator("#oring-cord-error")).toHaveCount(0);
      await expect(page.locator("dl[aria-live]")).toContainText("2,84 mm");
      await expect(page.locator("figure")).toContainText("t 2,84");
      await expect(page.locator("figure")).toContainText("b 4,97");
      await copy.click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain("2,84 mm");
      await expect.poll(() => new URL(page.url()).searchParams.get("cord")).toBe("3.55");
      await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
      await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
      await page.reload({ waitUntil: "networkidle" });
      await expect(cord).toHaveValue("3.55");
      await expect(copy).toBeVisible();
    });
  }
  for (const [raw, canonical, depth] of [
    ["3.550", "3.55", "2,84"],
    ["3,55", "3.55", "2,84"],
    ["1.80", "1.8", "1,44"],
    ["5.30", "5.3", "4,24"],
  ]) {
    test(`O-ring cord alias ${raw} selects supported option (${locale})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(
        `${prefix}/tools/o-ring-grooves?cord=${encodeURIComponent(raw)}&keep=example#calculator`,
        { waitUntil: "networkidle" },
      );
      for (let reload = 0; reload < 2; reload++) {
        const cord = page.getByLabel(label, { exact: true });
        await expect(cord).toHaveValue(canonical);
        await expect(cord).toHaveAttribute("aria-invalid", "false");
        await expect(page.locator("dl[aria-live]")).toContainText(`${depth} mm`);
        await expect(page.locator("figure")).toContainText(`t ${depth}`);
        await expect(page.locator("tr.is-active")).toHaveCount(1);
        await page.getByRole("button", { name: copyName, exact: true }).click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain(`${depth} mm`);
        await expect.poll(() => new URL(page.url()).searchParams.get("cord")).toBe(raw);
        await expect.poll(() => new URL(page.url()).searchParams.get("keep")).toBe("example");
        await expect.poll(() => new URL(page.url()).hash).toBe("#calculator");
        if (reload === 0) await page.reload({ waitUntil: "networkidle" });
      }
    });
  }
  test(`O-ring missing cord retains 3.55 default (${locale})`, async ({ page }) => {
    await page.goto(`${prefix}/tools/o-ring-grooves?keep=example#calculator`, {
      waitUntil: "networkidle",
    });
    await expect(page.getByLabel(label, { exact: true })).toHaveValue("3.55");
    await expect(page.locator("dl[aria-live]")).toContainText("2,84 mm");
    await expect(page.locator("figure")).toContainText("t 2,84");
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
    await expect.poll(() => new URL(page.url()).searchParams.get("cord")).toBe("3.55");
  });
}
