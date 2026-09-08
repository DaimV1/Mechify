import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalcEyebrow, CalcPanel, Note } from "@/components/calculators/calc-ui";
import { useLocale, type Locale } from "@/lib/i18n/locale-context";

type Macro = {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  code: Record<Locale, string>;
};

const MACROS: Macro[] = [
  {
    title: { nl: "STEP-export", en: "STEP export" },
    description: {
      nl: "Slaat het actieve document op als STEP (.step), naast het brondbestand.",
      en: "Saves the active document as STEP (.step), next to the source file.",
    },
    code: {
      nl: `Dim swApp As SldWorks.SldWorks
Dim swModel As SldWorks.ModelDoc2
Dim swModelDocExt As SldWorks.ModelDocExtension

Sub main()
    Set swApp = Application.SldWorks
    Set swModel = swApp.ActiveDoc
    If swModel Is Nothing Then
        MsgBox "Geen actief document."
        Exit Sub
    End If
    Set swModelDocExt = swModel.Extension

    Dim path As String
    path = swModel.GetPathName
    Dim stepPath As String
    stepPath = Left(path, InStrRev(path, ".")) & "step"

    Dim errors As Long, warnings As Long
    Dim ok As Boolean
    ok = swModelDocExt.SaveAs(stepPath, 0, 0, Nothing, errors, warnings)

    If ok Then
        MsgBox "STEP-export gelukt: " & stepPath
    Else
        MsgBox "Export mislukt (errors=" & errors & ")"
    End If
End Sub`,
      en: `Dim swApp As SldWorks.SldWorks
Dim swModel As SldWorks.ModelDoc2
Dim swModelDocExt As SldWorks.ModelDocExtension

Sub main()
    Set swApp = Application.SldWorks
    Set swModel = swApp.ActiveDoc
    If swModel Is Nothing Then
        MsgBox "No active document."
        Exit Sub
    End If
    Set swModelDocExt = swModel.Extension

    Dim path As String
    path = swModel.GetPathName
    Dim stepPath As String
    stepPath = Left(path, InStrRev(path, ".")) & "step"

    Dim errors As Long, warnings As Long
    Dim ok As Boolean
    ok = swModelDocExt.SaveAs(stepPath, 0, 0, Nothing, errors, warnings)

    If ok Then
        MsgBox "STEP export succeeded: " & stepPath
    Else
        MsgBox "Export failed (errors=" & errors & ")"
    End If
End Sub`,
    },
  },
  {
    title: { nl: "Batch opslaan", en: "Batch save" },
    description: {
      nl: "Opent elk .SLDPRT-bestand in een map en slaat het opnieuw op — handig na een sjabloon- of eigenschapswijziging.",
      en: "Opens every .SLDPRT file in a folder and re-saves it — handy after a template or property change.",
    },
    code: {
      nl: `Sub main()
    Dim swApp As SldWorks.SldWorks
    Set swApp = Application.SldWorks

    Dim folderPath As String
    folderPath = "C:\\Modellen\\"   ' Pas aan naar de juiste map

    Dim fileName As String
    fileName = Dir(folderPath & "*.SLDPRT")

    Dim errors As Long, warnings As Long
    Dim swModel As SldWorks.ModelDoc2

    Do While fileName <> ""
        Set swModel = swApp.OpenDoc6(folderPath & fileName, swDocPART, swOpenDocOptions_Silent, "", errors, warnings)
        If Not swModel Is Nothing Then
            swModel.Save3 swSaveAsOptions_Silent, errors, warnings
            swApp.CloseDoc swModel.GetTitle
        End If
        fileName = Dir()
    Loop

    MsgBox "Batchverwerking klaar."
End Sub`,
      en: `Sub main()
    Dim swApp As SldWorks.SldWorks
    Set swApp = Application.SldWorks

    Dim folderPath As String
    folderPath = "C:\\Models\\"   ' Change to the correct folder

    Dim fileName As String
    fileName = Dir(folderPath & "*.SLDPRT")

    Dim errors As Long, warnings As Long
    Dim swModel As SldWorks.ModelDoc2

    Do While fileName <> ""
        Set swModel = swApp.OpenDoc6(folderPath & fileName, swDocPART, swOpenDocOptions_Silent, "", errors, warnings)
        If Not swModel Is Nothing Then
            swModel.Save3 swSaveAsOptions_Silent, errors, warnings
            swApp.CloseDoc swModel.GetTitle
        End If
        fileName = Dir()
    Loop

    MsgBox "Batch processing complete."
End Sub`,
    },
  },
  {
    title: { nl: "Eigenschappen tonen", en: "Show properties" },
    description: {
      nl: "Toont alle custom properties van het actieve document in een berichtvenster.",
      en: "Shows all custom properties of the active document in a message box.",
    },
    code: {
      nl: `Sub main()
    Dim swApp As SldWorks.SldWorks
    Dim swModel As SldWorks.ModelDoc2
    Dim swCustProp As SldWorks.CustomPropertyManager
    Set swApp = Application.SldWorks
    Set swModel = swApp.ActiveDoc
    If swModel Is Nothing Then Exit Sub

    Set swCustProp = swModel.Extension.CustomPropertyManager("")

    Dim propNames As Variant
    propNames = swCustProp.GetNames

    Dim msg As String
    Dim i As Integer
    If Not IsEmpty(propNames) Then
        For i = 0 To UBound(propNames)
            Dim valOut As String, resolvedVal As String
            swCustProp.Get5 propNames(i), False, valOut, resolvedVal, False
            msg = msg & propNames(i) & " = " & resolvedVal & vbCrLf
        Next i
    End If

    MsgBox msg
End Sub`,
      en: `Sub main()
    Dim swApp As SldWorks.SldWorks
    Dim swModel As SldWorks.ModelDoc2
    Dim swCustProp As SldWorks.CustomPropertyManager
    Set swApp = Application.SldWorks
    Set swModel = swApp.ActiveDoc
    If swModel Is Nothing Then Exit Sub

    Set swCustProp = swModel.Extension.CustomPropertyManager("")

    Dim propNames As Variant
    propNames = swCustProp.GetNames

    Dim msg As String
    Dim i As Integer
    If Not IsEmpty(propNames) Then
        For i = 0 To UBound(propNames)
            Dim valOut As String, resolvedVal As String
            swCustProp.Get5 propNames(i), False, valOut, resolvedVal, False
            msg = msg & propNames(i) & " = " & resolvedVal & vbCrLf
        Next i
    End If

    MsgBox msg
End Sub`,
    },
  },
];

