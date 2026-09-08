import { OringGroove, SchemaPanel } from "@/components/toolkit/schema";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  computeOringGroove,
  fmtOring,
  SEAL_TYPES,
  STANDARD_CORDS,
  type GrooveDirection,
  type SealType,
} from "@/lib/calculators/oring";
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
  SourceBadge,
} from "@/components/calculators/calc-ui";

const T = {
  nl: {
    heading: "O-ringgroef bij koorddiameter",
    intro:
      "Groefdiepte = koord × (1 − squeeze%). Groefbreedte = koord × breedtefactor (ruimte voor volumeverplaatsing en thermische uitzetting). Ontwerpregel, geen ISO 3601-2 gland-tabel — controleer de definitieve maat tegen de norm of fabrikant-designgids vóór productie.",
    cordDiameter: "Koorddiameter (mm)",
    direction: "Richting",
    radial: "Radiaal (as/boring)",
    axial: "Axiaal (flens/vlak)",
    application: "Toepassing",
    squeeze: (min: number, max: number) => `Squeeze % (richtwaarde ${min}–${max}%)`,
    widthFactor: "Breedtefactor (× koord)",
    fillValid: "Vul een geldige koorddiameter en squeeze% (0–100) in.",
    outOfRange: (squeeze: string, min: number, max: number, seal: string) =>
      `Squeeze ${squeeze}% ligt buiten de richtwaarde ${min}–${max}% voor ${seal}. Te weinig squeeze lekt, te veel verkort de levensduur van de O-ring.`,
    depthRadial: "Groefdiepte (radiaal)",
    depthAxial: "Groefdiepte (axiaal)",
    grooveWidth: "Groefbreedte",
    standardCords: "Standaard ISO-koorden",
    thCord: "Koord Ø (mm)",
    thDepthAt: (pct: number) => `Groefdiepte @ ${pct}% squeeze`,
    sourceBadge:
      "ISO 3601-1 definieert 1,80 / 2,65 / 3,55 / 5,30 / 7,00 mm als standaard metrische koorddiameters. Groefafmetingen hier zijn een ontwerpregel (squeeze% en breedtefactor), geen ISO 3601-2 gland-tabel.",
    copy: (
      cord: string,
      seal: string,
      squeeze: string,
      depthLabel: string,
      depth: string,
      width: string,
    ) =>
      [
        `Koord Ø${cord} mm, ${seal}, squeeze ${squeeze}%`,
        `${depthLabel} = ${depth} mm`,
        `Groefbreedte = ${width} mm`,
      ].join("\n"),
  },
  en: {
    heading: "O-ring groove at cord diameter",
    intro:
      "Groove depth = cord × (1 − squeeze%). Groove width = cord × width factor (room for volume displacement and thermal expansion). Design rule, not an ISO 3601-2 gland table — check the final dimension against the standard or manufacturer design guide before production.",
    cordDiameter: "Cord diameter (mm)",
    direction: "Direction",
    radial: "Radial (shaft/bore)",
    axial: "Axial (flange/face)",
    application: "Application",
    squeeze: (min: number, max: number) => `Squeeze % (guideline ${min}–${max}%)`,
    widthFactor: "Width factor (× cord)",
    fillValid: "Enter a valid cord diameter and squeeze% (0–100).",
    outOfRange: (squeeze: string, min: number, max: number, seal: string) =>
      `Squeeze ${squeeze}% is outside the guideline ${min}–${max}% for ${seal.toLowerCase()}. Too little squeeze leaks, too much shortens the O-ring's life.`,
    depthRadial: "Groove depth (radial)",
    depthAxial: "Groove depth (axial)",
    grooveWidth: "Groove width",
    standardCords: "Standard ISO cords",
    thCord: "Cord Ø (mm)",
    thDepthAt: (pct: number) => `Groove depth @ ${pct}% squeeze`,
    sourceBadge:
      "ISO 3601-1 defines 1.80 / 2.65 / 3.55 / 5.30 / 7.00 mm as standard metric cord diameters. Groove dimensions here are a design rule (squeeze% and width factor), not an ISO 3601-2 gland table.",
    copy: (
      cord: string,
      seal: string,
      squeeze: string,
      depthLabel: string,
      depth: string,
      width: string,
    ) =>
      [
        `Cord Ø${cord} mm, ${seal}, squeeze ${squeeze}%`,
        `${depthLabel} = ${depth} mm`,
        `Groove width = ${width} mm`,
      ].join("\n"),
  },
};

