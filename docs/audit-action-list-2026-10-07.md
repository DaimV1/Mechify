# Mechify consolidated implementation plan — 7 October 2026

Baseline: `main` at `01ea197efca2ee1d7a77931d3161f035ab964c4b` (PR #40). Sources: the supplied **Mechify_Full_Platform_Audit_2026-10-07.pdf**, the 5 October action list and current code. The PDF incorporated the **29 September** backlog, not the later October releases. This register preserves both; an audit recommendation is not proof of a present defect or of verified engineering data.

All roadmap work is authorised, delivered in bounded batches by a coding agent with independent website and mechanical critics. Completion requires review of the exact revision, CI, merge and production smoke against the final deployed SHA. “Queued” is not implemented. “Evidence needed” does not block unrelated work.

## October action-list continuity

| Existing ID | Current state and retained scope | New audit mapping |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| A01 | Shipped PR #32: shaft reserve is against entered allowable shear stress, not yield. Preserve. | N09 combined shaft must retain this distinction. |
| A02 | Open/evidence needed: bearing-fit recommendations must separate axial location from circumferential loading; identify manufacturer/edition/table and supported arrangements. | N10, N19 |
| A03 | Shipped PR #33: visible Before use and copied assumptions/limitations. Preserve. | N05, N06, N14 |
| A04 | Open/evidence needed: E and yield/proof strength require separate provenance, grade/condition/product/thickness/temperature or explicit illustrative status. | N06, N09, N20 |
| A05 | Open/evidence needed: O-ring static/reciprocating/rotary ranges, compound, pressure, temperature and clearance; no unconditional leakage assurance. PR #31 preserves export warnings but does not verify ranges. | N11 |
| A06 | Open: granular verification register, primary vs secondary/formula/estimate/unresolved status, covered cells and evidence. Ten circlip combinations verified, not the whole catalogue. | N05–N06, N19–N21 |
| A07 | Shaft-specific blank/share/export fixes shipped PR #32. Preserve and extend only when defects are reproduced. | N07, all tool expansions |
| A08 | Reset/remembered diameter fixes shipped PR #34. Preserve locale and unrelated preferences. | N07 |
| A09 | Partial: shaft, motor, bearing-life and required/optional pneumatic field errors shipped PR #35–#40. Remaining calculators, enum URL validation and other fields open. Fit diameter validation rebased onto PR #41 and prepared locally: blank/malformed/nonpositive/>3150 mm shared values retained with immediate accessible NL/EN errors; missing values retain defaults. Independent review/CI/release pending. | N07 |
| A10 | Open: bilingual terminology, labels, numbers, concise purpose/model/omission statements; material labels and shaft formatting still require review. Drive locale/export contribution shipped PR #31. | N01–N04, N14, N17 |
| A11 | Open: governing result before intermediate values, essential inputs and visible limitation; validate mobile, keyboard and zoom. | N08, N14–N16 |
| A12 | Open external validation: actual CAD execution and manual screen-reader/200%/400% zoom reports. Static metadata/automated checks do not close it. | N22–N23 |

## Confirmed corrections and platform quality

| ID / priority | Scope and acceptance | State |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| N01 / P0 | Remove public personal portfolio/founder biography dependency, including About, metadata, article JSON-LD and downloadable macro headers (refresh checksums, preserve untested runtime status). Attribute platform content consistently to Mechify as an Organization. | Shipped PR #41; both critics approved and production smoke passed on `2d36407`. |
| N02 / P0 | ISO 286: EI = 0 lower deviation; ES/EI and es/ei terminology. H7/p6 conditional line fit in supported >3–18 mm; >18–50 interference; >0–3 unresolved, >50 unavailable. No table changes without primary evidence. | Copy shipped PR #41; numeric verification remains open under A06. |
| N03 / P0 | Replace VDI 2230-lite public branding with simplified bolt-load/clamp-force model. Explicitly not full VDI verification, including source badge, article and copied context. Preserve formulas and exclusions. Optionally derive Φ from supported compliance models later. | Branding shipped PR #41; compliance-factor extension queued separately. |
| N04 / P2 | Fix topic/section numbering to 01…09, 10, 11; keep consistent list numbering. | Shipped PR #41. |
| N05 / P2 | Result-level provenance: STANDARD / MANUFACTURER DATA / PHYSICS MODEL / DESIGN ESTIMATE, with catalogue nuance and existing unresolved/legacy state retained. Assess existing SourceMetaBadge before duplicating it. | Queued; existing badges already partially fulfil this. |
| N06 / P2 | Public compact “verified against” cases and granular register per tool/article/dataset: source edition/page/table, covered cells/ranges, reference calculation, review date/reviewer, unresolved gaps. Never infer verification from a date or adjacent table row. | Queued + primary evidence needed (A02/A04/A05/A06). |
| N07 / P2 | Finish A09: associated accessible errors, blank/malformed shared-state preservation, no NaN/Infinity, unavailable exports explained. Preserve reset and required-warning exports. | Partial as recorded above; remaining adoption queued. |
| N08 / P0 direction | Core tools get Basic/Advanced or equivalent disclosure, assumptions and applicability visible; parameter expansion is product work, not proof current formulas are wrong. | Queued through N09–N14. |
| N15 / P1 | Consolidate CSS tokens and typography after usage inventory: one system, no duplicate theme aliases/global paragraph colour workaround/cascade patches. Preserve near-black/mint identity, print light mode; deliberate Space Grotesk/Inter/JetBrains Mono or equivalent stack. | Queued; regression checks required. |
| N16 / P1 | Meaningful reactive SVG diagrams for beam, buckling, O-ring, bearing fits, bolted joint, bending, shaft and pneumatics; show geometry/loads/dimensions/results, state colour with text, visual regressions and responsive/keyboard/zoom review. | Queued; retain useful existing diagrams. |
| N17 / P2 | Remove redundant marketing prose, roughly 20–30% where justified; every paragraph explains purpose, relevance, calculation, validity or next check. Verify actual semantic spacing in accessible/indexed text before targeted fixes. No blind whitespace edits. | Queued; spacing is a validation lead, not a reproduced defect. |
| N18 / P2 | Exact worked-example deep links, then connected tool workflows/shared parameters with explicit units and limits. Preserve deployed drive→shaft transfer; test NL/EN query state, reload and navigation. | Queued expansion. |
| N24 / P1 retention | Production smoke must succeed on final deployment SHA; keep routes/redirects/404s, headers, raw HTML, hydration and calculator interactions. Preserve NL/EN prerender/canonical/reciprocal hreflang/translated diagrams/query continuity. | Existing gate, continue every release. |

## Engineering depth — authorised product expansion, not current defect claims

All extensions require a sourced model, units, limits, independent reference case, invalid-input/export checks, equivalent NL/EN meaning and the release gates above. Source-dependent features must stay unavailable or explicitly preliminary, never fabricated.

| ID / priority | Tool and acceptance criteria | Dependencies / status |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| N09 / P1 | Shaft: retain torsion-only Basic; Advanced combined bending/torsion/axial, hollow sections, material/yield/safety factor, keyway/concentration effects, equivalent stress. Distinguish static screening from fatigue design. | A01/A04/A06; queued. |
| N10 / P1 | Bearing life: Fr/Fa → P via bearing-specific X/Y/e and transparent factors → L10/L10h; later load spectrum and modified life with supported reliability/lubrication/contamination data. | Manufacturer/ISO 281 evidence; queued. |
| N11 / P1 | O-ring: squeeze + gland fill + stretch; pressure, compound/hardness, extrusion gap, temperature, static/reciprocating/rotary context. Application warnings, no complete seal approval. | A05; queued/evidence needed. |
| N12 / P1 | Kanten manufacturability: material/thickness/angle/bend length/flanges, holes/slots, Z-bends, bend spacing, internal bends, hemming, supplier rules. Reactive sketch + PASS/WARNING/FAIL; table availability distinct from orderability. | Current supplier tables and geometry validation; queued. |
| N13 / P1 | Pneumatics: safety factor, moving mass/acceleration, pressure drop, speed/valve flow, air demand and cycles/min. Load→cylinder→approximate air demand; assess existing stroke/efficiency/cycle/air features before adding duplicates. | Sourced assumptions and standard-air convention; queued. |
| N14 / P1 | Motor: target speed, gearbox ratio/efficiency, rotating inertia, acceleration time, duty, peak torque, vertical load/brake warnings. Operating point/margins/IEC step, not final motor selection. Progressively disclosed inputs and governing result first. | Existing speed/service-factor workflow retained; queued. |
| N19 / P2 | Fits: custom hole/shaft fields and IT grades, tolerance-zone visual within verified coverage. Bearing fits: ring rotation/load direction and manufacturer-specific recommendation context. Keyways: visual dimensions, hub/shaft fit context, torque/capacity links. | A02/A06; queued. |
| N20 / P2 | Beam: reactions/moment/stress/shear/self-weight, additional load/support cases and standard profiles. Buckling: section presets and clear applicability region; retain yield cap/slenderness. | A04/A06; queued. |
| N21 / P2 | Fasteners: coarse/fine, stainless, proof load, engagement, stripping, head/tool clearance. ISO 2768: strict verified-table scope. Circlips: per-row verification, no retention-capacity claim from geometry alone. | Primary standard/manufacturer data; queued. |
| N22 / P1 external | All 14 CAD macros executed in named application/version, input/example files, expected vs observed output and limits; only then runtimeTested=true. | External software/evidence needed. |
| N23 / P1 external | Real screen-reader + keyboard + 200/400% zoom validation on representative pages and all critical controls, including tables/diagrams/navigation; browser/AT versions and observations recorded. | Manual testing evidence needed. |

## Natural expansion (after core-tool depth)

These are authorised staged product additions, not missing-correctness defects. Each needs engineering and website review before release.

| Order / ID | Addition | Connection / acceptance direction |
| ---------- | -------------------------------------- | ------------------------------------------------------------------- |
| 1 / X01 | Tolerance stacks | Fits/ISO 2768; explicit worst-case and any statistical assumptions. |
| 2 / X02 | Combined shaft sizing | Implemented through N09, not duplicate work. |
| 3 / X03 | Linear guide load/moment helper | Guide arrangements, load cases and manufacturer limits. |
| 4 / X04 | Belt / timing-belt / chain calculators | Drive workflow, supported transmission types and catalogue limits. |
| 5 / X05 | Weld sizing | Frame/machine design, declared weld model and limits. |
| 6 / X06 | Section properties | Reusable geometry for beam/buckling/plate/frame tools. |
| 7 / X07 | Bolt-pattern load distribution | Fasteners/joint workflow, stated load distribution assumptions. |
| 8 / X08 | Press-fit force / thermal assembly | ISO 286, material/temperature/friction assumptions. |
| 9 / X09 | Ball screw / lead screw sizing | Linear motion, loads, speed and manufacturer checks. |
| 10 / X10 | GD&T / surface finish references | Traceable editions and clear applicability. |

## Evidence requests retained

- A02: selected bearing manufacturer/catalogue edition, arrangement and circumferential load tables. A General Bearing/ABMA table hosted by SKF is not automatically current SKF guidance.
- A04: grade/condition/product/thickness/temperature-specific modulus and yield/proof-strength datasheets or certificates.
- A05/N11: manufacturer gland tables for intended service, compound/hardness, pressure, temperature, clearance and extrusion/fill/stretch rules. Parker handbook is a lead; record actual edition/pages before implementing values.
- A06: primary ISO 286-2:2010 tables (especially >0–3 mm p6/missing classes) and ISO 286-1 formulas/rounding; ISO 2768-1 edition and legacy ISO 2768-2:1989 excerpts; remaining circlip manufacturer drawings. Existing ten verified combinations stay verified only within their documented coverage.
- N10: ISO 281/source details, X/Y/e tables and conditions; existing a1/static-safety/high-speed guidance remains unverified where not independently checked.
- N12: dated 247TailorSteel rules/tables and supplier constraints; do not infer orderability from tabulated dimensions.
- N03/N21: exact VDI scope/tables if claiming standard-derived values; model naming alone does not verify source data.
- A12/N22/N23: real CAD runtime reports and manual accessibility observations. Neither metadata nor automated tests substitute for them.

Use public primary references first. Ask Damian only for missing/inaccessible evidence; keep explicit unverified labels and proceed on independent work.

## Delivery and continuation

Roadmap order: (1) confirmed correctness/positioning N01–N04; (2) core engineering depth; (3) CSS/diagrams; (4) external validation closure when evidence is available; (5) connected workflows/examples; (6) natural expansion. Continue bounded A09 fixes alongside this order with the preserved fit-validation batch rebased onto PR #41.

First batch N01–N04 and this consolidated plan shipped in PR #41. Both critics approved; full CI passed. CEO verified production smoke run `37733029508` succeeded on deployed SHA `2d36407b9c6a70e563402923e20e37356b3fe32e`. No formulas/numeric tables changed and no evidence gap was closed by wording changes.

A09 fit-diameter feedback, raw invalid URL preservation and NL/EN browser regressions shipped in PR #42; production verification is recorded below.

CEO confirmed hourly continuation was re-enabled on 8 October and points at this register. It attempts work when capacity permits; it cannot detect exact usage-limit resets. Stop retrying when the authorised backlog is complete or genuinely blocked. Preserve completed release status and update this register on every release.


## 2026-10-08 continuation — PR #42 and bounded N09

- PR #42 merged as `446defc1d2c5c3c534d5cff2de9758da9c2ecf3d`; production smoke run `37734679152` passed. Fit diameter feedback is shipped; tolerance tables unchanged.
- N09 partial implementation: retain Basic solid-round torsion sizing and chosen-solid check; add an expandable Advanced hollow/concentric circular section check using entered outside/inside diameters, same torque and allowable shear stress. No invented material presets or yield/fatigue approval.
- Annular reference: Wiley / Philpot MecMovies, chapter 6, https://www.education.wiley.com/content/Philpot_Mechanics_of_Materials_4e/media/simulations/mec_movies/ch06/m06_02_s170.html ; J = π(Do⁴−Di⁴)/32, τmax=T·Do/(2J), with T converted to N·mm. Formula checked 2026-10-08. Independent cases: 50 N·m, Do20/Di10 mm → 33.953054526271 MPa; 100 N·m, Do40/Di30 → 11.641047266150059 MPa. Reserve remains entered allowable/calculated stress, not yield safety.
- Hollow geometry must satisfy finite Do>0 and 0≤Di<Do. Invalid/blank shared geometry persists and receives correction feedback; exports retain geometry, warnings and omitted checks. Local instability, fatigue, stress concentrations, stiffness and combined loading remain outside this model.
- PR #43 merged as `37fed079a39f1de36c582c7c4ac7776afecb0a54` after both critics approved and full CI passed. Production smoke run `37889060399` passed on that exact deployed SHA, confirmed by CEO on 9 October. Remaining combined bending/torsion/axial loading, material/yield/safety-factor selection, keyway/concentration effects and equivalent stress remain open; evidence gaps unchanged.

## 2026-10-08 continuation — sticky header released

- PR #44 merged as `02210904bf285ade956bb5132c135f829be5e5f9`. Main CI run `37775692386` and production smoke run `37775771116` passed; production deployment is verified.
- The header remains visible while scrolling. Related bounded polish adjusts the article contents-panel offset, adds a subtle header separator and allows the mobile menu to scroll on shorter screens, while preserving print layout.
- This navigation release does not close engineering source gaps, manual accessibility evidence gaps or CAD runtime validation. Those requirements remain open above.


## 2026-10-09 continuation — bounded fastener A09

- Prepared accessible NL/EN nut-factor K validation, with blank/malformed/nonpositive shared values preserved and immediate feedback; missing K retains 0.2 default. Overflow suppresses torque results/table values and copy export while reference dimensions remain available. URL anchors survive input synchronization.
- No torque formulas, engineering data tables or source-verification claims changed. Fastener unknown `c` property-class URL values still fall back numerically while retaining the supplied label in export; this pre-existing enum validation defect is explicitly unresolved and requires a separate narrow correction. Enum URL validation, fastener engineering expansions and primary evidence gaps remain open. Independent review, CI and release pending.

## 2026-10-09 request — homepage exploded-view overhaul

- Damian clarified that the requested interactive overhaul concerns the **exploded view on the homepage**. Queue a bounded visual/interaction improvement after the current fastener validation release.
- Priority P1, bounded direction from the critics: explicit controls and localized state; remove misleading drag/scroll coupling; expose component explanations in accessible DOM content, including mobile. Label the view as a mechanical schematic, explain the torque/support path, avoid assembled/working claims while geometry remains disconnected and remove unsupported material claims. This direction is planning only; implementation and validation remain pending.
- First stage: independent website and mechanical critics assess the existing homepage assembly, controls, labels, motion and engineering meaning; record concrete findings and acceptance criteria before implementation.
- Second stage: a coding agent implements the agreed scope, preserving responsive layout, keyboard access and reduced-motion behaviour. Acceptance also requires auto-fit at 0/50/100% explosion without clipping, fallback/lifecycle checks, and keyboard/mobile/reduced-motion coverage. Both critics review the exact revision; browser CI and production verification remain release gates.
- Suggested stages: H01 explicit controls, auto-fit and user input cancelling introductory motion; H02 localized DOM labels/state/component explanations usable at 320 px; H03 scoped refs, cleanup/disposal, fallback with disabled controls and reduced-motion support. P2 H04 can refine visual hierarchy and optimize the SVG after those usability gates.
- This is a pending assessment, not a claim that current assembly geometry or engineering relationships have been validated. Broader calculator/toolkit overhaul is not implied by this request.
