import { BeamDeflection, SchemaPanel } from "@/components/toolkit/schema";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BEAM_TYPES,
  computeBeam,
  DEFLECTION_GUIDELINES,
  fmtBeamNum,
  type BeamType,
} from "@/lib/calculators/beam";
import {
  eFor,
  MATERIALS_E,
  SECTION_KINDS,
  sectionProps,
  type SectionKind,
} from "@/lib/calculators/knik";
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
  SourceLink,
} from "@/components/calculators/calc-ui";

const AT_LABEL = {
  nl: { load: "onder de last", tip: "bij de tip" },
  en: { load: "under the load", tip: "at the tip" },
};

const T = {
  nl: {
    heading: "Doorbuiging onder puntlast",
    intro:
      "Euler-Bernoulli balktheorie, één puntlast. Vrij opgelegd: a is de afstand van de last tot de linker oplegging. Uitkraging: a is de afstand van de last tot de inklemming (tip bij a = L). Rechthoek en koker rekenen met I_min (zwakke as).",
    beamType: "Balktype",
    section: "Doorsnede",
    span: "Overspanning / lengte L (mm)",
    loadPosition: "Positie last a (mm)",
    pointLoad: "Puntlast F (N)",
    material: "Materiaal",
    diameterD: "Diameter D (mm)",
    outerD: "Buitendiameter D (mm)",
    innerD: "Binnendiameter d (mm)",
    widthB: "Breedte b (mm)",
    heightH: "Hoogte h (mm)",
    sideA: "Zijde a (mm)",
    wallT: "Wanddikte t (mm)",
    fillDims: "Vul geldige afmetingen in voor de gekozen doorsnede.",
    fillSpan:
      "Vul een overspanning L en een lastpositie a in (0 < a < L voor vrij opgelegd, 0 < a ≤ L voor uitkraging).",
    deflection: (at: string) => `Doorbuiging δ (${at})`,
    moment: "Moment M_max",
    ratio: "L / δ",
    guidelinesTitle: "Richtwaarden toelaatbare doorbuiging",
    guidelinesNote:
      "Generieke vuistregels — controleer de toepasselijke norm voor de specifieke toepassing.",
    thRatio: "Verhouding",
    thUse: "Typische toepassing",
    source: "Engineering ToolBox — Beam deflection and stress",
  },
  en: {
    heading: "Deflection under point load",
    intro:
      "Euler-Bernoulli beam theory, one point load. Simply supported: a is the distance from the load to the left support. Cantilever: a is the distance from the load to the fixed support (tip at a = L). Rectangle and box section use I_min (weak axis).",
    beamType: "Beam type",
    section: "Cross-section",
    span: "Span / length L (mm)",
    loadPosition: "Load position a (mm)",
    pointLoad: "Point load F (N)",
    material: "Material",
    diameterD: "Diameter D (mm)",
    outerD: "Outer diameter D (mm)",
    innerD: "Inner diameter d (mm)",
    widthB: "Width b (mm)",
    heightH: "Height h (mm)",
    sideA: "Side a (mm)",
    wallT: "Wall thickness t (mm)",
    fillDims: "Enter valid dimensions for the selected cross-section.",
    fillSpan:
      "Enter a span L and a load position a (0 < a < L for simply supported, 0 < a ≤ L for cantilever).",
    deflection: (at: string) => `Deflection δ (${at})`,
    moment: "Moment M_max",
    ratio: "L / δ",
    guidelinesTitle: "Allowable deflection guidelines",
    guidelinesNote:
      "Generic rules of thumb — check the applicable standard for the specific application.",
    thRatio: "Ratio",
    thUse: "Typical use",
    source: "Engineering ToolBox — Beam deflection and stress",
  },
};

