export type Values = Record<string, string>;
export function value(raw: string, label: string, min = 0, max = 1e12) {
  if (!raw?.trim()) throw Error(`Vul ${label} in.`);
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n < min || n > max)
    throw Error(`${label}: gebruik een geldig getal van ${min} tot ${max}.`);
  return n;
}
export function driveResult(mode: string, v: Values) {
  const k = 60000 / (2 * Math.PI);
  if (mode === "torque") {
    const n = value(v.speed, "toerental");
    if (!n) throw Error("Toerental moet groter zijn dan nul.");
    return (k * value(v.power, "vermogen")) / n;
  }
  if (mode === "speed") {
    const t = value(v.torque, "koppel");
    if (!t) throw Error("Koppel moet groter zijn dan nul.");
    return (k * value(v.power, "vermogen")) / t;
  }
  return (value(v.torque, "koppel") * value(v.speed, "toerental")) / k;
}
export function ratioResult(v: Values) {
  const i = value(v.ratio, "verhouding");
  if (!i) throw Error("De verhouding moet groter zijn dan nul.");
  return {
    speed: value(v.speed, "toerental") / i,
    torque: (value(v.torque, "koppel") * i * value(v.efficiency, "rendement", 0, 100)) / 100,
  };
}
export function forceResult(v: Values) {
  const p = value(v.pressure, "druk", 0, 1000) * 0.1,
    D = value(v.diameter, "zuigerdiameter", 0, 10000),
    d = value(v.rod, "stangdiameter", 0, 10000),
    eta = value(v.efficiency, "krachtfactor", 0, 100) / 100;
  if (!D || d >= D)
    throw Error("Zuigerdiameter moet groter dan nul én groter dan de stangdiameter zijn.");
  return {
    extend: ((p * Math.PI * D * D) / 4) * eta,
    retract: ((p * Math.PI * (D * D - d * d)) / 4) * eta,
  };
}
