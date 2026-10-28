import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ANGULAR_BANDS,
  fmtAngle,
  fmtGeoZone,
  fmtIso2768,
  GEO_CLASSES,
  LINEAR_BANDS,
  LINEAR_CLASSES,
  LINEAR_SIZE_MIN,
  lookupAngular,
  lookupLinear,
  lookupPerpendicularity,
  lookupRadiusChamfer,
  lookupStraightnessFlatness,
  lookupSymmetry,
  PERPENDICULARITY_BANDS,
  RADIUS_CHAMFER_BANDS,
  RUNOUT,
  STRAIGHTNESS_FLATNESS_BANDS,
  SYMMETRY_BANDS,
  type GeoClass,
  type LinearClass,
} from "@/lib/calculators/iso2768";
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
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";
import { normalizeIso2768LegacyParams } from "@/lib/legacy-routes";

/**
 * M-01 (audit, 17 sept 2026): ISO 2768-1 (dimensional, Tables 1-3) and
 * ISO 2768-2 (geometric H/K/L, Tables 4-7) are two different standards with
 * two different statuses, not one "ISO 2768". -2:1989 is withdrawn (ISO
 * points to ISO 22081:2021); -1:1989 is still published but a second
 * edition is under publication. Each section below carries its own status
 * badge so neither can be mistaken for "current, unqualified" guidance.
 */
const DIMENSIONAL_META: EngineeringSourceMeta = {
  basisType: "standard",
  reference: "ISO 2768-1:1989",
  status: "under-publication",
  checkedDate: "2026-09-17",
  validityRange: {
    nl: "Tabellen 1-3, lineaire/hoekmaten zonder individuele toleranties",
    en: "Tables 1-3, linear/angular sizes without individual tolerances",
  },
  assumptions: {
    nl: "Een tweede editie van ISO 2768-1 is bij ISO in publicatie en zal deze editie uit 1989 naar verwachting vervangen; onderstaande waarden zijn de 1989-tekst, op het moment van schrijven nog gepubliceerd.",
    en: "A second edition of ISO 2768-1 is under publication at ISO and is expected to replace this 1989 edition; values below are the 1989 text, still published at the time of writing.",
  },
  sourceUrl: "https://www.iso.org/standard/85741.html",
};

const GEOMETRIC_META: EngineeringSourceMeta = {
  basisType: "standard",
  reference: "ISO 2768-2:1989",
  status: "withdrawn-legacy",
  checkedDate: "2026-09-17",
  validityRange: {
    nl: "Tabellen 4-7, geometrische tolerantieklassen H/K/L",
    en: "Tables 4-7, geometric tolerance classes H/K/L",
  },
  assumptions: {
    nl: "ISO 2768-2:1989 is ingetrokken. ISO 22081:2021 is het huidige algemene GPS-raamwerk dat deze vervangt — gebruik deze H/K/L-klassen alleen om bestaande tekeningen te interpreteren, niet voor nieuwe ontwerpen.",
    en: "ISO 2768-2:1989 is withdrawn. ISO 22081:2021 is the current general geometrical specifications framework that replaces it — use these H/K/L classes only to interpret existing drawings, not for new designs.",
  },
  sourceUrl: "https://www.iso.org/standard/72514.html",
};

