import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
const securityHeaders = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
).headers.find((rule) => rule.source === "/(.*)").headers;
const origin = process.env.SMOKE_ORIGIN || "https://www.mechify.nl";
assert.match(origin, /^https:\/\//);
const expectedSha = process.env.EXPECTED_SHA;
assert.match(
  expectedSha || "",
  /^[a-f0-9]{40}$/i,
  "EXPECTED_SHA must identify the deployed commit",
);
async function get(path, options = {}) {
  return fetch(new URL(path, origin), { signal: AbortSignal.timeout(30000), ...options });
}
const revisionResponse = await get(`/build-revision.json?expected=${expectedSha}`, {
  cache: "no-store",
});
assert.equal(revisionResponse.status, 200, "build revision metadata");
assert.equal((await revisionResponse.json()).revision, expectedSha, "deployed commit");
for (const [path, language, body] of [
  ["/tools/fit-tolerances", "nl", "Nominale passing"],
  ["/en/tools/fit-tolerances", "en", "Nominal fit"],
  ["/en/calculators/bearing-life", "en", "L10"],
]) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  for (const { key, value } of securityHeaders) {
    assert.equal(response.headers.get(key), value, `${path}: ${key}`);
  }
  const html = await response.text();
  assert.match(html, new RegExp(`<html lang="${language}"`));
  assert.ok(html.includes(body), `${path}: prerendered content`);
  assert.ok(html.includes(`rel="canonical" href="https://www.mechify.nl${path}"`));
  assert.ok(html.includes('hreflang="en"'));
  assert.ok(html.includes('hreflang="nl"'));
  assert.ok(!html.includes("<!--$!-->"), `${path}: unresolved Suspense boundary`);
}
assert.equal((await get("/nonexistent-production-smoke-route")).status, 404);
assert.equal((await get("/en/nonexistent-production-smoke-route")).status, 404);
const legacy = await get("/toolkit/iso-2768", { redirect: "manual" });
assert.equal(legacy.status, 308);
assert.ok(legacy.headers.get("location")?.includes("/tools/iso-2768"));
const sitemap = await get("/sitemap.xml");
assert.equal(sitemap.status, 200);
assert.ok((await sitemap.text()).includes("https://www.mechify.nl/en/tools/fit-tolerances"));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(new URL("/en/calculators/bearing-life", origin).href);
  await expect(page.locator("#bearing-life-C")).toBeVisible();
  await page.locator("#bearing-life-C").fill("5");
  await expect(page).toHaveURL(/[?&]C=5(?:&|$)/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto(new URL("/en/calculators/bearing-life?C=4&P=2&n=12000", origin).href);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#bearing-life-C")).toHaveValue("4");
  await page.locator("#bearing-life-C").fill("6");
  // Independent ISO 281 ball-bearing reference: (6/2)^3 = 27 million revolutions.
  await expect(page.getByText(/27(?:[,.]00)? × 10/)).toBeVisible();
  await expect(page).toHaveURL(/[?&]C=6(?:&|$)/);
  await page.reload();
  await expect(page.locator("#bearing-life-C")).toHaveValue("6");
  await expect(page.getByText(/27(?:[,.]00)? × 10/)).toBeVisible();
  assert.deepEqual(errors, [], "deployed browser console and hydration errors");
} finally {
  await browser.close();
}
console.log(`Deployed smoke passed: ${origin}`);
