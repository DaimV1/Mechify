import { bandIndex, holeDeviationAt, pairRange, shaftDeviationAt } from "@/lib/calculators/iso286";

/**
 * Vereenvoudigde selectiegids voor groefkogellagers, cilindrische boring,
 * tot Ø50 mm — het bereik van de hand-geverifieerde ISO 286-tabellen in
 * iso286.ts (j5/j6/js5/k5/k6/n6 op de as, J7/JS7/K7/M7/N7 in de behuizing
 * zijn daar al als "lager-klassen" gemarkeerd). Gebaseerd op de algemene
 * richtlijnen die SKF en vergelijkbare lagerfabrikanten publiceren voor de
 * meest voorkomende situatie: roterende binnenring, stilstaande buitenring
 * met puntbelasting. De volledige selectietabel houdt ook rekening met
 * asmateriaal (massief/hol), warmteontwikkeling en of de buitenring
 * meeroteert — raadpleeg de lagercatalogus voor kritieke of afwijkende
 * toepassingen.
 */
export type LoadClass = "licht" | "normaal" | "zwaar";

export const LOAD_CLASSES: { id: LoadClass; label: string; hint: string }[] = [
  { id: "licht", label: "Licht (P ≤ 0,06 C)", hint: "Lichte of wisselende belasting" },
  { id: "normaal", label: "Normaal (0,06 C < P ≤ 0,12 C)", hint: "Normale bedrijfsbelasting" },
  { id: "zwaar", label: "Zwaar (P > 0,12 C)", hint: "Zware of schokbelasting" },
];

export type BearingSide = "vast" | "los";

export const BEARING_SIDES: { id: BearingSide; label: string; hint: string }[] = [
  { id: "vast", label: "Vaste zijde", hint: "Positioneert de as axiaal" },
  { id: "los", label: "Losse zijde", hint: "Moet axiaal kunnen verschuiven" },
];

/** As-tolerantieklasse per belastingsklasse (roterende binnenring — het gangbare geval). */
export function shaftClassFor(load: LoadClass, d: number): string {
  if (load === "licht") return "j6";
  if (load === "normaal") return d <= 18 ? "k5" : "k6";
  return "n6";
}

/** Behuizing-tolerantieklasse: losse zijde altijd H7 (moet kunnen schuiven); vaste zijde per belasting. */
export function housingClassFor(load: LoadClass, side: BearingSide): string {
  if (side === "los") return "H7";
  if (load === "licht") return "J7";
  if (load === "normaal") return "K7";
  return "M7";
}

export function shaftFitAt(d: number, classId: string) {
  const i = bandIndex(d);
  if (i < 0) return null;
  const dev = shaftDeviationAt(classId, i);
  if (!dev) return null;
  return { ...dev, range: pairRange(dev.es, dev.ei) };
}

export function housingFitAt(d: number, classId: string) {
  const i = bandIndex(d);
  if (i < 0) return null;
  const dev = holeDeviationAt(classId, i);
  if (!dev) return null;
  return { ...dev, range: pairRange(dev.ES, dev.EI) };
}

export const SHAFT_BEARING_CLASSES = ["j6", "k5", "k6", "n6"];
export const HOUSING_BEARING_CLASSES = ["H7", "J7", "K7", "M7"];