const T = {
  nl: {
    heading: "Lineaire en hoekmaten (ISO 2768-1)",
    intro:
      "Titelblok-tolerantieklasse voor maten zonder individuele toleranties. Kies de klasse en vul een maat in.",
    toleranceClass: "Tolerantieklasse",
    geoClassError: "Kies een geldige geometrische tolerantieklasse (H, K of L).",
    invalidGeoCopy: "Geometrische toleranties ontbreken: kies een geldige klasse (H, K of L).",
    classError: "Kies een geldige tolerantieklasse (f, m, c of v).",
    invalidCopy: "Dimensionele toleranties ontbreken: kies een geldige klasse (f, m, c of v).",
    nominalSize: "Nominale maat (mm)",
    legLength: "Lengte kortste been (mm, voor hoek)",
    linearSize: "Lineaire maat",
    radiusChamfer: "Radius / afschuining",
    angularSize: "Hoekmaat",
    belowMin: (min: number) =>
      `ISO 2768-1 Tabel 1/2 begint bij ${min} mm — geen algemene tolerantie voor lineaire maat/radius/afschuining onder deze grens. Geef voor kleinere maten een individuele tolerantie op.`,
    thSize: "Maat (mm)",
    table1Note: (cls: string) =>
      `ISO 2768-1 Tabel 1, toegestane afwijking lineaire maten (mm). Klasse actief: ${cls}.`,
    thRadiusChamfer: "Radius / afschuining (mm)",
    table2Note: "ISO 2768-1 Tabel 2.",
    thLeg: "Been (mm)",
    table3Note: "ISO 2768-1 Tabel 3, o.b.v. lengte kortste been van de hoek.",
    geoHeading: "Geometrische toleranties (ISO 2768-2:1989 — vervallen)",
    geoIntro:
      "Rechtheid/vlakheid, loodrechtheid, symmetrie en rondloop zonder individuele aanduiding — klassen H, K, L.",
    geoZoneNote:
      "Deze waarden zijn de totale breedte van de tolerantiezone, geen ±afwijking — een vlakheid van 0,2 mm betekent dat het hele oppervlak binnen een zone van 0,2 mm dik moet liggen, niet ±0,2 mm rond een nominale waarde.",
    classLabel: "Klasse",
    nominalLength: "Nominale lengte (mm)",
    straightnessFlatness: "Rechtheid / vlakheid",
    perpendicularity: "Loodrechtheid",
    symmetry: "Symmetrie",
    runout: "Rondloop (onafh. van lengte)",
    thStraightness: "Rechtheid/vlakheid (mm)",
    thPerpendicularity: "Loodrechtheid (mm)",
    thSymmetry: "Symmetrie (mm)",
    tables47Note:
      "ISO 2768-2, Tabellen 4-7. Rondloop heeft één waarde per klasse, onafhankelijk van lengte.",
    sourceBadge:
      "Tabelwaarden getranscribeerd van veelgebruikte, publiek gepubliceerde samenvattingen van ISO 2768-1/-2. Verifieer tegen de originele norm voor contractueel bindende tekeningen.",
    copyLinear: (size: string, cls: string, dev: string) =>
      `Ø/L ${size} mm, klasse ${cls}: lineair ${dev} mm`,
    copyRadius: (dev: string) => `Radius/afschuining: ${dev} mm`,
    copyAngle: (leg: string, cls: string, angle: string) =>
      `Hoek (been ${leg} mm), klasse ${cls}: ${angle}`,
    copyStraight: (len: string, cls: string, dev: string) =>
      `Rechtheid/vlakheid (${len} mm), klasse ${cls}: totale zone ${dev} mm (geen ±)`,
    copyPerp: (len: string, cls: string, dev: string) =>
      `Loodrechtheid (${len} mm), klasse ${cls}: totale zone ${dev} mm (geen ±)`,
    copySym: (len: string, cls: string, dev: string) =>
      `Symmetrie (${len} mm), klasse ${cls}: totale zone ${dev} mm (geen ±)`,
    copyRunout: (cls: string, dev: string) =>
      `Rondloop, klasse ${cls}: totale zone ${dev} mm (geen ±, onafh. van lengte)`,
  },
  en: {
    heading: "Linear and angular dimensions (ISO 2768-1)",
    intro:
      "Title-block tolerance class for dimensions without individual tolerances. Choose the class and enter a dimension.",
    toleranceClass: "Tolerance class",
    geoClassError: "Select a valid geometric tolerance class (H, K or L).",
    invalidGeoCopy: "Geometric tolerances omitted: select a valid class (H, K or L).",
    classError: "Select a valid tolerance class (f, m, c or v).",
    invalidCopy: "Dimensional tolerances omitted: select a valid class (f, m, c or v).",
    nominalSize: "Nominal size (mm)",
    legLength: "Shorter leg length (mm, for angle)",
    linearSize: "Linear size",
    radiusChamfer: "Radius / chamfer",
    angularSize: "Angular size",
    belowMin: (min: number) =>
      `ISO 2768-1 Table 1/2 starts at ${min} mm — no general tolerance for linear size/radius/chamfer below this limit. Specify an individual tolerance for smaller sizes.`,
    thSize: "Size (mm)",
    table1Note: (cls: string) =>
      `ISO 2768-1 Table 1, permissible deviation of linear sizes (mm). Active class: ${cls}.`,
    thRadiusChamfer: "Radius / chamfer (mm)",
    table2Note: "ISO 2768-1 Table 2.",
    thLeg: "Leg (mm)",
    table3Note: "ISO 2768-1 Table 3, based on the length of the shorter leg of the angle.",
    geoHeading: "Geometric tolerances (ISO 2768-2:1989 — withdrawn)",
    geoIntro:
      "Straightness/flatness, perpendicularity, symmetry and circular run-out without individual indication — classes H, K, L.",
    geoZoneNote:
      "These values are the total width of the tolerance zone, not a ± deviation — a flatness of 0.2 mm means the whole surface must lie within a 0.2 mm thick zone, not ±0.2 mm around a nominal value.",
    classLabel: "Class",
    nominalLength: "Nominal length (mm)",
    straightnessFlatness: "Straightness / flatness",
    perpendicularity: "Perpendicularity",
    symmetry: "Symmetry",
    runout: "Circular run-out (length-independent)",
    thStraightness: "Straightness/flatness (mm)",
    thPerpendicularity: "Perpendicularity (mm)",
    thSymmetry: "Symmetry (mm)",
    tables47Note:
      "ISO 2768-2, Tables 4-7. Circular run-out has one value per class, independent of length.",
    sourceBadge:
      "Table values transcribed from commonly used, publicly published summaries of ISO 2768-1/-2. Verify against the original standard for contractually binding drawings.",
    copyLinear: (size: string, cls: string, dev: string) =>
      `Ø/L ${size} mm, class ${cls}: linear ${dev} mm`,
    copyRadius: (dev: string) => `Radius/chamfer: ${dev} mm`,
    copyAngle: (leg: string, cls: string, angle: string) =>
      `Angle (leg ${leg} mm), class ${cls}: ${angle}`,
    copyStraight: (len: string, cls: string, dev: string) =>
      `Straightness/flatness (${len} mm), class ${cls}: total zone ${dev} mm (not ±)`,
    copyPerp: (len: string, cls: string, dev: string) =>
      `Perpendicularity (${len} mm), class ${cls}: total zone ${dev} mm (not ±)`,
    copySym: (len: string, cls: string, dev: string) =>
      `Symmetry (${len} mm), class ${cls}: total zone ${dev} mm (not ±)`,
    copyRunout: (cls: string, dev: string) =>
      `Circular run-out, class ${cls}: total zone ${dev} mm (not ±, length-independent)`,
  },
};

