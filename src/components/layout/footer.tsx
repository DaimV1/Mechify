import {Logo} from "./logo";
import { Link } from "react-router-dom";
export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <Logo className="brand-logo" />
        <p>Voor de mensen die machines maken.</p>
        <Link to="/toolkit">Aan het werk ↗</Link>
      </div>
      <div className="footer-links">
        <Link to="/tables">Tabellen & normen</Link>
        <Link to="/materials">Materialen</Link>
        <Link to="/cad/resources">CAD-bibliotheken</Link>
        <Link to="/cad/macros">Macro’s</Link>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Mechify</span>
        <span>Onafhankelijke kennis & tools · Geen CAD-koppeling</span>
        <Link to="/about#rekenmodellen">Over de rekenmodellen</Link>
      </div>
    </footer>
  );
}
