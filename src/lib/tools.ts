export type ToolSection = "tools" | "calculators" | "cad";

export type Tool = {
  id: string;
  section: ToolSection;
  /** URL slug within its section, e.g. section "tools" + slug "fit-tolerances" -> /tools/fit-tolerances */
  slug: string;
  title: string;
  standard: string;
  blurb: string;
  tags: string[];
  /** "live" tools have a working calculator/reference page; "soon" render a coming-soon panel. */
  status: "live" | "soon";
};

export const SECTIONS: { id: ToolSection; label: string; href: string; description: string }[] = [
  {
    id: "tools",
    label: "Tools",
    href: "/tools",
    description: "Maatvoering, toleranties en verbindingsnormen opzoeken.",
  },
  {
    id: "calculators",
    label: "Rekenmodules",
    href: "/calculators",
    description: "Sterkte-, aandrijf- en eenhedenberekeningen.",
  },
  {
    id: "cad",
    label: "CAD",
    href: "/cad",
    description: "CAD-bibliotheken en macro's voor SolidWorks en Inventor.",
  },
];

export const TOOLS: Tool[] = [
  {
    id: "fit-tolerances",
    section: "tools",
    slug: "fit-tolerances",
    title: "Passingen",
    standard: "ISO 286",
    blurb: "Voorkeurpassingen H/JS/G/F/D tot Ø 3150 mm, met speling en overmaat per band.",
    tags: ["h7", "g6", "h6", "js7", "f7", "d9", "k6", "n6", "p6", "s6", "c11", "speling", "overmaat", "boring", "as"],
    status: "live",
  },
  {
    id: "iso-2768",
    section: "tools",
    slug: "iso-2768",
    title: "Algemene toleranties",
    standard: "ISO 2768",
    blurb: "Titelblok-default voor lineaire en hoektoleranties: f/m/c/v en H/K/L.",
    tags: ["titelblok", "algemeen", "maat", "iso 2768", "mk"],
    status: "soon",
  },
  {
    id: "keyways",
    section: "tools",
    slug: "keyways",
    title: "Spiebaan-toleranties",
    standard: "DIN 6885",
    blurb: "Spiemaat en groefdiepte t₁/t₂ per as-diameter, met breedtetolerantie.",
    tags: ["spie", "naaf", "as", "din 6885", "p9", "n9", "js9"],
    status: "live",
  },
  {
    id: "bearing-fits",
    section: "tools",
    slug: "bearing-fits",
    title: "Lagerpassingen",
    standard: "SKF · ISO 286",
    blurb: "Groefkogellagers: vast/losse zijde, SKF-klassen tot Ø 50 mm.",
    tags: ["kogel", "vast", "los", "lager", "j6", "k5", "skf"],
    status: "soon",
  },
  {
    id: "seeger-grooves",
    section: "tools",
    slug: "seeger-grooves",
    title: "Seegerringgroef",
    standard: "DIN 471 / 472",
    blurb: "Groefdiameter, breedte en diepte op as of in boring, tot Ø 100 mm.",
    tags: ["borgveer", "circlip", "as", "boring", "din 471", "din 472"],
    status: "soon",
  },
  {
    id: "fasteners",
    section: "tools",
    slug: "fasteners",
    title: "Bevestigingsmateriaal",
    standard: "ISO 273 · VDI 2230",
    blurb: "M3–M24: doorlaatmaten, sleutelmaten en aandraaimoment 8.8 / 10.9 / 12.9.",
    tags: ["bout", "moer", "moment", "inbus", "m8", "vdi 2230", "iso 273"],
    status: "soon",
  },
  {
    id: "o-ring-grooves",
    section: "tools",
    slug: "o-ring-grooves",
    title: "O-ringgroef",
    standard: "ISO 3601-1",
    blurb: "ISO-koorden 1,80–7,00 mm: groefdiepte en -breedte, radiaal en axiaal.",
    tags: ["afdichting", "koord", "radiaal", "axiaal", "iso 3601"],
    status: "soon",
  },
  {
    id: "edges",
    section: "tools",
    slug: "edges",
    title: "Richtlijnen kanten",
    standard: "Plaatwerk",
    blurb: "Buigradius, minimale beenlengte, groefwijdte en Z-buiging voor zetwerk.",
    tags: ["buigen", "plaat", "zetwerk", "k-factor", "bend allowance"],
    status: "soon",
  },
  {
    id: "units",
    section: "calculators",
    slug: "units",
    title: "Eenheden",
    standard: "SI · imperial",
    blurb: "Inch ↔ mm, °C ↔ K, dm³ ↔ L, lbf ↔ N, psi ↔ bar.",
    tags: ["omrekenen", "inch", "kelvin", "newton", "liter", "psi", "bar"],
    status: "soon",
  },
  {
    id: "motor-specification",
    section: "calculators",
    slug: "motor-specification",
    title: "Motorspecificatie",
    standard: "P = F·v",
    blurb: "Rollenbaan, band, helling of hijsen: toerental, kracht, koppel, vermogen en IEC-stap.",
    tags: ["kw", "koppel", "iec", "aandrijving"],
    status: "soon",
  },
  {
    id: "pneumatic-cylinder",
    section: "calculators",
    slug: "pneumatic-cylinder",
    title: "Pneumatische cilinder",
    standard: "ISO 15552 · 6432",
    blurb: "F = p·A, dubbelwerkend. ISO-boring bepalen bij een last en 6 bar.",
    tags: ["pneumatiek", "festo", "smc", "bar", "zuiger", "kracht"],
    status: "soon",
  },
  {
    id: "buckling",
    section: "calculators",
    slug: "buckling",
    title: "Knikberekening",
    standard: "Euler",
    blurb: "Euler-knik van een slanke staaf: F_cr, kritieke spanning en slankheid λ.",
    tags: ["euler", "kritieke last", "slankheid", "staaf", "kolom"],
    status: "live",
  },
  {
    id: "beam-deflection",
    section: "calculators",
    slug: "beam-deflection",
    title: "Doorbuiging balk",
    standard: "Puntlast",
    blurb: "Doorbuiging van een balk onder een puntlast: vrij opgelegd of uitkraging.",
    tags: ["puntlast", "buiging", "doorbuiging", "balk"],
    status: "soon",
  },
  {
    id: "cad-resources",
    section: "cad",
    slug: "resources",
    title: "CAD-bibliotheken",
    standard: "Bronnen",
    blurb: "3D-modellen, componenten, plaatwerk en naslagwerken.",
    tags: ["grabcad", "mcmaster", "model"],
    status: "soon",
  },
  {
    id: "macros",
    section: "cad",
    slug: "macros",
    title: "Macro-bibliotheek",
    standard: "SolidWorks · Inventor",
    blurb: "Downloadbare VBA-macro's: STEP-export, batch opslaan, eigenschappen tonen.",
    tags: ["vba", "macro", "solidworks", "inventor", "step", "export"],
    status: "soon",
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

export function matchTools(query: string, tools: Tool[] = TOOLS): Tool[] {
  const tokens = foldQuery(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return tools;
  return tools.filter((tool) => {
    const hay = foldQuery(
      [tool.title, tool.standard, tool.blurb, tool.id, ...tool.tags].join(" "),
    );
    return tokens.every((token) => hay.includes(token));
  });
}
