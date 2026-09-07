import { Link } from "react-router-dom";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { useDocumentMeta } from "@/lib/use-document-meta";

export function NotFound() {
  useDocumentMeta("Pagina niet gevonden", "Deze pagina bestaat niet op Mechify.");
  return (
    <PageShell>
      <PageWrap className="text-center">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">Pagina niet gevonden</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Deze pagina bestaat niet (meer). Ga terug naar de tools-overzicht om verder te zoeken.
        </p>
        <Link
          to="/tools"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-ink hover:brightness-110"
        >
          Naar alle tools
        </Link>
      </PageWrap>
    </PageShell>
  );
}
