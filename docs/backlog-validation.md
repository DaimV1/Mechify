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