export function BeamDeflectionCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [beamType, setBeamType] = useState<BeamType>(
    (search.get("type") as BeamType) ?? "opgelegd",
  );
  const [sectionKind, setSectionKind] = useState<SectionKind>(
    (search.get("section") as SectionKind) ?? "rechthoek",
  );
  const [D, setD] = useState(search.get("D") ?? "20");
  const [dIn, setDIn] = useState(search.get("dIn") ?? "14");
  const [b, setB] = useState(search.get("b") ?? "40");
  const [h, setH] = useState(search.get("h") ?? "10");
  const [a, setA] = useState(search.get("a") ?? "10");
  const [t2, setT2] = useState(search.get("t") ?? "3");
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
    set("t", t2);
    set("L", L);
    set("posA", posA);
    set("f", force);
    next.set("material", materialId);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beamType, sectionKind, D, dIn, b, h, a, t2, L, posA, force, materialId]);

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
        return {
          b: parseNum(b) ?? undefined,
          h: parseNum(h) ?? undefined,
          t: parseNum(t2) ?? undefined,
        };
    }
  }, [sectionKind, D, dIn, b, h, a, t2]);

  const section = useMemo(() => sectionProps(sectionKind, dims), [sectionKind, dims]);
  const Lraw = parseNum(L);
  const posARaw = parseNum(posA);
  const Fraw = parseNum(force);
  const E = eFor(materialId);
  const material = MATERIALS_E.find((m) => m.id === materialId) ?? MATERIALS_E[0];
  const label = (x: { label: string; labelEn: string }) => (locale === "nl" ? x.label : x.labelEn);

  const result =
    section && Lraw != null && posARaw != null && Fraw != null
      ? computeBeam({ type: beamType, F: Fraw, L: Lraw, a: posARaw, E, I: section.I })
      : null;

  const ratio = result && result.deflection > 0 && Lraw ? Lraw / result.deflection : null;

  const copy = useMemo(() => {
    if (!result) return "";
    const beamLabel = BEAM_TYPES.find((bt) => bt.id === beamType);
    const beamLabelText = beamLabel ? label(beamLabel) : "";
    return [
      `${beamLabelText}, L=${L} mm, a=${posA} mm, F=${force} N, ${label(material)}`,
      `δ ${AT_LABEL[locale][result.at]} = ${fmtBeamNum(result.deflection, 3)} mm`,
      `M_max = ${fmtBeamNum(result.momentMax, 0)} N·mm`,
      ratio != null ? `L/δ ≈ ${fmtBeamNum(ratio, 0)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, beamType, L, posA, force, material, ratio, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.beamType}>
            <SelectInput value={beamType} onChange={(v) => setBeamType(v as BeamType)}>
              {BEAM_TYPES.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {label(bt)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.section}>
            <SelectInput value={sectionKind} onChange={(v) => setSectionKind(v as SectionKind)}>
              {SECTION_KINDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {label(s)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.span}>
            <NumInput id="beam-L" value={L} onChange={setL} />
          </Field>
          <Field label={t.loadPosition}>
            <NumInput id="beam-a" value={posA} onChange={setPosA} />
          </Field>
          <Field label={t.pointLoad}>
            <NumInput id="beam-force" value={force} onChange={setForce} />
          </Field>
          <Field label={t.material}>
            <SelectInput value={materialId} onChange={setMaterialId}>
              {MATERIALS_E.map((m) => (
                <option key={m.id} value={m.id}>
                  {label(m)}
                </option>
              ))}
            </SelectInput>
          </Field>

          {sectionKind === "rond" ? (
            <Field label={t.diameterD}>
              <NumInput id="beam-D" value={D} onChange={setD} />
            </Field>
          ) : null}
          {sectionKind === "buis" ? (
            <>
              <Field label={t.outerD}>
                <NumInput id="beam-D" value={D} onChange={setD} />
              </Field>
              <Field label={t.innerD}>
                <NumInput id="beam-d" value={dIn} onChange={setDIn} />
              </Field>
            </>
          ) : null}
          {sectionKind === "rechthoek" ? (
            <>
              <Field label={t.widthB}>
                <NumInput id="beam-b" value={b} onChange={setB} />
              </Field>
              <Field label={t.heightH}>
                <NumInput id="beam-h" value={h} onChange={setH} />
              </Field>
            </>
          ) : null}
          {sectionKind === "vierkant" ? (
            <Field label={t.sideA}>
              <NumInput id="beam-side" value={a} onChange={setA} />
            </Field>
          ) : null}
          {sectionKind === "koker" ? (
            <>
              <Field label={t.widthB}>
                <NumInput id="beam-koker-b" value={b} onChange={setB} />
              </Field>
              <Field label={t.heightH}>
                <NumInput id="beam-koker-h" value={h} onChange={setH} />
              </Field>
              <Field label={t.wallT}>
                <NumInput id="beam-koker-t" value={t2} onChange={setT2} />
              </Field>
            </>
          ) : null}
        </div>

        {!section ? (
          <p className="mt-5 text-sm text-muted">{t.fillDims}</p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">{t.fillSpan}</p>
        ) : (
          <>
            <ResultGrid
              items={
                [
                  {
                    label: t.deflection(AT_LABEL[locale][result.at]),
                    value: `${fmtBeamNum(result.deflection, 3)} mm`,
                  },
                  { label: t.moment, value: `${fmtBeamNum(result.momentMax, 0)} N·mm` },
                  { label: "I", value: `${fmtBeamNum(section.I, 0)} mm⁴` },
                  ratio != null ? { label: t.ratio, value: `≈ ${fmtBeamNum(ratio, 0)}` } : null,
                ].filter(Boolean) as { label: string; value: string }[]
              }
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>
      <SchemaPanel caption="Technisch schema · maten in mm · schematisch, niet op schaal">
        {result && Lraw != null && posARaw != null && Fraw != null && section ? (
          <BeamDeflection
            end={beamType === "opgelegd" ? "ss" : "cant"}
            L={Lraw}
            a={posARaw}
            P={Fraw}
            E={E}
            I={section.I}
          />
        ) : (
          <p>Vul geldige balkgegevens in om het schema te tonen.</p>
        )}
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.guidelinesTitle}
        </h2>
        <Note>{t.guidelinesNote}</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thRatio}</th>
                <th>{t.thUse}</th>
              </tr>
            </thead>
            <tbody>
              {DEFLECTION_GUIDELINES.map((g) => (
                <tr key={g.label}>
                  <th scope="row" className="normal-case">
                    {g.label}
                  </th>
                  <td>{locale === "nl" ? g.use : g.useEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/beam-deflection-stress-d_1312.html">
          {t.source}
        </SourceLink>
      </section>
    </>
  );
}
