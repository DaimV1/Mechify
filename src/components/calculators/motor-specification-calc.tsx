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
  SourceBadge,
} from "@/components/calculators/calc-ui";

const T = {
  nl: {
    heading: "Motordimensionering",
    intro:
      "Vereenvoudigd mechanica-model voor een eerste schatting: F = m·g·(sinθ + μ·cosθ) voor een helling, F = μ·m·g horizontaal, F = m·g bij hijsen. Geen vervanging van DIN 22101/FEM-berekeningen voor bandtransporteurs of een hijswerktuigberekening volgens EN 13001/ISO 4301 bij kritieke installaties.",
    application: "Toepassing",
    mass: "Massa m (kg)",
    speed: "Snelheid v (m/s)",
    drumDiameter: "Trommeldiameter D (mm)",
    rollerDiameter: "Rol-/aandrijftrommel Ø D (mm)",
    angle: "Hellingshoek θ (°)",
    friction: "Wrijvingscoëfficiënt μ",
    efficiency: "Rendement η (aandrijving)",
    safetyFactor: "Veiligheidsfactor",
    resultForce: "Trekkracht F",
    resultRpm: "Toerental n",
    resultTorque: "Koppel T",
    resultShaftPower: "Asvermogen P",
    resultDesignPower: "Ontwerpvermogen (met marge)",
    resultIec: "IEC-vermogen",
    outOfRange: "> 355 kW — buiten reeks",
    fillFields: "Vul massa, snelheid en trommeldiameter groter dan 0 in.",
    iecSeriesTitle: "IEC-vermogensreeks (IEC 60072)",
    thPower: "Vermogen (kW)",
    sourceBadge:
      "Meest gangbare deel van de IEC 60072-voorkeursreeks tot 355 kW, zoals gebruikt in fabrikantcatalogi (ABB, Siemens). Grotere vermogens en de exacte beschikbaarheid per polentaal/frame verschillen per fabrikant.",
    copy: (
      appLabel: string,
      mass: string,
      speed: string,
      diameter: string,
      result: NonNullable<ReturnType<typeof computeMotor>>,
    ) =>
      [
        `${appLabel}: m=${mass} kg, v=${speed} m/s, D=${diameter} mm`,
        `F=${fmtRound(result.force)} N, n=${fmtRound(result.rpm, 1)} rpm, T=${fmtRound(result.torque, 1)} Nm`,
        `P_as=${fmtKw(result.shaftPowerW)} kW, P_ontwerp=${fmtKw(result.designPowerW)} kW`,
        result.iecPower != null
          ? `IEC-vermogen: ${result.iecPower} kW`
          : "Geen IEC-stap tot 355 kW",
      ].join("\n"),
  },
  en: {
    heading: "Motor sizing",
    intro:
      "Simplified mechanics model for a first estimate: F = m·g·(sinθ + μ·cosθ) for an incline, F = μ·m·g horizontal, F = m·g for hoisting. Not a substitute for DIN 22101/FEM calculations for belt conveyors or a hoist calculation per EN 13001/ISO 4301 for critical installations.",
    application: "Application",
    mass: "Mass m (kg)",
    speed: "Speed v (m/s)",
    drumDiameter: "Drum diameter D (mm)",
    rollerDiameter: "Roller/drive drum Ø D (mm)",
    angle: "Incline angle θ (°)",
    friction: "Friction coefficient μ",
    efficiency: "Efficiency η (drive)",
    safetyFactor: "Safety factor",
    resultForce: "Pull force F",
    resultRpm: "Speed n",
    resultTorque: "Torque T",
    resultShaftPower: "Shaft power P",
    resultDesignPower: "Design power (with margin)",
    resultIec: "IEC power",
    outOfRange: "> 355 kW — outside range",
    fillFields: "Enter mass, speed and drum diameter greater than 0.",
    iecSeriesTitle: "IEC power series (IEC 60072)",
    thPower: "Power (kW)",
    sourceBadge:
      "Most common part of the IEC 60072 preferred power series up to 355 kW, as used in manufacturer catalogs (ABB, Siemens). Larger powers and exact availability per pole count/frame vary by manufacturer.",
    copy: (
      appLabel: string,
      mass: string,
      speed: string,
      diameter: string,
      result: NonNullable<ReturnType<typeof computeMotor>>,
    ) =>
      [
        `${appLabel}: m=${mass} kg, v=${speed} m/s, D=${diameter} mm`,
        `F=${fmtRound(result.force)} N, n=${fmtRound(result.rpm, 1)} rpm, T=${fmtRound(result.torque, 1)} Nm`,
        `P_shaft=${fmtKw(result.shaftPowerW)} kW, P_design=${fmtKw(result.designPowerW)} kW`,
        result.iecPower != null ? `IEC power: ${result.iecPower} kW` : "No IEC step up to 355 kW",
      ].join("\n"),
  },
};

export function MotorSpecificationCalc() {
  const { locale } = useLocale();
  const t = T[locale];
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

  const appLabel = APPLICATIONS.find((a) => a.id === app);
  const appLabelText = appLabel ? (locale === "nl" ? appLabel.label : appLabel.labelEn) : "";

  const copy = useMemo(() => {
    if (!result) return "";
    return t.copy(appLabelText, mass, speed, diameter, result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, appLabelText, mass, speed, diameter, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.application}>
            <SelectInput value={app} onChange={(v) => setApp(v as Application)}>
              {APPLICATIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {locale === "nl" ? a.label : a.labelEn}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.mass}>
            <NumInput id="motor-mass" value={mass} onChange={setMass} />
          </Field>
          <Field label={t.speed}>
            <NumInput id="motor-speed" value={speed} onChange={setSpeed} />
          </Field>
          <Field label={app === "hijsen" ? t.drumDiameter : t.rollerDiameter}>
            <NumInput id="motor-diameter" value={diameter} onChange={setDiameter} />
          </Field>
          {app === "helling" ? (
            <Field label={t.angle}>
              <NumInput id="motor-angle" value={angle} onChange={setAngle} />
            </Field>
          ) : null}
          {app !== "hijsen" ? (
            <Field label={t.friction}>
              <NumInput id="motor-mu" value={mu} onChange={setMu} />
            </Field>
          ) : null}
          <Field label={t.efficiency}>
            <NumInput id="motor-eta" value={efficiency} onChange={setEfficiency} />
          </Field>
          <Field label={t.safetyFactor}>
            <NumInput id="motor-safety" value={safety} onChange={setSafety} />
          </Field>
        </div>

        {result ? (
          <>
            <ResultGrid
              items={[
                { label: t.resultForce, value: `${fmtRound(result.force)} N` },
                { label: t.resultRpm, value: `${fmtRound(result.rpm, 1)} rpm` },
                { label: t.resultTorque, value: `${fmtRound(result.torque, 1)} Nm` },
                { label: t.resultShaftPower, value: `${fmtKw(result.shaftPowerW)} kW` },
                { label: t.resultDesignPower, value: `${fmtKw(result.designPowerW)} kW` },
                {
                  label: t.resultIec,
                  value: result.iecPower != null ? `${result.iecPower} kW` : t.outOfRange,
                },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">{t.fillFields}</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.iecSeriesTitle}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thPower}</th>
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
        <SourceBadge>{t.sourceBadge}</SourceBadge>
      </section>
    </>
  );
}
