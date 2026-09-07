import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ALL_BORES,
  extendForce,
  fmtN0,
  minBoreFor,
  retractForce,
} from "@/lib/calculators/pneumatic";
import {
  columnCapacity,
  eFor,
  END_CONDITIONS,
  fmtDotComma,
  kDesignFor,
  MATERIALS_E,
  rp02For,
  sectionProps,
  type EndConditionId,
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
  SourceBadge,
  SourceLink,
} from "@/components/calculators/calc-ui";

export function PneumaticCylinderCalc() {
  const [search, setSearch] = useSearchParams();
  const [force, setForce] = useState(search.get("f") ?? "1000");
  const [pressure, setPressure] = useState(search.get("p") ?? "6");
  const [stroke, setStroke] = useState(search.get("l") ?? "300");
  const [endCondition, setEndCondition] = useState<EndConditionId>((search.get("end") as EndConditionId) ?? "fc");
  const [materialId, setMaterialId] = useState(search.get("material") ?? "staal");
  const [showBuckling, setShowBuckling] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    set("f", force);
    set("p", pressure);
    set("l", stroke);
    next.set("end", endCondition);
    next.set("material", materialId);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [force, pressure, stroke, endCondition, materialId]);

  const F = parseNum(force);
  const p = parseNum(pressure);
  const L = parseNum(stroke);

  const recommended = F != null && p != null && F > 0 && p > 0 ? minBoreFor(F, p) : null;
  const rod = recommended?.rods[0];

  const buckling = useMemo(() => {
    if (!recommended || rod == null || L == null || !(L > 0) || F == null) return null;
    const section = sectionProps("rond", { D: rod });
    if (!section) return null;
    return columnCapacity({
      L,
      k: kDesignFor(endCondition),
      E: eFor(materialId),
      I: section.I,
      A: section.A,
      F,
      rp02: rp02For(materialId),
    });
  }, [recommended, rod, L, F, endCondition, materialId]);

  const copy = useMemo(() => {
    if (!recommended || F == null || p == null) return "";
    const extend = extendForce(recommended.bore, p);
    const lines = [
      `Last ${fmtN0(F)} N bij ${p} bar`,
      `Aanbevolen boring: Ø${recommended.bore} mm (${recommended.series})`,
      `Zuigerstang Ø${rod} mm`,
      `Uittrekkracht ${fmtN0(extend)} N`,
    ];
    if (buckling) lines.push(`Uitknik zuigerstang: F_cr = ${fmtN0(buckling.Fcr)} N, S = ${fmtDotComma(buckling.safety ?? 0, 2)}`);
    return lines.join("\n");
  }, [recommended, F, p, rod, buckling]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">ISO-boring bij een last</h2>
        <Note>
          F = p · A, dubbelwerkende cilinder. Zoekt de kleinste standaard boring (ISO 15552 / ISO 6432) waarvan de
          uittrekkracht de opgegeven last haalt — zonder marge. Reken zelf een veiligheidsfactor voor
          leidingverlies, wrijving en versnelling.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Benodigde kracht F (N)">
            <NumInput id="pneu-force" value={force} onChange={setForce} />
          </Field>
          <Field label="Werkdruk p (bar)">
            <NumInput id="pneu-pressure" value={pressure} onChange={setPressure} />
          </Field>
        </div>

        {F == null || p == null || F <= 0 || p <= 0 ? (
          <p className="mt-5 text-sm text-muted">Vul een kracht en druk groter dan 0 in.</p>
        ) : !recommended ? (
          <p className="mt-5 text-sm text-muted">
            Geen standaard boring tot Ø320 mm haalt deze kracht bij {p} bar. Verhoog de druk of gebruik een
            meercilinder-opstelling.
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              {recommended.series} · Ø{recommended.bore} mm · zuigerstang Ø{rod} mm
            </p>
            <ResultGrid
              items={[
                { label: "Aanbevolen boring", value: `Ø${recommended.bore} mm` },
                { label: "Zuigerstang", value: `Ø${rod} mm` },
                { label: "Uittrekkracht", value: `${fmtN0(extendForce(recommended.bore, p))} N` },
                rod != null
                  ? { label: "Intrekkracht", value: `${fmtN0(retractForce(recommended.bore, rod, p))} N` }
                  : null,
              ].filter(Boolean) as { label: string; value: string }[]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>

            <button
              type="button"
              onClick={() => setShowBuckling((s) => !s)}
              className="mt-6 text-sm font-medium text-ink underline decoration-border-strong underline-offset-4 hover:decoration-ink"
            >
              {showBuckling ? "Verberg uitknikcontrole zuigerstang" : "Uitknikcontrole zuigerstang (optioneel)"}
            </button>
            {showBuckling ? (
              <div className="mt-4 rounded-lg border border-border bg-bg p-4">
                <Note>
                  Indicatieve Euler-controle van de zuigerstang bij volledig uitgeschoven positie, met dezelfde
                  rekenkern als de knikberekening. Fabrikant-selectietabellen (Festo/SMC) houden ook rekening met
                  speling in de geleiding en een grotere veiligheidsfactor (doorgaans 3,5–5×) — gebruik die voor de
                  uiteindelijke keuze.
                </Note>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Uitgeschoven lengte L (mm)">
                    <NumInput id="pneu-stroke" value={stroke} onChange={setStroke} />
                  </Field>
                  <Field label="Inklemming">
                    <SelectInput value={endCondition} onChange={(v) => setEndCondition(v as EndConditionId)}>
                      {END_CONDITIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field label="Materiaal zuigerstang">
                    <SelectInput value={materialId} onChange={setMaterialId}>
                      {MATERIALS_E.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                {buckling ? (
                  <>
                    <ResultGrid
                      items={[
                        { label: "F_cr", value: `${fmtN0(buckling.Fcr)} N` },
                        { label: "S = F_cr / F", value: fmtDotComma(buckling.safety ?? 0, 2) },
                        { label: "λ", value: fmtDotComma(buckling.lambda, 1) },
                      ]}
                    />
                    {buckling.safety != null && buckling.safety < 3.5 ? (
                      <Note>
                        S = {fmtDotComma(buckling.safety, 2)} ligt onder de gangbare fabrikant-marge van 3,5–5× voor
                        pneumatische zuigerstangen. Kies een dikkere stang, een kortere slag, of een grotere boring.
                      </Note>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-4 text-sm text-muted">Vul een lengte groter dan 0 in.</p>
                )}
              </div>
            ) : null}
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Standaard boringen</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Reeks</th>
                <th>Boring</th>
                <th>Zuigerstang</th>
                <th>Uittrekkracht @ {pressure || "6"} bar</th>
              </tr>
            </thead>
            <tbody>
              {ALL_BORES.map((row) => {
                const pVal = parseNum(pressure) ?? 6;
                const isActive = recommended?.bore === row.bore && recommended.series === row.series;
                return (
                  <tr key={`${row.series}-${row.bore}`} className={isActive ? "is-active" : ""}>
                    <th scope="row" className="normal-case">
                      {row.series}
                    </th>
                    <td>Ø{row.bore} mm</td>
                    <td>Ø{row.rods.join(" / ")} mm</td>
                    <td>{fmtN0(extendForce(row.bore, pVal))} N</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SourceBadge>
          Boring/zuigerstang-combinaties volgens de gangbare cilindercatalogi (Festo DSBC/DNC, SMC CA2/CQ2) die
          ISO 15552 en ISO 6432 volgen. Sommige boringen hebben meerdere standaard stangdiameters; controleer de
          fabrikant-catalogus voor de volledige set.
        </SourceBadge>
        <SourceLink href="https://en.wikipedia.org/wiki/Pneumatic_cylinder">Wikipedia — Pneumatic cylinder</SourceLink>
      </section>
    </>
  );
}
