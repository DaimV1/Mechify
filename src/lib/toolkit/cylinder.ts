/**
 * Theoretical pneumatic cylinder force. F = p·A, gauge pressure. No
 * friction, no Festo/SMC type code.
 *
 * ENG-004 (audit, 17 sept 2026): this used to keep its own separate bore/rod
 * table, which disagreed with calculators/pneumatic.ts's table at bore
 * Ø200/250/320 (40/50/63 here vs 50/63/80 there) — neither was tied to a
 * named manufacturer/type code, so there was no way to tell which was
 * "right". Now derived from that one canonical table (ALL_BORES) instead of
 * keeping an independent copy, using each bore's first/basic listed rod —
 * see pneumatic.ts's own doc comment for the sourcing caveat that still
 * applies (a manufacturer may offer other rod diameters per bore).
 */
import { columnCapacity, END_CONDITIONS } from "../calculators/knik.ts";
import { ALL_BORES } from "../calculators/pneumatic.ts";

/** 1 bar (gauge) = 0,1 N/mm². */
export const BAR_N_PER_MM2 = 0.1;

export type SeriesId = "iso15552" | "iso6432";
export type StrokeDir = "uit" | "in";

export type CylinderRow = {
  series: SeriesId;
  bore: number;
  rod: number;
};

function toSeriesId(series: "ISO 15552" | "ISO 6432"): SeriesId {
  return series === "ISO 15552" ? "iso15552" : "iso6432";
}

/** Derived from calculators/pneumatic.ts's ALL_BORES — one row per bore, using its first/basic rod option. Ø8–320 mm, ISO 6432 first then ISO 15552. */
export const CATALOG: readonly CylinderRow[] = ALL_BORES.map((row) => ({
  series: toSeriesId(row.series),
  bore: row.bore,
  rod: row.rods[0],
}));

export function pistonAreaMm2(bore: number) {
  return (Math.PI * bore * bore) / 4;
}

export function annulusAreaMm2(bore: number, rod: number) {
  return pistonAreaMm2(bore) - pistonAreaMm2(rod);
}

export function forceN(pBar: number, areaMm2: number) {
  return pBar * BAR_N_PER_MM2 * areaMm2;
}

export function forcesAt(row: CylinderRow, pBar: number) {
  const A = pistonAreaMm2(row.bore);
  const Aann = annulusAreaMm2(row.bore, row.rod);
  return {
    A,
    Aann,
    F_uit: forceN(pBar, A),
    F_in: forceN(pBar, Aann),
  };
}

/** Theoretical piston Ø (mm) so F_uit ≥ need. Retract needs a larger bore. */
export function minPistonMm(needN: number, pBar: number) {
  if (!(needN > 0) || !(pBar > 0)) return null;
  const A = needN / (pBar * BAR_N_PER_MM2);
  return Math.sqrt((4 * A) / Math.PI);
}

export function availableN(row: CylinderRow, pBar: number, dir: StrokeDir) {
  const f = forcesAt(row, pBar);
  return dir === "uit" ? f.F_uit : f.F_in;
}

/**
 * First catalog bore whose theoretical force (no friction) covers F·S
 * in the chosen direction.
 */
export function sizeCylinder({
  loadN,
  pBar,
  S,
  dir,
}: {
  loadN: number;
  pBar: number;
  S: number;
  dir: StrokeDir;
}): CylinderRow | null {
  if (!(loadN > 0) || !(pBar > 0) || !(S > 0)) return null;
  const need = loadN * S;
  return CATALOG.find((row) => availableN(row, pBar, dir) >= need - 1e-9) ?? null;
}

/**
 * Free-air volume for one double-acting cycle (extend + retract).
 * Shop approximation: (p + 1) bar absolute, atmospheric ≈ 1 bar. This is NOT
 * a normal-litre (NL) value against a defined reference condition (e.g. DIN
 * 1343: 0°C, 1013.25 mbar) — it is swept volume scaled by an approximate
 * absolute-pressure ratio at ambient temperature. Label it as an
 * approximate free-air volume, not NL, so it isn't mistaken for a
 * compressor-catalogue-grade figure (E10, 16 sept 2026 review).
 * A in mm², s in mm → liters.
 */
export function cycleLiters(row: CylinderRow, pBar: number, strokeMm: number) {
  if (!(strokeMm > 0) || !(pBar >= 0)) return null;
  const { A, Aann } = forcesAt(row, pBar);
  return ((A + Aann) * strokeMm * (pBar + 1)) / 1e6;
}

