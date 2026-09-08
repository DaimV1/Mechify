import { KeywaySection, SchemaPanel } from "@/components/toolkit/schema";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { KEYWAYS, keyWidthTol, lookupKeyway, WIDTH_FITS } from "@/lib/calculators/keyway";
import { useLocale } from "@/lib/i18n/locale-context";
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

const rangeLabelNl = (over: number, to: number) => `boven ${over} t/m ${to}`;
const rangeLabelEn = (over: number, to: number) => `above ${over} up to ${to}`;
const rangeLabelDisplay = (over: number, to: number) => `>${over} – ≤${to}`;

const T = {
  nl: {
    heading: "Spie bij as-Ø",
    intro:
      "As-Ø in hele mm. DIN 6885-1: boven de ondergrens tot en met de bovengrens. De eerste rij is boven 6 t/m 8 — Ø 6 mm valt erbuiten.",
    diameterLabel: "As-Ø (mm)",
    fillDiameter: "Vul een as-Ø in.",
    noRow: (d: number) =>
      `Geen rij in DIN 6885-1 voor Ø ${d} mm. De tabel begint boven 6 mm tot en met 110 mm.`,
    shaftAt: (d: number, range: string) => `As Ø ${d} mm · ${range}`,
    keyBH: "Spie b × h",
    t1: "t₁ as",
    t2: "t₂ naaf",
    depthTol: "Dieptetolerantie",
    tableTitle: "Spie en groefdiepte (DIN 6885-1)",
    thShaft: "As Ø d (mm)",
    thKey: "Spie b × h",
    thT1: "t₁ as",
    thT2: "t₂ naaf",
    thTol: "Tol. diepte",
    source: "Elesa+Ganter — DIN 6885 keyways",
    widthTolTitle: "Breedtetolerantie b",
    p9Title: "P9 / P9 — vast",
    p9Body: "Standaard. As en naaf beide P9. Spie zit strak; geschikt voor wisselende belasting.",
    n9Title: "N9 / JS9 — licht",
    n9Body: "As N9, naaf JS9. Makkelijker monteren. Alleen als de toepassing dat toelaat.",
    h9Title: "H9 / D10 — glijdend",
    h9Body:
      "Werkplaats-/UNI-conventie voor verschuifbare naven. DIN 6885-1:2021 noemt P9 sluitend en N9/JS9 vrij.",
    thClass: "Klasse",
    thBounds: "Bovenmaat / ondermaat",
    forB: (b: number, d: number) =>
      `Voor b = ${b} mm (Ø ${d} mm). Spleet = gatbasis, per ISO 286-2.`,
    fillForTable: "Vul een as-Ø in bovenaan de pagina voor de numerieke boven-/ondermaat van b.",
    footnote:
      "(hoge vorm). DIN 6885-2 is de lage vorm. H9/D10 is werkplaats-/UNI-conventie, niet de benoemde glijdpassing in DIN 6885-1:2021. Controleer kritieke maten in de actuele norm.",
  },
  en: {
    heading: "Key at shaft Ø",
    intro:
      "Shaft Ø in whole mm. DIN 6885-1: above the lower bound up to and including the upper bound. The first row is above 6 up to 8 — Ø 6 mm falls outside it.",
    diameterLabel: "Shaft Ø (mm)",
    fillDiameter: "Enter a shaft Ø.",
    noRow: (d: number) =>
      `No row in DIN 6885-1 for Ø ${d} mm. The table starts above 6 mm up to and including 110 mm.`,
    shaftAt: (d: number, range: string) => `Shaft Ø ${d} mm · ${range}`,
    keyBH: "Key b × h",
    t1: "t₁ shaft",
    t2: "t₂ hub",
    depthTol: "Depth tolerance",
    tableTitle: "Key and groove depth (DIN 6885-1)",
    thShaft: "Shaft Ø d (mm)",
    thKey: "Key b × h",
    thT1: "t₁ shaft",
    thT2: "t₂ hub",
    thTol: "Depth tol.",
    source: "Elesa+Ganter — DIN 6885 keyways",
    widthTolTitle: "Width tolerance b",
    p9Title: "P9 / P9 — fixed",
    p9Body: "Standard. Shaft and hub both P9. Key sits tight; suitable for variable loads.",
    n9Title: "N9 / JS9 — light",
    n9Body: "Shaft N9, hub JS9. Easier to assemble. Only where the application allows it.",
    h9Title: "H9 / D10 — sliding",
    h9Body:
      "Shop/UNI convention for sliding hubs. DIN 6885-1:2021 calls P9 close-fit and N9/JS9 free.",
    thClass: "Class",
    thBounds: "Upper / lower deviation",
    forB: (b: number, d: number) => `For b = ${b} mm (Ø ${d} mm). Gap = hole basis, per ISO 286-2.`,
    fillForTable:
      "Enter a shaft Ø at the top of the page for the numeric upper/lower deviation of b.",
    footnote:
      "(tall form). DIN 6885-2 is the low form. H9/D10 is a shop/UNI convention, not the named sliding fit in DIN 6885-1:2021. Check critical dimensions in the current standard.",
  },
};

