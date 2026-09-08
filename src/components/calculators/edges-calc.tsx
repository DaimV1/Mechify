import { BendSection, SchemaPanel } from "@/components/toolkit/schema";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  bendAllowance,
  bendDeduction,
  flatLength,
  fmtBendNum,
  kFactorFor,
  MATERIAL_CLASSES,
  minFlangeLength,
  minZOffset,
  rminFor,
  suggestedDieOpening,
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
  SelectInput,
  SourceLink,
} from "@/components/calculators/calc-ui";

const TXT = {
  nl: {
    heading: "Buigtoeslag (K-factor)",
    intro:
      "BA = θ·(Ri + K·T), BD = 2·(Ri+T)·tan(θ/2) − BA. K volgt uit de vuistregel Ri/T: <1 → 0,33, 1–3 → 0,40, >3 → 0,50. Kalibreer op de eigen kantpers voor kritieke toleranties — dit is een praktijkbenadering, geen gemeten materiaalwaarde.",
    thickness: "Plaatdikte T (mm)",
    innerRadius: "Binnenstraal Ri (mm)",
    bendAngle: "Buighoek θ (°)",
    material: "Materiaal",
    leg1: "Been 1, buitenmaat (mm, optioneel)",
    leg2: "Been 2, buitenmaat (mm, optioneel)",
    fillValid: "Vul plaatdikte, straal (≥0) en een hoek groter dan 0 en kleiner dan 180° in.",
    kFactor: "K-factor",
    ba: "Buigtoeslag (BA)",
    bd: "Buigaftrek (BD)",
    flatLength: "Platte lengte",
    minTitle: "Minimale straal, beenlengte en matrijsopening",
    minNote:
      "Algemene DFM-richtwaarden voor zetwerk, geen normwaarde — controleer bij de plaatleverancier of het zetbedrijf voor kritieke onderdelen.",
    minRadius: (material: string) => `Min. binnenstraal (${material})`,
    minFlange: "Min. beenlengte (4×T)",
    typicalDie: "Typische V-matrijsopening (8×T)",
    punchRadius: "Bijbehorende ponsstraal (V/6)",
    zTitle: "Z-buiging (offset)",
    zNote:
      "Geometrische ondergrens: de twee buigstralen plus de plaatdikte moeten fysiek passen (Z_min = 2·Ri + T). Dit is geen volledige gereedschap-vrijloopcontrole — bij een krappe offset altijd de matrijs- en ponsvorm van de kantpers controleren.",
    zOffsetLabel: "Beoogde offsethoogte Z (mm)",
    zMinLabel: "Geometrische ondergrens Z_min",
    zTooSmall: (z: string, zMin: string) =>
      `Z = ${z} mm ligt onder de ondergrens van ${zMin} mm — de twee buigstralen passen dan niet zonder overlap. Vergroot de offset of verklein de binnenstraal.`,
    source: "Engineering ToolBox — Sheet metal bend allowance",
  },
  en: {
    heading: "Bend allowance (K-factor)",
    intro:
      "BA = θ·(Ri + K·T), BD = 2·(Ri+T)·tan(θ/2) − BA. K follows the rule of thumb Ri/T: <1 → 0.33, 1–3 → 0.40, >3 → 0.50. Calibrate on your own press brake for critical tolerances — this is a practical approximation, not a measured material value.",
    thickness: "Sheet thickness T (mm)",
    innerRadius: "Inside radius Ri (mm)",
    bendAngle: "Bend angle θ (°)",
    material: "Material",
    leg1: "Leg 1, outside dimension (mm, optional)",
    leg2: "Leg 2, outside dimension (mm, optional)",
    fillValid: "Enter thickness, radius (≥0) and an angle between 0 and 180°.",
    kFactor: "K-factor",
    ba: "Bend allowance (BA)",
    bd: "Bend deduction (BD)",
    flatLength: "Flat length",
    minTitle: "Minimum radius, flange length and die opening",
    minNote:
      "Generic DFM guidelines for sheet metal, not a standard value — check with the sheet supplier or bending shop for critical parts.",
    minRadius: (material: string) => `Min. inside radius (${material})`,
    minFlange: "Min. flange length (4×T)",
    typicalDie: "Typical V-die opening (8×T)",
    punchRadius: "Matching punch radius (V/6)",
    zTitle: "Z-bend (offset)",
    zNote:
      "Geometric lower bound: the two bend radii plus the sheet thickness must physically fit (Z_min = 2·Ri + T). This is not a full tooling clearance check — for a tight offset, always check the press brake's die and punch shape.",
    zOffsetLabel: "Intended offset height Z (mm)",
    zMinLabel: "Geometric lower bound Z_min",
    zTooSmall: (z: string, zMin: string) =>
      `Z = ${z} mm is below the lower bound of ${zMin} mm — the two bend radii won't fit without overlap. Increase the offset or reduce the inside radius.`,
    source: "Engineering ToolBox — Sheet metal bend allowance",
  },
};

