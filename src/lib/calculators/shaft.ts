/**
 * Shaft diameter for pure torsion, classic mechanics-of-materials formula.
 *
 * For a solid round shaft, the maximum shear stress at the outer surface is
 * tau = 16*T / (pi*d^3) (from tau = T*r/J with J = pi*d^4/32, r = d/2).
 * Solving for d gives the minimum diameter that keeps that stress at or
 * below an allowable shear stress the user supplies (from a material's
 * yield/ultimate shear strength and their own safety factor, or a design
 * code) — Roark's Formulas for Stress and Strain / Shigley's Mechanical
 * Engineering Design.
 *
 * What this does NOT cover: combined loading (bending, axial or transverse
 * shear from a gear/pulley/sprocket — most real shafts see this, and it
 * usually governs, not pure torsion alone), stress concentration at
 * keyways/shoulders/holes, fatigue (a rotating shaft under steady torque
 * plus alternating bending is a fatigue problem, not a static one),
 * stiffness (twist angle, lateral deflection, critical speed), and hollow
 * shaft sections (solid round shaft only).
 */

/** T in N·m, tauAllow in N/mm² (MPa). Returns null for non-physical inputs. */
export function shaftDiameterForTorque(T: number, tauAllow: number): number | null {
  if (!(T > 0) || !(tauAllow > 0)) return null;
  const T_Nmm = T * 1000;
  return Math.cbrt((16 * T_Nmm) / (Math.PI * tauAllow));
}

/** Shear stress (N/mm²) in a solid round shaft of diameter d (mm) under torque T (N·m). */
export function shaftTorsionStress(T: number, d: number): number | null {
  if (!(T > 0) || !(d > 0)) return null;
  const T_Nmm = T * 1000;
  return (16 * T_Nmm) / (Math.PI * d ** 3);
}

export type ShaftStatus = "fail" | "caution" | "ok";

/**
 * Reserve band for entered allowable shear stress / calculated shear stress.
 * Below 1.0 the entered allowable is exceeded; yielding cannot be inferred
 * because that allowable may already incorporate a design safety factor.
 * The 1.0/1.2 band is a Mechify screening threshold, not a code requirement.
 */
export function shaftSafetyStatus(safetyFactor: number): ShaftStatus {
  if (safetyFactor < 1.0) return "fail";
  if (safetyFactor < 1.2) return "caution";
  return "ok";
}
