import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalcEyebrow, CalcPanel, Note } from "@/components/calculators/calc-ui";
import { useLocale, type Locale } from "@/lib/i18n/locale-context";
import stepExportCode from "../../../public/macros/solidworks-export-step.bas?raw";
import saveAllCode from "../../../public/macros/solidworks-save-all.bas?raw";
import showPropertiesCode from "../../../public/macros/solidworks-show-properties.bas?raw";

/**
 * E17 (16 sept 2026 review): these used to be separate, hand-maintained
 * inline copies that had drifted from the downloadable .bas files — missing
 * the saved-path check, using different SaveAs flags, and (for batch save)
 * a different approach entirely with no per-file success/failure count.
 * Importing the actual .bas files with Vite's `?raw` means the code shown
 * here and the file offered for download can never diverge again.
 */
type Macro = {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  code: string;
  file: string;
};

const MACROS: Macro[] = [
  {
    title: { nl: "STEP-export", en: "STEP export" },
    description: {
      nl: "Slaat het actieve document op als STEP (.step), naast het bronbestand. Controleert eerst of het document al een bestandspad heeft.",
      en: "Saves the active document as STEP (.step), next to the source file. Checks first that the document already has a file path.",
    },
    code: stepExportCode,
    file: "/macros/solidworks-export-step.bas",
  },
  {
    title: { nl: "Alles opslaan", en: "Save all" },
    description: {
      nl: "Loopt door alle geopende documenten en slaat elk document met niet-opgeslagen wijzigingen op. Rapporteert hoeveel zijn opgeslagen en hoeveel overgeslagen (geen wijzigingen, of nog geen bestandspad).",
      en: "Loops through every open document and saves each one with unsaved changes. Reports how many were saved and how many were skipped (no changes, or no file path yet).",
    },
    code: saveAllCode,
    file: "/macros/solidworks-save-all.bas",
  },
  {
    title: { nl: "Eigenschappen tonen", en: "Show properties" },
    description: {
      nl: "Toont alle custom properties van het actieve document in een berichtvenster. Alleen-lezen, wijzigt niets.",
      en: "Shows all custom properties of the active document in a message box. Read-only, changes nothing.",
    },
    code: showPropertiesCode,
    file: "/macros/solidworks-show-properties.bas",
  },
];

const T = {
  nl: {
    eyebrow: "Voorbeeldcode",
    heading: "Macro-bibliotheek",
    intro:
      "VBA-macro's voor SolidWorks (SldWorks API): STEP-export, alles opslaan en custom properties tonen. De code hieronder is exact de inhoud van het downloadbare .bas-bestand — geen aparte, mogelijk afwijkende kopie. Test macro's altijd eerst op een kopie van je bestanden — API-methodesignatuur kan licht verschillen per SolidWorks-versie. Inventor gebruikt een ander objectmodel (iLogic / Inventor API via VB.NET) — zie de aanvullende macro's voor Inventor-voorbeelden.",
    copyCode: "Kopieer code",
    copied: "Gekopieerd",
    download: "Download .bas",
  },
  en: {
    eyebrow: "Sample code",
    heading: "Macro library",
    intro:
      "VBA macros for SolidWorks (SldWorks API): STEP export, save all and showing custom properties. The code below is exactly the content of the downloadable .bas file — not a separate, potentially diverging copy. Always test macros on a copy of your files first — API method signatures can vary slightly between SolidWorks versions. Inventor uses a different object model (iLogic / Inventor API via VB.NET) — see the supplementary macros for Inventor examples.",
    copyCode: "Copy code",
    copied: "Copied",
    download: "Download .bas",
  },
};

function MacroBlock({ macro, locale }: { macro: Macro; locale: Locale }) {
  const t = T[locale];
  const [done, setDone] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight text-ink">
            {macro.title[locale]}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{macro.description[locale]}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(macro.code);
                setDone(true);
                window.setTimeout(() => setDone(false), 1600);
              } catch {
                /* ignore */
              }
            }}
          >
            {done ? <Check className="size-4" /> : <Copy className="size-4" />}
            {done ? t.copied : t.copyCode}
          </Button>
          <a
            href={macro.file}
            download
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-surface-2"
          >
            <Download className="size-4" />
            {t.download}
          </a>
        </div>
      </div>
      <pre className="table-scroll mt-3 rounded-md border border-border-strong bg-bg p-3 font-mono text-xs leading-relaxed text-ink">
        <code>{macro.code}</code>
      </pre>
    </div>
  );
}

export function MacrosCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  return (
    <CalcPanel>
      <CalcEyebrow>{t.eyebrow}</CalcEyebrow>
      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
        {t.heading}
      </h2>
      <Note>{t.intro}</Note>

      <div className="mt-6 space-y-4">
        {MACROS.map((m) => (
          <MacroBlock key={m.title.nl} macro={m} locale={locale} />
        ))}
      </div>
    </CalcPanel>
  );
}
