/**
 * Seegerringgroef (DIN 471 — as, buitenring; DIN 472 — boring, binnenring).
 *
 * De exacte DIN 471/472-catalogustabel bevat honderden specifieke
 * combinaties (groefdiameter, -breedte en ringdikte per nominale
 * diameter) die per fabrikant net iets kunnen verschillen. In plaats van
 * die precieze cijfers uit het geheugen te reproduceren — met het risico
 * op een groef die net verkeerd is — rekent deze tool met de bekende
 * OPBOUW van de norm: groefbreedte in vaste stappen, groefdiepte
 * ruwweg evenredig met de diameter. Dit is een technische schatting voor
 * een eerste ontwerp, GEEN vervanging van de norm of de catalogus van de
 * ringfabrikant (Seeger-Orbis, Rotor Clip, Truarc) — neem de definitieve
 * groefmaat daaruit over vóór productie.
 */

export type CirclipKind = "as" | "boring";

export const CIRCLIP_KINDS: {
  id: CirclipKind;
  label: string;
  labelEn: string;
  standard: string;
}[] = [
  { id: "as", label: "As (buitenring)", labelEn: "Shaft (external ring)", standard: "DIN 471" },
  {
    id: "boring",
    label: "Boring (binnenring)",
    labelEn: "Bore (internal ring)",
    standard: "DIN 472",
  },
];

const STANDARD_WIDTHS = [
  0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0,
];

function nearestStandardWidth(w: number): number {
  return STANDARD_WIDTHS.reduce(
    (best, v) => (Math.abs(v - w) < Math.abs(best - w) ? v : best),
    STANDARD_WIDTHS[0],
  );
}

/** Geschatte groefbreedte (mm): vaste stappenreeks, benaderd met een wortelfunctie van de diameter. */
export function estimatedGrooveWidth(d: number): number {
  return nearestStandardWidth(0.4 + 0.35 * Math.sqrt(d));
}

/** Geschatte groefdiepte (mm): ruwweg 4% van de diameter, met een ondergrens. */
export function estimatedGrooveDepth(d: number): number {
  return Math.max(0.15, Math.round(d * 0.04 * 20) / 20);
}

export type CirclipResult = {
  grooveDiameter: number;
  grooveWidth: number;
  grooveDepth: number;
};

/** As (DIN 471): groef ligt binnen de as-diameter. Boring (DIN 472): groef ligt buiten de boring-diameter. */
export function computeGroove(kind: CirclipKind, d: number): CirclipResult | null {
  if (!(d > 0)) return null;
  const depth = estimatedGrooveDepth(d);
  const width = estimatedGrooveWidth(d);
  const grooveDiameter = kind === "as" ? d - 2 * depth : d + 2 * depth;
  return { grooveDiameter, grooveWidth: width, grooveDepth: depth };
}

export function fmtCirclip(n: number, digits = 2): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
