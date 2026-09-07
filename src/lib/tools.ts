import type { Locale, Localized } from "@/lib/i18n/locale-context";

export type ToolSection = "tools" | "calculators" | "cad";

export type Tool = {
  id: string;
  section: ToolSection;
  /** URL slug within its section, e.g. section "tools" + slug "fit-tolerances" -> /tools/fit-tolerances */
  slug: string;
  title: Localized;
  standard: string;
  blurb: Localized;
  tags: string[];
  /** "live" tools have a working calculator/reference page; "soon" render a coming-soon panel. */
  status: "live" | "soon";
};

export function getToolText(tool: Tool, locale: Locale) {
  return { title: tool.title[locale], blurb: tool.blurb[locale] };
}

export const SECTIONS: { id: ToolSection; label: Localized; href: string; description: Localized }[] = [
  {
    id: "tools",
    label: { nl: "Tools", en: "Tools" },
    href: "/tools",
    description: {
      nl: "Maatvoering, toleranties en verbindingsnormen opzoeken.",
      en: "Look up dimensions, tolerances and connection standards.",
    },
  },
  {
    id: "calculators",
    label: { nl: "Rekenmodules", en: "Calculators" },
    href: "/calculators",
    description: {
      nl: "Sterkte-, aandrijf- en eenhedenberekeningen.",
      en: "Strength, drive and unit calculations.",
    },
  },
  {
    id: "cad",
    label: { nl: "CAD", en: "CAD" },
    href: "/cad",
    description: {
      nl: "CAD-bibliotheken en macro's voor SolidWorks en Inventor.",
      en: "CAD libraries and macros for SolidWorks and Inventor.",
    },
  },
];

export function getSectionText(section: (typeof SECTIONS)[number], locale: Locale) {
  return { label: section.label[locale], description: section.description[locale] };
}

