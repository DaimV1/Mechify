import { ExternalLink } from "lucide-react";
import { CalcEyebrow, CalcPanel, Note } from "@/components/calculators/calc-ui";
import { useLocale, type Locale } from "@/lib/i18n/locale-context";

type Resource = { name: string; href: string; description: Record<Locale, string> };
type Category = { title: Record<Locale, string>; resources: Resource[] };

const CATEGORIES: Category[] = [
  {
    title: { nl: "3D-modellen en componenten", en: "3D models and components" },
    resources: [
      {
        name: "GrabCAD",
        href: "https://grabcad.com/",
        description: {
          nl: "Grote community-bibliotheek met gratis 3D-modellen in vrijwel elk CAD-formaat.",
          en: "Large community library with free 3D models in almost any CAD format.",
        },
      },
      {
        name: "TraceParts",
        href: "https://www.traceparts.com/",
        description: {
          nl: "Fabrikant-catalogi met CAD-modellen van standaardcomponenten (lagers, aandrijvingen, pneumatiek).",
          en: "Manufacturer catalogs with CAD models of standard components (bearings, drives, pneumatics).",
        },
      },
      {
        name: "3D ContentCentral",
        href: "https://www.3dcontentcentral.com/",
        description: {
          nl: "SolidWorks-gerichte bibliotheek met leverancier-componenten.",
          en: "SolidWorks-focused library with supplier components.",
        },
      },
      {
        name: "McMaster-Carr",
        href: "https://www.mcmaster.com/",
        description: {
          nl: "Downloadbare CAD-modellen direct bij elk catalogusonderdeel (bouten, lagers, afdichtingen).",
          en: "Downloadable CAD models directly with every catalog part (bolts, bearings, seals).",
        },
      },
    ],
  },
  {
    title: { nl: "Materialen", en: "Materials" },
    resources: [
      {
        name: "MatWeb",
        href: "https://www.matweb.com/",
        description: {
          nl: "Materiaaleigenschappen-database: metalen, kunststoffen en composieten.",
          en: "Material properties database: metals, plastics and composites.",
        },
      },
    ],
  },
  {
    title: { nl: "Plaatwerk en fabricage", en: "Sheet metal and fabrication" },
    resources: [
      {
        name: "Xometry — design guides",
        href: "https://www.xometry.com/resources/",
        description: {
          nl: "Ontwerprichtlijnen voor plaatwerk, CNC en 3D-printen (buigradius, wanddikte, toleranties).",
          en: "Design guidelines for sheet metal, CNC and 3D printing (bend radius, wall thickness, tolerances).",
        },
      },
      {
        name: "Protolabs — design guides",
        href: "https://www.protolabs.com/resources/",
        description: {
          nl: "Vergelijkbare fabricage-richtlijnen, met focus op spuitgieten en CNC.",
          en: "Similar manufacturing guidelines, focused on injection molding and CNC.",
        },
      },
    ],
  },
  {
    title: { nl: "Naslagwerken", en: "Reference resources" },
    resources: [
      {
        name: "Engineering ToolBox",
        href: "https://www.engineeringtoolbox.com/",
        description: {
          nl: "Snelle naslag voor formules, materiaaldata en omrekentabellen — ook gebruikt als bron elders op Mechify.",
          en: "Quick reference for formulas, material data and conversion tables — also used as a source elsewhere on Mechify.",
        },
      },
    ],
  },
];

const T = {
  nl: { eyebrow: "Bronnen", heading: "CAD-bibliotheken", intro: "Externe bronnen voor 3D-modellen, componenten, materialen en fabricage-richtlijnen. Mechify beheert deze sites niet — controleer licentievoorwaarden per bron." },
  en: { eyebrow: "Resources", heading: "CAD libraries", intro: "External resources for 3D models, components, materials and manufacturing guidelines. Mechify does not manage these sites — check the license terms for each source." },
};

export function CadResourcesCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  return (
    <CalcPanel>
      <CalcEyebrow>{t.eyebrow}</CalcEyebrow>
      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{t.heading}</h2>
      <Note>{t.intro}</Note>

      <div className="mt-8 space-y-8">
        {CATEGORIES.map((cat) => (
          <div key={cat.title.nl}>
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{cat.title[locale]}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {cat.resources.map((r) => (
                <a
                  key={r.name}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
                >
                  <p className="flex items-center gap-1.5 font-medium text-ink">
                    {r.name}
                    <ExternalLink className="size-3.5 text-subtle transition-colors group-hover:text-ink" aria-hidden="true" />
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.description[locale]}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CalcPanel>
  );
}
