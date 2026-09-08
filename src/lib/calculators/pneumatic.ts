/** Pneumatische cilinder: F = p·A, dubbelwerkend. mm, bar, N intern. */

export type CylinderRow = { series: "ISO 15552" | "ISO 6432"; bore: number; rods: number[] };

/**
 * Standaard boring/zuigerstang-combinaties volgens de gangbare catalogi
 * (Festo DSBC/DNC, SMC CA2/CQ2 e.d.) die ISO 15552 (profielcilinders,
 * Ø32-320) en ISO 6432 (compacte ronde cilinders, Ø8-25) volgen. Sommige
 * boringen hebben meerdere standaard zuigerstang-opties (dunne staaf voor
 * trek, dikke voor druk/uitknikvastheid) — de eerste is de meest gangbare.
 * Controleer de fabrikant-catalogus voor de volledige set opties.
 */
export const ISO6432_BORES: CylinderRow[] = [
  { series: "ISO 6432", bore: 8, rods: [4] },
  { series: "ISO 6432", bore: 10, rods: [4] },
  { series: "ISO 6432", bore: 12, rods: [6] },
  { series: "ISO 6432", bore: 16, rods: [6] },
  { series: "ISO 6432", bore: 20, rods: [8] },
  { series: "ISO 6432", bore: 25, rods: [10] },
];

export const ISO15552_BORES: CylinderRow[] = [
  { series: "ISO 15552", bore: 32, rods: [12] },
  { series: "ISO 15552", bore: 40, rods: [16] },
  { series: "ISO 15552", bore: 50, rods: [20] },
  { series: "ISO 15552", bore: 63, rods: [20, 25] },
  { series: "ISO 15552", bore: 80, rods: [25] },
  { series: "ISO 15552", bore: 100, rods: [25, 32] },
  { series: "ISO 15552", bore: 125, rods: [32, 40] },
  { series: "ISO 15552", bore: 160, rods: [40, 50] },
  { series: "ISO 15552", bore: 200, rods: [50, 63] },
  { series: "ISO 15552", bore: 250, rods: [63, 80] },
  { series: "ISO 15552", bore: 320, rods: [80, 100] },
];

export const ALL_BORES: CylinderRow[] = [...ISO6432_BORES, ...ISO15552_BORES];

export function circleArea(dMm: number): number {
  return (Math.PI * dMm ** 2) / 4;
}

export function annulusArea(boreMm: number, rodMm: number): number {
  return circleArea(boreMm) - circleArea(rodMm);
}

/** F(N) = p(bar) · A(mm²) · 0,1 — 1 bar = 1e5 Pa, 1 mm² = 1e-6 m². */
export function forceFromPressure(pBar: number, areaMm2: number): number {
  return pBar * areaMm2 * 0.1;
}

export function extendForce(boreMm: number, pBar: number): number {
  return forceFromPressure(pBar, circleArea(boreMm));
}

export function retractForce(boreMm: number, rodMm: number, pBar: number): number {
  return forceFromPressure(pBar, annulusArea(boreMm, rodMm));
}

/** Smallest standard bore whose extend force meets or exceeds the requested load. */
export function minBoreFor(
  requiredN: number,
  pBar: number,
  table: CylinderRow[] = ALL_BORES,
): CylinderRow | null {
  const sorted = [...table].sort((a, b) => a.bore - b.bore);
  return sorted.find((row) => extendForce(row.bore, pBar) >= requiredN) ?? null;
}

export function fmtN0(n: number): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: 0 });
}
