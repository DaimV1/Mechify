import { test } from "node:test";
import assert from "node:assert/strict";
import { validators } from "../src/lib/reference-validation.ts";

test("motor inline-validated shared fields preserve invalid strings and explicit blanks", () => {
  const validate = validators["/toolkit/motorspecificatie"];
  for (const key of ["speed", "d", "mass", "eta", "fb"]) {
    for (const value of ["", "bad", "0", "-1", "1.1", "0,85"]) {
      assert.equal(validate({ [key]: value })[key], value);
    }
    assert.equal(validate({})[key], undefined);
    assert.equal(validate({ [key]: 100 })[key], undefined);
  }
});
