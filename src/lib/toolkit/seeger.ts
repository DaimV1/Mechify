/** Seegerringgroef: DIN 471 (as) / DIN 472 (boring), workshop table. */
export type SeegerKind = "as" | "boring";

/**
 * bAs/bBor were a single shared `b` field until the September 2026 audit
 * found this wrong for at least one confirmed size: at d1=20 mm, Rotor
 * Clip's external DSH-20 (DIN 471) groove is 1.3 mm wide but its internal
 * DHO-20 (DIN 472) groove is 1.1 mm — a real difference the workshop table
 * this file was built from had collapsed into one column. Only the sizes in
 * VERIFIED_SEEGER_D1 have bAs/bBor independently checked against a
 * manufacturer datasheet; every other row still carries its pre-audit value
 * in both columns (unchanged, not re-derived) and MUST be confirmed against
 * DIN 471/472 or the ring manufacturer's catalogue before production use.
 */
export type SeegerRow = {
  d1: number;
  d2as: number | null;
  d2bor: number | null;
  bAs: number;
  bBor: number;
};

/** d1 values where bAs and bBor have each been checked against a manufacturer datasheet (see the SeegerRow comment). */
export const VERIFIED_SEEGER_D1: ReadonlySet<number> = new Set([20]);

export function isVerifiedSeeger(d1: number): boolean {
  return VERIFIED_SEEGER_D1.has(d1);
}

export const SEEGER: SeegerRow[] = [
  { d1: 3, d2as: 2.8, d2bor: null, bAs: 0.5, bBor: 0.5 },
  { d1: 4, d2as: 3.8, d2bor: null, bAs: 0.5, bBor: 0.5 },
  { d1: 5, d2as: 4.8, d2bor: null, bAs: 0.7, bBor: 0.7 },
  { d1: 6, d2as: 5.7, d2bor: null, bAs: 0.8, bBor: 0.8 },
  { d1: 7, d2as: 6.7, d2bor: null, bAs: 0.9, bBor: 0.9 },
  { d1: 8, d2as: 7.6, d2bor: 8.4, bAs: 0.9, bBor: 0.9 },
  { d1: 9, d2as: 8.6, d2bor: 9.4, bAs: 1.1, bBor: 1.1 },
  { d1: 10, d2as: 9.6, d2bor: 10.4, bAs: 1.1, bBor: 1.1 },
  { d1: 11, d2as: 10.5, d2bor: 11.4, bAs: 1.1, bBor: 1.1 },
  { d1: 12, d2as: 11.5, d2bor: 12.5, bAs: 1.1, bBor: 1.1 },
  { d1: 13, d2as: 12.4, d2bor: 13.6, bAs: 1.1, bBor: 1.1 },
  { d1: 14, d2as: 13.4, d2bor: 14.6, bAs: 1.1, bBor: 1.1 },
  { d1: 15, d2as: 14.3, d2bor: 15.7, bAs: 1.1, bBor: 1.1 },
  { d1: 16, d2as: 15.2, d2bor: 16.8, bAs: 1.1, bBor: 1.1 },
  { d1: 17, d2as: 16.2, d2bor: 17.8, bAs: 1.1, bBor: 1.1 },
  { d1: 18, d2as: 17.0, d2bor: 19.0, bAs: 1.3, bBor: 1.3 },
  { d1: 19, d2as: 18.0, d2bor: 20.0, bAs: 1.3, bBor: 1.3 },
  { d1: 20, d2as: 19.0, d2bor: 21.0, bAs: 1.3, bBor: 1.1 },
  { d1: 21, d2as: 20.0, d2bor: 22.0, bAs: 1.3, bBor: 1.3 },
  { d1: 22, d2as: 21.0, d2bor: 23.0, bAs: 1.3, bBor: 1.3 },
  { d1: 24, d2as: 22.9, d2bor: 25.2, bAs: 1.3, bBor: 1.3 },
  { d1: 25, d2as: 23.9, d2bor: 26.2, bAs: 1.3, bBor: 1.3 },
  { d1: 26, d2as: 24.9, d2bor: 27.2, bAs: 1.3, bBor: 1.3 },
  { d1: 28, d2as: 26.6, d2bor: 29.4, bAs: 1.6, bBor: 1.6 },
  { d1: 30, d2as: 28.6, d2bor: 31.4, bAs: 1.6, bBor: 1.6 },
  { d1: 32, d2as: 30.3, d2bor: 33.7, bAs: 1.6, bBor: 1.6 },
  { d1: 35, d2as: 33.0, d2bor: 37.0, bAs: 1.6, bBor: 1.6 },
  { d1: 36, d2as: 34.0, d2bor: 38.0, bAs: 1.85, bBor: 1.85 },
  { d1: 38, d2as: 36.0, d2bor: 40.0, bAs: 1.85, bBor: 1.85 },
  { d1: 40, d2as: 37.5, d2bor: 42.5, bAs: 1.85, bBor: 1.85 },
  { d1: 42, d2as: 39.5, d2bor: 44.5, bAs: 1.85, bBor: 1.85 },
  { d1: 45, d2as: 42.5, d2bor: 47.5, bAs: 1.85, bBor: 1.85 },
  { d1: 48, d2as: 45.5, d2bor: 50.5, bAs: 1.85, bBor: 1.85 },
  { d1: 50, d2as: 47.0, d2bor: 53.0, bAs: 2.15, bBor: 2.15 },
  { d1: 52, d2as: 49.0, d2bor: 55.0, bAs: 2.15, bBor: 2.15 },
  { d1: 55, d2as: 52.0, d2bor: 58.0, bAs: 2.15, bBor: 2.15 },
  { d1: 58, d2as: 55.0, d2bor: 61.0, bAs: 2.15, bBor: 2.15 },
  { d1: 60, d2as: 57.0, d2bor: 63.0, bAs: 2.15, bBor: 2.15 },
  { d1: 62, d2as: 59.0, d2bor: 65.0, bAs: 2.15, bBor: 2.15 },
  { d1: 65, d2as: 62.0, d2bor: 68.0, bAs: 2.65, bBor: 2.65 },
  { d1: 68, d2as: 65.0, d2bor: 71.0, bAs: 2.65, bBor: 2.65 },
  { d1: 70, d2as: 67.0, d2bor: 73.0, bAs: 2.65, bBor: 2.65 },
  { d1: 72, d2as: 69.0, d2bor: 75.0, bAs: 2.65, bBor: 2.65 },
  { d1: 75, d2as: 72.0, d2bor: 78.0, bAs: 2.65, bBor: 2.65 },
  { d1: 78, d2as: 75.0, d2bor: 81.0, bAs: 2.65, bBor: 2.65 },
  { d1: 80, d2as: 76.5, d2bor: 83.5, bAs: 2.65, bBor: 2.65 },
  { d1: 85, d2as: 81.5, d2bor: 88.5, bAs: 3.15, bBor: 3.15 },
  { d1: 90, d2as: 86.5, d2bor: 93.5, bAs: 3.15, bBor: 3.15 },
  { d1: 95, d2as: 91.5, d2bor: 98.5, bAs: 3.15, bBor: 3.15 },
  { d1: 100, d2as: 96.5, d2bor: 103.5, bAs: 3.15, bBor: 3.15 },
];

