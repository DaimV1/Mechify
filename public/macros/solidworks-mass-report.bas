Attribute VB_Name = "MechifyMassReport"
' Mechify - massa en zwaartepunt, actieve configuratie.
' SolidWorks VBA: importeer via File > Import File en start main.
' Vereist opgelost, actueel part/assembly en juiste materiaalgegevens.
' Geen opslag of rebuild. Selectie wordt gewist om het volledige model te meten.
' Systeemwaarden: kg, m en m^3. Model-origin als referentie.
' API: https://help.solidworks.com/2017/english/api/sldworksapi/SOLIDWORKS.Interop.sldworks~SOLIDWORKS.Interop.sldworks.IModelDocExtension~CreateMassProperty.html
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
    doc.ClearSelection2 True
    Dim props As SldWorks.MassProperty
    Set props = doc.Extension.CreateMassProperty
    If props Is Nothing Then
        MsgBox "Geen massa-eigenschappen beschikbaar. Controleer de solid bodies.", vbExclamation
        Exit Sub
    End If
    props.UseSystemUnits = True
    Dim center As Variant
    center = props.CenterOfMass
    If IsEmpty(center) Then
        MsgBox "Geen zwaartepunt beschikbaar.", vbExclamation
        Exit Sub
    End If
    Dim report As String
    report = "Massa: " & Format(props.Mass, "0.000") & " kg" & vbCrLf
    report = report & "Volume: " & Format(props.Volume * 1000000000#, "0.000") & " mm^3" & vbCrLf
    report = report & "Zwaartepunt t.o.v. oorsprong (mm):" & vbCrLf
    report = report & "X: " & Format(center(0) * 1000#, "0.000") & vbCrLf
    report = report & "Y: " & Format(center(1) * 1000#, "0.000") & vbCrLf
    report = report & "Z: " & Format(center(2) * 1000#, "0.000") & vbCrLf
    report = report & "Controleer materialen en eventuele massa-overrides."
    MsgBox report, vbInformation, "Mechify - " & doc.GetTitle
    Exit Sub
Failed:
    MsgBox "Rapport kon niet worden gemaakt: " & Err.Description, vbExclamation, "Mechify"
End Sub
