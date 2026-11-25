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
    material: undefined,
    t: undefined,
    k: undefined,
    kind: undefined,
  });
});