/**
 * Fixed–free (kDesign 2,1, per knik.ts) — the conservative default when the
 * actual mounting (clevis, trunnion, foot) isn't known. Exposed rod length
 * ≈ stroke; any guide/bearing length inside the head isn't subtracted, and
 * any real protrusion beyond the stroke (rod-eye/clevis length, unsupported
 * length past the front bearing) is NOT included unless the caller supplies
 * it — see rodBucklingCheck's protrusionMm. That makes the buckling length,
 * and therefore F_cr, an optimistic best case rather than a worst case: a
 * real cylinder with any unsupported protrusion has a longer buckling
 * length and a lower F_cr than this reports (E10, 16 sept 2026 review). Rod
 * assumed hardened/ground steel (E ≈ 210 000 N/mm²) regardless of body
 * material. Indicative, push (F_uit) direction only — for a known mounting
 * and length, use the general Euler-knik tool.
 */
/** Single source of truth: knik.ts's END_CONDITIONS "fc" (fixed-free) kDesign — the same value the Euler-knik tool now uses for its own fixed-free case. */
export const ROD_BUCKLING_K_DESIGN = END_CONDITIONS.find((c) => c.id === "fc")!.kDesign;
export const ROD_STEEL_E = 210000;
/** Conservative generic steel yield, matching knik.ts's own "staal" entry — deliberately low, not a specific hardened-rod-steel grade. */
export const ROD_STEEL_RP02 = 235;
/** Pneumatic rod buckling is conventionally checked at 3.5-5, not "any S above 1". */
export const ROD_BUCKLING_MIN_SAFETY = 3.5;

export type RodBucklingResult = NonNullable<ReturnType<typeof columnCapacity>> & {
  /** True when λ is below the Euler validity limit: F_cr above is capped at the squash load (A·Rp0.2), not a real Euler value. */
  belowEulerLimit: boolean;
  /** S below this is a real concern even if S ≥ 1 — see ROD_BUCKLING_MIN_SAFETY. */
  belowRecommendedSafety: boolean;
};

/**
 * Buckling length = stroke + rod protrusion into the mounting (guide/bearing
 * length inside the head is not stroke). No protrusion figure is known here,
 * so protrusionMm defaults to 0 — the SHORTEST possible buckling length, not
 * a conservative one: any real protrusion only makes F_cr lower than this
 * default reports. Supply the actual protrusion for a result that isn't
 * optimistic.
 */
export function rodBucklingCheck(
  rodMm: number,
  strokeMm: number,
  pushForceN: number,
  protrusionMm = 0,
): RodBucklingResult | null {
  if (!(rodMm > 0) || !(strokeMm > 0)) return null;
  const I = (Math.PI * rodMm ** 4) / 64;
  const A = (Math.PI * rodMm ** 2) / 4;
  const L = strokeMm + Math.max(0, protrusionMm);

  // Shared with the Euler-knik tool (columnCapacity in knik.ts): below the
  // slenderness limit the rod squashes before it buckles, so F_cr is capped at
  // A·Rp0,2 instead of publishing the runaway Euler number. Calling the same
  // function is what keeps the two tools agreeing on one rod — see H-6.
  const res = columnCapacity({
    L,
    k: ROD_BUCKLING_K_DESIGN,
    E: ROD_STEEL_E,
    I,
    A,
    F: pushForceN,
    rp02: ROD_STEEL_RP02,
  });
  if (!res) return null;

  return {
    ...res,
    belowRecommendedSafety: res.safety != null && res.safety < ROD_BUCKLING_MIN_SAFETY,
  };
}

export function seriesLabel(series: SeriesId) {
  return series === "iso15552" ? "ISO 15552" : "ISO 6432";
}

export function copyLine({
  row,
  pBar,
  loadN,
  S,
  dir,
  F_uit,
  F_in,
}: {
  row: CylinderRow;
  pBar: number;
  loadN: number;
  S: number;
  dir: StrokeDir;
  F_uit: number;
  F_in: number;
}) {
  const p = fmtDot(pBar, 2);
  const s = fmtDot(S, 2);
  const load = fmtDot(loadN, 0);
  const uit = fmtDot(F_uit, 0);
  const inn = fmtDot(F_in, 0);
  const side = dir === "uit" ? "uitgaan" : "binnenhalen";
  return `Ø${row.bore}/${row.rod} ${seriesLabel(row.series)} · ${p} bar · F_uit ${uit} N · F_in ${inn} N · last ${load} N · S=${s} · ${side}`;
}

function fmtDot(n: number, digits: number) {
  return n.toFixed(digits).replace(".", ",").replace(/,00$/, "");
}
