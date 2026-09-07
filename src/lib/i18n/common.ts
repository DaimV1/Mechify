import type { Locale } from "@/lib/i18n/locale-context";

export type CommonStrings = {
  calcHelper: string;
  copyResult: string;
  copyLink: string;
  copied: string;
  source: string;
  searchTool: string;
  searchToolAria: string;
  searchPlaceholder: string;
  noToolsFound: (q: string) => string;
  openTool: string;
  viewPlan: string;
  navTools: string;
  navCalculators: string;
  navTables: string;
  navMaterials: string;
  navCad: string;
  navAbout: string;
  mainNav: string;
  mobileNav: string;
  openMenu: string;
  closeMenu: string;
  breadcrumbNav: string;
  footerTagline: string;
  footerPlatform: string;
  footerTablesNorms: string;
  footerMaterials: string;
  footerMechify: string;
  footerAbout: string;
  footerCopyright: (year: number) => string;
};

/** Strings shared across many components: nav, footer, breadcrumbs, and the calc-ui.tsx atoms (copy buttons, source citation, etc.). */
export const COMMON: Record<Locale, CommonStrings> = {
  nl: {
    calcHelper: "Rekenhulp",
    copyResult: "Kopieer resultaat",
    copyLink: "Kopieer link",
    copied: "Gekopieerd",
    source: "Bron:",
    searchTool: "Zoek een tool",
    searchToolAria: "Zoek tools",
    searchPlaceholder: "Zoek op naam, norm of trefwoord…",
    noToolsFound: (q: string) => `Geen tools gevonden voor "${q}".`,
    openTool: "Open tool",
    viewPlan: "Bekijk plan",
    navTools: "Tools",
    navCalculators: "Rekenmodules",
    navTables: "Tabellen",
    navMaterials: "Materialen",
    navCad: "CAD",
    navAbout: "Over Mechify",
    mainNav: "Hoofdnavigatie",
    mobileNav: "Mobiele navigatie",
    openMenu: "Open menu",
    closeMenu: "Sluit menu",
    breadcrumbNav: "Kruimelpad",
    footerTagline:
      "Praktische engineering tools, rekenmodules en normtabellen voor werktuigbouwkundigen, constructeurs en ontwerpers. Ontworpen om nauwkeurig en snel te werken op de werkvloer.",
    footerPlatform: "Platform",
    footerTablesNorms: "Tabellen & normen",
    footerMaterials: "Materialen",
    footerMechify: "Mechify",
    footerAbout: "Over Mechify",
    footerCopyright: (year: number) =>
      `© ${year} Mechify. Referentiewaarden zonder garantie — controleer kritieke maten altijd tegen de actuele norm.`,
  },
  en: {
    calcHelper: "Calculator",
    copyResult: "Copy result",
    copyLink: "Copy link",
    copied: "Copied",
    source: "Source:",
    searchTool: "Search a tool",
    searchToolAria: "Search tools",
    searchPlaceholder: "Search by name, standard or keyword…",
    noToolsFound: (q: string) => `No tools found for "${q}".`,
    openTool: "Open tool",
    viewPlan: "View plan",
    navTools: "Tools",
    navCalculators: "Calculators",
    navTables: "Tables",
    navMaterials: "Materials",
    navCad: "CAD",
    navAbout: "About Mechify",
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    breadcrumbNav: "Breadcrumb",
    footerTagline:
      "Practical engineering tools, calculators and standard tables for mechanical engineers, designers and constructors. Built to work accurately and fast on the shop floor.",
    footerPlatform: "Platform",
    footerTablesNorms: "Tables & standards",
    footerMaterials: "Materials",
    footerMechify: "Mechify",
    footerAbout: "About Mechify",
    footerCopyright: (year: number) =>
      `© ${year} Mechify. Reference values without warranty — always check critical dimensions against the current standard.`,
  },
};
