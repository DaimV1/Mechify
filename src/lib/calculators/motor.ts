/** Vereenvoudigd mechanica-model voor motordimensionering: F, n, T, P en IEC-vermogensstap. mm, kg, m/s, N, Nm, W intern. */

export type Application = "rollenbaan" | "band" | "helling" | "hijsen";

export const APPLICATIONS: { id: Application; label: string; labelEn: string }[] = [
  { id: "rollenbaan", label: "Rollenbaan (horizontaal)", labelEn: "Roller conveyor (horizontal)" },
  { id: "band", label: "Transportband (horizontaal)", labelEn: "Belt conveyor (horizontal)" },
  { id: "helling", label: "Hellingbaan", labelEn: "Incline conveyor" },
  { id: "hijsen", label: "Hijsen (verticaal)", labelEn: "Hoisting (vertical)" },
];

const G = 9.81;

/**
 * Benodigde trekkracht F (N), vereenvoudigd:
 * - hijsen: alleen het gewicht, geen wrijving (F = m·g)
 * - helling: zwaartekracht- en wrijvingscomponent langs het vlak (F = m·g·(sinθ + μ·cosθ))
 * - rollenbaan/band: alleen wrijving, horizontaal (F = μ·m·g)
 * Dit is een schatting voor een eerste dimensionering, niet de volledige
 * DIN 22101 / FEM-methode voor bandtransporteurs (die ook versnelling,
 * doorbuigweerstand en meerdere deelweerstanden meeneemt).
 */
export function requiredForce({
  app,
  massKg,
  mu,
  angleDeg,
}: {
  app: Application;
  massKg: number;
  mu: number;
  angleDeg: number;
}): number {
  if (app === "hijsen") return massKg * G;
  if (app === "helling") {
    const rad = (angleDeg * Math.PI) / 180;
    return massKg * G * (Math.sin(rad) + mu * Math.cos(rad));
  }
  return mu * massKg * G;
}

export type MotorResult = {
  force: number;
  rpm: number;
  torque: number;
  shaftPowerW: number;
  designPowerW: number;
  iecPower: number | null;
};

/** n (rpm) = v·60 / (π·D), met D in meter. T (Nm) = F · D/2. P = F·v / η. */
export function computeMotor({
  force,
  speedMs,
  diameterMm,
  efficiency,
  safety,
}: {
  force: number;
  speedMs: number;
  diameterMm: number;
  efficiency: number;
  safety: number;
}): MotorResult | null {
  if (![force, speedMs, diameterMm, efficiency, safety].every(Number.isFinite) || efficiency > 1)
    return null;
  if (!(force >= 0) || !(speedMs > 0) || !(diameterMm > 0) || !(efficiency > 0) || !(safety > 0))
    return null;
  const Dm = diameterMm / 1000;
  const rpm = (speedMs * 60) / (Math.PI * Dm);
  const torque = force * (Dm / 2);
  const shaftPowerW = (force * speedMs) / efficiency;
  const designPowerW = shaftPowerW * safety;
  return {
    force,
    rpm,
    torque,
    shaftPowerW,
    designPowerW,
    iecPower: iecStepFor(designPowerW / 1000),
  };
}

/**
 * Voorkeursreeks vermogens (kW) voor IEC-normmotoren (IEC 60072), het meest
 * gangbare deel van de reeks tot 355 kW zoals gebruikt in fabrikantcatalogi
 * (ABB, Siemens). Grotere vermogens en de exacte beschikbaarheid per
 * polentaal/frame verschillen per fabrikant — controleer de catalogus.
 */
export const IEC_POWERS_KW = [
  0.06, 0.09, 0.12, 0.18, 0.25, 0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22,
  30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 355,
];

export function iecStepFor(requiredKw: number): number | null {
  return IEC_POWERS_KW.find((kw) => kw >= requiredKw) ?? null;
}

export function fmtKw(w: number): string {
  return (w / 1000).toLocaleString("nl-NL", { maximumFractionDigits: 3 });
}

export function fmtRound(n: number, digits = 0): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
