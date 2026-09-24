import assert from "node:assert/strict";
import { test } from "node:test";
import { singleBendFlatLength } from "../src/lib/calculators/bending.ts";

test("single bend checks both outside legs against outer setback", () => {
  assert.ok(Math.abs(singleBendFlatLength([30, 30], 90, 2, 2, 0.4)! - 56.398229715) < 1e-8);
  assert.ok(Math.abs(singleBendFlatLength([4, 4], 90, 2, 2, 0.4)! - 4.398229715) < 1e-8);
  for (const leg of [null, NaN, Infinity, -1, 0, 3.99]) {
    assert.equal(singleBendFlatLength([leg, 30], 90, 2, 2, 0.4), null);
    assert.equal(singleBendFlatLength([30, leg], 90, 2, 2, 0.4), null);
  }
  assert.equal(singleBendFlatLength([null, null], 90, 2, 2, 0.4), null);
  assert.equal(singleBendFlatLength([30, 30], 180, 2, 2, 0.4), null);
  assert.equal(singleBendFlatLength([30, 30], 90, Infinity, 2, 0.4), null);
});
