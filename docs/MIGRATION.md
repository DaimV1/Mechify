# Migratie Mechify

De nieuwe Mechify-presentatie is leidend. Broncode uit DaimV1/Mechify (66202ef52a7fef05b516d1dae62ed6eed2189efe) en DaimV1/damianvink (762da5cc73045755ef51944a3adcddf1623aa863) is geïntegreerd. Damianvink.nl is niet gewijzigd.

## Inventarisatie per onderdeel

15 van 15 oorspronkelijke tools geïntegreerd, 8 van 8 oorspronkelijke SVG-visuals overgenomen. Twee nieuwe tools brengen het overzicht op 17; negen aanvullende rekenmodellen staan binnen hun bestaande tool, zonder dubbele calculatorpagina’s.

| Tool / behouden route | Functionaliteit en verschillen | Visual / assets | Migratie |
|---|---|---|---|
| [Passingen](/tools/fit-tolerances) | ISO-passing, diameter, band, speling/overmaat; tabellen en kopiëren | Geen losse bronvisual | Gereed |
| [Algemene toleranties](/tools/iso-2768) | Lineair, hoek en geometrie; bron-URL len/linear/form vertaald naar d/leg/gl/lc/gc | Geen losse bronvisual | Gereed |
| [Spiebaan](/tools/keyways) | Diameter, spiemaat, groefdiepte en breedtetoleranties | KeywaySection | Gereed |
| [Lagerpassingen](/tools/bearing-fits) | Vast/los behouden; roterende ring als aanvullend model | BearingFitChart | Gereed |
| [Seegerringgroef](/tools/seeger-grooves) | Ontwerpschatting behouden; originele groeftabel als aanvullend model | CirclipSection | Gereed |
| [Bevestigingsmateriaal](/tools/fasteners) | Moerfactor behouden; groef-/bouttabel en wrijving als aanvullend model | BoltSection | Gereed |
| [O-ringgroef](/tools/o-ring-grooves) | Vrije compressie/breedtefactor behouden; originele groeftabel als aanvullend model | OringGroove | Gereed |
| [Kanten](/tools/edges) | Vrije buigberekening behouden; materiaal/haaks/scherp-richtlijnen als aanvullend model | BendSection | Gereed |
| [Eenheden](/calculators/units) | Alle oude categorieën, tweerichtingsconverter als aanvullend model, vermogen toegevoegd | Geen losse bronvisual | Gereed |
| [Motorspecificatie](/calculators/motor-specification) | Stationair model behouden; versnelling, rollenmassa en uitgebreid werkpunt toegevoegd | Geen losse bronvisual | Gereed |
| [Pneumatische cilinder](/calculators/pneumatic-cylinder) | Boring/knik behouden; lastfactor, duwen/trekken, luchtverbruik; extra krachtmodel | Eigen SVG bij gegeven diameter | Gereed |
| [Knikberekening](/calculators/buckling) | Alle doorsneden, inklemmingen, materialen, last en grensslankheid behouden | BucklingModes | Gereed |
| [Doorbuiging balk](/calculators/beam-deflection) | Oplegging/uitkraging behouden; maximale doorbuiging, locatie en spanning toegevoegd | BeamDeflection | Gereed |
| [CAD-bibliotheken](/cad/resources) | Bestaande links plus originele broncategorieën | Geen bronvisual | Gereed |
| [Macro-bibliotheek](/cad/macros) | 3 bestaande codevoorbeelden en 10 originele .bas-downloads | Geen bronvisual | Gereed |

De exacte state-initialisatie en URL-sleutels per Mechify-tool staan in migration-manifest.json. De oorspronkelijke componenten en berekeningsmodules blijven beschikbaar. Kopiëren, deelbare rekeninvoer en diameteropslag zijn behouden. Zoekfilters en favorieten zijn toegevoegd. Alle 10 macrobestanden zijn byte-identiek aan de bron; SHA-256-controles staan in het manifest.

## Technische betekenis

De acht oorspronkelijke visuals zijn SVG-componenten uit schema.tsx, geen afbeeldingen of iframes. Hun maatlabels, diagramvormen en curveberekening zijn overgenomen. De schematische bronvisuals zijn ook in het origineel niet volledig op schaal; bij spiebaan en lager veranderen vooral labels. De vrije buigberekening toont expliciet een haakse referentiedoorsnede; de oorspronkelijke haaks/scherp-visual staat bij Kantpersrichtlijnen. De nieuwe hero is een eigen procedurele canvas-assembly, met eigen SVG-fallback.

## Behouden verschillen

Seeger Ø20: de bestaande Mechify-ontwerpschatting geeft Ø18,4 / 2 / 0,8 mm; de oorspronkelijke groeftabel geeft Ø19 / 1,3 / 0,5 mm. Beide modellen zijn zichtbaar benoemd.

Bout M8: Mechify K-factor 0,2 geeft circa 28,1 Nm; de brontabel geeft 27,3 Nm. Geen stilzwijgende vervanging.

Balk: de bestaande uitkomst is doorbuiging onder de last of aan de tip. Het aanvullende model geeft ook het werkelijke maximum en zijn positie. Bij een excentrische last zijn dit verschillende grootheden.

## Expliciete correcties

- Numerieke invoer wordt niet meer stilzwijgend ontdaan van mintekens of ongeldige tekens. Hele-mm-velden wijzen decimalen af in plaats van bijvoorbeeld 20,5 te veranderen in 205.
- Converter: −40 °C blijft −40 °C en wordt −40 °F; voorheen kon typen van een minteken een positieve waarde opleveren.
- Buigaftrek accepteert uitsluitend 0 < θ < 180°. De singulariteit bij 180° levert geen enorm getal meer op.
- Stationair motormodel wijst rendement >100% en niet-eindige invoer af.
- Lege moerfactor en O-ringbreedtefactor leveren geen verborgen standaardwaarde meer.
- Vermogen toegevoegd aan de directe converter; bestaande conversiefactoren blijven behouden.

## Verificatie

- 76 oorspronkelijke regressietests voor tabellen, bereikgrenzen, aandrijving, knik en cilinders.
- 9 aanvullende tests: alle drie koppelmodi, nul/ongeldige invoer, verhouding en rendement, cilinderoppervlakken, conversieparen inclusief negatieve temperatuur, buigsingulariteit, motorrendement en balkformules.
- Browservergelijking met Mechify: standaardresultaten van 12 rekenmodules plus spiebaan Ø40 vergeleken. Converter apart gecontroleerd via invoer/uitvoer.
- Alle negen aanvullende modellen: standaardresultaten en invoer vergeleken met Damianvink.nl.
- Alle acht SVG-visuals: gewijzigde diameter, ring, klasse, oriëntatie, buigtype, inklemming of lastpositie vergeleken; SVG-teksten en paden komen overeen.
- Zoekopdracht in URL, lege toestand, favoriet na herladen, negatieve temperatuur en kopieerfeedback in browser gecontroleerd.
- Desktop en mobiel (390px): homepage, toolkit, spiebaan, balk, CAD-workflow en artikel gecontroleerd op overflow.

## Grenzen

Macrodownloads en hun inhoud zijn gecontroleerd; uitvoering binnen SolidWorks/Inventor is niet getest, omdat die CAD-applicaties hier niet beschikbaar zijn. Er wordt geen directe CAD-koppeling aangeboden. Overgenomen normtabellen zijn referentiedata; dit is geen certificering of onafhankelijke volledige normaudit. De nieuwe artikelen en algemene navigatie zijn Nederlands; de oorspronkelijke NL/EN-rekenhulp blijft via de taalkeuze beschikbaar.
