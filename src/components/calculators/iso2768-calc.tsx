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

export function Iso2768Calc() {
  const [search, setSearch] = useSearchParams();
  const [linearClass, setLinearClass] = useState<LinearClass>((search.get("lc") as LinearClass) ?? "m");
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
    if (linearRow) lines.push(`Ø/L ${size} mm, klasse ${linearClass}: lineair ${fmtIso2768(linearDev)} mm`);
    if (radiusRow) lines.push(`Radius/afschuining: ${fmtIso2768(radiusDev)} mm`);
    if (angularRow) lines.push(`Hoek (been ${legLength} mm), klasse ${linearClass}: ${fmtAngle(angularDev ?? 0)}`);
    if (straightRow) lines.push(`Rechtheid/vlakheid (${geoLength} mm), klasse ${geoClass}: ${fmtIso2768(straightRow[geoClass])} mm`);
    return lines.join("\n");
  }, [linearRow, radiusRow, angularRow, straightRow, size, legLength, geoLength, linearClass, geoClass, linearDev, radiusDev, angularDev]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Lineaire en hoekmaten (ISO 2768-1)</h2>
        <Note>Titelblok-tolerantieklasse voor maten zonder individuele toleranties. Kies de klasse en vul een maat in.</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label="Tolerantieklasse">
            <SelectInput value={linearClass} onChange={(v) => setLinearClass(v as LinearClass)}>
              {LINEAR_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Nominale maat (mm)">
            <NumInput id="iso2768-size" value={size} onChange={setSize} />
          </Field>
          <Field label="Lengte kortste been (mm, voor hoek)">
            <NumInput id="iso2768-leg" value={legLength} onChange={setLegLength} />
          </Field>
        </div>

        <ResultGrid
          items={[
            { label: "Lineaire maat", value: linearRow ? `${fmtIso2768(linearDev)} mm` : "—" },
            { label: "Radius / afschuining", value: radiusRow ? `${fmtIso2768(radiusDev)} mm` : "—" },
            { label: "Hoekmaat", value: angularRow ? fmtAngle(angularDev ?? 0) : "—" },
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
                <th>Maat (mm)</th>
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
        <p className="mt-2 text-xs text-subtle">ISO 2768-1 Tabel 1, toegestane afwijking lineaire maten (mm). Klasse actief: {linearClass}.</p>

        <div className="table-scroll mt-6">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Radius / afschuining (mm)</th>
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
        <p className="mt-2 text-xs text-subtle">ISO 2768-1 Tabel 2.</p>

        <div className="table-scroll mt-6">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Been (mm)</th>
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
        <p className="mt-2 text-xs text-subtle">ISO 2768-1 Tabel 3, o.b.v. lengte kortste been van de hoek.</p>
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Geometrische toleranties (ISO 2768-2)</h2>
        <Note>Rechtheid/vlakheid, loodrechtheid, symmetrie en rondloop zonder individuele aanduiding — klassen H, K, L.</Note>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Klasse">
            <SelectInput value={geoClass} onChange={(v) => setGeoClass(v as GeoClass)}>
              {GEO_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Nominale lengte (mm)">
            <NumInput id="iso2768-geo-length" value={geoLength} onChange={setGeoLength} />
          </Field>
        </div>
        <ResultGrid
          items={[
            { label: "Rechtheid / vlakheid", value: straightRow ? `${fmtIso2768(straightRow[geoClass])} mm` : "—" },
            { label: "Loodrechtheid", value: perpRow ? `${fmtIso2768(perpRow[geoClass])} mm` : "—" },
            { label: "Symmetrie", value: symRow ? `${fmtIso2768(symRow[geoClass])} mm` : "—" },
            { label: "Rondloop (onafh. van lengte)", value: `${fmtIso2768(RUNOUT[geoClass])} mm` },
          ]}
        />

        <div className="table-scroll mt-6">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Rechtheid/vlakheid (mm)</th>
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
                <th>Loodrechtheid (mm)</th>
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
                <th>Symmetrie (mm)</th>
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
        <p className="mt-2 text-xs text-subtle">ISO 2768-2, Tabellen 4-7. Rondloop heeft één waarde per klasse, onafhankelijk van lengte.</p>

        <SourceBadge>
          Tabelwaarden getranscribeerd van veelgebruikte, publiek gepubliceerde samenvattingen van ISO 2768-1/-2.
          Verifieer tegen de originele norm voor contractueel bindende tekeningen.
        </SourceBadge>
      </section>
    </>
  );
}
