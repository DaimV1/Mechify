import { BearingFitChart, SchemaPanel } from "@/components/toolkit/schema";
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
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";

const BEARING_META: EngineeringSourceMeta = {
  basisType: "catalogue",
  reference:
    "Simplified guideline from published bearing-manufacturer selection criteria (SKF-style) · ISO 286 deviations",
  status: "vendor-current",
  checkedDate: "2026-09-17",
  validityRange: {
    nl: "Groefkogellagers, cilindrische boring, Ø ≤ 50 mm",
    en: "Deep-groove ball bearings, cylindrical bore, Ø ≤ 50 mm",
  },
  assumptions: {
    nl: "Roterende binnenring / stilstaande buitenring met puntbelasting. Houdt geen rekening met asmateriaal, warmteontwikkeling of een meeroterende buitenring — raadpleeg de volledige selectietabel van de lagerfabrikant voor die gevallen.",
    en: "Rotating inner ring / stationary outer ring with point load. Does not account for shaft material, heat build-up, or a co-rotating outer ring — consult the bearing manufacturer's full selection table for those cases.",
  },
};

const T = {
  nl: {
    heading: "Lagerpassing bij as-Ø en lager-buitendiameter",
    intro:
      "Groefkogellagers, cilindrische boring, tot Ø50 mm. Uitgangspunt: roterende binnenring, stilstaande buitenring met puntbelasting — het gangbare geval. As-Ø en lager-buitendiameter (D) zijn twee verschillende maten: de behuizingspassing wordt bepaald door D, niet door de as-Ø. Zoek D op in de lagercatalogus (bijv. 6204: d=20 mm, D=47 mm). Algemene richtlijn; de volledige selectietabel van de lagerfabrikant houdt ook rekening met asmateriaal, warmteontwikkeling en meeroterende buitenring.",
    diameter: "As-Ø / lagerboring d (mm)",
    housingDiameter: "Lager-buitendiameter D (mm)",
    housingDiameterHint: "Niet de as-Ø — de buitendiameter van het gekozen lager (lagercatalogus).",
    load: "Belasting",
    position: "Lagerpositie",
    fillDiameter: "Vul een as-Ø en lager-buitendiameter D in.",
    noData: (d: number) => `Geen gegevens voor Ø${d} mm — het bereik is 0 t/m 50 mm.`,
    noDataHousing: (D: number) =>
      `Geen behuizingsgegevens voor D=${D} mm — het bereik is 0 t/m 50 mm. Vul de werkelijke lager-buitendiameter in.`,
    shaft: "As",
    housing: "Behuizing (D)",
    guideTitle: "Selectiegids (vereenvoudigd)",
    thLoad: "Belasting",
    thShaftClass: "As-klasse",
    thHousingFixed: "Behuizing — vast",
    thHousingFloating: "Behuizing — los",
    thBounds: "Bovenmaat / ondermaat",
    thHousingClass: "Behuizing-klasse",
    sourceBadge:
      "Vereenvoudigde richtlijn op basis van de algemene selectiecriteria die lagerfabrikanten (o.a. SKF) publiceren. Numerieke afwijkingen via de ISO 286-tabellen van de passingen-tool. Raadpleeg de lagercatalogus voor de volledige selectietabel.",
    copy: (
      d: number,
      housingD: number,
      load: string,
      side: string,
      shaftClass: string,
      shaftRange: string,
      housingClass: string,
      housingRange: string,
    ) =>
      [
        `As Ø${d} mm, lager-buitendiameter D=${housingD} mm, ${load} belasting, ${side} zijde`,
        `As: ${shaftClass} → ${shaftRange} mm`,
        `Behuizing (D=${housingD} mm): ${housingClass} → ${housingRange} mm`,
      ].join("\n"),
  },
  en: {
    heading: "Bearing fit at shaft Ø and bearing outside diameter",
    intro:
      "Deep groove ball bearings, cylindrical bore, up to Ø50 mm. Assumption: rotating inner ring, stationary outer ring with point load — the common case. Shaft Ø and bearing outside diameter (D) are two different dimensions: the housing fit is determined by D, not by the shaft Ø. Look up D in the bearing catalog (e.g. 6204: d=20 mm, D=47 mm). General guideline; the bearing manufacturer's full selection table also accounts for shaft material, heat build-up and a co-rotating outer ring.",
    diameter: "Shaft Ø / bearing bore d (mm)",
    housingDiameter: "Bearing outside diameter D (mm)",
    housingDiameterHint:
      "Not the shaft Ø — the outside diameter of the selected bearing (bearing catalog).",
    load: "Load",
    position: "Bearing position",
    fillDiameter: "Enter a shaft Ø and a bearing outside diameter D.",
    noData: (d: number) => `No data for Ø${d} mm — the range is 0 to 50 mm.`,
    noDataHousing: (D: number) =>
      `No housing data for D=${D} mm — the range is 0 to 50 mm. Enter the bearing's actual outside diameter.`,
    shaft: "Shaft",
    housing: "Housing (D)",
    guideTitle: "Selection guide (simplified)",
    thLoad: "Load",
    thShaftClass: "Shaft class",
    thHousingFixed: "Housing — fixed",
    thHousingFloating: "Housing — floating",
    thBounds: "Upper / lower deviation",
    thHousingClass: "Housing class",
    sourceBadge:
      "Simplified guideline based on the general selection criteria published by bearing manufacturers (SKF, among others). Numeric deviations via the fits tool's ISO 286 tables. Consult the bearing catalog for the full selection table.",
    copy: (
      d: number,
      housingD: number,
      load: string,
      side: string,
      shaftClass: string,
      shaftRange: string,
      housingClass: string,
      housingRange: string,
    ) =>
      [
        `Shaft Ø${d} mm, bearing outside diameter D=${housingD} mm, ${load} load, ${side} side`,
        `Shaft: ${shaftClass} → ${shaftRange} mm`,
        `Housing (D=${housingD} mm): ${housingClass} → ${housingRange} mm`,
      ].join("\n"),
  },
};

