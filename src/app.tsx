import { Route, Routes } from "react-router-dom";
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
