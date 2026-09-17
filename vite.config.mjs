import { articles } from "./src/lib/articles.ts";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";
import { SECTIONS, TOOLS, toolHref } from "./src/lib/tools.ts";
import { getAllRoutes } from "./src/lib/all-routes.ts";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://www.mechify.nl";

/** Emits robots.txt and sitemap.xml from the same tool/section data the app renders, so they can't drift. */
function sitemapPlugin() {
  return {
    name: "mechify-sitemap",
    apply: "build",
    closeBundle() {
      const routes = getAllRoutes();

      const template = fs.readFileSync(path.resolve(__dirname, "dist/index.html"), "utf8");
      const escape = (s) =>
        s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
      for (const route of routes.filter((r) => r !== "/")) {
        const tool = TOOLS.find((t) => toolHref(t) === route),
          article = articles.find((a) => "/topics/" + a.slug === route);
        const labels = {
          "/toolkit": "Engineeringtoolkit",
          "/topics": "Engineeringtopics",
          "/cad-workflows": "CAD-workflows",
          "/about": "Over Mechify",
          "/tables": "Tabellen en normen",
          "/materials": "Materialen",
          "/tools": "Maatvoering en verbindingen",
          "/calculators": "Rekenmodules",
          "/cad": "CAD-bibliotheken en macro’s",
        };
        const title = escape(
          (tool?.title.nl || article?.title || labels[route] || "Mechify") + " — Mechify",
        );
        const description = escape(
          tool?.blurb.nl ||
            article?.intro ||
            "Praktische engineeringkennis en rekentools voor machinebouwers.",
        );
        let html = template.replace(/<title>[\s\S]*?<\/title>/, "<title>" + title + "</title>");
        html = html
          .replace(
            /(<meta\s+(?:property|name)="(?:og:title|twitter:title)"\s+content=")[^"]*/g,
            "$1" + title,
          )
          .replace(
            /(<meta\s+(?:property|name)="(?:description|og:description|twitter:description)"\s+content=")[^"]*/g,
            "$1" + description,
          )
          .replace(/(<link rel="canonical" href=")[^"]*/, "$1" + SITE_URL + route)
          .replace(/(<meta property="og:url" content=")[^"]*/, "$1" + SITE_URL + route);
        const destination = path.resolve(__dirname, "dist" + route + ".html");
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, html);
      }
      const urlset = routes
        .map((route) => `  <url><loc>${SITE_URL}${route === "/" ? "" : route}</loc></url>`)
        .join("\n");
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;

      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

      fs.writeFileSync(path.resolve(__dirname, "dist/sitemap.xml"), sitemap);
      fs.writeFileSync(path.resolve(__dirname, "dist/robots.txt"), robots);
      fs.writeFileSync(path.resolve(__dirname, "dist/llms.txt"), buildLlmsTxt());
    },
  };
}

/**
 * AI-001 (audit, 17 sept 2026): /llms.txt used to resolve to the SPA shell
 * (content-type text/html, via the same catch-all rewrite removed for
 * P1.2) — a crawler requesting the conventional LLM information path got
 * the homepage. Generated from the same tool/article/section data the app
 * renders, so it can't drift, following the emerging llms.txt convention
 * (a short H1 + blockquote summary, then link sections).
 */
function buildLlmsTxt() {
  const lines = [
    "# Mechify",
    "",
    "> Engineering reference tools, calculators and articles for mechanical/machine-building engineers: fits and tolerances, sheet-metal bending, beams, fasteners, bearings, pneumatics and drive components.",
    "",
    `Canonical site: ${SITE_URL}/`,
    "",
    "## Source policy",
    "",
    "Mechify distinguishes standards tables, manufacturer/vendor data, physics-based calculations and practical design estimates. Standard and table data shows only recorded values — missing tabulated values are never silently interpolated. Estimate/heuristic models are explicitly labelled as indicative, with their assumptions and applicability limits shown alongside the result. See /about for the full source policy.",
    "",
  ];

  for (const section of SECTIONS) {
    lines.push(`## ${section.label.en}`, "");
    const sectionTools = TOOLS.filter((t) => t.section === section.id && t.status === "live");
    for (const tool of sectionTools) {
      lines.push(`- [${tool.title.en}](${SITE_URL}${toolHref(tool)}): ${tool.blurb.en}`);
    }
    lines.push("");
  }

  lines.push("## Engineering articles", "");
  for (const article of articles) {
    lines.push(`- [${article.title}](${SITE_URL}/topics/${article.slug}): ${article.intro}`);
  }
  lines.push("");

  lines.push(
    "## About",
    "",
    `- About Mechify: ${SITE_URL}/about`,
    `- Sitemap: ${SITE_URL}/sitemap.xml`,
    "- Contact: hello@mechify.nl",
    "",
  );

  return lines.join("\n");
}

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 8081,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [tailwindcss(), viteReact(), sitemapPlugin()],
});
