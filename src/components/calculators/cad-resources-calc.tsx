import { ExternalLink } from "lucide-react";
import { CalcEyebrow, CalcPanel, Note } from "@/components/calculators/calc-ui";

type Resource = { name: string; href: string; description: string };
type Category = { title: string; resources: Resource[] };

const CATEGORIES: Category[] = [
  {
    title: "3D-modellen en componenten",
    resources: [
      {
        name: "GrabCAD",
        href: "https://grabcad.com/",
        description: "Grote community-bibliotheek met gratis 3D-modellen in vrijwel elk CAD-formaat.",
      },
      {
        name: "TraceParts",
        href: "https://www.traceparts.com/",
        description: "Fabrikant-catalogi met CAD-modellen van standaardcomponenten (lagers, aandrijvingen, pneumatiek).",
      },
      {
        name: "3D ContentCentral",
        href: "https://www.3dcontentcentral.com/",
        description: "SolidWorks-gerichte bibliotheek met leverancier-componenten.",
      },
      {
        name: "McMaster-Carr",
        href: "https://www.mcmaster.com/",
        description: "Downloadbare CAD-modellen direct bij elk catalogusonderdeel (bouten, lagers, afdichtingen).",
      },
    ],
  },
  {
    title: "Materialen",
    resources: [
      {
        name: "MatWeb",
        href: "https://www.matweb.com/",
        description: "Materiaaleigenschappen-database: metalen, kunststoffen en composieten.",
      },
    ],
  },
  {
    title: "Plaatwerk en fabricage",
    resources: [
      {
        name: "Xometry — design guides",
        href: "https://www.xometry.com/resources/",
        description: "Ontwerprichtlijnen voor plaatwerk, CNC en 3D-printen (buigradius, wanddikte, toleranties).",
      },
      {
        name: "Protolabs — design guides",
        href: "https://www.protolabs.com/resources/",
        description: "Vergelijkbare fabricage-richtlijnen, met focus op spuitgieten en CNC.",
      },
    ],
  },
  {
    title: "Naslagwerken",
    resources: [
      {
        name: "Engineering ToolBox",
        href: "https://www.engineeringtoolbox.com/",
        description: "Snelle naslag voor formules, materiaaldata en omrekentabellen — ook gebruikt als bron elders op Mechify.",
      },
    ],
  },
];

export function CadResourcesCalc() {
  return (
    <CalcPanel>
      <CalcEyebrow>Bronnen</CalcEyebrow>
      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">CAD-bibliotheken</h2>
      <Note>Externe bronnen voor 3D-modellen, componenten, materialen en fabricage-richtlijnen. Mechify beheert deze sites niet — controleer licentievoorwaarden per bron.</Note>

      <div className="mt-8 space-y-8">
        {CATEGORIES.map((cat) => (
          <div key={cat.title}>
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{cat.title}</h3>
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
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.description}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CalcPanel>
  );
}
