import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CLEARANCE_HOLES,
  computeTorque,
  fmtFastener,
  PROPERTY_CLASSES,
  STRESS_AREA,
  THREAD_SIZES,
  WRENCH_SIZES,
  type ThreadSize,
} from "@/lib/calculators/fasteners";
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

export function FastenersCalc() {
  const [search, setSearch] = useSearchParams();
  const [size, setSize] = useState<ThreadSize>((search.get("m") as ThreadSize) ?? "M8");
  const [classId, setClassId] = useState(search.get("c") ?? "8.8");
  const [k, setK] = useState(search.get("k") ?? "0.2");

  useEffect(() => {
    const next = new URLSearchParams(search);
    next.set("m", size);
    next.set("c", classId);
    if (k) next.set("k", k);
    else next.delete("k");
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, classId, k]);

  const cls = PROPERTY_CLASSES.find((c) => c.id === classId) ?? PROPERTY_CLASSES[0];
  const kVal = parseNum(k) ?? 0.2;
  const torqueResult = kVal > 0 ? computeTorque(size, cls, kVal) : null;
  const hole = CLEARANCE_HOLES[size];
  const wrench = WRENCH_SIZES[size];

  const copy = useMemo(() => {
    if (!torqueResult) return "";
    return [
      `${size}, klasse ${classId}`,
      `Doorlaat: fijn ${hole.fine} / middel ${hole.medium} / grof ${hole.coarse} mm`,
      `Sleutelmaat: zeskant ${wrench.hex} mm, inbus ${wrench.socket} mm`,
      `Aandraaimoment T ≈ ${fmtFastener(torqueResult.torque)} N·m (K=${kVal})`,
    ].join("\n");
  }, [torqueResult, size, classId, hole, wrench, kVal]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Doorlaat, sleutelmaat en aandraaimoment</h2>
        <Note>
          T = K · F · d, met F = 0,75 · Rp0,2 · A_s (ISO 898-1 spanningsdoorsnede). K ≈ 0,2 is de gangbare
          moerfactor voor niet-gesmeerde, zwart/fosfaat afgewerkte bevestigers — bij vet, MoS₂ of RVS kan K
          0,10–0,20 zijn. Indicatief; volg de opgegeven aanhaalspecificatie bij kritieke verbindingen.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label="Draadmaat">
            <SelectInput value={size} onChange={(v) => setSize(v as ThreadSize)}>
              {THREAD_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Sterkteklasse">
            <SelectInput value={classId} onChange={setClassId}>
              {PROPERTY_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Moerfactor K">
            <NumInput id="fastener-k" value={k} onChange={setK} />
          </Field>
        </div>

        <ResultGrid
          items={[
            { label: "Doorlaat fijn", value: `Ø${hole.fine} mm` },
            { label: "Doorlaat middel", value: `Ø${hole.medium} mm` },
            { label: "Doorlaat grof", value: `Ø${hole.coarse} mm` },
            { label: "Sleutelmaat (zeskant)", value: `${wrench.hex} mm` },
            { label: "Sleutelmaat (inbus)", value: `${wrench.socket} mm` },
            torqueResult
              ? { label: "Aandraaimoment T", value: `≈ ${fmtFastener(torqueResult.torque)} N·m` }
              : null,
          ].filter(Boolean) as { label: string; value: string }[]}
        />
        <div className="flex flex-wrap gap-2">
          <CopyResult text={copy} />
          <CopyLink />
        </div>
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Aandraaimoment per maat (K = {kVal})</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Maat</th>
                <th>A_s (mm²)</th>
                {PROPERTY_CLASSES.map((c) => (
                  <th key={c.id}>{c.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {THREAD_SIZES.map((s) => (
                <tr key={s} className={s === size ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {s}
                  </th>
                  <td>{STRESS_AREA[s]}</td>
                  {PROPERTY_CLASSES.map((c) => (
                    <td key={c.id}>{fmtFastener(computeTorque(s, c, kVal).torque)} N·m</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/iso-metric-screw-thread-d_777.html">
          Engineering ToolBox — ISO metric screw threads
        </SourceLink>
      </section>
    </>
  );
}
