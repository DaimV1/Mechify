# Mechify

Mechify.nl: a static React site of mechanical-engineering calculators, reference
articles, CAD workflow guides, and downloadable VBA macros. No backend, no
accounts, no environment secrets.

## Stack

- React 19 + React Router 7, TypeScript, Vite 8 (`vite.config.mjs` is the
  active config; `vite.config.ts` is not used for build/dev/preview).
- Tailwind CSS 4 (`src/styles/brand.css` holds the Mechify identity/responsive
  rules).
- Node.js >=22.18 (Vercel deploys on 24.x). Deployed on Vercel; `vercel.json`
  handles routing. `vite.config.mjs` generates sitemap, robots and per-route
  metadata; `scripts/prerender.mjs` renders route HTML at build time.

## Running locally

```sh
npm ci
npm run dev       # http://127.0.0.1:8080
npm run build     # tsc --noEmit, vite build, then prerender
npm run preview   # http://127.0.0.1:8081, serves the build output
```

## Checks (run in this order; CI runs the same sequence)

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # node --test tests/*.test.ts
npm run build
npm run test:e2e    # Playwright: a11y (axe), locale switch, URL state,
                     # invalid-input handling, clipboard copy, visual diagrams
```

CI (`.github/workflows/ci.yml`) runs typecheck/lint/test/build in one job, then
the Playwright suite in a second job, on every push and PR. After a deliberate
change to a reactive SVG schema in `src/components/toolkit/schema.tsx`, update
its baseline with `npm run test:e2e:update-snapshots` (screenshots live in
`e2e/__screenshots__/`).

## Calculator logic and tests

- `src/lib/calculators/`: the site's own calculator logic (plus torque/drive
  calculations).
- `src/lib/toolkit/`: additional calculator logic carried over from the
  Damianvink toolkit.
- `tests/reference-calculators.test.ts`, `tests/reference-toolkit.test.ts`,
  `tests/reference-cylinder.test.ts`, `tests/kanten-clearance.test.ts`: unit
  tests for the calculators.
- `tests/fixtures/reference-cases/*.json`: the reference tables/worked
  examples (ISO 281 bearing life, ISO 2768, VDI 2230-lite bolted joints, O-ring
  fill, circlip catalogue sizes, pneumatic cylinder buckling, etc.) that the
  tests assert calculator output against. Loaded via
  `tests/fixtures/load.ts`.
- `docs/kanten-verification.md`: sourcing/verification notes for the bending
  (kanten) tables specifically.
- `docs/MIGRATION.md` and `docs/migration-manifest.json`: full inventory of
  every migrated tool, its original behaviour, and diffs from the source
  toolkits.

**Calculator output must stay verifiable against its original reference
table or worked example.** Any change to a calculator in `src/lib/calculators/`
or `src/lib/toolkit/` must keep passing (or be re-verified and re-recorded in)
the matching fixture in `tests/fixtures/reference-cases/`. Distinguish normative/catalogue data from estimates. Normative results need a
traceable catalogue value, standard formula or supplier table; return `null`
when that model or verified data does not cover the input. Existing heuristic
models may provide explicitly labelled preliminary estimates with documented
assumptions and applicability limits. Never present those estimates as verified
standard values or design approval.
