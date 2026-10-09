import { test } from "node:test";
import assert from "node:assert/strict";
import { hollowShaftTorsionStress, shaftTorsionStress } from "../src/lib/calculators/shaft.ts";

test("annular torsion matches independent J and outer-radius reference cases", () => {
  // J=14726.215563702155 mm⁴; T*r/J=50000*10/J.
  assert.ok(Math.abs(hollowShaftTorsionStress(50, 20, 10)! - 33.953054526271) < 1e-10);
  // J=171805.84824319184 mm⁴; T*r/J=100000*20/J.
  assert.ok(Math.abs(hollowShaftTorsionStress(100, 40, 30)! - 11.641047266150059) < 1e-10);
  assert.ok(Math.abs(hollowShaftTorsionStress(50, 20, 0)! - shaftTorsionStress(50, 20)!) < 1e-12);
});

test("annular torsion rejects nonphysical and unrepresentable results", () => {
  for (const args of [
    [0, 20, 10],
    [-1, 20, 10],
    [50, 0, 0],
    [50, 20, -1],
    [50, 20, 20],
    [50, 20, 21],
    [Infinity, 20, 10],
    [50, NaN, 10],
    [50, 20, Infinity],
    [1e308, 20, 10],
    [50, 1e308, 0],
    [50, 1e-300, 0],
  ]) {
    assert.equal(hollowShaftTorsionStress(args[0], args[1], args[2]), null);
  }
});
