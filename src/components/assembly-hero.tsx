import { useEffect, useRef } from "react";
import { tx, useLocale } from "@/lib/i18n/locale";
export function AssemblyHero() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { locale } = useLocale();
  useEffect(() => {
    let dispose: (() => void) | undefined;
    let active = true;
    const asset = "/assembly.js";
    import(/* @vite-ignore */ asset)
      .then(({ mountAssembly }) => {
        if (active && ref.current) dispose = mountAssembly(ref.current);
      })
      .catch(() => {
        /* Static SVG stays visible. */
      });
    return () => {
      active = false;
      dispose?.();
    };
  }, []);
  return (
    <div className="assembly">
      <div className="visual-top">
        <span className="mono">MX–01 / DRIVE ASSEMBLY</span>
        <span className="mono cyan">
          LIVE STUDY <i className="status-dot" />
        </span>
      </div>
      <img
        className="assembly-fallback"
        src="/assembly.svg"
        width="660"
        height="580"
        alt=""
        aria-hidden
        // P0.2: see the matching comment in layout/logo.tsx — avoids a
        // server/client hoisting mismatch for react-dom's automatic image
        // preload hint under fragment-only SSR.
        fetchPriority="low"
      />
      <canvas
        id="assembly"
        ref={ref}
        aria-label={tx(
          locale,
          "Isometrische exploded view van een aandrijving, koppeling en lagerflens",
          "Isometric exploded view of a drive, coupling and bearing flange",
        )}
        role="img"
      />
      <div className="assembly-controls">
        <span id="assembly-state" className="mono">
          EXPLODED VIEW
        </span>
        <label htmlFor="explode" className="sr-only">
          {tx(locale, "Montageafstand assembly", "Assembly explosion distance")}
        </label>
        <span>−</span>
        <input id="explode" type="range" min="0" max="100" defaultValue="65" />
        <span>+</span>
      </div>
      <div className="visual-caption mono">
        {tx(locale, "SCHEMATISCHE STUDIE", "SCHEMATIC STUDY")}{" "}
        <span>{tx(locale, "VERSLEEP OM TE ONTDEKKEN ↔", "DRAG TO EXPLORE ↔")}</span>
      </div>
    </div>
  );
}
