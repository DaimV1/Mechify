import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow, Closing } from "@/components/brand-ui";
import { useDocumentMeta } from "@/lib/use-document-meta";
const steps = [
  [
    "Parametrisch modelleren",
    "Benoem de ontwerpvariabelen. Leg maatrelaties vast vanuit de functie en test de kleinste en grootste variant.",
    "Gebruik benoemde global variables en equations. Bepaal welke maten per configuratie variëren.",
    "Gebruik benoemde user parameters. Koppel schetsmaten aan deze parameters en test de herberekening.",
  ],
  [
    "Samenstellingen & structuur",
    "Deel de machine op in functionele modules. Kies een vaste referentie en beperk afhankelijkheden tussen modules.",
    "Leg subassemblies vast met doelgerichte mates. Controleer de vrije bewegingsgraden na wijzigingen.",
    "Gebruik constraints of joints met een duidelijke functie. Controleer de bewegingsvrijheid van elke subassembly.",
  ],
  [
    "Herbruikbare onderdelen",
    "Scheid standaarddelen van projectspecifieke onderdelen. Geef elk deel één herkenbare identiteit en revisie.",
    "Gebruik configuraties voor beheersbare varianten. Controleer configuratiespecifieke eigenschappen en verwijzingen.",
    "Beheer herbruikbare delen met consistente parameters en iProperties. Leg vast welke variant voor productie bedoeld is.",
  ],
  [
    "Tekeningen & stuklijsten",
    "Definieer materiaal, aantallen, revisie en kritieke maten. Controleer of model, tekening en stuklijst hetzelfde ontwerp beschrijven.",
    "Controleer de gebruikte configuratie in elke drawing view en BOM. Verifieer part numbers en custom properties.",
    "Controleer de BOM-structuur, parts list en iProperties voor onder andere titelblokken en stuklijsten.",
  ],
  [
    "Ontwerpcontrole & productieoverdracht",
    "Beoordeel botsingen, gereedschapsruimte, toleranties en montagevolgorde. Leg daarna de vrijgegeven revisie vast.",
    "Voer interference detection uit voor relevante componenten. Controleer drawings en referenties na de laatste rebuild.",
    "Controleer interference en bewegingsruimte. Werk tekeningen bij en verifieer de verwijzingen voor de overdracht.",
  ],
];
export function CadWorkflows() {
  const [software, setSoftware] = useState("SolidWorks");
  useDocumentMeta("CAD-workflows", "Praktische workflows voor SolidWorks en Autodesk Inventor.");
  return (
    <PageShell>
      <section className="wrap page-intro">
        <Eyebrow>VAN MODEL NAAR MACHINE</Eyebrow>
        <h1>
          Een robuust model.<span>Een betere overdracht.</span>
        </h1>
        <p>
          Praktische CAD-workflows voor SolidWorks en Autodesk Inventor.
          <br />
          Het principe komt eerst. De software volgt.
        </p>
      </section>
      <section className="wrap cad-content">
        <div className="cad-switch" role="group" aria-label="Kies CAD-software">
          {["SolidWorks", "Autodesk Inventor"].map((s) => (
            <button key={s} aria-pressed={software === s} onClick={() => setSoftware(s)}>
              {s}
            </button>
          ))}
        </div>
        <p className="local-note">
          Onafhankelijke werkwijzen, geen directe koppelingen. Menunamen en functies kunnen per
          versie of licentie verschillen.
        </p>
        {steps.map(([title, principle, sw, inv], i) => (
          <article className="workflow" key={title}>
            <div className="workflow-number">0{i + 1}</div>
            <div>
              <h2>{title}</h2>
              <div className="workflow-columns">
                <div>
                  <span className="mono muted">SOFTWARE-ONAFHANKELIJK PRINCIPE</span>
                  <p>{principle}</p>
                </div>
                <div className="software-instruction">
                  <span className="mono cyan">{software.toUpperCase()}</span>
                  <p>{software === "SolidWorks" ? sw : inv}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
        <div className="sources">
          <Link to="/cad/resources">CAD-bibliotheken ↗</Link>
          <Link to="/cad/macros">Macro-bibliotheek ↗</Link>
          <a
            href="https://help.solidworks.com/2024/English/solidworks/sldworks/c_Configurations_Overview.htm"
            target="_blank"
            rel="noreferrer"
          >
            SolidWorks: configuraties ↗
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
