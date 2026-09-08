export { useLocale, type Locale } from "./locale-context";
export function tx(locale: "nl" | "en", nl: string, en: string) {
  return locale === "en" ? en : nl;
}
