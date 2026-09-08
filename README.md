# Mechify

Nieuw platform voor mechify.nl: engineeringkennis, CAD-workflows en de volledige bestaande toolkit met originele technische visuals.

## Starten

Node.js 22.18+ (Vercel: 24.x), npm. Geen accounts, backend of environment secrets nodig.

```sh
npm ci
npm run dev
# http://127.0.0.1:8080
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
# http://127.0.0.1:8081
```

## Structuur

- src/routes: homepage, toolkit, 7 artikelen, CAD-workflows en oorspronkelijke routes.
- src/lib/calculators: oorspronkelijke Mechify-rekenlogica plus koppel en transmissie.
- src/lib/toolkit: originele aanvullende rekenlogica van Damianvink.
- src/components/toolkit/schema.tsx: acht oorspronkelijke reactieve SVG-visuals.
- src/lib/tools.ts: 17 tooldefinities; migration-models.tsx koppelt alternatieve modellen.
- src/lib/articles.ts: uitbreidbare inhoud.
- src/styles/brand.css: eigen Mechify-identiteit en responsive gedrag.
- public/assembly.js: eigen hero, lazy geladen en met reduced-motion-ondersteuning.
- public/macros: tien oorspronkelijke VBA-downloads.
- docs/MIGRATION.md en migration-manifest.json: volledige inventarisatie, verschillen en tests.

De originele tool-URL’s blijven bestaan. Oude /toolkit/:slug-links worden met behoud van invoer omgezet. Relevante zoekfilters staan in de URL; favorieten blijven lokaal in de browser.

## Deployment

Bestaande GitHub-repository DaimV1/Mechify en Vercel-project mechify. Build: npm run build; output: dist; Node 24.x. vite.config.mjs is de actieve configuratie (native loader). De build genereert sitemap, robots.txt en routegebonden HTML-metadata voor sociale previews. vercel.json verzorgt de routes.

Geen Secrets of nieuwe betaalde diensten vereist. Macrobestanden zijn gecontroleerd op bronidentiteit; uitvoering in CAD is buiten deze browsertests.
