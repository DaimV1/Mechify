import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadFixture } from "./fixtures/load.ts";
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
import {
  a1For,
  adjustedLife,
  l10Hours,
  l10Millions,
  staticSafetyFactor,
  staticSafetyStatus,
} from "../src/lib/calculators/bearing-life.ts";
import {
  boltSafetyStatus,
  clampStatus,
  computeBoltedJoint,
} from "../src/lib/calculators/bolted-joint.ts";
import {
  airConsumptionPerCycleL,
  airConsumptionPerMinuteL,
  annulusArea,
  circleArea,
  effectiveForce,
} from "../src/lib/calculators/pneumatic.ts";
import {
  shaftDiameterForTorque,
  shaftSafetyStatus,
  shaftTorsionStress,
} from "../src/lib/calculators/shaft.ts";
import {
  CLEARANCE_HOLES,
  computeTorque,
  PROPERTY_CLASSES,
  STRESS_AREA,
  WRENCH_SIZES,
} from "../src/lib/calculators/fasteners.ts";

const close = (a: number, b: number, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

type CirclipFixture = {
  externalRing20: {
    diameter: number;
    grooveDiameter: number;
    grooveWidth: number;
    grooveDepth: number;
    verified: boolean;
  };
  internalRing20: {
    diameter: number;
    grooveDiameter: number;
    grooveWidth: number;
    verified: boolean;
  };
  unverifiedRing30: { diameter: number; verified: boolean };
};
const circlipFixture = loadFixture<CirclipFixture>("circlip");

// E01/E02 — circlip groove: catalogue lookup, not the sqrt/percentage estimate.
describe("Circlip groove (active default tool)", () => {
  it("external 20 mm ring matches the verified DSH-20-style record", () => {
    const c = circlipFixture.externalRing20;
    const r = computeGroove("as", c.diameter);
    assert.ok(r);
    close(r.grooveDiameter, c.grooveDiameter);
    close(r.grooveWidth, c.grooveWidth);
    close(r.grooveDepth, c.grooveDepth);
    assert.equal(r.verified, c.verified);
  });

  it("internal 20 mm ring uses its own width, not the external ring's", () => {
    const c = circlipFixture.internalRing20;
    const r = computeGroove("boring", c.diameter);
    assert.ok(r);
    close(r.grooveDiameter, c.grooveDiameter);
    close(r.grooveWidth, c.grooveWidth);
    assert.notEqual(r.grooveWidth, computeGroove("as", c.diameter)?.grooveWidth);
    assert.equal(r.verified, c.verified);
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
    const c = circlipFixture.unverifiedRing30;
    const r = computeGroove("as", c.diameter);
    assert.ok(r);
    assert.equal(r.verified, c.verified);
    assert.equal(isVerifiedSeeger(c.diameter), c.verified);
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

type Iso2768Fixture = {
  linearSpotChecks: { size: number; class: "f" | "m" | "c" | "v"; expected: number }[];
  runoutByClass: Record<string, number>;
};
const iso2768Fixture = loadFixture<Iso2768Fixture>("iso2768");

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
  it("linear tolerance spot-checks match the ISO 2768-1 table", () => {
    for (const c of iso2768Fixture.linearSpotChecks) {
      assert.equal(lookupLinear(c.size)?.[c.class], c.expected, `${c.size}mm class ${c.class}`);
    }
  });

  it("class v has no defined value in the first band (2 mm), unlike f/m/c", () => {
    const row = lookupLinear(2);
    assert.ok(row);
    assert.equal(row.v, null);
    assert.ok(row.f != null && row.m != null && row.c != null);
  });

  it("circular run-out is a flat per-class value, independent of size", () => {
    for (const [cls, expected] of Object.entries(iso2768Fixture.runoutByClass)) {
      assert.equal(RUNOUT[cls as keyof typeof RUNOUT], expected, `class ${cls}`);
    }
  });
});

type OringFixture = {
  overfilled: {
    cordDiameter: number;
    squeezePercent: number;
    widthFactor: number;
    fillPercent: number;
    fillPercentTolerance: number;
    overfilled: boolean;
  };
  generousWidthFactor: {
    cordDiameter: number;
    squeezePercent: number;
    widthFactor: number;
    overfilled: boolean;
  };
};
const oringFixture = loadFixture<OringFixture>("oring-groove");

// E07 — O-ring groove: nominal cross-section fill must be checked, not just squeeze%.
describe("O-ring groove fill", () => {
  it("cord 3.55 mm, squeeze 30%, width factor 1.1 is overfilled (~102%)", () => {
    const c = oringFixture.overfilled;
    const r = computeOringGroove(c.cordDiameter, c.squeezePercent, c.widthFactor);
    assert.ok(r);
    assert.ok(r.fillPercent > 100, `expected >100%, got ${r.fillPercent}`);
    close(r.fillPercent, c.fillPercent, c.fillPercentTolerance);
    assert.equal(r.overfilled, c.overfilled);
  });

  it("a generous width factor is not overfilled", () => {
    const c = oringFixture.generousWidthFactor;
    const r = computeOringGroove(c.cordDiameter, c.squeezePercent, c.widthFactor);
    assert.ok(r);
    assert.equal(r.overfilled, c.overfilled);
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
type BeamFixture = {
  simplySupportedOffCentre: {
    F: number;
    L: number;
    a: number;
    E: number;
    I: number;
    deflectionAtLoad: number;
    deflectionMax: number;
    xMax: number;
    tolerance: number;
    xMaxTolerance: number;
  };
  cantileverAuditExample: {
    F: number;
    L: number;
    a: number;
    E: number;
    I: number;
    deflectionAtLoad: number;
    deflectionMax: number;
    xMax: number;
    tolerance: number;
  };
};
const beamFixture = loadFixture<BeamFixture>("beam-deflection");

describe("Beam deflection: at-load vs true maximum", () => {
  it("F=1000N, L=1000mm, a=200mm, E=210000, I=1e6: at-load 0.040635mm, max 0.057466mm at x=434.315mm", () => {
    const c = beamFixture.simplySupportedOffCentre;
    const r = computeBeam({ type: "opgelegd", F: c.F, L: c.L, a: c.a, E: c.E, I: c.I });
    assert.ok(r);
    close(r.deflectionAtLoad, c.deflectionAtLoad, c.tolerance);
    close(r.deflectionMax, c.deflectionMax, c.tolerance);
    close(r.xMax, c.xMax, c.xMaxTolerance);
    assert.ok(r.deflectionMax > r.deflectionAtLoad);
  });

  it("a centred load has the maximum coincide with the load", () => {
    const r = computeBeam({ type: "opgelegd", F: 1000, L: 1000, a: 500, E: 210000, I: 1e6 });
    assert.ok(r);
    close(r.deflectionAtLoad, r.deflectionMax, 1e-9);
    close(r.xMax, 500, 1e-9);
  });

  it("BEAM-001 (audit worked example): F=500N, L=800mm, a=300mm, E=210000, I=5e5 — at-load 0.04286mm, tip max 0.15000mm, NOT equal", () => {
    const c = beamFixture.cantileverAuditExample;
    const r = computeBeam({ type: "uitkraging", F: c.F, L: c.L, a: c.a, E: c.E, I: c.I });
    assert.ok(r);
    close(r.deflectionAtLoad, c.deflectionAtLoad, c.tolerance);
    close(r.deflectionMax, c.deflectionMax, c.tolerance);
    assert.equal(r.xMax, c.xMax);
    assert.ok(r.deflectionMax > r.deflectionAtLoad);
  });

  it("BEAM-001: independent check at a/L = 0.25, 0.50, 0.75, 1.00 — deflectionAtLoad = F*a^3/3EI, deflectionMax = F*a^2*(3L-a)/6EI", () => {
    const F = 500;
    const L = 800;
    const E = 210000;
    const I = 5e5;
    for (const ratio of [0.25, 0.5, 0.75, 1.0]) {
      const a = L * ratio;
      const r = computeBeam({ type: "uitkraging", F, L, a, E, I });
      assert.ok(r, `a/L=${ratio}`);
      close(r.deflectionAtLoad, (F * a ** 3) / (3 * E * I), 1e-9);
      close(r.deflectionMax, (F * a ** 2 * (3 * L - a)) / (6 * E * I), 1e-9);
      if (ratio < 1.0) {
        assert.ok(r.deflectionMax > r.deflectionAtLoad, `a/L=${ratio} should have max > at-load`);
      } else {
        close(r.deflectionAtLoad, r.deflectionMax, 1e-9);
      }
    }
  });

  it("a cantilever's maximum deflection is always at the tip, regardless of load position", () => {
    const r = computeBeam({ type: "uitkraging", F: 500, L: 800, a: 300, E: 210000, I: 5e5 });
    assert.ok(r);
    assert.equal(r.xMax, 800);
  });

  it("point-load reactions split by the lever rule (R_A = F*b/L, R_B = F*a/L)", () => {
    const r = computeBeam({ type: "opgelegd", F: 1000, L: 1000, a: 200, E: 210000, I: 1e6 });
    assert.ok(r);
    close(r.reactionA, 800);
    close(r.reactionB, 200);
    close(r.reactionA + r.reactionB, 1000);
  });

  it("a cantilever's fixed end carries the full point load, the free end carries none", () => {
    const r = computeBeam({ type: "uitkraging", F: 500, L: 800, a: 300, E: 210000, I: 5e5 });
    assert.ok(r);
    assert.equal(r.reactionA, 500);
    assert.equal(r.reactionB, 0);
  });
});

// STRUCT-001 — uniformly distributed load (UDL), full-span, both support conditions.
describe("Beam deflection: uniformly distributed load (STRUCT-001)", () => {
  it("simply supported, w=2 N/mm, L=1000mm, E=210000, I=1e6: matches 5wL^4/384EI and wL^2/8", () => {
    const w = 2;
    const L = 1000;
    const E = 210000;
    const I = 1e6;
    const r = computeBeam({ kind: "verdeeld", type: "opgelegd", w, L, E, I });
    assert.ok(r);
    close(r.deflectionMax, (5 * w * L ** 4) / (384 * E * I));
    close(r.momentMax, (w * L ** 2) / 8);
    close(r.xMax, L / 2);
    close(r.reactionA, (w * L) / 2);
    close(r.reactionB, (w * L) / 2);
    close(r.deflectionAtLoad, r.deflectionMax);
  });

  it("cantilever, w=2 N/mm, L=800mm: matches wL^4/8EI and wL^2/2, all reaction at the fixed end", () => {
    const w = 2;
    const L = 800;
    const E = 210000;
    const I = 5e5;
    const r = computeBeam({ kind: "verdeeld", type: "uitkraging", w, L, E, I });
    assert.ok(r);
    close(r.deflectionMax, (w * L ** 4) / (8 * E * I));
    close(r.momentMax, (w * L ** 2) / 2);
    close(r.xMax, L);
    close(r.reactionA, w * L);
    assert.equal(r.reactionB, 0);
  });

  it("a UDL's total reaction always equals the total load w*L, for either support condition", () => {
    const w = 3.5;
    const L = 1200;
    const ss = computeBeam({ kind: "verdeeld", type: "opgelegd", w, L, E: 210000, I: 1e6 })!;
    const cant = computeBeam({ kind: "verdeeld", type: "uitkraging", w, L, E: 210000, I: 1e6 })!;
    close(ss.reactionA + ss.reactionB, w * L);
    close(cant.reactionA + cant.reactionB, w * L);
  });

  it("invalid inputs (negative w, non-positive L/E/I) return null", () => {
    assert.equal(
      computeBeam({ kind: "verdeeld", type: "opgelegd", w: -1, L: 1000, E: 210000, I: 1e6 }),
      null,
    );
    assert.equal(
      computeBeam({ kind: "verdeeld", type: "opgelegd", w: 2, L: 0, E: 210000, I: 1e6 }),
      null,
    );
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

// ROAD-001 — bearing life (L10/L10h) per ISO 281.
type BearingLifeFixture = {
  ballBearing: { C: number; P: number; type: "ball"; l10Millions: number };
  l10Hours: { l10Millions: number; rpm: number; hours: number; tolerance: number };
  reliability95: { a1: number };
};
const bearingLifeFixture = loadFixture<BearingLifeFixture>("bearing-life");

describe("Bearing life (L10/L10h, ISO 281)", () => {
  it("C=10 kN, P=2 kN, ball bearing: L10 = (10/2)^3 = 125 million revolutions", () => {
    const c = bearingLifeFixture.ballBearing;
    const l10M = l10Millions(c.C, c.P, c.type);
    assert.ok(l10M != null);
    close(l10M, c.l10Millions);
  });

  it("125 million rev at 1500 rpm gives L10h = 1388.9 h", () => {
    const c = bearingLifeFixture.l10Hours;
    const l10h = l10Hours(c.l10Millions, c.rpm);
    assert.ok(l10h != null);
    close(l10h, c.hours, c.tolerance);
  });

  it("roller bearings use a different life exponent (10/3) than ball bearings (3), so life diverges once C/P != 1", () => {
    const ball = l10Millions(10, 2, "ball");
    const roller = l10Millions(10, 2, "roller");
    assert.ok(ball != null && roller != null);
    assert.notEqual(roller, ball);
    // C/P = 5 > 1, and 10/3 > 3, so the larger exponent predicts the longer life here.
    assert.ok(roller > ball);
  });

  it("95% reliability (a1=0.62) shortens the adjusted life proportionally", () => {
    const l10M = l10Millions(10, 2, "ball")!;
    const a1 = bearingLifeFixture.reliability95.a1;
    assert.equal(a1For("95"), a1);
    close(adjustedLife(l10M, a1For("95")), 125 * a1);
  });

  it("static safety factor S0 = C0/P0 and its status bands", () => {
    assert.equal(staticSafetyFactor(8, 3), 8 / 3);
    assert.equal(staticSafetyStatus(0.8), "fail");
    assert.equal(staticSafetyStatus(1.2), "caution");
    assert.equal(staticSafetyStatus(2.5), "ok");
  });

  it("invalid inputs (zero/negative load or speed) return null, not Infinity/NaN", () => {
    assert.equal(l10Millions(10, 0, "ball"), null);
    assert.equal(l10Millions(0, 2, "ball"), null);
    assert.equal(l10Hours(125, 0), null);
    assert.equal(staticSafetyFactor(8, 0), null);
  });
});

type BoltedJointFixture = {
  noExternalLoad: {
    As: number;
    Rp: number;
    FV: number;
    FZ: number;
    phi: number;
    FA: number;
    FKreq: number;
    fVRest: number;
    fKR: number;
    fSmax: number;
  };
  withExternalLoad: {
    As: number;
    Rp: number;
    FV: number;
    FZ: number;
    phi: number;
    FA: number;
    FKreq: number;
    fKR: number;
    fSmax: number;
  };
  overloadedJoint: {
    As: number;
    Rp: number;
    FV: number;
    FZ: number;
    phi: number;
    FA: number;
    FKreq: number;
  };
};
const boltedJointFixture = loadFixture<BoltedJointFixture>("bolted-joint");

// ROAD-001 — bolted-joint static verification, VDI 2230-lite.
describe("Bolted joint (VDI 2230-lite static verification)", () => {
  it("no external load: residual clamp load equals preload minus embedding loss, bolt force equals that too", () => {
    const c = boltedJointFixture.noExternalLoad;
    const r = computeBoltedJoint(c);
    assert.ok(r);
    close(r.fVRest, c.fVRest);
    close(r.fKR, c.fKR);
    close(r.fSmax!, c.fSmax);
  });

  it("external load splits by the load factor phi between clamp-load loss and bolt-force increase", () => {
    const c = boltedJointFixture.withExternalLoad;
    const r = computeBoltedJoint(c);
    // F_KR = 19 - (1-0.25)*8 = 19 - 6 = 13
    assert.ok(r);
    close(r.fKR, c.fKR);
    // F_Smax = 19 + 0.25*8 = 21
    close(r.fSmax!, c.fSmax);
  });

  it("bolt stress and safety factor follow from F_Smax / As and Rp/sigma", () => {
    const c = boltedJointFixture.withExternalLoad;
    const r = computeBoltedJoint(c);
    assert.ok(r && r.sigmaS != null && r.safetyFactor != null);
    close(r.sigmaS, (c.fSmax * 1000) / c.As, 1e-6);
    close(r.safetyFactor, c.Rp / r.sigmaS, 1e-6);
  });

  it("clamp status fails once F_KR drops below the required minimum, cautions within 10% margin", () => {
    assert.equal(clampStatus(9, 10), "fail");
    assert.equal(clampStatus(10.5, 10), "caution");
    assert.equal(clampStatus(12, 10), "ok");
  });

  it("bolt safety status follows the VDI 2230-style 1.0/1.2 bands", () => {
    assert.equal(boltSafetyStatus(0.9), "fail");
    assert.equal(boltSafetyStatus(1.1), "caution");
    assert.equal(boltSafetyStatus(1.5), "ok");
  });

  it("a separated joint suppresses the closed-joint bolt force, stress and safety", () => {
    const c = boltedJointFixture.overloadedJoint;
    const r = computeBoltedJoint(c);
    assert.ok(r);
    assert.equal(r.separated, true);
    assert.equal(r.fSmax, null);
    assert.equal(r.sigmaS, null);
    assert.equal(r.safetyFactor, null);
    assert.equal(clampStatus(r.fKR, c.FKreq), "fail");
    assert.equal(boltSafetyStatus(r.safetyFactor), "fail");
  });

  it("rejects nonfinite and physically invalid input for every field", () => {
    const base = boltedJointFixture.withExternalLoad;
    for (const key of ["As", "Rp", "FV", "FZ", "phi", "FA", "FKreq"]) {
      for (const value of [NaN, Infinity, -Infinity, -1]) {
        assert.equal(computeBoltedJoint({ ...base, [key]: value }), null, `${key}=${value}`);
      }
    }
    for (const patch of [{ As: 0 }, { Rp: 0 }, { FV: 0 }, { phi: 1.01 }, { FZ: 21 }]) {
      assert.equal(computeBoltedJoint({ ...base, ...patch }), null);
    }
  });

  it("handles separation boundary, zero demand, and phi endpoints", () => {
    const base = { ...boltedJointFixture.withExternalLoad, FV: 20, FZ: 0, phi: 0.5, FKreq: 0 };
    assert.equal(computeBoltedJoint({ ...base, FA: 39 })?.separated, false);
    assert.equal(computeBoltedJoint({ ...base, FA: 40 })?.separated, true);
    assert.equal(computeBoltedJoint({ ...base, FA: 41 })?.separated, true);
    assert.equal(computeBoltedJoint({ ...base, FA: 0, FZ: 20 })?.separated, true);
    assert.equal(computeBoltedJoint({ ...base, phi: 0, FA: 5 })?.fSmax, 20);
    assert.equal(computeBoltedJoint({ ...base, phi: 1, FA: 5 })?.fSmax, 25);
    assert.equal(clampStatus(0, 0), "fail");
    assert.equal(clampStatus(NaN, 0), "fail");
    assert.equal(boltSafetyStatus(Infinity), "fail");
  });
});

// PNEU-001 — friction-derated force and free-air consumption.
describe("Pneumatic cylinder: efficiency and air consumption (PNEU-001)", () => {
  it("effective force is the theoretical force scaled by the efficiency factor", () => {
    close(effectiveForce(1000, 0.9), 900);
    close(effectiveForce(1000, 1), 1000);
  });

  it("air consumption per cycle matches (A_extend+A_retract)*stroke*(p+1.013)/1.013, in liters", () => {
    const bore = 32;
    const rod = 12;
    const stroke = 100;
    const pBar = 6;
    const expected =
      ((circleArea(bore) + annulusArea(bore, rod)) * stroke * ((pBar + 1.013) / 1.013)) / 1e6;
    close(airConsumptionPerCycleL(bore, rod, stroke, pBar), expected, 1e-9);
  });

  it("air consumption scales linearly with cycle rate", () => {
    const perCycle = airConsumptionPerCycleL(32, 12, 100, 6);
    close(airConsumptionPerMinuteL(perCycle, 10), perCycle * 10);
    close(airConsumptionPerMinuteL(perCycle, 0), 0);
  });

  it("higher pressure increases air consumption for the same geometry", () => {
    const low = airConsumptionPerCycleL(32, 12, 100, 4);
    const high = airConsumptionPerCycleL(32, 12, 100, 8);
    assert.ok(high > low);
  });
});

type ShaftTorsionFixture = {
  worked: { torque: number; tauAllow: number; diameterMm: number; tolerance: number };
  stressCheck: { torque: number; diameterMm: number; expectedStress: number; tolerance: number };
};
const shaftFixture = loadFixture<ShaftTorsionFixture>("shaft-torsion");

describe("Shaft diameter under torsion (tau = 16T/(pi*d^3))", () => {
  it("T=50 N.m, tau_allow=40 N/mm^2 gives d_min matching the closed-form solution", () => {
    const c = shaftFixture.worked;
    const d = shaftDiameterForTorque(c.torque, c.tauAllow);
    assert.ok(d != null);
    close(d, c.diameterMm, c.tolerance);
  });

  it("the resulting stress at d_min equals the allowable stress exactly (round trip)", () => {
    const c = shaftFixture.stressCheck;
    const stress = shaftTorsionStress(c.torque, c.diameterMm);
    assert.ok(stress != null);
    close(stress, c.expectedStress, c.tolerance);
  });

  it("a larger diameter carrying the same torque has lower stress", () => {
    const small = shaftTorsionStress(50, 15);
    const large = shaftTorsionStress(50, 25);
    assert.ok(small != null && large != null);
    assert.ok(large < small);
  });

  it("invalid inputs (zero/negative torque or stress/diameter) return null", () => {
    assert.equal(shaftDiameterForTorque(0, 40), null);
    assert.equal(shaftDiameterForTorque(50, 0), null);
    assert.equal(shaftDiameterForTorque(-10, 40), null);
    assert.equal(shaftTorsionStress(50, 0), null);
  });

  it("safety status follows the 1.0/1.2 screening bands", () => {
    assert.equal(shaftSafetyStatus(0.9), "fail");
    assert.equal(shaftSafetyStatus(1.1), "caution");
    assert.equal(shaftSafetyStatus(1.5), "ok");
  });
});

type FastenersFixture = {
  clearanceM10: { fine: number; medium: number; coarse: number };
  wrenchM10: { hex: number; socket: number };
  torqueM10_8dot8: {
    size: "M10";
    propertyClass: string;
    K: number;
    utilization: number;
    As: number;
    Rp: number;
    preload: number;
    torque: number;
    tolerance: number;
  };
};
const fastenersFixture = loadFixture<FastenersFixture>("fasteners");

describe("Fasteners (ISO 273 clearance / ISO 4014-4017/4762 wrench / ISO 898-1 torque)", () => {
  it("M10 clearance holes match ISO 273 fine/medium/coarse", () => {
    assert.deepEqual(CLEARANCE_HOLES.M10, fastenersFixture.clearanceM10);
  });

  it("M10 wrench sizes match ISO 4014/4017 (hex) and ISO 4762/DIN 912 (socket)", () => {
    assert.deepEqual(WRENCH_SIZES.M10, fastenersFixture.wrenchM10);
  });

  it("M10 class 8.8 torque at K=0.2, utilization=0.75 matches the worked case", () => {
    const c = fastenersFixture.torqueM10_8dot8;
    const cls = PROPERTY_CLASSES.find((p) => p.id === c.propertyClass);
    assert.ok(cls);
    const r = computeTorque(c.size, cls, c.K, c.utilization);
    assert.equal(r.As, STRESS_AREA.M10);
    close(r.As, c.As, c.tolerance);
    close(r.Rp, c.Rp, c.tolerance);
    close(r.preload, c.preload, c.tolerance);
    close(r.torque, c.torque, c.tolerance);
  });
});
