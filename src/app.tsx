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
import { resolveLegacyRoute } from "@/lib/legacy-routes";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/toolkit" element={<Toolkit />} />
      <Route path="/topics" element={<Topics />} />
      <Route path="/topics/:slug" element={<TopicArticle />} />
      <Route path="/cad-workflows" element={<CadWorkflows />} />
      <Route path="/over" element={<LegacyRedirect />} />
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

function LegacyToolRedirect() {
  const location = useLocation();
  const target = resolveLegacyRoute(location.pathname, location.search);
  if (!target) return <NotFound />;
  return <Navigate to={target} replace />;
}

function LegacyRedirect() {
  const location = useLocation();
  const target = resolveLegacyRoute(location.pathname, location.search);
  return target ? <Navigate to={target} replace /> : <NotFound />;
}
