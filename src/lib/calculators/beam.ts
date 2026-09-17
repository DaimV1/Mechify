/** Doorbuiging van een balk onder een puntlast of verdeelde last (Euler-Bernoulli). mm, N, N/mm² intern. */

export type BeamType = "opgelegd" | "uitkraging";

export const BEAM_TYPES: { id: BeamType; label: string; labelEn: string }[] = [
  { id: "opgelegd", label: "Vrij opgelegd", labelEn: "Simply supported" },
  { id: "uitkraging", label: "Uitkraging (ingeklemd)", labelEn: "Cantilever (fixed)" },
];

/** STRUCT-001: point load, or a uniformly distributed load over the full span. */
export type LoadKind = "puntlast" | "verdeeld";

export const LOAD_KINDS: { id: LoadKind; label: string; labelEn: string }[] = [
  { id: "puntlast", label: "Puntlast", labelEn: "Point load" },
  { id: "verdeeld", label: "Gelijkmatig verdeelde last (volledige overspanning)", labelEn: "Uniformly distributed load (full span)" },
];

/**
 * E11 (16 sept 2026 review): this used to report only the deflection AT the
 * load, unlabelled as such, with no way to see the actual maximum. For an
 * off-centre point load the two differ — F=1000 N, L=1000 mm, a=200 mm,
 * E=210000 N/mm², I=1e6 mm⁴ gives 0.040635 mm at the load but 0.057466 mm
 * at x=434.315 mm, the real governing value for a stiffness check. Both are
 * now always returned; for a centred load or a cantilever the two coincide
 * (cantilever's maximum is always at the tip, by inspection of the moment
 * diagram) and xMax equals a or L respectively.
 *
 * STRUCT-001: also always returns the support reactions. For a UDL there is
 * no single "load point", so deflectionAtLoad is set equal to deflectionMax
 * (both already describe the one meaningful deflection value for a UDL).
 */
export type BeamResult = {
  deflectionAtLoad: number;
  deflectionMax: number;
  xMax: number;
  momentMax: number;
  reactionA: number;
  reactionB: number;
};

/**
 * Vrij opgelegde balk, lengte L, puntlast F op afstand a van de linker
 * oplegging (b = L - a): doorbuiging onder de last δ(a) = F·a²·b² / (3·E·I·L),
 * moment onder de last M = F·a·b / L (het globale moment-maximum bij één
 * puntlast). Reacties R_A = F·b/L, R_B = F·a/L. Standaard sterkteleer
 * (Roark/Shigley); geldig voor 0 < a < L.
 *
 * Maximale doorbuiging: bij x = √(a_lang·(a_lang + 2·b_kort) / 3) vanaf de
 * dichtstbijzijnde oplegging naar de kortste zijde, met a_lang/b_kort de
 * langste/kortste van {a, b}. Bij a = b (gecentreerde last) valt dit samen
 * met x = L/2 en δ_max = δ(a).
 */
function simplySupportedPoint(F: number, L: number, a: number, E: number, I: number): BeamResult | null {
  if (!(a > 0) || !(a < L)) return null;
  const b = L - a;
  const deflectionAtLoad = (F * a ** 2 * b ** 2) / (3 * E * I * L);
  const momentMax = (F * a * b) / L;

  const aLong = Math.max(a, b);
  const bShort = Math.min(a, b);
  const xFromNear = Math.sqrt((aLong * (aLong + 2 * bShort)) / 3);
  const deflectionMax =
    (F * bShort * (L ** 2 - bShort ** 2) ** 1.5) / (9 * Math.sqrt(3) * L * E * I);
  const xMax = a >= b ? xFromNear : L - xFromNear;

  return { deflectionAtLoad, deflectionMax, xMax, momentMax, reactionA: (F * b) / L, reactionB: (F * a) / L };
}

/**
 * Uitkraging, ingeklemd bij x=0, puntlast F op afstand a van de inklemming
 * (0 < a ≤ L): doorbuiging bij de tip (x=L) δ = F·a²·(3L - a) / (6·E·I),
 * moment bij de inklemming M = F·a (maximaal, daar treedt bezwijking het
 * eerst op). Reactie bij de inklemming R_A = F, vrije uiteinde R_B = 0. Bij
 * a = L (last op de tip) reduceert dit tot de bekende F·L³ / (3·E·I). Bij
 * een uitkraging ligt de maximale doorbuiging altijd bij de tip, ook als de
 * last verderop naar de inklemming toe aangrijpt.
 */
