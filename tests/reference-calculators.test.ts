import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeGroove, nearestStandardSizes } from "../src/lib/calculators/circlip.ts";
import {
  housingFitAt,
  housingClassFor,
  shaftClassFor,
  shaftFitAt,
} from "../src/lib/calculators/bearing-fits.ts";
import {
  fmtGeoZone,
  fmtIso2768,
  lookupLinear,
  lookupRadiusChamfer,
  LINEAR_SIZE_MIN,
} from "../src/lib/calculators/iso2768.ts";
import { computeOringGroove } from "../src/lib/calculators/oring.ts";
import { computeMotor } from "../src/lib/calculators/motor.ts";
import { sizeMotor } from "../src/lib/toolkit/motor.ts";
import { isVerifiedSeeger } from "../src/lib/toolkit/seeger.ts";

const close = (a: number, b: number, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

// E01/E02 — circlip groove: catalogue lookup, not the sqrt/percentage estimate.
describe("Circlip groove (active default tool)", () => {
  it("external 20 mm ring matches the verified DSH-20-style record", () => {
    const r = computeGroove("as", 20);
    assert.ok(r);
    close(r.grooveDiameter, 19.0);
    close(r.grooveWidth, 1.3);
    close(r.grooveDepth, 0.5);
    assert.equal(r.verified, true);
  });

  it("internal 20 mm ring uses its own width, not the external ring's", () => {
    const r = computeGroove("boring", 20);
    assert.ok(r);
    close(r.grooveDiameter, 21.0);
    close(r.grooveWidth, 1.1);
    assert.notEqual(r.grooveWidth, computeGroove("as", 20)?.grooveWidth);
    assert.equal(r.verified, true);
  });

  it("unverified sizes are flagged as such", () => {
    const r = computeGroove("as", 30);
    assert.ok(r);
    assert.equal(r.verified, false);
    assert.equal(isVerifiedSeeger(30), false);
  });

  it("returns null (no silent estimate) for a diameter with no standard ring", () => {
    assert.equal(computeGroove("as", 23), null);
    const near = nearestStandardSizes("as", 23);
    assert.equal(near.lower, 22);
    assert.equal(near.upper, 24);
  });
});

// E03 — bearing housing fit must key off the bearing outside diameter D, not the shaft/bore diameter d.
describe("Bearing fits: shaft d vs housing D", () => {
  it("6204-style bearing: d=20 mm shaft, D=47 mm housing give different fits", () => {
    const cls = shaftClassFor("normaal", 20);
    const shaft = shaftFitAt(20, cls);
    const housingClass = housingClassFor("normaal", "vast");
    const housingAt20 = housingFitAt(20, housingClass);
    const housingAt47 = housingFitAt(47, housingClass);
    assert.ok(shaft && housingAt20 && housingAt47);
    assert.notEqual(housingAt20.range, housingAt47.range);
  });
});

// E05/E06 — ISO 2768: geometric zone values must not carry a ± prefix, and the 0.5 mm floor must be enforced.
describe("ISO 2768 (active default tool)", () => {
  it("0.4 mm is out of scope for linear/radius tolerances", () => {
    assert.equal(lookupLinear(0.4), null);
    assert.equal(lookupRadiusChamfer(0.4), null);
  });

  it("0.5 mm is the first valid band", () => {
    assert.ok(lookupLinear(0.5));
    assert.ok(lookupRadiusChamfer(0.5));
    assert.equal(LINEAR_SIZE_MIN, 0.5);
  });

  it("geometric zone formatting carries no ± prefix, unlike bilateral deviations", () => {
    assert.equal(fmtGeoZone(0.2), "0,2");
    assert.equal(fmtIso2768(0.2), "±0,2");
  });
});

// E07 — O-ring groove: nominal cross-section fill must be checked, not just squeeze%.
describe("O-ring groove fill", () => {
  it("cord 3.55 mm, squeeze 30%, width factor 1.1 is overfilled (~102%)", () => {
    const r = computeOringGroove(3.55, 30, 1.1);
    assert.ok(r);
    assert.ok(r.fillPercent > 100, `expected >100%, got ${r.fillPercent}`);
    close(r.fillPercent, 102.0, 0.2);
    assert.equal(r.overfilled, true);
  });

  it("a generous width factor is not overfilled", () => {
    const r = computeOringGroove(3.55, 20, 1.4);
    assert.ok(r);
    assert.equal(r.overfilled, false);
  });
});

// E08 — efficiency above 100% must be rejected in every motor model.
describe("Motor efficiency guard", () => {
  it("toolkit sizeMotor rejects eta > 1", () => {
    const r = sizeMotor({
      v_ms: 1,
      D_m: 0.1,
      mass_kg: 100,
      duty: "rollenbaan",
      mu: 0.03,
      eta: 2,
      fb: 1.2,
    });
    assert.equal(r, null);
  });

  it("toolkit sizeMotor accepts eta in (0, 1]", () => {
    const r = sizeMotor({
      v_ms: 1,
      D_m: 0.1,
      mass_kg: 100,
      duty: "rollenbaan",
      mu: 0.03,
      eta: 0.9,
      fb: 1.2,
    });
    assert.ok(r);
  });

  it("default calculators computeMotor also rejects eta > 1", () => {
    const r = computeMotor({
      force: 981,
      speedMs: 1,
      diameterMm: 100,
      efficiency: 2,
      safety: 1,
    });
    assert.equal(r, null);
  });
});
