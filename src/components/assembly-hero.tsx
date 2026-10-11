import { useEffect, useId, useRef, useState } from "react";
import { tx, useLocale } from "@/lib/i18n/locale";

type AssemblyController = {
  setProgress: (progress: number, userInitiated?: boolean) => void;
  setHighlight: (part: string) => void;
  dispose: () => void;
};

export function AssemblyHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderId = useId();
  const controllerRef = useRef<AssemblyController | null>(null);
  const [progress, setProgress] = useState(65);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [highlight, setHighlight] = useState("all");
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
  const updateHighlight = (part: string) => {
    setHighlight(part);
    controllerRef.current?.setHighlight(part);
  };
  const stateLabel =
    progress === 0
      ? tx(locale, "Compact", "Compact")
      : progress === 100
        ? tx(locale, "Volledig uit elkaar", "Fully exploded")
        : tx(locale, `${progress}% uit elkaar`, `${progress}% exploded`);
  const components = [
    {
      number: "01",
      id: "sun",
      name: tx(locale, "Zonnewiel + ingaande as", "Sun gear + input shaft"),
      description: tx(
        locale,
        "18 tanden; de getoonde ingang in dit illustratieve geval.",
        "18 teeth; the shown input in this illustrative case.",
      ),
    },
    {
      number: "02",
      id: "planets",
      name: tx(locale, "Drie planeetwielen", "Three planet gears"),
      description: tx(
        locale,
        "Elk 15 tanden, gelijkmatig rond het zonnewiel geplaatst.",
        "15 teeth each, equally spaced around the sun gear.",
      ),
    },
    {
      number: "03",
      id: "ring",
      name: tx(locale, "Vast ringwiel", "Fixed ring gear"),
      description: tx(
        locale,
        "48 inwendige tanden; voorgesteld als het vaste lid.",
        "48 internal teeth; shown as the fixed member.",
      ),
    },
    {
      number: "04",
      id: "carrier",
      name: tx(locale, "Drager + uitgaande naaf", "Carrier + output hub"),
      description: tx(
        locale,
        "Voorgesteld als de uitgang; externe belasting ontbreekt.",
        "Shown as the output; external load is omitted.",
      ),
    },
    {
      number: "05",
      id: "bearings",
      name: tx(locale, "Conceptuele lagers", "Conceptual bearings"),
      description: tx(
        locale,
        "Alleen plaatsaanduiding; passing en levensduur zijn niet bepaald.",
        "Location only; fit and life are not determined.",
      ),
    },
    {
      number: "06",
      id: "housing",
      name: tx(locale, "Behuizing", "Housing"),
      description: tx(
        locale,
        "Opengewerkt voor zicht; geen gevalideerd productieontwerp.",
        "Opened for visibility; not a validated production design.",
      ),
    },
  ];

  return (
    <div className="assembly" data-render-status={status}>
      <div className="visual-top" aria-hidden="true">
        <span className="mono">
          PG–01 / {tx(locale, "PLANETAIR SCHEMA", "PLANETARY SCHEMATIC")}
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
            "Interactief conceptueel schema van een planetaire tandwielset",
            "Interactive conceptual schematic of a planetary gearset",
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
            "Illustratief geval: zonnewiel = ingang, ringwiel = vast, drager = uitgang. Zr 48 = Zs 18 + 2·Zp 15. De beweging is niet kinematisch opgelost; explosieafstand is alleen een kijkhulp. Geen gevalideerd tandwielkastontwerp, lagerarrangement of belastingsmodel.",
            "Illustrative case: sun = input, ring = fixed, carrier = output. Zr 48 = Zs 18 + 2·Zp 15. Motion is not kinematically solved; explosion distance is only a viewing aid. Not a validated gearbox design, bearing arrangement, or load model.",
          )}
        </p>
        <ol className="assembly-parts">
          {components.map((component) => (
            <li key={component.number} data-active={highlight === component.id}>
              <span className="mono cyan">{component.number}</span>
              <button
                type="button"
                onClick={() => updateHighlight(highlight === component.id ? "all" : component.id)}
                disabled={!interactive}
                aria-pressed={highlight === component.id}
              >
                <strong>{component.name}</strong>
                <small>{component.description}</small>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="visual-caption mono">
        <span>
          {tx(locale, "CONCEPTUELE PLANETAIRE TANDWIELSET", "CONCEPTUAL PLANETARY GEARSET")}
        </span>
        <span>{stateLabel.toUpperCase()}</span>
      </div>
    </div>
  );
}
