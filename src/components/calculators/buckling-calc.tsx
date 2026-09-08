import { BucklingModes, SchemaPanel } from "@/components/toolkit/schema";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  columnCapacity,
  copyLine,
  END_CONDITIONS,
  eFor,
  fmtDotComma,
  fmtN,
  kDesignFor,
  lambdaLimit,
  MATERIALS_E,
  rp02For,
  SECTION_KINDS,
  sectionProps,
  type EndConditionId,
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

const T = {
  nl: {
    heading: "Euler-knik van een staaf",
    intro:
      "Kritieke knikkracht F_cr = π² E I / L_eff². Rechthoek en koker rekenen met I_min (de zwakke as) — die knikt eerst. Ideale Euler-theorie: geen initiële kromming, geen partiële veiligheidsfactoren. Geen vervanging van EN 1993-1-1 bij kritieke constructies.",
    lengthLabel: "Lengte L (mm)",
    endConditionLabel: "Inklemming",
    sectionLabel: "Doorsnede",
    materialLabel: "Materiaal",
    diameterD: "Diameter D (mm)",
    outerD: "Buitendiameter D (mm)",
    innerD: "Binnendiameter d (mm)",
    widthB: "Breedte b (mm)",
    heightH: "Hoogte h (mm)",
    sideA: "Zijde a (mm)",
    wallT: "Wanddikte t (mm)",
    optionalAxial: "Optioneel: axiale last",
    axialForce: "Axiale last F (N)",
    axialNote: "Ingevuld: S = F_cr / F wordt getoond. Leeg: alleen F_cr en σ_cr.",
    fillValidDims: "Vul geldige afmetingen in voor de gekozen doorsnede.",
    fillLength: "Vul een lengte groter dan 0 in.",
    resultI: "I",
    resultA: "A",
    resultI2: "i",
    resultLeff: "L_eff",
    resultLambda: "λ",
    resultFcrBuckle: "F_cr (plooilast)",
    resultFcrEuler: "F_cr (Euler)",
    resultSigmaCr: "σ_cr",
    resultS: "S",
    unsafeNote: "F ≥ F_cr — bij deze last knikt de staaf volgens Euler. S < 1.",
    lowLambdaNote: (
      lambda: string,
      limit: string,
      material: string,
      squash: string,
      euler: string,
    ) => (
      <>
        λ = {lambda} ligt onder λ_grens = {limit} voor {material} (π√(E/Rp0,2)). Euler geldt hier
        niet: de staaf plooit/vloeit voordat hij knikt. F_cr hierboven is daarom de plooilast
        A·Rp0,2 = {squash} N, niet de Euler-last ({euler} N — fors hoger, en niet haalbaar). Tussen
        beide regimes is Tetmajer of de Johnson-parabool nauwkeuriger dan deze harde overgang.
      </>
    ),
    casesTitle: "Knikgevallen (Euler)",
    casesNote:
      "k is de theoretische waarde; k (ontwerp) is de gangbare, conservatievere ontwerpwaarde (AISC/Shigley) — volledig starre inklemming bestaat niet in de praktijk.",
    thEndCondition: "Inklemming",
    thKDesign: "k (ontwerp)",
    thLeff: "L_eff",
    sourceEuler: "Engineering ToolBox — Euler column formula",
    modulusTitle: "E-modulus (indicatief)",
    modulusNote:
      "Richtwaarden. Aluminium is expliciet 6082-T6 (harde temper); zacht/gegloeid aluminium vloeit al bij 30-100 N/mm², wat λ_grens flink verlaagt. Voor een specifieke legering of kwaliteit: materiaalcertificaat of norm nalopen.",
    thMaterial: "Materiaal",
    thE: "E (N/mm²)",
    sourceModulus: "Engineering ToolBox — Young's modulus of elasticity",
  },
  en: {
    heading: "Euler buckling of a column",
    intro:
      "Critical buckling load F_cr = π² E I / L_eff². Rectangle and box section use I_min (the weak axis) — that buckles first. Ideal Euler theory: no initial curvature, no partial safety factors. Not a substitute for EN 1993-1-1 on critical structures.",
    lengthLabel: "Length L (mm)",
    endConditionLabel: "End condition",
    sectionLabel: "Cross-section",
    materialLabel: "Material",
    diameterD: "Diameter D (mm)",
    outerD: "Outer diameter D (mm)",
    innerD: "Inner diameter d (mm)",
    widthB: "Width b (mm)",
    heightH: "Height h (mm)",
    sideA: "Side a (mm)",
    wallT: "Wall thickness t (mm)",
    optionalAxial: "Optional: axial load",
    axialForce: "Axial load F (N)",
    axialNote: "If filled in: S = F_cr / F is shown. Empty: only F_cr and σ_cr.",
    fillValidDims: "Enter valid dimensions for the selected cross-section.",
    fillLength: "Enter a length greater than 0.",
    resultI: "I",
    resultA: "A",
    resultI2: "i",
    resultLeff: "L_eff",
    resultLambda: "λ",
    resultFcrBuckle: "F_cr (squash load)",
    resultFcrEuler: "F_cr (Euler)",
    resultSigmaCr: "σ_cr",
    resultS: "S",
    unsafeNote: "F ≥ F_cr — at this load the bar buckles per Euler. S < 1.",
    lowLambdaNote: (
      lambda: string,
      limit: string,
      material: string,
      squash: string,
      euler: string,
    ) => (
      <>
        λ = {lambda} is below λ_limit = {limit} for {material} (π√(E/Rp0.2)). Euler doesn't apply
        here: the bar squashes/yields before it buckles. F_cr above is therefore the squash load
        A·Rp0.2 = {squash} N, not the Euler load ({euler} N — far higher, and not achievable).
        Between the two regimes, Tetmajer or the Johnson parabola is more accurate than this hard
        transition.
      </>
    ),
    casesTitle: "Buckling cases (Euler)",
    casesNote:
      "k is the theoretical value; k (design) is the common, more conservative design value (AISC/Shigley) — fully rigid clamping doesn't exist in practice.",
    thEndCondition: "End condition",
    thKDesign: "k (design)",
    thLeff: "L_eff",
    sourceEuler: "Engineering ToolBox — Euler column formula",
    modulusTitle: "Young's modulus (indicative)",
    modulusNote:
      "Indicative values. Aluminium is explicitly 6082-T6 (a hard temper); soft/annealed aluminium already yields at 30-100 N/mm², which lowers λ_limit considerably. For a specific alloy or grade: check the material certificate or standard.",
    thMaterial: "Material",
    thE: "E (N/mm²)",
    sourceModulus: "Engineering ToolBox — Young's modulus of elasticity",
  },
};

