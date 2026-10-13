import type { Page } from "@playwright/test";
import { expect, test } from "./support/fixtures";

const favoriteId = "drive-power";

async function seedFavorite(page: Page) {
  await page.addInitScript((id) => {
    window.localStorage.setItem("mechify.favorites", JSON.stringify([id]));
  }, favoriteId);
}

for (const locale of ["nl", "en"] as const) {
  test(`saved favourite hydrates cleanly in ${locale}`, async ({ page, consoleErrors }) => {
    await seedFavorite(page);
    await page.goto(locale === "en" ? "/en/toolkit" : "/toolkit", {
      waitUntil: "networkidle",
    });

    const favorite = page.getByRole("button", {
      name:
        locale === "en"
          ? "Torque, power & speed as favorite"
          : "Koppel, vermogen & toerental als favoriet",
      exact: true,
    });
    await expect(favorite).toHaveAttribute("aria-pressed", "true");
    await expect(favorite).toHaveText("★");
    expect(consoleErrors).toEqual([]);

    await page.reload({ waitUntil: "networkidle" });
    await expect(favorite).toHaveAttribute("aria-pressed", "true");
    await expect(favorite).toHaveText("★");
    expect(consoleErrors).toEqual([]);
  });
}

test("saved favourite remains available through filtering and client navigation", async ({
  page,
  consoleErrors,
}) => {
  await seedFavorite(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator('a[href="/toolkit"]:visible').first().click();
  await expect(page).toHaveURL(/\/toolkit$/);

  const favorite = page.getByRole("button", {
    name: "Koppel, vermogen & toerental als favoriet",
    exact: true,
  });
  await expect(favorite).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "☆ Mijn favorieten", exact: true }).click();
  await expect(page).toHaveURL(/favorieten=1/);
  await expect(page.getByRole("status")).toHaveText("1 tool");
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  expect(consoleErrors).toEqual([]);
});
