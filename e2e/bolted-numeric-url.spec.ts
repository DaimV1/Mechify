import { test, expect } from "./support/fixtures.ts";

const fields = [
  { key: "fv", value: "20" },
  { key: "fz", value: "1" },
  { key: "phi", value: "0.25" },
  { key: "fa", value: "5" },
  { key: "fkreq", value: "10" },
];

for (const locale of ["nl", "en"] as const) {
  const route = `${locale === "en" ? "/en" : ""}/calculators/bolted-joint`;
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  for (const field of fields) {
    test(`bolted ${field.key} preserves blank, clear, reload and recovery (${locale})`, async ({ page }) => {
      await page.goto(`${route}?${field.key}=&keep=sentinel#numeric-state`);
      const input = page.locator(`#bolted-joint-${field.key}`);
      const copy = page.getByRole("button", { name: copyName, exact: true });
      const invalid = async () => {
        await expect(input).toHaveValue("");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAttribute("aria-describedby", `bolted-joint-${field.key}-error`);
        await expect(page.locator(`#bolted-joint-${field.key}-error`)).toBeVisible();
        await expect(copy).toHaveCount(0);
        await expect.poll(() => new URL(page.url()).searchParams.get(field.key)).toBe("");
        expect(new URL(page.url()).searchParams.get("keep")).toBe("sentinel");
        expect(new URL(page.url()).hash).toBe("#numeric-state");
      };
      await invalid();
      await page.reload();
      await invalid();
      await input.fill(field.value);
      await expect(copy).toBeVisible();
      await expect(input).not.toHaveAttribute("aria-invalid", "true");
      await input.fill("");
      await invalid();
      await page.reload();
      await invalid();
      await input.fill(field.value);
      await expect(copy).toBeVisible();
    });
    for (const raw of ["abc", "Infinity", "-1"]) {
      test(`bolted ${field.key} retains ${raw} with associated error (${locale})`, async ({ page }) => {
        await page.goto(`${route}?${field.key}=${raw}`);
        const input = page.locator(`#bolted-joint-${field.key}`);
        await expect(input).toHaveValue(raw);
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAttribute("aria-describedby", `bolted-joint-${field.key}-error`);
        await expect(page.locator(`#bolted-joint-${field.key}-error`)).toBeVisible();
        await expect(page.getByRole("button", { name: copyName, exact: true })).toHaveCount(0);
        await page.reload();
        await expect(input).toHaveValue(raw);
        await expect.poll(() => new URL(page.url()).searchParams.get(field.key)).toBe(raw);
      });
    }
  }

  test(`bolted defaults and actual locale switch (${locale})`, async ({ page }) => {
    await page.goto(route);
    for (const field of fields) await expect(page.locator(`#bolted-joint-${field.key}`)).toHaveValue(field.value);
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
    await page.goto(`${route}?fv=&keep=sentinel#numeric-state`);
    const nextLocale = locale === "nl" ? "en" : "nl";
    await page.locator('select[aria-label="Taal rekenhulp"], select[aria-label="Calculator language"]').selectOption(nextLocale);
    await expect(page).toHaveURL(new RegExp(`${nextLocale === "en" ? "/en" : ""}/calculators/bolted-joint\\?`));
    await expect(page.locator("#bolted-joint-fv-error")).toHaveText(nextLocale === "en" ? "Enter a valid number greater than 0." : "Vul een geldig getal groter dan 0 in.");
    await page.reload();
    await expect(page.locator("#bolted-joint-fv")).toHaveValue("");
    expect(new URL(page.url()).searchParams.get("keep")).toBe("sentinel");
    expect(new URL(page.url()).hash).toBe("#numeric-state");
  });

  test(`bolted valid zeros, factor endpoints and separated diagnostics (${locale})`, async ({ page }) => {
    const copy = page.getByRole("button", { name: copyName, exact: true });
    for (const query of ["fv=20&fz=0&phi=0&fa=0&fkreq=0", "fv=20&fz=0&phi=1&fa=0&fkreq=0", "fv=20&fz=20&phi=0.25&fa=5&fkreq=10", "fv=20&fz=1&phi=0.25&fa=100&fkreq=10"]) {
      await page.goto(`${route}?${query}`);
      await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
      await expect(copy).toBeVisible();
      if (query.includes("fz=20") || query.includes("fa=100")) {
        await expect(page.getByText(locale === "nl" ? /F_KR ≤ 0 — grens van loskomen/ : /F_KR ≤ 0 —/).first()).toBeVisible();
      }
    }
  });

  for (const example of [
    { key: "fv", raw: "0", recovery: "20" },
    { key: "fz", raw: "21", recovery: "20" },
    { key: "phi", raw: "1.01", recovery: "1" },
  ]) {
    test(`bolted ${example.key} boundary correction (${locale})`, async ({ page }) => {
      await page.goto(`${route}?${example.key}=${example.raw}`);
      const input = page.locator(`#bolted-joint-${example.key}`);
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByRole("button", { name: copyName, exact: true })).toHaveCount(0);
      await input.fill(example.recovery);
      await expect(input).not.toHaveAttribute("aria-invalid", "true");
      await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
    });
  }
}
