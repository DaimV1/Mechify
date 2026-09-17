/**
 * Structured provenance for a calculator result: what KIND of source it
 * rests on (a current standard, vendor guidance, a physics equation, a
 * design heuristic, or a catalogue recommendation) and what STATE that
 * source is in (current, under revision, withdrawn/legacy, vendor-current,
 * or "this is an estimate, not a table lookup"). Replaces the old single
 * free-text "standard" string, which collapsed all of these into one badge
 * that looked equally authoritative whether the value came from ISO 286 or
 * from a rearranged physics formula.
 */

export type Locale = "nl" | "en";

/** Free text that must read correctly in both site locales, same as every other T.nl/T.en pair in this codebase. */
export type Bilingual = { nl: string; en: string };

export function metaText(text: Bilingual, locale: Locale): string {
  return text[locale];
}

export type BasisType = "standard" | "vendor" | "physics" | "heuristic" | "catalogue";

export type BasisStatus =
  "current" | "under-publication" | "withdrawn-legacy" | "vendor-current" | "estimate";

export type EngineeringSourceMeta = {
  basisType: BasisType;
  /** e.g. "ISO 286-2:2010", "247TailorSteel bending guidelines", "P = T·ω" — reference IDs are the same in both locales, so a plain string is fine here. */
  reference: string;
  status: BasisStatus;
  /** ISO date the source/status was last checked, e.g. "2026-09-17". */
  checkedDate: string;
  /** e.g. "nominal Ø ≤ 3150 mm", "deep-groove bearings, Ø ≤ 50 mm" */
  validityRange?: Bilingual;
  /** Plain-language omitted effects/conditions. */
  assumptions?: Bilingual;
  /** What must be checked before release to manufacturing/production. */
  verification?: Bilingual;
  sourceUrl?: string;
};

/** Visible label per the audit's "Recommended UI labels" table — status overrides basisType where it's more specific. */
export function metaLabel(meta: EngineeringSourceMeta, locale: Locale): string {
  if (meta.status === "withdrawn-legacy") {
    return locale === "nl" ? "VERVALLEN / VEROUDERDE NORM" : "LEGACY / WITHDRAWN STANDARD";
  }
  if (meta.status === "under-publication") {
    return locale === "nl" ? "NORM IN HERZIENING" : "STANDARD UNDER REVISION";
  }
  if (meta.status === "estimate") {
    return locale === "nl" ? "ONTWERPSCHATTING — VERIFIËREN" : "DESIGN ESTIMATE — VERIFY";
  }
  switch (meta.basisType) {
    case "standard":
      return locale === "nl" ? "HUIDIGE NORM · TABELWAARDE" : "CURRENT STANDARD · TABLE LOOKUP";
    case "vendor":
      return locale === "nl" ? "LEVERANCIER-RICHTLIJN" : "VENDOR DFM RULE";
    case "physics":
      return locale === "nl" ? "NATUURKUNDIG MODEL" : "PHYSICS MODEL";
    case "heuristic":
      return locale === "nl" ? "ONTWERPSCHATTING — VERIFIËREN" : "DESIGN ESTIMATE — VERIFY";
    case "catalogue":
      return locale === "nl" ? "CATALOGUSAANBEVELING" : "CATALOGUE RECOMMENDATION";
  }
}

/** Semantic tone for color + icon selection — never rely on color alone (WCAG 1.4.1), icon/text carry the meaning. */
export function metaTone(meta: EngineeringSourceMeta): "ok" | "warn" | "danger" | "neutral" {
  if (meta.status === "withdrawn-legacy") return "danger";
  if (meta.status === "estimate" || meta.basisType === "heuristic") return "warn";
  if (meta.status === "under-publication") return "warn";
  if (meta.basisType === "standard" || meta.basisType === "vendor") return "ok";
  return "neutral";
}

const CHECKED_LABEL: Record<Locale, string> = { nl: "Gecontroleerd", en: "Checked" };
const RANGE_LABEL: Record<Locale, string> = { nl: "Geldigheid", en: "Validity" };

/** One-line text for copy-to-clipboard output, so provenance travels with the number, not just the on-screen badge. */
export function metaCopyLine(meta: EngineeringSourceMeta, locale: Locale): string {
  const parts = [
    `${metaLabel(meta, locale)}: ${meta.reference}`,
    `${CHECKED_LABEL[locale]} ${meta.checkedDate}`,
  ];
  if (meta.validityRange)
    parts.push(`${RANGE_LABEL[locale]}: ${metaText(meta.validityRange, locale)}`);
  return parts.join(" · ");
}
