import { test } from "node:test";
import assert from "node:assert/strict";
import {
  lookupKanten,
  checkBendHole,
  bendInterruptionPercent,
  parseBendDimension,
} from "../src/lib/toolkit/kanten.ts";

test("supplier flange depends on material and tooling, not 4t", () => {
  assert.equal(lookupKanten(2, "staal", "haaks")?.s, 9.1);
  assert.equal(lookupKanten(2, "staal", "haaks")?.w, 12);
  assert.equal(lookupKanten(3, "rvs", "haaks")?.s, 15.12);
  assert.equal(lookupKanten(3, "staal", "haaks")?.s, 12.4);
  assert.equal(lookupKanten(2, "staal", "scherp")?.s, 12.4);
});
test("nearest edge differs from centre; conservative 5 mm boundary", () => {
  assert.deepEqual(checkBendHole(9.1, 6, 9.1), {
    minEdge: 9.1,
    minCenter: 12.1,
    status: "outside",
  });
  assert.equal(checkBendHole(9.1, 6, 9.09)?.status, "too-close");
  assert.equal(checkBendHole(9.1, 5, 8)?.status, "too-close");
  assert.equal(checkBendHole(9.1, 4.99, 8)?.status, "review");
  assert.equal(checkBendHole(9.1, 6, null)?.status, "unmeasured");
});
test("unknown data never falls back to a neighbouring value", () => {
  assert.equal(checkBendHole(null, 6, 20), null);
  assert.equal(lookupKanten(7, "staal", "haaks"), null);
  assert.equal(checkBendHole(9.1, 0, 20), null);
  assert.equal(checkBendHole(9.1, Infinity, 20), null);
});
test("interruption boundary and invalid dimensions", () => {
  assert.equal(bendInterruptionPercent(10, 100), 10);
  assert.ok(bendInterruptionPercent(10.01, 100)! > 10);
  for (const [total, length] of [
    [1, 0],
    [-1, 100],
    [101, 100],
    [1, Infinity],
  ])
    assert.equal(bendInterruptionPercent(total, length), null);
  assert.equal(parseBendDimension("9,10"), 9.1);
  for (const input of ["", "2abc", "-2", "Infinity", "1.2.3"])
    assert.equal(parseBendDimension(input), null);
});
