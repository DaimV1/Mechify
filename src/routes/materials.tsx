import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { SourceLink } from "@/components/calculators/calc-ui";
import { fmtN, MATERIALS_E } from "@/lib/calculators/knik";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";

export function Materials() {
  useDocumentMeta(
    "Materialen",
    "Mechanische kengetallen per materiaal: E-modulus en indicatieve vloeigrens, gebruikt in de Mechify-rekenmodules.",
  );

  return (
    <PageShell>
      <PageWrap wide>
        <Breadcrumbs items={[{ href: "/", label: "Mechify" }, { label: "Materialen" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Mechify · Naslag</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Materialen</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Kengetallen die de rekenmodules gebruiken, bijvoorbeeld voor de Euler-knikberekening. Indicatieve
          waarden — voor een specifieke legering of kwaliteit blijft het materiaalcertificaat leidend.
        </p>

        <div className="table-scroll mt-10">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Materiaal</th>
                <th>E-modulus (N/mm²)</th>
                <th>Rp0,2 indicatief (N/mm²)</th>
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
          Engineering ToolBox — Young's modulus of elasticity
        </SourceLink>
        <p className="mt-1 text-xs leading-relaxed text-subtle">
          Aluminium is expliciet 6082-T6 (een harde temper); zacht/gegloeid aluminium vloeit al bij 30-100 N/mm².
          Deze waarden worden onder meer gebruikt in de{" "}
          <Link to="/calculators/buckling" className="text-accent hover:underline">
            knikberekening
          </Link>
          .
        </p>

        <div className="mt-10 rounded-xl border border-dashed border-border-strong bg-surface p-6 text-sm text-muted">
          Een uitgebreidere materialendatabase (dichtheid, warmtegeleiding, corrosiebestendigheid) staat op de
          planning voor Mechify.
        </div>
      </PageWrap>
    </PageShell>
  );
}
