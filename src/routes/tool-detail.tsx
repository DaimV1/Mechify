import { useLocale } from "@/lib/i18n/locale-context";
import { tx } from "@/lib/i18n/locale";
import { COMMON } from "@/lib/i18n/common";
import { Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow } from "@/components/brand-ui";
import { CALCULATOR_REGISTRY } from "@/lib/calculator-registry";
import { DIAMETER_KEY, findTool, SECTIONS, type ToolSection } from "@/lib/tools";
import { SOURCE_KEYS } from "@/lib/migration-models";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { Faq } from "@/components/toolkit/calc-ui";
import { MacroDownloads } from "@/components/toolkit/macros-content";
import { ReferenceResources } from "@/components/toolkit/bronnen-content";
import { useDocumentMeta, useFaqJsonLd } from "@/lib/use-document-meta";
import { NotFound } from "./not-found";
export function ToolDetail({ section }: { section: ToolSection }) {
  const { locale, setLocale } = useLocale();
  const { slug = "" } = useParams();
  const tool = findTool(section, slug);
  const Calculator = tool ? CALCULATOR_REGISTRY[tool.id] : null;
  const sourceKey = tool ? SOURCE_KEYS[tool.id] : undefined;
  const copy = sourceKey
    ? toolkitCopy(sourceKey as Parameters<typeof toolkitCopy>[0], locale)
    : null;
  const sectionMeta = tool ? SECTIONS.find((s) => s.id === tool.section) : undefined;
  useDocumentMeta(
    tool?.title[locale] || tx(locale, "Niet gevonden", "Not found"),
    tool?.blurb[locale] || tx(locale, "Deze tool bestaat niet.", "This tool does not exist."),
    {
      schema: tool
        ? {
            type: "SoftwareApplication",
            extra: {
              applicationCategory: "EngineeringApplication",
              operatingSystem: "Any (web)",
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            },
            breadcrumbs: [
              { name: "Mechify", path: "/" },
              ...(sectionMeta ? [{ name: sectionMeta.label[locale], path: sectionMeta.href }] : []),
            ],
          }
        : undefined,
    },
  );
  useFaqJsonLd(copy?.faq);
  if (!tool || !Calculator) return <NotFound />;
  const usesSharedDiameter = [
    "fit-tolerances",
    "seeger-grooves",
    "keyways",
    "bearing-fits",
  ].includes(tool.id);
  function reset() {
    // Removing query parameters alone would rehydrate the previous shared diameter.
    // Other tools do not own this input; leave their remembered diameter intact.
    if (usesSharedDiameter) {
      try {
        window.sessionStorage.removeItem(DIAMETER_KEY);
      } catch {
        // Storage is optional; resetting the URL must still work when it is blocked.
      }
    }
    window.location.assign(window.location.pathname);
  }
  const calculatorWorkbench = (
    <div key={tool.id} className="calc-workbench">
      <Calculator />
    </div>
  );
  return (
    <PageShell>
      <section className="wrap tool-layout-header">
        <Link className="back" to="/toolkit">
          ← {tx(locale, "Alle tools", "All tools")}
        </Link>
        <Eyebrow>{tool.standard}</Eyebrow>
        <h1>{tool.title[locale]}</h1>
        <p>{tool.blurb[locale]}</p>
      </section>
      <section className="wrap listing migration-tool">
        <div className="tool-toolbar">
          <span className="mono muted">
            {tx(
              locale,
              "DIRECT BEREKEND · FORMULE & AANNAMES IN BEELD",
              "CALCULATED LIVE · FORMULA & ASSUMPTIONS IN VIEW",
            )}
          </span>
          <label className="mono">
            {COMMON[locale].calcHelper}:{" "}
            <select
              aria-label={tx(locale, "Taal rekenhulp", "Calculator language")}
              value={locale}
              onChange={(e) => setLocale(e.target.value as "nl" | "en")}
            >
              <option value="nl">NL</option>
              <option value="en">EN</option>
            </select>
          </label>
          <button
            onClick={reset}
            title={
              usesSharedDiameter
                ? tx(
                    locale,
                    "Herstel de standaardinvoer (Ø20 mm) en wis de gedeelde diameter. De taal blijft behouden.",
                    "Restore default inputs (Ø20 mm) and clear the shared diameter. Language is preserved.",
                  )
                : tx(
                    locale,
                    "Herstel de standaardinvoer van deze tool. De taal blijft behouden.",
                    "Restore this tool's default inputs. Language is preserved.",
                  )
            }
          >
            ↺ {tx(locale, "Reset invoer", "Reset input")}
          </button>
        </div>
        {tool.id === "macros" ? (
          calculatorWorkbench
        ) : (
          <Suspense
            fallback={
              <p className="tool-loading" role="status">
                {tx(locale, "Rekenmodel wordt geladen…", "Loading calculation model…")}
              </p>
            }
          >
            {calculatorWorkbench}
          </Suspense>
        )}
        {tool.id === "macros" ? (
          <>
            <h2 className="mt-12">{tx(locale, "Downloadbare macro’s", "Downloadable macros")}</h2>
            <p>
              {tx(
                locale,
                "VBA-modules en aanvullende rapportmacro’s voor SolidWorks en Inventor. Inspecteer de code en test op een kopie; Mechify voert deze bestanden niet uit.",
                "VBA modules and additional report macros for SolidWorks and Inventor. Inspect the code and test on a copy; Mechify never runs these files.",
              )}
            </p>
            <MacroDownloads />
          </>
        ) : null}
        {tool.id === "cad-resources" ? <ReferenceResources /> : null}
        {copy?.faq ? <Faq items={copy.faq} /> : null}
      </section>
    </PageShell>
  );
}