export const TOOLS: Tool[] = [
  {
    id: "fit-tolerances",
    section: "tools",
    slug: "fit-tolerances",
    title: { nl: "Passingen", en: "Fits" },
    standard: "ISO 286",
    blurb: {
      nl: "Voorkeurpassingen H/JS/G/F/D tot Ø 3150 mm, met speling en overmaat per band.",
      en: "Preferred fits H/JS/G/F/D up to Ø 3150 mm, with clearance and interference per band.",
    },
    tags: ["h7", "g6", "h6", "js7", "f7", "d9", "k6", "n6", "p6", "s6", "c11", "speling", "overmaat", "boring", "as", "clearance", "interference", "fit", "bore", "shaft"],
    status: "live",
  },
  {
    id: "iso-2768",
    section: "tools",
    slug: "iso-2768",
    title: { nl: "Algemene toleranties", en: "General tolerances" },
    standard: "ISO 2768",
    blurb: {
      nl: "Titelblok-default voor lineaire en hoektoleranties: f/m/c/v en H/K/L.",
      en: "Title-block default for linear and angular tolerances: f/m/c/v and H/K/L.",
    },
    tags: ["titelblok", "algemeen", "maat", "iso 2768", "mk", "title block", "general", "size"],
    status: "live",
  },
  {
    id: "keyways",
    section: "tools",
    slug: "keyways",
    title: { nl: "Spiebaan-toleranties", en: "Keyway tolerances" },
    standard: "DIN 6885",
    blurb: {
      nl: "Spiemaat en groefdiepte t₁/t₂ per as-diameter, met breedtetolerantie.",
      en: "Key size and groove depth t₁/t₂ per shaft diameter, with width tolerance.",
    },
    tags: ["spie", "naaf", "as", "din 6885", "p9", "n9", "js9", "key", "keyway", "hub", "shaft"],
    status: "live",
  },
  {
    id: "bearing-fits",
    section: "tools",
    slug: "bearing-fits",
    title: { nl: "Lagerpassingen", en: "Bearing fits" },
    standard: "SKF · ISO 286",
    blurb: {
      nl: "Groefkogellagers: vast/losse zijde, SKF-klassen tot Ø 50 mm.",
      en: "Deep groove ball bearings: fixed/floating side, SKF classes up to Ø 50 mm.",
    },
    tags: ["kogel", "vast", "los", "lager", "j6", "k5", "skf", "bearing", "ball", "fixed", "floating"],
    status: "live",
  },
  {
    id: "seeger-grooves",
    section: "tools",
    slug: "seeger-grooves",
    title: { nl: "Seegerringgroef", en: "Circlip groove" },
    standard: "DIN 471 / 472",
    blurb: {
      nl: "Groefdiameter, breedte en diepte op as of in boring, tot Ø 100 mm.",
      en: "Groove diameter, width and depth on shaft or in bore, up to Ø 100 mm.",
    },
    tags: ["borgveer", "circlip", "as", "boring", "din 471", "din 472", "retaining ring", "shaft", "bore"],
    status: "live",
  },
  {
    id: "fasteners",
    section: "tools",
    slug: "fasteners",
    title: { nl: "Bevestigingsmateriaal", en: "Fasteners" },
    standard: "ISO 273 · VDI 2230",
    blurb: {
      nl: "M3–M24: doorlaatmaten, sleutelmaten en aandraaimoment 8.8 / 10.9 / 12.9.",
      en: "M3–M24: clearance holes, wrench sizes and tightening torque 8.8 / 10.9 / 12.9.",
    },
    tags: ["bout", "moer", "moment", "inbus", "m8", "vdi 2230", "iso 273", "bolt", "nut", "torque", "hex socket"],
    status: "live",
  },
  {
    id: "o-ring-grooves",
    section: "tools",
    slug: "o-ring-grooves",
    title: { nl: "O-ringgroef", en: "O-ring groove" },
    standard: "ISO 3601-1",
    blurb: {
      nl: "ISO-koorden 1,80–7,00 mm: groefdiepte en -breedte, radiaal en axiaal.",
      en: "ISO cords 1.80–7.00 mm: groove depth and width, radial and axial.",
    },
    tags: ["afdichting", "koord", "radiaal", "axiaal", "iso 3601", "seal", "cord", "radial", "axial"],
    status: "live",
  },
  {
    id: "edges",
    section: "tools",
    slug: "edges",
    title: { nl: "Richtlijnen kanten", en: "Sheet metal edge guidelines" },
    standard: "Plaatwerk",
    blurb: {
      nl: "Buigradius, minimale beenlengte, groefwijdte en Z-buiging voor zetwerk.",
      en: "Bend radius, minimum flange length, die width and Z-bend for sheet metal.",
    },
    tags: ["buigen", "plaat", "zetwerk", "k-factor", "bend allowance", "sheet metal", "bending", "flange"],
    status: "live",
  },
  {
    id: "units",
    section: "calculators",
    slug: "units",
    title: { nl: "Eenheden", en: "Units" },
    standard: "SI · imperial",
    blurb: {
      nl: "Inch ↔ mm, °C ↔ K, dm³ ↔ L, lbf ↔ N, psi ↔ bar.",
      en: "Inch ↔ mm, °C ↔ K, dm³ ↔ L, lbf ↔ N, psi ↔ bar.",
    },
    tags: ["omrekenen", "inch", "kelvin", "newton", "liter", "psi", "bar", "convert", "conversion"],
    status: "live",
  },
  {
    id: "motor-specification",
    section: "calculators",
    slug: "motor-specification",
    title: { nl: "Motorspecificatie", en: "Motor sizing" },
    standard: "P = F·v",
    blurb: {
      nl: "Rollenbaan, band, helling of hijsen: toerental, kracht, koppel, vermogen en IEC-stap.",
      en: "Roller conveyor, belt, incline or hoist: speed, force, torque, power and IEC step.",
    },
    tags: ["kw", "koppel", "iec", "aandrijving", "torque", "power", "drive", "conveyor", "hoist"],
    status: "live",
  },
  {
    id: "pneumatic-cylinder",
    section: "calculators",
    slug: "pneumatic-cylinder",
    title: { nl: "Pneumatische cilinder", en: "Pneumatic cylinder" },
    standard: "ISO 15552 · 6432",
    blurb: {
      nl: "F = p·A, dubbelwerkend. ISO-boring bepalen bij een last en 6 bar.",
      en: "F = p·A, double-acting. Determine the ISO bore for a load at 6 bar.",
    },
    tags: ["pneumatiek", "festo", "smc", "bar", "zuiger", "kracht", "pneumatic", "piston", "force", "bore"],
    status: "live",
  },
  {
    id: "buckling",
    section: "calculators",
    slug: "buckling",
    title: { nl: "Knikberekening", en: "Buckling calculation" },
    standard: "Euler",
    blurb: {
      nl: "Euler-knik van een slanke staaf: F_cr, kritieke spanning en slankheid λ.",
      en: "Euler buckling of a slender column: F_cr, critical stress and slenderness λ.",
    },
    tags: ["euler", "kritieke last", "slankheid", "staaf", "kolom", "buckling", "critical load", "slenderness", "column"],
    status: "live",
  },
  {
    id: "beam-deflection",
    section: "calculators",
    slug: "beam-deflection",
    title: { nl: "Doorbuiging balk", en: "Beam deflection" },
    standard: "Puntlast",
    blurb: {
      nl: "Doorbuiging van een balk onder een puntlast: vrij opgelegd of uitkraging.",
      en: "Deflection of a beam under a point load: simply supported or cantilever.",
    },
    tags: ["puntlast", "buiging", "doorbuiging", "balk", "point load", "bending", "deflection", "beam", "cantilever"],
    status: "live",
  },
  {
    id: "cad-resources",
    section: "cad",
    slug: "resources",
    title: { nl: "CAD-bibliotheken", en: "CAD libraries" },
    standard: "Bronnen",
    blurb: {
      nl: "3D-modellen, componenten, plaatwerk en naslagwerken.",
      en: "3D models, components, sheet metal and reference resources.",
    },
    tags: ["grabcad", "mcmaster", "model", "resources", "library"],
    status: "live",
  },
  {
    id: "macros",
    section: "cad",
    slug: "macros",
    title: { nl: "Macro-bibliotheek", en: "Macro library" },
    standard: "SolidWorks · Inventor",
    blurb: {
      nl: "Kopieerbare VBA-macro's: STEP-export, batch opslaan, eigenschappen tonen.",
      en: "Copy-ready VBA macros: STEP export, batch save, show properties.",
    },
    tags: ["vba", "macro", "solidworks", "inventor", "step", "export", "properties"],
    status: "live",
  },
];

