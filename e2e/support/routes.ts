import { TOOLS, toolHref } from "../../src/lib/tools.ts";

/** Every live tool route, derived from the same registry the app renders — new tools are covered automatically. */
export const TOOL_ROUTES = TOOLS.filter((t) => t.status === "live").map((t) => ({
  id: t.id,
  href: toolHref(t),
  title: t.title.nl,
}));
