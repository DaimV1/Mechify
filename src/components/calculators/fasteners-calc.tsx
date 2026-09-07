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
    heading: "Doorlaat, sleutelmaat en aandraaimoment",
    intro:
      "T = K · F · d, met F = 0,75 · Rp0,2 · A_s (ISO 898-1 spanningsdoorsnede). K ≈ 0,2 is de gangbare moerfactor voor niet-gesmeerde, zwart/fosfaat afgewerkte bevestigers — bij vet, MoS₂ of RVS kan K 0,10–0,20 zijn. Indicatief; volg de opgegeven aanhaalspecificatie bij kritieke verbindingen.",
    threadSize: "Draadmaat",
    propertyClass: "Sterkteklasse",
    nutFactor: "Moerfactor K",
    holeFine: "Doorlaat fijn",
    holeMedium: "Doorlaat middel",
    holeCoarse: "Doorlaat grof",
    wrenchHex: "Sleutelmaat (zeskant)",
    wrenchSocket: "Sleutelmaat (inbus)",
    torque: "Aandraaimoment T",
    torquePerSize: (k: string) => `Aandraaimoment per maat (K = ${k})`,
    thSize: "Maat",
    source: "Engineering ToolBox — ISO metric screw threads",
    copy: (size: string, cls: string, fine: number, medium: number, coarse: number, hex: number, socket: number, torque: string, k: string) =>
      [
        `${size}, klasse ${cls}`,
        `Doorlaat: fijn ${fine} / middel ${medium} / grof ${coarse} mm`,
        `Sleutelmaat: zeskant ${hex} mm, inbus ${socket} mm`,
        `Aandraaimoment T ≈ ${torque} N·m (K=${k})`,
      ].join("\n"),
  },
  en: {
    heading: "Clearance hole, wrench size and tightening torque",
    intro:
      "T = K · F · d, with F = 0.75 · Rp0.2 · A_s (ISO 898-1 stress area). K ≈ 0.2 is the common nut factor for non-lubricated, black/phosphate finished fasteners — with grease, MoS₂ or stainless it can be 0.10–0.20. Indicative; follow the specified tightening spec for critical joints.",
    threadSize: "Thread size",
    propertyClass: "Property class",
    nutFactor: "Nut factor K",
    holeFine: "Clearance fine",
    holeMedium: "Clearance medium",
    holeCoarse: "Clearance coarse",
    wrenchHex: "Wrench size (hex)",
    wrenchSocket: "Wrench size (hex socket)",
    torque: "Tightening torque T",
    torquePerSize: (k: string) => `Tightening torque per size (K = ${k})`,
    thSize: "Size",
    source: "Engineering ToolBox — ISO metric screw threads",
    copy: (size: string, cls: string, fine: number, medium: number, coarse: number, hex: number, socket: number, torque: string, k: string) =>
      [
        `${size}, class ${cls}`,
        `Clearance: fine ${fine} / medium ${medium} / coarse ${coarse} mm`,
        `Wrench size: hex ${hex} mm, hex socket ${socket} mm`,
        `Tightening torque T ≈ ${torque} N·m (K=${k})`,
      ].join("\n"),
  },
};

export function FastenersCalc() {
  const { locale } = useLocale();
  const t = T[locale];
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
    return t.copy(size, classId, hole.fine, hole.medium, hole.coarse, wrench.hex, wrench.socket, fmtFastener(torqueResult.torque), String(kVal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torqueResult, size, classId, hole, wrench, kVal, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{t.heading}</h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={t.threadSize}>
            <SelectInput value={size} onChange={(v) => setSize(v as ThreadSize)}>
              {THREAD_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.propertyClass}>
            <SelectInput value={classId} onChange={setClassId}>
              {PROPERTY_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.nutFactor}>
            <NumInput id="fastener-k" value={k} onChange={setK} />
          </Field>
        </div>

        <ResultGrid
          items={[
            { label: t.holeFine, value: `Ø${hole.fine} mm` },
            { label: t.holeMedium, value: `Ø${hole.medium} mm` },
            { label: t.holeCoarse, value: `Ø${hole.coarse} mm` },
            { label: t.wrenchHex, value: `${wrench.hex} mm` },
            { label: t.wrenchSocket, value: `${wrench.socket} mm` },
            torqueResult ? { label: t.torque, value: `≈ ${fmtFastener(torqueResult.torque)} N·m` } : null,
          ].filter(Boolean) as { label: string; value: string }[]}
        />
        <div className="flex flex-wrap gap-2">
          <CopyResult text={copy} />
          <CopyLink />
        </div>
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t.torquePerSize(String(kVal))}</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thSize}</th>
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
        <SourceLink href="https://www.engineeringtoolbox.com/iso-metric-screw-thread-d_777.html">{t.source}</SourceLink>
      </section>
    </>
  );
}
