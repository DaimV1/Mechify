import { Toolkit } from "@/routes/toolkit";
import { Topics, TopicArticle } from "@/routes/topics";
import { CadWorkflows } from "@/routes/cad-workflows";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Home } from "@/routes/home";
import { SectionOverview } from "@/routes/section-overview";
import { ToolDetail } from "@/routes/tool-detail";
import { Tables } from "@/routes/tables";
import { Materials } from "@/routes/materials";
import { About } from "@/routes/about";
import { NotFound } from "@/routes/not-found";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/toolkit" element={<Toolkit />} />
      <Route path="/topics" element={<Topics />} />
      <Route path="/topics/:slug" element={<TopicArticle />} />
      <Route path="/cad-workflows" element={<CadWorkflows />} />
      <Route path="/over" element={<Navigate to="/about" replace />} />
      <Route path="/toolkit/:slug" element={<LegacyToolRedirect />} />

      <Route path="/tools" element={<SectionOverview section="tools" />} />
      <Route path="/tools/:slug" element={<ToolDetail section="tools" />} />

      <Route path="/calculators" element={<SectionOverview section="calculators" />} />
      <Route path="/calculators/:slug" element={<ToolDetail section="calculators" />} />

      <Route path="/cad" element={<SectionOverview section="cad" />} />
      <Route path="/cad/:slug" element={<ToolDetail section="cad" />} />

      <Route path="/tables" element={<Tables />} />
      <Route path="/materials" element={<Materials />} />
      <Route path="/about" element={<About />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const LEGACY: Record<string, string> = {
  passingen: "/tools/fit-tolerances",
  "iso-2768": "/tools/iso-2768",
  "spiebaan-toleranties": "/tools/keyways",
  lagerpassingen: "/tools/bearing-fits?model=referentie",
  "seegerring-groef": "/tools/seeger-grooves?model=referentie",
  bevestigers: "/tools/fasteners?model=referentie",
  "o-ringgroef": "/tools/o-ring-grooves?model=referentie",
  kanten: "/tools/edges?model=referentie",
  motorspecificatie: "/calculators/motor-specification?model=referentie",
  cilinder: "/calculators/pneumatic-cylinder?model=referentie",
  knikberekening: "/calculators/buckling",
  "doorbuiging-balk": "/calculators/beam-deflection?model=referentie",
  eenheden: "/calculators/units?model=referentie",
  bronnen: "/cad/resources",
  macros: "/cad/macros",
  koppel: "/calculators/drive-power",
  overbrenging: "/calculators/transmission",
  converter: "/calculators/units",
};
function LegacyToolRedirect() {
  const location = useLocation();
  const slug = location.pathname.split("/").pop() || "";
  const target = LEGACY[slug];
  if (!target) return <NotFound />;
  const [base, defaults] = target.split("?");
  const params = new URLSearchParams(defaults);
  new URLSearchParams(location.search).forEach((v, k) => params.set(k, v));
  if (slug === "iso-2768") {
    params.set("d", params.get("len") || "42");
    params.set("leg", params.get("len") || "42");
    params.set("gl", params.get("len") || "42");
    params.set("lc", params.get("linear") || "m");
    params.set("gc", params.get("form") || "K");
    for (const k of ["len", "linear", "form"]) params.delete(k);
  }
  return <Navigate to={base + (params.size ? "?" + params : "")} replace />;
}
