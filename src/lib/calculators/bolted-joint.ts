/**
 * Bolted-joint static verification, VDI 2230-lite scope.
 *
 * This checks the two classic VDI 2230 boundary cases for a concentrically
 * loaded, non-eccentric bolted joint under a static axial working load:
 * the joint must stay clamped (residual clamp force after embedding losses
 * and load introduction), and the bolt must stay below yield under the
 * resulting maximum bolt force. What this does NOT cover, per the audit's
 * "minimum useful scope" for a *lite* tool: eccentric/bending loads on the
 * joint, transverse (shear) load and the friction-grip check that goes with
 * it, dynamic/fatigue endurance (VDI 2230's alternating-stress check), the
 * embedding-loss table (the user supplies F_Z directly, e.g. from VDI 2230
 * Table 5 or a measured value), and torsional stress from tightening
 * (the reduced-stress interaction during tightening is not modelled — only
 * the static bolt stress under working load is checked).
 */

export type BoltedJointInput = {
  /** Stress area A_s (mm^2) — from the fastener's thread size. */
  As: number;
  /** 0.2% yield stress Rp0.2 (N/mm^2) of the bolt's property class. */
  Rp: number;
  /** Assembly preload F_V (kN), e.g. from a torque calculation or datasheet. */
  FV: number;
  /** Embedding/settling loss F_Z (kN) — plastic relaxation of the clamped parts after tightening. */
  FZ: number;
  /** Load factor (resilience factor) Phi_en, 0-1 — the fraction of the external load the bolt itself absorbs. */
  phi: number;
  /** External axial working load per bolt F_A (kN). */
  FA: number;
  /** Minimum required residual clamp load F_Kerf (kN) — from sealing or friction-joint requirements. */
  FKreq: number;
};

export type BoltedJointResult = {
  /** Preload remaining after embedding losses: F_V - F_Z. */
  fVRest: number;
  /** Residual clamp load under full working load (minimum boundary case). */
  fKR: number;
  /** Maximum bolt force under full working load (maximum boundary case). */
  fSmax: number | null;
  /** Bolt stress under F_Smax. */
  sigmaS: number | null;
  /** Static safety factor against yielding, Rp0.2 / sigma_S. */
  safetyFactor: number | null;
  separated: boolean;
};

export function computeBoltedJoint(input: BoltedJointInput): BoltedJointResult | null {
  const { As, Rp, FV, FZ, phi, FA, FKreq } = input;
  if (
    ![As, Rp, FV, FZ, phi, FA, FKreq].every(Number.isFinite) ||
    As <= 0 ||
    Rp <= 0 ||
    FV <= 0 ||
    FZ < 0 ||
    FZ > FV ||
    phi < 0 ||
    phi > 1 ||
    FA < 0 ||
    FKreq < 0
  )
    return null;
  const fVRest = FV - FZ;
  const fKR = fVRest - (1 - phi) * FA;
  // Zero is the onset of separation. A negative balance is diagnostic only,
  // not a physical tensile clamp load. Do not extrapolate the closed model.
  if (fKR <= 0)
    return { fVRest, fKR, separated: true, fSmax: null, sigmaS: null, safetyFactor: null };
  const fSmax = fVRest + phi * FA;
  const sigmaS = (fSmax * 1000) / As;
  const safetyFactor = Rp / sigmaS;
  if (![fVRest, fKR, fSmax, sigmaS, safetyFactor].every(Number.isFinite)) return null;
  return { fVRest, fKR, fSmax, sigmaS, safetyFactor, separated: false };
}

export type JointStatus = "fail" | "caution" | "ok";

/**
 * Clamp check: the joint must stay closed under the full working load. The
 * 10% caution margin is a Mechify screening threshold, not a VDI 2230 table
 * value — VDI 2230 doesn't publish one fixed number here (the required
 * minimum residual clamp load F_Kerf itself, which the user supplies, is
 * where the real margin decision belongs).
 */
export function clampStatus(fKR: number, fKreq: number): JointStatus {
  if (!Number.isFinite(fKR) || !Number.isFinite(fKreq) || fKreq < 0 || fKR <= 0) return "fail";
  if (fKR < fKreq) return "fail";
  if (fKR < fKreq * 1.1) return "caution";
  return "ok";
}

/**
 * Static bolt safety bands: below 1.0 the bolt yields under the assumed
 * working load, so that boundary is a direct physical fact. The 1.0-1.2
 * "caution" band is a Mechify screening threshold reflecting the commonly
 * cited practice of targeting S_F >= 1.0-1.2 depending on how accurately
 * the working load is known — it is not a specific VDI 2230 clause value;
 * VDI 2230 itself does not mandate one fixed safety factor.
 */
export function boltSafetyStatus(sf: number | null): JointStatus {
  if (sf === null || !Number.isFinite(sf)) return "fail";
  if (sf < 1.0) return "fail";
  if (sf < 1.2) return "caution";
  return "ok";
}

export function fmtBoltedJoint(n: number, digits = 2): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
