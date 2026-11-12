# P1–P3 backlog validation

Status at 29 September 2026. Code coverage and validation evidence are distinct
from production deployment and from physical/CAD application validation.

| Scope | Implemented coverage |
| --- | --- |
| Bolted joints | Invalid-input and joint-separation safeguards; regression references. |
| Routing | Legacy permanent redirects and unknown-route 404 configuration; calculator query migration. |
| Regression coverage | Independent calculator reference cases, invalid shared inputs, copied bearing/cylinder warnings, drive-to-shaft workflow and keyboard navigation. |
| Deployed checks | Deployment-SHA match, route status/redirects, raw NL/EN HTML and discovery metadata, configured security headers, browser hydration/errors and interactive bearing calculation/reload. Runs only after deployment via GitHub Actions; a successful local build does not establish deployment success. |
| Reference provenance | Ten manufacturer-verified circlip rows (DSH Ø10/20/25/30/40; DHO Ø20/25/30/40/50), per-row source and review date; remaining rows explicitly unverified. Groove geometry does not establish retention capacity. |
| CAD | Fourteen macro records carry compatibility/source/checksum/limitations and explicit runtime-test status. |
| Accessibility | Real Tab navigation and skip-link activation with automated browser/axe checks. |
| English URLs | Prerendered /en routes, translated content/model labels/diagram captions, canonical and reciprocal language links, sitemap, and preserved calculator query state. |
| Connected workflow | Drive torque transfers to shaft screening with units, preserved language and independently selected allowable stress. |

## Outstanding external validation

- Actual CAD runtime testing remains outstanding: all fourteen macro records
  retain `runtimeTested: false`. Run in the named CAD application/version,
  record example inputs/outputs and limitations before changing that status.
- Manual screen-reader and browser zoom checks remain outstanding. Automated
  keyboard and axe coverage is not a substitute for those checks.
- This environment has no matching Playwright Chromium executable. Browser
  assertions must pass in CI (which installs Chromium) before merge; a launch
  failure is not a failed application assertion or a browser-test pass.
- Verify the deployed smoke workflow against the actual final deployment SHA.
  A checked-in workflow alone is not proof the production checks passed.

## Manufacturing feature presentation — October follow-up

- PR81 keyway presentation is released at `bd638c3a8c51cbb9e8bec7bfeca58bc1e9f5b9a0`:
  independent website/mechanical reviews, full CI 40010157399 and deployed smoke
  40020698320 passed. Width-fit selection was released in PR84; see below.
- O-ring presentation follow-up: result, diagram and copied report use the same
  existing precision; simplified empty groove sections identify depth from the
  surface to the floor and width between walls. Feature dimensions lead the
  copied report, with an explicit preliminary-estimate / manufacturing-tolerances
  not-determined notice. No model, default, numeric data or source verification
  changes. Released in PR82 at `f92ac407bea0fd16cc332686b00fb005ef586f1d`,
  exact reviewed tree `991f272d30f0ec3b753cc3ffb4a350528a340f4c`; independent
  website/mechanical code and visual reviews, full CI 40068755909, production
  `dpl_FaBi8iWc354WFTtwWwxzY9YhAEPV` READY/live revision and deployed smoke
  40073845371 passed.
- O-ring production design still needs a sourced rod/piston/face gland model,
  mating diameters and clearances, tolerance stack (including cord tolerance),
  material/swelling/temperature, pressure/extrusion gap and surface finish.
  Direction URL follow-up now preserves invalid/blank raw values with an
  associated bilingual correction, suppresses dependent output until recovery,
  retains the independent table and preserves query/hash state. Missing direction
  still defaults to radial. Released in PR83 at
  `d316db7b15d07f5b401d584a4459a8061de44bfe`; both independent reviews, full CI
  40114937280 and deployed smoke 40116785628 passed. Weekly source audit,
  manual assistive-technology/200–400% zoom and actual CAD runtime checks remain
  open; this presentation change does not close them.

- Keyway width selection released in PR84 at
  `3879e9837b9c0d86e376e3e38d148043e3845375`; both independent critics accepted
  the exact tree and desktop/mobile NL/EN screenshots. Full CI 40539976613 and
  deployed smoke 40594090081 passed; production READY/live revision matched.
  Optional explicit shaft/hub
  fit pair uses existing P9/P9, N9/JS9 and H9/D10 reference deviations in results
  and copy/CAD text. No pair is preselected; raw unsupported/blank URL state
  prompts correction without selected-width output. Independent depths and
  tables remain available. Formula/data/default/source metadata are unchanged;
  selection is not an automatic application recommendation or full manufacturing
  specification. The diagram remains nominal. Source, length/radius/capacity,
  manual AT/zoom and CAD-runtime gaps remain open.

## ISO 2768 dimensional-class URL validation

- Released in PR85 at `3c525444b7f3434f0026213b5d3dd3bad9c12705`: both independent
  critics accepted the exact tree; full CI 40659461672 and deployed smoke
  40686624680 passed, with production READY/live revision matched.
  Unsupported, blank and prototype-key `lc`
  selections retain raw URL state and receive an associated bilingual correction.
  Class-dependent linear, radius/chamfer and angular outputs are withheld until
  recovery; copied reports explicitly flag omitted dimensional tolerances while
  retaining independent geometric results. Missing `lc` still defaults to `m`.
- Existing legacy `linear` normalization and unrelated query parameters remain
  intact. Numerical tables, formulas, defaults, thresholds and source metadata
  are unchanged. Geometric-class validation is a separate follow-up.
- This does not close source-audit, manual AT/200–400% zoom or CAD-runtime gaps.

