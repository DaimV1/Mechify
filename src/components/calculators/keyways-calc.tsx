import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { KEYWAYS, keyWidthTol, lookupKeyway, WIDTH_FITS } from "@/lib/calculators/keyway";
import { readStoredDiameter, storeDiameter } from "@/lib/tools";
import { fmtMm, mmFromUm } from "@/lib/utils";
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
  SourceLink,
  WholeMmInput,
} from "@/components/calculators/calc-ui";

const rangeLabel = (over: number, to: number) => `boven ${over} t/m ${to}`;
const rangeLabelDisplay = (over: number, to: number) => `>${over} – ≤${to}`;

export function KeywaysCalc() {
  const [search, setSearch] = useSearchParams();
  const [diameter, setDiameter] = useState(() => search.get("d") ?? readStoredDiameter({ min: 7, max: 110 }));

  useEffect(() => {
    const next = new URLSearchParams(search);
    if (diameter) next.set("d", diameter);
    else next.delete("d");
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diameter]);

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const row = parsed.status === "ok" ? lookupKeyway(d) : null;
  const activeLabel = row ? rangeLabel(row.over, row.to) : "";

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const copy = useMemo(() => {
    if (!row) return "";
    return [
      `As Ø ${d} mm · ${rangeLabelDisplay(row.over, row.to)}`,
      `Spie ${row.b} × ${row.h} mm`,
      `t₁ as  ${fmtMm(row.t1)} mm`,
      `t₂ naaf  ${fmtMm(row.t2)} mm`,
      `Dieptetol.  0 / +${fmtMm(row.depthTol)} mm`,
    ].join("\n");
  }, [d, row]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Spie bij as-Ø</h2>
        <Note>
          As-Ø in hele mm. DIN 6885-1: boven de ondergrens tot en met de bovengrens. De eerste rij is boven 6 t/m
          8 — Ø 6 mm valt erbuiten.
        </Note>
        <div className="mt-6 max-w-xs">
          <Field label="As-Ø (mm)">
            <WholeMmInput id="key-diameter" value={diameter} onChange={onDia} />
          </Field>
        </div>
        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">Vul een as-Ø in.</p>
        ) : !row ? (
          <p className="mt-5 text-sm text-muted">
            Geen rij in DIN 6885-1 voor Ø {d} mm. De tabel begint boven 6 mm tot en met 110 mm.
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              As Ø {d} mm · {rangeLabelDisplay(row.over, row.to)}
            </p>
            <ResultGrid
              items={[
                { label: "Spie b × h", value: `${row.b} × ${row.h} mm` },
                { label: "t₁ as", value: `${fmtMm(row.t1)} mm` },
                { label: "t₂ naaf", value: `${fmtMm(row.t2)} mm` },
                { label: "Dieptetolerantie", value: `0 / +${fmtMm(row.depthTol)} mm` },
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
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Spie en groefdiepte (DIN 6885-1)</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>As Ø d (mm)</th>
                <th>Spie b × h</th>
                <th>t₁ as</th>
                <th>t₂ naaf</th>
                <th>Tol. diepte</th>
              </tr>
            </thead>
            <tbody>
              {KEYWAYS.map((k) => {
                const key = rangeLabel(k.over, k.to);
                return (
                  <tr key={key} className={key === activeLabel ? "is-active" : ""}>
                    <th scope="row">{rangeLabelDisplay(k.over, k.to)}</th>
                    <td>
                      {k.b} × {k.h}
                    </td>
                    <td>{fmtMm(k.t1)}</td>
                    <td>{fmtMm(k.t2)}</td>
                    <td>0 / +{fmtMm(k.depthTol)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.elesa-ganter.com/static/technicaldata/files/DIN6885_Keyways_EN.pdf">
          Elesa+Ganter — DIN 6885 keyways
        </SourceLink>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Breedtetolerantie b</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-border bg-surface p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="vast" /> P9 / P9 — vast
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Standaard. As en naaf beide P9. Spie zit strak; geschikt voor wisselende belasting.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-surface p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="overgang" /> N9 / JS9 — licht
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              As N9, naaf JS9. Makkelijker monteren. Alleen als de toepassing dat toelaat.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-surface p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="los" /> H9 / D10 — glijdend
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Werkplaats-/UNI-conventie voor verschuifbare naven. DIN 6885-1:2021 noemt P9 sluitend en N9/JS9 vrij.
            </p>
          </article>
        </div>

        {row ? (
          <div className="table-scroll mt-6">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Klasse</th>
                  <th>Bovenmaat / ondermaat</th>
                </tr>
              </thead>
              <tbody>
                {WIDTH_FITS.map((fit) => {
                  const t = keyWidthTol(row.b, fit);
                  return (
                    <tr key={fit}>
                      <th scope="row" className="normal-case">
                        {fit}
                      </th>
                      <td>{t ? `${mmFromUm(t.ES)} / ${mmFromUm(t.EI)} mm` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-subtle">Voor b = {row.b} mm (Ø {d} mm). Spleet = gatbasis, per ISO 286-2.</p>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">Vul een as-Ø in bovenaan de pagina voor de numerieke boven-/ondermaat van b.</p>
        )}

        <SourceLink href="https://www.elesa-ganter.com/static/technicaldata/files/DIN6885_Keyways_EN.pdf">
          Elesa+Ganter — DIN 6885 keyways
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">
          (hoge vorm). DIN 6885-2 is de lage vorm. H9/D10 is werkplaats-/UNI-conventie, niet de benoemde
          glijdpassing in DIN 6885-1:2021. Controleer kritieke maten in de actuele norm.
        </p>
      </section>
    </>
  );
}
