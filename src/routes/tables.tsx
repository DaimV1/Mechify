import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/badge";
import { TOOLS, toolHref } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";

const STANDARD_GROUPS = [
  { standard: "ISO 286", note: "Voorkeurpassingen en limietafwijkingen voor gaten en assen." },
  { standard: "ISO 2768", note: "Algemene toleranties voor lineaire en hoekmaten." },
  { standard: "DIN 6885", note: "Spiebaanmaten en toleranties voor as-naafverbindingen." },
  { standard: "SKF · ISO 286", note: "Lagerpassingen voor groefkogellagers." },
  { standard: "DIN 471 / 472", note: "Seegerringgroeven voor as en boring." },
  { standard: "ISO 273 · VDI 2230", note: "Bevestigingsmateriaal: doorlaat en aandraaimoment." },
  { standard: "ISO 3601-1", note: "O-ringgroeven voor statische en dynamische afdichting." },
];

export function Tables() {
  useDocumentMeta(
    "Tabellen & normen",
    "Overzicht van de normen en referentietabellen die Mechify aanhoudt: ISO 286, ISO 2768, DIN 6885, DIN 471/472, ISO 3601 en meer.",
  );

  return (
    <PageShell>
      <PageWrap wide>
        <Breadcrumbs items={[{ href: "/", label: "Mechify" }, { label: "Tabellen & normen" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Mechify · Naslag</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Tabellen &amp; normen</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Elke rekenmodule op Mechify is gebouwd op een specifieke norm of erkende bron. Hieronder een overzicht per
          norm, met een directe link naar de bijbehorende tool en zijn referentietabellen.
        </p>

        <div className="mt-10 divide-y divide-border rounded-xl border border-border-strong bg-surface">
          {STANDARD_GROUPS.map((group) => {
            const tools = TOOLS.filter((t) => t.standard === group.standard);
            return (
              <div key={group.standard} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-mono text-sm font-semibold uppercase tracking-wide text-accent">
                    {group.standard}
                  </h2>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{group.note}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        to={toolHref(tool)}
                        className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-bg px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent/60"
                      >
                        {tool.title}
                        <StatusBadge status={tool.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </PageWrap>
    </PageShell>
  );
}
