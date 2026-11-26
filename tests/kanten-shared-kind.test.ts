import { test } from "node:test";
import assert from "node:assert/strict";
import { validators } from "../src/lib/reference-validation.ts";

test("bending kind preserves present strings for explicit UI validation", () => {
  const validate = validators["/toolkit/kanten"];
  for (const kind of ["", "bogus", "constructor", "__proto__", "haaks", "scherp"]) {
    assert.equal(validate({ kind }).kind, kind);
  }
  assert.equal(validate({}).kind, undefined);
  assert.equal(validate({ kind: 1 }).kind, undefined);
  assert.deepEqual(validate({ material: "bogus", t: "", k: "bad" }), {
    material: "bogus",
    t: "",
    k: undefined,
    kind: undefined,
  });
});

test("bending material preserves present strings without changing the missing default", () => {
  const validate = validators["/toolkit/kanten"];
  for (const material of [
    "",
    "bogus",
    "constructor",
    "__proto__",
    "staal",
    "alu",
    "rvs",
    "hoogsterkte",
  ]) {
    assert.equal(validate({ material }).material, material);
  }
  assert.equal(validate({}).material, undefined);
  assert.equal(validate({ material: 1 }).material, undefined);
});

test("bending thickness retains raw strings for explicit supported-row selection", () => {
  const validate = validators["/toolkit/kanten"];
  for (const t of ["", "bogus", "constructor", "-1", "Infinity", "2", "2.00", "99"]) {
    assert.equal(validate({ t }).t, t);
  }
  assert.equal(validate({}).t, undefined);
  assert.equal(validate({ t: 2 }).t, undefined);
});
