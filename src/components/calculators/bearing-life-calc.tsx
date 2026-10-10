import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  a1For,
  adjustedLife,
  BEARING_LOAD_TYPES,
  fmtBearingLife,
  l10Hours,
  l10Millions,
  RELIABILITY_LEVELS,
  staticSafetyFactor,
  staticSafetyStatus,
  type BearingLoadType,
} from "@/lib/calculators/bearing-life";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  parseNum,
  ResultGrid,
  SelectInput,
  ValidatedNumField,
} from "@/components/calculators/calc-ui";
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";

const BEARING_LIFE_META: EngineeringSourceMeta = {
  basisType: "standard",
  reference: "ISO 281:2007 — basic (L10) and reliability-adjusted rating life",
  status: "current",
  checkedDate: "2026-09-17",
  validityRange: {
    nl: "Vereist C, P (en voor de statische controle C0, P0) uit de lagercatalogus",
    en: "Requires C, P (and for the static check C0, P0) from the bearing catalogue",
  },
  assumptions: {
    nl: "Alleen de basis-levensduurformule (L10) en de a1-betrouwbaarheidsfactor. Geen aISO-modificatiefactor voor smering/verontreiniging, geen X/Y-lastfactoren om P uit radiale/axiale last af te leiden — vul de reeds berekende equivalente last(en) in.",
    en: "Only the basic life formula (L10) and the a1 reliability factor. No aISO lubrication/contamination modifier, no X/Y load factors to derive P from radial/axial load — enter the already-computed equivalent load(s).",
  },
  verification: {
    nl: "Voor een definitieve levensduurberekening: gebruik de volledige methode uit de lagercatalogus (aISO, X/Y-factoren, verontreinigingsgraad).",
    en: "For a final life calculation: use the full method from the bearing catalogue (aISO, X/Y factors, contamination grade).",
  },
  sourceUrl: "https://www.iso.org/standard/38102.html",
};

