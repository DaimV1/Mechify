// P0.2: runs after `vite build` (which produces dist/ with per-route static
// HTML files carrying correct <head> metadata, but an empty <div id="root">
// body — see vite.config.mjs's sitemapPlugin). This script builds a
// throwaway Node-target SSR bundle of src/entry-server.tsx, uses it to
// render every public route's real component tree, and injects that markup
// into the matching dist file so search engines and AI crawlers that don't
// execute JavaScript still see the actual engineering content.
import { build } from "vite";
import viteReact from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const ssrOutDir = path.resolve(root, "dist-ssr");

async function buildSsrBundle() {
  await build({
    root,
    configFile: false,
    logLevel: "warn",
    resolve: {
      alias: { "@": path.resolve(root, "src") },
    },
    plugins: [viteReact()],
    build: {
      ssr: "scripts/entry-server.tsx",
      outDir: "dist-ssr",
      emptyOutDir: true,
      rollupOptions: {
        output: { format: "es", entryFileNames: "entry-server.mjs" },
      },
    },
  });
}

async function main() {
  await buildSsrBundle();
  const { renderPage, getAllRoutes } = await import(
    path.resolve(ssrOutDir, "entry-server.mjs")
  );

  const routes = getAllRoutes();
  let injected = 0;
  for (const route of routes) {
    const filePath =
      route === "/"
        ? path.resolve(root, "dist/index.html")
        : path.resolve(root, "dist" + route + ".html");
    if (!fs.existsSync(filePath)) {
      console.warn(`[prerender] skip ${route}: ${filePath} does not exist`);
      continue;
    }
    const html = await renderPage(route);
    const before = fs.readFileSync(filePath, "utf8");
    const after = before.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
    if (after === before) {
      throw new Error(`[prerender] ${route}: root placeholder not found in ${filePath}`);
    }
    fs.writeFileSync(filePath, after);
    injected++;
  }
  console.log(`[prerender] injected server-rendered content into ${injected}/${routes.length} routes`);

  fs.rmSync(ssrOutDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
