/**
 * Seegerringgroef (DIN 471 — as, buitenring; DIN 472 — boring, binnenring).
 *
 * M-3 (16 sept 2026 audit): dit was ooit een wortelfunctie-schatting van
 * groefbreedte en -diepte, gepresenteerd als het standaardresultaat naast de
 * DIN 471/472-aanduiding. Voor een nominale 20 mm as gaf dat model 2,0 mm
 * groefbreedte / 0,8 mm diepte tegenover Rotor Clip's DSH-20-referentie van
 * 1,3 mm / 0,5 mm — een geometrisch verschil dat niet geschikt is voor een
 * standaardring. Dit bestand rekent nu uitsluitend met de catalogustabel in
 * `@/lib/toolkit/seeger` (dezelfde tabel als de aanvullende "werkplaatstabel"
 * tool): geen maat in de tabel betekent geen resultaat, in plaats van een
 * geïnterpoleerde schatting.
 */

import {
  grooveDepth,
  isVerifiedSeeger,
  lookupSeeger,
  SEEGER,
  type SeegerKind,
} from "../toolkit/seeger.ts";

export type CirclipKind = SeegerKind;

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

export type CirclipResult = {
  grooveDiameter: number;
  grooveWidth: number;
  grooveDepth: number;
  /** True only for sizes independently checked against a manufacturer datasheet — see VERIFIED_SEEGER_D1 in toolkit/seeger.ts. */
  verified: boolean;
};

/** Nearest standard nominal diameters on either side of `d` that have a catalogue entry for `kind` (for a "no ring at this size" hint). */
export function nearestStandardSizes(
  kind: CirclipKind,
  d: number,
): { lower: number | null; upper: number | null } {
  const sizes = SEEGER.filter((r) => (kind === "as" ? r.d2as != null : r.d2bor != null)).map(
    (r) => r.d1,
  );
  let lower: number | null = null;
  let upper: number | null = null;
  for (const s of sizes) {
    if (s < d && (lower == null || s > lower)) lower = s;
    if (s > d && (upper == null || s < upper)) upper = s;
  }
  return { lower, upper };
}

/**
 * Catalogue lookup only — no square-root or percentage approximation. As
 * (DIN 471): groef ligt binnen de as-diameter. Boring (DIN 472): groef ligt
 * buiten de boring-diameter. Returns null when `d` has no standard ring in
 * the table (use nearestStandardSizes to point to the closest sizes that do).
 */
export function computeGroove(kind: CirclipKind, d: number): CirclipResult | null {
  if (!(d > 0)) return null;
  const row = lookupSeeger(d);
  if (!row) return null;
  const d2 = kind === "as" ? row.d2as : row.d2bor;
  if (d2 == null) return null;
  const width = kind === "as" ? row.bAs : row.bBor;
  const depth = grooveDepth(row.d1, d2);
  return {
    grooveDiameter: d2,
    grooveWidth: width,
    grooveDepth: depth,
    verified: isVerifiedSeeger(d),
  };
}

export function fmtCirclip(n: number, digits = 2): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
