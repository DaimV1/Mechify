/**
 * O-ringgroef (ISO 3601-1 koorden, radiaal of axiaal). mm intern.
 *
 * ISO 3601-2 (gland-afmetingen) publiceert gedetailleerde tabellen per
 * toepassing en koorddiameter. Deze tool rekent met de onderliggende
 * ontwerpregel — percentage samendrukking (squeeze) en een breedte-
 * marge t.o.v. de koorddiameter — in plaats van die tabel te reproduceren.
 * Indicatief voor een eerste ontwerp; controleer de definitieve gland-maat
 * tegen ISO 3601-2 of de fabrikant-designgids (Parker, Trelleborg) vóór
 * productie, zeker bij dynamische afdichtingen.
 */

/** ISO 3601-1 standaard metrische koorddiameters (mm). */
export const STANDARD_CORDS = [1.8, 2.65, 3.55, 5.3, 7.0];

export type SealType = "statisch" | "dynamisch";

export const SEAL_TYPES: {
  id: SealType;
  label: string;
  labelEn: string;
  squeezeMin: number;
  squeezeMax: number;
  default: number;
}[] = [
  {
    id: "statisch",
    label: "Statisch",
    labelEn: "Static",
    squeezeMin: 15,
    squeezeMax: 30,
    default: 20,
  },
  {
    id: "dynamisch",
    label: "Dynamisch (glijdend/roterend)",
    labelEn: "Dynamic (sliding/rotating)",
    squeezeMin: 10,
    squeezeMax: 16,
    default: 12,
  },
];

export type GrooveDirection = "radiaal" | "axiaal";

export type OringGroove = {
  depth: number;
  width: number;
  /** O-ring cross-section area / groove cross-section area × 100, before swelling, tolerances or installation stretch. */
  fillPercent: number;
  /** True when the nominal O-ring cross-section alone exceeds the groove volume — a physically invalid geometry, not just a squeeze/durability concern. */
  overfilled: boolean;
};

/**
 * Groefdiepte (in de samengedrukte richting) = koorddiameter × (1 − squeeze%).
 * Groefbreedte (dwars op de samendrukking) = koorddiameter × breedtefactor —
 * ruimte voor het volumeoverschot bij samendrukking en thermische
 * uitzetting, typisch 1,3–1,5× de koorddiameter.
 *
 * M-6 (16 sept 2026 audit): depth and width used to be returned without
 * checking whether the O-ring's own nominal cross-section fits in the
 * resulting groove. At cord 3.55 mm / squeeze 30% / width factor 1.1, the
 * groove that comes out (depth 2.485 mm, width 3.905 mm) holds only about
 * 98% of the O-ring's cross-sectional area (fill ≈ 102%) — the ring
 * physically does not fit before any swelling, tolerance stack-up or
 * thermal expansion is even considered.
 * `overfilled` flags that condition so the UI can reject the geometry
 * instead of only checking whether squeeze% falls in the seal-type range.
 */
export function computeOringGroove(
  cord: number,
  squeezePercent: number,
  widthFactor = 1.4,
): OringGroove | null {
  if (!(cord > 0) || !(squeezePercent >= 0) || !(squeezePercent < 100) || !(widthFactor > 1))
    return null;
  const depth = cord * (1 - squeezePercent / 100);
  const width = cord * widthFactor;
  const ringArea = (Math.PI * cord ** 2) / 4;
  const grooveArea = depth * width;
  const fillPercent = (ringArea / grooveArea) * 100;
  return { depth, width, fillPercent, overfilled: fillPercent > 100 };
}

export function fmtOring(n: number, digits = 2): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
