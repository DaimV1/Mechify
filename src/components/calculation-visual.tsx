import type { Values } from "@/lib/calculators/drive";
export function CalculationVisual({ kind, values }: { kind: string; values: Values }) {
  const n = (key: string, fallback: number) => {
    const v = Number(values[key]?.replace(",", "."));
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  if (kind === "force") {
    const D = n("diameter", 50),
      d = n("rod", 20),
      h = Math.max(20, Math.min(100, D)),
      rh = Math.max(4, Math.min(h - 6, D ? (d / D) * h : 4));
    return (
      <figure className="live-schematic">
        <svg
          viewBox="0 0 460 180"
          role="img"
          aria-label={`Cilinderdoorsnede: zuiger ${D} mm, stang ${d} mm`}
        >
          <path
            d={`M80 ${90 - h / 2}H350V${90 + h / 2}H80Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d={`M82 ${92 - h / 2}H220V${88 + h / 2}H82Z`} fill="var(--accent)" opacity=".14" />
          <rect x="216" y={90 - h / 2} width="12" height={h} fill="var(--accent)" />
          <rect
            x="228"
            y={90 - rh / 2}
            width="185"
            height={rh}
            fill="#728387"
            stroke="currentColor"
          />
          <path
            d={`M60 ${90 - h / 2}v${h}m-5 0h10M55 ${90 - h / 2}h10`}
            stroke="currentColor"
            fill="none"
          />
          <text x="15" y="95" fill="currentColor" fontSize="12">
            Ø {D}
          </text>
          <text x="125" y="95" fill="var(--accent)" fontSize="14">
            {values.pressure} bar →
          </text>
          <text x="320" y="155" fill="currentColor" fontSize="12">
            Stang Ø {d} mm
          </text>
        </svg>
        <figcaption>
          Doorsnede · verhoudingen begrensd voor leesbaarheid · krachtfactor {values.efficiency}%
        </figcaption>
      </figure>
    );
  }
  const ratio = n("ratio", 10),
    radius = Math.min(56, Math.max(22, 18 * Math.sqrt(ratio)));
  return (
    <figure className="live-schematic">
      <svg
        viewBox="0 0 460 180"
        role="img"
        aria-label={
          kind === "ratio"
            ? `Overbrenging met verhouding ${ratio}`
            : "Mechanisch asvermogen, koppel en toerental"
        }
      >
        <path d="M30 80H430" stroke="currentColor" strokeDasharray="4 6" opacity=".3" />
        <circle cx="125" cy="80" r="28" fill="none" stroke="var(--accent)" strokeWidth="3" />
        <circle
          cx="325"
          cy="80"
          r={kind === "ratio" ? radius : 28}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
        />
        <path d="M125 74h200v12H125Z" fill="currentColor" opacity=".5" />
        <path
          d="M103 36q30-12 43 10l-13-4m13 4-1-13"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
        />
        <text x="80" y="160" fill="currentColor" fontSize="12">
          {kind === "ratio" ? "INGANG" : "KOPPEL T"}
        </text>
        <text x="270" y="160" fill="currentColor" fontSize="12">
          {kind === "ratio" ? `i = ${values.ratio}` : "TOERENTAL n"}
        </text>
      </svg>
      <figcaption>
        {kind === "ratio"
          ? `Schematische transmissie · rendement ${values.efficiency}% · geen tandgeometrie`
          : "Stationair asvermogen P = T · ω"}
      </figcaption>
    </figure>
  );
}
