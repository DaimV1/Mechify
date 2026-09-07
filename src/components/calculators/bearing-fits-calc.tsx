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
import { useLocale } from "@/lib/i18n/locale-context";
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

const T = {
  nl: {
    heading: "Lagerpassing bij as-Ø",
    intro:
      "Groefkogellagers, cilindrische boring, tot Ø50 mm. Uitgangspunt: roterende binnenring, stilstaande buitenring met puntbelasting — het gangbare geval. Algemene richtlijn; de volledige selectietabel van de lagerfabrikant houdt ook rekening met asmateriaal, warmteontwikkeling en meeroterende buitenring.",
    diameter: "As-Ø (mm)",
    load: "Belasting",
    position: "Lagerpositie",
    fillDiameter: "Vul een as-Ø in.",
    noData: (d: number) => `Geen gegevens voor Ø${d} mm — het bereik is 0 t/m 50 mm.`,
    shaft: "As",
    housing: "Behuizing",
    guideTitle: "Selectiegids (vereenvoudigd)",
    thLoad: "Belasting",
    thShaftClass: "As-klasse",
    thHousingFixed: "Behuizing — vast",
    thHousingFloating: "Behuizing — los",
    thBounds: "Bovenmaat / ondermaat",
    thHousingClass: "Behuizing-klasse",
    sourceBadge:
      "Vereenvoudigde richtlijn op basis van de algemene selectiecriteria die lagerfabrikanten (o.a. SKF) publiceren. Numerieke afwijkingen via de ISO 286-tabellen van de passingen-tool. Raadpleeg de lagercatalogus voor de volledige selectietabel.",
    copy: (d: number, load: string, side: string, shaftClass: string, shaftRange: string, housingClass: string, housingRange: string) =>
      [`As Ø${d} mm, ${load} belasting, ${side} zijde`, `As: ${shaftClass} → ${shaftRange} mm`, `Behuizing: ${housingClass} → ${housingRange} mm`].join("\n"),
  },
  en: {
    heading: "Bearing fit at shaft Ø",
    intro:
      "Deep groove ball bearings, cylindrical bore, up to Ø50 mm. Assumption: rotating inner ring, stationary outer ring with point load — the common case. General guideline; the bearing manufacturer's full selection table also accounts for shaft material, heat build-up and a co-rotating outer ring.",
    diameter: "Shaft Ø (mm)",
    load: "Load",
    position: "Bearing position",
    fillDiameter: "Enter a shaft Ø.",
    noData: (d: number) => `No data for Ø${d} mm — the range is 0 to 50 mm.`,
    shaft: "Shaft",
    housing: "Housing",
    guideTitle: "Selection guide (simplified)",
    thLoad: "Load",
    thShaftClass: "Shaft class",
    thHousingFixed: "Housing — fixed",
    thHousingFloating: "Housing — floating",
    thBounds: "Upper / lower deviation",
    thHousingClass: "Housing class",
    sourceBadge:
      "Simplified guideline based on the general selection criteria published by bearing manufacturers (SKF, among others). Numeric deviations via the fits tool's ISO 286 tables. Consult the bearing catalog for the full selection table.",
    copy: (d: number, load: string, side: string, shaftClass: string, shaftRange: string, housingClass: string, housingRange: string) =>
      [`Shaft Ø${d} mm, ${load} load, ${side} side`, `Shaft: ${shaftClass} → ${shaftRange} mm`, `Housing: ${housingClass} → ${housingRange} mm`].join("\n"),
  },
};

export function BearingFitsCalc() {
  const { locale } = useLocale();
  const t = T[locale];
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
  const loadLabel = (l: { label: string; labelEn: string }) => (locale === "nl" ? l.label : l.labelEn);
  const sideLabel = (s: { label: string; labelEn: string }) => (locale === "nl" ? s.label : s.labelEn);

  const copy = useMemo(() => {
    if (!shaftClass || !shaftFit || !housingFit) return "";
    const loadObj = LOAD_CLASSES.find((l) => l.id === load);
    const sideObj = BEARING_SIDES.find((s) => s.id === side);
    return t.copy(d, loadObj ? loadLabel(loadObj) : load, sideObj ? sideLabel(sideObj) : side, shaftClass, shaftFit.range, housingClass, housingFit.range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shaftClass, shaftFit, housingFit, d, load, side, housingClass, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{t.heading}</h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={t.diameter}>
            <WholeMmInput id="bearing-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label={t.load}>
            <SelectInput value={load} onChange={(v) => setLoad(v as LoadClass)}>
              {LOAD_CLASSES.map((l) => (
                <option key={l.id} value={l.id}>
                  {loadLabel(l)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.position}>
            <SelectInput value={side} onChange={(v) => setSide(v as BearingSide)}>
              {BEARING_SIDES.map((s) => (
                <option key={s.id} value={s.id}>
                  {sideLabel(s)}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">{t.fillDiameter}</p>
        ) : !shaftFit || !housingFit ? (
          <p className="mt-5 text-sm text-muted">{t.noData(d)}</p>
        ) : (
          <>
            <ResultGrid
              items={[
                { label: `${t.shaft} — ${shaftClass}`, value: `${shaftFit.range} mm` },
                { label: `${t.housing} — ${housingClass}`, value: `${housingFit.range} mm` },
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
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t.guideTitle}</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thLoad}</th>
                <th>{t.thShaftClass}</th>
                <th>{t.thHousingFixed}</th>
                <th>{t.thHousingFloating}</th>
              </tr>
            </thead>
            <tbody>
              {LOAD_CLASSES.map((l) => (
                <tr key={l.id} className={l.id === load ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {loadLabel(l)}
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
                  <th>{t.thShaftClass}</th>
                  <th>{t.thBounds}</th>
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
                  <th>{t.thHousingClass}</th>
                  <th>{t.thBounds}</th>
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
        <SourceBadge>{t.sourceBadge}</SourceBadge>
      </section>
    </>
  );
}
