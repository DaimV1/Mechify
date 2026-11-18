import { test, expect } from "./support/fixtures.ts";

const fields = [
  { key: "D", id: "knik-D", section: "rond", value: "20" },
  { key: "dIn", id: "knik-d", section: "buis", value: "14" },
  { key: "b", id: "knik-b", section: "rechthoek", value: "40" },
  { key: "h", id: "knik-h", section: "rechthoek", value: "10" },
  { key: "a", id: "knik-a", section: "vierkant", value: "10" },
  { key: "t", id: "knik-koker-t", section: "koker", value: "3" },
  { key: "L", id: "knik-length", section: "rechthoek", value: "1000" },
];

for (const locale of ["nl", "en"] as const) {
  const route = `${locale === "en" ? "/en" : ""}/calculators/buckling`;
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  for (const field of fields) {
    test(`buckling ${field.key} preserves blank, clear, reload and recovery (${locale})`, async ({ page }) => {
      const query = new URLSearchParams({ section: field.section, keep: "sentinel", [field.key]: "" });
      await page.goto(`${route}?${query}#numeric-state`);
      const input = page.locator(`#${field.id}`);
      const copy = page.getByRole("button", { name: copyName, exact: true });
      const invalid = async () => {
        await expect(input).toHaveValue("");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAttribute("aria-describedby", `${field.id}-error`);
        await expect(page.locator(`#${field.id}-error`)).toBeVisible();
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
  }

  test(`buckling defaults, inactive fields and zero inner diameter (${locale})`, async ({ page }) => {
    const copy = page.getByRole("button", { name: copyName, exact: true });
    await page.goto(route);
    await expect(copy).toBeVisible();
    for (const field of fields) {
      await expect.poll(() => new URL(page.url()).searchParams.get(field.key)).toBe(field.value);
    }
    await page.goto(`${route}?section=buis&dIn=0&b=&h=&a=&t=&keep=sentinel#numeric-state`);
    await expect(copy).toBeVisible();
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    await page.reload();
    await expect(copy).toBeVisible();
    for (const key of ["b", "h", "a", "t"]) {
      expect(new URL(page.url()).searchParams.get(key)).toBe("");
    }
    await page.getByRole("combobox", { name: locale === "en" ? "Cross-section" : "Doorsnede", exact: true }).selectOption("vierkant");
    await expect(page.locator("#knik-a")).toHaveValue("");
    await expect(page.locator("#knik-a")).toHaveAttribute("aria-invalid", "true");
    await expect(copy).toHaveCount(0);
    await page.locator("#knik-a").fill("10");
    await expect(copy).toBeVisible();
  });

  test(`buckling blank length survives locale switch (${locale})`, async ({ page }) => {
    await page.goto(`${route}?L=&keep=sentinel#numeric-state`);
    await expect(page.locator("#knik-length")).toHaveAttribute("aria-invalid", "true");
    const nextLocale = locale === "nl" ? "en" : "nl";
    await page.locator('select[aria-label="Taal rekenhulp"], select[aria-label="Calculator language"]').selectOption(nextLocale);
    await expect(page).toHaveURL((url) => url.pathname === `${nextLocale === "en" ? "/en" : ""}/calculators/buckling`);
    await expect(page.locator("#knik-length-error")).toHaveText(nextLocale === "en" ? "Enter a valid number greater than 0." : "Vul een geldig getal groter dan 0 in.");
    await page.reload();
    await expect(page.locator("#knik-length")).toHaveValue("");
    await expect(page.locator("#knik-length")).toHaveAttribute("aria-invalid", "true");
    expect(new URL(page.url()).searchParams.get("L")).toBe("");
    expect(new URL(page.url()).searchParams.get("keep")).toBe("sentinel");
    expect(new URL(page.url()).hash).toBe("#numeric-state");
  });

  for (const raw of ["abc", "Infinity", "-1"]) {
    for (const field of fields) {
      test(`buckling ${field.key} retains ${raw} with associated error (${locale})`, async ({ page }) => {
        const query = new URLSearchParams({ section: field.section, [field.key]: raw });
        await page.goto(`${route}?${query}`);
        const input = page.locator(`#${field.id}`);
        const invalid = async () => {
          await expect(input).toHaveValue(raw);
          await expect(input).toHaveAttribute("aria-invalid", "true");
          await expect(input).toHaveAttribute("aria-describedby", `${field.id}-error`);
          await expect(page.locator(`#${field.id}-error`)).toBeVisible();
          await expect(page.getByRole("button", { name: copyName, exact: true })).toHaveCount(0);
          await expect.poll(() => new URL(page.url()).searchParams.get(field.key)).toBe(raw);
        };
        await invalid();
        await page.reload();
        await invalid();
      });
    }
  }

  test(`buckling dimensional boundaries and recovery (${locale})`, async ({ page }) => {
    const copy = page.getByRole("button", { name: copyName, exact: true });
    for (const example of [
      { query: "section=buis&D=20&dIn=20", id: "knik-d", value: "0" },
      { query: "section=koker&b=40&h=10&t=5", id: "knik-koker-t", value: "3" },
      { query: "section=koker&b=6&h=10&t=3", id: "knik-koker-t", value: "2" },
      { query: "L=0", id: "knik-length", value: "1000" },
    ]) {
      await page.goto(`${route}?${example.query}`);
      await expect(page.locator(`#${example.id}`)).toHaveAttribute("aria-invalid", "true");
      await expect(copy).toHaveCount(0);
      await page.locator(`#${example.id}`).fill(example.value);
      await expect(copy).toBeVisible();
    }
  });
}
