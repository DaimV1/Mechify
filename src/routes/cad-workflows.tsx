import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow, Closing } from "@/components/brand-ui";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { tx, useLocale } from "@/lib/i18n/locale";
const steps = [
  {
    title: { nl: "Parametrisch modelleren", en: "Parametric modelling" },
    principle: {
      nl: "Benoem de ontwerpvariabelen. Leg maatrelaties vast vanuit de functie en test de kleinste en grootste variant.",
      en: "Name the design variables. Fix dimension relationships from the function and test the smallest and largest variant.",
    },
    sw: {
      nl: "Gebruik benoemde global variables en equations. Bepaal welke maten per configuratie variëren.",
      en: "Use named global variables and equations. Decide which dimensions vary per configuration.",
    },
    inv: {
      nl: "Gebruik benoemde user parameters. Koppel schetsmaten aan deze parameters en test de herberekening.",
      en: "Use named user parameters. Link sketch dimensions to these parameters and test the recalculation.",
    },
  },
  {
    title: { nl: "Samenstellingen & structuur", en: "Assemblies & structure" },
    principle: {
      nl: "Deel de machine op in functionele modules. Kies een vaste referentie en beperk afhankelijkheden tussen modules.",
      en: "Split the machine into functional modules. Choose a fixed reference and limit dependencies between modules.",
    },
    sw: {
      nl: "Leg subassemblies vast met doelgerichte mates. Controleer de vrije bewegingsgraden na wijzigingen.",
      en: "Fix subassemblies with purposeful mates. Check the remaining degrees of freedom after changes.",
    },
    inv: {
      nl: "Gebruik constraints of joints met een duidelijke functie. Controleer de bewegingsvrijheid van elke subassembly.",
      en: "Use constraints or joints with a clear function. Check the degrees of freedom of every subassembly.",
    },
  },
  {
    title: { nl: "Herbruikbare onderdelen", en: "Reusable parts" },
    principle: {
      nl: "Scheid standaarddelen van projectspecifieke onderdelen. Geef elk deel één herkenbare identiteit en revisie.",
      en: "Separate standard parts from project-specific ones. Give every part one recognizable identity and revision.",
    },
    sw: {
      nl: "Gebruik configuraties voor beheersbare varianten. Controleer configuratiespecifieke eigenschappen en verwijzingen.",
      en: "Use configurations for manageable variants. Check configuration-specific properties and references.",
    },
    inv: {
      nl: "Beheer herbruikbare delen met consistente parameters en iProperties. Leg vast welke variant voor productie bedoeld is.",
      en: "Manage reusable parts with consistent parameters and iProperties. Record which variant is meant for production.",
    },
  },
  {
    title: { nl: "Tekeningen & stuklijsten", en: "Drawings & bills of material" },
    principle: {
      nl: "Definieer materiaal, aantallen, revisie en kritieke maten. Controleer of model, tekening en stuklijst hetzelfde ontwerp beschrijven.",
      en: "Define material, quantities, revision and critical dimensions. Check that the model, drawing and BOM describe the same design.",
    },
    sw: {
      nl: "Controleer de gebruikte configuratie in elke drawing view en BOM. Verifieer part numbers en custom properties.",
      en: "Check the configuration used in every drawing view and BOM. Verify part numbers and custom properties.",
    },
    inv: {
      nl: "Controleer de BOM-structuur, parts list en iProperties voor onder andere titelblokken en stuklijsten.",
      en: "Check the BOM structure, parts list and iProperties feeding title blocks and parts lists, among other things.",
    },
  },
  {
    title: { nl: "Ontwerpcontrole & productieoverdracht", en: "Design review & handoff to production" },
    principle: {
      nl: "Beoordeel botsingen, gereedschapsruimte, toleranties en montagevolgorde. Leg daarna de vrijgegeven revisie vast.",
      en: "Review interferences, tool clearance, tolerances and assembly order. Then fix the released revision.",
    },
    sw: {
      nl: "Voer interference detection uit voor relevante componenten. Controleer drawings en referenties na de laatste rebuild.",
      en: "Run interference detection for the relevant components. Check drawings and references after the last rebuild.",
    },
    inv: {
      nl: "Controleer interference en bewegingsruimte. Werk tekeningen bij en verifieer de verwijzingen voor de overdracht.",
      en: "Check interference and clearance. Update drawings and verify the references before handoff.",
    },
  },
];
export function CadWorkflows() {
  const [software, setSoftware] = useState("SolidWorks");
  const { locale } = useLocale();
  useDocumentMeta(
    tx(locale, "CAD-workflows", "CAD workflows"),
    tx(
      locale,
      "Praktische workflows voor SolidWorks en Autodesk Inventor.",
      "Practical workflows for SolidWorks and Autodesk Inventor.",
    ),
  );
  return (
    <PageShell>
      <section className="wrap page-intro">
        <Eyebrow>{tx(locale, "VAN MODEL NAAR MACHINE", "FROM MODEL TO MACHINE")}</Eyebrow>
        <h1>
          {tx(locale, "Een robuust model.", "A robust model.")}
          <span>{tx(locale, "Een betere overdracht.", "A better handoff.")}</span>
        </h1>
        <p>
          {tx(
            locale,
            "Praktische CAD-workflows voor SolidWorks en Autodesk Inventor.",
            "Practical CAD workflows for SolidWorks and Autodesk Inventor.",
          )}
          <br />
          {tx(locale, "Het principe komt eerst. De software volgt.", "The principle comes first. The software follows.")}
        </p>
      </section>
      <section className="wrap cad-content">
        <div className="cad-switch" role="group" aria-label={tx(locale, "Kies CAD-software", "Choose CAD software")}>
          {["SolidWorks", "Autodesk Inventor"].map((s) => (
            <button key={s} aria-pressed={software === s} onClick={() => setSoftware(s)}>
              {s}
            </button>
          ))}
        </div>
        <p className="local-note">
          {tx(
            locale,
            "Onafhankelijke werkwijzen, geen directe koppelingen. Menunamen en functies kunnen per versie of licentie verschillen.",
            "Independent methods, no direct integrations. Menu names and functions may differ per version or license.",
          )}
        </p>
        {steps.map((step, i) => (
          <article className="workflow" key={step.title.nl}>
            <div className="workflow-number">0{i + 1}</div>
            <div>
              <h2>{step.title[locale]}</h2>
              <div className="workflow-columns">
                <div>
                  <span className="mono muted">
                    {tx(locale, "SOFTWARE-ONAFHANKELIJK PRINCIPE", "SOFTWARE-INDEPENDENT PRINCIPLE")}
                  </span>
                  <p>{step.principle[locale]}</p>
                </div>
                <div className="software-instruction">
                  <span className="mono cyan">{software.toUpperCase()}</span>
                  <p>{(software === "SolidWorks" ? step.sw : step.inv)[locale]}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
        <div className="sources">
          <Link to="/cad/resources">{tx(locale, "CAD-bibliotheken", "CAD libraries")} ↗</Link>
          <Link to="/cad/macros">{tx(locale, "Macro-bibliotheek", "Macro library")} ↗</Link>
          <a
            href="https://help.solidworks.com/2024/English/solidworks/sldworks/c_Configurations_Overview.htm"
            target="_blank"
            rel="noreferrer"
          >
            {tx(locale, "SolidWorks: configuraties", "SolidWorks: configurations")} ↗
          </a>
          <a
            href="https://help.autodesk.com/cloudhelp/2025/ENU/Inventor-Help/files/GUID-8ABF17C5-B9EB-47B5-92CF-9FBD335334E3.htm"
            target="_blank"
            rel="noreferrer"
          >
            Inventor: iProperties ↗
          </a>
        </div>
      </section>
      <Closing />
    </PageShell>
  );
}
