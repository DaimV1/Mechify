import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { App } from "@/app";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import "@/styles/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const app = (
  <StrictMode>
    <LocaleProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {["mechify.nl", "www.mechify.nl"].includes(window.location.hostname) || window.location.hostname.endsWith(".vercel.app") ? <Analytics /> : null}
    </LocaleProvider>
  </StrictMode>
);

// P0.2: production routes are prerendered at build time (see
// scripts/prerender.mjs) — the root div already has matching markup, so
// hydrate it instead of discarding and re-rendering from scratch. The dev
// server never runs the prerender step, so the div is empty there and a
// normal client render is used.
//
// Prerendering always renders each route's bare path with no query string
// (see getAllRoutes() in scripts/entry-server.tsx), while most calculators
// restore their inputs from the URL's search params on first render (the
// "Copy link" / cross-tool-chaining state). Loading such a URL directly —
// a shared link, a chained-tool link, a bookmark — means the client's very
// first render reflects the query string but the prerendered markup never
// could, so hydrating against it throws a hydration-mismatch error. There
// is no query string to reconcile against on a bare-path visit, so that
// case still hydrates normally; only a search-carrying direct load falls
// back to a plain client render, matching the no-prerendered-markup path
// below.
if (container.hasChildNodes() && !window.location.search) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}

