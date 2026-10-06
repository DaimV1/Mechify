import { test, expect } from "./support/fixtures.ts";
import type { Page, Locator } from "@playwright/test";

async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 60; step++) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

for (const locale of ["nl", "en"] as const) {
  for (const example of [
    { route: "shaft-diameter", input: "shaft-torque", key: "t", value: "0" },
    { route: "shaft-diameter", input: "shaft-tau-allow", key: "tau", value: "" },
    { route: "shaft-diameter", input: "shaft-d-check", key: "d", value: "bad", optional: true },
    { route: "motor-specification", input: "motor-diameter", key: "d", value: "bad" },
    ...["", "bad", "0", "-1"].flatMap((value) => [
      { route: "motor-specification", input: "motor-speed", key: "speed", value },
      { route: "motor-specification", input: "motor-fb", key: "fb", value },
    ]),
    { route: "motor-specification", input: "motor-mass", key: "mass", value: "" },
    { route: "motor-specification", input: "motor-eta", key: "eta", value: "1.1", eta: true },
    { route: "motor-specification", input: "motor-eta", key: "eta", value: "", eta: true },
  ]) {
    test(`restored ${example.input}=${example.value} has immediate feedback (${locale})`, async ({
      page,
    }) => {
      await page.goto(
        `${locale === "en" ? "/en" : ""}/calculators/${example.route}?${example.key}=${example.value}`,
        { waitUntil: "networkidle" },
      );
      const input = page.locator(`#${example.input}`);
      const correction = example.eta
        ? locale === "en"
          ? "Enter a number greater than 0 and at most 1."
          : "Vul een getal groter dan 0 en maximaal 1 in."
        : locale === "en"
          ? "Enter a number greater than 0."
          : "Vul een getal groter dan 0 in.";
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt) await page.reload({ waitUntil: "networkidle" });
        await expect(input).toHaveValue(example.value);
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAccessibleDescription(correction);
        await expect(page.locator(`#${example.input}-error`)).toBeVisible();
        expect(new URL(page.url()).searchParams.get(example.key)).toBe(example.value);
        const copy = page.getByRole("button", {
          name: locale === "en" ? "Copy result" : "Kopieer resultaat",
          exact: true,
        });
        if (example.optional) await expect(copy).toBeVisible();
        else await expect(copy).toHaveCount(0);
      }
      await input.fill(example.eta ? "0.85" : "40");
      await expect(input).not.toHaveAttribute("aria-invalid");
      await expect(page.locator(`#${example.input}-error`)).toHaveCount(0);
    });
  }

  for (const example of [
    { route: "shaft-diameter", input: "shaft-torque", query: "t=50&d=" },
    { route: "motor-specification", input: "motor-diameter", query: "d=100" },
    { route: "motor-specification", input: "motor-speed", query: "speed=30" },
    { route: "motor-specification", input: "motor-fb", query: "fb=1.2" },
  ]) {
    test(`valid shared input still delays first edit feedback (${locale}, ${example.input})`, async ({
      page,
    }) => {
      await page.goto(
        `${locale === "en" ? "/en" : ""}/calculators/${example.route}?${example.query}`,
        { waitUntil: "networkidle" },
      );
      await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
      if (example.input === "motor-fb") {
        await page
          .locator("summary")
          .filter({ hasText: locale === "en" ? "Advanced (" : "Geavanceerd (" })
          .click();
      }
      const input = page.locator(`#${example.input}`);
      await input.fill("bad");
      await expect(input).not.toHaveAttribute("aria-invalid");
      await input.press("Tab");
      await expect(input).toHaveAttribute("aria-invalid", "true");
    });
  }

  for (const example of [
    { route: "shaft-diameter", input: "shaft-torque", corrected: "50", expected: "d_min" },
    { route: "motor-specification", input: "motor-diameter", corrected: "100", expected: "P=" },
  ]) {
    test(`field correction and result copy work by keyboard (${locale}, ${example.route})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(`${locale === "en" ? "/en" : ""}/calculators/${example.route}`, {
        waitUntil: "networkidle",
      });
      const input = page.locator(`#${example.input}`);
      const error = page.locator(`#${example.input}-error`);
      const correction =
        locale === "en" ? "Enter a number greater than 0." : "Vul een getal groter dan 0 in.";
      await expect(input).not.toHaveAttribute("aria-invalid");
      await tabTo(page, input);
      await page.keyboard.type("0");
      await expect(error).toHaveCount(0);
      await page.keyboard.press("Tab");
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(input).toHaveAttribute("aria-describedby", `${example.input}-error`);
      await expect(input).toHaveAccessibleDescription(correction);
      await expect(error).toBeVisible();
      await expect(error).not.toHaveAttribute("role", "alert");
      await expect(error).not.toHaveAttribute("aria-live");
      await page.keyboard.press("Shift+Tab");
      await expect(input).toBeFocused();
      await page.keyboard.type(example.corrected);
      await expect(error).toHaveCount(0);
      await expect(input).not.toHaveAttribute("aria-invalid");
      await expect(input).not.toHaveAttribute("aria-describedby");
      const copy = page.getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      });
      await tabTo(page, copy);
      await page.keyboard.press("Enter");
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).not.toBe("");
      if (example.expected)
        expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
          example.expected,
        );
    });
  }

  test(`motor efficiency correction enforces the existing upper bound (${locale})`, async ({
    page,
  }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/calculators/motor-specification`, {
      waitUntil: "networkidle",
    });
    const summary = page
      .locator("summary")
      .filter({ hasText: locale === "en" ? "Advanced (" : "Geavanceerd (" });
    await tabTo(page, summary);
    await page.keyboard.press("Enter");
    const input = page.locator("#motor-eta");
    await tabTo(page, input);
    await page.keyboard.type("1.1");
    await expect(page.locator("#motor-eta-error")).toHaveCount(0);
    await page.keyboard.press("Tab");
    await expect(input).toHaveAccessibleDescription(
      locale === "en"
        ? "Enter a number greater than 0 and at most 1."
        : "Vul een getal groter dan 0 en maximaal 1 in.",
    );
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.type("1");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(
      page.getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      }),
    ).toBeVisible();
  });

  test(`optional shaft diameter stays quiet when blank (${locale})`, async ({ page }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/calculators/shaft-diameter`, {
      waitUntil: "networkidle",
    });
    const input = page.locator("#shaft-d-check");
    await tabTo(page, input);
    await page.keyboard.press("Tab");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.type("bad");
    await page.keyboard.press("Tab");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Backspace");
    await expect(input).not.toHaveAttribute("aria-invalid");
  });
}
