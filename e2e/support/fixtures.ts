import { test as base, expect } from "@playwright/test";

type Fixtures = {
  /** Console/page errors collected for the lifetime of the page — assert against this instead of re-wiring listeners per test. */
  consoleErrors: string[];
};

export const test = base.extend<Fixtures>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await use(errors);
  },
});

export { expect };
