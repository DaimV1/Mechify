import { useSearchParams, useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow, Action } from "@/components/brand-ui";
import { ARTICLE_AUTHOR, CATEGORY_LABELS, articles } from "@/lib/articles";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { tx, useLocale } from "@/lib/i18n/locale";
import { NotFound } from "./not-found";
const toolLinks: Record<string, string> = {
  koppel: "/calculators/drive-power",
  overbrenging: "/calculators/transmission",
  cilinder: "/calculators/pneumatic-cylinder",
  converter: "/calculators/units",
  spiebanen: "/tools/keyways",
  lagerpassing: "/tools/bearing-fits",
  knik: "/calculators/buckling",
  lagerlevensduur: "/calculators/bearing-life",
  "shaft-diameter": "/calculators/shaft-diameter",
  "bolted-joint": "/calculators/bolted-joint",
  "o-ring-grooves": "/tools/o-ring-grooves",
  "iso-2768": "/tools/iso-2768",
  edges: "/tools/edges",
  fasteners: "/tools/fasteners",
};
export function Topics() {
  const { locale } = useLocale();
  const [p, setP] = useSearchParams(),
    q = p.get("q") || "",
    c = p.get("categorie") || "Alle";
  useDocumentMeta(
    tx(locale, "Engineeringtopics", "Engineering topics"),
    tx(
      locale,
      "Praktische uitleg voor de keuzes die je machine beter maken.",
      "Practical explanations for the choices that make your machine better.",
    ),
  );
  const list = articles.filter(
    (a) =>
      (c === "Alle" || a.category === c) &&
      `${a.title[locale]} ${a.intro[locale]} ${a.category}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <PageShell>
      <section className="wrap page-intro">
        <Eyebrow>{tx(locale, "KENNIS VOOR DE PRAKTIJK", "KNOWLEDGE FOR THE SHOP FLOOR")}</Eyebrow>
        <h1>
          {tx(locale, "Van inzicht naar", "From insight to")}
          <span>{tx(locale, "beter ontwerp.", "better design.")}</span>
        </h1>
        <p>
          {tx(
            locale,
            "Praktische uitleg voor de keuzes die je machine beter maken.",
            "Practical explanations for the choices that make your machine better.",
          )}
        </p>
      </section>
      <section className="wrap listing">
        <label className="search">
          <span>⌕</span>
          <span className="sr-only">{tx(locale, "Zoek onderwerpen", "Search topics")}</span>
          <input
            type="search"
            value={q}
            placeholder={tx(locale, "Zoek een onderwerp…", "Search a topic…")}
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
              {cat === "Alle" ? tx(locale, "Alle", "All") : CATEGORY_LABELS[cat][locale]}
            </button>
          ))}
        </div>
        <div className="listing-meta mono">
          <span role="status">
            {list.length} {tx(locale, "artikelen", "articles")}
          </span>
          <button onClick={() => setP({}, { replace: true })}>
            {tx(locale, "Wis filters", "Clear filters")} ↺
          </button>
        </div>
        {list.length ? (
          list.map((a, i) => (
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
          ))
        ) : (
          <div className="empty">
            <h2>{tx(locale, "Geen artikelen gevonden.", "No articles found.")}</h2>
            <p>
              {tx(
                locale,
                "Wis de filters of probeer een andere zoekterm.",
                "Clear the filters or try a different search term.",
              )}
            </p>
          </div>
        )}
      </section>
    </PageShell>
  );
}
export function TopicArticle() {
  const { locale } = useLocale();
  const { slug } = useParams();
  const a = articles.find((a) => a.slug === slug);
  useDocumentMeta(
    a?.title[locale] || tx(locale, "Artikel niet gevonden", "Article not found"),
    a?.intro[locale] || tx(locale, "Dit artikel bestaat niet.", "This article does not exist."),
    {
      schema: a
        ? {
            type: "TechArticle",
            extra: {
              author: { "@type": "Person", name: ARTICLE_AUTHOR },
              dateModified: a.reviewedDateIso,
              articleSection: a.category,
            },
            breadcrumbs: [
              { name: "Mechify", path: "/" },
              { name: "Engineeringtopics", path: "/topics" },
            ],
          }
        : undefined,
    },
  );
  if (!a) return <NotFound />;
  return (
    <PageShell>
      <article className="wrap article brand-article">
        <Link className="back" to="/topics">
          ← {tx(locale, "Alle engineeringtopics", "All engineering topics")}
        </Link>
        <header className="article-header">
          <Eyebrow>
            {CATEGORY_LABELS[a.category][locale].toUpperCase()} / {a.time.toUpperCase()}
          </Eyebrow>
          <h1>{a.title[locale]}</h1>
          <p>{a.intro[locale]}</p>
          <dl className="article-provenance">
            <div>
              <dt>{tx(locale, "Geschreven door", "Written by")}</dt>
              <dd>{ARTICLE_AUTHOR}</dd>
            </div>
            <div>
              <dt>{tx(locale, "Laatst gecontroleerd", "Last checked")}</dt>
              <dd>{a.reviewedDate[locale]}</dd>
            </div>
            <div>
              <dt>{tx(locale, "Technische basis", "Technical basis")}</dt>
              <dd>{a.basis[locale]}</dd>
              {a.slug === "spiebaan-toleranties-kiezen" && (
                <dd>
                  <a href="https://test-katalog.ganternorm.com/pdf/ganter/en/6885-1.pdf">
                    Ganter DIN 6885-1
                  </a>
                </dd>
              )}
              {a.slug === "lagerpassing-kiezen" && (
                <dd>
                  <a href="https://cdn.skfmediahub.skf.com/api/public/0947488ecec83348/pdf_preview_medium/0947488ecec83348_pdf_preview_medium.pdf">
                    SKF: bearing fits and arrangements
                  </a>
                </dd>
              )}
            </div>
          </dl>
        </header>
        <div className="article-layout">
          <aside className="article-toc">
            <span className="mono muted">{tx(locale, "IN DIT ARTIKEL", "IN THIS ARTICLE")}</span>
            {a.sections.map(([title], i) => (
              <a href={"#deel-" + i} key={title.nl}>
                0{i + 1} {title[locale]}
              </a>
            ))}
            <Action to={toolLinks[a.tool]}>
              {tx(locale, "Bijbehorende tool", "Related tool")}
            </Action>
          </aside>
          <div className="article-body">
            <div className="practice">
              <span className="mono cyan">
                {tx(locale, "DE PRAKTIJKVRAAG", "THE PRACTICAL QUESTION")}
              </span>
              <p>{a.question[locale]}</p>
            </div>
            {a.sections.map(([title, text], i) => (
              <section id={"deel-" + i} key={title.nl}>
                <span className="mono muted">0{i + 1}</span>
                <h2>{title[locale]}</h2>
                <p>{text[locale]}</p>
              </section>
            ))}
            {a.source ? (
              <p className="source">
                {tx(locale, "Verder lezen:", "Further reading:")}{" "}
                <a href={a.source[1]} target="_blank" rel="noreferrer">
                  {a.source[0]} ↗
                </a>
              </p>
            ) : null}
            <div className="article-next">
              <h3>
                {tx(locale, "Breng de uitleg in praktijk.", "Put the explanation into practice.")}
              </h3>
              <Action to={toolLinks[a.tool]}>
                {tx(locale, "Open de bijbehorende tool", "Open the related tool")}
              </Action>
            </div>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