const T = {
  nl: {
    heading: "Lagerlevensduur (L10 / L10h)",
    intro:
      "ISO 281: L10 = (C/P)^p miljoen omwentelingen, L10h = L10 · 10⁶ / (60·n) bedrijfsuren. C en P komen uit de lagercatalogus voor het gekozen lager.",
    dynamicSection: "Dynamische levensduur",
    dynamicLoad: "Dynamische draaggetal C (kN)",
    equivDynamicLoad: "Equivalente dynamische last P (kN)",
    speed: "Toerental n (omw/min)",
    bearingType: "Lagertype",
    reliability: "Betrouwbaarheid",
    staticSection: "Statische veiligheid",
    staticLoad: "Statisch draaggetal C0 (kN)",
    equivStaticLoad: "Equivalente statische last P0 (kN)",
    resultL10: "L10 (basis)",
    resultL10Adj: "L10 (aangepast)",
    resultL10h: "L10h (basis, uren)",
    resultL10hAdj: "L10h (aangepast, uren)",
    resultS0: "S0 = C0 / P0",
    fillDynamic: "Vul C, P en het toerental in (alle groter dan 0).",
    positiveNumber: "Vul een getal groter dan 0 in.",
    calculationRange:
      "De invoer levert een getal buiten het ondersteunde rekenbereik op. Controleer C, P en het toerental.",
    staticCalculationRange:
      "De invoer levert een getal buiten het ondersteunde rekenbereik op. Controleer C0 en P0.",
    fillStatic: "Vul C0 en P0 in om de statische veiligheid te controleren.",
    s0Fail: "S0 < 1 — de statische belasting overschrijdt de aanbevolen ondergrens.",
    s0Caution:
      "S0 tussen 1 en 1,5 — acceptabel voor lichte, trillingsvrije toepassingen; kies hoger bij schokbelasting of stille/nauwkeurige loop.",
    s0Ok: "S0 ≥ 1,5 — voldoende marge voor normaal bedrijf.",
    chainToBearingFits: "Gebruik de lagerpassingen-tool voor de as-/behuizingspassing →",
    speedWarning:
      "Zeer hoog toerental voor dit draaggetal — controleer de toelaatbare grenstoerental (n·dm) in de lagercatalogus; smering en warmteontwikkeling zijn hier niet gemodelleerd.",
    copy: (
      C: string,
      P: string,
      rpm: string,
      type: string,
      reliability: string,
      l10M: string,
      l10h: string,
      l10Adj: string,
      l10hAdj: string,
    ) =>
      [
        `${type}, C=${C} kN, P=${P} kN, n=${rpm} omw/min`,
        `L10 = ${l10M} × 10⁶ omw. (${l10h} h)`,
        `L${reliability} (a1-aangepast) = ${l10Adj} × 10⁶ omw. (${l10hAdj} h)`,
      ].join("\n"),
    copyStatic: (S0: string) => `S0 = C0/P0 = ${S0}`,
  },
  en: {
    heading: "Bearing life (L10 / L10h)",
    intro:
      "ISO 281: L10 = (C/P)^p million revolutions, L10h = L10 · 10⁶ / (60·n) operating hours. C and P come from the bearing catalogue for the selected bearing.",
    dynamicSection: "Dynamic life",
    dynamicLoad: "Dynamic load rating C (kN)",
    equivDynamicLoad: "Equivalent dynamic load P (kN)",
    speed: "Speed n (rpm)",
    bearingType: "Bearing type",
    reliability: "Reliability",
    staticSection: "Static safety",
    staticLoad: "Static load rating C0 (kN)",
    equivStaticLoad: "Equivalent static load P0 (kN)",
    resultL10: "L10 (basic)",
    resultL10Adj: "L10 (adjusted)",
    resultL10h: "L10h (basic, hours)",
    resultL10hAdj: "L10h (adjusted, hours)",
    resultS0: "S0 = C0 / P0",
    fillDynamic: "Enter C, P and the speed (all greater than 0).",
    positiveNumber: "Enter a number greater than 0.",
    calculationRange:
      "The inputs produce a value outside the supported numerical range. Check C, P and the speed.",
    staticCalculationRange:
      "The inputs produce a value outside the supported numerical range. Check C0 and P0.",
    fillStatic: "Enter C0 and P0 to check static safety.",
    s0Fail: "S0 < 1 — the static load exceeds the recommended lower bound.",
    s0Caution:
      "S0 between 1 and 1.5 — acceptable for light, vibration-free applications; choose higher for shock loads or quiet/precise running.",
    s0Ok: "S0 ≥ 1.5 — adequate margin for normal service.",
    chainToBearingFits: "Use the bearing fits tool for the shaft/housing fit →",
    speedWarning:
      "Very high speed for this load rating — check the permissible limiting speed (n·dm) in the bearing catalogue; lubrication and heat build-up are not modelled here.",
    copy: (
      C: string,
      P: string,
      rpm: string,
      type: string,
      reliability: string,
      l10M: string,
      l10h: string,
      l10Adj: string,
      l10hAdj: string,
    ) =>
      [
        `${type}, C=${C} kN, P=${P} kN, n=${rpm} rpm`,
        `L10 = ${l10M} x 10^6 rev (${l10h} h)`,
        `L${reliability} (a1-adjusted) = ${l10Adj} x 10^6 rev (${l10hAdj} h)`,
      ].join("\n"),
    copyStatic: (S0: string) => `S0 = C0/P0 = ${S0}`,
  },
};

