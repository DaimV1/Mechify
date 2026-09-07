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

export function OringGroovesCalc() {
  const [search, setSearch] = useSearchParams();
  const [cord, setCord] = useState(search.get("cord") ?? "3.55");
  const [direction, setDirection] = useState<GrooveDirection>((search.get("dir") as GrooveDirection) ?? "radiaal");
  const [sealType, setSealType] = useState<SealType>((search.get("seal") as SealType) ?? "statisch");
  const seal = SEAL_TYPES.find((s) => s.id === sealType) ?? SEAL_TYPES[0];
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
  const widthFactorVal = parseNum(widthFactor) ?? 1.4;
  const result = cordVal != null && squeezeVal != null ? computeOringGroove(cordVal, squeezeVal, widthFactorVal) : null;
  const outOfRange = squeezeVal != null && (squeezeVal < seal.squeezeMin || squeezeVal > seal.squeezeMax);

  const copy = useMemo(() => {
    if (!result) return "";
    const depthLabel = direction === "radiaal" ? "Groefdiepte (radiaal)" : "Groefdiepte (axiaal)";
    return [
      `Koord Ø${cord} mm, ${sealType}, squeeze ${squeeze}%`,
      `${depthLabel} = ${fmtOring(result.depth)} mm`,
      `Groefbreedte = ${fmtOring(result.width)} mm`,
    ].join("\n");
  }, [result, cord, sealType, squeeze, direction]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">O-ringgroef bij koorddiameter</h2>
        <Note>
          Groefdiepte = koord × (1 − squeeze%). Groefbreedte = koord × breedtefactor (ruimte voor
          volumeverplaatsing en thermische uitzetting). Ontwerpregel, geen ISO 3601-2 gland-tabel — controleer de
          definitieve maat tegen de norm of fabrikant-designgids vóór productie.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Koorddiameter (mm)">
            <SelectInput value={cord} onChange={setCord}>
              {STANDARD_CORDS.map((c) => (
                <option key={c} value={c}>
                  {c.toFixed(2)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Richting">
            <SelectInput value={direction} onChange={(v) => setDirection(v as GrooveDirection)}>
              <option value="radiaal">Radiaal (as/boring)</option>
              <option value="axiaal">Axiaal (flens/vlak)</option>
            </SelectInput>
          </Field>
          <Field label="Toepassing">
            <SelectInput value={sealType} onChange={(v) => onSealType(v as SealType)}>
              {SEAL_TYPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={`Squeeze % (richtwaarde ${seal.squeezeMin}–${seal.squeezeMax}%)`}>
            <NumInput id="oring-squeeze" value={squeeze} onChange={setSqueeze} />
          </Field>
          <Field label="Breedtefactor (× koord)">
            <NumInput id="oring-width" value={widthFactor} onChange={setWidthFactor} />
          </Field>
        </div>

        {!result ? (
          <p className="mt-5 text-sm text-muted">Vul een geldige koorddiameter en squeeze% (0–100) in.</p>
        ) : (
          <>
            {outOfRange ? (
              <Note>
                Squeeze {squeeze}% ligt buiten de richtwaarde {seal.squeezeMin}–{seal.squeezeMax}% voor{" "}
                {seal.label.toLowerCase()}. Te weinig squeeze lekt, te veel verkort de levensduur van de O-ring.
              </Note>
            ) : null}
            <ResultGrid
              items={[
                { label: direction === "radiaal" ? "Groefdiepte (radiaal)" : "Groefdiepte (axiaal)", value: `${fmtOring(result.depth)} mm` },
                { label: "Groefbreedte", value: `${fmtOring(result.width)} mm` },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Standaard ISO-koorden</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Koord Ø (mm)</th>
                <th>Groefdiepte @ {seal.default}% squeeze</th>
                <th>Groefbreedte</th>
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
        <SourceBadge>
          ISO 3601-1 definieert 1,80 / 2,65 / 3,55 / 5,30 / 7,00 mm als standaard metrische koorddiameters.
          Groefafmetingen hier zijn een ontwerpregel (squeeze% en breedtefactor), geen ISO 3601-2 gland-tabel.
        </SourceBadge>
      </section>
    </>
  );
}
