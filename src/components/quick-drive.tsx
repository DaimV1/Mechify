import { CalculationVisual } from "./calculation-visual";
import { useState } from "react";
import { driveResult, ratioResult, forceResult, type Values } from "@/lib/calculators/drive";
const definitions: Record<string, Record<string, [string, string, string]>> = {
  drive: {
    power: ["Vermogen", "kW", "0.75"],
    speed: ["Toerental", "omw/min", "1500"],
    torque: ["Koppel", "N·m", "4.775"],
  },
  ratio: {
    speed: ["Ingaand toerental", "omw/min", "1500"],
    torque: ["Ingaand koppel", "N·m", "8"],
    ratio: ["Verhouding i = n₁ / n₂", "—", "10"],
    efficiency: ["Rendement", "%", "92"],
  },
  force: {
    pressure: ["Overdruk", "bar", "6"],
    diameter: ["Zuigerdiameter", "mm", "50"],
    rod: ["Stangdiameter", "mm", "20"],
    efficiency: ["Krachtfactor na verliezen", "%", "90"],
  },
};
const titles: Record<string, string> = {
  drive: "Koppel, vermogen & toerental",
  ratio: "Overbrengingsverhouding",
  force: "Kracht bij een gegeven cilinder",
};
const format = (n: number) =>
  n.toLocaleString("nl-NL", {
    maximumFractionDigits: Math.abs(n) > 0 && Math.abs(n) < 0.001 ? 9 : 3,
  });
export function QuickDrive({
  compact = false,
  kind = "drive",
}: {
  compact?: boolean;
  kind?: string;
}) {
  const fields = definitions[kind];
  const initial = () => Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, f[2]]));
  const [v, setV] = useState<Values>(initial);
  const [target, setTarget] = useState("torque");
  const [status, setStatus] = useState("");
  let error = "";
  let results: [string, number, string][] = [];
  try {
    if (kind === "drive") {
      const labels: Record<string, [string, string]> = {
        torque: ["Beschikbaar koppel", "N·m"],
        power: ["Mechanisch vermogen", "kW"],
        speed: ["Toerental", "omw/min"],
      };
      results = [[labels[target][0], driveResult(target, v), labels[target][1]]];
    } else if (kind === "ratio") {
      const r = ratioResult(v);
      results = [
        ["Uitgaand toerental", r.speed, "omw/min"],
        ["Uitgaand koppel", r.torque, "N·m"],
      ];
    } else {
      const r = forceResult(v);
      results = [
        ["Uitgaande kracht", r.extend, "N"],
        ["Ingaande kracht", r.retract, "N"],
      ];
    }
    if (results.some((r) => !Number.isFinite(r[1]) || Math.abs(r[1]) > 1e15))
      throw Error("Het resultaat is buiten het rekenbereik. Controleer de invoer.");
  } catch (e) {
    error = (e as Error).message;
  }
  const formula =
    kind === "drive"
      ? "P = T · 2πn / 60.000"
      : kind === "ratio"
        ? "n₂ = n₁ / i · T₂ = T₁ · i · η"
        : "Fuit = p · πD² / 4 · η; Fin = p · π(D² − d²) / 4 · η";
  return (
    <div className={"calculator " + (compact ? "compact" : "")}>
      <h3>{titles[kind]}</h3>
      {kind === "drive" ? (
        <div className="calc-tabs" role="group" aria-label="Te berekenen grootheid">
          {[
            ["torque", "Koppel"],
            ["power", "Vermogen"],
            ["speed", "Toerental"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={target === id}
              onClick={() => {
                setTarget(id);
                setStatus("");
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="fields">
        {Object.entries(fields)
          .filter(([key]) => kind !== "drive" || key !== target)
          .map(([key, [label, unit]]) => (
            <label className="field" key={key}>
              {label}
              <div className="input-unit">
                <input
                  inputMode="decimal"
                  value={v[key]}
                  aria-invalid={!!error}
                  onChange={(e) => {
                    setV({ ...v, [key]: e.target.value });
                    setStatus("");
                  }}
                />
                <span>{unit}</span>
              </div>
            </label>
          ))}
      </div>
      {error ? (
        <p className="calc-error" role="alert">
          {error}
        </p>
      ) : (
        <div className="result" aria-live="polite">
          {results.map(([label, n, unit]) => (
            <div key={label}>
              <span className="result-label">{label}</span>
              <div className="result-number">
                {format(n)} <span>{unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {!compact && !error ? <CalculationVisual kind={kind} values={v} /> : null}
      <div className="calc-actions">
        <button
          onClick={() => {
            setV(initial());
            setTarget("torque");
            setStatus("");
          }}
        >
          ↺ Reset
        </button>
        <button
          className="copy"
          disabled={!!error}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                [
                  titles[kind],
                  ...Object.entries(v)
                    .filter(([k]) => kind !== "drive" || k !== target)
                    .map(([k, n]) => `${fields[k][0]}: ${n} ${fields[k][1]}`),
                  ...results.map(([l, n, u]) => `${l}: ${format(n)} ${u}`),
                  formula,
                ].join("\n"),
              );
              setStatus("Gekopieerd");
            } catch {
              setStatus(
                "Kopiëren niet toegestaan. Selecteer het resultaat om handmatig te kopiëren.",
              );
            }
          }}
        >
          Kopieer resultaat ⧉
        </button>
        <span className="copy-status" role="status">
          {status}
        </span>
      </div>
      <details className="formula" open={!compact}>
        <summary>
          Formule & aannames <span>+</span>
        </summary>
        <code>{formula}</code>
        <p>
          {kind === "drive"
            ? "P in kW, T in N·m, n in omw/min. Stationair mechanisch asvermogen; geen elektrisch opgenomen vermogen, versnelling of motorselectie."
            : kind === "ratio"
              ? "i = n₁/n₂. i > 1 is een reductie. η = rendement/100. Constant rendement, energiestroom van ingang naar uitgang. Geen piekbelasting of terugaandrijving."
              : "p in N/mm² = bar × 0,1. D en d in mm. Ontluchtende zijde op atmosferische druk. Krachtfactor is een gekozen verliesfactor; geen knik-, snelheid- of dynamische controle."}
        </p>
      </details>
    </div>
  );
}
export function DrivePowerCalc() {
  return <QuickDrive />;
}
export function TransmissionCalc() {
  return <QuickDrive kind="ratio" />;
}