export function BearingLifeCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [C, setC] = useState(search.get("C") ?? "10");
  const [P, setP] = useState(search.get("P") ?? "2");
  const [rpm, setRpm] = useState(search.get("n") ?? "1500");
  const [bearingType, setBearingType] = useState<BearingLoadType>(
    (search.get("type") as BearingLoadType) ?? "ball",
  );
  const [reliabilityId, setReliabilityId] = useState(search.get("rel") ?? "90");
  const [C0, setC0] = useState(search.get("C0") ?? "");
  const [P0, setP0] = useState(search.get("P0") ?? "");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => next.set(k, v);
    set("C", C);
    set("P", P);
    set("n", rpm);
    next.set("type", bearingType);
    next.set("rel", reliabilityId);
    set("C0", C0);
    set("P0", P0);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [C, P, rpm, bearingType, reliabilityId, C0, P0]);

  const Cval = parseNum(C);
  const Pval = parseNum(P);
  const rpmVal = parseNum(rpm);
  const validBearingType = BEARING_LOAD_TYPES.some((bt) => bt.id === bearingType);
  const typeError =
    locale === "nl"
      ? "Kies een lagertype uit de lijst om de levensduur te berekenen."
      : "Choose a bearing type from the list to calculate bearing life.";
  const l10M =
    validBearingType && Cval != null && Pval != null ? l10Millions(Cval, Pval, bearingType) : null;
  const l10h = l10M != null && rpmVal != null ? l10Hours(l10M, rpmVal) : null;
  const validReliability = RELIABILITY_LEVELS.some((r) => r.id === reliabilityId);
  const reliabilityError =
    locale === "nl"
      ? "Kies een betrouwbaarheid uit de lijst om de levensduur te berekenen."
      : "Choose a reliability from the list to calculate bearing life.";
  const a1 = a1For(reliabilityId);
  const l10Adj = l10M != null ? adjustedLife(l10M, a1) : null;
  const l10hAdj = l10h != null ? adjustedLife(l10h, a1) : null;
  const reliabilityLabel = RELIABILITY_LEVELS.find((r) => r.id === reliabilityId)?.reliability;

  const C0val = parseNum(C0);
  const P0val = parseNum(P0);
  const S0 = C0val != null && P0val != null ? staticSafetyFactor(C0val, P0val) : null;
  const s0Status = S0 != null ? staticSafetyStatus(S0) : null;
  const dynamicInputsValid =
    Cval != null && Cval > 0 && Pval != null && Pval > 0 && rpmVal != null && rpmVal > 0;
  const dynamicResultOutOfRange = dynamicInputsValid && (l10M == null || l10h == null);
  const hasStaticInput = C0.trim() !== "" || P0.trim() !== "";
  const staticInputsValid = C0val != null && C0val > 0 && P0val != null && P0val > 0;
  const staticResultOutOfRange = hasStaticInput && staticInputsValid && S0 == null;

  const typeLabel = (bt: BearingLoadType) =>
    BEARING_LOAD_TYPES.find((x) => x.id === bt)?.[locale === "nl" ? "label" : "labelEn"] ?? bt;

  const highSpeedWarning = Cval != null && rpmVal != null && rpmVal > 10000 && Cval < 5;

  const copy = useMemo(() => {
    if (!validReliability || l10M == null || l10h == null || l10Adj == null || l10hAdj == null)
      return "";
    const lines = [
      t.copy(
        C,
        P,
        rpm,
        typeLabel(bearingType),
        String(reliabilityLabel ?? 10),
        fmtBearingLife(l10M, 2),
        fmtBearingLife(l10h),
        fmtBearingLife(l10Adj, 2),
        fmtBearingLife(l10hAdj),
      ),
    ];
    if (S0 != null) {
      lines.push(t.copyStatic(fmtBearingLife(S0, 2)));
      lines.push(s0Status === "fail" ? t.s0Fail : s0Status === "caution" ? t.s0Caution : t.s0Ok);
    }
    if (highSpeedWarning) lines.push(t.speedWarning);
    lines.push(metaCopyLine(BEARING_LIFE_META, locale));
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    validReliability,
    l10M,
    l10h,
    l10Adj,
    l10hAdj,
    S0,
    C,
    P,
    rpm,
    bearingType,
    reliabilityLabel,
    locale,
  ]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>

        <h3 className="mt-6 font-display text-base font-semibold text-ink">{t.dynamicSection}</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label={t.bearingType}>
            <SelectInput
              id="bearing-type"
              value={validBearingType ? bearingType : ""}
              onChange={(v) => setBearingType(v as BearingLoadType)}
              aria-invalid={!validBearingType || undefined}
              aria-describedby={!validBearingType ? "bearing-type-error" : undefined}
            >
              {!validBearingType && (
                <option value="" disabled>
                  {locale === "nl" ? "Kies een lagertype" : "Choose a bearing type"}
                </option>
              )}
              {BEARING_LOAD_TYPES.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {typeLabel(bt.id)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.reliability}>
            <SelectInput
              id="bearing-reliability"
              value={validReliability ? reliabilityId : ""}
              onChange={setReliabilityId}
              aria-invalid={!validReliability || undefined}
              aria-describedby={!validReliability ? "bearing-reliability-error" : undefined}
            >
              {!validReliability && (
                <option value="" disabled>
                  {locale === "nl" ? "Kies een betrouwbaarheid" : "Choose a reliability"}
                </option>
              )}
              {RELIABILITY_LEVELS.map((r) => (
                <option key={r.id} value={r.id}>
                  L{r.reliability} (a1 = {r.a1})
                </option>
              ))}
            </SelectInput>
          </Field>
          <ValidatedNumField
            label={t.dynamicLoad}
            id="bearing-life-C"
            validateInitially={search.has("C")}
            value={C}
            onChange={setC}
            error={Cval == null || Cval <= 0 ? t.positiveNumber : undefined}
          />
          <ValidatedNumField
            label={t.equivDynamicLoad}
            id="bearing-life-P"
            validateInitially={search.has("P")}
            value={P}
            onChange={setP}
            error={Pval == null || Pval <= 0 ? t.positiveNumber : undefined}
          />
          <ValidatedNumField
            label={t.speed}
            id="bearing-life-rpm"
            validateInitially={search.has("n")}
            value={rpm}
            onChange={setRpm}
            error={rpmVal == null || rpmVal <= 0 ? t.positiveNumber : undefined}
          />
        </div>

        {!validBearingType && (
          <p id="bearing-type-error" className="mt-5 text-sm text-muted" role="status">
            {typeError}
          </p>
        )}
        {!validReliability ? (
          <p id="bearing-reliability-error" className="mt-5 text-sm text-muted" role="status">
            {reliabilityError}
          </p>
        ) : !validBearingType ? null : l10M == null || l10h == null ? (
          <p className="mt-5 text-sm text-muted" role="status">
            {dynamicResultOutOfRange ? t.calculationRange : t.fillDynamic}
          </p>
        ) : (
          <>
            <ResultGrid
              items={
                [
                  {
                    label: t.resultL10,
                    value: `${fmtBearingLife(l10M, 2)} × 10⁶ ${locale === "en" ? "rev" : "omw."}`,
                  },
                  { label: t.resultL10h, value: `${fmtBearingLife(l10h)} h` },
                  reliabilityId !== "90"
                    ? {
                        label: t.resultL10Adj,
                        value: `${fmtBearingLife(l10Adj ?? 0, 2)} × 10⁶ ${locale === "en" ? "rev" : "omw."}`,
                      }
                    : null,
                  reliabilityId !== "90"
                    ? { label: t.resultL10hAdj, value: `${fmtBearingLife(l10hAdj ?? 0)} h` }
                    : null,
                ].filter(Boolean) as { label: string; value: string }[]
              }
            />
            {highSpeedWarning ? (
              <p className="mt-3 text-sm leading-relaxed text-muted" role="status">
                {t.speedWarning}
              </p>
            ) : null}
          </>
        )}

        <h3 className="mt-8 font-display text-base font-semibold text-ink">{t.staticSection}</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <ValidatedNumField
            label={t.staticLoad}
            id="bearing-life-C0"
            validateInitially={search.has("C0") || search.has("P0")}
            value={C0}
            onChange={setC0}
            error={hasStaticInput && (C0val == null || C0val <= 0) ? t.positiveNumber : undefined}
          />
          <ValidatedNumField
            label={t.equivStaticLoad}
            id="bearing-life-P0"
            validateInitially={search.has("C0") || search.has("P0")}
            value={P0}
            onChange={setP0}
            error={hasStaticInput && (P0val == null || P0val <= 0) ? t.positiveNumber : undefined}
          />
        </div>
        {S0 == null ? (
          <p className="mt-5 text-sm text-muted" role="status">
            {staticResultOutOfRange ? t.staticCalculationRange : t.fillStatic}
          </p>
        ) : (
          <>
            <ResultGrid items={[{ label: t.resultS0, value: fmtBearingLife(S0, 2) }]} />
            <p
              className={`mt-3 text-sm font-medium ${
                s0Status === "fail"
                  ? "text-danger"
                  : s0Status === "caution"
                    ? "text-warning"
                    : "text-success"
              }`}
              role="status"
            >
              {s0Status === "fail" ? t.s0Fail : s0Status === "caution" ? t.s0Caution : t.s0Ok}
            </p>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {copy ? <CopyResult text={copy} /> : null}
          <CopyLink />
        </div>
        <p className="mt-4 text-sm">
          <Link to="/tools/bearing-fits" className="text-accent hover:underline">
            {t.chainToBearingFits}
          </Link>
        </p>
        <SourceMetaBadge meta={BEARING_LIFE_META} />
      </CalcPanel>
    </>
  );
}
