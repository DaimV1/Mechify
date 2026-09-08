import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BANDS,
  FITS,
  HOLE_FIELDS,
  SHAFT_FIELDS,
  bandIndex,
  clearanceRange,
  computeFit,
  fitExtendable,
  holeDeviationAt,
  holeExtendable,
  isExtendedBand,
  pairRange,
  shaftDeviationAt,
  shaftExtendable,
} from "@/lib/calculators/iso286";
import { useLocale } from "@/lib/i18n/locale-context";
import { readStoredDiameter, storeDiameter } from "@/lib/tools";
import { mmFromUm } from "@/lib/utils";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  KindDot,
  Note,
  parseWholeMm,
  ResultGrid,
  SelectInput,
  SourceLink,
  WholeMmInput,
} from "@/components/calculators/calc-ui";

const T = {
  nl: {
    heading: "Nominale passing",
    intro: (
      <>
        Nominale Ø in hele millimeters, boven 0 t/m 3150 mm (de volledige ISO 286-reeks). H/h,
        JS/js, G/g, F/f en D/d zijn berekend uit de ISO 286-1-formules en gelden over de hele reeks.
        c11, k6, n6, p6 en s6 hebben geen eenvoudige formule en blijven beperkt tot t/m 50 mm — zie
        hieronder. In de kleinste band (&gt;0–≤3 mm) zijn alleen H6–H11, JS7, h6, h7 en p6
        geverifieerd; de overige klassen tonen daar "—" (nog geen bron gecontroleerd) in plaats van
        een gok.
      </>
    ),
    diameterLabel: "Nominale Ø (mm)",
    fitLabel: "Passing",
    upTo50: " (t/m 50 mm)",
    fillDiameter: "Vul een nominale Ø in.",
    noFormula: (fitId: string, d: number, bandLabel: string) => (
      <>
        {fitId} heeft geen formule voor c, k, n, p of s en is alleen beschikbaar t/m 50 mm. Ø {d} mm
        valt in band {bandLabel} mm. Kies H7/h6, H7/g6, H8/f7 of H9/d9 voor de volledige reeks, of
        blijf onder 50 mm.
      </>
    ),
    noBand: (fitId: string, d: number) => (
      <>
        Geen ISO-band voor Ø {d} mm, of {fitId} heeft nog geen geverifieerde waarde in die band (zie
        de kleinste band hierboven). Tabellen: boven 0 t/m 3150 mm.
      </>
    ),
    band: "band",
    hole: "Gat",
    shaft: "As",
    clearanceMinMax: "Speling min … max",
    extendedNote:
      "Boven 50 mm: de IT-breedte komt uit de ISO 286-1-tabel (exact), de fundamentele afwijking van G/F/D en g/f/d uit de formule — boven Ø400 kan die 1 µm van de tabelwaarde verschillen.",
    copyLine: (d: number, fitId: string, bandLabel: string) =>
      `Ø ${d} mm · ${fitId} · band ${bandLabel} mm`,
    sec1Title: "1. Voorkeurpassingen",
    sec1Note:
      "Minimum … maximum speling in mm. Negatief = overmaat. H7/p6 tot 18 mm: max. 0 µm (lijnpassing mogelijk).",
    thDiameter: "Ø (mm)",
    onlyTo50: "* alleen t/m 50 mm (geen formule voor c, k, n, p of s).",
    whenWhichFit: "Wanneer welke passing",
    sec2Title: "2. Gattoleranties",
    sec2Note: "Bovenmaat / ondermaat t.o.v. nominaal, in mm. JS7 = ±IT7/2, niet afgerond.",
    sec2Footnote:
      'H6–H11, F8, G7 en JS7 zijn berekend uit de ISO 286-1-formules boven 50 mm. * K7 en N7 hebben geen formule en blijven t/m 50 mm. In de >0–≤3 mm-band tonen F8, G7, K7 en N7 "—": niet gegokt, nog niet tegen een primaire bron gecontroleerd.',
    sec3Title: "3. Astoleranties",
    sec3Note: "Bovenmaat / ondermaat t.o.v. nominaal, in mm.",
    sec3Footnote:
      "Diameters: boven de ondergrens tot en met de bovengrens. JS7 is ±IT7/2 volgens ISO 286-2, zonder afronding naar hele µm. d9, f7, g6, h6 en h7 zijn berekend uit de ISO 286-1-formules boven 50 mm. * c11, k6, n6, p6 en s6 hebben geen formule en blijven t/m 50 mm. Naslag, geen vervanging van de norm.",
    sourceHole: "RoyMech ISO 286-2 hole tolerances",
    sourceShaft: "RoyMech ISO 286-2 shaft tolerances",
    sourceMain: "RoyMech ISO 286-2",
  },
  en: {
    heading: "Nominal fit",
    intro: (
      <>
        Nominal Ø in whole millimeters, above 0 up to 3150 mm (the full ISO 286 range). H/h, JS/js,
        G/g, F/f and D/d are computed from the ISO 286-1 formulas and apply across the whole range.
        c11, k6, n6, p6 and s6 have no simple formula and stay limited to 50 mm and below — see
        below. In the smallest band (&gt;0–≤3 mm) only H6–H11, JS7, h6, h7 and p6 are verified; the
        other classes show "—" there (not yet checked against a source) instead of a guess.
      </>
    ),
    diameterLabel: "Nominal Ø (mm)",
    fitLabel: "Fit",
    upTo50: " (up to 50 mm)",
    fillDiameter: "Enter a nominal Ø.",
    noFormula: (fitId: string, d: number, bandLabel: string) => (
      <>
        {fitId} has no formula for c, k, n, p or s and is only available up to 50 mm. Ø {d} mm falls
        in band {bandLabel} mm. Choose H7/h6, H7/g6, H8/f7 or H9/d9 for the full range, or stay
        under 50 mm.
      </>
    ),
    noBand: (fitId: string, d: number) => (
      <>
        No ISO band for Ø {d} mm, or {fitId} has no verified value yet in that band (see the
        smallest band above). Tables: above 0 up to 3150 mm.
      </>
    ),
    band: "band",
    hole: "Hole",
    shaft: "Shaft",
    clearanceMinMax: "Clearance min … max",
    extendedNote:
      "Above 50 mm: the IT width comes from the ISO 286-1 table (exact), the fundamental deviation of G/F/D and g/f/d from the formula — above Ø400 it can differ by 1 µm from the table value.",
    copyLine: (d: number, fitId: string, bandLabel: string) =>
      `Ø ${d} mm · ${fitId} · band ${bandLabel} mm`,
    sec1Title: "1. Preferred fits",
    sec1Note:
      "Minimum … maximum clearance in mm. Negative = interference. H7/p6 up to 18 mm: max. 0 µm (line fit possible).",
    thDiameter: "Ø (mm)",
    onlyTo50: "* only up to 50 mm (no formula for c, k, n, p or s).",
    whenWhichFit: "Which fit, when",
    sec2Title: "2. Hole tolerances",
    sec2Note: "Upper / lower deviation from nominal, in mm. JS7 = ±IT7/2, not rounded.",
    sec2Footnote:
      'H6–H11, F8, G7 and JS7 are computed from the ISO 286-1 formulas above 50 mm. * K7 and N7 have no formula and stay limited to 50 mm. In the >0–≤3 mm band, F8, G7, K7 and N7 show "—": not guessed, not yet checked against a primary source.',
    sec3Title: "3. Shaft tolerances",
    sec3Note: "Upper / lower deviation from nominal, in mm.",
    sec3Footnote:
      "Diameters: above the lower bound up to and including the upper bound. JS7 is ±IT7/2 per ISO 286-2, not rounded to whole µm. d9, f7, g6, h6 and h7 are computed from the ISO 286-1 formulas above 50 mm. * c11, k6, n6, p6 and s6 have no formula and stay limited to 50 mm. Reference only, not a substitute for the standard.",
    sourceHole: "RoyMech ISO 286-2 hole tolerances",
    sourceShaft: "RoyMech ISO 286-2 shaft tolerances",
    sourceMain: "RoyMech ISO 286-2",
  },
};

