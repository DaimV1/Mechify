/**
 * ISO 2768 algemene toleranties. Twee delen:
 * - ISO 2768-1: lineaire maten, radii/afschuiningen en hoekmaten. Klassen
 *   f (fijn), m (middel), c (grof), v (zeer grof).
 * - ISO 2768-2: geometrische toleranties (rechtheid/vlakheid,
 *   loodrechtheid, symmetrie, rondloop) zonder individuele aanduiding.
 *   Klassen H, K, L.
 *
 * Tabelwaarden zijn getranscribeerd van veelgebruikte, publiek
 * gepubliceerde samenvattingen van ISO 2768-1/-2 (o.a. terug te vinden in
 * machinebouw-naslagwerken en CAD-standaardbibliotheken). Voor
 * contractueel bindende tekeningen: verifieer tegen de originele
 * ISO-norm.
 */

export type LinearClass = "f" | "m" | "c" | "v";
export type GeoClass = "H" | "K" | "L";

export const LINEAR_CLASSES: { id: LinearClass; label: string; labelEn: string }[] = [
  { id: "f", label: "f — fijn", labelEn: "f — fine" },
  { id: "m", label: "m — middel", labelEn: "m — medium" },
  { id: "c", label: "c — grof", labelEn: "c — coarse" },
  { id: "v", label: "v — zeer grof", labelEn: "v — very coarse" },
];

export const GEO_CLASSES: { id: GeoClass; label: string }[] = [
  { id: "H", label: "H" },
  { id: "K", label: "K" },
  { id: "L", label: "L" },
];

type LinearBand = {
  over: number;
  to: number;
  label: string;
  f: number | null;
  m: number | null;
  c: number | null;
  v: number | null;
};

/** ISO 2768-1 Tabel 1: toegestane afwijking lineaire maten (mm). */
export const LINEAR_BANDS: LinearBand[] = [
  { over: 0, to: 3, label: "0,5 – 3", f: 0.05, m: 0.1, c: 0.2, v: null },
  { over: 3, to: 6, label: ">3 – 6", f: 0.05, m: 0.1, c: 0.3, v: 0.5 },
  { over: 6, to: 30, label: ">6 – 30", f: 0.1, m: 0.2, c: 0.5, v: 1.0 },
  { over: 30, to: 120, label: ">30 – 120", f: 0.15, m: 0.3, c: 0.8, v: 1.5 },
  { over: 120, to: 400, label: ">120 – 400", f: 0.2, m: 0.5, c: 1.2, v: 2.5 },
  { over: 400, to: 1000, label: ">400 – 1000", f: 0.3, m: 0.8, c: 2.0, v: 4.0 },
  { over: 1000, to: 2000, label: ">1000 – 2000", f: 0.5, m: 1.2, c: 3.0, v: 6.0 },
  { over: 2000, to: 4000, label: ">2000 – 4000", f: null, m: 2.0, c: 4.0, v: 8.0 },
];

/** ISO 2768-1 Tabel 2: toegestane afwijking buitenradii en afschuiningshoogten (mm). */
export const RADIUS_CHAMFER_BANDS: LinearBand[] = [
  { over: 0, to: 3, label: "0,5 – 3", f: 0.2, m: 0.2, c: 0.4, v: 0.4 },
  { over: 3, to: 6, label: ">3 – 6", f: 0.5, m: 0.5, c: 1.0, v: 1.0 },
  { over: 6, to: Infinity, label: ">6", f: 1.0, m: 1.0, c: 2.0, v: 2.0 },
];

type AngularBand = {
  over: number;
  to: number;
  label: string;
  f: number;
  m: number;
  c: number;
  v: number;
};

/** ISO 2768-1 Tabel 3: toegestane afwijking hoekmaten (graden), o.b.v. lengte kortste been (mm). */
export const ANGULAR_BANDS: AngularBand[] = [
  { over: 0, to: 10, label: "≤10", f: 1, m: 1, c: 1.5, v: 3 },
  { over: 10, to: 50, label: ">10 – 50", f: 0.5, m: 0.5, c: 1, v: 2 },
  { over: 50, to: 120, label: ">50 – 120", f: 1 / 3, m: 1 / 3, c: 0.5, v: 1 },
  { over: 120, to: 400, label: ">120 – 400", f: 1 / 6, m: 1 / 6, c: 0.25, v: 0.5 },
  { over: 400, to: Infinity, label: ">400", f: 1 / 12, m: 1 / 12, c: 1 / 6, v: 1 / 3 },
];