function cantileverPoint(F: number, L: number, a: number, E: number, I: number): BeamResult | null {
  if (!(a > 0) || !(a <= L)) return null;
  const deflectionAtTip = (F * a ** 2 * (3 * L - a)) / (6 * E * I);
  const momentMax = F * a;
  return {
    deflectionAtLoad: deflectionAtTip,
    deflectionMax: deflectionAtTip,
    xMax: L,
    momentMax,
    reactionA: F,
    reactionB: 0,
  };
}

/**
 * STRUCT-001: vrij opgelegde balk onder een gelijkmatig verdeelde last w
 * (N/mm) over de volledige overspanning L. Maximale doorbuiging op
 * middenveld δ_max = 5·w·L⁴ / (384·E·I), maximaal moment op middenveld
 * M_max = w·L² / 8, reacties R_A = R_B = w·L/2. Standaard sterkteleer
 * (Roark/Shigley); geldig voor w ≥ 0, L > 0.
 */
function simplySupportedUDL(w: number, L: number, E: number, I: number): BeamResult | null {
  if (!(L > 0)) return null;
  const deflectionMax = (5 * w * L ** 4) / (384 * E * I);
  const momentMax = (w * L ** 2) / 8;
  const reaction = (w * L) / 2;
  return {
    deflectionAtLoad: deflectionMax,
    deflectionMax,
    xMax: L / 2,
    momentMax,
    reactionA: reaction,
    reactionB: reaction,
  };
}

/**
 * STRUCT-001: uitkraging, ingeklemd bij x=0, onder een gelijkmatig verdeelde
 * last w (N/mm) over de volledige lengte L. Maximale doorbuiging bij de tip
 * δ_max = w·L⁴ / (8·E·I), maximaal moment bij de inklemming
 * M_max = w·L² / 2, reactie bij de inklemming R_A = w·L, vrije uiteinde
 * R_B = 0.
 */
function cantileverUDL(w: number, L: number, E: number, I: number): BeamResult | null {
  if (!(L > 0)) return null;
  const deflectionMax = (w * L ** 4) / (8 * E * I);
  const momentMax = (w * L ** 2) / 2;
  return {
    deflectionAtLoad: deflectionMax,
    deflectionMax,
    xMax: L,
    momentMax,
    reactionA: w * L,
    reactionB: 0,
  };
}

export function computeBeam(
  input:
    | { kind?: "puntlast"; type: BeamType; F: number; L: number; a: number; E: number; I: number }
    | { kind: "verdeeld"; type: BeamType; w: number; L: number; E: number; I: number },
): BeamResult | null {
  if (!(input.L > 0) || !(input.E > 0) || !(input.I > 0)) return null;
  if (input.kind === "verdeeld") {
    if (!(input.w >= 0)) return null;
    return input.type === "opgelegd"
      ? simplySupportedUDL(input.w, input.L, input.E, input.I)
      : cantileverUDL(input.w, input.L, input.E, input.I);
  }
  if (!(input.F >= 0)) return null;
  return input.type === "opgelegd"
    ? simplySupportedPoint(input.F, input.L, input.a, input.E, input.I)
    : cantileverPoint(input.F, input.L, input.a, input.E, input.I);
}

/** Buigspanning σ = M·c / I (N/mm²), c = afstand neutrale lijn tot uiterste vezel. */
export function bendingStress(M: number, c: number, I: number): number {
  return (M * c) / I;
}

/**
 * Vuistregels voor toelaatbare doorbuiging als deel van de overspanning L —
 * generieke richtwaarden, geen vervanging van de toepasselijke norm
 * (Eurocode 3 voor staalconstructies, VDI 2230/machinerichtlijnen voor
 * machinebouw, FEM 1.001 voor kraanbanen).
 */
export const DEFLECTION_GUIDELINES: { label: string; ratio: number; use: string; useEn: string }[] =
  [
    {
      label: "L / 180",
      ratio: 180,
      use: "Lichte, niet-kritische constructies",
      useEn: "Light, non-critical structures",
    },
    {
      label: "L / 250",
      ratio: 250,
      use: "Algemene bouwconstructies (richtwaarde EN 1993)",
      useEn: "General building structures (EN 1993 guideline)",
    },
    {
      label: "L / 360",
      ratio: 360,
      use: "Vloeren onder puntlast, trillingsgevoelig",
      useEn: "Floors under point load, vibration-sensitive",
    },
    {
      label: "L / 750",
      ratio: 750,
      use: "Kraanbanen, precisiemachines",
      useEn: "Crane runways, precision machinery",
    },
  ];

export function fmtBeamNum(n: number, digits: number): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
