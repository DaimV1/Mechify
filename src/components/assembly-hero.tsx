import { useEffect, useId, useRef, useState } from "react";
import { tx, useLocale } from "@/lib/i18n/locale";

type AssemblyController = {
  setProgress: (progress: number, userInitiated?: boolean) => void;
  dispose: () => void;
};

export function AssemblyHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderId = useId();
  const controllerRef = useRef<AssemblyController | null>(null);
  const [progress, setProgress] = useState(65);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const { locale } = useLocale();

  useEffect(() => {
    let active = true;
    const asset = "/assembly.js";
    import(/* @vite-ignore */ asset)
      .then(({ mountAssembly }) => {
        if (!active || !canvasRef.current) return;
        controllerRef.current = mountAssembly(canvasRef.current, {
          initialProgress: 65,
          onProgress: (value: number) => active && setProgress(Math.round(value)),
          onReady: () => active && setStatus("ready"),
        });
      })
      .catch(() => active && setStatus("fallback"));
    return () => {
      active = false;
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, []);

  const updateProgress = (value: number) => {
    setProgress(value);
    controllerRef.current?.setProgress(value, true);
  };
  const interactive = status === "ready";
  const stateLabel =
    progress === 0
      ? tx(locale, "Compact", "Compact")
      : progress === 100
        ? tx(locale, "Volledig uit elkaar", "Fully exploded")
        : tx(locale, `${progress}% uit elkaar`, `${progress}% exploded`);
  const components = [
    {
      number: "01",
      name: tx(locale, "Aandrijving", "Drive input"),
      description: tx(
        locale,
        "Conceptuele invoer van het draaimoment.",
        "Conceptual torque input.",
      ),
    },
    {
      number: "02",
      name: tx(locale, "Koppeling", "Coupling"),
      description: tx(
        locale,
        "Verbeeldt een koppelpunt in het bedoelde, conceptuele koppelpad.",
        "Depicts a coupling point in the intended, conceptual torque path.",
      ),
    },
    {
      number: "03",
      name: tx(locale, "Steun", "Support"),
      description: tx(
        locale,
        "Verbeeldt de richting naar een generiek steunconcept; de lageropstelling is niet gevalideerd.",
        "Depicts the direction toward a generic support concept; the bearing arrangement is not validated.",
      ),
    },
    {
      number: "04",
      name: tx(locale, "Montageplaat", "Mounting plate"),
      description: tx(locale, "Visuele basis van het schema.", "Visual base of the schematic."),
    },
  ];

  return (
    <div className="assembly" data-render-status={status}>
      <div className="visual-top" aria-hidden="true">
        <span className="mono">
          MX–01 / {tx(locale, "MECHANISCH SCHEMA", "MECHANICAL SCHEMATIC")}
        </span>
        <span className="mono cyan">
          {status === "ready"
            ? tx(locale, "INTERACTIEF", "INTERACTIVE")
            : tx(locale, "STATISCH", "STATIC")}{" "}
          <i className="status-dot" />
        </span>
      </div>
      <div className="assembly-stage">
        <img
          className="assembly-fallback"
          src="/assembly.svg"
          width="660"
          height="580"
          alt=""
          aria-hidden
          fetchPriority="low"
        />
        <canvas
          ref={canvasRef}
          aria-label={tx(
            locale,
            "Interactief mechanisch schema van een aandrijving, koppeling en steun",
            "Interactive mechanical schematic of a drive input, coupling and support",
          )}
          aria-hidden={status === "ready" ? undefined : true}
          role="img"
        />
      </div>
      <div className="assembly-controls" aria-label={tx(locale, "Weergave instellen", "Set view")}>
        <div
          className="assembly-presets"
          role="group"
          aria-label={tx(locale, "Snelle weergaven", "Quick views")}
        >
          <button type="button" onClick={() => updateProgress(0)} disabled={!interactive}>
            {tx(locale, "Compact", "Compact")}
          </button>
          <button type="button" onClick={() => updateProgress(100)} disabled={!interactive}>
            {tx(locale, "Uit elkaar", "Exploded")}
          </button>
          <button type="button" onClick={() => updateProgress(65)} disabled={!interactive}>
            {tx(locale, "Herstel", "Reset")}
          </button>
        </div>
        <div className="assembly-slider">
          <label htmlFor={sliderId}>
            {tx(locale, "Explosieafstand", "Explosion distance")} <output>{progress}%</output>
          </label>
          <input
            id={sliderId}
            type="range"
            min="0"
            max="100"
            value={progress}
            disabled={!interactive}
            aria-valuetext={stateLabel}
            onChange={(event) => updateProgress(Number(event.currentTarget.value))}
          />
        </div>
      </div>
      {status === "fallback" && (
        <p className="assembly-fallback-note" role="status">
          {tx(
            locale,
            "Statisch schema — interactieve bediening is niet beschikbaar.",
            "Static schematic — interactive controls are unavailable.",
          )}
        </p>
      )}
      <div className="assembly-explanation">
        <p className="assembly-path">
          {tx(
            locale,
            "Conceptueel: draaimoment gaat van de aandrijving naar de koppeling. De steun positioneert de getoonde onderdelen en verbeeldt radiale ondersteuning; een doorgaande uitgaande as en belasting zijn niet gemodelleerd. De afstandsbediening verduidelijkt alleen de zichtbare onderdelen; dit is geen gevalideerde montage of lageropstelling.",
            "Conceptually, torque passes from the drive input to the coupling. The support positions the shown components and depicts radial support; a continuous output shaft and load are not modelled. The distance control only clarifies the visible components; this is not a validated assembly or bearing arrangement.",
          )}
        </p>
        <ol className="assembly-parts">
          {components.map((component) => (
            <li key={component.number}>
              <span className="mono cyan">{component.number}</span>
              <span>
                <strong>{component.name}</strong>
                <small>{component.description}</small>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="visual-caption mono">
        <span>
          {tx(locale, "CONCEPTUEEL MECHANISCH SCHEMA", "CONCEPTUAL MECHANICAL SCHEMATIC")}
        </span>
        <span>{stateLabel.toUpperCase()}</span>
      </div>
    </div>
  );
}
