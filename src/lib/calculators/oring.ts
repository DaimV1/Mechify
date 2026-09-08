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
};

/**
 * Groefdiepte (in de samengedrukte richting) = koorddiameter × (1 − squeeze%).
 * Groefbreedte (dwars op de samendrukking) = koorddiameter × breedtefactor —
 * ruimte voor het volumeoverschot bij samendrukking en thermische
 * uitzetting, typisch 1,3–1,5× de koorddiameter.
 */
export function computeOringGroove(
  cord: number,
  squeezePercent: number,
  widthFactor = 1.4,
): OringGroove | null {
  if (!(cord > 0) || !(squeezePercent >= 0) || !(squeezePercent < 100) || !(widthFactor > 1))
    return null;
  return {
    depth: cord * (1 - squeezePercent / 100),
    width: cord * widthFactor,
  };
}

export function fmtOring(n: number, digits = 2): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
