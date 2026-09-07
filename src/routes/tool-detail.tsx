import { useParams } from "react-router-dom";
import { PageShell, PageWrap } from "@/components/layout/page-shell";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { ComingSoon } from "@/components/tools/coming-soon";
import { CALCULATOR_REGISTRY } from "@/lib/calculator-registry";
import { useLocale } from "@/lib/i18n/locale-context";
import { findTool, getSectionText, getToolText, SECTIONS, type ToolSection } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { NotFound } from "@/routes/not-found";

export function ToolDetail({ section }: { section: ToolSection }) {
  const { slug = "" } = useParams();
  const { locale } = useLocale();
  const tool = findTool(section, slug);
  const sectionMeta = SECTIONS.find((s) => s.id === section)!;
  const sectionText = getSectionText(sectionMeta, locale);
  const toolText = tool ? getToolText(tool, locale) : null;

  useDocumentMeta(
    tool && toolText ? `${toolText.title} · ${tool.standard}` : locale === "nl" ? "Niet gevonden" : "Not found",
    tool && toolText ? toolText.blurb : locale === "nl" ? "Deze pagina bestaat niet." : "This page does not exist.",
  );

  if (!tool || !toolText) return <NotFound />;

  const Calculator = CALCULATOR_REGISTRY[tool.id];

  return (
    <PageShell>
      <PageWrap wide>
        <ToolPageHeader
          crumbs={[{ href: "/", label: "Mechify" }, { href: sectionMeta.href, label: sectionText.label }, { label: toolText.title }]}
          eyebrow={sectionText.label}
          title={toolText.title}
          standard={tool.standard}
          lede={toolText.blurb}
        />
        <div className="mt-10">{Calculator ? <Calculator /> : <ComingSoon tool={tool} />}</div>
      </PageWrap>
    </PageShell>
  );
}
