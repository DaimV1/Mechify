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
    await expect(assembly.locator(".assembly-parts li")).toHaveCount(6);
    await expect(assembly.locator(".assembly-path")).toContainText(
      locale === "en" ? "sun = input" : "zonnewiel = ingang",
    );
    const sun = assembly.getByRole("button", { name: /Zonnewiel|Sun gear/ });
    await sun.click();
    await expect(sun).toHaveAttribute("aria-pressed", "true");
  });
}

test("retains planetary hero evidence at compact, mid and exploded views", async ({
  page,
}, testInfo) => {
  const mobile = testInfo.project.name === "mobile";
  const width = mobile ? 320 : 1440;
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const assembly = page.locator(".assembly");
  const slider = assembly.getByRole("slider");
  await expect(assembly).toHaveAttribute("data-render-status", "ready");
  if (mobile) {
    const overflowDiagnostics = await page.evaluate(() => {
      const viewportWidth = Math.min(
        document.documentElement.clientWidth,
        window.visualViewport?.width ?? Number.POSITIVE_INFINITY,
      );
      return {
        documentClientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        viewportWidth,
        overflowers: Array.from(document.querySelectorAll<HTMLElement>("body *"))
          .map((element) => {
            const bounds = element.getBoundingClientRect();
            return {
              element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${
                element.classList.length ? `.${Array.from(element.classList).join(".")}` : ""
              }`,
              left: Math.round(bounds.left * 10) / 10,
              right: Math.round(bounds.right * 10) / 10,
              width: Math.round(bounds.width * 10) / 10,
            };
          })
          .filter(({ left, right }) => left < -0.5 || right > viewportWidth + 0.5)
          .slice(0, 20),
      };
    });
    await testInfo.attach("planetary-320px-overflow-diagnostics", {
      body: Buffer.from(JSON.stringify(overflowDiagnostics, null, 2)),
      contentType: "application/json",
    });
    await testInfo.attach("planetary-320px-overflow-viewport", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  }
  await expect
    .poll(() =>
      page.evaluate(() => {
        const root = document.querySelector(".assembly")?.getBoundingClientRect();
        const controls = document.querySelector(".assembly-controls")?.getBoundingClientRect();
        const viewportWidth = Math.min(
          document.documentElement.clientWidth,
          window.visualViewport?.width ?? Number.POSITIVE_INFINITY,
        );
        return {
          documentFits:
            document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          assemblyFits: Boolean(root && root.left >= 0 && root.right <= viewportWidth),
          controlsFit: Boolean(controls && controls.left >= 0 && controls.right <= viewportWidth),
        };
      }),
    )
    .toEqual({ documentFits: true, assemblyFits: true, controlsFit: true });

  for (const value of [0, 50, 100]) {
    await slider.fill(String(value));
    await expect(slider).toHaveValue(String(value));
    await expect(assembly.locator("canvas")).toHaveAttribute("data-fit", "true");
    await slider.evaluate((element) => (element as HTMLElement).blur());
    if (mobile) {
      await assembly.locator(".assembly-stage").evaluate((element) => {
        const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
        const target = window.scrollY + element.getBoundingClientRect().top - header - 8;
        window.scrollTo(0, target);
      });
    }
    await testInfo.attach(`planetary-${width}px-${value}pct-${mobile ? "viewport" : "assembly"}`, {
      body: mobile ? await page.screenshot() : await assembly.screenshot(),
      contentType: "image/png",
    });
  }

  if (mobile) {
    const metrics = await page.evaluate(() => {
      const rect = (selector: string) => {
        const bounds = document.querySelector(selector)?.getBoundingClientRect();
        return bounds
          ? { left: bounds.left, right: bounds.right, width: bounds.width, top: bounds.top }
          : null;
      };
      const active = document.activeElement as HTMLElement | null;
      return {
        innerWidth: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        visualViewport: window.visualViewport
          ? { width: window.visualViewport.width, scale: window.visualViewport.scale }
          : null,
        assembly: rect(".assembly"),
        controls: rect(".assembly-controls"),
        slider: rect(".assembly-slider input"),
        activeElement: active
          ? { tag: active.tagName, id: active.id, className: active.className }
          : null,
      };
    });
    await testInfo.attach("planetary-320px-layout-metrics", {
      body: Buffer.from(JSON.stringify(metrics, null, 2)),
      contentType: "application/json",
    });
    await assembly.locator(".assembly-explanation").evaluate((element) => {
      const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const target = window.scrollY + element.getBoundingClientRect().top - header - 8;
      window.scrollTo(0, target);
    });
    await testInfo.attach("planetary-320px-details-viewport", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  }
});

test("schematic respects reduced motion and remains usable at 320 px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  const assembly = page.locator(".assembly");
  await expect(assembly).toHaveAttribute("data-render-status", "ready");
  await expect(assembly.getByRole("slider")).toHaveValue("65");
  await expect(assembly.locator(".assembly-parts li")).toHaveCount(6);
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
  await expect(assembly.getByRole("button")).toHaveCount(9);
  for (const button of await assembly.getByRole("button").all())
    await expect(button).toBeDisabled();
  await expect(assembly.locator(".assembly-fallback-note")).toHaveText(
    "Statisch schema — interactieve bediening is niet beschikbaar.",
  );
});

test("schematic can unmount and remount without page errors", async ({ page, consoleErrors }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".assembly")).toHaveAttribute("data-render-status", "ready");
  await page.goto("/toolkit", { waitUntil: "networkidle" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".assembly")).toHaveAttribute("data-render-status", "ready");
  expect(consoleErrors).toEqual([]);
});