export function EdgesCalc() {
  const { locale } = useLocale();
  const t = TXT[locale];
  const [search, setSearch] = useSearchParams();
  const [thickness, setThickness] = useState(search.get("t") ?? "2");
  const [radius, setRadius] = useState(search.get("r") ?? "2");
  const [angle, setAngle] = useState(search.get("a") ?? "90");
  const [leg1, setLeg1] = useState(search.get("l1") ?? "30");
  const [leg2, setLeg2] = useState(search.get("l2") ?? "30");
  const [materialId, setMaterialId] = useState(search.get("mat") ?? "staal");
  const [zOffset, setZOffset] = useState(search.get("z") ?? "6");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    set("t", thickness);
    set("r", radius);
    set("a", angle);
    set("l1", leg1);
    set("l2", leg2);
    next.set("mat", materialId);
    set("z", zOffset);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thickness, radius, angle, leg1, leg2, materialId, zOffset]);

  const T = parseNum(thickness);
  const Ri = parseNum(radius);
  const angleDeg = parseNum(angle);
  const L1 = parseNum(leg1) ?? 0;
  const L2 = parseNum(leg2) ?? 0;
  const zVal = parseNum(zOffset);
  const materialLabel = (id: string) => {
    const m = MATERIAL_CLASSES.find((mc) => mc.id === id);
    return m ? (locale === "nl" ? m.label : m.labelEn) : "";
  };

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
  const flat = valid && BD != null ? flatLength([L1, L2], BD) : null;
  const rmin = T != null && T > 0 ? rminFor(materialId, T) : null;
  const flangeMin = T != null && T > 0 ? minFlangeLength(T) : null;
  const dieOpening = T != null && T > 0 ? suggestedDieOpening(T) : null;
  const zMin = T != null && Ri != null && T > 0 ? minZOffset(Ri, T) : null;

  const copy = useMemo(() => {
    if (!valid || BA == null || BD == null) return "";
    const lines = [
      `T=${thickness} mm, Ri=${radius} mm, θ=${angle}°, K=${fmtBendNum(K!, 2)}`,
      `${t.ba} = ${fmtBendNum(BA, 2)} mm`,
      `${t.bd} = ${fmtBendNum(BD, 2)} mm`,
    ];
    if (flat != null && (L1 > 0 || L2 > 0))
      lines.push(`${t.flatLength} = ${fmtBendNum(flat, 2)} mm`);
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, BA, BD, flat, K, thickness, radius, angle, L1, L2, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
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
          <Field label={t.material}>
            <SelectInput value={materialId} onChange={setMaterialId}>
              {MATERIAL_CLASSES.map((m) => (
                <option key={m.id} value={m.id}>
                  {locale === "nl" ? m.label : m.labelEn}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.leg1}>
            <NumInput id="edge-leg1" value={leg1} onChange={setLeg1} />
          </Field>
          <Field label={t.leg2}>
            <NumInput id="edge-leg2" value={leg2} onChange={setLeg2} />
          </Field>
        </div>

        {!valid ? (
          <p className="mt-5 text-sm text-muted">{t.fillValid}</p>
        ) : (
          <>
            <ResultGrid
              items={
                [
                  { label: t.kFactor, value: fmtBendNum(K!, 2) },
                  { label: t.ba, value: `${fmtBendNum(BA!, 2)} mm` },
                  { label: t.bd, value: `${fmtBendNum(BD!, 2)} mm` },
                  flat != null && (L1 > 0 || L2 > 0)
                    ? { label: t.flatLength, value: `${fmtBendNum(flat, 2)} mm` }
                    : null,
                ].filter(Boolean) as { label: string; value: string }[]
              }
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>
      <SchemaPanel caption="Referentiedoorsnede van een haakse buiging · vrije buighoek staat in de berekening · maten in mm">
        <BendSection kind="haaks" ri={Ri} s={flangeMin} w={dieOpening?.v ?? null} t={T} />
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t.minTitle}</h2>
        <Note>{t.minNote}</Note>
        <ResultGrid
          items={
            [
              rmin != null
                ? {
                    label: t.minRadius(materialLabel(materialId)),
                    value: `${fmtBendNum(rmin, 2)} mm`,
                  }
                : null,
              flangeMin != null
                ? { label: t.minFlange, value: `${fmtBendNum(flangeMin, 2)} mm` }
                : null,
              dieOpening != null
                ? { label: t.typicalDie, value: `${fmtBendNum(dieOpening.v, 1)} mm` }
                : null,
              dieOpening != null
                ? { label: t.punchRadius, value: `${fmtBendNum(dieOpening.punchRadius, 2)} mm` }
                : null,
            ].filter(Boolean) as { label: string; value: string }[]
          }
        />

        <h3 className="mt-8 font-display text-lg font-semibold tracking-tight text-ink">
          {t.zTitle}
        </h3>
        <Note>{t.zNote}</Note>
        <div className="mt-4 max-w-xs">
          <Field label={t.zOffsetLabel}>
            <NumInput id="edge-z" value={zOffset} onChange={setZOffset} />
          </Field>
        </div>
        {zMin != null ? (
          <>
            <ResultGrid items={[{ label: t.zMinLabel, value: `${fmtBendNum(zMin, 2)} mm` }]} />
            {zVal != null && zVal < zMin ? (
              <Note>{t.zTooSmall(fmtBendNum(zVal, 2), fmtBendNum(zMin, 2))}</Note>
            ) : null}
          </>
        ) : null}

        <SourceLink href="https://www.engineeringtoolbox.com/bend-allowance-d_1904.html">
          {t.source}
        </SourceLink>
      </section>
    </>
  );
}
