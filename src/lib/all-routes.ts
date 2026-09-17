import { articles } from "./articles.ts";
import { SECTIONS, TOOLS, toolHref } from "./tools.ts";

/**
 * P0.2: single source of truth for every public route, used by both the
 * sitemap/metadata build step and the SSR prerender step so they can never
 * drift apart (previously vite.config.mjs kept a hand-written route list
 * "in sync by hand").
 */
const HAND_WRITTEN_ROUTES = [
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
];

export function getAllRoutes(): string[] {
  const sectionRoutes = SECTIONS.map((s) => s.href);
  const toolRoutes = TOOLS.map((t) => toolHref(t));
  const articleRoutes = articles.map((a) => "/topics/" + a.slug);
  return Array.from(
    new Set([...HAND_WRITTEN_ROUTES, ...sectionRoutes, ...toolRoutes, ...articleRoutes]),
  );
}