export function grooveDepth(d1: number, d2: number) {
  return Math.round(Math.abs(d1 - d2) * 50) / 100;
}

export function lookupSeeger(d1: number) {
  return SEEGER.find((row) => row.d1 === d1) ?? null;
}

/** ISO 286-1 IT11 in mm, for the groove diameter d₂. */
export function it11(d: number) {
  if (d <= 3) return 0.06;
  if (d <= 6) return 0.075;
  if (d <= 10) return 0.09;
  if (d <= 18) return 0.11;
  if (d <= 30) return 0.13;
  if (d <= 50) return 0.16;
  if (d <= 80) return 0.19;
  return 0.22;
}

/** t 0 / +IT11/2 — dieper mag (d₂ h11 as, H11 boring), ondieper niet. */
export function depthPlus(d2: number) {
  return Math.round((it11(d2) / 2) * 1000) / 1000;
}

export function seegerFor(row: SeegerRow, kind: SeegerKind) {
  const d2 = kind === "as" ? row.d2as : row.d2bor;
  if (d2 == null) return null;
  const t = grooveDepth(row.d1, d2);
  return {
    d2,
    b: kind === "as" ? row.bAs : row.bBor,
    t,
    d2Class: kind === "as" ? "h11" : "H11",
    tPlus: depthPlus(d2),
    verified: isVerifiedSeeger(row.d1),
  };
}

export function fmtSeeger(n: number) {
  const digits = Number.isInteger(n) ? 0 : Math.round(n * 10) === n * 10 ? 1 : 2;
  return n.toFixed(digits).replace(".", ",");
}

export function fmtSeeger3(n: number) {
  return n.toFixed(3).replace(".", ",").replace(/0+$/, "").replace(/,$/, ",0");
}
