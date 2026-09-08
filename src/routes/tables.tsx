import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/badge";
import { useLocale } from "@/lib/i18n/locale-context";
import { getToolText, TOOLS, toolHref } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";

const STANDARD_GROUPS = [
  {
    standard: "ISO 286",
    note: {
      nl: "Voorkeurpassingen en limietafwijkingen voor gaten en assen.",
      en: "Preferred fits and limit deviations for holes and shafts.",
    },
  },
  {
    standard: "ISO 2768",
    note: {
      nl: "Algemene toleranties voor lineaire en hoekmaten.",
      en: "General tolerances for linear and angular dimensions.",
    },
  },
  {
    standard: "DIN 6885",
    note: {
      nl: "Spiebaanmaten en toleranties voor as-naafverbindingen.",
      en: "Keyway dimensions and tolerances for shaft-hub connections.",
    },
  },
  {
    standard: "SKF · ISO 286",
    note: {
      nl: "Lagerpassingen voor groefkogellagers.",
      en: "Bearing fits for deep groove ball bearings.",
    },
  },
  {
    standard: "DIN 471 / 472",
    note: { nl: "Seegerringgroeven voor as en boring.", en: "Circlip grooves for shaft and bore." },
  },
  {
    standard: "ISO 273 · VDI 2230",
    note: {
      nl: "Bevestigingsmateriaal: doorlaat en aandraaimoment.",
      en: "Fasteners: clearance holes and tightening torque.",
    },
  },
  {
    standard: "ISO 3601-1",
    note: {
      nl: "O-ringgroeven voor statische en dynamische afdichting.",
      en: "O-ring grooves for static and dynamic sealing.",
    },
  },
];

const T = {
  nl: {
    metaTitle: "Tabellen & normen",
    metaDescription:
      "Overzicht van de normen en referentietabellen die Mechify aanhoudt: ISO 286, ISO 2768, DIN 6885, DIN 471/472, ISO 3601 en meer.",
    eyebrow: "Mechify · Naslag",
    title: "Tabellen & normen",
    intro:
      "Elke rekenmodule op Mechify is gebouwd op een specifieke norm of erkende bron. Hieronder een overzicht per norm, met een directe link naar de bijbehorende tool en zijn referentietabellen.",
  },
  en: {
    metaTitle: "Tables & standards",
    metaDescription:
      "Overview of the standards and reference tables Mechify maintains: ISO 286, ISO 2768, DIN 6885, DIN 471/472, ISO 3601 and more.",
    eyebrow: "Mechify · Reference",
    title: "Tables & standards",
    intro:
      "Every calculator on Mechify is built on a specific standard or recognized source. Below is an overview per standard, with a direct link to the matching tool and its reference tables.",
  },
};

export function Tables() {
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

        <div className="mt-10 divide-y divide-border rounded-xl border border-border-strong bg-surface">
          {STANDARD_GROUPS.map((group) => {
            const tools = TOOLS.filter((tl) => tl.standard === group.standard);
            return (
              <div key={group.standard} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-mono text-sm font-semibold uppercase tracking-wide text-accent">
                    {group.standard}
                  </h2>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{group.note[locale]}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        to={toolHref(tool)}
                        className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-bg px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent/60"
                      >
                        {getToolText(tool, locale).title}
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
