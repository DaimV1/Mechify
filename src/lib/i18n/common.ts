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
  favoriteAria: (title: string) => string;
  closingEyebrow: string;
  closingHeadline1: string;
  closingConnector: string;
  closingHeadline2: string;
  closingCta: string;
  skipToContent: string;
  navTopics: string;
  navToolkit: string;
  navCadWorkflows: string;
  navAbout: string;
  headerCta: string;
  mainNav: string;
  openMenu: string;
  closeMenu: string;
  breadcrumbNav: string;
  footerTagline: string;
  footerWorkLink: string;
  footerTablesNorms: string;
  footerMaterials: string;
  footerCadLibraries: string;
  footerMacros: string;
  footerIndependent: string;
  footerAboutModels: string;
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
    favoriteAria: (title: string) => `${title} als favoriet`,
    closingEyebrow: "DE VOLGENDE STAP IS AAN JOU",
    closingHeadline1: "Van goed idee.",
    closingConnector: "Naar ",
    closingHeadline2: "goed uitgewerkt.",
    closingCta: "Aan de slag met de toolkit",
    skipToContent: "Naar inhoud",
    navTopics: "Engineeringtopics",
    navToolkit: "Toolkit",
    navCadWorkflows: "CAD-workflows",
    navAbout: "Over Mechify",
    headerCta: "Open de toolkit",
    mainNav: "Hoofdnavigatie",
    openMenu: "Menu openen",
    closeMenu: "Menu sluiten",
    breadcrumbNav: "Kruimelpad",
    footerTagline: "Voor de mensen die machines maken.",
    footerWorkLink: "Aan het werk",
    footerTablesNorms: "Tabellen & normen",
    footerMaterials: "Materialen",
    footerCadLibraries: "CAD-bibliotheken",
    footerMacros: "Macro’s",
    footerIndependent: "Onafhankelijke kennis & tools · Geen CAD-koppeling",
    footerAboutModels: "Over de rekenmodellen",
    footerCopyright: (year: number) => `© ${year} Mechify`,
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
    favoriteAria: (title: string) => `${title} as favorite`,
    closingEyebrow: "THE NEXT STEP IS YOURS",
    closingHeadline1: "From a good idea.",
    closingConnector: "To ",
    closingHeadline2: "well executed.",
    closingCta: "Get started with the toolkit",
    skipToContent: "Skip to content",
    navTopics: "Engineering topics",
    navToolkit: "Toolkit",
    navCadWorkflows: "CAD workflows",
    navAbout: "About Mechify",
    headerCta: "Open the toolkit",
    mainNav: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    breadcrumbNav: "Breadcrumb",
    footerTagline: "For the people who make machines.",
    footerWorkLink: "Get to work",
    footerTablesNorms: "Tables & standards",
    footerMaterials: "Materials",
    footerCadLibraries: "CAD libraries",
    footerMacros: "Macros",
    footerIndependent: "Independent knowledge & tools · No CAD integration",
    footerAboutModels: "About the calculation models",
    footerCopyright: (year: number) => `© ${year} Mechify`,
  },
};
