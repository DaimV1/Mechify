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
  for (const value of ["", "bad", "0", "-1", "3150.1", "1e309"]) {
    test(`restored fit diameter=${value} has immediate feedback (${locale})`, async ({ page }) => {
      await page.goto(
        `${locale === "en" ? "/en" : ""}/tools/fit-tolerances?d=${value}&fit=H7%2Fh6`,
        { waitUntil: "networkidle" },
      );
      const input = page.locator("#fit-diameter");
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt) await page.reload({ waitUntil: "networkidle" });
        await expect(input).toHaveValue(value);
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAccessibleDescription(
          value === "3150.1"
            ? locale === "en"
              ? "Enter a nominal Ø no greater than 3150 mm."
              : "Vul een nominale Ø van maximaal 3150 mm in."
            : locale === "en"
              ? "Enter a nominal Ø greater than 0."
              : "Vul een nominale Ø groter dan 0 in.",
        );
        expect(new URL(page.url()).searchParams.get("d")).toBe(value);
        await expect(page.getByText(/NaN|Infinity|∞/)).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: locale === "en" ? "Copy result" : "Kopieer resultaat",
            exact: true,
          }),
        ).toHaveCount(0);
      }
      await input.fill("20");
      await expect(input).not.toHaveAttribute("aria-invalid");
      await expect(page.locator("#fit-diameter-error")).toHaveCount(0);
    });
  }

  test(`valid shared fit diameter delays first edit feedback (${locale})`, async ({ page }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/fit-tolerances?d=20&fit=H7%2Fh6`, {
      waitUntil: "networkidle",
    });
    const input = page.locator("#fit-diameter");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await input.fill("bad");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await input.press("Tab");
    await expect(input).toHaveAttribute("aria-invalid", "true");
  });

  test(`missing fit diameter uses its normal default without an error (${locale})`, async ({
    page,
  }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/fit-tolerances`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("#fit-diameter")).not.toHaveAttribute("aria-invalid");
    await expect(page.locator("#fit-diameter-error")).toHaveCount(0);
  });

  for (const example of [
    { route: "shaft-diameter", input: "shaft-torque", key: "t", value: "0" },
    { route: "shaft-diameter", input: "shaft-tau-allow", key: "tau", value: "" },
    { route: "shaft-diameter", input: "shaft-d-check", key: "d", value: "bad", optional: true },
    { route: "motor-specification", input: "motor-diameter", key: "d", value: "bad" },
    ...["", "bad", "0", "-1"].flatMap((value) => [
      { route: "motor-specification", input: "motor-speed", key: "speed", value },
      { route: "motor-specification", input: "motor-fb", key: "fb", value },
      { route: "bearing-life", input: "bearing-life-C", key: "C", value },
      { route: "bearing-life", input: "bearing-life-P", key: "P", value },
      { route: "bearing-life", input: "bearing-life-rpm", key: "n", value },
      { route: "pneumatic-cylinder", input: "pneu-force", key: "f", value },
      { route: "pneumatic-cylinder", input: "pneu-pressure", key: "p", value },
      { route: "fasteners", input: "fastener-k", key: "k", value },
      ...(value === ""
        ? []
        : [
            { route: "bearing-life", input: "bearing-life-C0", key: "C0", value, optional: true },
            { route: "bearing-life", input: "bearing-life-P0", key: "P0", value, optional: true },
          ]),
    ]),
    {
      route: "bearing-life",
      input: "bearing-life-C0",
      key: "C0",
      value: "",
      query: "C0=&P0=3",
      optional: true,
    },
    {
      route: "bearing-life",
      input: "bearing-life-P0",
      key: "P0",
      value: "",
      query: "C0=8&P0=",
      optional: true,
    },
    { route: "motor-specification", input: "motor-mass", key: "mass", value: "" },
    { route: "motor-specification", input: "motor-eta", key: "eta", value: "1.1", eta: true },
    { route: "motor-specification", input: "motor-eta", key: "eta", value: "", eta: true },
    {
      route: "pneumatic-cylinder",
      input: "pneu-stroke",
      key: "l",
      value: "bad",
      optional: true,
    },
    {
      route: "pneumatic-cylinder",
      input: "pneu-efficiency",
      key: "eta",
      value: "1.1",
      optional: true,
      eta: true,
    },
    {
      route: "pneumatic-cylinder",
      input: "pneu-cycles",
      key: "cpm",
      value: "bad",
      optional: true,
    },
  ]) {
    test(`restored ${example.input}=${example.value} has immediate feedback (${locale})`, async ({
      page,
    }) => {
      const query = "query" in example ? example.query : `${example.key}=${example.value}`;
      await page.goto(
        `${locale === "en" ? "/en" : ""}/${example.route === "fasteners" ? "tools" : "calculators"}/${example.route}?${query}`,
        {
          waitUntil: "networkidle",
        },
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
    { route: "bearing-life", input: "bearing-life-C", query: "C=10" },
    { route: "bearing-life", input: "bearing-life-P", query: "P=2" },
    { route: "bearing-life", input: "bearing-life-rpm", query: "n=1500" },
    { route: "pneumatic-cylinder", input: "pneu-force", query: "f=1000" },
    { route: "pneumatic-cylinder", input: "pneu-pressure", query: "p=6" },
    { route: "fasteners", input: "fastener-k", query: "k=0.2" },
    { route: "bearing-life", input: "bearing-life-C0", query: "C0=8&P0=3" },
    { route: "bearing-life", input: "bearing-life-P0", query: "C0=8&P0=3" },
  ]) {
    test(`valid shared input still delays first edit feedback (${locale}, ${example.input})`, async ({
      page,
    }) => {
      await page.goto(
        `${locale === "en" ? "/en" : ""}/${example.route === "fasteners" ? "tools" : "calculators"}/${example.route}?${example.query}`,
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
    { route: "bearing-life", input: "bearing-life-C", corrected: "10", expected: "L10 =" },
    {
      route: "pneumatic-cylinder",
      input: "pneu-force",
      corrected: "1000",
      expected: "Ø50 mm",
    },
    { route: "fasteners", input: "fastener-k", corrected: "0.2", expected: "N·m" },
  ]) {
    test(`field correction and result copy work by keyboard (${locale}, ${example.route})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto(
        `${locale === "en" ? "/en" : ""}/${example.route === "fasteners" ? "tools" : "calculators"}/${example.route}`,
        {
          waitUntil: "networkidle",
        },
      );
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

  test(`optional cylinder panels stay quiet until opened (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${locale === "en" ? "/en" : ""}/calculators/pneumatic-cylinder`, {
      waitUntil: "networkidle",
    });
    const bucklingToggle = page.locator('button[aria-controls="pneu-buckling-panel"]');
    const airToggle = page.locator('button[aria-controls="pneu-air-panel"]');
    await expect(bucklingToggle).toHaveAttribute("aria-expanded", "false");
    await expect(airToggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#pneu-buckling-panel, #pneu-air-panel")).toHaveCount(0);
    await tabTo(page, bucklingToggle);
    await page.keyboard.press("Enter");
    await expect(bucklingToggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#pneu-stroke")).not.toHaveAttribute("aria-invalid");
    await tabTo(page, airToggle);
    await page.keyboard.press("Enter");
    await expect(airToggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#pneu-air-stroke, #pneu-efficiency, #pneu-cycles")).toHaveCount(3);
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  });

  test(`invalid shared cylinder stroke exposes both dependent sections (${locale})`, async ({
    page,
  }) => {
    await page.goto(
      `${locale === "en" ? "/en" : ""}/calculators/pneumatic-cylinder?f=1000&p=6&l=bad`,
      { waitUntil: "networkidle" },
    );
    for (const id of ["pneu-stroke", "pneu-air-stroke"]) {
      await expect(page.locator(`#${id}`)).toHaveValue("bad");
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator(`#${id}`)).toHaveAccessibleDescription(
        locale === "en" ? "Enter a number greater than 0." : "Vul een getal groter dan 0 in.",
      );
    }
    await expect(page.locator("#pneu-buckling-panel, #pneu-air-panel")).toHaveCount(2);
  });

  test(`cylinder stroke validation stays synchronized across both controls (${locale})`, async ({
    page,
  }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/calculators/pneumatic-cylinder`, {
      waitUntil: "networkidle",
    });
    await page
      .getByRole("button", {
        name:
          locale === "en"
            ? "Rod buckling check (optional)"
            : "Uitknikcontrole zuigerstang (optioneel)",
      })
      .click();
    await page
      .getByRole("button", {
        name:
          locale === "en"
            ? "Efficiency and air consumption (optional)"
            : "Rendement en luchtverbruik (optioneel)",
      })
      .click();
    await page.locator("#pneu-stroke").fill("");
    await page.locator("#pneu-stroke").blur();
    for (const id of ["pneu-stroke", "pneu-air-stroke"]) {
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator(`#${id}`)).toHaveAccessibleDescription(
        locale === "en" ? "Enter a number greater than 0." : "Vul een getal groter dan 0 in.",
      );
    }
  });

  test(`valid shared cylinder stroke delays synchronized feedback (${locale})`, async ({
    page,
  }) => {
    await page.goto(
      `${locale === "en" ? "/en" : ""}/calculators/pneumatic-cylinder?f=1000&p=6&l=300`,
      { waitUntil: "networkidle" },
    );
    await page
      .getByRole("button", {
        name:
          locale === "en"
            ? "Rod buckling check (optional)"
            : "Uitknikcontrole zuigerstang (optioneel)",
      })
      .click();
    await page
      .getByRole("button", {
        name:
          locale === "en"
            ? "Efficiency and air consumption (optional)"
            : "Rendement en luchtverbruik (optioneel)",
      })
      .click();
    const bucklingStroke = page.locator("#pneu-stroke");
    const airStroke = page.locator("#pneu-air-stroke");
    await bucklingStroke.fill("");
    await expect(bucklingStroke).not.toHaveAttribute("aria-invalid");
    await expect(airStroke).not.toHaveAttribute("aria-invalid");
    await bucklingStroke.blur();
    await expect(bucklingStroke).toHaveAttribute("aria-invalid", "true");
    await expect(airStroke).toHaveAttribute("aria-invalid", "true");
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

  test(`optional bearing static pair stays quiet when both are blank (${locale})`, async ({
    page,
  }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/calculators/bearing-life?C0=&P0=`, {
      waitUntil: "networkidle",
    });
    for (const inputId of ["bearing-life-C0", "bearing-life-P0"]) {
      const input = page.locator(`#${inputId}`);
      await expect(input).toHaveValue("");
      await expect(input).not.toHaveAttribute("aria-invalid");
      await expect(page.locator(`#${inputId}-error`)).toHaveCount(0);
    }
  });
}
