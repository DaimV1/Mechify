import {Logo} from "./logo";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip" href="#main">
        Naar inhoud
      </a>
      <header className="header">
        <Logo className="brand-logo" />
        <button
          className="menu-button"
          aria-label="Menu openen"
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(!open)}
        >
          Menu <span>☰</span>
        </button>
        <nav
          onClick={() => setOpen(false)}
          className={open ? "open" : ""}
          id="navigation"
          aria-label="Hoofdnavigatie"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <NavLink to="/topics">Engineeringtopics</NavLink>
          <NavLink to="/toolkit">Toolkit</NavLink>
          <NavLink to="/cad-workflows">CAD-workflows</NavLink>
          <NavLink to="/about">Over Mechify</NavLink>
        </nav>
        <Link className="header-cta" to="/toolkit">
          Open de toolkit <span>↗</span>
        </Link>
      </header>
    </>
  );
}
