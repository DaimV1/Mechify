/**
 * Browser-side fallback for legacy links reached through client navigation.
 * Fresh HTTP requests are redirected by vercel.json before the app loads.
 */
export const LEGACY_TOOL_ROUTES: Readonly<Record<string, string>> = {
  passingen: "/tools/fit-tolerances",
  "iso-2768": "/tools/iso-2768",
  "spiebaan-toleranties": "/tools/keyways",
  lagerpassingen: "/tools/bearing-fits",
  "seegerring-groef": "/tools/seeger-grooves",
  bevestigers: "/tools/fasteners",
  "o-ringgroef": "/tools/o-ring-grooves",
  kanten: "/tools/edges",
  motorspecificatie: "/calculators/motor-specification",
  cilinder: "/calculators/pneumatic-cylinder",
  knikberekening: "/calculators/buckling",
  "doorbuiging-balk": "/calculators/beam-deflection",
  eenheden: "/calculators/units",
  bronnen: "/cad/resources",
  macros: "/cad/macros",
  koppel: "/calculators/drive-power",
  overbrenging: "/calculators/transmission",
  converter: "/calculators/units",
};

export const LEGACY_REDIRECTS: Readonly<Record<string, string>> = {
  "/over": "/about",
  ...Object.fromEntries(
    Object.entries(LEGACY_TOOL_ROUTES).map(([slug, destination]) => [
      `/toolkit/${slug}`,
      destination,
    ]),
  ),
};

/**
 * Resolves client-side visits that do not pass through Vercel. The platform
 * redirects fresh requests; keeping this pure makes the query migration
 * independently testable.
 */
export function resolveLegacyRoute(pathname: string, search = ""): string | null {
  const target = LEGACY_REDIRECTS[pathname];
  if (!target) return null;

  const [base, defaults = ""] = target.split("?");
  const params = new URLSearchParams(search);
  // Match Vercel: query values declared on the destination take precedence
  // over same-named values supplied by the caller.
  new URLSearchParams(defaults).forEach((value, key) => params.set(key, value));

  if (pathname === "/toolkit/iso-2768") {
    return base + withSearch(normalizeIso2768LegacyParams(params));
  }

  return base + withSearch(params);
}

/**
 * Normalizes query aliases after a platform redirect. Vercel preserves the
 * incoming query, but cannot rename these three historical keys. The target
 * calculator calls this too, so fresh HTTP and in-app navigation agree.
 */
export function normalizeIso2768LegacyParams(input: URLSearchParams | string): URLSearchParams {
  const params = new URLSearchParams(input);
  const legacyLength = params.get("len");
  const legacyLinearClass = params.get("linear");
  const legacyGeometricClass = params.get("form");
  if (legacyLength !== null) {
    if (!params.has("d")) params.set("d", legacyLength);
    if (!params.has("leg")) params.set("leg", legacyLength);
    if (!params.has("gl")) params.set("gl", legacyLength);
  }
  if (legacyLinearClass !== null && !params.has("lc")) params.set("lc", legacyLinearClass);
  if (legacyGeometricClass !== null && !params.has("gc")) params.set("gc", legacyGeometricClass);
  for (const key of ["len", "linear", "form"]) params.delete(key);
  return params;
}

function withSearch(params: URLSearchParams): string {
  return params.size ? `?${params.toString()}` : "";
}
