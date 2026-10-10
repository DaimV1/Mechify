import { test, expect } from "./support/fixtures.ts";

test("bearing shared blank stays invalid after reload", async ({ page }) => {
  await page.goto("/en/calculators/bearing-life?C=10&P=2&n=1500");
  await page.locator("#bearing-life-C").fill("");
  await expect(page).toHaveURL(/[?&]C=&/);
  await page.reload();
  await expect(page.locator("#bearing-life-C")).toHaveValue("");
  await expect(
    page.getByText("Enter C, P and the speed (all greater than 0).", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("L10 (basic)", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy result", exact: true })).toHaveCount(0);
});

test("bearing numerical result and warnings survive copy", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/calculators/bearing-life?C=4&P=2&n=12000&C0=1&P0=2");
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^L10 = 8(?:[,.]00)? x 10\^6 rev \(11 h\)$/m);
  expect(copied).toMatch(/S0 = C0\/P0 = 0[,.]5(?:0)?/);
  expect(copied).toMatch(/speed|Speed/);
  expect(copied).toContain("static load exceeds the recommended lower bound");
});

test("cylinder copy retains calculated force and column-capacity limitation", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=6&l=10");
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Recommended bore: Ø50 mm");
  expect(copied).toMatch(/^Extend force 1[., ]?178 N$/m);
  expect(copied).toContain("blocked/stalled case");
  expect(copied).toContain("not a verified column capacity");
});

test("cylinder shared blank force stays invalid after reload", async ({ page }) => {
  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=6");
  await page.locator("#pneu-force").fill("");
  await expect(page).toHaveURL(/[?&]f=&/);
  await page.reload();
  await expect(page.locator("#pneu-force")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Copy result", exact: true })).toHaveCount(0);
});

test("cylinder invalid shared pressure does not label fallback table forces as input values", async ({
  page,
}) => {
  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=bad", {
    waitUntil: "networkidle",
  });
  await expect(page.locator("#pneu-pressure")).toHaveValue("bad");
  await expect(page.getByRole("columnheader", { name: "Extend force @ — bar" })).toBeVisible();
  await expect(page.locator("table.ref-table tbody tr").first().locator("td").last()).toHaveText(
    "—",
  );
  await expect(page.getByText("bad bar", { exact: false })).toHaveCount(0);
});

test("cylinder suppresses overflowing pressure results without imposing a force limit", async ({
  page,
}) => {
  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=1e308", {
    waitUntil: "networkidle",
  });
  await expect(page.locator("#pneu-pressure")).toHaveAccessibleDescription(
    "Enter a smaller number.",
  );
  await expect(page.getByRole("button", { name: "Copy result", exact: true })).toHaveCount(0);
  await expect(page.getByText(/Infinity|∞|NaN/)).toHaveCount(0);
  await expect(page.locator("table.ref-table tbody tr").first().locator("td").last()).toHaveText(
    "—",
  );

  await page.goto("/en/calculators/pneumatic-cylinder?f=1e308&p=6", {
    waitUntil: "networkidle",
  });
  await expect(page.getByText(/No standard bore/)).toBeVisible();
  await expect(page.locator("#pneu-force")).not.toHaveAttribute("aria-invalid");
});

test("cylinder suppresses overflowing optional results and copied details", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=6&l=1e308", {
    waitUntil: "networkidle",
  });
  await expect(page.locator("#pneu-stroke")).toHaveAccessibleDescription("Enter a smaller number.");
  await expect(page.locator("#pneu-air-stroke")).toHaveAccessibleDescription(
    "Enter a smaller number.",
  );
  await expect(page.getByText("Effective extend force (with friction)")).toBeVisible();
  await expect(page.getByText(/Infinity|∞|NaN/)).toHaveCount(0);
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  let copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).not.toContain("Rod buckling");
  expect(copied).not.toContain("Air consumption:");

  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=6&cpm=1e308", {
    waitUntil: "networkidle",
  });
  await expect(page.locator("#pneu-cycles")).toHaveAccessibleDescription("Enter a smaller number.");
  await expect(page.getByText(/Infinity|∞|NaN/)).toHaveCount(0);
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Efficiency eta=0.9");
  expect(copied).not.toContain("Air consumption:");
});

