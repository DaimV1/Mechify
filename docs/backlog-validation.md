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
  40020698320 passed. Width-fit selection remains outstanding.
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
  still defaults to radial. Independent reviews and browser CI remain pending
  for this follow-up. Weekly source audit,
  manual assistive-technology/200–400% zoom and actual CAD runtime checks remain
  open; this presentation change does not close them.
