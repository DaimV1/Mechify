import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { ToolGrid } from "@/components/tools/tool-grid";
import { useLocale } from "@/lib/i18n/locale-context";
import { getSectionText, SECTIONS, toolsInSection, type ToolSection } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";

export function SectionOverview({ section }: { section: ToolSection }) {
  const { locale } = useLocale();
  const meta = SECTIONS.find((s) => s.id === section)!;
  const { label, description } = getSectionText(meta, locale);
  const tools = toolsInSection(section);
  const liveCount = tools.filter((t) => t.status === "live").length;

  const metaSuffix =
    locale === "nl"
      ? `${tools.length} onderdelen, ${liveCount} nu beschikbaar.`
      : `${tools.length} items, ${liveCount} available now.`;
  useDocumentMeta(label, `${description} ${metaSuffix}`);

  return (
    <PageShell>
      <PageWrap wide>
        <Breadcrumbs items={[{ href: "/", label: "Mechify" }, { label }]} />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Mechify · {label}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{label}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>

        <div className="mt-10">
          <ToolGrid tools={tools} />
        </div>
      </PageWrap>
    </PageShell>
  );
}
