Attribute VB_Name = "MechifyParameters"
' Mechify - overzicht gebruikersparameters, formules en eenheden.
' Inventor VBA: importeer via File > Import File, start ParameterRapport.
' Leest UserParameters van actief part/assembly; geen modelparameters.
' Expression blijft intact, ook voor tekst en booleans. Geen conversie.
' Lange lijsten worden verdeeld; geen waarden aangepast of opgeslagen.
' API: https://help.autodesk.com/cloudhelp/2024/ENU/Inventor-API/files/UserParameter_Expression.htm
Option Explicit
Sub ParameterRapport()
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
    Dim params As UserParameters
    Set params = doc.ComponentDefinition.Parameters.UserParameters
    If params.Count = 0 Then
        MsgBox "Geen gebruikersparameters gevonden.", vbInformation
        Exit Sub
    End If
    Dim param As UserParameter
    Dim report As String, line As String
    report = "Naam = expressie [eenheid]" & vbCrLf
    For Each param In params
        line = param.Name & " = " & param.Expression & " [" & param.Units & "]"
        If Len(report) + Len(line) > 850 Then
            If Len(report) > 0 Then MsgBox report, vbInformation, "Mechify - parameters"
            report = ""
        End If
        ' Ook een uitzonderlijk lange expressie blijft volledig beschikbaar.
        Do While Len(line) > 850
            MsgBox Left$(line, 850), vbInformation, "Mechify - parameter (vervolg)"
            line = Mid$(line, 851)
        Loop
        report = report & line & vbCrLf
    Next param
    If Len(report) > 0 Then MsgBox report, vbInformation, "Mechify - parameters"
    Exit Sub
Failed:
    MsgBox "Rapport kon niet worden gemaakt: " & Err.Description, vbExclamation, "Mechify"
End Sub
