import assert from "node:assert/strict";
import { it } from "node:test";
import { articles } from "../src/lib/articles.ts";
import { SEEGER_SOURCES } from "../src/lib/toolkit/seeger.ts";

it("circlip article describes current per-part evidence without unsupported tolerance classes", () => {
  const article = articles.find((a) => a.slug === "borgveer-twee-groeven-niet-een");
  assert.ok(article);
  assert.equal(article.reviewedDateIso, "2026-09-27");
  for (const locale of ["nl", "en"] as const) {
    const text = [
      article.basis[locale],
      article.intro[locale],
      ...article.sections.flatMap((section) => section.map((part) => part[locale])),
    ].join(" ");
    assert.doesNotMatch(
      text,
      /\b(?:h11|H11|H13|IT11)\b|only d1 = 20|alleen d1 = 20|one verified point|enige geverifieerde punt/i,
    );
    for (const source of Object.values(SEEGER_SOURCES)) {
      assert.ok(text.includes(source.part), source.part);
    }
  }
});
