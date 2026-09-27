import { additionalMacros } from "@/lib/additional-macros";
import { Download } from "lucide-react";
import { CopyResult } from "@/components/toolkit/calc-ui";
import { tx, useLocale, type Locale } from "@/lib/i18n/locale";
import macroManifest from "../../../public/macros/manifest.json";

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

function MacroChecksum({ hash }: { hash: string }) {
  return (
    <p className="mono muted text-sm">
      SHA-256: <code>{hash}</code>
    </p>
  );
}

function MacroValidation({ file, locale }: { file: string; locale: Locale }) {
  const entry = macroManifest.macros.find((item) => `/macros/${item.file}` === file);
  if (!entry) return null;
  return (
    <div className="mt-4 rounded-lg border border-line bg-panel p-4" data-testid="macro-validation">
      <p>
        <strong>{tx(locale, "Validatiestatus:", "Validation status:")}</strong>{" "}
        {tx(locale, "broncode statisch beoordeeld", "source statically reviewed")}
      </p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt>{tx(locale, "Doelomgeving", "Target environment")}</dt>
          <dd>{entry.software} {entry.targetVersion}</dd>
        </div>
        <div>
          <dt>{tx(locale, "Bronreview", "Source review")}</dt>
          <dd>{entry.reviewedOn}</dd>
        </div>
        <div>
          <dt>{tx(locale, "Volgende review uiterlijk", "Next review due")}</dt>
          <dd>{entry.nextReviewDue}</dd>
        </div>
        <div>
          <dt>{tx(locale, "Uitgevoerd in CAD", "Executed in CAD")}</dt>
          <dd>{entry.runtimeTested ? tx(locale, "Ja", "Yes") : tx(locale, "Nee", "No")}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted">{entry.limitations[locale]}</p>
      <p className="text-sm">
        <a href={entry.source.url} target="_blank" rel="noopener noreferrer">
          {entry.source.label} ↗
        </a>
      </p>
    </div>
  );
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
      <div className="my-6 rounded-lg border border-line bg-panel p-4">
        <strong>{tx(locale, "Wat ‘beoordeeld’ hier betekent", "What ‘reviewed’ means here")}</strong>
        <p>{macroManifest.validationMethod[locale]}</p>
        <p>
          {tx(
            locale,
            "Een doelversie noemt de gebruikte API-documentatie; het is geen bewijs dat de macro in die CAD-versie draait. Test elke macro eerst op een kopie in jouw eigen CAD-installatie.",
            "A target version identifies the API documentation used; it is not proof that the macro runs in that CAD version. Test every macro on a copy in your own CAD installation first.",
          )}
        </p>
      </div>
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
                <MacroValidation file={m.file} locale={locale} />
                <a
                  className="button secondary"
                  href={m.file}
                  download
                  aria-label={`${tx(locale, "Download", "Download")} ${m.name} (.bas)`}
                >
                  <Download size={16} />
                  Download .bas
                </a>
                <MacroChecksum
                  hash={macroManifest.macros.find((entry) => `/macros/${entry.file}` === m.file)!.sha256}
                />
                <CopyResult
                  text={m.code}
                  label={`${tx(locale, "Kopieer code voor", "Copy code for")} ${m.name}`}
                />
                <details>
                  <summary>
                    {tx(locale, `Bekijk VBA-code voor ${m.name}`, `View VBA code for ${m.name}`)}
                  </summary>
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
