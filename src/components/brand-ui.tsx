import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toolHref, type Tool } from "@/lib/tools";
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
export function Action({
  children,
  to,
  secondary = false,
}: {
  children: ReactNode;
  to: string;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} to={to}>
      {children}
      <span aria-hidden>↗</span>
    </Link>
  );
}
export function Closing() {
  return (
    <section className="closing wrap">
      <div>
        <Eyebrow>DE VOLGENDE STAP IS AAN JOU</Eyebrow>
        <h2>
          Van goed idee.
          <br />
          Naar <span>goed uitgewerkt.</span>
        </h2>
      </div>
      <Action to="/toolkit">Aan de slag met de toolkit</Action>
    </section>
  );
}
export function readFavorites(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem("mechify.favorites") || "[]");
    return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
export function ToolTile({ tool, onFavorite }: { tool: Tool; onFavorite?: () => void }) {
  const [favorite, setFavorite] = useState(() => readFavorites().includes(tool.id));
  return (
    <article className="tool-card">
      <div className="tool-top">
        <span className="tool-symbol" aria-hidden>
          {tool.section === "cad" ? "⌘" : tool.section === "calculators" ? "↻" : "⌖"}
        </span>
        <button
          className="favorite"
          aria-label={`${tool.title.nl} als favoriet`}
          aria-pressed={favorite}
          onClick={() => {
            const ids = readFavorites();
            const next = ids.includes(tool.id)
              ? ids.filter((id) => id !== tool.id)
              : [...ids, tool.id];
            try {
              localStorage.setItem("mechify.favorites", JSON.stringify(next));
            } catch {
              /* Browser storage is optional. */
            }
            setFavorite(!favorite);
            onFavorite?.();
          }}
        >
          {favorite ? "★" : "☆"}
        </button>
      </div>
      <span className="mono muted">{tool.standard}</span>
      <h3>
        <Link to={toolHref(tool)}>{tool.title.nl}</Link>
      </h3>
      <p>{tool.blurb.nl}</p>
      <Link className="text-link" to={toolHref(tool)}>
        Open tool <span>↗</span>
      </Link>
    </article>
  );
}
