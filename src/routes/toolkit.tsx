import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow, ToolTile, readFavorites } from "@/components/brand-ui";
import { matchTools } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { tx, useLocale } from "@/lib/i18n/locale";
export function Toolkit() {
  const { locale } = useLocale();
  useDocumentMeta(
    tx(locale, "Engineeringtoolkit", "Engineering toolkit"),
    tx(
      locale,
      "De complete Mechify-toolkit: toleranties, verbindingen, aandrijvingen, sterkteberekeningen en CAD.",
      "The complete Mechify toolkit: tolerances, connections, drives, strength calculations and CAD.",
    ),
  );
  const [search, setSearch] = useSearchParams();
  const [, refresh] = useState(0);
  const query = search.get("q") || "",
    category = search.get("categorie") || "Alle",
    favorites = search.get("favorieten") === "1";
  const categories: Record<string, string> = {
    Alle: tx(locale, "Alle", "All"),
    tools: tx(locale, "Maatvoering & verbindingen", "Dimensions & connections"),
    calculators: tx(locale, "Rekenmodules", "Calculators"),
    cad: tx(locale, "CAD & naslag", "CAD & reference"),
  };
  function update(key: string, v: string) {
    setSearch(
      (p) => {
        const next = new URLSearchParams(p);
        if (v) next.set(key, v);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  const list = matchTools(query).filter(
    (t) =>
      (category === "Alle" || t.section === category) &&
      (!favorites || readFavorites().includes(t.id)),
  );
  return (
    <PageShell>
      <section className="wrap page-intro">
        <Eyebrow>{tx(locale, "JE DIGITALE WERKBANK", "YOUR DIGITAL WORKBENCH")}</Eyebrow>
        <h1>
          {tx(locale, "De engineering", "The engineering")}
          <span>toolkit.</span>
        </h1>
        <p>
          {tx(
            locale,
            "Van passing tot aandrijving. Direct antwoord, met de berekening erbij.",
            "From fit to drive. A direct answer, with the calculation alongside it.",
          )}
        </p>
      </section>
      <section className="wrap listing">
        <div className="search-row">
          <label className="search">
            <span aria-hidden>⌕</span>
            <span className="sr-only">{tx(locale, "Zoek tools", "Search tools")}</span>
            <input
              type="search"
              value={query}
              placeholder={tx(
                locale,
                "Zoek een tool, norm of grootheid…",
                "Search a tool, standard or quantity…",
              )}
              onChange={(e) => update("q", e.target.value)}
            />
          </label>
          <button
            className="filter-favorite"
            aria-pressed={favorites}
            onClick={() => update("favorieten", favorites ? "" : "1")}
          >
            ☆ {tx(locale, "Mijn favorieten", "My favorites")}
          </button>
        </div>
        <div className="filters">
          {Object.entries(categories).map(([id, label]) => (
            <button
              key={id}
              aria-pressed={category === id}
              onClick={() => update("categorie", id === "Alle" ? "" : id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="listing-meta mono">
          <span role="status">
            {list.length} {list.length === 1 ? "tool" : "tools"}
          </span>
          <button onClick={() => setSearch({}, { replace: true })}>
            {tx(locale, "Wis filters", "Clear filters")} ↺
          </button>
        </div>
        <div className="tool-grid full-grid">
          {list.length ? (
            list.map((t) => (
              <ToolTile key={t.id} tool={t} onFavorite={() => refresh((n) => n + 1)} />
            ))
          ) : (
            <div className="empty">
              <span>⌕</span>
              <h2>
                {tx(
                  locale,
                  `Geen ${favorites ? "favorieten" : "resultaten"} gevonden.`,
                  `No ${favorites ? "favorites" : "results"} found.`,
                )}
              </h2>
              <p>
                {tx(
                  locale,
                  "Probeer een andere zoekterm of wis de filters.",
                  "Try a different search term or clear the filters.",
                )}
              </p>
            </div>
          )}
        </div>
        <p className="local-note">
          {tx(
            locale,
            "Favorieten blijven in deze browser. Zoekopdracht en filters zijn deelbaar via de URL.",
            "Favorites stay in this browser. Search and filters are shareable via the URL.",
          )}{" "}
          <Link to="/tables">
            {tx(locale, "Bekijk ook de referentietabellen", "Also see the reference tables")} ↗
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
