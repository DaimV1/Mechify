import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "@/components/layout/logo";
import { LocaleToggle } from "@/components/layout/locale-toggle";
import { Container } from "@/components/layout/container";
import { COMMON, type CommonStrings } from "@/lib/i18n/common";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

function navLinks(t: CommonStrings) {
  return [
    { href: "/tools", label: t.navTools },
    { href: "/calculators", label: t.navCalculators },
    { href: "/tables", label: t.navTables },
    { href: "/materials", label: t.navMaterials },
    { href: "/cad", label: t.navCad },
    { href: "/about", label: t.navAbout },
  ];
}

function navLinkClass(isActive: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "text-ink" : "text-muted hover:text-ink",
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = COMMON[locale];
  const NAV_LINKS = navLinks(t);

  useEffect(() => {
    setOpen(false);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <Container wide className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label={t.mainNav}>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} to={link.href} className={({ isActive }) => navLinkClass(isActive)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleToggle />
          <NavLink
            to="/tools"
            className="hidden items-center gap-2 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:flex"
          >
            <Search className="size-4" aria-hidden="true" />
            {t.searchTool}
          </NavLink>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md border border-border-strong text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.closeMenu : t.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {open ? (
        <nav id="mobile-nav" aria-label={t.mobileNav} className="border-t border-border bg-bg md:hidden">
          <Container className="flex flex-col gap-1 py-3" wide>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-3 text-base font-medium",
                    isActive ? "bg-surface text-ink" : "text-muted hover:bg-surface hover:text-ink",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
