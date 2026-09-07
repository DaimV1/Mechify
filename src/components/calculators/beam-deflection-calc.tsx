import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BEAM_TYPES, computeBeam, DEFLECTION_GUIDELINES, fmtBeamNum, type BeamType } from "@/lib/calculators/beam";
import { eFor, MATERIALS_E, SECTION_KINDS, sectionProps, type SectionKind } from "@/lib/calculators/knik";
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

export function BeamDeflectionCalc() {
  const [search, setSearch] = useSearchParams();
  const [beamType, setBeamType] = useState<BeamType>((search.get("type") as BeamType) ?? "opgelegd");
  const [sectionKind, setSectionKind] = useState<SectionKind>((search.get("section") as SectionKind) ?? "rechthoek");
  const [D, setD] = useState(search.get("D") ?? "20");
  const [dIn, setDIn] = useState(search.get("dIn") ?? "14");
  const [b, setB] = useState(search.get("b") ?? "40");
  const [h, setH] = useState(search.get("h") ?? "10");
  const [a, setA] = useState(search.get("a") ?? "10");
  const [t, setT] = useState(search.get("t") ?? "3");
  const [L, setL] = useState(search.get("L") ?? "1000");
  const [posA, setPosA] = useState(search.get("posA") ?? "500");
  const [force, setForce] = useState(search.get("f") ?? "500");
  const [materialId, setMaterialId] = useState(search.get("material") ?? "staal");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    next.set("type", beamType);
    next.set("section", sectionKind);
    set("D", D);
    set("dIn", dIn);
    set("b", b);
    set("h", h);
    set("a", a);
    set("t", t);
    set("L", L);
    set("posA", posA);
    set("f", force);
    next.set("material", materialId);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beamType, sectionKind, D, dIn, b, h, a, t, L, posA, force, materialId]);

  const dims = useMemo(() => {
    switch (sectionKind) {
      case "rond":
        return { D: parseNum(D) ?? undefined };
      case "buis":
        return { D: parseNum(D) ?? undefined, d: parseNum(dIn) ?? undefined };
      case "rechthoek":
        return { b: parseNum(b) ?? undefined, h: parseNum(h) ?? undefined };
      case "vierkant":
        return { a: parseNum(a) ?? undefined };
      case "koker":
        return { b: parseNum(b) ?? undefined, h: parseNum(h) ?? undefined, t: parseNum(t) ?? undefined };
    }
  }, [sectionKind, D, dIn, b, h, a, t]);

  const section = useMemo(() => sectionProps(sectionKind, dims), [sectionKind, dims]);
  const Lraw = parseNum(L);
  const posARaw = parseNum(posA);
  const Fraw = parseNum(force);
  const E = eFor(materialId);
  const material = MATERIALS_E.find((m) => m.id === materialId) ?? MATERIALS_E[0];

  const result =
    section && Lraw != null && posARaw != null && Fraw != null
      ? computeBeam({ type: beamType, F: Fraw, L: Lraw, a: posARaw, E, I: section.I })
      : null;

  const ratio = result && result.deflection > 0 && Lraw ? Lraw / result.deflection : null;

  const copy = useMemo(() => {
    if (!result) return "";
    const beamLabel = BEAM_TYPES.find((t) => t.id === beamType)?.label ?? "";
    return [
      `${beamLabel}, L=${L} mm, a=${posA} mm, F=${force} N, ${material.label}`,
      `δ ${result.atLabel} = ${fmtBeamNum(result.deflection, 3)} mm`,
      `M_max = ${fmtBeamNum(result.momentMax, 0)} N·mm`,
      ratio != null ? `L/δ ≈ ${fmtBeamNum(ratio, 0)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [result, beamType, L, posA, force, material, ratio]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Doorbuiging onder puntlast</h2>
        <Note>
          Euler-Bernoulli balktheorie, één puntlast. Vrij opgelegd: a is de afstand van de last tot de linker
          oplegging. Uitkraging: a is de afstand van de last tot de inklemming (tip bij a = L). Rechthoek en koker
          rekenen met I_min (zwakke as).
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Balktype">
            <SelectInput value={beamType} onChange={(v) => setBeamType(v as BeamType)}>
              {BEAM_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Doorsnede">
            <SelectInput value={sectionKind} onChange={(v) => setSectionKind(v as SectionKind)}>
              {SECTION_KINDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Overspanning / lengte L (mm)">
            <NumInput id="beam-L" value={L} onChange={setL} />
          </Field>
          <Field label="Positie last a (mm)">
            <NumInput id="beam-a" value={posA} onChange={setPosA} />
          </Field>
          <Field label="Puntlast F (N)">
            <NumInput id="beam-force" value={force} onChange={setForce} />
          </Field>
          <Field label="Materiaal">
            <SelectInput value={materialId} onChange={setMaterialId}>
              {MATERIALS_E.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          {sectionKind === "rond" ? (
            <Field label="Diameter D (mm)">
              <NumInput id="beam-D" value={D} onChange={setD} />
            </Field>
          ) : null}
          {sectionKind === "buis" ? (
            <>
              <Field label="Buitendiameter D (mm)">
                <NumInput id="beam-D" value={D} onChange={setD} />
              </Field>
              <Field label="Binnendiameter d (mm)">
                <NumInput id="beam-d" value={dIn} onChange={setDIn} />
              </Field>
            </>
          ) : null}
          {sectionKind === "rechthoek" ? (
            <>
              <Field label="Breedte b (mm)">
                <NumInput id="beam-b" value={b} onChange={setB} />
              </Field>
              <Field label="Hoogte h (mm)">
                <NumInput id="beam-h" value={h} onChange={setH} />
              </Field>
            </>
          ) : null}
          {sectionKind === "vierkant" ? (
            <Field label="Zijde a (mm)">
              <NumInput id="beam-side" value={a} onChange={setA} />
            </Field>
          ) : null}
          {sectionKind === "koker" ? (
            <>
              <Field label="Breedte b (mm)">
                <NumInput id="beam-koker-b" value={b} onChange={setB} />
              </Field>
              <Field label="Hoogte h (mm)">
                <NumInput id="beam-koker-h" value={h} onChange={setH} />
              </Field>
              <Field label="Wanddikte t (mm)">
                <NumInput id="beam-koker-t" value={t} onChange={setT} />
              </Field>
            </>
          ) : null}
        </div>

        {!section ? (
          <p className="mt-5 text-sm text-muted">Vul geldige afmetingen in voor de gekozen doorsnede.</p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            Vul een overspanning L en een lastpositie a in (0 &lt; a &lt; L voor vrij opgelegd, 0 &lt; a ≤ L voor
            uitkraging).
          </p>
        ) : (
          <>
            <ResultGrid
              items={[
                { label: `Doorbuiging δ (${result.atLabel})`, value: `${fmtBeamNum(result.deflection, 3)} mm` },
                { label: "Moment M_max", value: `${fmtBeamNum(result.momentMax, 0)} N·mm` },
                { label: "I", value: `${fmtBeamNum(section.I, 0)} mm⁴` },
                ratio != null ? { label: "L / δ", value: `≈ ${fmtBeamNum(ratio, 0)}` } : null,
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
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Richtwaarden toelaatbare doorbuiging</h2>
        <Note>Generieke vuistregels — controleer de toepasselijke norm voor de specifieke toepassing.</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Verhouding</th>
                <th>Typische toepassing</th>
              </tr>
            </thead>
            <tbody>
              {DEFLECTION_GUIDELINES.map((g) => (
                <tr key={g.label}>
                  <th scope="row" className="normal-case">
                    {g.label}
                  </th>
                  <td>{g.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/beam-deflection-stress-d_1312.html">
          Engineering ToolBox — Beam deflection and stress
        </SourceLink>
      </section>
    </>
  );
}