const T = {
  nl: {
    eyebrow: "Voorbeeldcode",
    heading: "Macro-bibliotheek",
    intro:
      "Voorbeeld-VBA-macro's voor SolidWorks (SldWorks API): STEP-export, batch opslaan en custom properties tonen. Test macro's altijd eerst op een kopie van je bestanden — API-methodesignatuur kan licht verschillen per SolidWorks-versie. Inventor gebruikt een ander objectmodel (iLogic / Inventor API via VB.NET) — de onderstaande voorbeelden zijn niet direct overdraagbaar.",
    copyCode: "Kopieer code",
    copied: "Gekopieerd",
  },
  en: {
    eyebrow: "Sample code",
    heading: "Macro library",
    intro:
      "Sample VBA macros for SolidWorks (SldWorks API): STEP export, batch save and showing custom properties. Always test macros on a copy of your files first — API method signatures can vary slightly between SolidWorks versions. Inventor uses a different object model (iLogic / Inventor API via VB.NET) — the examples below don't carry over directly.",
    copyCode: "Copy code",
    copied: "Copied",
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
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(macro.code[locale]);
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
      </div>
      <pre className="table-scroll mt-3 rounded-md border border-border-strong bg-bg p-3 font-mono text-xs leading-relaxed text-ink">
        <code>{macro.code[locale]}</code>
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
