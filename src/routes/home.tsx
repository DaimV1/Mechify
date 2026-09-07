import { ArrowRight, BookOpen, Compass, Layers, Ruler, ShieldCheck, Sigma } from "lucide-react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { ToolCard } from "@/components/tools/tool-card";
import { SECTIONS, TOOLS } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";

const FEATURES = [
  {
    icon: Ruler,
    title: "Op normen gebaseerd",
    body: "ISO 286, ISO 2768, DIN 6885 en meer — rekenlogica die traceerbaar is naar de standaard, niet naar een vuistregel.",
  },
  {
    icon: Sigma,
    title: "Echte berekeningen",
    body: "Geen statische tabellen alleen: vul een maat in en Mechify rekent live de passing, sterkte of dimensie uit.",
  },
  {
    icon: ShieldCheck,
    title: "Herleidbaar",
    body: "Elke tool toont zijn bron en de grenzen van geldigheid, zodat je weet wanneer je de norm zelf moet raadplegen.",
  },
];

const sectionIcons: Record<string, typeof Ruler> = {
  tools: Ruler,
  calculators: Sigma,
  cad: Layers,
};

export function Home() {
  useDocumentMeta(
    "Mechify",
    "Engineering tools die je helpen sneller en nauwkeuriger te ontwerpen: passingen, toleranties, sterkteberekeningen en normtabellen voor werktuigbouwkundigen.",
  );

  const featured = TOOLS.filter((t) => t.status === "live");

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-blueprint-grid">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
        <Container wide className="relative py-20 sm:py-28">
          <Logo size="lg" className="mb-8" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Engineering toolkit</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Ontwerp sneller en nauwkeuriger.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Mechify bundelt de rekenmodules, normtabellen en referentiedata die werktuigbouwkundigen dagelijks
            nodig hebben — passingen, toleranties, verbindingen en sterkteberekeningen, direct bruikbaar op de
            werkvloer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/tools"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-ink transition-transform hover:brightness-110"
            >
              Bekijk alle tools
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/calculators"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-border-strong bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              Bekijk rekenmodules
            </Link>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-subtle">Tools</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-ink">{TOOLS.length}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-subtle">Live</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-ink">{featured.length}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-subtle">Normen</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-ink">ISO · DIN</dd>
            </div>
          </dl>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-20">
        <Container wide>
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="flex size-10 items-center justify-center rounded-md bg-surface text-accent">
                  <f.icon className="size-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-20">
        <Container wide>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Nu beschikbaar</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Functionerende rekenmodules
              </h2>
            </div>
            <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              Alle tools
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container wide>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Platform</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Alles wat je nodig hebt om te ontwerpen
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s) => {
              const Icon = sectionIcons[s.id] ?? Compass;
              return (
                <Link
                  key={s.id}
                  to={s.href}
                  className="group flex flex-col justify-between rounded-xl border border-border-strong bg-surface p-6 transition-colors hover:border-accent/60 hover:bg-surface-2"
                >
                  <div>
                    <Icon className="size-6 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">{s.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    Verkennen
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
            <Link
              to="/tables"
              className="group flex flex-col justify-between rounded-xl border border-border-strong bg-surface p-6 transition-colors hover:border-accent/60 hover:bg-surface-2"
            >
              <div>
                <BookOpen className="size-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">Tabellen &amp; normen</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">Overzicht van alle normen en referentietabellen die Mechify aanhoudt.</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Verkennen
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              to="/materials"
              className="group flex flex-col justify-between rounded-xl border border-border-strong bg-surface p-6 transition-colors hover:border-accent/60 hover:bg-surface-2"
            >
              <div>
                <Layers className="size-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">Materialen</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">Mechanische kengetallen zoals E-modulus en vloeigrens per materiaal.</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Verkennen
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
