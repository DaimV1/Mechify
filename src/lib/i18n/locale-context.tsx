import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "nl" | "en";

const STORAGE_KEY = "mechify-locale";

type LocaleContextValue = { locale: Locale; setLocale: (l: Locale) => void };

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** The URL owns language, including the very first hydration render. */
export function LocaleProvider({
  children,
  initialLocale = "nl",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale] = useState<Locale>(initialLocale);
  function setLocale(next: Locale) {
    if (next === locale) return;
    const base = window.location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    window.location.assign(
      (next === "en" ? "/en" + (base === "/" ? "" : base) : base) +
        window.location.search +
        window.location.hash,
    );
  }
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* optional preference */
    }
  }, [locale]);
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

/** Picks the string for the active locale from a {nl, en} pair — the shape used throughout lib/tools.ts and the calculator data files. */
export type Localized<T = string> = { nl: T; en: T };

export function pick<T>(locale: Locale, value: Localized<T>): T {
  return value[locale];
}
