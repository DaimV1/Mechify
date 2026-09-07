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

export function BucklingCalc() {
  const [search, setSearch] = useSearchParams();
  const [sectionKind, setSectionKind] = useState<SectionKind>((search.get("section") as SectionKind) ?? "rond");
  const [D, setD] = useState(search.get("D") ?? "20");
  const [dIn, setDIn] = useState(search.get("dIn") ?? "14");
  const [b, setB] = useState(search.get("b") ?? "40");
  const [h, setH] = useState(search.get("h") ?? "10");
  const [a, setA] = useState(search.get("a") ?? "10");
  const [t, setT] = useState(search.get("t") ?? "3");
  const [L, setL] = useState(search.get("L") ?? "1000");
  const [endCondition, setEndCondition] = useState<EndConditionId>((search.get("end") as EndConditionId) ?? "hh");
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
    set("t", t);
    set("L", L);
    next.set("end", endCondition);
    next.set("material", materialId);
    set("F", F);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKind, D, dIn, b, h, a, t, L, endCondition, materialId, F]);

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
  const Fraw = parseNum(F);
  const k = kDesignFor(endCondition);
  const E = eFor(materialId);
  const material = MATERIALS_E.find((m) => m.id === materialId) ?? MATERIALS_E[0];
  const endLabel = END_CONDITIONS.find((c) => c.id === endCondition);

  const result =
    section && Lraw != null
      ? columnCapacity({ L: Lraw, k, E, I: section.I, A: section.A, F: Fraw, rp02: rp02For(materialId) })
      : null;

  const copy = useMemo(
    () => (result && endLabel ? copyLine(result, endLabel.label) : ""),
    [result, endLabel],
  );

  const lambdaWarn = lambdaLimit(E, rp02For(materialId));
  const lowLambda = result != null && result.lambda < lambdaWarn;
  const unsafe = result?.safety != null && result.safety < 1;

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Euler-knik van een staaf</h2>
        <Note>
          Kritieke knikkracht F_cr = π² E I / L_eff². Rechthoek en koker rekenen met I_min (de zwakke as) — die
          knikt eerst. Ideale Euler-theorie: geen initiële kromming, geen partiële veiligheidsfactoren. Geen
          vervanging van EN 1993-1-1 bij kritieke constructies.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Lengte L (mm)">
            <NumInput id="knik-length" value={L} onChange={setL} />
          </Field>
          <Field label="Inklemming">
            <SelectInput value={endCondition} onChange={(v) => setEndCondition(v as EndConditionId)}>
              {END_CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} (k={fmtDotComma(c.kDesign, 3).replace(/,?0+$/, "")})
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
              <NumInput id="knik-D" value={D} onChange={setD} />
            </Field>
          ) : null}
          {sectionKind === "buis" ? (
            <>
              <Field label="Buitendiameter D (mm)">
                <NumInput id="knik-D" value={D} onChange={setD} />
              </Field>
              <Field label="Binnendiameter d (mm)">
                <NumInput id="knik-d" value={dIn} onChange={setDIn} />
              </Field>
            </>
          ) : null}
          {sectionKind === "rechthoek" ? (
            <>
              <Field label="Breedte b (mm)">
                <NumInput id="knik-b" value={b} onChange={setB} />
              </Field>
              <Field label="Hoogte h (mm)">
                <NumInput id="knik-h" value={h} onChange={setH} />
              </Field>
            </>
          ) : null}
          {sectionKind === "vierkant" ? (
            <Field label="Zijde a (mm)">
              <NumInput id="knik-a" value={a} onChange={setA} />
            </Field>
          ) : null}
          {sectionKind === "koker" ? (
            <>
              <Field label="Breedte b (mm)">
                <NumInput id="knik-koker-b" value={b} onChange={setB} />
              </Field>
              <Field label="Hoogte h (mm)">
                <NumInput id="knik-koker-h" value={h} onChange={setH} />
              </Field>
              <Field label="Wanddikte t (mm)">
                <NumInput id="knik-koker-t" value={t} onChange={setT} />
              </Field>
            </>
          ) : null}
        </div>

        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-ink">Optioneel: axiale last</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Axiale last F (N)">
              <NumInput id="knik-force" value={F} onChange={setF} />
            </Field>
          </div>
          <Note>Ingevuld: S = F_cr / F wordt getoond. Leeg: alleen F_cr en σ_cr.</Note>
        </details>

        {section ? (
          result ? (
            <>
              <p className="mt-5 text-sm text-muted">
                {endLabel?.label ?? ""} · {material.label} · E = {fmtN(E)} N/mm²
              </p>
              <ResultGrid
                items={[
                  { label: "I", value: `${fmtN(result.I)} mm⁴` },
                  { label: "A", value: `${fmtN(result.A)} mm²` },
                  { label: "i", value: `${fmtDotComma(result.i, 1)} mm` },
                  { label: "L_eff", value: `${fmtN(result.Leff)} mm` },
                  { label: "λ", value: fmtDotComma(result.lambda, 1) },
                  {
                    label: result.governing === "plooien" ? "F_cr (plooilast)" : "F_cr (Euler)",
                    value: `${fmtN(result.Fcr)} N`,
                  },
                  { label: "σ_cr", value: `${fmtDotComma(result.sigmaCr, 1)} N/mm²` },
                  result.safety != null ? { label: "S", value: fmtDotComma(result.safety, 2) } : null,
                ].filter(Boolean) as { label: string; value: string }[]}
              />
              {unsafe ? (
                <Note>F ≥ F_cr — bij deze last knikt de staaf volgens Euler. S &lt; 1.</Note>
              ) : lowLambda ? (
                <Note>
                  λ = {fmtDotComma(result.lambda, 1)} ligt onder λ_grens = {fmtDotComma(lambdaWarn, 0)} voor{" "}
                  {material.label} (π√(E/Rp0,2)). Euler geldt hier niet: de staaf plooit/vloeit voordat hij knikt.
                  F_cr hierboven is daarom de plooilast A·Rp0,2 = {fmtN(result.squashLoad)} N, niet de Euler-last
                  ({fmtN((Math.PI ** 2 * E * result.I) / result.Leff ** 2)} N — fors hoger, en niet haalbaar).
                  Tussen beide regimes is Tetmajer of de Johnson-parabool nauwkeuriger dan deze harde overgang.
                </Note>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <CopyResult text={copy} />
                <CopyLink />
              </div>
            </>
          ) : (
            <p className="mt-5 text-sm text-muted">Vul een lengte groter dan 0 in.</p>
          )
        ) : (
          <p className="mt-5 text-sm text-muted">Vul geldige afmetingen in voor de gekozen doorsnede.</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Knikgevallen (Euler)</h2>
        <Note>
          k is de theoretische waarde; k (ontwerp) is de gangbare, conservatievere ontwerpwaarde (AISC/Shigley) —
          volledig starre inklemming bestaat niet in de praktijk.
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Inklemming</th>
                <th>k</th>
                <th>k (ontwerp)</th>
                <th>L_eff</th>
              </tr>
            </thead>
            <tbody>
              {END_CONDITIONS.map((c) => (
                <tr key={c.id} className={c.id === endCondition ? "is-active" : ""}>
                  <th scope="row">{c.label}</th>
                  <td>{fmtDotComma(c.k, 3).replace(/,?0+$/, "")}</td>
                  <td>{fmtDotComma(c.kDesign, 2).replace(/,?0+$/, "")}</td>
                  <td>k · L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/euler-column-formula-d_1813.html">
          Engineering ToolBox — Euler column formula
        </SourceLink>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">E-modulus (indicatief)</h2>
        <Note>
          Richtwaarden. Aluminium is expliciet 6082-T6 (harde temper); zacht/gegloeid aluminium vloeit al bij
          30-100 N/mm², wat λ_grens flink verlaagt. Voor een specifieke legering of kwaliteit: materiaalcertificaat
          of norm nalopen.
        </Note>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Materiaal</th>
                <th>E (N/mm²)</th>
              </tr>
            </thead>
            <tbody>
              {MATERIALS_E.map((m) => (
                <tr key={m.id} className={m.id === materialId ? "is-active" : ""}>
                  <th scope="row">{m.label}</th>
                  <td>{fmtN(m.E)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/young-modulus-d_417.html">
          Engineering ToolBox — Young's modulus of elasticity
        </SourceLink>
      </section>
    </>
  );
}
