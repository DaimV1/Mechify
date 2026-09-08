import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { SourceLink } from "@/components/calculators/calc-ui";
import { fmtN, MATERIALS_E } from "@/lib/calculators/knik";
import { useLocale } from "@/lib/i18n/locale-context";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";

const T = {
  nl: {
    metaTitle: "Materialen",
    metaDescription:
      "Mechanische kengetallen per materiaal: E-modulus en indicatieve vloeigrens, gebruikt in de Mechify-rekenmodules.",
    eyebrow: "Mechify · Naslag",
    title: "Materialen",
    intro:
      "Kengetallen die de rekenmodules gebruiken, bijvoorbeeld voor de Euler-knikberekening. Indicatieve waarden — voor een specifieke legering of kwaliteit blijft het materiaalcertificaat leidend.",
    thMaterial: "Materiaal",
    thE: "E-modulus (N/mm²)",
    thRp: "Rp0,2 indicatief (N/mm²)",
    source: "Engineering ToolBox — Young's modulus of elasticity",
    footnotePrefix:
      "Aluminium is expliciet 6082-T6 (een harde temper); zacht/gegloeid aluminium vloeit al bij 30-100 N/mm². Deze waarden worden onder meer gebruikt in de",
    footnoteLink: "knikberekening",
    planned:
      "Een uitgebreidere materialendatabase (dichtheid, warmtegeleiding, corrosiebestendigheid) staat op de planning voor Mechify.",
  },
  en: {
    metaTitle: "Materials",
    metaDescription:
      "Mechanical properties per material: Young's modulus and indicative yield strength, used in Mechify's calculators.",
    eyebrow: "Mechify · Reference",
    title: "Materials",
    intro:
      "Properties used by the calculators, for example the Euler buckling calculation. Indicative values — for a specific alloy or grade the material certificate remains authoritative.",
    thMaterial: "Material",
    thE: "Young's modulus (N/mm²)",
    thRp: "Rp0.2 indicative (N/mm²)",
    source: "Engineering ToolBox — Young's modulus of elasticity",
    footnotePrefix:
      "Aluminium is explicitly 6082-T6 (a hard temper); soft/annealed aluminium already yields at 30-100 N/mm². These values are used in, among others, the",
    footnoteLink: "buckling calculation",
    planned:
      "A more extensive materials database (density, thermal conductivity, corrosion resistance) is planned for Mechify.",
  },
};

export function Materials() {
  const { locale } = useLocale();
  const t = T[locale];
  useDocumentMeta(t.metaTitle, t.metaDescription);

  return (
    <PageShell>
      <PageWrap wide>
        <Breadcrumbs items={[{ href: "/", label: "Mechify" }, { label: t.title }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{t.intro}</p>

        <div className="table-scroll mt-10">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thMaterial}</th>
                <th>{t.thE}</th>
                <th>{t.thRp}</th>
              </tr>
            </thead>
            <tbody>
              {MATERIALS_E.map((m) => (
                <tr key={m.id}>
                  <th scope="row">{m.label}</th>
                  <td>{fmtN(m.E)}</td>
                  <td>{fmtN(m.Rp02)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.engineeringtoolbox.com/young-modulus-d_417.html">
          {t.source}
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">
          {t.footnotePrefix}{" "}
          <Link to="/calculators/buckling" className="text-accent hover:underline">
            {t.footnoteLink}
          </Link>
          .
        </p>

        <div className="mt-10 rounded-xl border border-dashed border-border-strong bg-surface p-6 text-sm text-muted">
          {t.planned}
        </div>
      </PageWrap>
    </PageShell>
  );
}
