import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { useDocumentMeta } from "@/lib/use-document-meta";

export function About() {
  useDocumentMeta(
    "Over Mechify",
    "Waarom Mechify bestaat, wie het bouwt en hoe de rekenmodules tot stand komen.",
  );

  return (
    <PageShell>
      <PageWrap>
        <Breadcrumbs items={[{ href: "/", label: "Mechify" }, { label: "Over Mechify" }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Over ons</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Over Mechify</h1>

        <div className="prose-mechify mt-8 space-y-6 text-base leading-relaxed text-muted">
          <p>
            Mechify is een verzameling engineering tools voor werktuigbouwkundigen, constructeurs en ontwerpers:
            rekenmodules voor passingen, toleranties, verbindingen en sterkte, plus de normtabellen die daarbij
            horen. Het idee is simpel — de berekeningen die je toch al met de hand of in een spreadsheet doet,
            direct beschikbaar maken, met de norm er nooit ver vandaan.
          </p>
          <p>
            Elke tool is opgebouwd rond een specifieke standaard (ISO 286, ISO 2768, DIN 6885, en verder) en toont
            waar de data vandaan komt en tot welke grens hij geldig is. Geen zwarte doos: als een waarde niet
            geverifieerd is tegen een primaire bron, staat er een streepje in plaats van een gok.
          </p>
          <p>
            Mechify is gebouwd door <strong className="text-ink">Damian Vink</strong>, werktuigbouwkundig
            ontwerper. De tools zijn ontstaan uit dagelijks gebruik op de tekentafel en zijn geleidelijk uitgebreid
            tot een zelfstandig platform, los van een persoonlijke portfolio-site — zodat de tools kunnen groeien
            zonder daaraan vast te zitten.
          </p>
          <p>
            Vragen, correcties op een tabel, of een tool die je mist? Mail naar{" "}
            <a href="mailto:hello@mechify.nl" className="text-accent hover:underline">
              hello@mechify.nl
            </a>
            .
          </p>
        </div>
      </PageWrap>
    </PageShell>
  );
}
