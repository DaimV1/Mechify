import { Logo } from "./logo";
import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLocale } from "@/lib/i18n/locale-context";
import { COMMON } from "@/lib/i18n/common";
export function Header() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { locale } = useLocale();
  const t = COMMON[locale];
  return (
    <>
      <a className="skip" href="#main">
        {t.skipToContent}
      </a>
      <header
        className="header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}
      >
        <Logo className="brand-logo" />
        <button
          ref={menuButton}
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
