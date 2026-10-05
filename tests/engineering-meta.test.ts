import { strict as assert } from "node:assert";
import { test } from "node:test";
import { metaCopyLine, type EngineeringSourceMeta } from "../src/lib/engineering-meta.ts";

const meta: EngineeringSourceMeta = {
  basisType: "physics",
  status: "current",
  reference: "Torsion",
  checkedDate: "2026-10-05",
  validityRange: { nl: "Massieve ronde as", en: "Solid round shaft" },
  assumptions: { nl: "Geen vermoeiing.", en: "No fatigue." },
  verification: { nl: "Controleer combinatiespanning.", en: "Check combined stress." },
};
for (const locale of ["nl", "en"] as const) {
  test(`copied engineering context preserves each supplied condition once (${locale})`, () => {
    const copy = metaCopyLine(meta, locale);
    for (const text of [
      meta.validityRange![locale],
      meta.assumptions![locale],
      meta.verification![locale],
    ])
      assert.equal(copy.split(text).length - 1, 1);
    assert.ok(copy.includes(locale === "nl" ? "Voor gebruik:" : "Before use:"));
    assert.equal(copy.split("\n").length, 3);
  });
}
test("metadata without optional conditions does not invent warnings or empty labels", () => {
  const {
    assumptions: _assumptions,
    verification: _verification,
    validityRange: _range,
    ...bare
  } = meta;
  assert.equal(metaCopyLine(bare, "en"), "PHYSICS MODEL: Torsion · Checked 2026-10-05");
});
