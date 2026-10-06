import { test, expect } from "./support/fixtures.ts";

const diameterTools = [
  {
    slug: "fit-tolerances",
    input: "#fit-diameter",
    query: "fit=H7%2Fg6",
    defaults: { fit: "H7/h6" },
  },
  {
    slug: "seeger-grooves",
    input: "#circlip-diameter",
    query: "kind=boring",
    defaults: { kind: "as" },
  },
  { slug: "keyways", input: "#key-diameter", query: "", defaults: {} },
  { slug: "bearing-fits", input: "#bearing-diameter", query: "", defaults: {} },
];

for (const locale of ["nl", "en"] as const) {
  test(`diameter-tool reset restores defaults and preserves preferences (${locale})`, async ({
    page,
  }) => {
    const prefix = locale === "en" ? "/en" : "";
    for (const tool of diameterTools) {
      await page.goto(`${prefix}/tools/${tool.slug}?d=35&${tool.query}`, {
        waitUntil: "networkidle",
      });
      await page.locator(tool.input).fill("40");
      await expect
        .poll(() => page.evaluate(() => sessionStorage.getItem("mechify-diameter")))
        .toBe("40");
      await page.evaluate(() => {
        sessionStorage.setItem("unrelated-preference", "keep");
        localStorage.setItem("unrelated-preference", "keep");
      });
      await page
        .getByRole("button", {
          name: locale === "en" ? "↺ Reset input" : "↺ Reset invoer",
          exact: true,
        })
        .click();
      await expect(page.locator(tool.input)).toHaveValue("20");
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      expect(new URL(page.url()).pathname).toBe(`${prefix}/tools/${tool.slug}`);
      for (const [key, value] of Object.entries(tool.defaults))
        await expect.poll(() => new URL(page.url()).searchParams.get(key)).toBe(value);
      expect(
        await page.evaluate(() => ({
          diameter: sessionStorage.getItem("mechify-diameter"),
          session: sessionStorage.getItem("unrelated-preference"),
          local: localStorage.getItem("unrelated-preference"),
          locale: localStorage.getItem("mechify-locale"),
        })),
      ).toEqual({ diameter: null, session: "keep", local: "keep", locale });
      await page.reload({ waitUntil: "networkidle" });
      await expect(page.locator(tool.input)).toHaveValue("20");
      const other = tool.slug === "fit-tolerances" ? diameterTools[1] : diameterTools[0];
      await page.goto(`${prefix}/tools/${other.slug}`, { waitUntil: "networkidle" });
      await expect(page.locator(other.input)).toHaveValue("20");
      await page.locator(other.input).fill("30");
      await page.goto(`${prefix}/tools/${tool.slug}`, { waitUntil: "networkidle" });
      await expect(page.locator(tool.input)).toHaveValue("30");
    }
  });
}

test("resetting another calculator leaves the remembered diameter intact", async ({ page }) => {
  await page.goto("/en/tools/fit-tolerances", { waitUntil: "networkidle" });
  await page.locator("#fit-diameter").fill("35");
  await page.goto("/en/calculators/shaft-diameter?t=100&tau=50", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "↺ Reset input", exact: true }).click();
  await expect(page.locator("#shaft-torque")).toHaveValue("50");
  await expect(page.locator("#shaft-tau-allow")).toHaveValue("40");
  expect(await page.evaluate(() => sessionStorage.getItem("mechify-diameter"))).toBe("35");
  await page.goto("/en/tools/seeger-grooves", { waitUntil: "networkidle" });
  await expect(page.locator("#circlip-diameter")).toHaveValue("35");
});
