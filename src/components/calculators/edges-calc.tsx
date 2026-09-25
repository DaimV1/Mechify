import { KantenCalc } from "@/components/toolkit/kanten-calc";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  bendAllowance,
  bendDeduction,
  singleBendFlatLength,
  fmtBendNum,
  kFactorFor,
} from "@/lib/calculators/bending";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  NumInput,
  parseNum,
  ResultGrid,
} from "@/components/calculators/calc-ui";
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";

const KFACTOR_META: EngineeringSourceMeta = {
  basisType: "heuristic",
  reference: "K-factor rule of thumb by Ri/T band (<1 -> 0.33, 1-<3 -> 0.40, >=3 -> 0.50)",
  status: "estimate",
  checkedDate: "2026-09-17",
  assumptions: {
    nl: "Praktijkbenadering, geen gemeten materiaalwaarde — kalibreer op de eigen kantpers voor kritieke toleranties.",
    en: "Practical approximation, not a measured material value — calibrate on your own press brake for critical tolerances.",
  },
};

const TXT = {
  nl: {
    heading: "Buigtoeslag (K-factor)",
    intro:
      "BA = θ·(Ri + K·T), BD = 2·(Ri+T)·tan(θ/2) − BA. K volgt uit de vuistregel Ri/T: <1 → 0,33, 1–<3 → 0,40, ≥3 → 0,50. Kalibreer op de eigen kantpers voor kritieke toleranties — dit is een praktijkbenadering, geen gemeten materiaalwaarde.",
    thickness: "Plaatdikte T (mm)",
    innerRadius: "Binnenstraal Ri (mm)",
    bendAngle: "Buighoek θ (° vanuit vlak; 90° = haaks)",
    material: "Materiaal",
    leg1: "Been 1, buitenmaat (mm, optioneel)",
    leg2: "Been 2, buitenmaat (mm, optioneel)",
    fillValid: "Vul plaatdikte, straal (≥0) en een hoek groter dan 0 en kleiner dan 180° in.",
    kFactor: "K-factor",
    ba: "Buigtoeslag (BA)",
    bd: "Buigaftrek (BD)",
    flatLength: "Platte lengte",
    invalidLegs:
      "Voor de platte lengte zijn twee geldige buitenmaten nodig, elk minstens (Ri+T)·tan(θ/2). Dit controleert geometrie, niet de maakbaarheid op de kantpers.",
  },
  en: {
    heading: "Bend allowance (K-factor)",
    intro:
      "BA = θ·(Ri + K·T), BD = 2·(Ri+T)·tan(θ/2) − BA. K follows the rule of thumb Ri/T: <1 → 0.33, 1–<3 → 0.40, ≥3 → 0.50. Calibrate on your own press brake for critical tolerances — this is a practical approximation, not a measured material value.",
    thickness: "Sheet thickness T (mm)",
    innerRadius: "Inside radius Ri (mm)",
    bendAngle: "Bend angle θ (° from flat; 90° = right angle)",
    material: "Material",
    leg1: "Leg 1, outside dimension (mm, optional)",
    leg2: "Leg 2, outside dimension (mm, optional)",
    fillValid: "Enter thickness, radius (≥0) and an angle between 0 and 180°.",
    kFactor: "K-factor",
    ba: "Bend allowance (BA)",
    bd: "Bend deduction (BD)",
    flatLength: "Flat length",
    invalidLegs:
      "Flat length requires two valid outside dimensions, each at least (Ri+T)·tan(θ/2). This checks geometry, not press-brake manufacturability.",
  },
};

