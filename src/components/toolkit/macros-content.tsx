import { additionalMacros } from "@/lib/additional-macros";
import { Download } from "lucide-react";
import { CopyResult } from "@/components/toolkit/calc-ui";
import { tx, useLocale, type Locale } from "@/lib/i18n/locale";

import swExportStep from "../../../public/macros/solidworks-export-step.bas?raw";
import swBatchPdf from "../../../public/macros/solidworks-batch-pdf.bas?raw";
import swShowProperties from "../../../public/macros/solidworks-show-properties.bas?raw";
import swSaveAll from "../../../public/macros/solidworks-save-all.bas?raw";
import swFlatPatternDxf from "../../../public/macros/solidworks-flat-pattern-dxf.bas?raw";
import invExportStep from "../../../public/macros/inventor-export-step.bas?raw";
import invSaveAll from "../../../public/macros/inventor-save-all.bas?raw";
import invShowIproperties from "../../../public/macros/inventor-show-iproperties.bas?raw";
import invBatchPdf from "../../../public/macros/inventor-batch-pdf.bas?raw";
import invFlatPatternDxf from "../../../public/macros/inventor-flat-pattern-dxf.bas?raw";

function groups(locale: Locale) {
  return [
    {
      title: "SolidWorks 2024",
      install: tx(
        locale,
        "Installeren: Tools > Macro > New, plak de code in de module — of importeer het .bas-bestand direct via de VBA-editor (File > Import File).",
        "Install: Tools > Macro > New, paste the code into the module — or import the .bas file directly via the VBA editor (File > Import File).",
      ),
      macros: [
        {
          file: "/macros/solidworks-export-step.bas",
          code: swExportStep,
          name: tx(locale, "Exporteer naar STEP", "Export to STEP"),
          note: tx(
            locale,
            "Slaat het actieve part of assembly op als .step, naast het bestaande bestand.",
            "Saves the active part or assembly as .step, next to the existing file.",
          ),
        },
        {
          file: "/macros/solidworks-batch-pdf.bas",
          code: swBatchPdf,
          name: tx(locale, "Batch-export tekeningen naar PDF", "Batch-export drawings to PDF"),
          note: tx(
            locale,
            "Exporteert elke geopende, al opgeslagen tekening naar PDF.",
            "Exports every open, already-saved drawing to PDF.",
          ),
        },
        {
          file: "/macros/solidworks-show-properties.bas",
          code: swShowProperties,
          name: tx(locale, "Toon custom properties", "Show custom properties"),
          note: tx(
            locale,
            "Leest de configuratie-onafhankelijke custom properties van het actieve document. Alleen-lezen.",
            "Reads the configuration-independent custom properties of the active document. Read-only.",
          ),
        },
        {
          file: "/macros/solidworks-save-all.bas",
          code: swSaveAll,
          name: tx(locale, "Sla alles op", "Save all"),
          note: tx(
            locale,
            "Slaat elk geopend document met niet-opgeslagen wijzigingen op.",
            "Saves every open document that has unsaved changes.",
          ),
        },
        {
          file: "/macros/solidworks-flat-pattern-dxf.bas",
          code: swFlatPatternDxf,
          name: tx(locale, "Exporteer vlak patroon naar DXF", "Export flat pattern to DXF"),
          note: tx(
            locale,
            "Slaat het vlakke patroon van een plaatwerk-part op als .dxf.",
            "Saves a sheet metal part's flat pattern as .dxf.",
          ),
        },
      ],
    },
    {
      title: "Inventor 2024",
      install: tx(
        locale,
        "Installeren: Alt+F11 (VBA-editor) > Insert > Module, plak de code.",
        "Install: Alt+F11 (VBA editor) > Insert > Module, paste the code.",
      ),
      macros: [
        {
          file: "/macros/inventor-export-step.bas",
          code: invExportStep,
          name: tx(locale, "Exporteer naar STEP", "Export to STEP"),
          note: tx(
            locale,
            "Slaat het actieve part of assembly op als .stp, naast het bestaande bestand.",
            "Saves the active part or assembly as .stp, next to the existing file.",
          ),
        },
        {
          file: "/macros/inventor-save-all.bas",
          code: invSaveAll,
          name: tx(locale, "Sla alles op", "Save all"),
          note: tx(
            locale,
            "Slaat elk geopend document met niet-opgeslagen wijzigingen op.",
            "Saves every open document that has unsaved changes.",
          ),
        },
        {
          file: "/macros/inventor-show-iproperties.bas",
          code: invShowIproperties,
          name: tx(locale, "Toon iProperties", "Show iProperties"),
          note: tx(
            locale,
            "Leest titel, auteur, onderwerp en trefwoorden uit het actieve document. Alleen-lezen.",
            "Reads title, author, subject and keywords from the active document. Read-only.",
          ),
        },
        {
          file: "/macros/inventor-batch-pdf.bas",
          code: invBatchPdf,
          name: tx(locale, "Batch-export tekeningen naar PDF", "Batch-export drawings to PDF"),
          note: tx(
            locale,
            "Exporteert elke geopende, al opgeslagen tekening naar PDF.",
            "Exports every open, already-saved drawing to PDF.",
          ),
        },
        {
          file: "/macros/inventor-flat-pattern-dxf.bas",
          code: invFlatPatternDxf,
          name: tx(locale, "Exporteer vlak patroon naar DXF", "Export flat pattern to DXF"),
          note: tx(
            locale,
            "Slaat het vlakke patroon van een plaatwerk-part op als .dxf.",
            "Saves a sheet metal part's flat pattern as .dxf.",
          ),
        },
      ],
    },
  ];
}

export function MacroDownloads() {
  const { locale } = useLocale();
  return (
    <section className="source-resources">
      <p className="mono muted">
        {groups(locale).reduce((sum, g) => sum + g.macros.length, additionalMacros.length)}{" "}
        {tx(locale, "downloadbare VBA-macro’s", "downloadable VBA macros")}
      </p>
      <p>
        {tx(
          locale,
          "Importeer .bas-bestanden via File > Import File in de VBA-editor. Bij handmatig plakken laat je de eerste regel Attribute VB_Name weg; die regel hoort bij het importformaat.",
          "Import .bas files through File > Import File in the VBA editor. When pasting manually, omit the first Attribute VB_Name line; it belongs to the import format.",
        )}
      </p>
      {groups(locale).map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          <p>{group.install}</p>
          <div>
            {[
              ...group.macros.map((m) => ({ ...m, source: null as string | null })),
              ...additionalMacros
                .filter((m) => group.title.startsWith(m.software))
                .map((m) => ({ ...m, name: m.name[locale], note: m.note[locale] })),
            ].map((m) => (
              <article key={m.file}>
                <h3>{m.name}</h3>
                <p>{m.note}</p>
                {m.source ? (
                  <p className="text-sm text-muted">
                    {tx(
                      locale,
                      "Nieuwe voorbeeldmacro · API gecontroleerd, niet uitgevoerd in CAD. ",
                      "New example macro · API reviewed, not executed in CAD. ",
                    )}
                    <a href={m.source} target="_blank" rel="noopener noreferrer">
                      {tx(locale, "Officiële API-documentatie ↗", "Official API documentation ↗")}
                    </a>
                  </p>
                ) : null}
                <a className="button secondary" href={m.file} download>
                  <Download size={16} />
                  Download .bas
                </a>
                <CopyResult text={m.code} />
                <details>
                  <summary>Bekijk de VBA-code</summary>
                  <pre>
                    <code>{m.code}</code>
                  </pre>
                </details>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
