import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { useLocale } from "@/lib/i18n/locale-context";
import { useDocumentMeta } from "@/lib/use-document-meta";

const T = {
  nl: {
    metaTitle: "Over Mechify",
    metaDescription: "Rekenmodules, bronnen en toepassingsgrenzen voor werktuigbouwkundig ontwerp.",
    eyebrow: "Over ons",
    title: "Over Mechify",
    p1: (
      <>
        Mechify is een verzameling engineering tools voor werktuigbouwkundigen, constructeurs en
        ontwerpers: rekenmodules voor passingen, toleranties, verbindingen en sterkte, plus de
        normtabellen die daarbij horen. Het idee is simpel — de berekeningen die je toch al met de
        hand of in een spreadsheet doet, direct beschikbaar maken, met de norm er nooit ver vandaan.
      </>
    ),
    p2: (
      <>
        Mechify maakt onderscheid tussen normtabellen, fabrikantgegevens, natuurkundige
        rekenmodellen en praktische ontwerpbenaderingen. Bij norm- en tabeldata worden alleen
        vastgelegde waarden getoond; ontbrekende tabelwaarden worden niet stil geïnterpoleerd.
        Schattingsmodellen — zoals een aandraaimoment via een moerfactor, een eerste
        O-ringgroefschatting of een motordimensionering — worden expliciet als indicatief gemarkeerd
        en tonen hun aannames en toepassingsgrenzen naast het resultaat.
      </>
    ),
    p3: (
      <>
        Gebruik de resultaten als ondersteuning bij ontwerpkeuzes. Controleer de vermelde aannames,
        bronstatus en toepassingsgrenzen voordat je maten of componenten vastlegt. Een
        rekenresultaat vervangt geen volledige ontwerpcontrole.
      </>
    ),
    p4Prefix: "Vragen, correcties op een tabel, of een tool die je mist? Mail naar",
  },
  en: {
    metaTitle: "About Mechify",
    metaDescription: "Calculators, sources and applicability limits for mechanical design.",
    eyebrow: "About us",
    title: "About Mechify",
    p1: (
      <>
        Mechify is a collection of engineering tools for mechanical engineers, machine builders and
        designers: calculators for fits, tolerances, connections and strength, plus the standard
        tables that go with them. The idea is simple — make the calculations you'd do by hand or in
        a spreadsheet anyway directly available, with the standard never far away.
      </>
    ),
    p2: (
      <>
        Mechify distinguishes standards tables, manufacturer data, physics-based calculations and
        practical design estimates. Standard and table data shows only recorded values — missing
        tabulated values are never silently interpolated. Estimate models — a tightening torque from
        a nut factor, a preliminary O-ring groove sizing, a motor sizing — are explicitly labelled
        as indicative and show their assumptions and applicability limits alongside the result.
      </>
    ),
    p3: (
      <>
        Use the results to support design decisions. Check the stated assumptions, source status and
        applicability limits before specifying dimensions or components. A calculation result does
        not replace a complete design review.
      </>
    ),
    p4Prefix: "Questions, corrections to a table, or a tool you're missing? Email",
  },
};

export function About() {
  const { locale } = useLocale();
  const t = T[locale];
  useDocumentMeta(t.metaTitle, t.metaDescription);

  return (
    <PageShell>
      <PageWrap>
        <span id="rekenmodellen" />
        <Breadcrumbs items={[{ href: "/", label: "Mechify" }, { label: t.title }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h1>

        <div className="prose-mechify mt-8 space-y-6 text-base leading-relaxed text-muted">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p>{t.p3}</p>
          <p>
            {t.p4Prefix}{" "}
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
