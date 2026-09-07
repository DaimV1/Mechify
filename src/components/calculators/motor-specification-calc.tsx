import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  APPLICATIONS,
  computeMotor,
  fmtKw,
  fmtRound,
  IEC_POWERS_KW,
  requiredForce,
  type Application,
} from "@/lib/calculators/motor";
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
} from "@/components/calculators/calc-ui";

export function MotorSpecificationCalc() {
  const [search, setSearch] = useSearchParams();
  const [app, setApp] = useState<Application>((search.get("app") as Application) ?? "band");
  const [mass, setMass] = useState(search.get("m") ?? "500");
  const [speed, setSpeed] = useState(search.get("v") ?? "0.5");
  const [diameter, setDiameter] = useState(search.get("d") ?? "150");
  const [mu, setMu] = useState(search.get("mu") ?? "0.05");
  const [angle, setAngle] = useState(search.get("a") ?? "10");
  const [efficiency, setEfficiency] = useState(search.get("eta") ?? "0.9");
  const [safety, setSafety] = useState(search.get("s") ?? "1.15");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    next.set("app", app);
    set("m", mass);
    set("v", speed);
    set("d", diameter);
    set("mu", mu);
    set("a", angle);
    set("eta", efficiency);
    set("s", safety);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app, mass, speed, diameter, mu, angle, efficiency, safety]);

  const m = parseNum(mass);
  const v = parseNum(speed);
  const D = parseNum(diameter);
  const muVal = parseNum(mu) ?? 0;
  const angleVal = parseNum(angle) ?? 0;
  const eta = parseNum(efficiency) ?? 0.9;
  const s = parseNum(safety) ?? 1.15;

  const force = m != null ? requiredForce({ app, massKg: m, mu: muVal, angleDeg: angleVal }) : null;
  const result =
    force != null && v != null && D != null
      ? computeMotor({ force, speedMs: v, diameterMm: D, efficiency: eta, safety: s })
      : null;

  const appLabel = APPLICATIONS.find((a) => a.id === app)?.label ?? "";

  const copy = useMemo(() => {
    if (!result) return "";
    return [
      `${appLabel}: m=${mass} kg, v=${speed} m/s, D=${diameter} mm`,
      `F=${fmtRound(result.force)} N, n=${fmtRound(result.rpm, 1)} rpm, T=${fmtRound(result.torque, 1)} Nm`,
      `P_as=${fmtKw(result.shaftPowerW)} kW, P_ontwerp=${fmtKw(result.designPowerW)} kW`,
      result.iecPower != null ? `IEC-vermogen: ${result.iecPower} kW` : "Geen IEC-stap tot 355 kW",
    ].join("\n");
  }, [result, appLabel, mass, speed, diameter]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Motordimensionering</h2>
        <Note>
          Vereenvoudigd mechanica-model voor een eerste schatting: F = m·g·(sinθ + μ·cosθ) voor een helling, F = μ·m·g
          horizontaal, F = m·g bij hijsen. Geen vervanging van DIN 22101/FEM-berekeningen voor bandtransporteurs of
          een hijswerktuigberekening volgens EN 13001/ISO 4301 bij kritieke installaties.
        </Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Toepassing">
            <SelectInput value={app} onChange={(v) => setApp(v as Application)}>
              {APPLICATIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Massa m (kg)">
            <NumInput id="motor-mass" value={mass} onChange={setMass} />
          </Field>
          <Field label="Snelheid v (m/s)">
            <NumInput id="motor-speed" value={speed} onChange={setSpeed} />
          </Field>
          <Field label={app === "hijsen" ? "Trommeldiameter D (mm)" : "Rol-/aandrijftrommel Ø D (mm)"}>
            <NumInput id="motor-diameter" value={diameter} onChange={setDiameter} />
          </Field>
          {app === "helling" ? (
            <Field label="Hellingshoek θ (°)">
              <NumInput id="motor-angle" value={angle} onChange={setAngle} />
            </Field>
          ) : null}
          {app !== "hijsen" ? (
            <Field label="Wrijvingscoëfficiënt μ">
              <NumInput id="motor-mu" value={mu} onChange={setMu} />
            </Field>
          ) : null}
          <Field label="Rendement η (aandrijving)">
            <NumInput id="motor-eta" value={efficiency} onChange={setEfficiency} />
          </Field>
          <Field label="Veiligheidsfactor">
            <NumInput id="motor-safety" value={safety} onChange={setSafety} />
          </Field>
        </div>

        {result ? (
          <>
            <ResultGrid
              items={[
                { label: "Trekkracht F", value: `${fmtRound(result.force)} N` },
                { label: "Toerental n", value: `${fmtRound(result.rpm, 1)} rpm` },
                { label: "Koppel T", value: `${fmtRound(result.torque, 1)} Nm` },
                { label: "Asvermogen P", value: `${fmtKw(result.shaftPowerW)} kW` },
                { label: "Ontwerpvermogen (met marge)", value: `${fmtKw(result.designPowerW)} kW` },
                {
                  label: "IEC-vermogen",
                  value: result.iecPower != null ? `${result.iecPower} kW` : "> 355 kW — buiten reeks",
                },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">Vul massa, snelheid en trommeldiameter groter dan 0 in.</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">IEC-vermogensreeks (IEC 60072)</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Vermogen (kW)</th>
              </tr>
            </thead>
            <tbody>
              {IEC_POWERS_KW.map((kw) => (
                <tr key={kw} className={result?.iecPower === kw ? "is-active" : ""}>
                  <th scope="row" className="normal-case">
                    {kw}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceBadge>
          Meest gangbare deel van de IEC 60072-voorkeursreeks tot 355 kW, zoals gebruikt in fabrikantcatalogi (ABB,
          Siemens). Grotere vermogens en de exacte beschikbaarheid per polentaal/frame verschillen per fabrikant.
        </SourceBadge>
      </section>
    </>
  );
}
