import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow, Action, Closing, ToolTile } from "@/components/brand-ui";
import { AssemblyHero } from "@/components/assembly-hero";
import { QuickDrive } from "@/components/quick-drive";
import { TOOLS } from "@/lib/tools";
import { CATEGORY_LABELS, articles } from "@/lib/articles";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { tx, useLocale } from "@/lib/i18n/locale";
export function Home() {
  const { locale } = useLocale();
  useDocumentMeta(
    tx(
      locale,
      "Van engineeringvraag naar machineoplossing",
      "From engineering question to machine solution",
    ),
    tx(
      locale,
      "Praktische engineeringkennis, rekentools en technische visuals voor machinebouwers.",
      "Practical engineering knowledge, calculation tools and technical visuals for machine builders.",
    ),
  );
  return (
    <PageShell>
      <section className="hero wrap">
        <div className="hero-copy">
          <Eyebrow>{tx(locale, "HET PLATFORM VOOR MACHINEBOUWERS", "THE PLATFORM FOR MACHINE BUILDERS")}</Eyebrow>
          <h1>
            {tx(locale, "Van engineeringvraag", "From engineering question")}
            <br />
            {tx(locale, "naar ", "to ")}
            <span>{tx(locale, "machine­oplossing.", "machine solution.")}</span>
          </h1>
          <p>
            {tx(locale, "Breng je volgende machine verder.", "Take your next machine further.")}
            <br />
            {tx(
              locale,
              "Met praktische kennis, visueel inzicht en tools die het rekenwerk helder maken.",
              "With practical knowledge, visual insight and tools that make the calculations clear.",
            )}
          </p>
          <div className="actions">
            <Action to="/toolkit">{tx(locale, "Open de toolkit", "Open the toolkit")}</Action>
            <Action to="/topics" secondary>
              {tx(locale, "Ontdek engineeringtopics", "Discover engineering topics")}
            </Action>
          </div>
          <div className="hero-note">
            <span className="status-dot" />
            {tx(
              locale,
              "Gebouwd voor de praktijk. Direct bruikbaar als reken- en ontwerphulp.",
              "Built for the shop floor. Ready to use as a calculation and design aid.",
            )}
          </div>
        </div>
        <AssemblyHero />
        <div className="hero-bottom">
          <span>{tx(locale, "VAN EERSTE CONCEPT TOT MAAKBAAR ONTWERP", "FROM FIRST CONCEPT TO MANUFACTURABLE DESIGN")}</span>
          <a href="#verder">{tx(locale, "SCROLL OM TE VERKENNEN ↓", "SCROLL TO EXPLORE ↓")}</a>
        </div>
      </section>
      <div className="discipline-bar">
        <div className="wrap">
          <span>{tx(locale, "Aandrijftechniek", "Drive technology")}</span>
          <b>+</b>
          <span>{tx(locale, "Lineaire beweging", "Linear motion")}</span>
          <b>+</b>
          <span>{tx(locale, "Pneumatiek", "Pneumatics")}</span>
          <b>+</b>
          <span>{tx(locale, "Machineconstructie", "Machine design")}</span>
          <b>+</b>
          <span>{tx(locale, "CAD-workflows", "CAD workflows")}</span>
        </div>
      </div>
      <section className="section wrap preview-section" id="verder">
        <div className="section-copy">
          <Eyebrow>{tx(locale, "01 / VAN VRAAG NAAR INZICHT", "01 / FROM QUESTION TO INSIGHT")}</Eyebrow>
          <h2>
            {tx(locale, "Minder zoeken.", "Less searching.")}
            <br />
            {tx(locale, "Meer ", "More ")}
            <em>{tx(locale, "doorrekenen.", "calculating.")}</em>
          </h2>
          <p>
            {tx(
              locale,
              "Een motor gekozen. Maar welk koppel is beschikbaar? Maak van een specificatie een antwoord — met de formule en aannames altijd in beeld.",
              "You've chosen a motor. But what torque is actually available? Turn a specification into an answer — with the formula and assumptions always in view.",
            )}
          </p>
          <Link className="text-link" to="/toolkit">
            {tx(locale, "Verken de hele toolkit", "Explore the whole toolkit")} <span>↗</span>
          </Link>
          <div className="small-note">
            <span className="mono cyan">P = T · ω</span>
            <p>
              {tx(locale, "Geen black box.", "No black box.")}
              <br />
              {tx(locale, "Jij houdt grip op de berekening.", "You stay in control of the calculation.")}
            </p>
          </div>
        </div>
        <div className="home-calculator">
          <div className="panel-title">
            <span className="mono">
              <span className="status-dot" /> {tx(locale, "PROBEER HET ZELF", "TRY IT YOURSELF")}
            </span>
            <Link
              to="/calculators/drive-power"
              aria-label={tx(locale, "Open volledige koppelcalculator", "Open the full torque calculator")}
            >
              ↗
            </Link>
          </div>
          <QuickDrive compact />
        </div>
      </section>
      <section className="section section-border wrap">
        <div className="section-heading">
          <div>
            <Eyebrow>{tx(locale, "02 / KENNIS DIE VERDER HELPT", "02 / KNOWLEDGE THAT HELPS YOU MOVE FORWARD")}</Eyebrow>
            <h2>
              {tx(locale, "Begrijp de techniek.", "Understand the engineering.")}
              <br />
              {tx(locale, "Verbeter je ontwerp.", "Improve your design.")}
            </h2>
          </div>
          <Link className="text-link" to="/topics">
            {tx(locale, "Alle engineeringtopics", "All engineering topics")} <span>↗</span>
          </Link>
        </div>
        <div className="topics-home">
          {articles.slice(0, 4).map((a, i) => (
            <Link className="topic-row" key={a.slug} to={"/topics/" + a.slug}>
              <span className="row-index">0{i + 1}</span>
              <div>
                <span className="mono muted">
                  {CATEGORY_LABELS[a.category][locale]} · {a.time}
                </span>
                <h3>{a.title[locale]}</h3>
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
              <Eyebrow>{tx(locale, "03 / JE DIGITALE WERKBANK", "03 / YOUR DIGITAL WORKBENCH")}</Eyebrow>
              <h2>
                {tx(locale, "Goed gereedschap.", "Good tools.")}
                <br />
                {tx(locale, "Ook voor je berekeningen.", "For your calculations too.")}
              </h2>
            </div>
            <Link className="text-link" to="/toolkit">
              {tx(locale, "Open de toolkit", "Open the toolkit")} <span>↗</span>
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
          <div className="mono muted">{tx(locale, "MODEL STRUCTURE / REV. 01", "MODEL STRUCTURE / REV. 01")}</div>
          <div className="tree">
            <div>
              ⌖ <strong>Machine_assembly</strong>
            </div>
            <div className="tree-indent">
              ├ <span>{tx(locale, "Frame", "Frame")}</span>
              <small>{tx(locale, "VASTE REFERENTIE", "FIXED REFERENCE")}</small>
            </div>
            <div className="tree-indent">
              ├ <span>{tx(locale, "Aandrijving", "Drive")}</span>
              <small>SUBASSEMBLY</small>
            </div>
            <div className="tree-indent cyan">
              └ <span>{tx(locale, "Montageplaat", "Mounting plate")}</span>
              <small>{tx(locale, "PARAMETRISCH", "PARAMETRIC")}</small>
            </div>
          </div>
          <div className="parameter">
            <span>{tx(locale, "plaat_breedte", "plate_width")}</span>
            <b>
              180 <small>mm</small>
            </b>
          </div>
          <div className="parameter">
            <span>{tx(locale, "gat_afstand", "hole_spacing")}</span>
            <b>{tx(locale, "breedte − 40", "width − 40")}</b>
          </div>
          <div className="blueprint-foot">
            <span className="status-dot" />{" "}
            {tx(locale, "Eén ontwerpintentie. Een robuust model.", "One design intent. One robust model.")}
          </div>
        </div>
        <div>
          <Eyebrow>{tx(locale, "04 / VAN MODEL NAAR MACHINE", "04 / FROM MODEL TO MACHINE")}</Eyebrow>
          <h2>
            {tx(locale, "Je CAD-model.", "Your CAD model.")}
            <br />
            {tx(locale, "Een stap verder.", "One step further.")}
          </h2>
          <p>
            {tx(
              locale,
              "Structuur aanbrengen, slim hergebruiken en met vertrouwen overdragen. Praktische workflows voor SolidWorks en Autodesk Inventor.",
              "Add structure, reuse smartly and hand off with confidence. Practical workflows for SolidWorks and Autodesk Inventor.",
            )}
          </p>
          <Action to="/cad-workflows" secondary>
            {tx(locale, "Ontdek CAD-workflows", "Discover CAD workflows")}
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
