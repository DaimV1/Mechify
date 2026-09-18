import { Logo } from "./logo";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLocale } from "@/lib/i18n/locale-context";
import { COMMON } from "@/lib/i18n/common";
export function Header() {
  const [open, setOpen] = useState(false);
  const { locale } = useLocale();
  const t = COMMON[locale];
  return (
    <>
      <a className="skip" href="#main">
        {t.skipToContent}
      </a>
      <header className="header">
        <Logo className="brand-logo" />
        <button
          className="menu-button"
          aria-label={t.openMenu}
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
          aria-label={t.mainNav}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <NavLink to="/topics">{t.navTopics}</NavLink>
          <NavLink to="/toolkit">{t.navToolkit}</NavLink>
          <NavLink to="/cad-workflows">{t.navCadWorkflows}</NavLink>
          <NavLink to="/about">{t.navAbout}</NavLink>
        </nav>
        <Link className="header-cta" to="/toolkit">
          {t.headerCta} <span>↗</span>
        </Link>
      </header>
    </>
  );
}