export function KeywaysCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const rangeLabel = locale === "nl" ? rangeLabelNl : rangeLabelEn;
  const [search, setSearch] = useSearchParams();
  const [diameter, setDiameter] = useState(
    () => search.get("d") ?? readStoredDiameter({ min: 7, max: 110 }),
  );

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
      t.shaftAt(d, rangeLabelDisplay(row.over, row.to)),
      `${t.keyBH} ${row.b} × ${row.h} mm`,
      `${t.t1}  ${fmtMm(row.t1)} mm`,
      `${t.t2}  ${fmtMm(row.t2)} mm`,
      `${t.depthTol}  0 / +${fmtMm(row.depthTol)} mm`,
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, row, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 max-w-xs">
          <Field label={t.diameterLabel}>
            <WholeMmInput id="key-diameter" value={diameter} onChange={onDia} />
          </Field>
        </div>
        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">{t.fillDiameter}</p>
        ) : !row ? (
          <p className="mt-5 text-sm text-muted">{t.noRow(d)}</p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              {t.shaftAt(d, rangeLabelDisplay(row.over, row.to))}
            </p>
            <ResultGrid
              items={[
                { label: t.keyBH, value: `${row.b} × ${row.h} mm` },
                { label: t.t1, value: `${fmtMm(row.t1)} mm` },
                { label: t.t2, value: `${fmtMm(row.t2)} mm` },
                { label: t.depthTol, value: `0 / +${fmtMm(row.depthTol)} mm` },
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
        <KeywaySection row={row} />
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.tableTitle}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thShaft}</th>
                <th>{t.thKey}</th>
                <th>{t.thT1}</th>
                <th>{t.thT2}</th>
                <th>{t.thTol}</th>
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
          {t.source}
        </SourceLink>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.widthTolTitle}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-border bg-surface p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="vast" /> {t.p9Title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.p9Body}</p>
          </article>
          <article className="rounded-lg border border-border bg-surface p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="overgang" /> {t.n9Title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.n9Body}</p>
          </article>
          <article className="rounded-lg border border-border bg-surface p-4">
            <p className="flex items-center gap-2 font-medium text-ink">
              <KindDot kind="los" /> {t.h9Title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.h9Body}</p>
          </article>
        </div>

        {row ? (
          <div className="table-scroll mt-6">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>{t.thClass}</th>
                  <th>{t.thBounds}</th>
                </tr>
              </thead>
              <tbody>
                {WIDTH_FITS.map((fit) => {
                  const wt = keyWidthTol(row.b, fit);
                  return (
                    <tr key={fit}>
                      <th scope="row" className="normal-case">
                        {fit}
                      </th>
                      <td>{wt ? `${mmFromUm(wt.ES)} / ${mmFromUm(wt.EI)} mm` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-subtle">{t.forB(row.b, d)}</p>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">{t.fillForTable}</p>
        )}

        <SourceLink href="https://www.elesa-ganter.com/static/technicaldata/files/DIN6885_Keyways_EN.pdf">
          {t.source}
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">{t.footnote}</p>
      </section>
    </>
  );
}
