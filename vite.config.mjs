import { articles } from "./src/lib/articles.ts";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";
import { SECTIONS, TOOLS, toolHref } from "./src/lib/tools.ts";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://mechify.nl";

/** Static (non-tool) routes registered in src/app.tsx, kept in sync by hand — there are only a handful. */
const STATIC_ROUTES = [
  "/",
  "/tools",
  "/calculators",
  "/cad",
  "/tables",
  "/materials",
  "/about",
  "/toolkit",
  "/topics",
  "/cad-workflows",
  ...[
    "koppel-en-toerental",
    "overbrenging-kiezen",
    "pneumatische-cilinder",
    "lineaire-geleiding",
    "frame-en-maakbaarheid",
    "toleranties-en-assemblage",
    "parametrisch-ontwerpen",
  ].map((s) => "/topics/" + s),
];

/** Emits robots.txt and sitemap.xml from the same tool/section data the app renders, so they can't drift. */
function sitemapPlugin() {
  return {
    name: "mechify-sitemap",
    apply: "build",
    closeBundle() {
      const sectionRoutes = SECTIONS.map((s) => s.href);
      const toolRoutes = TOOLS.map((t) => toolHref(t));
      const routes = Array.from(new Set([...STATIC_ROUTES, ...sectionRoutes, ...toolRoutes]));

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
    },
  };
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
