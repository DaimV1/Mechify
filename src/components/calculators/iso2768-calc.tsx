import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ANGULAR_BANDS,
  fmtAngle,
  fmtIso2768,
  GEO_CLASSES,
  LINEAR_BANDS,
  LINEAR_CLASSES,
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

const T = {
  nl: {
    heading: "Lineaire en hoekmaten (ISO 2768-1)",
    intro:
      "Titelblok-tolerantieklasse voor maten zonder individuele toleranties. Kies de klasse en vul een maat in.",
    toleranceClass: "Tolerantieklasse",
    nominalSize: "Nominale maat (mm)",
    legLength: "Lengte kortste been (mm, voor hoek)",
    linearSize: "Lineaire maat",
    radiusChamfer: "Radius / afschuining",
    angularSize: "Hoekmaat",
    thSize: "Maat (mm)",
    table1Note: (cls: string) =>
      `ISO 2768-1 Tabel 1, toegestane afwijking lineaire maten (mm). Klasse actief: ${cls}.`,
    thRadiusChamfer: "Radius / afschuining (mm)",
    table2Note: "ISO 2768-1 Tabel 2.",
    thLeg: "Been (mm)",
    table3Note: "ISO 2768-1 Tabel 3, o.b.v. lengte kortste been van de hoek.",
    geoHeading: "Geometrische toleranties (ISO 2768-2)",
    geoIntro:
      "Rechtheid/vlakheid, loodrechtheid, symmetrie en rondloop zonder individuele aanduiding — klassen H, K, L.",
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
      `Rechtheid/vlakheid (${len} mm), klasse ${cls}: ${dev} mm`,
  },
  en: {
    heading: "Linear and angular dimensions (ISO 2768-1)",
    intro:
      "Title-block tolerance class for dimensions without individual tolerances. Choose the class and enter a dimension.",
    toleranceClass: "Tolerance class",
    nominalSize: "Nominal size (mm)",
    legLength: "Shorter leg length (mm, for angle)",
    linearSize: "Linear size",
    radiusChamfer: "Radius / chamfer",
    angularSize: "Angular size",
    thSize: "Size (mm)",
    table1Note: (cls: string) =>
      `ISO 2768-1 Table 1, permissible deviation of linear sizes (mm). Active class: ${cls}.`,
    thRadiusChamfer: "Radius / chamfer (mm)",
    table2Note: "ISO 2768-1 Table 2.",
    thLeg: "Leg (mm)",
    table3Note: "ISO 2768-1 Table 3, based on the length of the shorter leg of the angle.",
    geoHeading: "Geometric tolerances (ISO 2768-2)",
    geoIntro:
      "Straightness/flatness, perpendicularity, symmetry and circular run-out without individual indication — classes H, K, L.",
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
      `Straightness/flatness (${len} mm), class ${cls}: ${dev} mm`,
  },
};

export function Iso2768Calc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [linearClass, setLinearClass] = useState<LinearClass>(
    (search.get("lc") as LinearClass) ?? "m",
  );
  const [size, setSize] = useState(search.get("d") ?? "50");
  const [legLength, setLegLength] = useState(search.get("leg") ?? "50");
  const [geoClass, setGeoClass] = useState<GeoClass>((search.get("gc") as GeoClass) ?? "K");
  const [geoLength, setGeoLength] = useState(search.get("gl") ?? "100");

  useEffect(() => {
    const next = new URLSearchParams(search);
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
  const linearDev = linearRow ? linearRow[linearClass] : null;
  const radiusDev = radiusRow ? radiusRow[linearClass] : null;

  const leg = parseNum(legLength);
  const angularRow = leg != null ? lookupAngular(leg) : null;
  const angularDev = angularRow ? angularRow[linearClass] : null;

  const gl = parseNum(geoLength);
  const straightRow = gl != null ? lookupStraightnessFlatness(gl) : null;
  const perpRow = gl != null ? lookupPerpendicularity(gl) : null;
  const symRow = gl != null ? lookupSymmetry(gl) : null;

  const copy = useMemo(() => {
    const lines: string[] = [];
    if (linearRow) lines.push(t.copyLinear(size, linearClass, fmtIso2768(linearDev)));
    if (radiusRow) lines.push(t.copyRadius(fmtIso2768(radiusDev)));
    if (angularRow) lines.push(t.copyAngle(legLength, linearClass, fmtAngle(angularDev ?? 0)));
    if (straightRow)
      lines.push(t.copyStraight(geoLength, geoClass, fmtIso2768(straightRow[geoClass])));
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    linearRow,
    radiusRow,
    angularRow,
    straightRow,
    size,
    legLength,
    geoLength,
    linearClass,
    geoClass,
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
          <Field label={t.toleranceClass}>
            <SelectInput value={linearClass} onChange={(v) => setLinearClass(v as LinearClass)}>
              {LINEAR_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === "nl" ? c.label : c.labelEn}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.nominalSize}>
            <NumInput id="iso2768-size" value={size} onChange={setSize} />
          </Field>
          <Field label={t.legLength}>
            <NumInput id="iso2768-leg" value={legLength} onChange={setLegLength} />
          </Field>
        </div>

        <ResultGrid
          items={[
            { label: t.linearSize, value: linearRow ? `${fmtIso2768(linearDev)} mm` : "—" },
            { label: t.radiusChamfer, value: radiusRow ? `${fmtIso2768(radiusDev)} mm` : "—" },
            { label: t.angularSize, value: angularRow ? fmtAngle(angularDev ?? 0) : "—" },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <CopyResult text={copy} />
          <CopyLink />
        </div>

        <div className="table-scroll mt-8">
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
        <p className="mt-2 text-xs text-subtle">{t.table1Note(linearClass)}</p>

        <div className="table-scroll mt-6">
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

        <div className="table-scroll mt-6">
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t.classLabel}>
            <SelectInput value={geoClass} onChange={(v) => setGeoClass(v as GeoClass)}>
              {GEO_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.nominalLength}>
            <NumInput id="iso2768-geo-length" value={geoLength} onChange={setGeoLength} />
          </Field>
        </div>
        <ResultGrid
          items={[
            {
              label: t.straightnessFlatness,
              value: straightRow ? `${fmtIso2768(straightRow[geoClass])} mm` : "—",
            },
            {
              label: t.perpendicularity,
              value: perpRow ? `${fmtIso2768(perpRow[geoClass])} mm` : "—",
            },
            { label: t.symmetry, value: symRow ? `${fmtIso2768(symRow[geoClass])} mm` : "—" },
            { label: t.runout, value: `${fmtIso2768(RUNOUT[geoClass])} mm` },
          ]}
        />

        <div className="table-scroll mt-6">
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
                  <td>{fmtIso2768(b.H)}</td>
                  <td>{fmtIso2768(b.K)}</td>
                  <td>{fmtIso2768(b.L)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-scroll mt-6">
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
                  <td>{fmtIso2768(b.H)}</td>
                  <td>{fmtIso2768(b.K)}</td>
                  <td>{fmtIso2768(b.L)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-scroll mt-6">
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
                  <td>{fmtIso2768(b.H)}</td>
                  <td>{fmtIso2768(b.K)}</td>
                  <td>{fmtIso2768(b.L)}</td>
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
