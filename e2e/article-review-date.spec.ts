import { test, expect } from "./support/fixtures.ts";
import { articles } from "../src/lib/articles.ts";

test("static article JSON-LD dates match their individual visible review dates", async ({
  request,
}) => {
  // Read raw HTTP HTML: hydration must not hide stale crawler-facing metadata.
  for (const article of articles) {
    const response = await request.get(`/topics/${article.slug}`);
    expect(response.status(), article.slug).toBe(200);
    const html = await response.text();
    const match = html.match(
      /<script id="page-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    expect(match, article.slug).not.toBeNull();
    const schema = JSON.parse(match![1]);
    const entry = schema["@graph"].find(
      (node: { "@type": string }) => node["@type"] === "TechArticle",
    );
    expect(entry?.dateModified, article.slug).toBe(article.reviewedDateIso);
    expect(html, article.slug).toContain(article.reviewedDate.nl);
  }
});
