import { test, expect } from "./support/fixtures.ts";

for (const locale of ["nl", "en"] as const) {
  test(`homepage schematic has explicit synchronized controls (${locale})`, async ({ page }) => {
    await page.goto(locale === "en" ? "/en" : "/", { waitUntil: "networkidle" });
    const assembly = page.locator(".assembly");
    await expect(assembly).toHaveAttribute("data-render-status", "ready");
    const slider = assembly.getByRole("slider");
    await expect(slider).toHaveValue("65");

    await assembly.getByRole("button", { name: locale === "en" ? "Compact" : "Compact" }).click();
    await expect(slider).toHaveValue("0");
    await expect(assembly.locator("canvas")).toHaveAttribute("data-fit", "true");
    await expect(slider).toHaveAttribute("aria-valuetext", "Compact");
    await slider.fill("50");
    await expect(slider).toHaveValue("50");
    await expect(assembly.locator("canvas")).toHaveAttribute("data-fit", "true");
    await assembly
      .getByRole("button", { name: locale === "en" ? "Exploded" : "Uit elkaar" })
      .click();
    await expect(slider).toHaveValue("100");
    await expect(assembly.locator("canvas")).toHaveAttribute("data-fit", "true");
    await expect(slider).toHaveAttribute(
      "aria-valuetext",
      locale === "en" ? "Fully exploded" : "Volledig uit elkaar",
    );
    await assembly.getByRole("button", { name: locale === "en" ? "Reset" : "Herstel" }).click();
    await expect(slider).toHaveValue("65");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("66");

    await page.evaluate(() => window.scrollTo(0, 900));
    await expect(slider).toHaveValue("66");
    await expect(assembly.locator(".assembly-parts li")).toHaveCount(4);
    await expect(assembly.locator(".assembly-path")).toContainText(
      locale === "en" ? "continuous output shaft" : "doorgaande uitgaande as",
    );
  });
}

test("schematic respects reduced motion and remains usable at 320 px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  const assembly = page.locator(".assembly");
  await expect(assembly).toHaveAttribute("data-render-status", "ready");
  await expect(assembly.getByRole("slider")).toHaveValue("65");
  await expect(assembly.locator(".assembly-parts li")).toHaveCount(4);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const root = document.querySelector(".assembly");
        return root ? root.scrollWidth <= root.clientWidth : false;
      }),
    )
    .toBe(true);
});

test("static fallback remains and controls stay unavailable when renderer fails", async ({
  page,
}) => {
  await page.route("**/assembly.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "networkidle" });
  const assembly = page.locator(".assembly");
  await expect(assembly).toHaveAttribute("data-render-status", "fallback");
  await expect(assembly.locator(".assembly-fallback")).toBeVisible();
  await expect(assembly.locator("canvas")).toHaveAttribute("aria-hidden", "true");
  await expect(assembly.getByRole("slider")).toBeDisabled();
  await expect(assembly.getByRole("button")).toHaveCount(3);
  for (const button of await assembly.getByRole("button").all())
    await expect(button).toBeDisabled();
  await expect(assembly.getByRole("status")).toContainText("Statisch schema");
});

test("schematic can unmount and remount without page errors", async ({ page, consoleErrors }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".assembly")).toHaveAttribute("data-render-status", "ready");
  await page.goto("/toolkit", { waitUntil: "networkidle" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".assembly")).toHaveAttribute("data-render-status", "ready");
  expect(consoleErrors).toEqual([]);
});
