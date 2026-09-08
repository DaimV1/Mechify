import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow, ToolTile, readFavorites } from "@/components/brand-ui";
import { matchTools } from "@/lib/tools";
import { useDocumentMeta } from "@/lib/use-document-meta";
export function Toolkit() {
  useDocumentMeta(
    "Engineeringtoolkit",
    "De complete Mechify-toolkit: toleranties, verbindingen, aandrijvingen, sterkteberekeningen en CAD.",
  );
  const [search, setSearch] = useSearchParams();
  const [, refresh] = useState(0);
  const query = search.get("q") || "",
    category = search.get("categorie") || "Alle",
    favorites = search.get("favorieten") === "1";
  const categories: Record<string, string> = {
    Alle: "Alle",
    tools: "Maatvoering & verbindingen",
    calculators: "Rekenmodules",
    cad: "CAD & naslag",
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
        <Eyebrow>JE DIGITALE WERKBANK</Eyebrow>
        <h1>
          De engineering<span>toolkit.</span>
        </h1>
        <p>Van passing tot aandrijving. Direct antwoord, met de berekening erbij.</p>
      </section>
      <section className="wrap listing">
        <div className="search-row">
          <label className="search">
            <span aria-hidden>⌕</span>
            <span className="sr-only">Zoek tools</span>
            <input
              type="search"
              value={query}
              placeholder="Zoek een tool, norm of grootheid…"
              onChange={(e) => update("q", e.target.value)}
            />
          </label>
          <button
            className="filter-favorite"
            aria-pressed={favorites}
            onClick={() => update("favorieten", favorites ? "" : "1")}
          >
            ☆ Mijn favorieten
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
          <button onClick={() => setSearch({}, { replace: true })}>Wis filters ↺</button>
        </div>
        <div className="tool-grid full-grid">
          {list.length ? (
            list.map((t) => (
              <ToolTile key={t.id} tool={t} onFavorite={() => refresh((n) => n + 1)} />
            ))
          ) : (
            <div className="empty">
              <span>⌕</span>
              <h2>Geen {favorites ? "favorieten" : "resultaten"} gevonden.</h2>
              <p>Probeer een andere zoekterm of wis de filters.</p>
            </div>
          )}
        </div>
        <p className="local-note">
          Favorieten blijven in deze browser. Zoekopdracht en filters zijn deelbaar via de URL.{" "}
          <Link to="/tables">Bekijk ook de referentietabellen ↗</Link>
        </p>
      </section>
    </PageShell>
  );
}
