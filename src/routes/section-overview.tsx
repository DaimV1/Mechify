import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { ToolGrid } from "@/components/tools/tool-grid";
import { SECTIONS, toolsInSection, type ToolSection } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";

export function SectionOverview({ section }: { section: ToolSection }) {
  const meta = SECTIONS.find((s) => s.id === section)!;
  const tools = toolsInSection(section);
  const liveCount = tools.filter((t) => t.status === "live").length;

  useDocumentMeta(meta.label, `${meta.description} ${tools.length} onderdelen, ${liveCount} nu beschikbaar.`);

  return (
    <PageShell>
      <PageWrap wide>
        <Breadcrumbs items={[{ href: "/", label: "Mechify" }, { label: meta.label }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Mechify · {meta.label}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{meta.label}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{meta.description}</p>

        <div className="mt-10">
          <ToolGrid tools={tools} />
        </div>
      </PageWrap>
    </PageShell>
  );
}