export function toolHref(tool: Tool) {
  return `/${tool.section}/${tool.slug}`;
}

export function toolsInSection(section: ToolSection) {
  return TOOLS.filter((t) => t.section === section);
}

export function findTool(section: ToolSection, slug: string) {
  return TOOLS.find((t) => t.section === section && t.slug === slug) ?? null;
}

function foldQuery(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ø/gi, "o")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export const DIAMETER_KEY = "mechify-diameter";

function inRange(raw: string, min?: number, max?: number) {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return false;
  if (min != null && n < min) return false;
  if (max != null && n > max) return false;
  return true;
}

/** Remembers the last diameter entered across tools, so switching tools keeps a sensible starting value. */
export function readStoredDiameter({
  min,
  max,
  fallback = "20",
}: {
  min?: number;
  max?: number;
  fallback?: string;
} = {}) {
  if (typeof window === "undefined") {
    return inRange(fallback, min, max) ? fallback : "";
  }
  const raw = sessionStorage.getItem(DIAMETER_KEY);
  if (raw && /^\d{1,4}$/.test(raw) && inRange(raw, min, max)) return raw;
  if (inRange(fallback, min, max)) return fallback;
  return "";
}

export function storeDiameter(value: string) {
  if (typeof window === "undefined") return;
  if (/^\d{1,4}$/.test(value)) sessionStorage.setItem(DIAMETER_KEY, value);
}

/** Matches against both languages' title/blurb regardless of the active UI locale, so search works either way. */
export function matchTools(query: string, tools: Tool[] = TOOLS): Tool[] {
  const tokens = foldQuery(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return tools;
  return tools.filter((tool) => {
    const hay = foldQuery(
      [tool.title.nl, tool.title.en, tool.standard, tool.blurb.nl, tool.blurb.en, tool.id, ...tool.tags].join(" "),
    );
    return tokens.every((token) => hay.includes(token));
  });
}
