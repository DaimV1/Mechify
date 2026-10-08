import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  const route = `${locale === "en" ? "/en" : ""}/calculators/shaft-diameter`;
  test(`hollow shaft independent benchmark, export and reload (${locale})`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${route}?t=50&tau=40&do=20&di=10#tool`, { waitUntil: "networkidle" });
    const advanced = page.locator("details").filter({ has: page.locator("#shaft-outer") });
    await expect(advanced).toHaveAttribute("open", "");
    await expect(advanced).toContainText(locale === "en" ? "33.95 N/mm²" : "33,95 N/mm²");
    await expect(advanced).toContainText(locale === "en" ? "1.18" : "1,18");
    await page
      .getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      })
      .click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("Dₒ=20 mm, Dᵢ=10 mm");
    expect(copied).toContain(locale === "en" ? "no local buckling" : "geen lokale plooi");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("#shaft-inner")).toHaveValue("10");
    expect(new URL(page.url()).hash).toBe("#tool");
    await page.locator("#shaft-outer").fill("5");
    await page.locator("#shaft-outer").blur();
    await expect(page.locator("#shaft-inner")).toHaveAttribute("aria-invalid", "true");
    await expect(advanced.locator("dd")).toHaveCount(0);
  });

  for (const inner of ["", "bad", "-1", "20", "21"]) {
    test(`invalid hollow shared inside diameter=${inner} stays invalid (${locale})`, async ({
      page,
    }) => {
      await page.goto(`${route}?t=50&tau=40&do=20&di=${inner}`, { waitUntil: "networkidle" });
      const advanced = page.locator("details").filter({ has: page.locator("#shaft-inner") });
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt) await page.reload({ waitUntil: "networkidle" });
        await expect(page.locator("#shaft-inner")).toHaveValue(inner);
        await expect(page.locator("#shaft-inner")).toHaveAttribute("aria-invalid", "true");
        await expect(page.locator("#shaft-inner")).toHaveAccessibleDescription(
          locale === "en"
            ? "Enter a number from 0 to less than the outside diameter."
            : "Vul een getal van 0 tot kleiner dan de buitendiameter in.",
        );
        await expect(advanced.locator("dd")).toHaveCount(0);
      }
    });
  }
}