export function OringGroovesCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [cord, setCord] = useState(search.get("cord") ?? "3.55");
  const [direction, setDirection] = useState<GrooveDirection>(
    (search.get("dir") as GrooveDirection) ?? "radiaal",
  );
  const [sealType, setSealType] = useState<SealType>(
    (search.get("seal") as SealType) ?? "statisch",
  );
  const seal = SEAL_TYPES.find((s) => s.id === sealType) ?? SEAL_TYPES[0];
  const sealLabel = (s: { label: string; labelEn: string }) =>
    locale === "nl" ? s.label : s.labelEn;
  const [squeeze, setSqueeze] = useState(search.get("sq") ?? String(seal.default));
  const [widthFactor, setWidthFactor] = useState(search.get("wf") ?? "1.4");

  useEffect(() => {
    const next = new URLSearchParams(search);
    next.set("cord", cord);
    next.set("dir", direction);
    next.set("seal", sealType);
    next.set("sq", squeeze);
    next.set("wf", widthFactor);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cord, direction, sealType, squeeze, widthFactor]);

  function onSealType(id: SealType) {
    setSealType(id);
    const s = SEAL_TYPES.find((x) => x.id === id);
    if (s) setSqueeze(String(s.default));
  }

  const cordVal = parseNum(cord);
  const squeezeVal = parseNum(squeeze);
  const widthFactorVal = parseNum(widthFactor) ?? NaN;
  const result =
    cordVal != null && squeezeVal != null
      ? computeOringGroove(cordVal, squeezeVal, widthFactorVal)
      : null;
  const outOfRange =
    squeezeVal != null && (squeezeVal < seal.squeezeMin || squeezeVal > seal.squeezeMax);

  const copy = useMemo(() => {
    if (!result) return "";
    const depthLabel = direction === "radiaal" ? t.depthRadial : t.depthAxial;
    return t.copy(
      cord,
      sealLabel(seal),
      squeeze,
      depthLabel,
      fmtOring(result.depth),
      fmtOring(result.width),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, cord, sealType, squeeze, direction, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.cordDiameter}>
            <SelectInput value={cord} onChange={setCord}>
              {STANDARD_CORDS.map((c) => (
                <option key={c} value={c}>
                  {c.toFixed(2)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.direction}>
            <SelectInput value={direction} onChange={(v) => setDirection(v as GrooveDirection)}>
              <option value="radiaal">{t.radial}</option>
              <option value="axiaal">{t.axial}</option>
            </SelectInput>
          </Field>
          <Field label={t.application}>
            <SelectInput value={sealType} onChange={(v) => onSealType(v as SealType)}>
              {SEAL_TYPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {sealLabel(s)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.squeeze(seal.squeezeMin, seal.squeezeMax)}>
            <NumInput id="oring-squeeze" value={squeeze} onChange={setSqueeze} />
          </Field>
          <Field label={t.widthFactor}>
            <NumInput id="oring-width" value={widthFactor} onChange={setWidthFactor} />
          </Field>
        </div>

        {!result ? (
          <p className="mt-5 text-sm text-muted">{t.fillValid}</p>
        ) : (
          <>
            {outOfRange ? (
              <Note>
                {t.outOfRange(squeeze, seal.squeezeMin, seal.squeezeMax, sealLabel(seal))}
              </Note>
            ) : null}
            <ResultGrid
              items={[
                {
                  label: direction === "radiaal" ? t.depthRadial : t.depthAxial,
                  value: `${fmtOring(result.depth)} mm`,
                },
                { label: t.grooveWidth, value: `${fmtOring(result.width)} mm` },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>
      <SchemaPanel caption="Technisch schema · maten in mm · schematisch, niet op schaal">
        <OringGroove
          kind={direction === "axiaal" ? "axial" : "radial"}
          t={result?.depth}
          b={result?.width}
        />
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.standardCords}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thCord}</th>
                <th>{t.thDepthAt(seal.default)}</th>
                <th>{t.grooveWidth}</th>
              </tr>
            </thead>
            <tbody>
              {STANDARD_CORDS.map((c) => {
                const r = computeOringGroove(c, seal.default, widthFactorVal);
                return (
                  <tr key={c} className={cordVal === c ? "is-active" : ""}>
                    <th scope="row" className="normal-case">
                      {c.toFixed(2)}
                    </th>
                    <td>{r ? `${fmtOring(r.depth)} mm` : "—"}</td>
                    <td>{r ? `${fmtOring(r.width)} mm` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SourceBadge>{t.sourceBadge}</SourceBadge>
      </section>
    </>
  );
}
