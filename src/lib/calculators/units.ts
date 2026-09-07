/** Generic unit converter. Each category converts through one SI base unit (see baseLabel). */

export type UnitDef = {
  id: string;
  label: string;
  /** value in this unit -> value in the category's base unit */
  toBase: (v: number) => number;
  /** value in the category's base unit -> value in this unit */
  fromBase: (v: number) => number;
};

export type UnitCategory = {
  id: string;
  label: string;
  baseLabel: string;
  units: UnitDef[];
};

const linear = (id: string, label: string, factor: number): UnitDef => ({
  id,
  label,
  toBase: (v) => v * factor,
  fromBase: (v) => v / factor,
});

/**
 * Conversion factors below are exact definitions (inch, lbf, bar, atm) or the
 * standard derived constants (psi, mmHg) — not rounded estimates. Sources:
 * NIST Special Publication 811 and ISO 80000.
 */
export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    label: "Lengte",
    baseLabel: "mm",
    units: [
      linear("mm", "mm", 1),
      linear("cm", "cm", 10),
      linear("m", "m", 1000),
      linear("inch", "inch (in)", 25.4),
      linear("foot", "foot (ft)", 304.8),
    ],
  },
  {
    id: "temperature",
    label: "Temperatuur",
    baseLabel: "K",
    units: [
      { id: "c", label: "°C", toBase: (v) => v + 273.15, fromBase: (v) => v - 273.15 },
      { id: "k", label: "K", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", label: "°F", toBase: (v) => ((v - 32) * 5) / 9 + 273.15, fromBase: (v) => ((v - 273.15) * 9) / 5 + 32 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    baseLabel: "L (dm³)",
    units: [
      linear("ml", "mL (cm³)", 0.001),
      linear("l", "L (dm³)", 1),
      linear("m3", "m³", 1000),
      linear("usgal", "US gallon", 3.785411784),
      linear("ukgal", "Imperial gallon", 4.54609),
    ],
  },
  {
    id: "force",
    label: "Kracht",
    baseLabel: "N",
    units: [linear("n", "N", 1), linear("kn", "kN", 1000), linear("lbf", "lbf", 4.4482216152605), linear("kgf", "kgf", 9.80665)],
  },
  {
    id: "pressure",
    label: "Druk",
    baseLabel: "Pa",
    units: [
      linear("pa", "Pa", 1),
      linear("kpa", "kPa", 1000),
      linear("mpa", "MPa (N/mm²)", 1_000_000),
      linear("bar", "bar", 100_000),
      linear("psi", "psi", 6894.757293168361),
      linear("atm", "atm", 101_325),
      linear("mmhg", "mmHg", 133.322387415),
    ],
  },
  {
    id: "torque",
    label: "Koppel",
    baseLabel: "N·m",
    units: [linear("nm", "N·m", 1), linear("nmm", "N·mm", 0.001), linear("lbfft", "lbf·ft", 1.3558179483314), linear("lbfin", "lbf·in", 0.1129848290276)],
  },
  {
    id: "mass",
    label: "Massa",
    baseLabel: "kg",
    units: [linear("g", "g", 0.001), linear("kg", "kg", 1), linear("lb", "lb", 0.45359237), linear("oz", "oz", 0.028349523125)],
  },
];

export function findCategory(id: string): UnitCategory {
  return UNIT_CATEGORIES.find((c) => c.id === id) ?? UNIT_CATEGORIES[0];
}

export function findUnit(category: UnitCategory, id: string): UnitDef {
  return category.units.find((u) => u.id === id) ?? category.units[0];
}

export function convert(value: number, category: UnitCategory, fromId: string, toId: string): number {
  const from = findUnit(category, fromId);
  const to = findUnit(category, toId);
  return to.fromBase(from.toBase(value));
}

/** Formats with enough precision to stay useful at both mm and m³ scales, without runaway decimals. */
export function fmtConverted(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs === 0 ? 2 : abs >= 1000 ? 2 : abs >= 1 ? 4 : 6;
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
