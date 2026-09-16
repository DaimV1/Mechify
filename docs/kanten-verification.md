# Bending guidelines verification — 2026-09-16

Primary source: https://247tailorsteel.com/nl/aanleverspecificaties/richtlijnen-voor-kanten

Compared radius, flange/die and Z tables to the source: existing values match, including non-monotone radii and differing Z-tool openings. Do not interpolate missing cells. Table presence does not prove availability for every alloy/temper.

The previous public edges calculator mixed unsourced material-radius factors, 4t flange length, 8t die opening and V/6 radius estimates. Its manufacturing guidance now uses the same supplier table as the legacy kanten route. Custom-angle bend allowance remains a separate calculation.

The supplier drawing measures the hole edge from the outside flange face; it is not the flat-pattern bend centreline or the bend tangent. For round holes the centre distance is the edge distance plus half the diameter. The text uses >5 mm while the illustration uses ≥5 mm: the implementation explicitly uses the conservative ≥5 boundary. Small holes inside the zone require review, including the 10% total-interruption limit; no universal minimum distance is inferred.

The flange dimension in the section is corrected to the theoretical outside corner, rather than the tangent. The clearance sketch is explicitly a 90-degree section. Sharp bends use the supplier's sharp tables throughout the part. Supplier illustrations should be consulted for other geometry.

Cross-checks:
- https://www.wilatooling.com/en-us/applications/bending-short-flanges/ — tooling and shoulder geometry matter; no universal 4t minimum.
- https://www.bystronic.com/usa/en-us/news/190502-rules-press-brake-tool-selection — approximate flange guidance is tied to V opening (0.77V), illustrating why 4t and V=8t are not a consistent tooling selection.

Tests cover known supplier rows, edge vs centre distance, exact 5 mm and 10% thresholds, missing data, and invalid numbers.
