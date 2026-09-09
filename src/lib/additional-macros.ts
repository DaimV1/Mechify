import swMass from "../../public/macros/solidworks-mass-report.bas?raw";
import swConfigurations from "../../public/macros/solidworks-configuration-report.bas?raw";
import invMass from "../../public/macros/inventor-mass-report.bas?raw";
import invParameters from "../../public/macros/inventor-parameter-report.bas?raw";
export const additionalMacros = [
  {
    software: "SolidWorks",
    file: "/macros/solidworks-mass-report.bas",
    code: swMass,
    name: { nl: "Massa en zwaartepunt", en: "Mass and center of gravity" },
    note: {
      nl: "Rapporteert kg, mm³ en zwaartepunt in mm voor de actieve configuratie. Open een actueel part of opgeloste assembly met juiste materialen. Wist de selectie; slaat niets op. Start main.",
      en: "Reports kg, mm³ and center of mass in mm for the active configuration. Requires an up-to-date part or resolved assembly with correct materials. Clears selection; does not save. Run main.",
    },
    source:
      "https://help.solidworks.com/2017/english/api/sldworksapi/SOLIDWORKS.Interop.sldworks~SOLIDWORKS.Interop.sldworks.IModelDocExtension~CreateMassProperty.html",
  },
  {
    software: "SolidWorks",
    file: "/macros/solidworks-configuration-report.bas",
    code: swConfigurations,
    name: { nl: "Configuraties in beeld", en: "Configuration overview" },
    note: {
      nl: "Toont alle configuratienamen van een part of assembly en markeert de actieve configuratie. Lange lijsten verschijnen in opeenvolgende vensters. Activeert of wijzigt geen configuraties. Start main.",
      en: "Lists part or assembly configurations and marks the active one. Long lists use multiple dialogs. Does not activate or modify configurations. Run main.",
    },
    source:
      "https://help.solidworks.com/2019/English/api/sldworksapi/SolidWorks.Interop.sldworks~SolidWorks.Interop.sldworks.IModelDoc2~GetConfigurationNames.html",
  },
  {
    software: "Inventor",
    file: "/macros/inventor-mass-report.bas",
    code: invMass,
    name: { nl: "Massa en zwaartepunt", en: "Mass and center of gravity" },
    note: {
      nl: "Rapporteert kg, mm³ en zwaartepunt in mm voor de actieve modeltoestand van een part of assembly. Signaleert een massa-override. Controleer materialen; slaat geen document op. Start MassaRapport.",
      en: "Reports kg, mm³ and center of mass in mm for the active part or assembly model state. Indicates mass overrides. Check materials; does not save the document. Run MassaRapport.",
    },
    source: "https://help.autodesk.com/cloudhelp/2024/ENU/Inventor-API/files/MassProperties.htm",
  },
  {
    software: "Inventor",
    file: "/macros/inventor-parameter-report.bas",
    code: invParameters,
    name: { nl: "Gebruikersparameters rapporteren", en: "User parameter report" },
    note: {
      nl: "Leest namen, expressies en eenheden van UserParameters in het actieve part of assembly, inclusief tekst en booleans. Modelparameters vallen buiten dit rapport. Verdeelt lange lijsten over vensters. Start ParameterRapport.",
      en: "Reads UserParameter names, expressions and units from the active part or assembly, including text and booleans. Excludes model parameters. Long lists use multiple dialogs. Run ParameterRapport.",
    },
    source:
      "https://help.autodesk.com/cloudhelp/2024/ENU/Inventor-API/files/UserParameter_Expression.htm",
  },
];
