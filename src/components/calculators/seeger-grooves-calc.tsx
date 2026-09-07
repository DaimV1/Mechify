import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CIRCLIP_KINDS, computeGroove, fmtCirclip, type CirclipKind } from "@/lib/calculators/circlip";
import { readStoredDiameter, storeDiameter } from "@/lib/tools";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  parseWholeMm,
  ResultGrid,
  SelectInput,
  SourceBadge,
  WholeMmInput,
} from "@/components/calculators/calc-ui";

export function SeegerGroovesCalc() {
  const [search, setSearch] = useSearchParams();
  const [kind, setKind] = useState<CirclipKind>((search.get("kind") as CirclipKind) ?? "as");
  const [diameter, setDiameter] = useState(() => search.get("d") ?? readStoredDiameter({ min: 3, max: 100 }));

  useEffect(() => {
    const next = new URLSearchParams(search);
    next.set("kind", kind);
    if (diameter) next.set("d", diameter);
    else next.delete("d");
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, diameter]);

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const result = Number.isFinite(d) ? computeGroove(kind, d) : null;
  const standard = CIRCLIP_KINDS.find((k) => k.id === kind)?.standard ?? "";

  const copy = useMemo(() => {
    if (!result) return "";
    return [
      `${kind === "as" ? "As" : "Boring"} Ø${d} mm (${standard})`,
      `Groefdiameter ${fmtCirclip(result.grooveDiameter)} mm`,
      `Groefbreedte ${fmtCirclip(result.grooveWidth)} mm`,
      `Groefdiepte ${fmtCirclip(result.grooveDepth)} mm`,
    ].join("\n");
  }, [result, kind, d, standard]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Seegerringgroef bij Ø</h2>
        <Note>
          Technische schatting op basis van de gebruikelijke opbouw van seeger-groeven (breedte in vaste stappen,
          diepte ruwweg evenredig met de diameter). Geen vervanging van de DIN 471/472-tabel of de catalogus van de
          ringfabrikant — neem de definitieve groefmaat daaruit over vóór productie.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <SelectInput value={kind} onChange={(v) => setKind(v as CirclipKind)}>
              {CIRCLIP_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label} ({k.standard})
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={kind === "as" ? "As-Ø (mm)" : "Boring-Ø (mm)"}>
            <WholeMmInput id="circlip-diameter" value={diameter} onChange={onDia} />
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">Vul een diameter in.</p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">Vul een diameter groter dan 0 in.</p>
        ) : (
          <>
            <ResultGrid
              items={[
                { label: "Groefdiameter", value: `Ø${fmtCirclip(result.grooveDiameter)} mm` },
                { label: "Groefbreedte", value: `${fmtCirclip(result.grooveWidth)} mm` },
                { label: "Groefdiepte", value: `${fmtCirclip(result.grooveDepth)} mm` },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Schatting over het bereik</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Ø (mm)</th>
                <th>Groefdiameter</th>
                <th>Groefbreedte</th>
                <th>Groefdiepte</th>
              </tr>
            </thead>
            <tbody>
              {[8, 10, 12, 15, 16, 18, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100].map((dia) => {
                const r = computeGroove(kind, dia);
                return (
                  <tr key={dia} className={dia === d ? "is-active" : ""}>
                    <th scope="row" className="normal-case">
                      {dia}
                    </th>
                    <td>{r ? `Ø${fmtCirclip(r.grooveDiameter)}` : "—"}</td>
                    <td>{r ? fmtCirclip(r.grooveWidth) : "—"}</td>
                    <td>{r ? fmtCirclip(r.grooveDepth) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SourceBadge>
          Schatting, geen catalogusdata. DIN 471 (as) en DIN 472 (boring) publiceren per nominale diameter een vaste
          groefdiameter, -breedte en tolerantie — vraag de actuele norm of ringfabrikant-catalogus op voor
          productietekeningen.
        </SourceBadge>
      </section>
    </>
  );
}
