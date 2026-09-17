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
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}

