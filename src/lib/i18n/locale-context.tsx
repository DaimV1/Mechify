import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "nl" | "en";

const STORAGE_KEY = "mechify-locale";

type LocaleContextValue = { locale: Locale; setLocale: (l: Locale) => void };

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "nl";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "nl";
  } catch {
    return "nl";
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readStoredLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
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
