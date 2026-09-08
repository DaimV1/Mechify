import { useLocale } from "@/lib/i18n/locale-context";
import { Suspense, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow } from "@/components/brand-ui";
import { CALCULATOR_REGISTRY } from "@/lib/calculator-registry";
import { findTool, type ToolSection } from "@/lib/tools";
import { EXTRA_MODELS, SOURCE_KEYS } from "@/lib/migration-models";
import { toolkitCopy } from "@/lib/i18n/toolkit-pages";
import { Faq } from "@/components/toolkit/calc-ui";
import { MacroDownloads } from "@/components/toolkit/macros-content";
import { ReferenceResources } from "@/components/toolkit/bronnen-content";
import { QuickDrive } from "@/components/quick-drive";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { NotFound } from "./not-found";
export function ToolDetail({ section }: { section: ToolSection }) {
  const { locale, setLocale } = useLocale();
  const { slug = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const tool = findTool(section, slug);
  const model = params.get("model") || "basis";
  const extra = tool ? EXTRA_MODELS[tool.id] : null;
  const Calculator = tool ? CALCULATOR_REGISTRY[tool.id] : null;
  useDocumentMeta(
    tool?.title[locale] || "Niet gevonden",
    tool?.blurb[locale] || "Deze tool bestaat niet.",
  );
  if (!tool || !Calculator) return <NotFound />;
  const Alternate = extra?.component;
  const sourceKey = SOURCE_KEYS[tool.id];
  const copy = sourceKey
    ? toolkitCopy(sourceKey as Parameters<typeof toolkitCopy>[0], locale)
    : null;
  function reset() {
    setParams(model === "basis" ? {} : { model }, { replace: true });
    setRevision((n) => n + 1);
  }
  return (
    <PageShell>
      <section className="wrap tool-layout-header">
        <Link className="back" to="/toolkit">
          ← Alle tools
        </Link>
        <Eyebrow>{tool.standard}</Eyebrow>
        <h1>{tool.title[locale]}</h1>
        <p>{tool.blurb[locale]}</p>
      </section>
      <section className="wrap listing migration-tool">
        <div className="tool-toolbar">
          <span className="mono muted">DIRECT BEREKEND · FORMULE & AANNAMES IN BEELD</span>
          <label className="mono">
            Rekenhulp:{" "}
            <select
              aria-label="Taal rekenhulp"
              value={locale}
              onChange={(e) => setLocale(e.target.value as "nl" | "en")}
            >
              <option value="nl">NL</option>
              <option value="en">EN</option>
            </select>
          </label>
          <button onClick={reset}>↺ Reset invoer</button>
        </div>
        {extra ? (
          <div className="model-switch">
            <label>
              Rekenmodel
              <select
                aria-label="Rekenmodel"
                value={model}
                onChange={(e) => {
                  setParams(e.target.value === "basis" ? {} : { model: e.target.value }, {
                    replace: true,
                  });
                  setRevision((n) => n + 1);
                }}
              >
                <option value="basis">{extra.original}</option>
                <option value="referentie">{extra.label}</option>
                {tool.id === "pneumatic-cylinder" ? (
                  <option value="kracht">Kracht bij gegeven diameter</option>
                ) : null}
              </select>
            </label>
            <p>{extra.note}</p>
          </div>
        ) : null}
        <Suspense
          fallback={
            <p className="tool-loading" role="status">
              Rekenmodel wordt geladen…
            </p>
          }
        >
          <div key={tool.id + model + revision} className="calc-workbench">
            {model === "kracht" && tool.id === "pneumatic-cylinder" ? (
              <QuickDrive kind="force" />
            ) : model === "referentie" && Alternate ? (
              <Alternate />
            ) : (
              <Calculator />
            )}
          </div>
        </Suspense>
        {tool.id === "macros" ? (
          <>
            <h2 className="mt-12">Downloadbare macro’s</h2>
            <p>
              Originele VBA-modules voor SolidWorks en Inventor. Inspecteer de code en test op een
              kopie; Mechify voert deze bestanden niet uit.
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
