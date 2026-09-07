import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  bendAllowance,
  bendDeduction,
  flatLength,
  fmtBendNum,
  kFactorFor,
  MATERIAL_CLASSES,
  minFlangeLength,
  minZOffset,
  rminFor,
  suggestedDieOpening,
} from "@/lib/calculators/bending";
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
  SourceLink,
} from "@/components/calculators/calc-ui";

export function EdgesCalc() {
  const [search, setSearch] = useSearchParams();
  const [thickness, setThickness] = useState(search.get("t") ?? "2");
  const [radius, setRadius] = useState(search.get("r") ?? "2");
  const [angle, setAngle] = useState(search.get("a") ?? "90");
  const [leg1, setLeg1] = useState(search.get("l1") ?? "30");
  const [leg2, setLeg2] = useState(search.get("l2") ?? "30");
  const [materialId, setMaterialId] = useState(search.get("mat") ?? "staal");
  const [zOffset, setZOffset] = useState(search.get("z") ?? "6");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    set("t", thickness);
    set("r", radius);
    set("a", angle);
    set("l1", leg1);
    set("l2", leg2);
    next.set("mat", materialId);
    set("z", zOffset);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thickness, radius, angle, leg1, leg2, materialId, zOffset]);

  const T = parseNum(thickness);
  const Ri = parseNum(radius);
  const angleDeg = parseNum(angle);
  const L1 = parseNum(leg1) ?? 0;
  const L2 = parseNum(leg2) ?? 0;
  const zVal = parseNum(zOffset);

  const K = T != null && Ri != null && T > 0 ? kFactorFor(Ri / T) : null;
  const valid = T != null && T > 0 && Ri != null && Ri >= 0 && angleDeg != null && angleDeg > 0 && angleDeg <= 180 && K != null;

  const BA = valid ? bendAllowance(angleDeg!, Ri!, T!, K!) : null;
  const BD = valid ? bendDeduction(angleDeg!, Ri!, T!, K!) : null;
  const flat = valid && BD != null ? flatLength([L1, L2], BD) : null;
  const rmin = T != null && T > 0 ? rminFor(materialId, T) : null;
  const flangeMin = T != null && T > 0 ? minFlangeLength(T) : null;
  const dieOpening = T != null && T > 0 ? suggestedDieOpening(T) : null;
  const zMin = T != null && Ri != null && T > 0 ? minZOffset(Ri, T) : null;

  const copy = useMemo(() => {
    if (!valid || BA == null || BD == null) return "";
    const lines = [
      `T=${thickness} mm, Ri=${radius} mm, θ=${angle}°, K=${fmtBendNum(K!, 2)}`,
      `Buigtoeslag BA = ${fmtBendNum(BA, 2)} mm`,
      `Buigaftrek BD = ${fmtBendNum(BD, 2)} mm`,
    ];
    if (flat != null && (L1 > 0 || L2 > 0)) lines.push(`Platte lengte = ${fmtBendNum(flat, 2)} mm`);
    return lines.join("\n");
  }, [valid, BA, BD, flat, K, thickness, radius, angle, L1, L2]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Buigtoeslag (K-factor)</h2>
        <Note>
          BA = θ·(Ri + K·T), BD = 2·(Ri+T)·tan(θ/2) − BA. K volgt uit de vuistregel Ri/T: &lt;1 → 0,33, 1–3 → 0,40,
          &gt;3 → 0,50. Kalibreer op de eigen kantpers voor kritieke toleranties — dit is een praktijkbenadering,
          geen gemeten materiaalwaarde.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Plaatdikte T (mm)">
            <NumInput id="edge-t" value={thickness} onChange={setThickness} />
          </Field>
          <Field label="Binnenstraal Ri (mm)">
            <NumInput id="edge-r" value={radius} onChange={setRadius} />
          </Field>
          <Field label="Buighoek θ (°)">
            <NumInput id="edge-angle" value={angle} onChange={setAngle} />
          </Field>
          <Field label="Materiaal">
            <SelectInput value={materialId} onChange={setMaterialId}>
              {MATERIAL_CLASSES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Been 1, buitenmaat (mm, optioneel)">
            <NumInput id="edge-leg1" value={leg1} onChange={setLeg1} />
          </Field>
          <Field label="Been 2, buitenmaat (mm, optioneel)">
            <NumInput id="edge-leg2" value={leg2} onChange={setLeg2} />
          </Field>
        </div>

        {!valid ? (
          <p className="mt-5 text-sm text-muted">Vul plaatdikte, straal (≥0) en een hoek tussen 0 en 180° in.</p>
        ) : (
          <>
            <ResultGrid
              items={[
                { label: "K-factor", value: fmtBendNum(K!, 2) },
                { label: "Buigtoeslag (BA)", value: `${fmtBendNum(BA!, 2)} mm` },
                { label: "Buigaftrek (BD)", value: `${fmtBendNum(BD!, 2)} mm` },
                flat != null && (L1 > 0 || L2 > 0) ? { label: "Platte lengte", value: `${fmtBendNum(flat, 2)} mm` } : null,
              ].filter(Boolean) as { label: string; value: string }[]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Minimale straal, beenlengte en matrijsopening</h2>
        <Note>
          Algemene DFM-richtwaarden voor zetwerk, geen normwaarde — controleer bij de plaatleverancier of het
          zetbedrijf voor kritieke onderdelen.
        </Note>
        <ResultGrid
          items={[
            rmin != null ? { label: `Min. binnenstraal (${MATERIAL_CLASSES.find((m) => m.id === materialId)?.label ?? ""})`, value: `${fmtBendNum(rmin, 2)} mm` } : null,
            flangeMin != null ? { label: "Min. beenlengte (4×T)", value: `${fmtBendNum(flangeMin, 2)} mm` } : null,
            dieOpening != null ? { label: "Typische V-matrijsopening (8×T)", value: `${fmtBendNum(dieOpening.v, 1)} mm` } : null,
            dieOpening != null ? { label: "Bijbehorende ponsstraal (V/6)", value: `${fmtBendNum(dieOpening.punchRadius, 2)} mm` } : null,
          ].filter(Boolean) as { label: string; value: string }[]}
        />

        <h3 className="mt-8 font-display text-lg font-semibold tracking-tight text-ink">Z-buiging (offset)</h3>
        <Note>
          Geometrische ondergrens: de twee buigstralen plus de plaatdikte moeten fysiek passen (Z_min = 2·Ri + T).
          Dit is geen volledige gereedschap-vrijloopcontrole — bij een krappe offset altijd de matrijs- en
          ponsvorm van de kantpers controleren.
        </Note>
        <div className="mt-4 max-w-xs">
          <Field label="Beoogde offsethoogte Z (mm)">
            <NumInput id="edge-z" value={zOffset} onChange={setZOffset} />
          </Field>
        </div>
        {zMin != null ? (
          <>
            <ResultGrid items={[{ label: "Geometrische ondergrens Z_min", value: `${fmtBendNum(zMin, 2)} mm` }]} />
            {zVal != null && zVal < zMin ? (
              <Note>
                Z = {fmtBendNum(zVal, 2)} mm ligt onder de ondergrens van {fmtBendNum(zMin, 2)} mm — de twee
                buigstralen passen dan niet zonder overlap. Vergroot de offset of verklein de binnenstraal.
              </Note>
            ) : null}
          </>
        ) : null}

        <SourceLink href="https://www.engineeringtoolbox.com/bend-allowance-d_1904.html">
          Engineering ToolBox — Sheet metal bend allowance
        </SourceLink>
      </section>
    </>
  );
}