export function Iso2768Calc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const normalizedSearch = normalizeIso2768LegacyParams(search);
  const [linearClass, setLinearClass] = useState(normalizedSearch.get("lc") ?? "m");
  const validLinearClass: LinearClass | undefined = LINEAR_CLASSES.find(
    (item) => item.id === linearClass,
  )?.id;
  const classError = validLinearClass === undefined ? t.classError : undefined;
  const [size, setSize] = useState(normalizedSearch.get("d") ?? "50");
  const [legLength, setLegLength] = useState(normalizedSearch.get("leg") ?? "50");
  const [geoClass, setGeoClass] = useState(normalizedSearch.get("gc") ?? "K");
  const validGeoClass: GeoClass | undefined = GEO_CLASSES.find((item) => item.id === geoClass)?.id;
  const geoClassError = validGeoClass === undefined ? t.geoClassError : undefined;
  const [geoLength, setGeoLength] = useState(normalizedSearch.get("gl") ?? "100");

  useEffect(() => {
    const next = normalizeIso2768LegacyParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    next.set("lc", linearClass);
    set("d", size);
    set("leg", legLength);
    next.set("gc", geoClass);
    set("gl", geoLength);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linearClass, size, legLength, geoClass, geoLength]);

  const d = parseNum(size);
  const linearRow = d != null ? lookupLinear(d) : null;
  const radiusRow = d != null ? lookupRadiusChamfer(d) : null;
  const linearDev = linearRow && validLinearClass ? linearRow[validLinearClass] : null;
  const radiusDev = radiusRow && validLinearClass ? radiusRow[validLinearClass] : null;

  const leg = parseNum(legLength);
  const angularRow = leg != null ? lookupAngular(leg) : null;
  const angularDev = angularRow && validLinearClass ? angularRow[validLinearClass] : null;

  const gl = parseNum(geoLength);
  const straightRow = gl != null ? lookupStraightnessFlatness(gl) : null;
  const perpRow = gl != null ? lookupPerpendicularity(gl) : null;
  const symRow = gl != null ? lookupSymmetry(gl) : null;

  const copy = useMemo(() => {
    const lines: string[] = [];
    if (classError) lines.push(t.invalidCopy);
    if (validLinearClass && linearRow)
      lines.push(t.copyLinear(size, linearClass, fmtIso2768(linearDev)));
    if (validLinearClass && radiusRow) lines.push(t.copyRadius(fmtIso2768(radiusDev)));
    if (validLinearClass && angularRow)
      lines.push(t.copyAngle(legLength, linearClass, fmtAngle(angularDev ?? 0)));
    if (geoClassError) lines.push(t.invalidGeoCopy);
    if (validGeoClass && straightRow)
      lines.push(t.copyStraight(geoLength, geoClass, fmtGeoZone(straightRow[validGeoClass])));
    if (validGeoClass && perpRow)
      lines.push(t.copyPerp(geoLength, geoClass, fmtGeoZone(perpRow[validGeoClass])));
    if (validGeoClass && symRow)
      lines.push(t.copySym(geoLength, geoClass, fmtGeoZone(symRow[validGeoClass])));
    if (validGeoClass && gl != null)
      lines.push(t.copyRunout(geoClass, fmtGeoZone(RUNOUT[validGeoClass])));
    if (validLinearClass && (linearRow || radiusRow || angularRow))
      lines.push(metaCopyLine(DIMENSIONAL_META, locale));
    if (validGeoClass && (straightRow || perpRow || symRow || gl != null))
      lines.push(metaCopyLine(GEOMETRIC_META, locale));
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    validLinearClass,
    classError,
    validGeoClass,
    geoClassError,
    linearRow,
    radiusRow,
    angularRow,
    straightRow,
    perpRow,
    symRow,
    gl,
    geoClass,
    size,
    legLength,
    geoLength,
    linearClass,
    linearDev,
    radiusDev,
    angularDev,
    locale,
  ]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2 text-sm text-muted">
            <label htmlFor="iso2768-linear-class">{t.toleranceClass}</label>
            <SelectInput
              id="iso2768-linear-class"
              value={validLinearClass ?? "invalid"}
              onChange={setLinearClass}
              aria-invalid={Boolean(classError)}
              aria-describedby={classError ? "iso2768-linear-class-error" : undefined}
            >
              {classError && (
                <option value="invalid" disabled>
                  {t.classError}
                </option>
              )}
              {LINEAR_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === "nl" ? c.label : c.labelEn}
                </option>
              ))}
            </SelectInput>
            {classError && (
              <p id="iso2768-linear-class-error" role="alert" className="text-sm text-danger">
                {classError}
              </p>
            )}
          </div>
          <Field label={t.nominalSize}>
            <NumInput id="iso2768-size" value={size} onChange={setSize} />
          </Field>
          <Field label={t.legLength}>
            <NumInput id="iso2768-leg" value={legLength} onChange={setLegLength} />
          </Field>
        </div>

        {d != null && d < LINEAR_SIZE_MIN ? (
          <p className="mt-3 text-sm leading-relaxed text-muted" role="status">
            {t.belowMin(LINEAR_SIZE_MIN)}
          </p>
        ) : null}

        {validLinearClass && (
          <ResultGrid
            items={[
              { label: t.linearSize, value: linearRow ? `${fmtIso2768(linearDev)} mm` : "—" },
              { label: t.radiusChamfer, value: radiusRow ? `${fmtIso2768(radiusDev)} mm` : "—" },
              { label: t.angularSize, value: angularRow ? fmtAngle(angularDev ?? 0) : "—" },
            ]}
          />
        )}
        <div className="flex flex-wrap gap-2">
          {copy ? <CopyResult text={copy} /> : null}
          <CopyLink />
        </div>
        <SourceMetaBadge meta={DIMENSIONAL_META} />

        <div className="table-scroll mt-8" tabIndex={0}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thSize}</th>
                <th>f</th>
                <th>m</th>
                <th>c</th>
                <th>v</th>
              </tr>
            </thead>
            <tbody>
              {LINEAR_BANDS.map((b) => (
                <tr key={b.label} className={b === linearRow ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {b.label}
                  </th>
                  <td>{fmtIso2768(b.f)}</td>
                  <td>{fmtIso2768(b.m)}</td>
                  <td>{fmtIso2768(b.c)}</td>
                  <td>{fmtIso2768(b.v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-subtle">{t.table1Note(validLinearClass ?? "—")}</p>

        <div className="table-scroll mt-6" tabIndex={0}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thRadiusChamfer}</th>
                <th>f</th>
                <th>m</th>
                <th>c</th>
                <th>v</th>
              </tr>
            </thead>
            <tbody>
              {RADIUS_CHAMFER_BANDS.map((b) => (
                <tr key={b.label} className={b === radiusRow ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {b.label}
                  </th>
                  <td>{fmtIso2768(b.f)}</td>
                  <td>{fmtIso2768(b.m)}</td>
                  <td>{fmtIso2768(b.c)}</td>
                  <td>{fmtIso2768(b.v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-subtle">{t.table2Note}</p>

        <div className="table-scroll mt-6" tabIndex={0}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thLeg}</th>
                <th>f</th>
                <th>m</th>
                <th>c</th>
                <th>v</th>
              </tr>
            </thead>
            <tbody>
              {ANGULAR_BANDS.map((b) => (
                <tr key={b.label} className={b === angularRow ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {b.label}
                  </th>
                  <td>{fmtAngle(b.f)}</td>
                  <td>{fmtAngle(b.m)}</td>
                  <td>{fmtAngle(b.c)}</td>
                  <td>{fmtAngle(b.v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-subtle">{t.table3Note}</p>
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.geoHeading}
        </h2>
        <Note>{t.geoIntro}</Note>
        <Note>{t.geoZoneNote}</Note>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 text-sm text-muted">
            <label htmlFor="iso2768-geo-class">{t.classLabel}</label>
            <SelectInput
              id="iso2768-geo-class"
              value={validGeoClass ?? "invalid"}
              onChange={setGeoClass}
              aria-invalid={Boolean(geoClassError)}
              aria-describedby={geoClassError ? "iso2768-geo-class-error" : undefined}
            >
              {geoClassError && (
                <option value="invalid" disabled>
                  {t.geoClassError}
                </option>
              )}
              {GEO_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
            {geoClassError && (
              <p id="iso2768-geo-class-error" role="alert" className="text-sm text-danger">
                {geoClassError}
              </p>
            )}
          </div>
          <Field label={t.nominalLength}>
            <NumInput id="iso2768-geo-length" value={geoLength} onChange={setGeoLength} />
          </Field>
        </div>
        {validGeoClass && (
          <ResultGrid
            items={[
              {
                label: t.straightnessFlatness,
                value: straightRow ? `${fmtGeoZone(straightRow[validGeoClass])} mm` : "—",
              },
              {
                label: t.perpendicularity,
                value: perpRow ? `${fmtGeoZone(perpRow[validGeoClass])} mm` : "—",
              },
              {
                label: t.symmetry,
                value: symRow ? `${fmtGeoZone(symRow[validGeoClass])} mm` : "—",
              },
              { label: t.runout, value: `${fmtGeoZone(RUNOUT[validGeoClass])} mm` },
            ]}
          />
        )}
        {copy ? (
          <div className="flex flex-wrap gap-2">
            <CopyResult text={copy} />
            <CopyLink />
          </div>
        ) : null}
        <SourceMetaBadge meta={GEOMETRIC_META} />

        <div className="table-scroll mt-6" tabIndex={0}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thStraightness}</th>
                <th>H</th>
                <th>K</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {STRAIGHTNESS_FLATNESS_BANDS.map((b) => (
                <tr key={b.label} className={b === straightRow ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {b.label}
                  </th>
                  <td>{fmtGeoZone(b.H)}</td>
                  <td>{fmtGeoZone(b.K)}</td>
                  <td>{fmtGeoZone(b.L)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-scroll mt-6" tabIndex={0}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thPerpendicularity}</th>
                <th>H</th>
                <th>K</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {PERPENDICULARITY_BANDS.map((b) => (
                <tr key={b.label} className={b === perpRow ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {b.label}
                  </th>
                  <td>{fmtGeoZone(b.H)}</td>
                  <td>{fmtGeoZone(b.K)}</td>
                  <td>{fmtGeoZone(b.L)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-scroll mt-6" tabIndex={0}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thSymmetry}</th>
                <th>H</th>
                <th>K</th>
                <th>L</th>
              </tr>
            </thead>
            <tbody>
              {SYMMETRY_BANDS.map((b) => (
                <tr key={b.label} className={b === symRow ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {b.label}
                  </th>
                  <td>{fmtGeoZone(b.H)}</td>
                  <td>{fmtGeoZone(b.K)}</td>
                  <td>{fmtGeoZone(b.L)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-subtle">{t.tables47Note}</p>

        <SourceBadge>{t.sourceBadge}</SourceBadge>
      </section>
    </>
  );
}
