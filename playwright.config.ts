import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Some sandboxes pre-install a specific Chromium revision that doesn't match
 * what @playwright/test's bundled playwright-core expects, so a hardcoded
 * default path is offered as a fallback there — but only used when it
 * actually exists on disk. A normal CI runner (no PW_CHROMIUM_PATH set, no
 * matching sandbox path) gets `executablePath: undefined`, i.e. Playwright's
 * own managed browser installed via `npx playwright install chromium`.
 */
const SANDBOX_CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const CHROMIUM_PATH =
  process.env.PW_CHROMIUM_PATH ??
  (existsSync(SANDBOX_CHROMIUM_PATH) ? SANDBOX_CHROMIUM_PATH : undefined);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  // A small tolerance absorbs sub-pixel font-hinting jitter in the SVG text
  // labels between runs — the diagrams themselves don't change run to run.
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02 } },
  use: {
    baseURL: "http://127.0.0.1:8081",
    trace: "retain-on-failure",
    launchOptions: CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {},
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://127.0.0.1:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
