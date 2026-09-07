/** Doorbuiging van een balk onder een puntlast (Euler-Bernoulli). mm, N, N/mm² intern. */

export type BeamType = "opgelegd" | "uitkraging";

export const BEAM_TYPES: { id: BeamType; label: string; labelEn: string }[] = [
  { id: "opgelegd", label: "Vrij opgelegd", labelEn: "Simply supported" },
  { id: "uitkraging", label: "Uitkraging (ingeklemd)", labelEn: "Cantilever (fixed)" },
];

export type BeamResult = {
  deflection: number;
  momentMax: number;
  /** Locale-neutral key — translate in the component, not here. */
  at: "load" | "tip";
};

/**
 * Vrij opgelegde balk, lengte L, puntlast F op afstand a van de linker
 * oplegging (b = L - a): doorbuiging onder de last δ = F·a²·b² / (3·E·I·L),
 * moment onder de last M = F·a·b / L. Standaard sterkteleer (Roark/Shigley);
 * geldig voor 0 < a < L.
 */
function simplySupported(F: number, L: number, a: number, E: number, I: number): BeamResult | null {
  if (!(a > 0) || !(a < L)) return null;
  const b = L - a;
  const deflection = (F * a ** 2 * b ** 2) / (3 * E * I * L);
  const momentMax = (F * a * b) / L;
  return { deflection, momentMax, at: "load" };
}

/**
 * Uitkraging, ingeklemd bij x=0, puntlast F op afstand a van de inklemming
 * (0 < a ≤ L): doorbuiging bij de tip (x=L) δ = F·a²·(3L - a) / (6·E·I),
 * moment bij de inklemming M = F·a (maximaal, daar treedt bezwijking het
 * eerst op). Bij a = L (last op de tip) reduceert dit tot de bekende
 * F·L³ / (3·E·I).
 */
function cantilever(F: number, L: number, a: number, E: number, I: number): BeamResult | null {
  if (!(a > 0) || !(a <= L)) return null;
  const deflection = (F * a ** 2 * (3 * L - a)) / (6 * E * I);
  const momentMax = F * a;
  return { deflection, momentMax, at: "tip" };
}

export function computeBeam({
  type,
  F,
  L,
  a,
  E,
  I,
}: {
  type: BeamType;
  F: number;
  L: number;
  a: number;
  E: number;
  I: number;
}): BeamResult | null {
  if (!(F >= 0) || !(L > 0) || !(E > 0) || !(I > 0)) return null;
  return type === "opgelegd" ? simplySupported(F, L, a, E, I) : cantilever(F, L, a, E, I);
}

/**
 * Vuistregels voor toelaatbare doorbuiging als deel van de overspanning L —
 * generieke richtwaarden, geen vervanging van de toepasselijke norm
 * (Eurocode 3 voor staalconstructies, VDI 2230/machinerichtlijnen voor
 * machinebouw, FEM 1.001 voor kraanbanen).
 */
export const DEFLECTION_GUIDELINES: { label: string; ratio: number; use: string; useEn: string }[] = [
  { label: "L / 180", ratio: 180, use: "Lichte, niet-kritische constructies", useEn: "Light, non-critical structures" },
  { label: "L / 250", ratio: 250, use: "Algemene bouwconstructies (richtwaarde EN 1993)", useEn: "General building structures (EN 1993 guideline)" },
  { label: "L / 360", ratio: 360, use: "Vloeren onder puntlast, trillingsgevoelig", useEn: "Floors under point load, vibration-sensitive" },
  { label: "L / 750", ratio: 750, use: "Kraanbanen, precisiemachines", useEn: "Crane runways, precision machinery" },
];

export function fmtBeamNum(n: number, digits: number): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
