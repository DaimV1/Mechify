import { useEffect, useRef } from "react";
export function AssemblyHero() {
  const ref = useRef<HTMLCanvasElement>(null);
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
      />
      <canvas
        id="assembly"
        ref={ref}
        aria-label="Isometrische exploded view van een aandrijving, koppeling en lagerflens"
        role="img"
      />
      <div className="assembly-controls">
        <span id="assembly-state" className="mono">
          EXPLODED VIEW
        </span>
        <label htmlFor="explode" className="sr-only">
          Montageafstand assembly
        </label>
        <span>−</span>
        <input id="explode" type="range" min="0" max="100" defaultValue="65" />
        <span>+</span>
      </div>
      <div className="visual-caption mono">
        SCHEMATISCHE STUDIE <span>VERSLEEP OM TE ONTDEKKEN ↔</span>
      </div>
    </div>
  );
}
