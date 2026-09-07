# Mechify

Mechify is a standalone engineering-tools platform for mechanical engineers, constructors and
designers: calculators, tolerance/fit lookups and technical reference tables, all traceable back to
the standard they implement.

## Stack

- [Vite](https://vitejs.dev) + React 19 + TypeScript
- [React Router](https://reactrouter.com) (client-side routing, clean URLs, no `.html`)
- Tailwind CSS v4 (CSS-first theme in `src/styles/index.css`)

## Structure

```
src/
  routes/               page-level route components
  components/
    layout/              header, footer, page shell, breadcrumbs
    tools/                tool cards, tool grid + search, tool page header, coming-soon panel
    calculators/          calculator UI primitives + the calculator components themselves
    ui/                   generic primitives (button, badges)
  lib/
    calculators/          pure calculation logic per tool (no React, no UI)
    tools.ts               tool catalog: metadata, URL slugs, search
    calculator-registry.tsx maps a "live" tool id to its calculator component
```

Adding a new calculator: implement its pure logic in `src/lib/calculators/<id>.ts`, build a
`<Id>Calc` component in `src/components/calculators/`, register it in
`src/lib/calculator-registry.tsx`, and flip its `status` to `"live"` in `src/lib/tools.ts`.

## URL structure

- `/` — homepage
- `/tools`, `/tools/:slug` — dimensioning, fits and standards lookups
- `/calculators`, `/calculators/:slug` — computed engineering calculations
- `/cad`, `/cad/:slug` — CAD libraries and macros
- `/tables` — index of standards and their reference tables
- `/materials` — material property reference
- `/about` — about Mechify

## Development

```bash
npm install
npm run dev        # http://localhost:8080
npm run typecheck
npm run lint
npm run build
```
