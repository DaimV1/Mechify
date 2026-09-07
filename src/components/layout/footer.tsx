import { Link } from "react-router-dom";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/layout/container";
import { SECTIONS } from "@/lib/tools";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <Container wide className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Praktische engineering tools, rekenmodules en normtabellen voor werktuigbouwkundigen,
              constructeurs en ontwerpers. Ontworpen om nauwkeurig en snel te werken op de werkvloer.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">Platform</p>
            <ul className="mt-4 space-y-2 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <Link to={s.href} className="text-muted transition-colors hover:text-ink">
                    {s.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/tables" className="text-muted transition-colors hover:text-ink">
                  Tabellen &amp; normen
                </Link>
              </li>
              <li>
                <Link to="/materials" className="text-muted transition-colors hover:text-ink">
                  Materialen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">Mechify</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted transition-colors hover:text-ink">
                  Over Mechify
                </Link>
              </li>
              <li>
                <a href="mailto:hello@mechify.nl" className="text-muted transition-colors hover:text-ink">
                  hello@mechify.nl
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Mechify. Referentiewaarden zonder garantie — controleer kritieke maten altijd tegen de actuele norm.</p>
          <p className="font-mono">mechify.nl</p>
        </div>
      </Container>
    </footer>
  );
}
