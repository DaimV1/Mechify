/** Zetwerk: buigtoeslag (K-factor methode), minimale straal/beenlengte, matrijsopening. mm intern. */

/**
 * K-factor vuistregel op basis van de verhouding binnenstraal/dikte —
 * veelgebruikte praktijkbenadering (o.a. Machinery's Handbook), geen
 * fysisch gemeten waarde per materiaal/pers. Kalibreer op de eigen
 * kantpers/matrijs voor kritieke toleranties.
 */
export function kFactorFor(riOverT: number): number {
  if (riOverT < 1) return 0.33;
  if (riOverT < 3) return 0.4;
  return 0.5;
}

/** Buigtoeslag BA = θ(rad) · (Ri + K·T) — booglengte van de neutrale lijn. */
export function bendAllowance(angleDeg: number, Ri: number, T: number, K: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  return rad * (Ri + K * T);
}

/** Buigaftrek BD = 2·(Ri+T)·tan(θ/2) − BA. */
export function bendDeduction(angleDeg: number, Ri: number, T: number, K: number): number {
  if (!Number.isFinite(angleDeg) || angleDeg <= 0 || angleDeg >= 180) return NaN;
  const rad = (angleDeg * Math.PI) / 180;
  const BA = bendAllowance(angleDeg, Ri, T, K);
  return 2 * (Ri + T) * Math.tan(rad / 2) - BA;
}

/** Platte-plaatlengte = som van de buitenmaten van de benen − buigaftrek. */
export function flatLength(legs: number[], BD: number): number {
  return legs.reduce((a, b) => a + b, 0) - BD;
}

export type MaterialClass = { id: string; label: string; labelEn: string; rminFactor: number };

/**
 * Minimale binnenstraal als veelvoud van de plaatdikte — algemene DFM-
 * richtwaarden voor zetwerk, geen normwaarde. De werkelijke minimale straal
 * hangt af van legering, temper en stanslijnrichting; controleer bij de
 * plaatleverancier of het zetbedrijf voor kritieke onderdelen.
 */
export const MATERIAL_CLASSES: MaterialClass[] = [
  {
    id: "zacht",
    label: "Zacht (aluminium, koper, gegloeid rvs)",
    labelEn: "Soft (aluminium, copper, annealed stainless)",
    rminFactor: 1,
  },
  {
    id: "staal",
    label: "Staal (warmgewalst / zacht koudgewalst)",
    labelEn: "Steel (hot-rolled / soft cold-rolled)",
    rminFactor: 1,
  },
  {
    id: "rvs",
    label: "RVS (roestvast staal, hard)",
    labelEn: "Stainless steel (hard)",
    rminFactor: 1.5,
  },
  {
    id: "veer",
    label: "Veerstaal / hard gewalst",
    labelEn: "Spring steel / hard-rolled",
    rminFactor: 3,
  },
];

export function rminFor(materialId: string, T: number): number {
  const m = MATERIAL_CLASSES.find((mc) => mc.id === materialId) ?? MATERIAL_CLASSES[0];
  return m.rminFactor * T;
}

/** Minimale beenlengte (vuistregel) = 4 × plaatdikte, gemeten vanaf de buiglijn. */
export function minFlangeLength(T: number): number {
  return 4 * T;
}

/**
 * Typische V-matrijsopening (luchtbuigen) ≈ 8 × plaatdikte. `insideRadiusGuide`
 * (≈ V/6) is een vuistregel voor de resulterende BINNENSTRAAL die bij die
 * opening ontstaat — dit is niet hetzelfde als de ponsneusstraal die je
 * daadwerkelijk kiest: ponsneusstraal, resulterende binnenstraal en
 * matrijsopening zijn drie te onderscheiden maten. In de praktijk is de
 * gekozen ponsneusstraal doorgaans kleiner dan of gelijk aan deze richtwaarde
 * (E15, 16 sept 2026 review) — dit veld heette voorheen "punchRadius", wat
 * die twee maten liet samenvallen.
 */
export function suggestedDieOpening(T: number): { v: number; insideRadiusGuide: number } {
  const v = 8 * T;
  return { v, insideRadiusGuide: v / 6 };
}

/**
 * Geometrische ondergrens voor een Z-buiging (offset): de twee buigstralen
 * plus de plaatdikte moeten fysiek passen. Dit is een vereenvoudigde
 * ondergrens, geen volledige gereedschap-vrijloopcontrole — bij een krappe
 * offset altijd de matrijs- en ponsvorm van de kantpers controleren.
 */
export function minZOffset(Ri: number, T: number): number {
  return 2 * Ri + T;
}

export function fmtBendNum(n: number, digits = 2): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
