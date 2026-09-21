import { Logo } from "./logo";
import { Link } from "react-router-dom";
import { useLocale } from "@/lib/i18n/locale-context";
import { COMMON } from "@/lib/i18n/common";
export function Footer() {
  const { locale } = useLocale();
  const t = COMMON[locale];
  return (
    <footer>
      <div className="footer-top">
        <Logo className="brand-logo" />
        <p>{t.footerTagline}</p>
        <Link to="/toolkit">{t.footerWorkLink} ↗</Link>
      </div>
      <div className="footer-links">
        <Link to="/tables">{t.footerTablesNorms}</Link>
        <Link to="/materials">{t.footerMaterials}</Link>
        <Link to="/cad/resources">{t.footerCadLibraries}</Link>
        <Link to="/cad/macros">{t.footerMacros}</Link>
      </div>
      <div className="footer-bottom">
        <span>{t.footerCopyright(2026)}</span>
        <span>{t.footerIndependent}</span>
        <Link to="/about#rekenmodellen">{t.footerAboutModels}</Link>
      </div>
    </footer>
  );
}
