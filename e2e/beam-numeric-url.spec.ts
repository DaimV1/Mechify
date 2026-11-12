import { test, expect } from "./support/fixtures.ts";

const fields = [
  { key: "D", id: "beam-D", section: "rond", value: "20" },
  { key: "dIn", id: "beam-d", section: "buis", value: "14" },
  { key: "b", id: "beam-b", section: "rechthoek", value: "40" },
  { key: "h", id: "beam-h", section: "rechthoek", value: "10" },
  { key: "a", id: "beam-side", section: "vierkant", value: "10" },
  { key: "t", id: "beam-koker-t", section: "koker", value: "3" },
  { key: "L", id: "beam-L", section: "rechthoek", value: "1000" },
  { key: "posA", id: "beam-a", section: "rechthoek", value: "500" },
  { key: "f", id: "beam-force", section: "rechthoek", value: "500" },
  { key: "w", id: "beam-udl", section: "rechthoek", value: "1" },
];

for (const locale of ["nl", "en"] as const) {
  const route = `${locale === "en" ? "/en" : ""}/calculators/beam-deflection`;
  const copyName = locale === "en" ? "Copy result" : "Kopieer resultaat";
  for (const field of fields) {
    test(`beam ${field.key} preserves blank, clear, reload and recovery (${locale})`, async ({ page }) => {
      const query = new URLSearchParams({ section: field.section, loadKind: field.key === "w" ? "verdeeld" : "puntlast", keep: "sentinel", [field.key]: "" });
      await page.goto(`${route}?${query}#numeric-state`);
      const input = page.locator(`#${field.id}`);
      const copy = page.getByRole("button", { name: copyName, exact: true });
      const invalid = async () => {
        await expect(input).toHaveValue("");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAttribute("aria-describedby", `${field.id}-error`);
        await expect(page.locator(`#${field.id}-error`)).toBeVisible();
        await expect(copy).toHaveCount(0);
        await expect(page.locator('a[href^="/calculators/buckling?"]')).toHaveCount(0);
        await expect(page.getByText(locale === "en" ? "Enter valid beam data to show the diagram." : "Vul geldige balkgegevens in om het schema te tonen.", { exact: true })).toBeVisible();
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

  test(`beam defaults, inactive fields and zero boundaries (${locale})`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
    for (const field of fields) {
      await expect.poll(() => new URL(page.url()).searchParams.get(field.key)).toBe(field.value);
    }
    await page.goto(`${route}?section=buis&dIn=0&f=0&b=&h=&a=&t=&w=`);
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    await page.locator("#beam-load-kind").selectOption("verdeeld");
    await expect(page.locator("#beam-udl")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#beam-udl").fill("0");
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
    await page.goto(`${route}?loadKind=verdeeld&w=0&f=&posA=&D=&dIn=&a=&t=`);
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
    for (const key of ["f", "posA", "D", "dIn", "a", "t"]) {
      expect(new URL(page.url()).searchParams.get(key)).toBe("");
    }
  });

  test(`beam blank load survives locale switch (${locale})`, async ({ page }) => {
    await page.goto(`${route}?f=&keep=sentinel#numeric-state`);
    await expect(page.locator("#beam-force")).toHaveAttribute("aria-invalid", "true");
    const nextLocale = locale === "nl" ? "en" : "nl";
    const current = new URL(page.url());
    await page.goto(`${nextLocale === "en" ? "/en" : ""}/calculators/beam-deflection${current.search}${current.hash}`);
    await expect(page.locator("#beam-force-error")).toHaveText(nextLocale === "en" ? "Enter a valid number of 0 or greater." : "Vul een geldig getal van 0 of groter in.");
    await page.reload();
    await expect(page.locator("#beam-force")).toHaveValue("");
    await expect(page.locator("#beam-force")).toHaveAttribute("aria-invalid", "true");
    expect(new URL(page.url()).searchParams.get("f")).toBe("");
    expect(new URL(page.url()).searchParams.get("keep")).toBe("sentinel");
    expect(new URL(page.url()).hash).toBe("#numeric-state");
  });

  test(`beam malformed and domain errors stay associated (${locale})`, async ({ page }) => {
    test.setTimeout(90_000);
    for (const raw of ["abc", "Infinity", "-1"]) {
      for (const field of fields) {
        const query = new URLSearchParams({ section: field.section, loadKind: field.key === "w" ? "verdeeld" : "puntlast", [field.key]: raw });
        await page.goto(`${route}?${query}`);
        await expect(page.locator(`#${field.id}`)).toHaveValue(raw);
        await expect(page.locator(`#${field.id}`)).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByRole("button", { name: copyName, exact: true })).toHaveCount(0);
        await page.reload();
        await expect.poll(() => new URL(page.url()).searchParams.get(field.key)).toBe(raw);
      }
    }
    for (const example of [
      { query: "section=buis&D=20&dIn=20", id: "beam-d" },
      { query: "section=koker&b=40&h=10&t=5", id: "beam-koker-t" },
      { query: "type=opgelegd&L=1000&posA=1000", id: "beam-a" },
    ]) {
      await page.goto(`${route}?${example.query}`);
      await expect(page.locator(`#${example.id}`)).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByRole("button", { name: copyName, exact: true })).toHaveCount(0);
    }
    await page.goto(`${route}?type=uitkraging&L=1000&posA=1000`);
    await expect(page.getByRole("button", { name: copyName, exact: true })).toBeVisible();
  });
}
