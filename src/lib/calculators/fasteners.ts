/**
 * Bevestigingsmateriaal: doorlaatmaten (ISO 273), sleutelmaten en
 * aandraaimoment voor metrische bouten M3–M24. mm, N, N·m intern.
 */

export const THREAD_SIZES = ["M3", "M4", "M5", "M6", "M8", "M10", "M12", "M14", "M16", "M18", "M20", "M22", "M24"] as const;
export type ThreadSize = (typeof THREAD_SIZES)[number];

export function nominalDiameter(size: ThreadSize): number {
  return Number(size.slice(1));
}

/** ISO 273 doorlaatmaten (mm): fijne, middel en grove rij. */
export const CLEARANCE_HOLES: Record<ThreadSize, { fine: number; medium: number; coarse: number }> = {
  M3: { fine: 3.2, medium: 3.4, coarse: 3.6 },
  M4: { fine: 4.3, medium: 4.5, coarse: 4.8 },
  M5: { fine: 5.3, medium: 5.5, coarse: 5.8 },
  M6: { fine: 6.4, medium: 6.6, coarse: 7.0 },
  M8: { fine: 8.4, medium: 9.0, coarse: 10.0 },
  M10: { fine: 10.5, medium: 11.0, coarse: 12.0 },
  M12: { fine: 13.0, medium: 13.5, coarse: 14.5 },
  M14: { fine: 15.0, medium: 15.5, coarse: 16.5 },
  M16: { fine: 17.0, medium: 17.5, coarse: 18.5 },
  M18: { fine: 19.0, medium: 20.0, coarse: 21.0 },
  M20: { fine: 21.0, medium: 22.0, coarse: 24.0 },
  M22: { fine: 23.0, medium: 24.0, coarse: 26.0 },
  M24: { fine: 25.0, medium: 26.0, coarse: 28.0 },
};

/**
 * Sleutelmaten (mm): zeskant boutkop (ISO 4014/4017) en inbus (ISO 4762 /
 * DIN 912). M14, M18 en M22 zijn minder gangbare maten — niet elke
 * catalogus voert ze in elke koptype.
 */
export const WRENCH_SIZES: Record<ThreadSize, { hex: number; socket: number }> = {
  M3: { hex: 5.5, socket: 2.5 },
  M4: { hex: 7, socket: 3 },
  M5: { hex: 8, socket: 4 },
  M6: { hex: 10, socket: 5 },
  M8: { hex: 13, socket: 6 },
  M10: { hex: 16, socket: 8 },
  M12: { hex: 18, socket: 10 },
  M14: { hex: 21, socket: 12 },
  M16: { hex: 24, socket: 14 },
  M18: { hex: 27, socket: 14 },
  M20: { hex: 30, socket: 17 },
  M22: { hex: 34, socket: 17 },
  M24: { hex: 36, socket: 19 },
};

/** Spanningsdoorsnede A_s (mm²) volgens ISO 898-1, metrisch grof schroefdraad. */
export const STRESS_AREA: Record<ThreadSize, number> = {
  M3: 5.03,
  M4: 8.78,
  M5: 14.2,
  M6: 20.1,
  M8: 36.6,
  M10: 58.0,
  M12: 84.3,
  M14: 115,
  M16: 157,
  M18: 192,
  M20: 245,
  M22: 303,
  M24: 353,
};

export type PropertyClass = { id: string; tensile: number; yieldRatio: number };

/** ISO 898-1: treksterkte = X·100 N/mm², vloeigrens = treksterkte × Y/10 (klasse X.Y). */
export const PROPERTY_CLASSES: PropertyClass[] = [
  { id: "8.8", tensile: 800, yieldRatio: 0.8 },
  { id: "10.9", tensile: 1000, yieldRatio: 0.9 },
  { id: "12.9", tensile: 1200, yieldRatio: 0.9 },
];

export function yieldStress(cls: PropertyClass): number {
  return cls.tensile * cls.yieldRatio;
}

export type TorqueResult = { As: number; Rp: number; preload: number; torque: number };

/**
 * Aandraaimoment T = K · F_voorspankracht · d, met F = utilisatie · Rp0,2 · A_s.
 * K ≈ 0,2 (moerfactor) is de gangbare vuistregel voor niet-gesmeerde,
 * zwart/fosfaat afgewerkte stalen bevestigers (Shigley e.a.); bij vet,
 * MoS₂ of roestvast staal kan K 0,10–0,20 zijn — pas aan indien bekend.
 * Utilisatie 0,75 × Rp0,2 is de gangbare doelvoorspanning voor algemene
 * verbindingen (VDI 2230-achtige praktijk), geen norm-verplichting.
 */
export function computeTorque(size: ThreadSize, cls: PropertyClass, K = 0.2, utilization = 0.75): TorqueResult {
  const As = STRESS_AREA[size];
  const Rp = yieldStress(cls);
  const d = nominalDiameter(size);
  const preload = utilization * Rp * As;
  const torque = (K * preload * d) / 1000;
  return { As, Rp, preload, torque };
}

export function fmtFastener(n: number, digits = 1): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}