## ISO 2768 geometric-class URL validation

- Released in PR86 at `1a7e0cec7cbc8e39c029291a156c6c0b92667c25`: both independent
  critics accepted the exact tree; full CI 40737143840 (964 browser tests passed,
  10 skipped) and deployed smoke 40781596825 passed; production READY/live revision
  matched. Unsupported, blank and prototype-key `gc`
  selections retain raw URL state and receive an associated bilingual correction.
  Class-dependent geometric outputs and copied values are withheld until recovery;
  copied reports explicitly flag omitted geometric tolerances while retaining
  independent dimensional results. Missing `gc` still defaults to `K`.
- Legacy `form` normalization, unrelated query parameters and all reference tables
  remain intact. Both invalid class families can be corrected independently.
  Numerical tables, formulas, defaults, thresholds and source metadata are unchanged.
  Geometric values remain total zone widths, not ± deviations; existing withdrawn
  standard caveats remain in place.
- This does not close source-audit, manual AT/200–400% zoom or CAD-runtime gaps.

## ISO 2768 numeric URL validation

- Released in PR87 at `15650bc04ed1ef0b03cf74a69efe260894898175`: both independent
  critics accepted the exact tree; full CI 40856742851 (1032 browser tests passed,
  10 skipped) and deployed smoke 40864400127 passed; production READY/live revision
  matched. Blank numeric `d`, `leg` and `gl` values remain
  explicit in shared URLs and on reload instead of restoring defaults. Missing
  values retain the existing 50/50/100 mm defaults and legacy `len` normalization.
- Associated bilingual field feedback covers blank, malformed, nonfinite and
  nonpositive inputs, with the existing 0.5 mm nominal-size minimum retained.
  Only dependent values are withheld; copied reports flag omitted families.
  Independent dimensional/geometric results and length-independent runout remain
  available, including runout in copied reports. Reference tables are unchanged.
- Parsing conventions, formulas, table coverage, thresholds, defaults and source
  metadata are unchanged. Manual AT/200–400% zoom, CAD runtime and source-audit
  gaps remain open.

## Keyway diameter URL validation

- Released in PR89 at `3a609f39452e95411b85f061865868ed72b94713`: both independent
  critics accepted the exact tree; full CI 41841613894 (1068 browser tests passed,
  10 skipped) and deployed smoke 41855920382 passed; production READY/live revision
  matched. Explicit blank and invalid diameter values remain
  in the URL on reload, instead of restoring the remembered/default diameter.
  Missing diameter retains the existing remembered value or 20 mm fallback.
- Associated bilingual feedback requests a whole-mm diameter or explains existing
  table coverage. Dependent dimensions, copy/CAD output and numeric diagram values
  remain unavailable until recovery; the independent reference table stays visible.
- Whole-mm parsing, formulas, data, defaults, thresholds and source metadata are
  unchanged. Manual AT/200–400% zoom, CAD runtime and source-audit gaps remain open.

## Bearing-fit shaft diameter URL validation

- Released in PR90 at `5884599eea1801286222d83ba163dc5c61b63986`: both independent
  critics accepted the exact tree; full CI 41991018368 (1104 browser tests passed,
  10 skipped) and deployed smoke 42000980216 passed; production READY/live revision
  matched. Explicit blank and raw invalid shaft diameter `d`
  persist through URL updates and reload. Missing `d` retains the remembered value
  or existing 20 mm fallback. Housing diameter behavior is unchanged.
- Associated bilingual shaft-field correction covers blank/malformed values and
  existing table coverage. Existing result/copy/CAD gating and independent housing
  reference content remain; unrelated query parameters and hash are retained.
- Whole-mm parsing, formulas, tables, defaults, thresholds and source metadata are
  unchanged. Manual AT/200–400% zoom, CAD runtime and source-audit gaps remain open.

## Circlip diameter URL validation

- Released in PR95 at `722791b7ab6c79b6940d0c6bcf041508848412c3` (tree
  `9bfd1f0a470d8aebcbda03b173359d21e5702b49`): both independent critics accepted
  the exact tree; full CI 43041236545 (1188 browser tests passed, 10 skipped)
  and live exact-revision smoke 43077099060 passed. Production deployment
  `dpl_G1gpCB3DUhAxqKcM5wPwAm9g6emZ` was READY and the live revision matched.
  Explicit blank and raw invalid diameter values persist through URL updates
  and reload. Missing diameter retains the remembered
  value or existing 20 mm fallback; ring-type selection and query/hash are retained.
- Associated bilingual feedback covers blank/malformed values and existing table
  coverage. Dependent result/copy and numeric diagram annotations remain unavailable
  until recovery; the independent catalogue table remains visible for valid types.
- Whole-mm parsing, formulas, tables, defaults, thresholds and source metadata are
  unchanged. Manual AT/200–400% zoom, CAD runtime and source-audit gaps remain open.

## O-ring cord selector URL validation

- Pending independent review/CI: raw blank, malformed, nonfinite, nonpositive
  and nonlisted positive cord values persist in the URL and on reload, with an
  explicit placeholder and associated bilingual correction. Dependent results,
  copy and numeric diagram annotations are withheld until a supported selection;
  the independent standard-cord table remains available.
- Existing numeric parsing is unchanged: supported aliases such as `3.550`,
  `3,55`, `1.80` and `5.30` select the canonical numeric option while retaining
  their raw URL values. Missing cord retains the existing 3.55 mm default.
- Formulas, data, defaults, tables, thresholds and source metadata are unchanged.
  Manual AT/200–400% zoom, CAD runtime and source-audit gaps remain open.