export function FitTolerancesCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [diameter, setDiameter] = useState(
    () => search.get("d") ?? readStoredDiameter({ min: 4, max: 3150 }),
  );
  const [fitId, setFitId] = useState(() => {
    const fromUrl = search.get("fit");
    return fromUrl && FITS.some((f) => f.id === fromUrl) ? fromUrl : "H7/h6";
  });

  useEffect(() => {
    const next = new URLSearchParams(search);
    if (diameter) next.set("d", diameter);
    else next.delete("d");
    next.set("fit", fitId);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diameter, fitId]);

  function onDia(v: string) {
    setDiameter(v);
    const parsed = parseWholeMm(v);
    if (parsed.status === "ok") storeDiameter(String(parsed.mm));
  }

  const bandLabel = (band: (typeof BANDS)[number]) => (locale === "nl" ? band.label : band.labelEn);
  const fitUse = (f: (typeof FITS)[number]) => (locale === "nl" ? f.use : f.useEn);
  const kindText = (kind: { text: string; textEn: string }) =>
    locale === "nl" ? kind.text : kind.textEn;

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const result = parsed.status === "ok" ? computeFit(d, fitId) : null;
  const activeBand = parsed.status === "ok" ? bandIndex(d) : -1;
  const activeBandExtended = activeBand >= 0 && isExtendedBand(activeBand);
  const fitOutOfBandRange =
    parsed.status === "ok" && activeBand >= 0 && activeBandExtended && !fitExtendable(fitId);

  const copy = useMemo(() => {
    if (!result) return "";
    return [
      t.copyLine(d, result.fit.id, bandLabel(result.band)),
      `${t.hole} ${result.fit.hole}  ${mmFromUm(result.ES)} / ${mmFromUm(result.EI)} mm`,
      `${t.shaft} ${result.fit.shaft}  ${mmFromUm(result.es)} / ${mmFromUm(result.ei)} mm`,
      `${t.clearanceMinMax}  ${mmFromUm(result.minC)} … ${mmFromUm(result.maxC)} mm`,
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, result, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.diameterLabel}>
            <WholeMmInput id="fit-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label={t.fitLabel}>
            <SelectInput id="fit-select" value={fitId} onChange={setFitId}>
              {FITS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id}
                  {fitExtendable(f.id) ? "" : t.upTo50}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">{t.fillDiameter}</p>
        ) : fitOutOfBandRange ? (
          <p className="mt-5 text-sm text-muted">
            {t.noFormula(fitId, d, BANDS[activeBand] ? bandLabel(BANDS[activeBand]) : "")}
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">{t.noBand(fitId, d)}</p>
        ) : (
          <>
            <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
              Ø {d} mm · {t.band} {bandLabel(result.band)} mm · <KindDot kind={result.kind.kind} />
              <span className="text-ink">{kindText(result.kind)}</span>
            </p>
            <ResultGrid
              items={[
                {
                  label: `${t.hole} ${result.fit.hole}`,
                  value: `${mmFromUm(result.ES)} / ${mmFromUm(result.EI)} mm`,
                },
                {
                  label: (
                    <>
                      {t.shaft} <span className="normal-case">{result.fit.shaft}</span>
                    </>
                  ),
                  value: `${mmFromUm(result.es)} / ${mmFromUm(result.ei)} mm`,
                },
                {
                  label: t.clearanceMinMax,
                  value: `${clearanceRange(result.minC, result.maxC)} mm`,
                },
              ]}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">{fitUse(result.fit)}</p>
            {activeBandExtended ? <Note>{t.extendedNote}</Note> : null}
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.sec1Title}
        </h2>
        <Note>{t.sec1Note}</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thDiameter}</th>
                {FITS.map((f) => (
                  <th key={f.id} className="normal-case">
                    {f.id}
                    {fitExtendable(f.id) ? "" : " *"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band, i) => (
                <tr key={band.label} className={i === activeBand ? "is-active" : ""}>
                  <th scope="row">{bandLabel(band)}</th>
                  {FITS.map((f) => {
                    const r = computeFit(band.to, f.id);
                    return <td key={f.id}>{r ? clearanceRange(r.minC, r.maxC) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.roymech.co.uk/Useful_Tables/ISO_Tolerances/ISO_286_2H.html">
          {t.sourceMain}
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">{t.onlyTo50}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.whenWhichFit}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FITS.map((f) => {
            const live = parsed.status === "ok" ? computeFit(d, f.id) : null;
            const kind = live?.kind.kind ?? f.kind;
            return (
              <article key={f.id} className="rounded-lg border border-border bg-surface p-4">
                <p className="flex items-center gap-2 font-mono text-sm text-ink">
                  <KindDot kind={kind} />
                  {f.id}
                  {live ? (
                    <span className="font-sans text-muted">· {kindText(live.kind)}</span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{fitUse(f)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.sec2Title}
        </h2>
        <Note>{t.sec2Note}</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thDiameter}</th>
                {HOLE_FIELDS.map((k) => (
                  <th key={k}>
                    {k}
                    {holeExtendable(k) ? "" : " *"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band, i) => (
                <tr key={band.label} className={i === activeBand ? "is-active" : ""}>
                  <th scope="row">{bandLabel(band)}</th>
                  {HOLE_FIELDS.map((k) => {
                    const dev = holeDeviationAt(k, i);
                    return <td key={k}>{dev ? pairRange(dev.ES, dev.EI) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.roymech.co.uk/Useful_Tables/ISO_Tolerances/ISO_286_2H.html">
          {t.sourceHole}
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">{t.sec2Footnote}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.sec3Title}
        </h2>
        <Note>{t.sec3Note}</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thDiameter}</th>
                {SHAFT_FIELDS.map((k) => (
                  <th key={k} className="normal-case">
                    {k}
                    {shaftExtendable(k) ? "" : " *"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band, i) => (
                <tr key={band.label} className={i === activeBand ? "is-active" : ""}>
                  <th scope="row">{bandLabel(band)}</th>
                  {SHAFT_FIELDS.map((k) => {
                    const dev = shaftDeviationAt(k, i);
                    return <td key={k}>{dev ? pairRange(dev.es, dev.ei) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.roymech.co.uk/Useful_Tables/ISO_Tolerances/ISO_286_2s.html">
          {t.sourceShaft}
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">{t.sec3Footnote}</p>
      </section>
    </>
  );
}
