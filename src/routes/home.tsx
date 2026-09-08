import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow, Action, Closing, ToolTile } from "@/components/brand-ui";
import { AssemblyHero } from "@/components/assembly-hero";
import { QuickDrive } from "@/components/quick-drive";
import { TOOLS } from "@/lib/tools";
import { articles } from "@/lib/articles";
import { useDocumentMeta } from "@/lib/use-document-meta";
export function Home() {
  useDocumentMeta(
    "Van engineeringvraag naar machineoplossing",
    "Praktische engineeringkennis, rekentools en technische visuals voor machinebouwers.",
  );
  return (
    <PageShell>
      <section className="hero wrap">
        <div className="hero-copy">
          <Eyebrow>HET PLATFORM VOOR MACHINEBOUWERS</Eyebrow>
          <h1>
            Van engineeringvraag
            <br />
            naar <span>machine­oplossing.</span>
          </h1>
          <p>
            Breng je volgende machine verder.
            <br />
            Met praktische kennis, visueel inzicht en tools die het rekenwerk helder maken.
          </p>
          <div className="actions">
            <Action to="/toolkit">Open de toolkit</Action>
            <Action to="/topics" secondary>
              Ontdek engineeringtopics
            </Action>
          </div>
          <div className="hero-note">
            <span className="status-dot" />
            Gebouwd voor de praktijk. Direct bruikbaar.
          </div>
        </div>
        <AssemblyHero />
        <div className="hero-bottom">
          <span>VAN EERSTE CONCEPT TOT MAAKBAAR ONTWERP</span>
          <a href="#verder">SCROLL OM TE VERKENNEN ↓</a>
        </div>
      </section>
      <div className="discipline-bar">
        <div className="wrap">
          <span>Aandrijftechniek</span>
          <b>+</b>
          <span>Lineaire beweging</span>
          <b>+</b>
          <span>Pneumatiek</span>
          <b>+</b>
          <span>Machineconstructie</span>
          <b>+</b>
          <span>CAD-workflows</span>
        </div>
      </div>
      <section className="section wrap preview-section" id="verder">
        <div className="section-copy">
          <Eyebrow>01 / VAN VRAAG NAAR INZICHT</Eyebrow>
          <h2>
            Minder zoeken.
            <br />
            Meer <em>doorrekenen.</em>
          </h2>
          <p>
            Een motor gekozen. Maar welk koppel is beschikbaar? Maak van een specificatie een
            antwoord — met de formule en aannames altijd in beeld.
          </p>
          <Link className="text-link" to="/toolkit">
            Verken de hele toolkit <span>↗</span>
          </Link>
          <div className="small-note">
            <span className="mono cyan">P = T · ω</span>
            <p>
              Geen black box.
              <br />
              Jij houdt grip op de berekening.
            </p>
          </div>
        </div>
        <div className="home-calculator">
          <div className="panel-title">
            <span className="mono">
              <span className="status-dot" /> PROBEER HET ZELF
            </span>
            <Link to="/calculators/drive-power" aria-label="Open volledige koppelcalculator">
              ↗
            </Link>
          </div>
          <QuickDrive compact />
        </div>
      </section>
      <section className="section section-border wrap">
        <div className="section-heading">
          <div>
            <Eyebrow>02 / KENNIS DIE VERDER HELPT</Eyebrow>
            <h2>
              Begrijp de techniek.
              <br />
              Verbeter je ontwerp.
            </h2>
          </div>
          <Link className="text-link" to="/topics">
            Alle engineeringtopics <span>↗</span>
          </Link>
        </div>
        <div className="topics-home">
          {articles.slice(0, 4).map((a, i) => (
            <Link className="topic-row" key={a.slug} to={"/topics/" + a.slug}>
              <span className="row-index">0{i + 1}</span>
              <div>
                <span className="mono muted">
                  {a.category} · {a.time}
                </span>
                <h3>{a.title}</h3>
              </div>
              <span>↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="tool-section">
        <div className="wrap section">
          <div className="section-heading">
            <div>
              <Eyebrow>03 / JE DIGITALE WERKBANK</Eyebrow>
              <h2>
                Goed gereedschap.
                <br />
                Ook voor je berekeningen.
              </h2>
            </div>
            <Link className="text-link" to="/toolkit">
              Open de toolkit <span>↗</span>
            </Link>
          </div>
          <div className="tool-grid">
            {["fit-tolerances", "beam-deflection", "pneumatic-cylinder", "motor-specification"].map(
              (id) => (
                <ToolTile key={id} tool={TOOLS.find((t) => t.id === id)!} />
              ),
            )}
          </div>
        </div>
      </section>
      <section className="section wrap cad-home">
        <div className="cad-blueprint">
          <div className="mono muted">MODEL STRUCTURE / REV. 01</div>
          <div className="tree">
            <div>
              ⌖ <strong>Machine_assembly</strong>
            </div>
            <div className="tree-indent">
              ├ <span>Frame</span>
              <small>VASTE REFERENTIE</small>
            </div>
            <div className="tree-indent">
              ├ <span>Aandrijving</span>
              <small>SUBASSEMBLY</small>
            </div>
            <div className="tree-indent cyan">
              └ <span>Montageplaat</span>
              <small>PARAMETRISCH</small>
            </div>
          </div>
          <div className="parameter">
            <span>plaat_breedte</span>
            <b>
              180 <small>mm</small>
            </b>
          </div>
          <div className="parameter">
            <span>gat_afstand</span>
            <b>breedte − 40</b>
          </div>
          <div className="blueprint-foot">
            <span className="status-dot" /> Eén ontwerpintentie. Een robuust model.
          </div>
        </div>
        <div>
          <Eyebrow>04 / VAN MODEL NAAR MACHINE</Eyebrow>
          <h2>
            Je CAD-model.
            <br />
            Een stap verder.
          </h2>
          <p>
            Structuur aanbrengen, slim hergebruiken en met vertrouwen overdragen. Praktische
            workflows voor SolidWorks en Autodesk Inventor.
          </p>
          <Action to="/cad-workflows" secondary>
            Ontdek CAD-workflows
          </Action>
          <div className="software-tags">
            <span>SolidWorks</span>
            <span>Autodesk Inventor</span>
          </div>
        </div>
      </section>
      <Closing />
    </PageShell>
  );
}
