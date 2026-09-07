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

export function FitTolerancesCalc() {
  const [search, setSearch] = useSearchParams();
  const [diameter, setDiameter] = useState(() => search.get("d") ?? readStoredDiameter({ min: 4, max: 3150 }));
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

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const result = parsed.status === "ok" ? computeFit(d, fitId) : null;
  const activeBand = parsed.status === "ok" ? bandIndex(d) : -1;
  const activeBandExtended = activeBand >= 0 && isExtendedBand(activeBand);
  const fitOutOfBandRange = parsed.status === "ok" && activeBand >= 0 && activeBandExtended && !fitExtendable(fitId);

  const copy = useMemo(() => {
    if (!result) return "";
    return [
      `Ø ${d} mm · ${result.fit.id} · band ${result.band.label} mm`,
      `Gat ${result.fit.hole}  ${mmFromUm(result.ES)} / ${mmFromUm(result.EI)} mm`,
      `As ${result.fit.shaft}  ${mmFromUm(result.es)} / ${mmFromUm(result.ei)} mm`,
      `Speling  ${mmFromUm(result.minC)} … ${mmFromUm(result.maxC)} mm`,
    ].join("\n");
  }, [d, result]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Nominale passing</h2>
        <Note>
          Nominale Ø in hele millimeters, boven 0 t/m 3150 mm (de volledige ISO 286-reeks). H/h, JS/js, G/g, F/f en
          D/d zijn berekend uit de ISO 286-1-formules en gelden over de hele reeks. c11, k6, n6, p6 en s6 hebben
          geen eenvoudige formule en blijven beperkt tot t/m 50 mm — zie hieronder. In de kleinste band (&gt;0–≤3
          mm) zijn alleen H6–H11, JS7, h6, h7 en p6 geverifieerd; de overige klassen tonen daar "—" (nog geen bron
          gecontroleerd) in plaats van een gok.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nominale Ø (mm)">
            <WholeMmInput id="fit-diameter" value={diameter} onChange={onDia} />
          </Field>
          <Field label="Passing">
            <SelectInput id="fit-select" value={fitId} onChange={setFitId}>
              {FITS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id}
                  {fitExtendable(f.id) ? "" : " (t/m 50 mm)"}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">Vul een nominale Ø in.</p>
        ) : fitOutOfBandRange ? (
          <p className="mt-5 text-sm text-muted">
            {fitId} heeft geen formule voor c, k, n, p of s en is alleen beschikbaar t/m 50 mm. Ø {d} mm valt in
            band {BANDS[activeBand].label} mm. Kies H7/h6, H7/g6, H8/f7 of H9/d9 voor de volledige reeks, of blijf
            onder 50 mm.
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            Geen ISO-band voor Ø {d} mm, of {fitId} heeft nog geen geverifieerde waarde in die band (zie de
            kleinste band hierboven). Tabellen: boven 0 t/m 3150 mm.
          </p>
        ) : (
          <>
            <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
              Ø {d} mm · band {result.band.label} mm · <KindDot kind={result.kind.kind} />
              <span className="text-ink">{result.kind.text}</span>
            </p>
            <ResultGrid
              items={[
                { label: `Gat ${result.fit.hole}`, value: `${mmFromUm(result.ES)} / ${mmFromUm(result.EI)} mm` },
                {
                  label: (
                    <>
                      As <span className="normal-case">{result.fit.shaft}</span>
                    </>
                  ),
                  value: `${mmFromUm(result.es)} / ${mmFromUm(result.ei)} mm`,
                },
                { label: "Speling min … max", value: `${clearanceRange(result.minC, result.maxC)} mm` },
              ]}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">{result.fit.use}</p>
            {activeBandExtended ? (
              <Note>
                Boven 50 mm: de IT-breedte komt uit de ISO 286-1-tabel (exact), de fundamentele afwijking van
                G/F/D en g/f/d uit de formule — boven Ø400 kan die 1 µm van de tabelwaarde verschillen.
              </Note>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">1. Voorkeurpassingen</h2>
        <Note>
          Minimum … maximum speling in mm. Negatief = overmaat. H7/p6 tot 18 mm: max. 0 µm (lijnpassing mogelijk).
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Ø (mm)</th>
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
                  <th scope="row">{band.label}</th>
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
          RoyMech ISO 286-2
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">* alleen t/m 50 mm (geen formule voor c, k, n, p of s).</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Wanneer welke passing</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FITS.map((f) => {
            const live = parsed.status === "ok" ? computeFit(d, f.id) : null;
            const kind = live?.kind.kind ?? f.kind;
            return (
              <article key={f.id} className="rounded-lg border border-border bg-surface p-4">
                <p className="flex items-center gap-2 font-mono text-sm text-ink">
                  <KindDot kind={kind} />
                  {f.id}
                  {live ? <span className="font-sans text-muted">· {live.kind.text}</span> : null}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.use}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">2. Gattoleranties</h2>
        <Note>Bovenmaat / ondermaat t.o.v. nominaal, in mm. JS7 = ±IT7/2, niet afgerond.</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Ø (mm)</th>
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
                  <th scope="row">{band.label}</th>
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
          RoyMech ISO 286-2 hole tolerances
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">
          H6–H11, F8, G7 en JS7 zijn berekend uit de ISO 286-1-formules boven 50 mm. * K7 en N7 hebben geen formule
          en blijven t/m 50 mm. In de &gt;0–≤3 mm-band tonen F8, G7, K7 en N7 "—": niet gegokt, nog niet tegen een
          primaire bron gecontroleerd.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">3. Astoleranties</h2>
        <Note>Bovenmaat / ondermaat t.o.v. nominaal, in mm.</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Ø (mm)</th>
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
                  <th scope="row">{band.label}</th>
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
          RoyMech ISO 286-2 shaft tolerances
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">
          Diameters: boven de ondergrens tot en met de bovengrens. JS7 is ±IT7/2 volgens ISO 286-2, zonder afronding
          naar hele µm. d9, f7, g6, h6 en h7 zijn berekend uit de ISO 286-1-formules boven 50 mm. * c11, k6, n6, p6
          en s6 hebben geen formule en blijven t/m 50 mm. Naslag, geen vervanging van de norm.
        </p>
      </section>
    </>
  );
}
