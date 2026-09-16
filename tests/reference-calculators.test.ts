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
  RUNOUT,
} from "../src/lib/calculators/iso2768.ts";
import { bandIndex, computeFit } from "../src/lib/calculators/iso286.ts";
import { computeOringGroove } from "../src/lib/calculators/oring.ts";
import { computeMotor } from "../src/lib/calculators/motor.ts";
import { sizeMotor } from "../src/lib/toolkit/motor.ts";
import { isVerifiedSeeger } from "../src/lib/toolkit/seeger.ts";
import { columnCapacity, extremeFiber, sectionProps } from "../src/lib/calculators/knik.ts";
import { rodBucklingCheck } from "../src/lib/toolkit/cylinder.ts";
import { bendingStress, computeBeam } from "../src/lib/calculators/beam.ts";

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

  // Tolerance info (h11/H11 groove class, groove width class, depth
  // tolerance) is always part of the default result now — there is no
  // separate "without tolerances" model.
  it("always reports the groove diameter/width tolerance classes and depth tolerance", () => {
    const shaft = computeGroove("as", 20);
    const bore = computeGroove("boring", 20);
    assert.ok(shaft && bore);
    assert.equal(shaft.grooveDiameterClass, "h11");
    assert.equal(bore.grooveDiameterClass, "H11");
    assert.equal(shaft.grooveWidthClass, "H13");
    assert.equal(bore.grooveWidthClass, "H13");
    assert.ok(shaft.grooveDepthPlus > 0);
    assert.ok(bore.grooveDepthPlus > 0);
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

  // Ported from the now-deleted toolkit/iso2768.ts's dead-code test suite —
  // same underlying ISO 2768-1 data, exercised here against the live module.
  it("42 mm class m is ±0.3 linear", () => {
    assert.equal(lookupLinear(42)?.m, 0.3);
  });

  it("6 mm class f is ±0.05 linear", () => {
    assert.equal(lookupLinear(6)?.f, 0.05);
  });

  it("8 mm class v is ±1.0 linear", () => {
    assert.equal(lookupLinear(8)?.v, 1.0);
  });

  it("class v has no defined value in the first band (2 mm), unlike f/m/c", () => {
    const row = lookupLinear(2);
    assert.ok(row);
    assert.equal(row.v, null);
    assert.ok(row.f != null && row.m != null && row.c != null);
  });

  it("circular run-out is a flat per-class value, independent of size", () => {
    assert.equal(RUNOUT.H, 0.1);
    assert.equal(RUNOUT.K, 0.2);
    assert.equal(RUNOUT.L, 0.5);
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

// E12 — the fits tool must accept decimal nominal diameters (bandIndex is
// the shared lookup the UI's parseNum-based input now feeds decimals into).
describe("ISO 286 decimal diameters", () => {
  it("bandIndex resolves a decimal diameter to the same band as its rounded-up neighbour", () => {
    assert.equal(bandIndex(2.5), bandIndex(3));
    assert.equal(bandIndex(19.5), bandIndex(20));
  });

  it("computeFit works with a decimal diameter", () => {
    const r = computeFit(19.5, "H7/h6");
    assert.ok(r);
    close(r.ES, 21);
    close(r.EI, 0);
  });
});

// E09 — a squash-capped buckling result must be flagged as a screening
// upper bound, not a verified design capacity.
describe("Buckling: verified capacity vs screening-only upper bound", () => {
  it("a stubby column below the Euler limit is squash-capped and unverified", () => {
    // Ø20 mm round, RVS (E=193000, Rp0.2=215), L=100mm, pinned-pinned: well
    // below lambda_lim, so the squash load governs (same case as the
    // knik.ts doc comment: Euler would say ~1496 kN vs a ~68 kN squash load).
    const A = (Math.PI * 20 ** 2) / 4;
    const I = (Math.PI * 20 ** 4) / 64;
    const r = columnCapacity({ L: 100, k: 1, E: 193000, I, A, F: null, rp02: 215 });
    assert.ok(r);
    assert.equal(r.governing, "plooien");
    assert.equal(r.verifiedCapacity, false);
    close(r.Fcr, r.squashLoad);
  });

  it("a slender column above the Euler limit is a verified Euler result", () => {
    const A = (Math.PI * 10 ** 2) / 4;
    const I = (Math.PI * 10 ** 4) / 64;
    const r = columnCapacity({ L: 2000, k: 1, E: 210000, I, A, F: null, rp02: 235 });
    assert.ok(r);
    assert.equal(r.governing, "euler");
    assert.equal(r.verifiedCapacity, true);
  });
});

// E10 — rod protrusion is a length ADD-ON: omitting it (protrusion=0) must
// give the highest (most optimistic) F_cr, never a conservative default.
describe("Pneumatic rod buckling: protrusion is not a worst-case default", () => {
  it("more protrusion strictly lowers F_cr", () => {
    const noProtrusion = rodBucklingCheck(12, 300, 500, 0);
    const withProtrusion = rodBucklingCheck(12, 300, 500, 50);
    assert.ok(noProtrusion && withProtrusion);
    assert.ok(
      withProtrusion.Fcr < noProtrusion.Fcr,
      `expected added protrusion to lower F_cr: ${withProtrusion.Fcr} vs ${noProtrusion.Fcr}`,
    );
  });
});

// E11 — the beam tool must separately report deflection AT the load and the
// true maximum (with location), matching the review's worked example.
describe("Beam deflection: at-load vs true maximum", () => {
  it("F=1000N, L=1000mm, a=200mm, E=210000, I=1e6: at-load 0.040635mm, max 0.057466mm at x=434.315mm", () => {
    const r = computeBeam({ type: "opgelegd", F: 1000, L: 1000, a: 200, E: 210000, I: 1e6 });
    assert.ok(r);
    close(r.deflectionAtLoad, 0.040635, 1e-5);
    close(r.deflectionMax, 0.057466, 1e-5);
    close(r.xMax, 434.315, 1e-2);
    assert.ok(r.deflectionMax > r.deflectionAtLoad);
  });

  it("a centred load has the maximum coincide with the load", () => {
    const r = computeBeam({ type: "opgelegd", F: 1000, L: 1000, a: 500, E: 210000, I: 1e6 });
    assert.ok(r);
    close(r.deflectionAtLoad, r.deflectionMax, 1e-9);
    close(r.xMax, 500, 1e-9);
  });

  it("a cantilever's maximum is always at the tip", () => {
    const r = computeBeam({ type: "uitkraging", F: 500, L: 800, a: 300, E: 210000, I: 5e5 });
    assert.ok(r);
    close(r.deflectionAtLoad, r.deflectionMax, 1e-9);
    assert.equal(r.xMax, 800);
  });
});

// E11 — bending axis selection: a rectangle's strong- and weak-axis I must
// differ, and extremeFiber must track the same axis as sectionProps.
describe("Beam bending axis selection", () => {
  it("a 20x100mm rectangle has a 25x difference between strong and weak axis I", () => {
    const weak = sectionProps("rechthoek", { b: 20, h: 100 }, "weak");
    const strong = sectionProps("rechthoek", { b: 20, h: 100 }, "strong");
    assert.ok(weak && strong);
    close(strong.I / weak.I, 25, 1e-9);
  });

  it("extremeFiber tracks the same axis as sectionProps for a rectangle", () => {
    const dims = { b: 20, h: 100 };
    assert.equal(extremeFiber("rechthoek", dims, "weak"), 10);
    assert.equal(extremeFiber("rechthoek", dims, "strong"), 50);
  });

  it("bending stress is far lower on the strong axis than the (default, conservative) weak axis", () => {
    const dims = { b: 20, h: 100 };
    const M = 1e6;
    const weakSigma = bendingStress(
      M,
      extremeFiber("rechthoek", dims, "weak")!,
      sectionProps("rechthoek", dims, "weak")!.I,
    );
    const strongSigma = bendingStress(
      M,
      extremeFiber("rechthoek", dims, "strong")!,
      sectionProps("rechthoek", dims, "strong")!.I,
    );
    assert.ok(strongSigma < weakSigma);
  });
});
