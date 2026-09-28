import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { getAllRoutes } from "../src/lib/all-routes.ts";
import {
  LEGACY_REDIRECTS,
  normalizeIso2768LegacyParams,
  resolveLegacyRoute,
} from "../src/lib/legacy-routes.ts";

type VercelConfig = {
  redirects?: Array<{ source: string; destination: string; permanent?: boolean }>;
  rewrites?: Array<{ source: string; destination: string }>;
};

const config = JSON.parse(
  fs.readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
) as VercelConfig;
const rawConfig = fs.readFileSync(new URL("../vercel.json", import.meta.url), "utf8");

test("Vercel contains exactly the declared permanent legacy redirects", () => {
  const actual = Object.fromEntries(
    (config.redirects ?? []).map(({ source, destination, permanent }) => {
      assert.equal(permanent, true, `${source} must be a permanent (308) redirect`);
      return [source, destination];
    }),
  );
  assert.deepEqual(actual, LEGACY_REDIRECTS);
  assert.equal(new Set(Object.values(actual)).has("/toolkit"), false);
  assert.ok(
    rawConfig.indexOf('"redirects"') < rawConfig.indexOf('"rewrites"'),
    "platform redirects must be declared before filesystem rewrites",
  );
});

test("legacy manifest has unique sources and cannot redirect back into itself", () => {
  const sources = Object.keys(LEGACY_REDIRECTS);
  const sourceSet = new Set(sources);
  assert.equal(sourceSet.size, sources.length);
  for (const [source, destination] of Object.entries(LEGACY_REDIRECTS)) {
    const destinationPath = destination.split("?")[0];
    assert.notEqual(destinationPath, source);
    assert.equal(
      sourceSet.has(destinationPath),
      false,
      `${source} must not create a redirect chain`,
    );
  }
});

test("no broad fallback rewrite turns unknown paths into false-200 pages", () => {
  const rewriteSources = (config.rewrites ?? []).map(({ source }) => source);
  assert.equal(rewriteSources.includes("/:path*"), false);
  assert.equal(rewriteSources.includes("/toolkit/:slug"), false);
  assert.equal(resolveLegacyRoute("/toolkit/not-a-real-tool", "?x=1"), null);
  assert.equal(resolveLegacyRoute("/not-a-real-page", ""), null);
});

test("client fallback preserves queries and destination defaults without redirect loops", () => {
  assert.equal(resolveLegacyRoute("/over", "?lang=en"), "/about?lang=en");
  assert.equal(
    resolveLegacyRoute("/toolkit/bevestigers", "?size=M8&model=eigen"),
    "/tools/fasteners?size=M8&model=eigen",
  );
  assert.equal(resolveLegacyRoute("/tools/fasteners", "?model=eigen"), null);
});

test("ISO 2768 legacy query names migrate only when supplied", () => {
  assert.equal(
    resolveLegacyRoute("/toolkit/iso-2768", "?len=80&linear=f&form=H&lang=en"),
    "/tools/iso-2768?lang=en&d=80&leg=80&gl=80&lc=f&gc=H",
  );
  assert.equal(resolveLegacyRoute("/toolkit/iso-2768"), "/tools/iso-2768");
});

test("ISO target normalizes aliases preserved by a fresh platform redirect", () => {
  assert.equal(
    normalizeIso2768LegacyParams("len=80&linear=f&form=H&lang=en").toString(),
    "lang=en&d=80&leg=80&gl=80&lc=f&gc=H",
  );
  assert.equal(
    normalizeIso2768LegacyParams("len=80&d=25&linear=f&lc=c").toString(),
    "d=25&lc=c&leg=80&gl=80",
    "canonical keys win when old and new links are combined",
  );
});

test("canonical route inventory contains destinations, never legacy sources", () => {
  const canonicalRoutes = new Set(getAllRoutes());
  for (const [source, destination] of Object.entries(LEGACY_REDIRECTS)) {
    assert.equal(
      canonicalRoutes.has(source),
      false,
      `${source} must not be canonical or in the sitemap`,
    );
    assert.equal(
      canonicalRoutes.has(destination.split("?")[0]),
      true,
      `${destination} must resolve to a canonical route`,
    );
  }
});
