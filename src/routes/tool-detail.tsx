import { useParams } from "react-router-dom";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { ComingSoon } from "@/components/tools/coming-soon";
import { CALCULATOR_REGISTRY } from "@/lib/calculator-registry";
import { findTool, SECTIONS, type ToolSection } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { NotFound } from "@/routes/not-found";

export function ToolDetail({ section }: { section: ToolSection }) {
  const { slug = "" } = useParams();
  const tool = findTool(section, slug);
  const sectionMeta = SECTIONS.find((s) => s.id === section)!;

  useDocumentMeta(
    tool ? `${tool.title} · ${tool.standard}` : "Niet gevonden",
    tool ? tool.blurb : "Deze pagina bestaat niet.",
  );

  if (!tool) return <NotFound />;

  const Calculator = CALCULATOR_REGISTRY[tool.id];

  return (
    <PageShell>
      <PageWrap wide>
        <ToolPageHeader
          crumbs={[{ href: "/", label: "Mechify" }, { href: sectionMeta.href, label: sectionMeta.label }, { label: tool.title }]}
          eyebrow={sectionMeta.label}
          title={tool.title}
          standard={tool.standard}
          lede={tool.blurb}
        />
        <div className="mt-10">{Calculator ? <Calculator /> : <ComingSoon tool={tool} />}</div>
      </PageWrap>
    </PageShell>
  );
}
