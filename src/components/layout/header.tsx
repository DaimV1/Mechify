import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/tools", label: "Tools" },
  { href: "/calculators", label: "Rekenmodules" },
  { href: "/tables", label: "Tabellen" },
  { href: "/materials", label: "Materialen" },
  { href: "/cad", label: "CAD" },
  { href: "/about", label: "Over Mechify" },
];

function navLinkClass(isActive: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "text-ink" : "text-muted hover:text-ink",
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <Container wide className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hoofdnavigatie">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} to={link.href} className={({ isActive }) => navLinkClass(isActive)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/tools"
            className="hidden items-center gap-2 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:flex"
          >
            <Search className="size-4" aria-hidden="true" />
            Zoek een tool
          </NavLink>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md border border-border-strong text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Sluit menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {open ? (
        <nav id="mobile-nav" aria-label="Mobiele navigatie" className="border-t border-border bg-bg md:hidden">
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
