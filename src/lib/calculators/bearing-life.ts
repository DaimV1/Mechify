/**
 * Rolling bearing life rating per ISO 281 — L10/L10h basic rating life,
 * the adjusted (reliability-modified) life, and a static safety factor.
 *
 * Scope, per the audit's "Minimum useful scope" for this module: basic
 * dynamic/static rating life only. This is NOT a full bearing selection —
 * it takes the dynamic/static load ratings C/C0 as given (from the
 * manufacturer's catalogue for the bearing already chosen) and the
 * equivalent dynamic/static loads P/P0 as given (computed elsewhere from
 * the actual radial/axial load split and the bearing's own X/Y factors,
 * which vary by bearing type and load ratio and are not modelled here).
 * Lubrication/contamination life modifiers (ISO 281's a_ISO factor) are
 * also not included — only the classic L10 dynamic life and the a1
 * reliability modifier.
 */

export type BearingLoadType = "ball" | "roller";

export const BEARING_LOAD_TYPES: { id: BearingLoadType; label: string; labelEn: string }[] = [
  { id: "ball", label: "Kogellager (p = 3)", labelEn: "Ball bearing (p = 3)" },
  { id: "roller", label: "Rollager (p = 10/3)", labelEn: "Roller bearing (p = 10/3)" },
];

/** Life exponent p in L10 = (C/P)^p — 3 for ball bearings, 10/3 for roller bearings (ISO 281). */
export function lifeExponent(type: BearingLoadType): number {
  return type === "ball" ? 3 : 10 / 3;
}

/**
 * ISO 281 standard a1 reliability factors, relative to 90% reliability
 * (a1 = 1 at L10). Higher reliability shortens the rated life at the same
 * failure-probability confidence.
 */
export const RELIABILITY_LEVELS: { id: string; reliability: number; a1: number }[] = [
  { id: "90", reliability: 90, a1: 1 },
  { id: "95", reliability: 95, a1: 0.62 },
  { id: "96", reliability: 96, a1: 0.53 },
  { id: "97", reliability: 97, a1: 0.44 },
  { id: "98", reliability: 98, a1: 0.33 },
  { id: "99", reliability: 99, a1: 0.21 },
];

export function a1For(reliabilityId: string): number {
  return RELIABILITY_LEVELS.find((r) => r.id === reliabilityId)?.a1 ?? 1;
}

/** L10 basic rating life in millions of revolutions. C and P in the same unit (kN or N). */
export function l10Millions(C: number, P: number, type: BearingLoadType): number | null {
  if (!(C > 0) || !(P > 0)) return null;
  return Math.pow(C / P, lifeExponent(type));
}

/** L10h basic rating life in operating hours, at constant speed n (rpm). */
export function l10Hours(l10M: number, rpm: number): number | null {
  if (!(l10M >= 0) || !(rpm > 0)) return null;
  return (l10M * 1e6) / (60 * rpm);
}

/** Reliability-adjusted life (Lna) in the same unit as l10 (millions of revolutions, or hours). */
export function adjustedLife(l10: number, a1: number): number {
  return l10 * a1;
}

/** Static safety factor S0 = C0 / P0 — no time dimension, just a load margin against permanent deformation at the most stressed contact. */
export function staticSafetyFactor(C0: number, P0: number): number | null {
  if (!(C0 >= 0) || !(P0 > 0)) return null;
  return C0 / P0;
}

/**
 * SKF-style static safety guidance: S0 >= 1 is the bare minimum for
 * rotating bearings under normal service; shock/vibration loads or high
 * precision/quiet-running requirements call for S0 >= 1.5-2 (ball) or
 * >= 1.5-2.5 (roller, higher because roller contact is less forgiving of
 * local overload). This tool flags below 1.0 as failing and 1.0-1.5 as a
 * caution band rather than asserting one universal number.
 */
export function staticSafetyStatus(S0: number): "fail" | "caution" | "ok" {
  if (S0 < 1) return "fail";
  if (S0 < 1.5) return "caution";
  return "ok";
}

export function fmtBearingLife(n: number, digits = 0): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
