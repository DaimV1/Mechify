import { expect, test } from "./support/fixtures.ts";

test.describe("connected drive workflow", () => {
  test("drive operating point persists, is shareable and passes calculated torque to shaft sizing", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/en/calculators/drive-power?mode=torque&p=1.5&n=750&t=4", {
      waitUntil: "networkidle",
    });
    await expect(page.locator("#drive-power")).toHaveValue("1.5");
    await expect(page.locator("#drive-speed")).toHaveValue("750");
    await expect(page.locator(".result-number")).toContainText(/19[,.]099/);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("#drive-power")).toHaveValue("1.5");
    await expect(page.locator("#drive-speed")).toHaveValue("750");

    await page.getByRole("button", { name: "Copy link" }).click();
    const shared = await page.evaluate(() => navigator.clipboard.readText());
    expect(shared).toContain("mode=torque");
    expect(shared).toContain("p=1.5");
    expect(shared).toContain("n=750");

    const shaftLink = page.getByRole("link", { name: "Check shaft diameter" });
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press("Tab");
      if (await shaftLink.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(shaftLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/calculators\/shaft-diameter\?/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveURL(/t=19\.098/);
    await expect(page.locator("#shaft-torque")).toHaveValue(/19\.098/);
    await expect(page.locator("#shaft-tau-allow")).toHaveValue("");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("#shaft-tau-allow")).toHaveValue("");
    await expect(
      page.getByText("Enter torque and allowable shear stress (both greater than 0)."),
    ).toBeVisible();
    await expect(page.getByText("Minimum solid diameter d_min")).toHaveCount(0);

    await page.locator("#shaft-tau-allow").fill("40");
    await expect(page.getByText("Minimum solid diameter d_min")).toBeVisible();
    await expect(page.getByText(/13[,.]45 mm/)).toBeVisible();
  });

  test("motor sizing passes drum torque, not efficiency-adjusted power, to the shaft check", async ({
    page,
  }) => {
    await page.goto(
      "/en/calculators/motor-specification?duty=hijsen&mass=50&speed=0.2&unit=m%2Fs&d=200&eta=0.85&fb=1.1",
      { waitUntil: "networkidle" },
    );
    await expect(page.getByText("n_rol", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Check shaft at calculated torque" }).click();
    await expect(page.locator("#shaft-torque")).toHaveValue("49.05");
    await expect(page.locator("#shaft-tau-allow")).toHaveValue("");
  });

  test("zero torque does not offer an invalid shaft handoff", async ({ page }) => {
    await page.goto("/en/calculators/drive-power?mode=power&t=0&n=750", {
      waitUntil: "networkidle",
    });
    await expect(page.getByRole("link", { name: "Check shaft diameter" })).toHaveCount(0);
  });

  test("drive share control reports clipboard denial", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "clipboard", {
        configurable: true,
        get: () => ({ writeText: () => Promise.reject(new Error("denied")) }),
      });
    });
    await page.goto("/en/calculators/drive-power", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Copying isn't allowed. Copy the URL manually from the address bar.",
    );
  });

  test("reset restores the drive power calculator's defaults after editing", async ({ page }) => {
    await page.goto("/en/calculators/drive-power?mode=torque&p=1.5&n=750&t=4", {
      waitUntil: "networkidle",
    });
    await expect(page.locator("#drive-power")).toHaveValue("1.5");
    await expect(page.locator("#drive-speed")).toHaveValue("750");

    await page.locator("#drive-power").fill("9");
    await page.locator("#drive-speed").fill("999");
    await expect(page.locator("#drive-power")).toHaveValue("9");

    await page.locator(".calc-actions").getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#drive-power")).toHaveValue("0.75");
    await expect(page.locator("#drive-speed")).toHaveValue("1500");
    await expect(page).toHaveURL(/p=0\.75/);
    await expect(page).toHaveURL(/n=1500/);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("#drive-power")).toHaveValue("0.75");
    await expect(page.locator("#drive-speed")).toHaveValue("1500");
  });
});