export function BearingFitsCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [diameter, setDiameter] = useState(
    () => search.get("d") ?? readStoredDiameter({ min: 1, max: 50 }),
  );
  const [housingDiameter, setHousingDiameter] = useState(() => search.get("D") ?? "");
  const [load, setLoad] = useState<LoadClass>((search.get("load") as LoadClass) ?? "normaal");
  const [side, setSide] = useState<BearingSide>((search.get("side") as BearingSide) ?? "vast");

  useEffect(() => {
    const next = new URLSearchParams(search);
    if (diameter) next.set("d", diameter);
    else next.delete("d");
    if (housingDiameter) next.set("D", housingDiameter);
    else next.delete("D");
    next.set("load", load);
    next.set("side", side);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diameter, housingDiameter, load, side]);

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const parsedHousing = parseWholeMm(housingDiameter);
  const D = parsedHousing.status === "ok" ? parsedHousing.mm : Number.NaN;

  const shaftClass = Number.isFinite(d) ? shaftClassFor(load, d) : null;
  const housingClass = housingClassFor(load, side);
  const shaftFit = shaftClass && Number.isFinite(d) ? shaftFitAt(d, shaftClass) : null;
  const housingFit = Number.isFinite(D) ? housingFitAt(D, housingClass) : null;
  const loadLabel = (l: { label: string; labelEn: string }) =>
    locale === "nl" ? l.label : l.labelEn;
  const sideLabel = (s: { label: string; labelEn: string }) =>
    locale === "nl" ? s.label : s.labelEn;

  const copy = useMemo(() => {
    if (!shaftClass || !shaftFit || !housingFit) return "";
    const loadObj = LOAD_CLASSES.find((l) => l.id === load);
    const sideObj = BEARING_SIDES.find((s) => s.id === side);
    return [
      t.copy(
        d,
        D,
        loadObj ? loadLabel(loadObj) : load,
        sideObj ? sideLabel(sideObj) : side,
        shaftClass,
        shaftFit.range,
        housingClass,
        housingFit.range,
      ),
      metaCopyLine(BEARING_META, locale),
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shaftClass, shaftFit, housingFit, d, D, load, side, housingClass, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <SourceMetaBadge meta={BEARING_META} />
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Field label={t.diameter}>
            <WholeMmInput id="bearing-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label={t.housingDiameter}>
            <WholeMmInput
              id="bearing-housing-diameter"
              value={housingDiameter}
              onChange={setHousingDiameter}
            />
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
        <p className="mt-2 text-xs text-subtle">{t.housingDiameterHint}</p>

        {parsed.status === "empty" || parsedHousing.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">{t.fillDiameter}</p>
        ) : !shaftFit ? (
          <p className="mt-5 text-sm text-muted">{t.noData(d)}</p>
        ) : !housingFit ? (
          <p className="mt-5 text-sm text-muted">{t.noDataHousing(D)}</p>
        ) : (
          <>
            <ResultGrid
              items={[
                {
                  label: (
                    <>
                      {t.shaft} — <span className="normal-case">{shaftClass}</span>
                    </>
                  ),
                  value: `${shaftFit.range} mm`,
                },
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
      <SchemaPanel caption="Technisch schema · maten in mm · schematisch, niet op schaal">
        <BearingFitChart bandIndex={0} shaft={shaftClass ?? undefined} hole={housingClass} />
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.guideTitle}
        </h2>
        <div className="table-scroll mt-4" tabIndex={0}>
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
          <div className="table-scroll" tabIndex={0}>
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
          <div className="table-scroll" tabIndex={0}>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>{t.thHousingClass}</th>
                  <th>{t.thBounds}</th>
                </tr>
              </thead>
              <tbody>
                {HOUSING_BEARING_CLASSES.map((c) => {
                  const fit = Number.isFinite(D) ? housingFitAt(D, c) : null;
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