test("cylinder accepts efficiency boundary eta=1", async ({ page }) => {
  await page.goto("/en/calculators/pneumatic-cylinder?f=1000&p=6&eta=1", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Efficiency and air consumption (optional)" }).click();
  await expect(page.locator("#pneu-efficiency")).toHaveValue("1");
  await expect(page.locator("#pneu-efficiency")).not.toHaveAttribute("aria-invalid");
  await expect(page.getByText("Effective extend force (with friction)")).toBeVisible();
});

test("fastener blank nut factor survives reload without hiding reference dimensions", async ({
  page,
}) => {
  await page.goto("/en/tools/fasteners?k=0.2#tool", { waitUntil: "networkidle" });
  await page.locator("#fastener-k").fill("");
  await expect.poll(() => new URL(page.url()).searchParams.get("k")).toBe("");
  expect(new URL(page.url()).hash).toBe("#tool");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("#fastener-k")).toHaveValue("");
  await expect(page.locator("#fastener-k")).toHaveAccessibleDescription(
    "Enter a number greater than 0.",
  );
  await expect(page.getByText("Clearance medium", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy result", exact: true })).toHaveCount(0);
});

test("fastener overflow suppresses only torque outputs and exports", async ({ page }) => {
  await page.goto("/en/tools/fasteners?k=1e308", { waitUntil: "networkidle" });
  await expect(page.locator("#fastener-k")).toHaveAccessibleDescription("Enter a smaller number.");
  await expect(page.getByText(/Infinity|∞|NaN/)).toHaveCount(0);
  await expect(page.getByText("Clearance medium", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy result", exact: true })).toHaveCount(0);
  await expect(page.locator("table.ref-table tbody tr").first().locator("td").nth(1)).toHaveText(
    "— N·m",
  );
});

for (const locale of ["nl", "en"] as const) {
  for (const value of ["unknown", "", "constructor"]) {
    test(`fastener ${locale} unsupported property class ${JSON.stringify(value)} is correctable`, async ({
      page,
    }) => {
      const prefix = locale === "en" ? "/en" : "";
      await page.goto(`${prefix}/tools/fasteners?c=${value}#tool`, { waitUntil: "networkidle" });
      const input = page.locator("#fastener-class");
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(input).toHaveAccessibleDescription(
        locale === "en"
          ? "Choose property class 8.8, 10.9 or 12.9 to calculate tightening torque."
          : "Kies sterkteklasse 8.8, 10.9 of 12.9 om het aandraaimoment te berekenen.",
      );
      await expect(
        page.getByText(locale === "en" ? "Tightening torque T" : "Aandraaimoment T", {
          exact: true,
        }),
      ).toHaveCount(0);
      const copy = page.getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      });
      await expect(copy).toHaveCount(0);
      expect(new URL(page.url()).searchParams.get("c")).toBe(value);
      await page.reload({ waitUntil: "networkidle" });
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await input.selectOption("10.9");
      await expect(input).not.toHaveAttribute("aria-invalid");
      await expect(copy).toBeVisible();
      await expect(page.getByText("≈ 39,5 N·m", { exact: true })).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get("c")).toBe("10.9");
      expect(new URL(page.url()).hash).toBe("#tool");
    });
  }
  test(`fastener ${locale} prototype thread key uses supported default`, async ({ page }) => {
    await page.goto(`${locale === "en" ? "/en" : ""}/tools/fasteners?m=constructor`, {
      waitUntil: "networkidle",
    });
    await expect(
      // Field wraps the select: Playwright label text also includes its option text.
      page.getByLabel(locale === "en" ? "Thread size" : "Draadmaat"),
    ).toHaveValue("M8");
    await expect.poll(() => new URL(page.url()).searchParams.get("m")).toBe("M8");
    await expect(page.getByText("≈ 28,1 N·m", { exact: true })).toBeVisible();
  });
}

for (const locale of ["nl", "en"] as const) {
  for (const reliability of ["unknown", ""]) {
    test(`bearing ${locale} invalid reliability ${JSON.stringify(reliability)} is correctable`, async ({
      page,
    }) => {
      await page.goto(
        `${locale === "en" ? "/en" : ""}/calculators/bearing-life?rel=${reliability}`,
        { waitUntil: "networkidle" },
      );
      const select = page.locator("#bearing-reliability");
      await expect(select).toHaveAttribute("aria-invalid", "true");
      await expect(select).toHaveAccessibleDescription(
        locale === "en"
          ? "Choose a reliability from the list to calculate bearing life."
          : "Kies een betrouwbaarheid uit de lijst om de levensduur te berekenen.",
      );
      const copy = page.getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      });
      await expect(copy).toHaveCount(0);
      await expect(page.getByText(/125 × 10⁶/)).toHaveCount(0);
      expect(new URL(page.url()).searchParams.get("rel")).toBe(reliability);
      await page.reload({ waitUntil: "networkidle" });
      await expect(select).toHaveAttribute("aria-invalid", "true");
      await select.selectOption("95");
      await expect(select).not.toHaveAttribute("aria-invalid");
      await expect(copy).toBeVisible();
      await expect(page.getByText(/77,5 × 10⁶/)).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get("rel")).toBe("95");
    });
  }
}

