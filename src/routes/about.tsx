import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { useLocale } from "@/lib/i18n/locale-context";
import { useDocumentMeta } from "@/lib/use-document-meta";

const T = {
  nl: {
    metaTitle: "Over Mechify",
    metaDescription: "Waarom Mechify bestaat, wie het bouwt en hoe de rekenmodules tot stand komen.",
    eyebrow: "Over ons",
    title: "Over Mechify",
    p1: (
      <>
        Mechify is een verzameling engineering tools voor werktuigbouwkundigen, constructeurs en ontwerpers:
        rekenmodules voor passingen, toleranties, verbindingen en sterkte, plus de normtabellen die daarbij
        horen. Het idee is simpel — de berekeningen die je toch al met de hand of in een spreadsheet doet,
        direct beschikbaar maken, met de norm er nooit ver vandaan.
      </>
    ),
    p2: (
      <>
        Elke tool is opgebouwd rond een specifieke standaard (ISO 286, ISO 2768, DIN 6885, en verder) en toont
        waar de data vandaan komt en tot welke grens hij geldig is. Geen zwarte doos: als een waarde niet
        geverifieerd is tegen een primaire bron, staat er een streepje in plaats van een gok.
      </>
    ),
    p3: (
      <>
        Mechify is gebouwd door <strong className="text-ink">Damian Vink</strong>, werktuigbouwkundig ontwerper.
        De tools zijn ontstaan uit dagelijks gebruik op de tekentafel en zijn geleidelijk uitgebreid tot een
        zelfstandig platform, los van een persoonlijke portfolio-site — zodat de tools kunnen groeien zonder
        daaraan vast te zitten.
      </>
    ),
    p4Prefix: "Vragen, correcties op een tabel, of een tool die je mist? Mail naar",
  },
  en: {
    metaTitle: "About Mechify",
    metaDescription: "Why Mechify exists, who builds it, and how the calculators come together.",
    eyebrow: "About us",
    title: "About Mechify",
    p1: (
      <>
        Mechify is a collection of engineering tools for mechanical engineers, constructors and designers:
        calculators for fits, tolerances, connections and strength, plus the standard tables that go with them.
        The idea is simple — make the calculations you'd do by hand or in a spreadsheet anyway directly
        available, with the standard never far away.
      </>
    ),
    p2: (
      <>
        Every tool is built around a specific standard (ISO 286, ISO 2768, DIN 6885, and more) and shows where
        its data comes from and up to which limit it's valid. No black box: if a value hasn't been verified
        against a primary source, it shows a dash instead of a guess.
      </>
    ),
    p3: (
      <>
        Mechify is built by <strong className="text-ink">Damian Vink</strong>, a mechanical design engineer. The
        tools grew out of daily use at the drawing board and were gradually expanded into a standalone platform,
        separate from a personal portfolio site — so the tools can keep growing without being tied to one.
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
        <Breadcrumbs items={[{ href: "/", label: "Mechify" }, { label: t.title }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t.title}</h1>

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
