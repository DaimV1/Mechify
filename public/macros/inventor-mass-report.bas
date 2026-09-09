Attribute VB_Name = "MechifyMassaRapport"
' Mechify - massa, volume en zwaartepunt van actieve modeltoestand.
' Inventor VBA: importeer .bas via de VBA-editor en start MassaRapport.
' Vereist actueel part/assembly met juist toegewezen materialen.
' Geen documentopslag; berekende massa wordt niet gecachet.
' Database-eenheden: kg, cm en cm^3; afstanden worden mm.
' API: https://help.autodesk.com/cloudhelp/2024/ENU/Inventor-API/files/MassProperties.htm
Option Explicit
Sub MassaRapport()
    On Error GoTo Failed
    If ThisApplication.Documents.Count = 0 Then
        MsgBox "Open eerst een part of assembly.", vbExclamation
        Exit Sub
    End If
    Dim doc As Object
    Set doc = ThisApplication.ActiveDocument
    If doc.DocumentType <> kPartDocumentObject And doc.DocumentType <> kAssemblyDocumentObject Then
        MsgBox "Deze macro is bedoeld voor een part of assembly.", vbExclamation
        Exit Sub
    End If
    Dim props As MassProperties
    Set props = doc.ComponentDefinition.MassProperties
    props.CacheResultsOnCompute = False
    Dim center As Point
    Set center = props.CenterOfMass
    Dim report As String
    report = "Massa: " & Format(props.Mass, "0.000") & " kg" & vbCrLf
    report = report & "Volume: " & Format(props.Volume * 1000#, "0.000") & " mm^3" & vbCrLf
    report = report & "Zwaartepunt t.o.v. oorsprong (mm):" & vbCrLf
    report = report & "X: " & Format(center.X * 10#, "0.000") & vbCrLf
    report = report & "Y: " & Format(center.Y * 10#, "0.000") & vbCrLf
    report = report & "Z: " & Format(center.Z * 10#, "0.000") & vbCrLf
    report = report & "Massa overschreven: " & CStr(props.MassOverridden) & vbCrLf
    report = report & "Controleer materialen en actieve modeltoestand."
    MsgBox report, vbInformation, "Mechify - " & doc.DisplayName
    Exit Sub
Failed:
    MsgBox "Rapport kon niet worden gemaakt: " & Err.Description, vbExclamation, "Mechify"
End Sub
