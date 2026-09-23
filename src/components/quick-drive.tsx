import { CalculationVisual } from "./calculation-visual";
import { useState } from "react";
import { driveResult, ratioResult, forceResult, type Values } from "@/lib/calculators/drive";
import { tx, useLocale, type Locale } from "@/lib/i18n/locale";

type Bilingual = Record<Locale, string>;
type FieldDef = [Bilingual, Bilingual, string];

const RPM: Bilingual = { nl: "omw/min", en: "rpm" };
const SAME = (s: string): Bilingual => ({ nl: s, en: s });

const definitions: Record<string, Record<string, FieldDef>> = {
  drive: {
    power: [{ nl: "Vermogen", en: "Power" }, SAME("kW"), "0.75"],
    speed: [{ nl: "Toerental", en: "Speed" }, RPM, "1500"],
    torque: [{ nl: "Koppel", en: "Torque" }, SAME("N·m"), "4.775"],
  },
  ratio: {
    speed: [{ nl: "Ingaand toerental", en: "Input speed" }, RPM, "1500"],
    torque: [{ nl: "Ingaand koppel", en: "Input torque" }, SAME("N·m"), "8"],
    ratio: [{ nl: "Verhouding i = n₁ / n₂", en: "Ratio i = n₁ / n₂" }, SAME("—"), "10"],
    efficiency: [{ nl: "Rendement", en: "Efficiency" }, SAME("%"), "92"],
  },
  force: {
    pressure: [{ nl: "Overdruk", en: "Gauge pressure" }, SAME("bar"), "6"],
    diameter: [{ nl: "Zuigerdiameter", en: "Piston diameter" }, SAME("mm"), "50"],
    rod: [{ nl: "Stangdiameter", en: "Rod diameter" }, SAME("mm"), "20"],
    efficiency: [
      { nl: "Krachtfactor na verliezen", en: "Force factor after losses" },
      SAME("%"),
      "90",
    ],
  },
};
const titles: Record<string, Record<Locale, string>> = {
  drive: { nl: "Koppel, vermogen & toerental", en: "Torque, power & speed" },
  ratio: { nl: "Overbrengingsverhouding", en: "Transmission ratio" },
  force: { nl: "Kracht bij een gegeven cilinder", en: "Force for a given cylinder" },
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
  const { locale } = useLocale();
  const fields = definitions[kind];
  const initial = () => Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, f[2]]));
  const [v, setV] = useState<Values>(initial);
  const [target, setTarget] = useState("torque");
  const [status, setStatus] = useState("");
  let error = "";
  let results: [string, number, string][] = [];
  try {
    if (kind === "drive") {
      const labels: Record<string, [Bilingual, Bilingual]> = {
        torque: [{ nl: "Beschikbaar koppel", en: "Available torque" }, SAME("N·m")],
        power: [{ nl: "Mechanisch vermogen", en: "Mechanical power" }, SAME("kW")],
        speed: [{ nl: "Toerental", en: "Speed" }, RPM],
      };
      results = [
        [labels[target][0][locale], driveResult(target, v), labels[target][1][locale]],
      ];
    } else if (kind === "ratio") {
      const r = ratioResult(v);
      results = [
        [tx(locale, "Uitgaand toerental", "Output speed"), r.speed, RPM[locale]],
        [tx(locale, "Uitgaand koppel", "Output torque"), r.torque, "N·m"],
      ];
    } else {
      const r = forceResult(v);
      results = [
        [tx(locale, "Uitgaande kracht", "Extend force"), r.extend, "N"],
        [tx(locale, "Ingaande kracht", "Retract force"), r.retract, "N"],
      ];
    }
    if (results.some((r) => !Number.isFinite(r[1]) || Math.abs(r[1]) > 1e15))
      throw Error(
        tx(
          locale,
          "Het resultaat is buiten het rekenbereik. Controleer de invoer.",
          "The result is outside the calculation range. Check the input.",
        ),
      );
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
      <h2>{titles[kind][locale]}</h2>
      {kind === "drive" ? (
        <div
          className="calc-tabs"
          role="group"
          aria-label={tx(locale, "Te berekenen grootheid", "Quantity to calculate")}
        >
          {(
            [
              ["torque", tx(locale, "Koppel", "Torque")],
              ["power", tx(locale, "Vermogen", "Power")],
              ["speed", tx(locale, "Toerental", "Speed")],
            ] as [string, string][]
          ).map(([id, label]) => (
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
              {label[locale]}
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
                <span>{unit[locale]}</span>
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
          ↺ {tx(locale, "Reset", "Reset")}
        </button>
        <button
          className="copy"
          disabled={!!error}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                [
                  titles[kind][locale],
                  ...Object.entries(v)
                    .filter(([k]) => kind !== "drive" || k !== target)
                    .map(([k, n]) => `${fields[k][0][locale]}: ${n} ${fields[k][1][locale]}`),
                  ...results.map(([l, n, u]) => `${l}: ${format(n)} ${u}`),
                  formula,
                ].join("\n"),
              );
              setStatus(tx(locale, "Gekopieerd", "Copied"));
            } catch {
              setStatus(
                tx(
                  locale,
                  "Kopiëren niet toegestaan. Selecteer het resultaat om handmatig te kopiëren.",
                  "Copying isn't allowed. Select the result to copy it manually.",
                ),
              );
            }
          }}
        >
          {tx(locale, "Kopieer resultaat", "Copy result")} ⧉
        </button>
        <span className="copy-status" role="status">
          {status}
        </span>
      </div>
      <details className="formula" open={!compact}>
        <summary>
          {tx(locale, "Formule & aannames", "Formula & assumptions")} <span>+</span>
        </summary>
        <code>{formula}</code>
        <p>
          {kind === "drive"
            ? tx(
                locale,
                "P in kW, T in N·m, n in omw/min. Stationair mechanisch asvermogen; geen elektrisch opgenomen vermogen, versnelling of motorselectie.",
                "P in kW, T in N·m, n in rpm. Steady-state mechanical shaft power; no electrical input power, acceleration or motor selection.",
              )
            : kind === "ratio"
              ? tx(
                  locale,
                  "i = n₁/n₂. i > 1 is een reductie. η = rendement/100. Constant rendement, energiestroom van ingang naar uitgang. Geen piekbelasting of terugaandrijving.",
                  "i = n₁/n₂. i > 1 is a reduction. η = efficiency/100. Constant efficiency, energy flow from input to output. No peak load or back-driving.",
                )
              : tx(
                  locale,
                  "p in N/mm² = bar × 0,1. D en d in mm. Ontluchtende zijde op atmosferische druk. Krachtfactor is een gekozen verliesfactor; geen knik-, snelheid- of dynamische controle.",
                  "p in N/mm² = bar × 0.1. D and d in mm. Vented side at atmospheric pressure. Force factor is a chosen loss factor; no buckling, speed or dynamic check.",
                )}
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
