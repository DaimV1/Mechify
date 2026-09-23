import { BeamDeflection, SchemaPanel } from "@/components/toolkit/schema";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BEAM_TYPES,
  bendingStress,
  computeBeam,
  DEFLECTION_GUIDELINES,
  fmtBeamNum,
  LOAD_KINDS,
  type BeamType,
  type LoadKind,
} from "@/lib/calculators/beam";
import {
  eFor,
  extremeFiber,
  MATERIALS_E,
  rp02For,
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
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";

const BEAM_META: EngineeringSourceMeta = {
  basisType: "physics",
  reference: "Euler-Bernoulli beam theory, one point load or one full-span UDL (Roark)",
  status: "current",
  checkedDate: "2026-09-17",
  assumptions: {
    nl: "Lineair-elastisch, kleine doorbuigingen. Eén enkele last per berekening — óf één puntlast óf één gelijkmatig verdeelde last over de volledige overspanning — geen combinaties of meerdere afzonderlijke lasten (superpositie). Oplegreacties zijn inbegrepen. Geen vervanging van een sterkteberekening volgens EN 1993-1-1 bij kritieke constructies.",
    en: "Linear-elastic, small deflections. One single load per calculation — either one point load or one full-span uniformly distributed load — no combinations or multiple separate loads (superposition). Support reactions are included. Not a substitute for a strength calculation per EN 1993-1-1 on critical structures.",
  },
};

const T = {
  nl: {
    heading: "Doorbuiging onder puntlast of verdeelde last",
    intro:
      "Euler-Bernoulli balktheorie, één puntlast óf één gelijkmatig verdeelde last over de volledige overspanning. Vrij opgelegd: a is de afstand van de puntlast tot de linker oplegging. Uitkraging: a is de afstand van de puntlast tot de inklemming (tip bij a = L). Toont zowel de doorbuiging onder de last als de werkelijke maximale doorbuiging (bij een niet-gecentreerde puntlast vallen die niet samen) en de oplegreacties.",
    loadKind: "Soort last",
    beamType: "Balktype",
    section: "Doorsnede",
    axis: "Buigas",
    axisWeak: "Zwakke as (I_min)",
    axisStrong: "Sterke as (I_max)",
    axisNote:
      "Een balk buigt om de as die je daadwerkelijk oplegt — meestal de sterke as (bijv. een rechtop staande plaat). De zwakke as is het conservatieve/knik-gedrag. Kies de as die overeenkomt met de werkelijke oriëntatie.",
    span: "Overspanning / lengte L (mm)",
    loadPosition: "Positie last a (mm)",
    pointLoad: "Puntlast F (N)",
    udlLoad: "Verdeelde last w (N/mm)",
    material: "Materiaal",
    diameterD: "Diameter D (mm)",
    outerD: "Buitendiameter D (mm)",
    innerD: "Binnendiameter d (mm)",
    widthB: "Breedte b (mm)",
    heightH: "Hoogte h (mm)",
    sideA: "Zijde a (mm)",
    wallT: "Wanddikte t (mm)",
    allowable: "Toelaatbare doorbuiging (mm, optioneel)",
    fillDims: "Vul geldige afmetingen in voor de gekozen doorsnede.",
    fillSpan:
      "Vul een overspanning L en een lastpositie a in (0 < a < L voor vrij opgelegd, 0 < a ≤ L voor uitkraging).",
    fillSpanUDL: "Vul een overspanning L groter dan 0 in.",
    deflectionAtLoad: "Doorbuiging onder de last δ(a)",
    deflectionMax: "Maximale doorbuiging δ_max",
    xMax: "Positie x (δ_max)",
    moment: "Moment M_max",
    sigmaMax: "σ_max",
    momentOfInertia: "Traagheidsmoment I",
    ratio: "L / δ_max",
    reactionA: "Oplegreactie A",
    reactionB: "Oplegreactie B",
    reactionFixed: "Reactie bij inklemming",
    reactionFree: "Reactie bij vrij uiteinde",
    sameNote:
      "Deze last staat op de plaats van de maximale doorbuiging (gecentreerd bij vrij opgelegd, of op de tip bij uitkraging), dus δ(a) en δ_max vallen hier samen.",
    overYieldNote: (sigma: string, rp02: string, material: string) =>
      `σ_max = ${sigma} N/mm² ≥ Rp0,2 ≈ ${rp02} N/mm² (${material}, richtwaarde) — deze last geeft blijvende vervorming; de doorbuiging hierboven is dan niet meer geldig.`,
    allowableFailNote: (max: string, allow: string) =>
      `δ_max = ${max} mm overschrijdt de opgegeven toelaatbare doorbuiging van ${allow} mm.`,
    allowablePassNote: (max: string, allow: string) =>
      `δ_max = ${max} mm blijft binnen de opgegeven toelaatbare doorbuiging van ${allow} mm.`,
    guidelinesTitle: "Richtwaarden toelaatbare doorbuiging",
    guidelinesNote:
      "Generieke vuistregels — controleer de toepasselijke norm voor de specifieke toepassing. Vul hierboven desgewenst een eigen, projectspecifieke toelaatbare doorbuiging in.",
    chainToBuckling: "Controleer deze doorsnede/materiaal op knik →",
    thRatio: "Verhouding",
    thUse: "Typische toepassing",
    source: "Engineering ToolBox — Beam deflection and stress",
    diagramFillPrompt: "Vul geldige balkgegevens in om het schema te tonen.",
    diagramUnavailableUDL:
      "Schematisch diagram is alleen beschikbaar voor een puntlast; de resultaten hierboven gelden wel voor de verdeelde last.",
  },
  en: {
    heading: "Deflection under point load or distributed load",
    intro:
      "Euler-Bernoulli beam theory, one point load or one uniformly distributed load over the full span. Simply supported: a is the distance from the point load to the left support. Cantilever: a is the distance from the point load to the fixed support (tip at a = L). Shows both the deflection at the load and the actual maximum deflection (for an off-centre point load these are not the same) and the support reactions.",
    loadKind: "Load type",
    beamType: "Beam type",
    section: "Cross-section",
    axis: "Bending axis",
    axisWeak: "Weak axis (I_min)",
    axisStrong: "Strong axis (I_max)",
    axisNote:
      "A beam bends about the axis it's actually loaded on — usually the strong axis (e.g. a plate standing on edge). The weak axis is the conservative/buckling-style behavior. Pick the axis that matches the real orientation.",
    span: "Span / length L (mm)",
    loadPosition: "Load position a (mm)",
    pointLoad: "Point load F (N)",
    udlLoad: "Distributed load w (N/mm)",
    material: "Material",
    diameterD: "Diameter D (mm)",
    outerD: "Outer diameter D (mm)",
    innerD: "Inner diameter d (mm)",
    widthB: "Width b (mm)",
    heightH: "Height h (mm)",
    sideA: "Side a (mm)",
    wallT: "Wall thickness t (mm)",
    allowable: "Allowable deflection (mm, optional)",
    fillDims: "Enter valid dimensions for the selected cross-section.",
    fillSpan:
      "Enter a span L and a load position a (0 < a < L for simply supported, 0 < a ≤ L for cantilever).",
    fillSpanUDL: "Enter a span L greater than 0.",
    deflectionAtLoad: "Deflection at the load δ(a)",
    deflectionMax: "Maximum deflection δ_max",
    xMax: "Position x (δ_max)",
    moment: "Moment M_max",
    sigmaMax: "σ_max",
    momentOfInertia: "Moment of inertia I",
    ratio: "L / δ_max",
    reactionA: "Support reaction A",
    reactionB: "Support reaction B",
    reactionFixed: "Reaction at the fixed support",
    reactionFree: "Reaction at the free end",
    sameNote:
      "This load sits at the location of maximum deflection (centred for simply supported, or at the tip for a cantilever), so δ(a) and δ_max coincide here.",
    overYieldNote: (sigma: string, rp02: string, material: string) =>
      `σ_max = ${sigma} N/mm² ≥ Rp0.2 ≈ ${rp02} N/mm² (${material}, indicative) — this load causes permanent deformation; the deflection above no longer applies.`,
    allowableFailNote: (max: string, allow: string) =>
      `δ_max = ${max} mm exceeds the specified allowable deflection of ${allow} mm.`,
    allowablePassNote: (max: string, allow: string) =>
      `δ_max = ${max} mm stays within the specified allowable deflection of ${allow} mm.`,
    guidelinesTitle: "Allowable deflection guidelines",
    guidelinesNote:
      "Generic rules of thumb — check the applicable standard for the specific application. Enter your own project-specific allowable deflection above if you have one.",
    chainToBuckling: "Check this section/material for buckling →",
    thRatio: "Ratio",
    thUse: "Typical use",
    source: "Engineering ToolBox — Beam deflection and stress",
    diagramFillPrompt: "Enter valid beam data to show the diagram.",
    diagramUnavailableUDL:
      "The schematic diagram is only available for a point load; the results above are still valid for the distributed load.",
  },
};

export function BeamDeflectionCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [beamType, setBeamType] = useState<BeamType>(
    (search.get("type") as BeamType) ?? "opgelegd",
  );
  const [loadKind, setLoadKind] = useState<LoadKind>(
    (search.get("loadKind") as LoadKind) ?? "puntlast",
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
  const [udl, setUdl] = useState(search.get("w") ?? "1");
  const [materialId, setMaterialId] = useState(search.get("material") ?? "staal");
  const [axis, setAxis] = useState<"weak" | "strong">(
    (search.get("axis") as "weak" | "strong") ?? "strong",
  );
  const [allowable, setAllowable] = useState(search.get("allow") ?? "");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    next.set("type", beamType);
    next.set("loadKind", loadKind);
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
    set("w", udl);
    next.set("material", materialId);
    next.set("axis", axis);
    set("allow", allowable);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    beamType,
    loadKind,
    sectionKind,
    D,
    dIn,
    b,
    h,
    a,
    t2,
    L,
    posA,
    force,
    udl,
    materialId,
    axis,
    allowable,
  ]);

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

  const axisApplies = sectionKind === "rechthoek" || sectionKind === "koker";
  const section = useMemo(
    () => sectionProps(sectionKind, dims, axisApplies ? axis : "weak"),
    [sectionKind, dims, axisApplies, axis],
  );
  const c = useMemo(
    () => extremeFiber(sectionKind, dims, axisApplies ? axis : "weak"),
    [sectionKind, dims, axisApplies, axis],
  );
  const Lraw = parseNum(L);
  const posARaw = parseNum(posA);
  const Fraw = parseNum(force);
  const udlRaw = parseNum(udl);
  const allowableRaw = parseNum(allowable);
  const E = eFor(materialId);
  const rp02 = rp02For(materialId);
  const material = MATERIALS_E.find((m) => m.id === materialId) ?? MATERIALS_E[0];
  const label = (x: { label: string; labelEn: string }) => (locale === "nl" ? x.label : x.labelEn);
  const isUDL = loadKind === "verdeeld";

  const result =
    section && Lraw != null && (isUDL ? udlRaw != null : posARaw != null && Fraw != null)
      ? isUDL
        ? computeBeam({ kind: "verdeeld", type: beamType, w: udlRaw!, L: Lraw, E, I: section.I })
        : computeBeam({ type: beamType, F: Fraw!, L: Lraw, a: posARaw!, E, I: section.I })
      : null;

  const sigma = result && c != null ? bendingStress(result.momentMax, c, section!.I) : null;
  const overYield = sigma != null && sigma > rp02;
  const sameLocation =
    result != null &&
    !isUDL &&
    Math.abs(result.deflectionAtLoad - result.deflectionMax) < 1e-9;
  const ratio = result && result.deflectionMax > 0 && Lraw ? Lraw / result.deflectionMax : null;
  const allowableOk =
    result != null && allowableRaw != null && allowableRaw > 0
      ? result.deflectionMax <= allowableRaw
      : null;
  const reactionALabel = isUDL || beamType === "opgelegd" ? t.reactionA : t.reactionFixed;
  const reactionBLabel = isUDL || beamType === "opgelegd" ? t.reactionB : t.reactionFree;

  const copy = useMemo(() => {
    if (!result) return "";
    const beamLabel = BEAM_TYPES.find((bt) => bt.id === beamType);
    const beamLabelText = beamLabel ? label(beamLabel) : "";
    const loadText = isUDL ? `w=${udl} N/mm` : `a=${posA} mm, F=${force} N`;
    return [
      `${beamLabelText}, L=${L} mm, ${loadText}, ${label(material)}, ${axisApplies ? (axis === "strong" ? t.axisStrong : t.axisWeak) : ""}`,
      isUDL ? "" : `δ(a) = ${fmtBeamNum(result.deflectionAtLoad, 3)} mm`,
      `δ_max = ${fmtBeamNum(result.deflectionMax, 3)} mm bij x=${fmtBeamNum(result.xMax, 0)} mm`,
      `M_max = ${fmtBeamNum(result.momentMax, 0)} N·mm`,
      `${reactionALabel} = ${fmtBeamNum(result.reactionA, 0)} N, ${reactionBLabel} = ${fmtBeamNum(result.reactionB, 0)} N`,
      sigma != null ? `σ_max = ${fmtBeamNum(sigma, 1)} N/mm²` : "",
      ratio != null ? `L/δ_max ≈ ${fmtBeamNum(ratio, 0)}` : "",
      allowableOk != null
        ? allowableOk
          ? t.allowablePassNote(fmtBeamNum(result.deflectionMax, 3), allowable)
          : t.allowableFailNote(fmtBeamNum(result.deflectionMax, 3), allowable)
        : "",
      metaCopyLine(BEAM_META, locale),
    ]
      .filter(Boolean)
      .join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    result,
    beamType,
    isUDL,
    L,
    posA,
    force,
    udl,
    material,
    ratio,
    sigma,
    allowableOk,
    allowable,
    reactionALabel,
    reactionBLabel,
    axis,
    axisApplies,
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
        <SourceMetaBadge meta={BEAM_META} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.loadKind}>
            <SelectInput value={loadKind} onChange={(v) => setLoadKind(v as LoadKind)}>
              {LOAD_KINDS.map((lk) => (
                <option key={lk.id} value={lk.id}>
                  {label(lk)}
                </option>
              ))}
            </SelectInput>
          </Field>
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
          {isUDL ? (
            <Field label={t.udlLoad}>
              <NumInput id="beam-udl" value={udl} onChange={setUdl} />
            </Field>
          ) : (
            <>
              <Field label={t.loadPosition}>
                <NumInput id="beam-a" value={posA} onChange={setPosA} />
              </Field>
              <Field label={t.pointLoad}>
                <NumInput id="beam-force" value={force} onChange={setForce} />
              </Field>
            </>
          )}
          <Field label={t.material}>
            <SelectInput value={materialId} onChange={setMaterialId}>
              {MATERIALS_E.map((m) => (
                <option key={m.id} value={m.id}>
                  {label(m)}
                </option>
              ))}
            </SelectInput>
          </Field>
          {axisApplies ? (
            <Field label={t.axis}>
              <SelectInput value={axis} onChange={(v) => setAxis(v as "weak" | "strong")}>
                <option value="strong">{t.axisStrong}</option>
                <option value="weak">{t.axisWeak}</option>
              </SelectInput>
            </Field>
          ) : null}
          <Field label={t.allowable}>
            <NumInput id="beam-allowable" value={allowable} onChange={setAllowable} />
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
        {axisApplies ? <p className="mt-2 text-xs text-subtle">{t.axisNote}</p> : null}

        {!section ? (
          <p className="mt-5 text-sm text-muted" role="status">
            {t.fillDims}
          </p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted" role="status">
            {isUDL ? t.fillSpanUDL : t.fillSpan}
          </p>
        ) : (
          <>
            <ResultGrid
              items={
                [
                  isUDL
                    ? null
                    : {
                        label: t.deflectionAtLoad,
                        value: `${fmtBeamNum(result.deflectionAtLoad, 3)} mm`,
                      },
                  { label: t.deflectionMax, value: `${fmtBeamNum(result.deflectionMax, 3)} mm` },
                  { label: t.xMax, value: `${fmtBeamNum(result.xMax, 0)} mm` },
                  { label: t.moment, value: `${fmtBeamNum(result.momentMax, 0)} N·mm` },
                  { label: reactionALabel, value: `${fmtBeamNum(result.reactionA, 0)} N` },
                  { label: reactionBLabel, value: `${fmtBeamNum(result.reactionB, 0)} N` },
                  sigma != null
                    ? { label: t.sigmaMax, value: `${fmtBeamNum(sigma, 1)} N/mm²` }
                    : null,
                  { label: t.momentOfInertia, value: `${fmtBeamNum(section.I, 0)} mm⁴` },
                  ratio != null ? { label: t.ratio, value: `≈ ${fmtBeamNum(ratio, 0)}` } : null,
                ].filter(Boolean) as { label: string; value: string }[]
              }
            />
            {sameLocation ? (
              <p className="mt-3 text-sm leading-relaxed text-muted" role="status">
                {t.sameNote}
              </p>
            ) : null}
            {overYield ? (
              <p className="mt-3 text-sm leading-relaxed text-muted" role="status">
                {t.overYieldNote(fmtBeamNum(sigma ?? 0, 1), fmtBeamNum(rp02, 0), label(material))}
              </p>
            ) : null}
            {allowableOk != null ? (
              <p className="mt-3 text-sm leading-relaxed text-muted" role="status">
                {allowableOk
                  ? t.allowablePassNote(fmtBeamNum(result.deflectionMax, 3), allowable)
                  : t.allowableFailNote(fmtBeamNum(result.deflectionMax, 3), allowable)}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
            <p className="mt-3 text-sm">
              <Link
                to={`/calculators/buckling?section=${sectionKind}&D=${D}&dIn=${dIn}&b=${b}&h=${h}&a=${a}&t=${t2}&material=${materialId}`}
                className="text-accent hover:underline"
              >
                {t.chainToBuckling}
              </Link>
            </p>
          </>
        )}
      </CalcPanel>
      <SchemaPanel caption="Technisch schema · maten in mm · schematisch, niet op schaal">
        {isUDL ? (
          <p>{t.diagramUnavailableUDL}</p>
        ) : result && Lraw != null && posARaw != null && Fraw != null && section ? (
          <BeamDeflection
            end={beamType === "opgelegd" ? "ss" : "cant"}
            L={Lraw}
            a={posARaw}
            P={Fraw}
            E={E}
            I={section.I}
          />
        ) : (
          <p>{t.diagramFillPrompt}</p>
        )}
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.guidelinesTitle}
        </h2>
        <Note>{t.guidelinesNote}</Note>
        <div className="table-scroll mt-4" tabIndex={0}>
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
