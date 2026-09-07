import { Link } from "react-router-dom";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { useLocale } from "@/lib/i18n/locale-context";
import { useDocumentMeta } from "@/lib/use-document-meta";

const T = {
  nl: {
    title: "Pagina niet gevonden",
    description: "Deze pagina bestaat niet op Mechify.",
    body: "Deze pagina bestaat niet (meer). Ga terug naar de tools-overzicht om verder te zoeken.",
    cta: "Naar alle tools",
  },
  en: {
    title: "Page not found",
    description: "This page does not exist on Mechify.",
    body: "This page doesn't exist (anymore). Head back to the tools overview to keep looking.",
    cta: "Go to all tools",
  },
};

export function NotFound() {
  const { locale } = useLocale();
  const t = T[locale];
  useDocumentMeta(t.title, t.description);
  return (
    <PageShell>
      <PageWrap className="text-center">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{t.body}</p>
        <Link
          to="/tools"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-ink hover:brightness-110"
        >
          {t.cta}
        </Link>
      </PageWrap>
    </PageShell>
  );
}
