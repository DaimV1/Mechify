import assert from "node:assert/strict";
import { test } from "node:test";
import { driveResult, ratioResult, forceResult } from "../src/lib/calculators/drive.ts";
import { convert, findCategory, UNIT_CATEGORIES } from "../src/lib/calculators/units.ts";
import { bendDeduction } from "../src/lib/calculators/bending.ts";
import { computeMotor } from "../src/lib/calculators/motor.ts";
import { computeBeam } from "../src/lib/calculators/beam.ts";
const close = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-8 * Math.max(1, Math.abs(b)), `${a} != ${b}`);
test("Drive: all three unknowns and comma decimals", () => {
  const torque = driveResult("torque", { power: "0,75", speed: "1500" });
  close(torque, 4.77464829275686);
  close(driveResult("power", { torque: String(torque), speed: "1500" }), 0.75);
  close(driveResult("speed", { torque: String(torque), power: ".75" }), 1500);
});
test("Drive: missing, nonfinite and singular values", () => {
  for (const speed of ["0", "", "NaN", "Infinity", "-10"])
    assert.throws(() => driveResult("torque", { power: ".75", speed }));
  assert.equal(driveResult("torque", { power: "0", speed: "1500" }), 0);
});
test("Ratio conserves theoretical power and applies efficiency once", () => {
  assert.deepEqual(ratioResult({ ratio: "10", speed: "1500", torque: "8", efficiency: "92" }), {
    speed: 150,
    torque: 73.6,
  });
  assert.throws(() => ratioResult({ ratio: "0", speed: "1500", torque: "8", efficiency: "92" }));
});
test("Cylinder areas and explicit efficiency", () => {
  const r = forceResult({ pressure: "6", diameter: "50", rod: "20", efficiency: "90" });
  close(r.extend, 1060.28752059);
  close(r.retract, 890.64151729);
  for (const rod of ["50", "60"])
    assert.throws(() => forceResult({ pressure: "6", diameter: "50", rod, efficiency: "90" }));
});
test("SI/imperial conversion fixtures", () => {
  close(convert(1, findCategory("length"), "inch", "mm"), 25.4);
  close(convert(1, findCategory("power"), "kw", "w"), 1000);
  close(convert(-40, findCategory("temperature"), "c", "f"), -40);
  close(convert(1, findCategory("pressure"), "bar", "pa"), 100000);
});
test("Every converter pair roundtrips signed values", () => {
  for (const c of UNIT_CATEGORIES)
    for (const a of c.units)
      for (const b of c.units)
        for (const v of [-40, 0, 1, 123.45])
          close(convert(convert(v, c, a.id, b.id), c, b.id, a.id), v);
});
test("180 degree bending is excluded; regular cases unchanged", () => {
  assert.ok(Number.isNaN(bendDeduction(180, 2, 2, 0.4)));
  close(bendDeduction(90, 2, 2, 0.4), 8 - 1.4 * Math.PI);
});
test("Motor rejects nonphysical efficiency and infinity", () => {
  const args = { force: 100, speedMs: 0.5, diameterMm: 100, efficiency: 0.9, safety: 1.2 };
  close(computeMotor(args)!.shaftPowerW, (100 * 0.5) / 0.9);
  assert.equal(computeMotor({ ...args, efficiency: 1.1 }), null);
  assert.equal(computeMotor({ ...args, force: Infinity }), null);
});
test("Beam load and tip formulas with off-centre and zero load", () => {
  const args = { type: "opgelegd" as const, F: 1000, L: 1000, a: 500, E: 200000, I: 10000 };
  close(computeBeam(args)!.deflection, (1000 * 1000 ** 3) / (48 * 200000 * 10000));
  close(
    computeBeam({ ...args, type: "uitkraging", a: 1000 })!.deflection,
    (1000 * 1000 ** 3) / (3 * 200000 * 10000),
  );
  assert.equal(computeBeam({ ...args, a: 0 }), null);
  assert.equal(computeBeam({ ...args, F: 0 })!.deflection, 0);
});
