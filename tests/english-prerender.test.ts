import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { getAllRoutes } from "../src/lib/all-routes.ts";

test(
  "built English URLs expose translated HTML and reciprocal discovery metadata",
  { skip: !process.env.REQUIRE_PRERENDER && !existsSync("dist/en.html") },
  () => {
    for (const route of getAllRoutes().filter((route) => route.startsWith("/en"))) {
      const html = readFileSync(`dist${route}.html`, "utf8");
      assert.ok(html.includes('<html lang="en"'), route);
      assert.ok(html.includes(`rel="canonical" href="https://www.mechify.nl${route}"`), route);
      assert.ok(html.includes('hreflang="en"'), route);
      assert.ok(html.includes('hreflang="nl"'), route);
      assert.ok(!html.includes("<!--$!-->"), route);
      assert.ok(!html.includes("Technisch schema"), route);
    }
    const fit = readFileSync("dist/en/tools/fit-tolerances.html", "utf8");
    assert.ok(fit.includes("Nominal fit"));
    assert.ok(!fit.includes("Nominale passing"));
    assert.ok(
      readFileSync("dist/sitemap.xml", "utf8").includes(
        "https://www.mechify.nl/en/tools/fit-tolerances",
      ),
    );
  },
);
