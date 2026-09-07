import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BEARING_SIDES,
  housingClassFor,
  housingFitAt,
  HOUSING_BEARING_CLASSES,
  LOAD_CLASSES,
  shaftClassFor,
  shaftFitAt,
  SHAFT_BEARING_CLASSES,
  type BearingSide,
  type LoadClass,
} from "@/lib/calculators/bearing-fits";
import { readStoredDiameter, storeDiameter } from "@/lib/tools";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  parseWholeMm,
  ResultGrid,
  SelectInput,
  SourceBadge,
  WholeMmInput,
} from "@/components/calculators/calc-ui";

export function BearingFitsCalc() {
  const [search, setSearch] = useSearchParams();
  const [diameter, setDiameter] = useState(() => search.get("d") ?? readStoredDiameter({ min: 1, max: 50 }));
  const [load, setLoad] = useState<LoadClass>((search.get("load") as LoadClass) ?? "normaal");
  const [side, setSide] = useState<BearingSide>((search.get("side") as BearingSide) ?? "vast");

  useEffect(() => {
    const next = new URLSearchParams(search);
    if (diameter) next.set("d", diameter);
    else next.delete("d");
    next.set("load", load);
    next.set("side", side);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diameter, load, side]);

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;

  const shaftClass = Number.isFinite(d) ? shaftClassFor(load, d) : null;
  const housingClass = housingClassFor(load, side);
  const shaftFit = shaftClass && Number.isFinite(d) ? shaftFitAt(d, shaftClass) : null;
  const housingFit = Number.isFinite(d) ? housingFitAt(d, housingClass) : null;

  const copy = useMemo(() => {
    if (!shaftClass || !shaftFit || !housingFit) return "";
    return [
      `As Ø${d} mm, ${load} belasting, ${side} zijde`,
      `As: ${shaftClass} → ${shaftFit.range} mm`,
      `Behuizing: ${housingClass} → ${housingFit.range} mm`,
    ].join("\n");
  }, [shaftClass, shaftFit, housingFit, d, load, side, housingClass]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Lagerpassing bij as-Ø</h2>
        <Note>
          Groefkogellagers, cilindrische boring, tot Ø50 mm. Uitgangspunt: roterende binnenring, stilstaande
          buitenring met puntbelasting — het gangbare geval. Algemene richtlijn; de volledige selectietabel van de
          lagerfabrikant houdt ook rekening met asmateriaal, warmteontwikkeling en meeroterende buitenring.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label="As-Ø (mm)">
            <WholeMmInput id="bearing-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label="Belasting">
            <SelectInput value={load} onChange={(v) => setLoad(v as LoadClass)}>
              {LOAD_CLASSES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Lagerpositie">
            <SelectInput value={side} onChange={(v) => setSide(v as BearingSide)}>
              {BEARING_SIDES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">Vul een as-Ø in.</p>
        ) : !shaftFit || !housingFit ? (
          <p className="mt-5 text-sm text-muted">Geen gegevens voor Ø{d} mm — het bereik is 0 t/m 50 mm.</p>
        ) : (
          <>
            <ResultGrid
              items={[
                { label: `As — ${shaftClass}`, value: `${shaftFit.range} mm` },
                { label: `Behuizing — ${housingClass}`, value: `${housingFit.range} mm` },
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
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Selectiegids (vereenvoudigd)</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Belasting</th>
                <th>As-klasse</th>
                <th>Behuizing — vast</th>
                <th>Behuizing — los</th>
              </tr>
            </thead>
            <tbody>
              {LOAD_CLASSES.map((l) => (
                <tr key={l.id} className={l.id === load ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {l.label}
                  </th>
                  <td>{Number.isFinite(d) ? shaftClassFor(l.id, d) : shaftClassFor(l.id, 20)}</td>
                  <td>{housingClassFor(l.id, "vast")}</td>
                  <td>{housingClassFor(l.id, "los")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="table-scroll">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>As-klasse</th>
                  <th>Bovenmaat / ondermaat</th>
                </tr>
              </thead>
              <tbody>
                {SHAFT_BEARING_CLASSES.map((c) => {
                  const fit = Number.isFinite(d) ? shaftFitAt(d, c) : null;
                  return (
                    <tr key={c} className={c === shaftClass ? "is-active" : ""}>
                      <th scope="row" className="normal-case">
                        {c}
                      </th>
                      <td>{fit ? `${fit.range} mm` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-scroll">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Behuizing-klasse</th>
                  <th>Bovenmaat / ondermaat</th>
                </tr>
              </thead>
              <tbody>
                {HOUSING_BEARING_CLASSES.map((c) => {
                  const fit = Number.isFinite(d) ? housingFitAt(d, c) : null;
                  return (
                    <tr key={c} className={c === housingClass ? "is-active" : ""}>
                      <th scope="row" className="normal-case">
                        {c}
                      </th>
                      <td>{fit ? `${fit.range} mm` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <SourceBadge>
          Vereenvoudigde richtlijn op basis van de algemene selectiecriteria die lagerfabrikanten (o.a. SKF)
          publiceren. Numerieke afwijkingen via de ISO 286-tabellen van de passingen-tool. Raadpleeg de
          lagercatalogus voor de volledige selectietabel.
        </SourceBadge>
      </section>
    </>
  );
}
