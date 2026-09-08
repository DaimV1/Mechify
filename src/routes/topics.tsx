import { useSearchParams, useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow, Action } from "@/components/brand-ui";
import { articles } from "@/lib/articles";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { NotFound } from "./not-found";
const toolLinks: Record<string, string> = {
  koppel: "/calculators/drive-power",
  overbrenging: "/calculators/transmission",
  cilinder: "/calculators/pneumatic-cylinder",
  converter: "/calculators/units",
};
export function Topics() {
  const [p, setP] = useSearchParams(),
    q = p.get("q") || "",
    c = p.get("categorie") || "Alle";
  useDocumentMeta(
    "Engineeringtopics",
    "Praktische uitleg voor de keuzes die je machine beter maken.",
  );
  const list = articles.filter(
    (a) =>
      (c === "Alle" || a.category === c) &&
      `${a.title} ${a.intro} ${a.category}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <PageShell>
      <section className="wrap page-intro">
        <Eyebrow>KENNIS VOOR DE PRAKTIJK</Eyebrow>
        <h1>
          Van inzicht naar<span>beter ontwerp.</span>
        </h1>
        <p>Praktische uitleg voor de keuzes die je machine beter maken.</p>
      </section>
      <section className="wrap listing">
        <label className="search">
          <span>⌕</span>
          <span className="sr-only">Zoek onderwerpen</span>
          <input
            type="search"
            value={q}
            placeholder="Zoek een onderwerp…"
            onChange={(e) => setP({ q: e.target.value, categorie: c }, { replace: true })}
          />
        </label>
        <div className="filters">
          {["Alle", ...new Set(articles.map((a) => a.category))].map((cat) => (
            <button
              key={cat}
              aria-pressed={c === cat}
              onClick={() => setP({ q, categorie: cat }, { replace: true })}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="listing-meta mono">
          <span role="status">{list.length} artikelen</span>
          <button onClick={() => setP({}, { replace: true })}>Wis filters ↺</button>
        </div>
        {list.length ? (
          list.map((a, i) => (
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
          ))
        ) : (
          <div className="empty">
            <h2>Geen artikelen gevonden.</h2>
            <p>Wis de filters of probeer een andere zoekterm.</p>
          </div>
        )}
      </section>
    </PageShell>
  );
}
export function TopicArticle() {
  const { slug } = useParams();
  const a = articles.find((a) => a.slug === slug);
  useDocumentMeta(a?.title || "Artikel niet gevonden", a?.intro || "Dit artikel bestaat niet.");
  if (!a) return <NotFound />;
  return (
    <PageShell>
      <article className="wrap article brand-article">
        <Link className="back" to="/topics">
          ← Alle engineeringtopics
        </Link>
        <header className="article-header">
          <Eyebrow>
            {a.category.toUpperCase()} / {a.time.toUpperCase()}
          </Eyebrow>
          <h1>{a.title}</h1>
          <p>{a.intro}</p>
        </header>
        <div className="article-layout">
          <aside className="article-toc">
            <span className="mono muted">IN DIT ARTIKEL</span>
            {a.sections.map(([title], i) => (
              <a href={"#deel-" + i} key={title}>
                0{i + 1} {title}
              </a>
            ))}
            <Action to={toolLinks[a.tool]}>Bijbehorende tool</Action>
          </aside>
          <div className="article-body">
            <div className="practice">
              <span className="mono cyan">DE PRAKTIJKVRAAG</span>
              <p>{a.question}</p>
            </div>
            {a.sections.map(([title, text], i) => (
              <section id={"deel-" + i} key={title}>
                <span className="mono muted">0{i + 1}</span>
                <h2>{title}</h2>
                <p>{text}</p>
              </section>
            ))}
            {a.source ? (
              <p className="source">
                Verder lezen:{" "}
                <a href={a.source[1]} target="_blank" rel="noreferrer">
                  {a.source[0]} ↗
                </a>
              </p>
            ) : null}
            <div className="article-next">
              <h3>Breng de uitleg in praktijk.</h3>
              <Action to={toolLinks[a.tool]}>Open de bijbehorende tool</Action>
            </div>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
