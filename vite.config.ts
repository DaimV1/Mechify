import { defineConfig, type Plugin } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";
import { SECTIONS, TOOLS, toolHref } from "./src/lib/tools";

const SITE_URL = "https://mechify.nl";

/** Static (non-tool) routes registered in src/app.tsx, kept in sync by hand — there are only a handful. */
const STATIC_ROUTES = ["/", "/tools", "/calculators", "/cad", "/tables", "/materials", "/about"];

/** Emits robots.txt and sitemap.xml from the same tool/section data the app renders, so they can't drift. */
function sitemapPlugin(): Plugin {
  return {
    name: "mechify-sitemap",
    apply: "build",
    closeBundle() {
      const sectionRoutes = SECTIONS.map((s) => s.href);
      const toolRoutes = TOOLS.map((t) => toolHref(t));
      const routes = Array.from(new Set([...STATIC_ROUTES, ...sectionRoutes, ...toolRoutes]));

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