export function EdgesCalc() {
  const { locale } = useLocale();
  const t = TXT[locale];
  const [search, setSearch] = useSearchParams();
  const [thickness, setThickness] = useState(search.get("ba_t") ?? "2");
  const [radius, setRadius] = useState(search.get("ba_r") ?? "2");
  const [angle, setAngle] = useState(search.get("ba_a") ?? "90");
  const [leg1, setLeg1] = useState(search.get("ba_l1") ?? "30");
  const [leg2, setLeg2] = useState(search.get("ba_l2") ?? "30");

  useEffect(() => {
    setSearch(
      (previous) => {
        const next = new URLSearchParams(previous);
        const set = (k: string, v: string) => next.set(k, v);
        set("ba_t", thickness);
        set("ba_r", radius);
        set("ba_a", angle);
        set("ba_l1", leg1);
        set("ba_l2", leg2);
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thickness, radius, angle, leg1, leg2]);

  const T = parseNum(thickness);
  const Ri = parseNum(radius);
  const angleDeg = parseNum(angle);
  const L1 = parseNum(leg1);
  const L2 = parseNum(leg2);

  const K = T != null && Ri != null && T > 0 ? kFactorFor(Ri / T) : null;
  const valid =
    T != null &&
    T > 0 &&
    Ri != null &&
    Ri >= 0 &&
    angleDeg != null &&
    angleDeg > 0 &&
    angleDeg < 180 &&
    K != null;

  const BA = valid ? bendAllowance(angleDeg!, Ri!, T!, K!) : null;
  const BD = valid ? bendDeduction(angleDeg!, Ri!, T!, K!) : null;
  const flat = valid ? singleBendFlatLength([L1, L2], angleDeg!, Ri!, T!, K!) : null;

  const copy = useMemo(() => {
    if (!valid || BA == null || BD == null) return "";
    const lines = [
      `T=${thickness} mm, Ri=${radius} mm, θ=${angle}°, K=${fmtBendNum(K!, 2)}`,
      `${t.ba} = ${fmtBendNum(BA, 2)} mm`,
      `${t.bd} = ${fmtBendNum(BD, 2)} mm`,
    ];
    if (flat != null) lines.push(`${t.flatLength} = ${fmtBendNum(flat, 2)} mm`);
    lines.push(metaCopyLine(KFACTOR_META, locale));
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, BA, BD, flat, K, thickness, radius, angle, L1, L2, locale]);

  return (
    <>
      <KantenCalc />
      <details className="mt-10">
        <summary className="cursor-pointer font-display text-xl text-ink">
          {locale === "nl"
            ? "Aanvullend: uitslag bij een vrije buighoek"
            : "Additional: flat pattern for a custom bend angle"}
        </summary>
        <CalcPanel>
          <CalcEyebrow />
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
            {t.heading}
          </h2>
          <Note>{t.intro}</Note>
          <SourceMetaBadge meta={KFACTOR_META} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label={t.thickness}>
              <NumInput id="edge-t" value={thickness} onChange={setThickness} />
            </Field>
            <Field label={t.innerRadius}>
              <NumInput id="edge-r" value={radius} onChange={setRadius} />
            </Field>
            <Field label={t.bendAngle}>
              <NumInput id="edge-angle" value={angle} onChange={setAngle} />
            </Field>
            <Field label={t.leg1}>
              <NumInput id="edge-leg1" value={leg1} onChange={setLeg1} />
            </Field>
            <Field label={t.leg2}>
              <NumInput id="edge-leg2" value={leg2} onChange={setLeg2} />
            </Field>
          </div>

          {!valid ? (
            <p className="mt-5 text-sm text-muted" role="status">
              {t.fillValid}
            </p>
          ) : (
            <>
              <ResultGrid
                items={
                  [
                    { label: t.kFactor, value: fmtBendNum(K!, 2) },
                    { label: t.ba, value: `${fmtBendNum(BA!, 2)} mm` },
                    { label: t.bd, value: `${fmtBendNum(BD!, 2)} mm` },
                    flat != null
                      ? { label: t.flatLength, value: `${fmtBendNum(flat, 2)} mm` }
                      : null,
                  ].filter(Boolean) as { label: string; value: string }[]
                }
              />
              {flat == null && (
                <p className="mt-3 text-sm leading-relaxed text-muted" role="status">
                  {t.invalidLegs}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <CopyResult text={copy} />
                <CopyLink />
              </div>
            </>
          )}
        </CalcPanel>
      </details>
    </>
  );
}