type GeoBand = { over: number; to: number; label: string; H: number; K: number; L: number };

/** ISO 2768-2 Tabel 4: rechtheid en vlakheid (mm), o.b.v. nominale lengte. */
export const STRAIGHTNESS_FLATNESS_BANDS: GeoBand[] = [
  { over: 0, to: 10, label: "≤10", H: 0.02, K: 0.05, L: 0.1 },
  { over: 10, to: 30, label: ">10 – 30", H: 0.05, K: 0.1, L: 0.2 },
  { over: 30, to: 100, label: ">30 – 100", H: 0.1, K: 0.2, L: 0.4 },
  { over: 100, to: 300, label: ">100 – 300", H: 0.2, K: 0.4, L: 0.8 },
  { over: 300, to: 1000, label: ">300 – 1000", H: 0.3, K: 0.6, L: 1.2 },
  { over: 1000, to: 3000, label: ">1000 – 3000", H: 0.4, K: 0.8, L: 1.6 },
];

/** ISO 2768-2 Tabel 5: loodrechtheid (mm), o.b.v. lengte kortste zijde. */
export const PERPENDICULARITY_BANDS: GeoBand[] = [
  { over: 0, to: 100, label: "≤100", H: 0.2, K: 0.4, L: 0.6 },
  { over: 100, to: 300, label: ">100 – 300", H: 0.3, K: 0.6, L: 1.0 },
  { over: 300, to: 1000, label: ">300 – 1000", H: 0.4, K: 0.8, L: 1.5 },
  { over: 1000, to: 3000, label: ">1000 – 3000", H: 0.5, K: 1.0, L: 2.0 },
];

/** ISO 2768-2 Tabel 6: symmetrie (mm), o.b.v. nominale lengte. */
export const SYMMETRY_BANDS: GeoBand[] = [
  { over: 0, to: 100, label: "≤100", H: 0.5, K: 0.6, L: 0.6 },
  { over: 100, to: 300, label: ">100 – 300", H: 0.5, K: 0.6, L: 1.0 },
  { over: 300, to: 1000, label: ">300 – 1000", H: 0.5, K: 0.8, L: 1.5 },
  { over: 1000, to: 3000, label: ">1000 – 3000", H: 0.5, K: 1.0, L: 2.0 },
];

/** ISO 2768-2 Tabel 7: rondloop (mm) — één waarde per klasse, onafhankelijk van lengte. */
export const RUNOUT: Record<GeoClass, number> = { H: 0.1, K: 0.2, L: 0.5 };

function findBand<T extends { over: number; to: number }>(bands: T[], size: number): T | null {
  return bands.find((b) => size > b.over && size <= b.to) ?? null;
}

export function lookupLinear(size: number): LinearBand | null {
  return findBand(LINEAR_BANDS, size);
}

export function lookupRadiusChamfer(size: number): LinearBand | null {
  return findBand(RADIUS_CHAMFER_BANDS, size);
}

export function lookupAngular(legLength: number): AngularBand | null {
  return findBand(ANGULAR_BANDS, legLength);
}

export function lookupStraightnessFlatness(length: number): GeoBand | null {
  return findBand(STRAIGHTNESS_FLATNESS_BANDS, length);
}

export function lookupPerpendicularity(length: number): GeoBand | null {
  return findBand(PERPENDICULARITY_BANDS, length);
}

export function lookupSymmetry(length: number): GeoBand | null {
  return findBand(SYMMETRY_BANDS, length);
}

/** Formats a decimal-degree tolerance as ±deg°min', e.g. 0.5 -> "±0°30'". */
export function fmtAngle(deg: number): string {
  const totalMin = Math.round(deg * 60);
  const d = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `±${d}°` : `±${d}°${String(m).padStart(2, "0")}'`;
}

export function fmtIso2768(n: number | null): string {
  if (n == null) return "—";
  return `±${n.toLocaleString("nl-NL", { maximumFractionDigits: 3 })}`;
}
