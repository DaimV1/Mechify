import { BoltSection, SchemaPanel } from "@/components/toolkit/schema";
import { lookupFastener } from "@/lib/toolkit/fastener";
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
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";

const FASTENER_META: EngineeringSourceMeta = {
  basisType: "heuristic",
  reference:
    "K-factor torque estimate (T = K·F·d) · ISO 273/4014-4017/4762 clearance & wrench reference data",
  status: "estimate",
  checkedDate: "2026-09-17",
  validityRange: { nl: "M3-M24", en: "M3-M24" },
  assumptions: {
    nl: "K≈0,2 nominale moerfactor voor niet-gesmeerde bevestigers; werkelijke K varieert 0,10-0,20 met smering/afwerking. Aanhaalspreiding, afzonderlijke draad-/kopwrijving, verbindingsstijfheid, settingverlies, scheiding, slip en vermoeiing worden niet gecontroleerd — dit is een aandraaimoment-schatting, geen VDI 2230-verbindingsverificatie.",
    en: "K≈0.2 nominal nut factor for non-lubricated fasteners; actual K varies 0.10-0.20 with lubrication/finish. Tightening scatter, separate thread/head friction, joint stiffness, embedment loss, separation, slip and fatigue are not checked — this is a torque estimate, not a VDI 2230 joint verification.",
  },
  verification: {
    nl: "Gebruik een volledige VDI 2230-berekening of de opgegeven aanhaalspecificatie voor kritieke verbindingen.",
    en: "Use a full VDI 2230 calculation or the specified tightening spec for critical joints.",
  },
};

const T = {
  nl: {
    heading: "Doorlaat, sleutelmaat en aandraaimoment",
    intro:
      "T = K · F · d, met F = 0,75 · Rp0,2 · A_s (ISO 898-1 spanningsdoorsnede). K ≈ 0,2 is de gangbare moerfactor voor niet-gesmeerde, zwart/fosfaat afgewerkte bevestigers — bij vet, MoS₂ of RVS kan K 0,10–0,20 zijn. Dit is een aandraaimoment-SCHATTING, geen VDI 2230-verbindingsberekening: aanhaalspreiding, afzonderlijke draad-/kopwrijving, verbindingsstijfheid, settingverlies, scheidingskracht, slip, vermoeiing en overbelasting van de draad zitten er niet in. Doorlaat- en sleutelmaten hieronder zijn onafhankelijke naslagwaarden (ISO 273 / ISO 4014-4017 / ISO 4762), niet afgeleid uit deze schatting. Volg bij kritieke verbindingen de opgegeven aanhaalspecificatie of een volledige VDI 2230-berekening.",
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
    copy: (
      size: string,
      cls: string,
      fine: number,
      medium: number,
      coarse: number,
      hex: number,
      socket: number,
      torque: string,
      k: string,
    ) =>
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
      "T = K · F · d, with F = 0.75 · Rp0.2 · A_s (ISO 898-1 stress area). K ≈ 0.2 is the common nut factor for non-lubricated, black/phosphate finished fasteners — with grease, MoS₂ or stainless it can be 0.10–0.20. This is a tightening-torque ESTIMATE, not a VDI 2230 joint calculation: tightening scatter, separate thread/head friction, joint stiffness, embedment loss, separating force, slip, fatigue and thread stripping are not included. Clearance-hole and wrench-size values below are independent reference data (ISO 273 / ISO 4014-4017 / ISO 4762), not derived from this estimate. For critical joints, follow the specified tightening spec or a full VDI 2230 calculation.",
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
    copy: (
      size: string,
      cls: string,
      fine: number,
      medium: number,
      coarse: number,
      hex: number,
      socket: number,
      torque: string,
      k: string,
    ) =>
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
  const [size, setSize] = useState<ThreadSize>(
    (search.get("m") && search.get("m")! in CLEARANCE_HOLES ? search.get("m") : "M8") as ThreadSize,
  );
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
  const kVal = parseNum(k) ?? NaN;
  const torqueResult = kVal > 0 ? computeTorque(size, cls, kVal) : null;
  const hole = CLEARANCE_HOLES[size];
  const wrench = WRENCH_SIZES[size];

  const copy = useMemo(() => {
    if (!torqueResult) return "";
    return [
      t.copy(
        size,
        classId,
        hole.fine,
        hole.medium,
        hole.coarse,
        wrench.hex,
        wrench.socket,
        fmtFastener(torqueResult.torque),
        Number.isFinite(kVal) ? String(kVal) : "—",
      ),
      metaCopyLine(FASTENER_META, locale),
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torqueResult, size, classId, hole, wrench, kVal, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <SourceMetaBadge meta={FASTENER_META} />
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
          items={
            [
              { label: t.holeFine, value: `Ø${hole.fine} mm` },
              { label: t.holeMedium, value: `Ø${hole.medium} mm` },
              { label: t.holeCoarse, value: `Ø${hole.coarse} mm` },
              { label: t.wrenchHex, value: `${wrench.hex} mm` },
              { label: t.wrenchSocket, value: `${wrench.socket} mm` },
              torqueResult
                ? { label: t.torque, value: `≈ ${fmtFastener(torqueResult.torque)} N·m` }
                : null,
            ].filter(Boolean) as { label: string; value: string }[]
          }
        />
        <div className="flex flex-wrap gap-2">
          {copy ? <CopyResult text={copy} /> : null}
          <CopyLink />
        </div>
      </CalcPanel>
      <SchemaPanel caption="Technisch schema · maten in mm · schematisch, niet op schaal">
        <BoltSection row={lookupFastener(Number(size.slice(1)))} hole={hole.medium} />
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.torquePerSize(String(kVal))}
        </h2>
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
                    <td key={c.id}>
                      {kVal > 0 ? fmtFastener(computeTorque(s, c, kVal).torque) : "—"} N·m
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/iso-metric-screw-thread-d_777.html">
          {t.source}
        </SourceLink>
      </section>
    </>
  );
}
