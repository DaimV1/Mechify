Attribute VB_Name = "MechifyConfigurations"
' Mechify - alle configuratienamen, zonder activeren of rebuild.
' Importeer deze module via File > Import File en start main.
' De actieve configuratie is gemarkeerd. Lange lijsten worden verdeeld.
' API: https://help.solidworks.com/2019/English/api/sldworksapi/SolidWorks.Interop.sldworks~SolidWorks.Interop.sldworks.IModelDoc2~GetConfigurationNames.html
Option Explicit
Sub main()
    On Error GoTo Failed
    Dim app As SldWorks.SldWorks
    Dim doc As SldWorks.ModelDoc2
    Set app = Application.SldWorks
    Set doc = app.ActiveDoc
    If doc Is Nothing Then
        MsgBox "Open eerst een part of assembly.", vbExclamation
        Exit Sub
    End If
    If doc.GetType <> swDocPART And doc.GetType <> swDocASSEMBLY Then
        MsgBox "Deze macro is bedoeld voor een part of assembly.", vbExclamation
        Exit Sub
    End If
    Dim names As Variant
    names = doc.GetConfigurationNames
    If IsEmpty(names) Then
        MsgBox "Geen configuraties gevonden.", vbInformation
        Exit Sub
    End If
    Dim activeName As String
    activeName = doc.ConfigurationManager.ActiveConfiguration.Name
    Dim report As String, line As String, i As Long
    report = "Configuraties (* = actief):" & vbCrLf
    For i = LBound(names) To UBound(names)
        line = CStr(names(i))
        If line = activeName Then line = "* " & line
        If Len(report) + Len(line) > 850 Then
            MsgBox report, vbInformation, "Mechify - configuraties"
            report = "Vervolg:" & vbCrLf
        End If
        report = report & line & vbCrLf
    Next i
    MsgBox report, vbInformation, "Mechify - configuraties"
    Exit Sub
Failed:
    MsgBox "Rapport kon niet worden gemaakt: " & Err.Description, vbExclamation, "Mechify"
End Sub