for (const locale of ["nl", "en"] as const) {
  for (const type of ["unknown", "", "constructor"]) {
    test(`bearing ${locale} invalid type ${JSON.stringify(type)} preserves independent static check`, async ({
      page,
    }) => {
      await page.goto(
        `${locale === "en" ? "/en" : ""}/calculators/bearing-life?type=${type}&C0=10&P0=2`,
        { waitUntil: "networkidle" },
      );
      const select = page.locator("#bearing-type");
      await expect(select).toHaveAttribute("aria-invalid", "true");
      await expect(select).toHaveAccessibleDescription(
        locale === "en"
          ? "Choose a bearing type from the list to calculate bearing life."
          : "Kies een lagertype uit de lijst om de levensduur te berekenen.",
      );
      const copy = page.getByRole("button", {
        name: locale === "en" ? "Copy result" : "Kopieer resultaat",
        exact: true,
      });
      await expect(copy).toHaveCount(0);
      await expect(page.getByText(/× 10⁶/)).toHaveCount(0);
      await expect(page.getByText("5", { exact: true })).toBeVisible();
      expect(new URL(page.url()).searchParams.get("type")).toBe(type);
      await page.reload({ waitUntil: "networkidle" });
      await expect(select).toHaveAttribute("aria-invalid", "true");
      await select.selectOption("ball");
      await expect(select).not.toHaveAttribute("aria-invalid");
      await expect(copy).toBeVisible();
      await expect(page.getByText(/125 × 10⁶/)).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get("type")).toBe("ball");
    });
  }
}

for (const locale of ["nl", "en"] as const) {
  for (const material of ["unknown", "", "constructor"]) {
    test(`pneumatic ${locale} invalid material ${JSON.stringify(material)} suppresses only buckling`, async ({
      page,
    }) => {
      await page.goto(
        `${locale === "en" ? "/en" : ""}/calculators/pneumatic-cylinder?material=${material}`,
        { waitUntil: "networkidle" },
      );
      const select = page.locator("#pneu-material");
      await expect(select).toHaveAttribute("aria-invalid", "true");
      await expect(select).toHaveAccessibleDescription(
        locale === "en"
          ? "Choose a rod material from the list for the buckling check."
          : "Kies een stangmateriaal uit de lijst voor de knikcontrole.",
      );
      await expect(page.getByText("F_cr", { exact: true })).toHaveCount(0);
      await expect(page.locator('a[href^="/calculators/buckling?"]')).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: locale === "en" ? "Copy result" : "Kopieer resultaat",
          exact: true,
        }),
      ).toBeVisible();
      expect(new URL(page.url()).searchParams.get("material")).toBe(material);
      await page.reload({ waitUntil: "networkidle" });
      await expect(select).toHaveAttribute("aria-invalid", "true");
      await select.selectOption("staal");
      await expect(select).not.toHaveAttribute("aria-invalid");
      await expect(page.getByText("F_cr", { exact: true })).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get("material")).toBe("staal");
    });
  }
}

for (const locale of ["nl", "en"] as const) {
  for (const end of ["unknown", "", "constructor"]) {
    test(`pneumatic ${locale} invalid end ${JSON.stringify(end)} suppresses only buckling`, async ({
      page,
    }) => {
      await page.goto(`${locale === "en" ? "/en" : ""}/calculators/pneumatic-cylinder?end=${end}`, {
        waitUntil: "networkidle",
      });
      const select = page.locator("#pneu-end");
      await expect(select).toHaveAttribute("aria-invalid", "true");
      await expect(select).toHaveAccessibleDescription(
        locale === "en"
          ? "Choose an end condition from the list for the buckling check."
          : "Kies een inklemming uit de lijst voor de knikcontrole.",
      );
      await expect(page.getByText("F_cr", { exact: true })).toHaveCount(0);
      await expect(page.locator('a[href^="/calculators/buckling?"]')).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: locale === "en" ? "Copy result" : "Kopieer resultaat",
          exact: true,
        }),
      ).toBeVisible();
      expect(new URL(page.url()).searchParams.get("end")).toBe(end);
      await page.reload({ waitUntil: "networkidle" });
      await expect(select).toHaveAttribute("aria-invalid", "true");
      await select.selectOption("fc");
      await expect(select).not.toHaveAttribute("aria-invalid");
      await expect(page.getByText("F_cr", { exact: true })).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get("end")).toBe("fc");
    });
  }
}