export function BucklingCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [sectionKind, setSectionKind] = useState<SectionKind>(
    (search.get("section") as SectionKind) ?? "rond",
  );
  const [D, setD] = useState(search.get("D") ?? "20");
  const [dIn, setDIn] = useState(search.get("dIn") ?? "14");
  const [b, setB] = useState(search.get("b") ?? "40");
  const [h, setH] = useState(search.get("h") ?? "10");
  const [a, setA] = useState(search.get("a") ?? "10");
  const [t2, setT2] = useState(search.get("t") ?? "3");
  const [L, setL] = useState(search.get("L") ?? "1000");
  const [endCondition, setEndCondition] = useState<EndConditionId>(
    (search.get("end") as EndConditionId) ?? "hh",
  );
  const [materialId, setMaterialId] = useState(search.get("material") ?? "rvs");
  const [F, setF] = useState(search.get("F") ?? "");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    next.set("section", sectionKind);
    set("D", D);
    set("dIn", dIn);
    set("b", b);
    set("h", h);
    set("a", a);
    set("t", t2);
    set("L", L);
    next.set("end", endCondition);
    next.set("material", materialId);
    set("F", F);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKind, D, dIn, b, h, a, t2, L, endCondition, materialId, F]);

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
  const Fraw = parseNum(F);
  const k = kDesignFor(endCondition);
  const E = eFor(materialId);
  const material = MATERIALS_E.find((m) => m.id === materialId) ?? MATERIALS_E[0];
  const endLabel = END_CONDITIONS.find((c) => c.id === endCondition);
  const label = (x: { label: string; labelEn: string }) => (locale === "nl" ? x.label : x.labelEn);

  const result =
    section && Lraw != null
      ? columnCapacity({
          L: Lraw,
          k,
          E,
          I: section.I,
          A: section.A,
          F: Fraw,
          rp02: rp02For(materialId),
        })
      : null;

  const copy = useMemo(
    () => (result && endLabel ? copyLine(result, label(endLabel)) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result, endLabel, locale],
  );

  const lambdaWarn = lambdaLimit(E, rp02For(materialId));
  const lowLambda = result != null && result.lambda < lambdaWarn;
  const unsafe = result?.safety != null && result.safety < 1;

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.lengthLabel}>
            <NumInput id="knik-length" value={L} onChange={setL} />
          </Field>
          <Field label={t.endConditionLabel}>
            <SelectInput
              value={endCondition}
              onChange={(v) => setEndCondition(v as EndConditionId)}
            >
              {END_CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {label(c)} (k={fmtDotComma(c.kDesign, 3).replace(/,?0+$/, "")})
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.sectionLabel}>
            <SelectInput value={sectionKind} onChange={(v) => setSectionKind(v as SectionKind)}>
              {SECTION_KINDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {label(s)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.materialLabel}>
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
              <NumInput id="knik-D" value={D} onChange={setD} />
            </Field>
          ) : null}
          {sectionKind === "buis" ? (
            <>
              <Field label={t.outerD}>
                <NumInput id="knik-D" value={D} onChange={setD} />
              </Field>
              <Field label={t.innerD}>
                <NumInput id="knik-d" value={dIn} onChange={setDIn} />
              </Field>
            </>
          ) : null}
          {sectionKind === "rechthoek" ? (
            <>
              <Field label={t.widthB}>
                <NumInput id="knik-b" value={b} onChange={setB} />
              </Field>
              <Field label={t.heightH}>
                <NumInput id="knik-h" value={h} onChange={setH} />
              </Field>
            </>
          ) : null}
          {sectionKind === "vierkant" ? (
            <Field label={t.sideA}>
              <NumInput id="knik-a" value={a} onChange={setA} />
            </Field>
          ) : null}
          {sectionKind === "koker" ? (
            <>
              <Field label={t.widthB}>
                <NumInput id="knik-koker-b" value={b} onChange={setB} />
              </Field>
              <Field label={t.heightH}>
                <NumInput id="knik-koker-h" value={h} onChange={setH} />
              </Field>
              <Field label={t.wallT}>
                <NumInput id="knik-koker-t" value={t2} onChange={setT2} />
              </Field>
            </>
          ) : null}
        </div>

        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            {t.optionalAxial}
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={t.axialForce}>
              <NumInput id="knik-force" value={F} onChange={setF} />
            </Field>
          </div>
          <Note>{t.axialNote}</Note>
        </details>

        {section ? (
          result ? (
            <>
              <p className="mt-5 text-sm text-muted">
                {endLabel ? label(endLabel) : ""} · {label(material)} · E = {fmtN(E)} N/mm²
              </p>
              <ResultGrid
                items={
                  [
                    { label: t.resultI, value: `${fmtN(result.I)} mm⁴` },
                    { label: t.resultA, value: `${fmtN(result.A)} mm²` },
                    { label: t.resultI2, value: `${fmtDotComma(result.i, 1)} mm` },
                    { label: t.resultLeff, value: `${fmtN(result.Leff)} mm` },
                    { label: t.resultLambda, value: fmtDotComma(result.lambda, 1) },
                    {
                      label: result.governing === "plooien" ? t.resultFcrBuckle : t.resultFcrEuler,
                      value: `${fmtN(result.Fcr)} N`,
                    },
                    { label: t.resultSigmaCr, value: `${fmtDotComma(result.sigmaCr, 1)} N/mm²` },
                    result.safety != null
                      ? { label: t.resultS, value: fmtDotComma(result.safety, 2) }
                      : null,
                  ].filter(Boolean) as { label: string; value: string }[]
                }
              />
              {unsafe ? (
                <Note>{t.unsafeNote}</Note>
              ) : lowLambda ? (
                <Note>
                  {t.lowLambdaNote(
                    fmtDotComma(result.lambda, 1),
                    fmtDotComma(lambdaWarn, 0),
                    label(material),
                    fmtN(result.squashLoad),
                    fmtN((Math.PI ** 2 * E * result.I) / result.Leff ** 2),
                  )}
                </Note>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <CopyResult text={copy} />
                <CopyLink />
              </div>
            </>
          ) : (
            <p className="mt-5 text-sm text-muted">{t.fillLength}</p>
          )
        ) : (
          <p className="mt-5 text-sm text-muted">{t.fillValidDims}</p>
        )}
      </CalcPanel>
      <SchemaPanel caption="Technisch schema · maten in mm · schematisch, niet op schaal">
        <BucklingModes active={endCondition} />
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.casesTitle}
        </h2>
        <Note>{t.casesNote}</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thEndCondition}</th>
                <th>k</th>
                <th>{t.thKDesign}</th>
                <th>{t.thLeff}</th>
              </tr>
            </thead>
            <tbody>
              {END_CONDITIONS.map((c) => (
                <tr key={c.id} className={c.id === endCondition ? "is-active" : ""}>
                  <th scope="row">{label(c)}</th>
                  <td>{fmtDotComma(c.k, 3).replace(/,?0+$/, "")}</td>
                  <td>{fmtDotComma(c.kDesign, 2).replace(/,?0+$/, "")}</td>
                  <td>k · L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/euler-column-formula-d_1813.html">
          {t.sourceEuler}
        </SourceLink>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.modulusTitle}
        </h2>
        <Note>{t.modulusNote}</Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thMaterial}</th>
                <th>{t.thE}</th>
              </tr>
            </thead>
            <tbody>
              {MATERIALS_E.map((m) => (
                <tr key={m.id} className={m.id === materialId ? "is-active" : ""}>
                  <th scope="row">{label(m)}</th>
                  <td>{fmtN(m.E)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/young-modulus-d_417.html">
          {t.sourceModulus}
        </SourceLink>
      </section>
    </>
  );
}
