/** P1.8 (audit, 17 sept 2026): every article now carries its own provenance — author, technical basis and a review date — instead of requiring a reader to inspect source code to know whether a claim came from physics, a standard, a manufacturer catalogue or a design rule of thumb. */
export const ARTICLE_AUTHOR = "Damian Vink";
/** ISO 8601 form of every article's current `reviewedDate` ("17 sept 2026"), for schema.org dateModified. */
export const ARTICLE_REVIEWED_DATE_ISO = "2026-09-17";
/** I18N-001: display form of the shared review date, since every article was reviewed on the same day. */
export const ARTICLE_REVIEWED_DATE: Record<"nl" | "en", string> = {
  nl: "17 sept 2026",
  en: "17 Sept 2026",
};

/** I18N-001: stable Dutch category keys (used for filtering in topics.tsx) mapped to their bilingual display label. */
export const CATEGORY_LABELS: Record<string, Record<"nl" | "en", string>> = {
  Aandrijftechniek: { nl: "Aandrijftechniek", en: "Drive technology" },
  Pneumatiek: { nl: "Pneumatiek", en: "Pneumatics" },
  "Lineaire beweging": { nl: "Lineaire beweging", en: "Linear motion" },
  Machineframes: { nl: "Machineframes", en: "Machine frames" },
  "Toleranties & assemblage": { nl: "Toleranties & assemblage", en: "Tolerances & assembly" },
  "CAD-workflows": { nl: "CAD-workflows", en: "CAD workflows" },
};

export const articles = [
  {
    slug: "koppel-en-toerental",
    basis: {
      nl: "P = T·ω (P[kW] = T[N·m]·n[omw/min] / 9549,2966), fysica. Stationair mechanisch werkpunt — geen elektrisch/thermisch motormodel.",
      en: "P = T·ω (P[kW] = T[N·m]·n[rpm] / 9549.2966), physics. Steady-state mechanical operating point — no electrical/thermal motor model.",
    },
    category: "Aandrijftechniek",
    title: {
      nl: "Meer koppel begint bij het juiste werkpunt.",
      en: "More torque starts with the right operating point.",
    },
    intro: {
      nl: "Een motor kies je niet alleen op kilowatt. Toerental, belasting en transmissie bepalen samen wat er aan de machine beschikbaar is.",
      en: "You don't choose a motor on kilowatts alone. Speed, load and transmission together determine what's actually available at the machine.",
    },
    time: "6 min",
    tool: "koppel",
    question: {
      nl: "Een transportband vraagt 40 N·m bij 120 omw/min. Is een motor van 0,75 kW voldoende?",
      en: "A conveyor belt needs 40 N·m at 120 rpm. Is a 0.75 kW motor enough?",
    },
    sections: [
      [
        { nl: "Begin bij de uitgaande as", en: "Start at the output shaft" },
        {
          nl: "Leg eerst het belastingskoppel en het benodigde toerental aan de aangedreven as vast. In een stationair roterend systeem geldt P = T · ω, met ω = 2πn/60. Gebruik je P in kW, T in N·m en n in omw/min, dan volgt P = T · n / 9549,2966. Vermogen beschrijft het werk per tijdseenheid; koppel alleen vertelt niet hoe snel de machine dat werk uitvoert.",
          en: "First establish the load torque and the required speed at the driven shaft. In a steady-state rotating system, P = T · ω, with ω = 2πn/60. Using P in kW, T in N·m and n in rpm gives P = T · n / 9549.2966. Power describes work per unit time; torque alone doesn't tell you how fast the machine performs that work.",
        },
      ],
      [
        { nl: "Van belasting naar motor", en: "From load to motor" },
        {
          nl: "Bij 40 N·m en 120 omw/min is het mechanische uitgangsvermogen circa 0,503 kW. Met een transmissierendement van 85% vraagt dit ongeveer 0,591 kW aan de motoras. Een motor van 0,75 kW lijkt stationair voldoende, maar die vergelijking beoordeelt nog niet het starten of versnellen. Controleer de koppel-toerentalkromme en de toegestane thermische belasting van de gekozen motor.",
          en: "At 40 N·m and 120 rpm, the mechanical output power is about 0.503 kW. With a transmission efficiency of 85%, this requires roughly 0.591 kW at the motor shaft. A 0.75 kW motor looks sufficient in steady state, but that comparison doesn't yet assess starting or acceleration. Check the torque-speed curve and the allowed thermal load of the chosen motor.",
        },
      ],
      [
        { nl: "Versnellen is een aparte belasting", en: "Acceleration is a separate load" },
        {
          nl: "Tijdens versnellen komt een inertiekoppel bij de procesbelasting. Voor een equivalente traagheid J aan de beschouwde as geldt T = J · α. Reken alle traagheden consequent om naar dezelfde as en gebruik het gewenste snelheidsprofiel. Wrijving, stilstandkoppel en cyclustijd kunnen het piekkoppel bepalen, ook als het gemiddelde vermogen laag blijft.",
          en: "During acceleration, an inertial torque adds to the process load. For an equivalent inertia J at the shaft under consideration, T = J · α. Convert every inertia consistently to the same shaft and use the desired speed profile. Friction, breakaway torque and cycle time can determine the peak torque, even when the average power stays low.",
        },
      ],
      [
        { nl: "Aannames en ontwerpcontrole", en: "Assumptions and design check" },
        {
          nl: "De calculator beschrijft een stationair mechanisch werkpunt en gebruikt positieve grootheden. Elektrisch opgenomen vermogen, motor- en regelaarverliezen, regeneratie, dynamiek en veiligheidsfuncties vallen buiten dit model. Controleer belastingsgevallen en fabrikantgegevens vóór componentselectie.",
          en: "The calculator describes a steady-state mechanical operating point and uses positive quantities. Electrical input power, motor and drive losses, regeneration, dynamics and safety functions fall outside this model. Check load cases and manufacturer data before selecting components.",
        },
      ],
    ],
  },
  {
    slug: "overbrenging-kiezen",
    basis: {
      nl: "i = n₁/n₂, T₂ = T₁·i·η, fysica. Vaste verhouding en constant rendement — geen terugaandrijving, zelfremming of belastingsafhankelijk rendement.",
      en: "i = n₁/n₂, T₂ = T₁·i·η, physics. Fixed ratio and constant efficiency — no back-driving, self-locking or load-dependent efficiency.",
    },
    category: "Aandrijftechniek",
    title: {
      nl: "Een overbrenging kiezen zonder verrassingen.",
      en: "Choosing a transmission ratio without surprises.",
    },
    intro: {
      nl: "Minder toerental, meer koppel. Begrijp wat een verhouding doet en waar de verliezen terechtkomen.",
      en: "Less speed, more torque. Understand what a ratio does and where the losses go.",
    },
    time: "5 min",
    tool: "overbrenging",
    question: {
      nl: "Wat levert een motor met 8 N·m bij 1.500 omw/min na een reductie van 10:1?",
      en: "What does a motor with 8 N·m at 1,500 rpm deliver after a 10:1 reduction?",
    },
    sections: [
      [
        { nl: "Definieer de verhouding vooraf", en: "Define the ratio up front" },
        {
          nl: "Mechify gebruikt i = n₁ / n₂. Een waarde groter dan 1 is een reductie; een waarde tussen 0 en 1 verhoogt het toerental. Het uitgangstoerental is n₂ = n₁ / i. Deze expliciete definitie voorkomt verwarring wanneer catalogi de verhouding in een andere volgorde weergeven.",
          en: "Mechify uses i = n₁ / n₂. A value greater than 1 is a reduction; a value between 0 and 1 increases the speed. The output speed is n₂ = n₁ / i. This explicit definition avoids confusion when catalogues express the ratio in a different order.",
        },
      ],
      [
        { nl: "Koppel met rendement", en: "Torque with efficiency" },
        {
          nl: "Het ideale uitgaande koppel is T₁ · i. Voor een aandrijvende motor met rendement η gebruiken we T₂ = T₁ · i · η. Met 1.500 omw/min, 8 N·m, i = 10 en η = 0,92 krijg je 150 omw/min en 73,6 N·m. De invoer levert circa 1,257 kW; de uitvoer circa 1,156 kW. Het verschil gaat in dit eenvoudige model verloren.",
          en: "The ideal output torque is T₁ · i. For a driving motor with efficiency η, we use T₂ = T₁ · i · η. With 1,500 rpm, 8 N·m, i = 10 and η = 0.92, you get 150 rpm and 73.6 N·m. The input delivers about 1.257 kW; the output about 1.156 kW. The difference is lost in this simple model.",
        },
      ],
      [
        { nl: "Controleer méér dan de verhouding", en: "Check more than the ratio" },
        {
          nl: "Bekijk het nominale en piekkoppel, speling, torsiestijfheid en toegestane radiale en axiale asbelasting. Een poelie ver buiten het lager kan een toelaatbare asbelasting overschrijden terwijl het koppel prima past. Beoordeel ook smering, montagepositie en warmteafvoer voor de werkelijke cyclus.",
          en: "Look at the nominal and peak torque, backlash, torsional stiffness and the allowed radial and axial shaft load. A pulley mounted far outside the bearing can exceed the allowable shaft load even while the torque fits fine. Also assess lubrication, mounting position and heat dissipation for the actual cycle.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Dit model veronderstelt een vaste verhouding, een constante efficiëntie en energiestroom van ingang naar uitgang. Werkelijke efficiëntie varieert met belasting en toerental. Terugaandrijven, zelfremming, startwrijving en dynamische pieken worden niet berekend.",
          en: "This model assumes a fixed ratio, constant efficiency and energy flow from input to output. Real efficiency varies with load and speed. Back-driving, self-locking, starting friction and dynamic peaks are not calculated.",
        },
      ],
    ],
  },
  {
    slug: "pneumatische-cilinder",
    basis: {
      nl: "F = p·A (ISO 15552/6432 oppervlakteformule), fysica, met een aangenomen 90% krachtfactor voor verliezen — een schatting, geen fabrikantwaarde. Statische axiale kracht — geen snelheid, luchtverbruik, demping of knik.",
      en: "F = p·A (ISO 15552/6432 area formula), physics, with an assumed 90% force factor for losses — an estimate, not a manufacturer value. Static axial force — no speed, air consumption, cushioning or buckling.",
    },
    category: "Pneumatiek",
    title: {
      nl: "Cilinderkracht: de stang maakt het verschil.",
      en: "Cylinder force: the rod makes the difference.",
    },
    intro: {
      nl: "Dezelfde druk geeft bij uitschuiven en inschuiven een andere kracht. Reken met het effectieve oppervlak.",
      en: "The same pressure gives a different force on extend versus retract. Calculate with the effective area.",
    },
    time: "5 min",
    tool: "cilinder",
    question: {
      nl: "Hoeveel duw- en trekkracht levert een cilinder van Ø50 mm met een stang van Ø20 mm bij 6 bar?",
      en: "How much push and pull force does a Ø50 mm cylinder with a Ø20 mm rod deliver at 6 bar?",
    },
    sections: [
      [
        { nl: "Werk met drukverschil", en: "Work with the pressure difference" },
        {
          nl: "De basiskracht is F = p · A. Bij uitschuiven werkt de druk op het volledige zuigeroppervlak. Bij inschuiven neemt de stang een deel van dat oppervlak in. Reken bar om naar N/mm²: 1 bar = 0,1 N/mm². De calculator gebruikt overdruk en veronderstelt atmosferische druk aan de ontluchtende zijde.",
          en: "The base force is F = p · A. On extend, the pressure acts on the full piston area. On retract, the rod takes up part of that area. Convert bar to N/mm²: 1 bar = 0.1 N/mm². The calculator uses gauge pressure and assumes atmospheric pressure on the vented side.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld Ø50 / Ø20", en: "Worked example Ø50 / Ø20" },
        {
          nl: "Het volledige oppervlak is π · 50² / 4 = 1.963,50 mm². De ringoppervlakte is π · (50² − 20²) / 4 = 1.649,34 mm². Bij 6 bar zijn de theoretische krachten 1.178,10 N uitgaand en 989,60 N ingaand. Met een aangenomen krachtfactor van 90% worden dit 1.060,29 N en 890,64 N.",
          en: "The full area is π · 50² / 4 = 1,963.50 mm². The annular area is π · (50² − 20²) / 4 = 1,649.34 mm². At 6 bar, the theoretical forces are 1,178.10 N extending and 989.60 N retracting. With an assumed force factor of 90%, these become 1,060.29 N and 890.64 N.",
        },
      ],
      [
        { nl: "Kracht is nog geen cilinderselectie", en: "Force isn't cylinder selection yet" },
        {
          nl: "Gebruik de druk bij de cilinder tijdens beweging, niet alleen de ingestelde voedingsdruk. Leidingen, ventielen en tegendruk beïnvloeden het werkpunt. De krachtfactor is een vereenvoudigde aftrek voor verliezen, geen universele fabrikantwaarde. Een lange stang vraagt daarnaast een knikcontrole; zijdelingse belasting vraagt vaak een afzonderlijke geleiding.",
          en: "Use the pressure at the cylinder during motion, not just the set supply pressure. Piping, valves and back-pressure affect the operating point. The force factor is a simplified deduction for losses, not a universal manufacturer value. A long rod also needs a buckling check; side loads often call for a separate guide.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Het model berekent statische axiale kracht. Snelheid, luchtverbruik, demping, knik, versnelling en stopgedrag zijn niet inbegrepen. Voor een verticale last moet ook het gewicht en het vereiste gedrag bij drukverlies afzonderlijk worden beoordeeld.",
          en: "The model calculates static axial force. Speed, air consumption, cushioning, buckling, acceleration and stopping behaviour are not included. For a vertical load, the weight and the required behaviour on pressure loss must also be assessed separately.",
        },
      ],
    ],
    source: [
      "Festo — Cylinder sizing by piston force",
      "https://www.festo.com/net/supportportal/files/10203/actuators",
    ],
  },
  {
    slug: "lineaire-geleiding",
    basis: {
      nl: "Statisch krachten-/momentenevenwicht (F = m·g, M = F·a), fysica. Vereenvoudigd vlak model — geen fabrikant-draaggetal-, stijfheids- of levensduurberekening.",
      en: "Static force/moment equilibrium (F = m·g, M = F·a), physics. Simplified planar model — no manufacturer load-rating, stiffness or life calculation.",
    },
    category: "Lineaire beweging",
    title: {
      nl: "Een geleiding draagt meer dan alleen gewicht.",
      en: "A linear guide carries more than just weight.",
    },
    intro: {
      nl: "De plaats van de last is net zo belangrijk als de grootte. Maak momenten zichtbaar voordat je een geleiding selecteert.",
      en: "The location of the load matters as much as its size. Make moments visible before selecting a guide.",
    },
    time: "6 min",
    tool: "converter",
    question: {
      nl: "Een last van 20 kg staat 150 mm buiten de geleiding. Wat betekent dit voor de lagerblokken?",
      en: "A 20 kg load sits 150 mm outside the guide. What does this mean for the bearing blocks?",
    },
    sections: [
      [
        { nl: "Teken eerst het vrije lichaam", en: "Draw the free body first" },
        {
          nl: "Teken de krachten, hun aangrijpingspunten en de reactierichtingen. Kies een duidelijk assenstelsel. Een last buiten het steunvlak veroorzaakt een moment; een lagerblok wordt daardoor niet alleen met een verticale kracht belast. Denk ook aan acceleratie, kabelrupsweerstand en externe proceskrachten.",
          en: "Draw the forces, their points of application and the reaction directions. Choose a clear coordinate system. A load outside the support plane creates a moment; a bearing block is then loaded with more than just a vertical force. Also consider acceleration, cable-carrier resistance and external process forces.",
        },
      ],
      [
        { nl: "Maak het moment concreet", en: "Make the moment concrete" },
        {
          nl: "Met g = 9,81 m/s² geeft 20 kg een gewicht van 196,2 N. Op 0,15 m afstand ontstaat een moment van 29,43 N·m. In een vereenvoudigd vlak model met twee steunpunten op 0,20 m afstand leidt dit moment tot een extra krachtpaar van 147,15 N. Tel deze bijdrage met het juiste teken op bij de directe lastverdeling.",
          en: "With g = 9.81 m/s², 20 kg produces a weight of 196.2 N. At 0.15 m distance, this creates a moment of 29.43 N·m. In a simplified planar model with two support points 0.20 m apart, this moment produces an additional force couple of 147.15 N. Add this contribution, with the correct sign, to the direct load distribution.",
        },
      ],
      [
        { nl: "Stijfheid en montage horen bij de keuze", en: "Stiffness and mounting are part of the choice" },
        {
          nl: "De echte lastverdeling hangt af van blokafstand, railafstand, voorspanning en stijfheid van het frame. Een stijve geleiding op een slappe montageplaat maakt het systeem niet stijf. Voorzie bereikbare montagevlakken en bepaal hoe je de paralleliteit instelt zonder het systeem op te spannen.",
          en: "The real load distribution depends on block spacing, rail spacing, preload and frame stiffness. A stiff guide on a flexible mounting plate does not make the system stiff. Provide accessible mounting surfaces and decide how you'll set parallelism without pre-stressing the system.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Het voorbeeld is een statisch vlak evenwichtsmodel. Het is geen levensduur- of draaggetalberekening. Gebruik voor de uiteindelijke selectie het belastingsmodel, de equivalente belasting en montagevoorschriften van de gekozen fabrikant.",
          en: "The example is a static planar equilibrium model. It is not a life or load-rating calculation. For the final selection, use the load model, equivalent load and mounting instructions of the chosen manufacturer.",
        },
      ],
    ],
  },
  {
    slug: "frame-en-maakbaarheid",
    basis: {
      nl: "Euler-Bernoulli doorbuiging δ = F·L³/(3·E·I) voor een ingeklemde balk met puntlast, fysica. Geldig voor kleine elastische vervorming onder ideale ondersteuning — geen verbindings-, lasvervormings- of trillingsanalyse.",
      en: "Euler-Bernoulli deflection δ = F·L³/(3·E·I) for a cantilevered beam with a point load, physics. Valid for small elastic deformation under ideal support — no joint, welding-distortion or vibration analysis.",
    },
    category: "Machineframes",
    title: {
      nl: "Een goed frame begint bij de krachtweg.",
      en: "A good frame starts with the load path.",
    },
    intro: {
      nl: "Een frame moet belastingen voorspelbaar afvoeren én praktisch te bouwen zijn.",
      en: "A frame must carry loads predictably and still be practical to build.",
    },
    time: "5 min",
    tool: "converter",
    question: {
      nl: "Een robotmodule trilt na een versnelling. Moet het frame simpelweg zwaarder worden?",
      en: "A robot module vibrates after acceleration. Should the frame simply be made heavier?",
    },
    sections: [
      [
        { nl: "Volg de kracht naar de vloer", en: "Follow the force to the floor" },
        {
          nl: "Teken de route van de proceskracht via bevestiging, liggers en verbindingen naar de voetpunten. Lange uitkragingen en slappe boutverbindingen kunnen de vervorming domineren. Meer massa toevoegen lost een ongunstige krachtweg niet automatisch op. Vergroot waar nodig de effectieve doorsnedehoogte, verkort vrije lengtes en plaats verbindingen dicht bij de belasting.",
          en: "Trace the route of the process force through mounting, beams and joints down to the feet. Long cantilevers and flexible bolted joints can dominate the deformation. Adding more mass doesn't automatically fix an unfavourable load path. Where needed, increase the effective section height, shorten free lengths and place joints close to the load.",
        },
      ],
      [
        { nl: "Een bruikbaar eerste model", en: "A useful first model" },
        {
          nl: "Voor een eenvoudige ingeklemde balk met puntlast aan het vrije eind geldt δ = F · L³ / (3 · E · I). De derde macht van L laat zien waarom een kortere uitkraging sterk helpt. Halveren van de vrije lengte geeft in dit ideale model een achtste van de doorbuiging, bij gelijk materiaal, doorsnede en kracht.",
          en: "For a simple cantilevered beam with a point load at the free end, δ = F · L³ / (3 · E · I). The third power of L shows why a shorter cantilever helps so much. Halving the free length gives, in this ideal model, one-eighth of the deflection, for the same material, section and force.",
        },
      ],
      [
        { nl: "Ontwerp ook de fabricagestappen", en: "Design the fabrication steps too" },
        {
          nl: "Bij een gelast frame kunnen vervormingen tijdens lassen ontstaan. Bepaal vooraf welke vlakken na het lassen worden nabewerkt, waar opspanning mogelijk is en hoe de constructie bereikbaar blijft. Breng kritieke montagevlakken en functionele referenties samen in de tekening.",
          en: "A welded frame can distort during welding. Decide in advance which faces will be machined after welding, where fixturing is possible and how the structure stays accessible. Bring critical mounting surfaces and functional references together on the drawing.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Het balkmodel geldt voor kleine elastische vervorming onder de aangegeven ideale ondersteuning. Verbindingen, lokale vervorming en dynamische resonantie zijn niet inbegrepen. Bij trillingsproblemen moeten excitatie, eigenfrequenties en demping samen worden onderzocht.",
          en: "The beam model holds for small elastic deformation under the stated ideal support. Joints, local deformation and dynamic resonance are not included. For vibration problems, excitation, natural frequencies and damping must be investigated together.",
        },
      ],
    ],
  },
  {
    slug: "toleranties-en-assemblage",
    basis: {
      nl: "Lineaire worst-case tolerantiestapeling van maatgrenzen, rekenregel. Geen vorm-, ligging-, temperatuur- of vervormingseffecten — claimt geen normconformiteit voor een specifieke passing.",
      en: "Linear worst-case tolerance stack-up of dimension limits, a calculation rule. No form, position, temperature or deformation effects — makes no claim of standard conformance for a specific fit.",
    },
    category: "Toleranties & assemblage",
    title: { nl: "Toleranties die de montage helpen.", en: "Tolerances that help assembly." },
    intro: {
      nl: "Specificeer nauwkeurigheid waar de functie die nodig heeft. Geef de rest ruimte.",
      en: "Specify precision where the function needs it. Give the rest room.",
    },
    time: "6 min",
    tool: "converter",
    question: {
      nl: "Drie onderdelen moeten samen een vrije ruimte behouden. Hoe voorkom je dat de tolerantiestapel die ruimte opeet?",
      en: "Three parts together must preserve a clearance gap. How do you stop the tolerance stack from eating that gap?",
    },
    sections: [
      [
        { nl: "Begin bij de functionele maat", en: "Start at the functional dimension" },
        {
          nl: "Bepaal eerst wat moet passen, bewegen of afdichten. Kies referentievlakken die aansluiten bij de werking en de meetmethode. Vermijd een keten van maten wanneer één gemeenschappelijke referentie de functie direct kan vastleggen. Een nominaal kloppende CAD-assembly bewijst niet dat alle geproduceerde onderdelen passen.",
          en: "First determine what needs to fit, move or seal. Choose reference surfaces that match the function and the measurement method. Avoid a chain of dimensions when one shared reference can capture the function directly. A CAD assembly that closes up nominally doesn't prove that every produced part will fit.",
        },
      ],
      [
        { nl: "Een eenvoudige worst-case stapel", en: "A simple worst-case stack" },
        {
          nl: "Stel dat een opening 30 ±0,10 mm is en een onderdeel 29,5 ±0,15 mm. De nominale speling is 0,50 mm. De kleinste speling is 29,90 − 29,65 = 0,25 mm; de grootste 30,10 − 29,35 = 0,75 mm. Voeg je vulringen, coatings of extra onderdelen toe, neem hun bijdragen expliciet op in de keten.",
          en: "Suppose an opening is 30 ±0.10 mm and a part is 29.5 ±0.15 mm. The nominal clearance is 0.50 mm. The smallest clearance is 29.90 − 29.65 = 0.25 mm; the largest is 30.10 − 29.35 = 0.75 mm. If you add shims, coatings or extra parts, include their contributions explicitly in the chain.",
        },
      ],
      [
        { nl: "Maak assemblage en onderhoud bereikbaar", en: "Make assembly and maintenance accessible" },
        {
          nl: "Voorzie invoerafschuiningen, ruimte voor gereedschap en een haalbare montagevolgorde. Bepaal welke onderdelen positioneren en welke alleen klemmen. Controleer of een slijtagedeel vervangen kan worden zonder de complete machine uit te lijnen. Een exploded view helpt om deze volgorde bespreekbaar te maken.",
          en: "Provide lead-in chamfers, room for tools and a workable assembly sequence. Determine which parts locate the assembly and which only clamp it. Check whether a wear part can be replaced without realigning the entire machine. An exploded view helps make this sequence easy to discuss.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Het voorbeeld gebruikt een lineaire worst-case som van maatgrenzen. Vorm, ligging, temperatuur en vervorming zijn niet opgenomen. Kies geen passing uitsluitend op een algemene tabel: belasting, materiaal, montage en fabrikantgegevens bepalen wat passend is. Er wordt hier geen normconformiteit geclaimd.",
          en: "The example uses a linear worst-case sum of dimension limits. Form, position, temperature and deformation are not included. Don't choose a fit from a general table alone: load, material, assembly and manufacturer data determine what's appropriate. No standard conformance is claimed here.",
        },
      ],
    ],
  },
  {
    slug: "parametrisch-ontwerpen",
    basis: {
      nl: "Praktische CAD-modelleerstrategie (SolidWorks-configuraties, Inventor-parameters), ontwerprichtlijn. Geen directe softwarekoppeling of automatische tekening-/stuklijstvalidatie.",
      en: "Practical CAD modelling strategy (SolidWorks configurations, Inventor parameters), a design guideline. No direct software integration or automatic drawing/BOM validation.",
    },
    category: "CAD-workflows",
    title: {
      nl: "Modelleer de bedoeling, niet alleen de vorm.",
      en: "Model the intent, not just the shape.",
    },
    intro: {
      nl: "Een betrouwbaar parametrisch model verandert voorspelbaar wanneer een ontwerpmaat wijzigt.",
      en: "A reliable parametric model changes predictably when a design dimension changes.",
    },
    time: "5 min",
    tool: "converter",
    question: {
      nl: "Een montageplaat bestaat in drie breedtes. Hoe voorkom je drie afzonderlijke, uit elkaar groeiende modellen?",
      en: "A mounting plate exists in three widths. How do you avoid three separate models that drift apart?",
    },
    sections: [
      [
        { nl: "Leg de ontwerpregels vast", en: "Fix the design rules" },
        {
          nl: "Maak onderscheid tussen vrije keuzes en afgeleide maten. Een plaatbreedte is bijvoorbeeld vrij; de randafstand van een gatenpatroon kan een vaste regel zijn. Geef parameters betekenisvolle namen en beperk afhankelijkheden van toevallige randen of vlakken die bij een wijziging verdwijnen.",
          en: "Distinguish between free choices and derived dimensions. A plate width, for instance, is free; the edge distance of a hole pattern can be a fixed rule. Give parameters meaningful names and limit dependencies on incidental edges or faces that can disappear on a change.",
        },
      ],
      [
        { nl: "Test de uitersten", en: "Test the extremes" },
        {
          nl: "Neem een plaat met breedtes 120, 180 en 240 mm en een vaste gat-randafstand van 20 mm. Laat de afstand tussen de gaten volgen uit breedte minus 40 mm. Test de kleinste en grootste variant op randafstand, overlap en ruimte voor boutkoppen. Een geslaagde herberekening controleert alleen het model, niet de maakbaarheid.",
          en: "Take a plate with widths 120, 180 and 240 mm and a fixed hole edge distance of 20 mm. Let the distance between the holes follow from width minus 40 mm. Test the smallest and largest variant for edge distance, overlap and clearance for bolt heads. A successful rebuild only checks the model, not manufacturability.",
        },
      ],
      [
        { nl: "Van principe naar CAD", en: "From principle to CAD" },
        {
          nl: "In SolidWorks kunnen configuraties varianten binnen een document organiseren. Leg vast welke maten en eigenschappen per configuratie variëren. In Inventor kun je benoemde parameters gebruiken om maatrelaties expliciet te maken. Documenteer in beide gevallen artikelnummer, materiaal en revisie zodat een modelvariant niet wordt verward met een vrijgegeven product.",
          en: "In SolidWorks, configurations can organize variants within a document. Define which dimensions and properties vary per configuration. In Inventor, you can use named parameters to make dimension relationships explicit. In both cases, document part number, material and revision so a model variant is never confused with a released product.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Dit is een modelleerstrategie, geen directe softwarekoppeling. Menunamen en beschikbare functies verschillen per versie en licentie. Verifieer tekeningen en stuklijsten na elke variantwijziging; een correct 3D-model garandeert niet dat afgeleide documenten actueel zijn.",
          en: "This is a modelling strategy, not a direct software integration. Menu names and available functions differ per version and license. Verify drawings and bills of material after every variant change; a correct 3D model does not guarantee that derived documents are up to date.",
        },
      ],
    ],
    source: [
      "SolidWorks — Configurations",
      "https://help.solidworks.com/2024/English/solidworks/sldworks/c_Configurations_Overview.htm",
    ],
  },
  {
    slug: "spiebaan-toleranties-kiezen",
    basis: {
      nl: "Spiebaanmaten uit DIN 6885-1 (b/h/t1/t2 per asdiameter) en breedtetoleranties uit ISO 286-2, norm. Alleen parallelle spiebanen tot Ø110 mm — geen sterkteberekening van de verbinding, geen spanningsconcentratie in de hoeken.",
      en: "Keyway dimensions from DIN 6885-1 (b/h/t1/t2 per shaft diameter) and width tolerances from ISO 286-2, standard. Parallel keyways only, up to Ø110 mm — no strength calculation of the joint, no stress concentration at the corners.",
    },
    category: "Toleranties & assemblage",
    title: {
      nl: "Een spiebaan is een tolerantiekeuze, geen vast recept.",
      en: "A keyway is a tolerance choice, not a fixed recipe.",
    },
    intro: {
      nl: "Breedte, diepte en pasvorm bepalen samen of een spiebaanverbinding speling heeft of vastklemt — en dat is een bewuste keuze per toepassing.",
      en: "Width, depth and fit class together decide whether a keyway joint has clearance or clamps tight — and that's a deliberate choice per application.",
    },
    time: "5 min",
    tool: "spiebanen",
    question: {
      nl: "Een as van Ø25 mm krijgt een vaste naaf zonder axiale verschuiving. Welke spiebaanmaten en welke breedtepassing horen daarbij?",
      en: "A Ø25 mm shaft gets a fixed hub with no axial sliding. What keyway dimensions and width fit belong to it?",
    },
    sections: [
      [
        { nl: "Maat volgt uit de asdiameter", en: "Size follows from the shaft diameter" },
        {
          nl: "DIN 6885-1 geeft spiebreedte b, spiehoogte h en insteekdieptes t1 (as) en t2 (naaf) per bereik van de asdiameter, niet als vloeiende formule. Voor Ø25 mm valt de as in het bereik >22 tot 30 mm: b = 8 mm, h = 7 mm, t1 = 4,0 mm en t2 = 3,3 mm, met een diepte-tolerantie van ±0,2 mm. Lees de tabel op basis van de werkelijke asdiameter, niet op een afgeronde CAD-maat.",
          en: "DIN 6885-1 gives key width b, key height h and the seating depths t1 (shaft) and t2 (hub) per shaft-diameter range, not as a smooth formula. For Ø25 mm the shaft falls in the >22 to 30 mm range: b = 8 mm, h = 7 mm, t1 = 4.0 mm and t2 = 3.3 mm, with a ±0.2 mm depth tolerance. Read the table from the actual shaft diameter, not a rounded CAD dimension.",
        },
      ],
      [
        { nl: "Breedte bepaalt de pasvorm, niet de diepte", en: "Width sets the fit, not the depth" },
        {
          nl: "De insteekdieptes t1/t2 hebben maar één, vaste tolerantie. De pasvorm zit in de breedte b: dezelfde sleufbreedte krijgt in as en naaf elk een eigen toleranzeklasse. P9 geeft een vaste, klemmende zitting zonder relatieve beweging; N9 is vast maar iets losser voor eenvoudiger montage; JS9 is symmetrisch en geschikt voor een lichte schuifzitting; H9 is een geleidespie die axiaal moet kunnen verschuiven; D10 hoort bij een spie die al vastzit in de as en los in de naaf moet vallen.",
          en: "The seating depths t1/t2 carry just one fixed tolerance. The fit lives in the width b: the same slot width gets its own tolerance class in the shaft and in the hub. P9 gives a tight, clamping fit with no relative motion; N9 is fixed but a little looser for easier assembly; JS9 is symmetric and suited to a light sliding fit; H9 is a guiding key that must be able to slide axially; D10 belongs to a key that is already fixed in the shaft and must sit loose in the hub.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: P9 op b = 8 mm", en: "Worked example: P9 on b = 8 mm" },
        {
          nl: "Voor b = 8 mm geeft ISO 286-2 een IT9-veld van 36 µm en een P-afwijking van −15 µm. De sleufbreedte voor P9 ligt dan tussen −0,015 en −0,051 mm ten opzichte van de nominale 8 mm — de sleuf is altijd smaller dan nominaal, wat de klemming geeft. Vergelijk dat met H9, waar de sleuf tussen 0 en +0,036 mm ligt en er standaard speling overblijft.",
          en: "For b = 8 mm, ISO 286-2 gives an IT9 grade of 36 µm and a P deviation of −15 µm. The slot width for P9 then falls between −0.015 and −0.051 mm relative to the nominal 8 mm — the slot is always narrower than nominal, which produces the clamping. Compare that with H9, where the slot falls between 0 and +0.036 mm and clearance remains by default.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "De tabel dekt parallelle spiebanen tot Ø110 mm; spline- en Woodruff-verbindingen vallen erbuiten. Er wordt geen afschuiv- of afplattingssterkte van de spie zelf berekend en geen spanningsconcentratie bij de sleufhoeken beoordeeld. Controleer die belasting apart bij hoge koppels of schokbelasting.",
          en: "The table covers parallel keyways up to Ø110 mm; spline and Woodruff joints fall outside it. No shear or bearing strength of the key itself is calculated, and no stress concentration at the slot corners is assessed. Check that loading separately for high torque or shock loads.",
        },
      ],
    ],
  },
  {
    slug: "lagerpassing-kiezen",
    basis: {
      nl: "SKF-achtige selectierichtlijn voor groefkogellagers (cilindrische boring, roterende binnenring, stilstaande buitenring) gecombineerd met ISO 286-2 toleranties, vuistregel/norm. Geldig tot Ø50 mm — geen rekening met asmateriaal, warmteontwikkeling of een meeroterende buitenring.",
      en: "SKF-style selection guideline for deep-groove ball bearings (cylindrical bore, rotating inner ring, stationary outer ring) combined with ISO 286-2 tolerances, rule of thumb/standard. Valid up to Ø50 mm — no allowance for shaft material, heat generation, or a co-rotating outer ring.",
    },
    category: "Toleranties & assemblage",
    title: {
      nl: "Een lagerpassing kies je op belasting, niet op gevoel.",
      en: "A bearing fit is chosen by load, not by feel.",
    },
    intro: {
      nl: "Een roterende binnenring die te los zit, kruipt op de as en slijt. Kies de aspassing op belastingsklasse, niet op een vast 'gebruikelijk' getal.",
      en: "A rotating inner ring that fits too loose creeps on the shaft and wears. Choose the shaft fit by load class, not by a fixed 'usual' number.",
    },
    time: "5 min",
    tool: "lagerpassing",
    question: {
      nl: "Een roterende as van Ø30 mm draagt een normale, stationaire belasting. Welke passing hoort bij de as en welke bij het huis?",
      en: "A rotating Ø30 mm shaft carries a normal, stationary load. What fit belongs to the shaft, and what fit belongs to the housing?",
    },
    sections: [
      [
        { nl: "De roterende ring heeft klemming nodig", en: "The rotating ring needs a grip" },
        {
          nl: "Bij het gangbare geval — binnenring roteert mee met de as, buitenring staat stil in een puntbelast huis — moet de as-passing voorkomen dat de binnenring relatief tot de as kruipt. Kruipen veroorzaakt wrijvingscorrosie en speling die groeit. De buitenring in het stilstaande huis mag losser zitten, zolang die zijde ook echt stilstaat.",
          en: "In the common case — inner ring rotates with the shaft, outer ring is stationary in a point-loaded housing — the shaft fit must stop the inner ring from creeping relative to the shaft. Creep causes fretting corrosion and clearance that keeps growing. The outer ring in the stationary housing may sit looser, as long as that side genuinely stays stationary.",
        },
      ],
      [
        { nl: "Belastingsklasse bepaalt de asklasse", en: "Load class sets the shaft class" },
        {
          nl: "Licht (P ≤ 0,06 C) hoort bij j6. Normaal (0,06 C < P ≤ 0,12 C) hoort bij k5 tot en met Ø18 mm en bij k6 daarboven. Zwaar (P > 0,12 C) hoort bij n6. Voor Ø30 mm bij normale belasting geeft dat, omdat 30 mm boven de 18 mm-grens ligt, k6 — niet k5.",
          en: "Light (P ≤ 0.06 C) belongs with j6. Normal (0.06 C < P ≤ 0.12 C) belongs with k5 up to and including Ø18 mm, and with k6 above that. Heavy (P > 0.12 C) belongs with n6. For Ø30 mm under normal load, because 30 mm is above the 18 mm boundary, that gives k6 — not k5.",
        },
      ],
      [
        { nl: "Vaste en losse zijde in het huis", en: "Fixed and floating side in the housing" },
        {
          nl: "De losse zijde krijgt altijd H7, ongeacht de belasting: die zijde moet axiaal kunnen schuiven om thermische uitzetting en tolerantiestapeling op te vangen. De vaste zijde volgt de belasting: J7 bij licht, K7 bij normaal, M7 bij zwaar. Voor het Ø30 mm-voorbeeld met een vaste, normaal belaste zijde geeft dat K7.",
          en: "The floating side always gets H7, regardless of load: that side must be able to slide axially to absorb thermal expansion and tolerance stack-up. The fixed side follows the load: J7 for light, K7 for normal, M7 for heavy. For the Ø30 mm example with a fixed, normally loaded side, that gives K7.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Deze richtlijn geldt tot Ø50 mm, voor groefkogellagers met cilindrische boring en het gangbare belastingsgeval. Een holle as, sterke warmteontwikkeling of een meeroterende buitenring vragen een andere passing dan hier gegeven. Raadpleeg voor kritieke of afwijkende toepassingen de volledige selectietabel van de lagerfabrikant.",
          en: "This guideline holds up to Ø50 mm, for deep-groove ball bearings with a cylindrical bore and the common loading case. A hollow shaft, significant heat generation or a co-rotating outer ring call for a different fit than given here. For critical or deviating applications, consult the bearing manufacturer's full selection table.",
        },
      ],
    ],
  },
  {
    slug: "knik-en-slankheid",
    basis: {
      nl: "Euler-knikformule F_cr = π²EI/L_eff² met eindvoorwaardefactor k (AISC/Shigley-ontwerpwaarden) en een grensslankheid λ_grens = π√(E/Rp0,2), fysica. Geldig in het elastische (Euler-)gebied; onder die grens is het gerapporteerde F_cr een bovengrens, geen geverifieerde kolomcapaciteit.",
      en: "Euler buckling formula F_cr = π²EI/L_eff² with an end-condition factor k (AISC/Shigley design values) and a limiting slenderness λ_limit = π√(E/Rp0.2), physics. Valid in the elastic (Euler) regime; below that limit, the reported F_cr is an upper bound, not a verified column capacity.",
    },
    category: "Machineframes",
    title: {
      nl: "Een slanke staaf faalt door knikken, niet door vloeien — tot die grens verschuift.",
      en: "A slender bar fails by buckling, not by yielding — until that boundary shifts.",
    },
    intro: {
      nl: "Een dunne kolom onder druk bezwijkt vaak lang voordat het materiaal vloeit. Ken de slankheid van de staaf voordat je de sterkte beoordeelt.",
      en: "A thin column under compression often fails long before the material yields. Know the bar's slenderness before you judge its strength.",
    },
    time: "6 min",
    tool: "knik",
    question: {
      nl: "Een stalen ronde staaf Ø20 mm, 800 mm lang, scharnierend aan beide zijden, draagt 5 kN drukkracht. Is dat veilig tegen knikken?",
      en: "A steel round bar Ø20 mm, 800 mm long, pinned at both ends, carries 5 kN of compressive load. Is that safe against buckling?",
    },
    sections: [
      [
        { nl: "Slankheid, niet dikte, bepaalt het gedrag", en: "Slenderness, not thickness, sets the behaviour" },
        {
          nl: "De slankheid λ = L_eff / i, met traagheidsstraal i = √(I/A) en effectieve lengte L_eff = k · L. De eindvoorwaardefactor k hangt af van hoe de staaf is ingeklemd: scharnier-scharnier k = 1, ingeklemd-vrij k ≈ 2,1, ingeklemd-ingeklemd k ≈ 0,65. Deze ontwerpwaarden (AISC/Shigley) liggen iets minder gunstig dan de theoretisch ideale waarden, omdat volledige inklemming in de praktijk niet bestaat.",
          en: "Slenderness λ = L_eff / i, with radius of gyration i = √(I/A) and effective length L_eff = k · L. The end-condition factor k depends on how the bar is clamped: pinned-pinned k = 1, fixed-free k ≈ 2.1, fixed-fixed k ≈ 0.65. These design values (AISC/Shigley) sit slightly less favourably than the theoretically ideal ones, because perfect fixity doesn't exist in practice.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld Ø20 mm, 800 mm, scharnier-scharnier", en: "Worked example Ø20 mm, 800 mm, pinned-pinned" },
        {
          nl: "Voor een massieve ronde staaf is i = D/4, dus i = 5 mm en λ = 800/5 = 160. Met I = π·20⁴/64 = 7.854 mm⁴, E = 210.000 N/mm² en L_eff = 800 mm geeft F_cr = π²EI/L_eff² ≈ 25,4 kN. Bij een belasting van 5 kN is de veiligheid F_cr/F ≈ 5,1 — ruim voldoende in dit elastische regime.",
          en: "For a solid round bar, i = D/4, so i = 5 mm and λ = 800/5 = 160. With I = π·20⁴/64 = 7,854 mm⁴, E = 210,000 N/mm² and L_eff = 800 mm, F_cr = π²EI/L_eff² ≈ 25.4 kN. At a 5 kN load, the safety factor F_cr/F ≈ 5.1 — ample margin in this elastic regime.",
        },
      ],
      [
        { nl: "Ken de grens waar Euler niet meer geldt", en: "Know where Euler stops applying" },
        {
          nl: "De grensslankheid λ_grens = π·√(E/Rp0,2) markeert waar de staaf vloeit vóórdat hij elastisch knikt. Voor staal (E = 210.000, Rp0,2 = 235) ligt die grens rond 94. Met λ = 160 zit dit voorbeeld daar ruim boven: het Euler-resultaat is een geverifieerde capaciteit. Onder de grens rapporteert Mechify een bovengrens (A·Rp0,2) in plaats van een pas/faal-antwoord — dat vraagt een aparte kolomcontrole zoals een Johnson-parabool, Tetmajer of een nationale ontwerpnorm.",
          en: "The limiting slenderness λ_limit = π·√(E/Rp0.2) marks where the bar yields before it buckles elastically. For steel (E = 210,000, Rp0.2 = 235), that limit sits around 94. With λ = 160, this example sits well above it: the Euler result is a verified capacity. Below the limit, Mechify reports an upper bound (A·Rp0.2) instead of a pass/fail answer — that calls for a separate column check such as a Johnson parabola, Tetmajer, or a national design standard.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Het model gaat uit van een ideaal rechte staaf onder centrische belasting, zonder initiële kromming of excentriciteit. Lokale plooiing van dunwandige doorsneden, dynamische belasting en vermoeiing zijn niet inbegrepen. Gebruik de ontwerpwaarden van k, niet de theoretisch ideale, omdat die rekening houden met onvolmaakte inklemming.",
          en: "The model assumes an ideally straight bar under centric loading, with no initial curvature or eccentricity. Local buckling of thin-walled sections, dynamic loading and fatigue are not included. Use the design values of k, not the theoretically ideal ones, since they account for imperfect fixity.",
        },
      ],
    ],
  },
  {
    slug: "lagerlevensduur-berekenen",
    basis: {
      nl: "ISO 281 — basis dynamische kentallevensduur L10/L10h en de a1-betrouwbaarheidsfactor, norm. Neemt draaggetal C en equivalente belasting P als gegeven aan; geen a_ISO-smerings-/verontreinigingsfactor en geen X/Y-belastingsomrekening.",
      en: "ISO 281 — basic dynamic rating life L10/L10h and the a1 reliability factor, standard. Takes the dynamic load rating C and equivalent load P as given; no a_ISO lubrication/contamination factor and no X/Y load conversion.",
    },
    category: "Aandrijftechniek",
    title: {
      nl: "L10 is een statistische levensduur, geen garantie per lager.",
      en: "L10 is a statistical life, not a per-bearing guarantee.",
    },
    intro: {
      nl: "90% van een groep identieke lagers haalt de L10-levensduur of meer. Dat zegt niets zeker over het ene lager in jouw machine.",
      en: "90% of a batch of identical bearings reaches the L10 life or more. That says nothing certain about the one bearing in your machine.",
    },
    time: "5 min",
    tool: "lagerlevensduur",
    question: {
      nl: "Een kogellager met C = 25 kN draait bij 750 omw/min onder een equivalente belasting van 4 kN. Hoeveel bedrijfsuren mag je verwachten?",
      en: "A ball bearing with C = 25 kN runs at 750 rpm under an equivalent load of 4 kN. How many operating hours can you expect?",
    },
    sections: [
      [
        { nl: "L10 komt uit een vermoeiingsrelatie", en: "L10 comes from a fatigue relation" },
        {
          nl: "L10 = (C/P)^p, uitgedrukt in miljoenen omwentelingen, met p = 3 voor kogellagers en p = 10/3 voor rollagers. De formule beschrijft materiaalvermoeiing van het rolcontact, geen slijtage door verontreiniging of gebrekkige smering. L10 is de levensduur die 90% van een groep identieke lagers onder dezelfde omstandigheden minstens haalt.",
          en: "L10 = (C/P)^p, expressed in millions of revolutions, with p = 3 for ball bearings and p = 10/3 for roller bearings. The formula describes rolling-contact fatigue of the material, not wear from contamination or poor lubrication. L10 is the life that 90% of a batch of identical bearings under the same conditions reaches at minimum.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: kogellager, C = 25 kN, P = 4 kN", en: "Worked example: ball bearing, C = 25 kN, P = 4 kN" },
        {
          nl: "L10 = (25/4)³ = 244,1 miljoen omwentelingen. Bij een constant toerental van 750 omw/min volgt L10h = L10 · 10⁶ / (60 · n) ≈ 5.425 bedrijfsuren. Dat is de dynamische kentallevensduur bij 90% betrouwbaarheid — niet de gegarandeerde levensduur van dit specifieke lager.",
          en: "L10 = (25/4)³ = 244.1 million revolutions. At a constant speed of 750 rpm, L10h = L10 · 10⁶ / (60 · n) ≈ 5,425 operating hours. That is the basic dynamic rating life at 90% reliability — not the guaranteed life of this specific bearing.",
        },
      ],
      [
        { nl: "Betrouwbaarheid boven 90% kost levensduur", en: "Reliability above 90% costs life" },
        {
          nl: "De a1-factor schaalt L10 naar een hogere betrouwbaarheid: a1 = 0,62 bij 95%. Voor dit voorbeeld geeft dat L10h,95 ≈ 5.425 · 0,62 ≈ 3.364 uur. Het lager verandert niet; de rapportage wordt strenger. Kies de betrouwbaarheid op basis van de gevolgen van een storing, niet standaard de hoogste waarde.",
          en: "The a1 factor scales L10 to a higher reliability: a1 = 0.62 at 95%. For this example that gives L10h,95 ≈ 5,425 · 0.62 ≈ 3,364 hours. The bearing itself doesn't change; the reporting gets stricter. Choose the reliability level based on the consequences of a failure, not by default the highest value.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Deze berekening neemt C en P als gegeven aan; de equivalente belasting P volgt normaal uit een aparte X/Y-berekening op basis van de werkelijke radiale/axiale belastingsverhouding, hier niet gemodelleerd. De smerings- en verontreinigingsinvloed (a_ISO uit ISO 281:2007) ontbreekt. Controleer daarnaast de statische veiligheid S0 = C0/P0 apart — bijvoorbeeld C0 = 20 kN en P0 = 4 kN geeft S0 = 5, ruim boven de aanbevolen minimum van 1 voor rustig draaiende lagers.",
          en: "This calculation takes C and P as given; the equivalent load P normally follows from a separate X/Y calculation based on the actual radial/axial load ratio, not modelled here. Lubrication and contamination influence (a_ISO from ISO 281:2007) is not included. Also check the static safety factor S0 = C0/P0 separately — for example, C0 = 20 kN and P0 = 4 kN gives S0 = 5, well above the recommended minimum of 1 for smoothly running bearings.",
        },
      ],
    ],
  },
  {
    slug: "asdiameter-bij-torsie",
    basis: {
      nl: "τ = 16T/(πd³), fysica (Roark's Formulas for Stress and Strain / Shigley). Zuivere torsie op een massieve ronde as — geen buiging, dwarskracht, spanningsconcentratie, vermoeiing of stijfheid.",
      en: "τ = 16T/(πd³), physics (Roark's Formulas for Stress and Strain / Shigley). Pure torsion on a solid round shaft — no bending, transverse shear, stress concentration, fatigue or stiffness.",
    },
    category: "Machineframes",
    title: {
      nl: "Een asdiameter is een startpunt, geen eindantwoord.",
      en: "A shaft diameter is a starting point, not a final answer.",
    },
    intro: {
      nl: "Torsie alleen vertelt je de minimale diameter. De meeste assen dragen meer dan dat.",
      en: "Torsion alone tells you the minimum diameter. Most shafts carry more than that.",
    },
    time: "5 min",
    tool: "shaft-diameter",
    question: {
      nl: "Een as moet 50 N·m overbrengen; het materiaal staat 40 N/mm² schuifspanning toe. Welke minimale diameter is veilig?",
      en: "A shaft must transmit 50 N·m; the material allows 40 N/mm² shear stress. What minimum diameter is safe?",
    },
    sections: [
      [
        { nl: "Spanning zit aan de buitenrand", en: "Stress lives at the outer edge" },
        {
          nl: "Bij torsie op een massieve ronde as is de schuifspanning τ = T·r/J, met J = π·d⁴/32 en r = d/2. De spanning is nul in het hart en maximaal aan de buitenrand. Oplossen naar d geeft d = ∛(16T/(π·τ_toel)) — de kleinste diameter die de toegestane spanning niet overschrijdt.",
          en: "Under torsion on a solid round shaft, the shear stress is τ = T·r/J, with J = π·d⁴/32 and r = d/2. Stress is zero at the core and maximum at the outer edge. Solving for d gives d = ∛(16T/(π·τ_allow)) — the smallest diameter that doesn't exceed the allowed stress.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: 50 N·m bij 40 N/mm²", en: "Worked example: 50 N·m at 40 N/mm²" },
        {
          nl: "Met T = 50 N·m (50.000 N·mm) en τ_toel = 40 N/mm² geeft d = ∛(16 · 50.000 / (π · 40)) ≈ 18,53 mm. Terugrekenen bevestigt het: bij Ø18,53 mm levert 50 N·m precies 40 N/mm² op. Een kleinere as overschrijdt de toegestane spanning; een grotere as heeft marge over.",
          en: "With T = 50 N·m (50,000 N·mm) and τ_allow = 40 N/mm², d = ∛(16 · 50,000 / (π · 40)) ≈ 18.53 mm. Working backwards confirms it: at Ø18.53 mm, 50 N·m produces exactly 40 N/mm². A smaller shaft exceeds the allowed stress; a larger one has margin to spare.",
        },
      ],
      [
        { nl: "Torsie is zelden de enige belasting", en: "Torsion is rarely the only load" },
        {
          nl: "Een tandwiel, poelie of ketting introduceert ook buiging en dwarskracht op de as — bij de meeste assen is dat de dominante belasting, niet zuivere torsie. Spanningsconcentratie bij spiebanen, schouders en gaten verhoogt de lokale spanning verder. Een roterende as onder wisselende buiging is bovendien een vermoeiingsprobleem, geen statisch probleem. Mechify's veiligheidsband (< 1,0 is onveilig, 1,0–1,2 is een waarschuwingszone) is een screeningsdrempel, geen normwaarde uit een ontwerpcode.",
          en: "A gear, pulley or sprocket also introduces bending and transverse shear on the shaft — for most shafts that dominates, not pure torsion. Stress concentration at keyways, shoulders and holes raises the local stress further. A rotating shaft under alternating bending is also a fatigue problem, not a static one. Mechify's safety band (below 1.0 is unsafe, 1.0-1.2 is a caution zone) is a screening threshold, not a value from a design code.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Het model rekent alleen zuivere torsie op een massieve ronde as. Gecombineerde belasting, spanningsconcentratie, vermoeiing, stijfheid (torsiehoek, doorbuiging, kritisch toerental) en holle assen vallen erbuiten. Gebruik voor een werkelijke as met keyways en wisselende belasting een volledige sterkte- en vermoeiingsanalyse.",
          en: "The model calculates pure torsion on a solid round shaft only. Combined loading, stress concentration, fatigue, stiffness (twist angle, deflection, critical speed) and hollow shafts fall outside it. For a real shaft with keyways and alternating loads, use a full strength and fatigue analysis.",
        },
      ],
    ],
  },
  {
    slug: "boutverbinding-controleren",
    basis: {
      nl: "VDI 2230-lite: twee grensgevallen (restklemkracht en maximale boutkracht) van een concentrisch, statisch belaste boutverbinding, norm. Geen excentrische belasting, dwarskracht/wrijvingsgrip, vermoeiing of insteekverlies-tabel.",
      en: "VDI 2230-lite: two boundary cases (residual clamp force and maximum bolt force) of a concentrically loaded, static bolted joint, standard. No eccentric loading, transverse/friction-grip check, fatigue or embedding-loss table.",
    },
    category: "Toleranties & assemblage",
    title: {
      nl: "Een boutverbinding kan op twee manieren falen.",
      en: "A bolted joint can fail in two different ways.",
    },
    intro: {
      nl: "Te weinig restklemkracht en de voeg gaat open. Te veel boutkracht en de bout vloeit. Controleer beide grensgevallen, niet maar één.",
      en: "Too little residual clamp force and the joint opens. Too much bolt force and the bolt yields. Check both boundary cases, not just one.",
    },
    time: "6 min",
    tool: "bolted-joint",
    question: {
      nl: "Een bout met een voorspanning van 20 kN moet een uitwendige belasting van 8 kN per bout opvangen zonder dat de voeg opent. Houdt de verbinding stand?",
      en: "A bolt with 20 kN of preload must absorb an 8 kN external load per bolt without the joint opening. Does the joint hold?",
    },
    sections: [
      [
        { nl: "Twee grenzen, niet één", en: "Two boundaries, not one" },
        {
          nl: "Na montage verliest een bout een deel van zijn voorspanning aan insteekverlies F_Z: F_V,rest = F_V − F_Z. Onder de volle werklast splitst de belasting zich via de belastingsfactor φ: de restklemkracht daalt tot F_KR = F_V,rest − (1 − φ)·F_A, terwijl de boutkracht stijgt tot F_S,max = F_V,rest + φ·F_A. Beide grensgevallen moeten kloppen — de een beschermt de voeg tegen openen, de ander beschermt de bout tegen vloeien.",
          en: "After assembly, a bolt loses part of its preload to embedding loss F_Z: F_V,rest = F_V − F_Z. Under full working load, the resilience factor φ splits the load: the residual clamp force drops to F_KR = F_V,rest − (1 − φ)·F_A, while the bolt force rises to F_S,max = F_V,rest + φ·F_A. Both boundary cases have to hold — one protects the joint against opening, the other protects the bolt against yielding.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: voorspanning 20 kN, last 8 kN", en: "Worked example: 20 kN preload, 8 kN load" },
        {
          nl: "Met A_s = 84,3 mm², Rp0,2 = 900 N/mm², F_V = 20 kN, F_Z = 1 kN, φ = 0,25 en F_A = 8 kN volgt F_V,rest = 19 kN. Onder volle last: F_KR = 19 − 0,75·8 = 13 kN (boven de vereiste 10 kN, dus de voeg blijft dicht) en F_S,max = 19 + 0,25·8 = 21 kN, wat σ_S = 21.000/84,3 ≈ 249,1 N/mm² geeft — een statische veiligheid van 900/249,1 ≈ 3,6. Beide grenzen zijn ruim veilig.",
          en: "With A_s = 84.3 mm², Rp0.2 = 900 N/mm², F_V = 20 kN, F_Z = 1 kN, φ = 0.25 and F_A = 8 kN, F_V,rest = 19 kN follows. Under full load: F_KR = 19 − 0.75·8 = 13 kN (above the required 10 kN, so the joint stays closed) and F_S,max = 19 + 0.25·8 = 21 kN, giving σ_S = 21,000/84.3 ≈ 249.1 N/mm² — a static safety factor of 900/249.1 ≈ 3.6. Both boundaries hold with ample margin.",
        },
      ],
      [
        { nl: "Wanneer beide grenzen tegelijk falen", en: "When both boundaries fail together" },
        {
          nl: "Een onderdimensioneerde bout laat zien waarom je beide checks nodig hebt: met A_s = 36,6 mm², Rp0,2 = 720 N/mm², F_V = 5 kN, F_Z = 0,5 kN, φ = 0,3 en F_A = 200 kN wordt F_V,rest = 4,5 kN. F_KR = 4,5 − 0,7·200 = −135,5 kN — de voeg is allang open — terwijl F_S,max = 64,5 kN neerkomt op σ_S ≈ 1.762 N/mm², ver boven Rp0,2. De veiligheidsfactor 720/1.762 ≈ 0,41 bevestigt dat de bout ook vloeit. Eén van de twee checks alleen bekijken had dit gemist kunnen laten lijken zolang de andere nog hield.",
          en: "An undersized bolt shows why you need both checks: with A_s = 36.6 mm², Rp0.2 = 720 N/mm², F_V = 5 kN, F_Z = 0.5 kN, φ = 0.3 and F_A = 200 kN, F_V,rest = 4.5 kN. F_KR = 4.5 − 0.7·200 = −135.5 kN — the joint has long since opened — while F_S,max = 64.5 kN works out to σ_S ≈ 1,762 N/mm², far above Rp0.2. The safety factor 720/1,762 ≈ 0.41 confirms the bolt yields too. Looking at only one of the two checks could have made this look fine as long as the other still held.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Dit is de 'lite' scope van VDI 2230: een concentrisch, statisch belaste voeg. Excentrische of buigende belasting, dwarskracht met de bijbehorende wrijvingsgrip-check, vermoeiing/wisselspanning, de insteekverlies-tabel (F_Z wordt hier als invoer aangenomen) en torsiespanning tijdens het aandraaien vallen buiten dit model. Gebruik voor kritieke of dynamisch belaste verbindingen de volledige VDI 2230.",
          en: "This is VDI 2230's 'lite' scope: a concentrically loaded, static joint. Eccentric or bending loads, transverse load with its friction-grip check, fatigue/alternating stress, the embedding-loss table (F_Z is taken as input here) and torsional stress during tightening fall outside this model. For critical or dynamically loaded joints, use the full VDI 2230.",
        },
      ],
    ],
  },
  {
    slug: "o-ringgroef-ontwerpen",
    basis: {
      nl: "Ontwerpregel op basis van ISO 3601-1 koorddiameters — percentage samendrukking (squeeze) en breedtefactor — geen reproductie van de ISO 3601-2 glandtabel. Indicatief voor een eerste ontwerp.",
      en: "A design rule based on ISO 3601-1 cord diameters — squeeze percentage and width factor — not a reproduction of the ISO 3601-2 gland table. Indicative for a first design.",
    },
    category: "Pneumatiek",
    title: {
      nl: "Een O-ringgroef moet passen vóórdat hij afdicht.",
      en: "An O-ring groove has to fit before it can seal.",
    },
    intro: {
      nl: "Genoeg samendrukking voor afdichting, genoeg ruimte voor het verdrongen volume. Beide maten komen uit dezelfde koorddiameter.",
      en: "Enough squeeze to seal, enough room for the displaced volume. Both dimensions come from the same cord diameter.",
    },
    time: "5 min",
    tool: "o-ring-grooves",
    question: {
      nl: "Een statische afdichting gebruikt een O-ring met koorddiameter 3,55 mm bij 20% samendrukking. Past de ring in de groef?",
      en: "A static seal uses an O-ring with a 3.55 mm cord diameter at 20% squeeze. Does the ring fit the groove?",
    },
    sections: [
      [
        { nl: "Diepte en breedte hebben elk hun eigen rol", en: "Depth and width each do a different job" },
        {
          nl: "De groefdiepte volgt uit de samendrukking: diepte = koorddiameter × (1 − squeeze%). Statische afdichtingen gebruiken doorgaans 15–30% (standaard 20%); dynamische afdichtingen minder, 10–16% (standaard 12%), om wrijving en slijtage te beperken. De groefbreedte, dwars op de samendrukkingsrichting, krijgt ruimte voor het verdrongen volume en thermische uitzetting: breedte = koorddiameter × breedtefactor, doorgaans 1,3–1,4×.",
          en: "Groove depth follows from the squeeze: depth = cord diameter × (1 − squeeze%). Static seals typically use 15-30% (default 20%); dynamic seals use less, 10-16% (default 12%), to limit friction and wear. Groove width, across the squeeze direction, gives room for the displaced volume and thermal expansion: width = cord diameter × width factor, typically 1.3-1.4×.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: koorddiameter 3,55 mm, 20% squeeze", en: "Worked example: 3.55 mm cord, 20% squeeze" },
        {
          nl: "Met een breedtefactor van 1,4 geeft dit een diepte van 3,55 × 0,8 = 2,84 mm en een breedte van 3,55 × 1,4 = 4,97 mm. Het O-ring-oppervlak is π·3,55²/4 ≈ 9,90 mm²; het groefoppervlak is 2,84 × 4,97 ≈ 14,11 mm². De vulling komt daarmee op ongeveer 70% — ruim onder de 100%, dus de ring past fysiek met marge voor zwelling en toleranties.",
          en: "With a width factor of 1.4, this gives a depth of 3.55 × 0.8 = 2.84 mm and a width of 3.55 × 1.4 = 4.97 mm. The O-ring's cross-section is π·3.55²/4 ≈ 9.90 mm²; the groove's cross-section is 2.84 × 4.97 ≈ 14.11 mm². The fill comes out to about 70% — well under 100%, so the ring physically fits with margin for swelling and tolerances.",
        },
      ],
      [
        { nl: "Wanneer de ring niet past", en: "When the ring doesn't fit" },
        {
          nl: "Neem dezelfde koorddiameter met 30% squeeze en een krappe breedtefactor van 1,1: diepte 2,485 mm, breedte 3,905 mm, vulling ≈ 102%. Dat is geen krappe marge maar een fysiek ongeldige geometrie — het nominale O-ring-oppervlak past niet in de groef, nog vóórdat zwelling, toleranties of thermische uitzetting worden meegerekend. Mechify's `overfilled`-vlag vangt precies dit geval; alleen het squeeze-percentage binnen de aanbevolen range controleren was niet genoeg om dit te ontdekken.",
          en: "Take the same cord diameter with 30% squeeze and a tight 1.1 width factor: depth 2.485 mm, width 3.905 mm, fill ≈ 102%. That isn't a tight margin — it's a physically invalid geometry: the O-ring's nominal cross-section doesn't fit in the groove, before swelling, tolerances or thermal expansion are even factored in. Mechify's `overfilled` flag catches exactly this case; checking only whether the squeeze percentage fell in the recommended range wasn't enough to catch it.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "ISO 3601-2 publiceert gedetailleerde glandtabellen per toepassing en koorddiameter; deze tool rekent in plaats daarvan met de onderliggende ontwerpregel. Dat is indicatief voor een eerste ontwerp. Controleer de definitieve groefmaat tegen ISO 3601-2 of een fabrikant-designgids (Parker, Trelleborg) vóór productie, zeker bij dynamische afdichtingen.",
          en: "ISO 3601-2 publishes detailed gland tables per application and cord diameter; this tool calculates from the underlying design rule instead. That's indicative for a first design. Check the final groove dimensions against ISO 3601-2 or a manufacturer design guide (Parker, Trelleborg) before production, especially for dynamic seals.",
        },
      ],
    ],
  },
  {
    slug: "algemene-toleranties-iso-2768",
    basis: {
      nl: "ISO 2768-1 (lineaire/hoekmaten, klassen f/m/c/v) en ISO 2768-2 (geometrische toleranties, klassen H/K/L), norm. Tabelwaarden getranscribeerd van veelgebruikte publieke samenvattingen — verifieer tegen de originele norm voor contractueel bindende tekeningen.",
      en: "ISO 2768-1 (linear/angular dimensions, classes f/m/c/v) and ISO 2768-2 (geometric tolerances, classes H/K/L), standard. Table values transcribed from widely used public summaries — verify against the original standard for contractually binding drawings.",
    },
    category: "Toleranties & assemblage",
    title: {
      nl: "Eén tolerantieklasse in plaats van honderd individuele maten.",
      en: "One tolerance class instead of a hundred individual dimensions.",
    },
    intro: {
      nl: "ISO 2768 dekt elke maat zonder eigen toleranceaanduiding. Ken je de klasse, dan ken je de afwijking — mits je de juiste tabel gebruikt.",
      en: "ISO 2768 covers every dimension with no tolerance of its own. Know the class, and you know the deviation — as long as you use the right table.",
    },
    time: "5 min",
    tool: "iso-2768",
    question: {
      nl: "Een tekening specificeert klasse m (middel) volgens ISO 2768-1, zonder individuele toleranties. Welke afwijking geldt dan voor een maat van 42 mm?",
      en: "A drawing specifies class m (medium) per ISO 2768-1, with no individual tolerances. What deviation then applies to a 42 mm dimension?",
    },
    sections: [
      [
        { nl: "Eén klasse dekt de hele tekening", en: "One class covers the whole drawing" },
        {
          nl: "ISO 2768-1 geeft vier klassen — f (fijn), m (middel), c (grof), v (zeer grof) — elk met een tabel van toegestane afwijking per maatbereik. In plaats van elke maat afzonderlijk te tolerantiëren, verwijst de tekening één keer naar de norm en de klasse; elke niet-getolereerde maat valt daaronder. ISO 2768-2 doet hetzelfde voor vorm- en plaatstoleranties (rechtheid, vlakheid, loodrechtheid, symmetrie, rondloop) met klassen H, K en L.",
          en: "ISO 2768-1 gives four classes — f (fine), m (medium), c (coarse), v (very coarse) — each with a table of allowed deviation per size range. Instead of tolerancing every dimension individually, the drawing references the standard and the class once; every non-toleranced dimension falls under it. ISO 2768-2 does the same for form and position tolerances (straightness, flatness, perpendicularity, symmetry, run-out) with classes H, K and L.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: 42 mm, klasse m", en: "Worked example: 42 mm, class m" },
        {
          nl: "42 mm valt in het bereik >30–120 mm; klasse m geeft daar ±0,3 mm. De tabel is niet lineair schalend maar stapsgewijs per bereik: 6 mm in klasse f valt in het bereik >3–6 mm en geeft ±0,05 mm, terwijl 8 mm in klasse v in het bereik >6–30 mm valt en ±1,0 mm geeft. Lees de tabel altijd op het werkelijke maatbereik — twee maten net over een grens kunnen een andere afwijking krijgen dan hun onderlinge verschil doet vermoeden.",
          en: "42 mm falls in the >30-120 mm range; class m gives ±0.3 mm there. The table doesn't scale linearly but steps per range: 6 mm in class f falls in the >3-6 mm range and gives ±0.05 mm, while 8 mm in class v falls in the >6-30 mm range and gives ±1.0 mm. Always read the table from the actual size range — two dimensions just either side of a boundary can get a different deviation than their small difference would suggest.",
        },
      ],
      [
        { nl: "Geometrische afwijkingen zijn geen ±", en: "Geometric deviations aren't a ±" },
        {
          nl: "ISO 2768-2's tabellen geven de totale breedte van de tolerantiezone, geen afwijking rond een nominale waarde. Klasse K rondloop is bijvoorbeeld 0,2 mm — de volledige zone, niet ±0,2 mm. Die twee lezen alsof ze hetzelfde zeggen, maar een ±-teken ervoor zou de zone ten onrechte twee keer zo ruim maken en kan bij inspectie een factor-twee fout veroorzaken. Mechify toont lineaire/hoekafwijkingen daarom met een ±-teken en geometrische zones zonder.",
          en: "ISO 2768-2's tables give the total width of the tolerance zone, not a deviation around a nominal value. Class K run-out, for example, is 0.2 mm — the full zone, not ±0.2 mm. The two read as if they say the same thing, but a ± sign in front would wrongly make the zone twice as permissive and can cause a factor-of-two inspection error. Mechify therefore shows linear/angular deviations with a ± sign and geometric zones without one.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "De tabelwaarden zijn getranscribeerd van veelgebruikte, publiek gepubliceerde samenvattingen van ISO 2768-1/-2. Voor contractueel bindende tekeningen: verifieer tegen de originele ISO-norm. De lineaire tabellen beginnen pas bij 0,5 mm; kleinere maten vallen buiten de scope van deze klasse-indeling.",
          en: "The table values are transcribed from widely used, publicly published summaries of ISO 2768-1/-2. For contractually binding drawings: verify against the original ISO standard. The linear tables only start at 0.5 mm; smaller dimensions fall outside the scope of this class system.",
        },
      ],
    ],
  },
  {
    slug: "randen-en-flenzen-in-plaatwerk",
    basis: {
      nl: "Binnenstraal, beenlengte en groefbreedte per plaatdikte en materiaal, fabrikantrichtlijn (247TailorSteel). Bend allowance/deduction via de standaardformule BA = (π/2)·(Ri + K·t) met een richtwaarde K-factor (0,3–0,5) — geen normconformiteit voor een specifieke buigmachine.",
      en: "Inside radius, leg length and groove width per plate thickness and material, manufacturer guideline (247TailorSteel). Bend allowance/deduction via the standard formula BA = (π/2)·(Ri + K·t) with a rule-of-thumb K-factor (0.3-0.5) — no standard-conformance claim for a specific bending machine.",
    },
    category: "Machineframes",
    title: {
      nl: "Een gezette rand begint bij de binnenstraal, niet bij de plaatdikte.",
      en: "A bent edge starts with the inside radius, not the plate thickness.",
    },
    intro: {
      nl: "De minimale binnenstraal, beenlengte en groefbreedte verschillen per materiaal en plaatdikte — en bepalen samen of een tekening maakbaar is.",
      en: "The minimum inside radius, leg length and groove width differ by material and plate thickness — and together decide whether a drawing is actually buildable.",
    },
    time: "5 min",
    tool: "edges",
    question: {
      nl: "Een plaat van 3 mm staal krijgt een haakse (90°) zetting. Welke binnenstraal en beenlengte horen daarbij, en hoeveel platte lengte moet je aftrekken van de buitenmaten?",
      en: "A 3 mm steel plate gets a right-angle (90°) bend. What inside radius and leg length belong to it, and how much flat length do you subtract from the outside dimensions?",
    },
    sections: [
      [
        { nl: "De tabel bepaalt de maakbaarheid, niet de tekenaar", en: "The table decides buildability, not the drafter" },
        {
          nl: "Voor elke combinatie van materiaal, plaatdikte en zettype geeft de tabel drie maten: de minimale binnenstraal Ri die de zetbank haalt, de minimale beenlengte s (hoe dicht een gat of rand bij de zetlijn mag komen) en de groefbreedte w van het gebruikte gereedschap. Dit zijn geen vrije CAD-keuzes — ze volgen uit de combinatie van plaatdikte, materiaal en het gereedschap dat de leverancier daadwerkelijk gebruikt.",
          en: "For every combination of material, plate thickness and bend type, the table gives three dimensions: the minimum inside radius Ri the press brake can achieve, the minimum leg length s (how close a hole or edge may sit to the bend line) and the groove width w of the tooling used. These aren't free CAD choices — they follow from the combination of plate thickness, material and the tooling the supplier actually runs.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: 3 mm staal, haaks", en: "Worked example: 3 mm steel, right angle" },
        {
          nl: "Voor 3 mm staal met een haakse zetting geeft de tabel Ri = 2,75 mm, een groefbreedte w = 16 mm en een minimale beenlengte s = 12,4 mm. Een gat of rand die dichter dan 12,4 mm bij de zetlijn ligt, valt in de zone die apart beoordeeld moet worden — niet automatisch afgekeurd, maar niet zonder controle vrijgegeven.",
          en: "For 3 mm steel with a right-angle bend, the table gives Ri = 2.75 mm, a groove width w = 16 mm and a minimum leg length s = 12.4 mm. A hole or edge closer than 12.4 mm to the bend line falls in the zone that needs separate review — not automatically rejected, but not released without a check either.",
        },
      ],
      [
        { nl: "Van binnenstraal naar platte lengte", en: "From inside radius to flat length" },
        {
          nl: "Om de platte plaat vóór het zetten te bepalen, gebruik je de bend allowance BA = (π/2)·(Ri + K·t) — de booglengte van de neutrale lijn — en de bend deduction BD = 2·(Ri + t) − BA, hoeveel korter de platte lengte is dan de som van de buitenmaten. Met Ri = 2,75 mm, t = 3 mm en een richtwaarde K = 0,33 geeft dat BA ≈ 5,87 mm en BD ≈ 5,63 mm. De K-factor is een vuistregel die varieert van 0,3 tot 0,5 met materiaal en Ri/t-verhouding — dit is een schatting, geen tabelwaarde, en verdient controle tegen de eigen zetbank bij een kritieke maat.",
          en: "To determine the flat pattern before bending, use the bend allowance BA = (π/2)·(Ri + K·t) — the arc length of the neutral line — and the bend deduction BD = 2·(Ri + t) − BA, how much shorter the flat length is than the sum of the outside dimensions. With Ri = 2.75 mm, t = 3 mm and a rule-of-thumb K = 0.33, that gives BA ≈ 5.87 mm and BD ≈ 5.63 mm. The K-factor is a rule of thumb that varies from 0.3 to 0.5 with material and the Ri/t ratio — this is an estimate, not a table value, and is worth checking against your own press brake for a critical dimension.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "De Ri/w/s-waarden zijn letterlijk overgenomen van de 247TailorSteel-richtlijnen en gelden voor die leverancier en tooling — niet als universele norm voor elke zetbank. Sommige cellen stijgen niet monotoon met de plaatdikte; voor RVS haaks daalt Ri bijvoorbeeld van 11,91 mm bij 6 mm naar 11,64 mm bij 8 mm. Dat is geen invoerfout maar een letterlijke overname van de brontabel. Verifieer kritieke maten altijd bij de daadwerkelijke plaatwerker vóór productie.",
          en: "The Ri/w/s values are transcribed literally from the 247TailorSteel guidelines and hold for that supplier and tooling — not as a universal standard for every press brake. Some cells don't rise monotonically with plate thickness; for right-angle RVS (stainless), for instance, Ri drops from 11.91 mm at 6 mm to 11.64 mm at 8 mm. That's not a data-entry error but a literal transcription of the source table. Always verify critical dimensions with the actual sheet-metal shop before production.",
        },
      ],
    ],
  },
  {
    slug: "bevestigingsmateriaal-kiezen",
    basis: {
      nl: "Doorlaatmaten ISO 273, sleutelmaten ISO 4014/4017 (zeskant) en ISO 4762/DIN 912 (inbus), spanningsdoorsnede en klasse-indeling ISO 898-1, norm. Aandraaimoment via T = K·F_voorspankracht·d met K ≈ 0,2 (moerfactor-vuistregel) en 75% utilisatie van Rp0,2 — geen normverplichting, pas K aan bij smering of RVS.",
      en: "Clearance holes ISO 273, wrench sizes ISO 4014/4017 (hex) and ISO 4762/DIN 912 (socket), stress area and property classes ISO 898-1, standard. Tightening torque via T = K·F_preload·d with K ≈ 0.2 (nut-factor rule of thumb) and 75% utilisation of Rp0.2 — not a standard requirement, adjust K for lubrication or stainless steel.",
    },
    category: "Toleranties & assemblage",
    title: {
      nl: "Een bout kiezen is drie tabellen tegelijk raadplegen.",
      en: "Choosing a bolt means consulting three tables at once.",
    },
    intro: {
      nl: "Doorlaatmaat, sleutelmaat en aandraaimoment volgen alle drie uit dezelfde draadmaat — maar geen ervan volgt uit de andere twee.",
      en: "Clearance hole, wrench size and tightening torque all follow from the same thread size — but none of them follows from the other two.",
    },
    time: "5 min",
    tool: "fasteners",
    question: {
      nl: "Een M10-bout van klasse 8.8 moet een plaat monteren. Welke doorlaatmaat, sleutelmaat en aandraaimoment horen daarbij?",
      en: "An M10 bolt of property class 8.8 needs to mount a plate. What clearance hole, wrench size and tightening torque belong to it?",
    },
    sections: [
      [
        { nl: "Drie onafhankelijke keuzes per draadmaat", en: "Three independent choices per thread size" },
        {
          nl: "De doorlaatmaat (ISO 273) bepaalt hoe ruim het gat in de te bevestigen plaat is — fijn, middel of grof, afhankelijk van de gewenste positioneernauwkeurigheid. De sleutelmaat (ISO 4014/4017 voor zeskant, ISO 4762/DIN 912 voor inbus) bepaalt welk gereedschap past. Beide volgen direct uit de draadmaat, maar zijn onafhankelijke tabellen — de ene voorspelt de andere niet.",
          en: "The clearance hole (ISO 273) sets how roomy the hole in the part being fastened is — fine, medium or coarse, depending on the positioning accuracy needed. The wrench size (ISO 4014/4017 for hex, ISO 4762/DIN 912 for socket) sets which tool fits. Both follow directly from the thread size, but they're independent tables — one doesn't predict the other.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: M10, klasse 8.8", en: "Worked example: M10, class 8.8" },
        {
          nl: "Voor M10 geeft de doorlaattabel 10,5 mm (fijn), 11,0 mm (middel) of 12,0 mm (grof); de sleutelmaat is 16 mm (zeskant) of 8 mm (inbus). De spanningsdoorsnede A_s is 58,0 mm². Klasse 8.8 heeft een vloeigrens Rp0,2 = 800 × 0,8 = 640 N/mm². Bij 75% utilisatie is de voorspankracht 0,75 × 640 × 58,0 ≈ 27.840 N. Met een moerfactor K = 0,2 volgt het aandraaimoment T = 0,2 × 27.840 × 10 / 1000 ≈ 55,7 N·m.",
          en: "For M10, the clearance table gives 10.5 mm (fine), 11.0 mm (medium) or 12.0 mm (coarse); the wrench size is 16 mm (hex) or 8 mm (socket). The stress area A_s is 58.0 mm². Class 8.8 has a yield strength Rp0.2 = 800 × 0.8 = 640 N/mm². At 75% utilisation, the preload is 0.75 × 640 × 58.0 ≈ 27,840 N. With a nut factor K = 0.2, the tightening torque follows as T = 0.2 × 27,840 × 10 / 1000 ≈ 55.7 N·m.",
        },
      ],
      [
        { nl: "De moerfactor is een aanname, geen constante", en: "The nut factor is an assumption, not a constant" },
        {
          nl: "K ≈ 0,2 is de gangbare vuistregel voor niet-gesmeerde, zwart- of fosfaat-afgewerkte stalen bevestigers. Bij vet, MoS₂-coating of roestvast staal kan K dalen naar 0,10–0,20 — een lagere K bij hetzelfde moment betekent een hogere werkelijke voorspankracht, wat een bout kan overbelasten als je de tabel-K blijft gebruiken. Pas K aan zodra de oppervlaktebehandeling of smering bekend is, in plaats van standaard 0,2 aan te houden.",
          en: "K ≈ 0.2 is the common rule of thumb for unlubricated, black- or phosphate-finished steel fasteners. With grease, MoS₂ coating or stainless steel, K can drop to 0.10-0.20 — a lower K at the same torque means a higher actual preload, which can overload a bolt if you keep using the table K. Adjust K as soon as the surface treatment or lubrication is known, instead of defaulting to 0.2.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "De doorlaat-, sleutelmaat- en spanningsdoorsnedetabellen zijn normwaarden (ISO 273, ISO 4014/4017, ISO 4762/DIN 912, ISO 898-1). Het aandraaimoment is een vuistregelberekening — geen normverplichting — die geen rekening houdt met wrijvingsvariatie tussen bouten, hergebruik, dynamische belasting of een specifiek aandraaiprocedé (hoek-, momentbegrensd). Voor kritieke verbindingen: gebruik de daadwerkelijke K-factor van de gebruikte coating en verifieer met een momentsleutel.",
          en: "The clearance, wrench-size and stress-area tables are standard values (ISO 273, ISO 4014/4017, ISO 4762/DIN 912, ISO 898-1). The tightening torque is a rule-of-thumb calculation — not a standard requirement — that doesn't account for friction variation between bolts, reuse, dynamic loading or a specific tightening procedure (angle-controlled, torque-limited). For critical joints: use the actual K-factor of the coating used and verify with a torque wrench.",
        },
      ],
    ],
  },
  {
    slug: "motor-kiezen-van-last-naar-ieckw",
    basis: {
      nl: "Vereenvoudigd mechanica-model (F, n, T, P) voor een eerste dimensionering, fysica; IEC 60072-voorkeursreeks vermogens, norm. Geen volledige DIN 22101/FEM-methode voor bandtransporteurs en geen elektrisch/thermisch motormodel.",
      en: "Simplified mechanics model (F, n, T, P) for a first-pass sizing, physics; IEC 60072 preferred power series, standard. No full DIN 22101/FEM method for belt conveyors and no electrical/thermal motor model.",
    },
    category: "Aandrijftechniek",
    title: {
      nl: "Van last naar motor gaat via vier stappen, niet één formule.",
      en: "From load to motor takes four steps, not one formula.",
    },
    intro: {
      nl: "Kracht, toerental, koppel en vermogen volgen na elkaar uit de toepassing — en de motor die je uiteindelijk bestelt is nog een stap groter dan wat je berekent.",
      en: "Force, speed, torque and power follow one another from the application — and the motor you actually order is still a step larger than what you calculate.",
    },
    time: "6 min",
    tool: "motor-specification",
    question: {
      nl: "Een hijsinstallatie tilt 50 kg met 0,2 m/s aan een trommel van Ø200 mm, bij 85% rendement en 1,1 veiligheidsfactor. Welke IEC-motor hoort daarbij?",
      en: "A hoist lifts 50 kg at 0.2 m/s on a Ø200 mm drum, at 85% efficiency and a 1.1 safety factor. What IEC motor belongs to it?",
    },
    sections: [
      [
        { nl: "Vier stappen van toepassing naar vermogen", en: "Four steps from application to power" },
        {
          nl: "De benodigde kracht F volgt uit het type toepassing: bij hijsen alleen het gewicht (F = m·g), bij een rollenbaan of band alleen wrijving (F = μ·m·g), bij een hellingbaan zwaartekracht én wrijving samen (F = m·g·(sinθ + μ·cosθ)). Daarna volgt het toerental uit de omtreksnelheid en wieldiameter (n = v·60/(π·D)), het koppel uit T = F·D/2, en het asvermogen uit P = F·v/η. Dit is een vereenvoudigd model voor een eerste dimensionering — geen volledige DIN 22101/FEM-berekening voor bandtransporteurs, die ook versnelling en meerdere deelweerstanden meeneemt.",
          en: "The required force F follows from the application type: for hoisting, just the weight (F = m·g); for a roller or belt conveyor, just friction (F = μ·m·g); for an incline, gravity and friction together (F = m·g·(sinθ + μ·cosθ)). From there, speed follows from the surface speed and wheel diameter (n = v·60/(π·D)), torque from T = F·D/2, and shaft power from P = F·v/η. This is a simplified model for a first-pass sizing — not a full DIN 22101/FEM calculation for belt conveyors, which also accounts for acceleration and multiple partial resistances.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: hijsen, 50 kg bij 0,2 m/s", en: "Worked example: hoisting, 50 kg at 0.2 m/s" },
        {
          nl: "De kracht is F = 50 × 9,81 = 490,5 N. Met een trommel van Ø200 mm volgt n ≈ 19,1 omw/min en T = 490,5 × 0,1 = 49,05 N·m. Het asvermogen is P = 490,5 × 0,2 / 0,85 ≈ 115,4 W. Met een veiligheidsfactor van 1,1 wordt het ontwerpvermogen ≈ 127,0 W — en dat rondt de IEC 60072-reeks af naar boven, naar de eerstvolgende voorkeursmaat van 0,18 kW.",
          en: "The force is F = 50 × 9.81 = 490.5 N. With a Ø200 mm drum, n ≈ 19.1 rpm and T = 490.5 × 0.1 = 49.05 N·m follow. Shaft power is P = 490.5 × 0.2 / 0.85 ≈ 115.4 W. With a 1.1 safety factor, the design power becomes ≈ 127.0 W — and the IEC 60072 series rounds that up to the next preferred size, 0.18 kW.",
        },
      ],
      [
        { nl: "Twee marges, geen dubbele veiligheid", en: "Two margins, not double safety" },
        {
          nl: "De veiligheidsfactor (hier 1,1) en de afronding naar de IEC-reeks doen ander werk. De veiligheidsfactor dekt onzekerheid in de berekening en opstartcondities. De IEC-afronding is geen marge maar een catalogusbeperking: motoren bestaan alleen in vaste voorkeurmaten (IEC 60072), dus 127 W wordt altijd 180 W, nooit iets ertussenin. Samen geeft dat in dit voorbeeld 0,18/0,115 ≈ 57% marge boven het kale asvermogen — reken dat niet dubbel mee als extra veiligheid bovenop de 1,1-factor.",
          en: "The safety factor (here 1.1) and the rounding to the IEC series do different jobs. The safety factor covers uncertainty in the calculation and starting conditions. The IEC rounding isn't a margin but a catalogue constraint: motors only exist in fixed preferred sizes (IEC 60072), so 127 W always becomes 180 W, never something in between. Together that gives about 0.18/0.115 ≈ 57% margin above the bare shaft power in this example — don't count that twice as extra safety on top of the 1.1 factor.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Het model beschrijft een stationair mechanisch werkpunt met een enkele, vereenvoudigde weerstandsformule per toepassing. Versnelling, traagheid, elektrisch opgenomen vermogen, motor- en regelaarverliezen en de beschikbaarheid van een vermogen per polental/frame bij een specifieke fabrikant vallen erbuiten. Controleer bij bandtransporteurs de volledige DIN 22101/FEM-weerstanden en verifieer de uiteindelijke motorkeuze altijd tegen de fabrikantcatalogus.",
          en: "The model describes a steady-state mechanical operating point with a single, simplified resistance formula per application. Acceleration, inertia, electrical input power, motor and drive losses, and a specific manufacturer's power availability per pole count/frame fall outside it. For belt conveyors, check the full DIN 22101/FEM resistances, and always verify the final motor choice against the manufacturer's catalogue.",
        },
      ],
    ],
  },
  {
    slug: "doorbuiging-waar-zit-het-maximum",
    basis: {
      nl: "Euler-Bernoulli doorbuiging voor puntlast en gelijkmatig verdeelde last, vrij opgelegd en ingeklemd (uitkraging), fysica (Roark/Shigley). Kleine elastische vervorming, enkele last per berekening — geen combinatie van lasten, afschuifvervorming of dynamica.",
      en: "Euler-Bernoulli deflection for a point load and a uniformly distributed load, simply supported and cantilevered, physics (Roark/Shigley). Small elastic deformation, a single load per calculation — no combined loads, shear deformation or dynamics.",
    },
    category: "Machineframes",
    title: {
      nl: "De grootste doorbuiging zit niet altijd onder de last.",
      en: "The largest deflection isn't always under the load.",
    },
    intro: {
      nl: "Bij een last uit het midden ligt het werkelijke maximum ergens anders op de balk — en bij een uitkraging is de tip altijd erger dan de last zelf.",
      en: "With an off-centre load, the true maximum sits somewhere else on the beam — and on a cantilever, the tip always deflects more than the load point itself.",
    },
    time: "6 min",
    tool: "beam-deflection",
    question: {
      nl: "Een vrij opgelegde balk van 1.000 mm draagt een puntlast van 1.000 N op 200 mm vanaf de linker oplegging. Is de doorbuiging onder de last ook de maximale doorbuiging?",
      en: "A simply supported 1,000 mm beam carries a 1,000 N point load 200 mm from the left support. Is the deflection under the load also the maximum deflection?",
    },
    sections: [
      [
        { nl: "Onder de last is niet altijd het maximum", en: "Under the load isn't always the maximum" },
        {
          nl: "Voor een vrij opgelegde balk met puntlast F op afstand a van de linker oplegging (b = L − a) geldt de doorbuiging onder de last δ(a) = F·a²·b² / (3·E·I·L). Staat de last niet in het midden (a ≠ b), dan ligt de werkelijke maximale doorbuiging elders op de balk, dichter naar het midden toe vanaf de korte zijde. Alleen bij een gecentreerde last (a = b = L/2) vallen 'onder de last' en 'maximum' samen.",
          en: "For a simply supported beam with a point load F at distance a from the left support (b = L − a), the deflection under the load is δ(a) = F·a²·b² / (3·E·I·L). When the load isn't centred (a ≠ b), the true maximum deflection sits elsewhere on the beam, closer to midspan from the short side. Only with a centred load (a = b = L/2) do 'under the load' and 'maximum' coincide.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: last op 200 mm van 1.000 mm", en: "Worked example: load at 200 mm of 1,000 mm" },
        {
          nl: "Met F = 1.000 N, L = 1.000 mm, a = 200 mm, E = 210.000 N/mm² en I = 1.000.000 mm⁴ is de doorbuiging onder de last ≈ 0,0406 mm. De werkelijke maximale doorbuiging is groter: ≈ 0,0575 mm, op x ≈ 434,3 mm vanaf de oplegging het dichtst bij de last. Wie alleen 'onder de last' controleert, onderschat hier de doorbuiging met ongeveer 42%.",
          en: "With F = 1,000 N, L = 1,000 mm, a = 200 mm, E = 210,000 N/mm² and I = 1,000,000 mm⁴, the deflection under the load is ≈ 0.0406 mm. The true maximum deflection is larger: ≈ 0.0575 mm, at x ≈ 434.3 mm from the support nearest the load. Checking only 'under the load' here underestimates the deflection by about 42%.",
        },
      ],
      [
        { nl: "Een uitkraging maakt het verschil nog groter", en: "A cantilever makes the gap even bigger" },
        {
          nl: "Bij een uitkraging (ingeklemd bij x = 0) met een last F op afstand a van de inklemming draagt het stuk voorbij de last geen extra moment meer en blijft het recht onder de hoek die bij x = a is opgebouwd — de tip beweegt daardoor verder mee dan het punt onder de last zelf. Met F = 500 N, L = 800 mm, a = 300 mm, E = 210.000 N/mm² en I = 500.000 mm⁴ is de doorbuiging onder de last ≈ 0,0429 mm, maar bij de vrije tip ≈ 0,150 mm — 3,5 keer zoveel. Het maximummoment (bij de inklemming, M = F·a) blijft in beide gevallen hetzelfde; alleen de doorbuiging verschilt.",
          en: "On a cantilever (fixed at x = 0) with a load F at distance a from the fixed end, the segment beyond the load carries no further moment and stays straight at the slope reached at x = a — so the tip translates further than the point under the load itself. With F = 500 N, L = 800 mm, a = 300 mm, E = 210,000 N/mm² and I = 500,000 mm⁴, the deflection under the load is ≈ 0.0429 mm, but at the free tip ≈ 0.150 mm — 3.5 times as much. The maximum moment (at the fixed end, M = F·a) stays the same either way; only the deflection differs.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Het model rekent met kleine elastische vervorming volgens Euler-Bernoulli, één puntlast óf één gelijkmatig verdeelde last per berekening — niet gecombineerd. Afschuifvervorming, dynamica/trilling en niet-ideale opleggingen vallen erbuiten. Of een uitkomst acceptabel is, hangt af van de toepassing: de tool geeft generieke richtwaarden (L/180 tot L/750) als oriëntatie, geen vervanging van de toepasselijke norm (Eurocode 3, VDI 2230/machinerichtlijnen, FEM 1.001 voor kraanbanen).",
          en: "The model calculates small elastic deformation per Euler-Bernoulli, a single point load or a single uniformly distributed load per calculation — not combined. Shear deformation, dynamics/vibration and non-ideal supports fall outside it. Whether a result is acceptable depends on the application: the tool gives generic guideline ratios (L/180 to L/750) as orientation, not a replacement for the applicable standard (Eurocode 3, VDI 2230/machinery directives, FEM 1.001 for crane runways).",
        },
      ],
    ],
  },
  {
    slug: "h7g6-passing-verandert-met-de-diameter",
    basis: {
      nl: "ISO 286-1/-2 passingenstelsel: handmatig geverifieerde tabel 0–50 mm, formules (gevalideerd tegen die tabel) voor H/h/JS/js/G/g/F/f/D/d boven 50 mm. Overige klassen (j/k/m/n/p/s) blijven tabelgebonden tot 50 mm; enkele cellen bij >0–3 mm en de eerste band van H7/p6 zijn nog niet bevestigd.",
      en: "ISO 286-1/-2 fit system: hand-verified table for 0–50 mm, formulas (validated against that table) for H/h/JS/js/G/g/F/f/D/d above 50 mm. Other classes (j/k/m/n/p/s) stay table-bound up to 50 mm; a few cells at >0–3 mm and the first band of H7/p6 are still unconfirmed.",
    },
    category: "Toleranties & assemblage",
    title: {
      nl: "Een passingcode zegt pas iets zodra je de diameter kent.",
      en: "A fit code only means something once you know the diameter.",
    },
    intro: {
      nl: "H7/g6 is geen vaste speling in µm. Dezelfde code geeft bij elke diameterband een andere klemming of speling.",
      en: "H7/g6 isn't a fixed clearance in µm. The same code gives a different clearance or clamping at every diameter band.",
    },
    time: "5 min",
    tool: "fit-tolerances",
    question: {
      nl: "Een as en naaf krijgen de passing H7/g6 bij Ø25 mm. Hoeveel speling zit daar precies tussen?",
      en: "A shaft and hub get the H7/g6 fit at Ø25 mm. How much clearance is actually between them?",
    },
    sections: [
      [
        { nl: "Eén code, oneindig veel maten", en: "One code, infinitely many dimensions" },
        {
          nl: "Een ISO 286-passing bestaat uit twee delen: een boringsklasse (hoofdletter + kwaliteitsgetal, bv. H7) en een asklasse (kleine letter + kwaliteitsgetal, bv. g6). Beide klassen beschrijven een afwijking ten opzichte van de nominale maat, maar die afwijking is uitgedrukt in µm en hangt af van de diameterband waarin de maat valt — grotere diameters krijgen een breder tolerantieveld, ook bij dezelfde letter en hetzelfde kwaliteitsgetal. H7/g6 zegt dus iets over de vorm van de passing (hier: altijd speling, nooit klemming), maar de werkelijke speling in µm lees je pas af zodra je weet in welke band (bv. >18–≤30 mm) de nominale diameter valt.",
          en: "An ISO 286 fit has two parts: a hole class (capital letter + grade, e.g. H7) and a shaft class (lowercase letter + grade, e.g. g6). Both describe a deviation from the nominal size, but that deviation is expressed in µm and depends on the diameter band the size falls in — larger diameters get a wider tolerance field, even for the same letter and the same grade. So H7/g6 tells you the shape of the fit (here: always clearance, never clamping), but you only read off the actual clearance in µm once you know which band (e.g. >18–≤30 mm) the nominal diameter falls in.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: H7/g6 bij Ø25 mm", en: "Worked example: H7/g6 at Ø25 mm" },
        {
          nl: "Bij Ø25 mm valt de maat in de band >18–≤30 mm. Daar geeft H7 een boringsafwijking van ES = +21 µm, EI = 0 µm; g6 geeft een asafwijking van es = −7 µm, ei = −20 µm. De boring wordt dus 25,000 tot 25,021 mm, de as 24,980 tot 24,993 mm. De speling ligt daarmee tussen 7 µm (minimaal) en 41 µm (maximaal) — altijd speling, passend bij het gebruik als nauwkeurig glijdende centrumpassing.",
          en: "At Ø25 mm the size falls in the >18–≤30 mm band. There, H7 gives a hole deviation of ES = +21 µm, EI = 0 µm; g6 gives a shaft deviation of es = −7 µm, ei = −20 µm. The hole is therefore 25.000 to 25.021 mm, the shaft 24.980 to 24.993 mm. The clearance is between 7 µm (minimum) and 41 µm (maximum) — always clearance, matching its use as a precise sliding location fit.",
        },
      ],
      [
        { nl: "Reken de afwijking om naar een echte maat", en: "Convert the deviation to a real dimension" },
        {
          nl: "+21/0 µm is correct, maar is een extra rekenstap verwijderd van wat er op de tekening en op de machine gebeurt. Tel de afwijking op bij de nominale diameter en je krijgt de twee absolute grensmaten die daadwerkelijk verspaand worden: 25,000–25,021 mm voor de boring, 24,980–24,993 mm voor de as. Die absolute maten zijn wat een operator controleert, niet het afwijkingspaar zelf.",
          en: "+21/0 µm is correct, but it's one arithmetic step removed from what happens on the drawing and on the machine. Add the deviation to the nominal diameter and you get the two absolute limit dimensions actually machined: 25.000–25.021 mm for the hole, 24.980–24.993 mm for the shaft. Those absolute dimensions are what an operator checks, not the deviation pair itself.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "De tabel voor 0–50 mm is handmatig geverifieerd per klasse; buiten 50 mm rekent de tool met de ISO 286-1-formules, maar alleen voor de klassen H, h, JS, js, G, g, F, f, D en d — die zijn tegen de geverifieerde tabel gevalideerd. Klassen als j, k, m, n, p en s hebben geen bruikbare gesloten formule en blijven daarom beperkt tot 50 mm. Bij de kleinste band (>0–3 mm) ontbreken meerdere klassen nog volledig (de tool toont dan '—') omdat er geen bevestigde brontabel beschikbaar was; en de eerste band van H7/p6 staat gemarkeerd als betwist totdat een primaire ISO 286-2-tabel dat bevestigt of weerlegt. Controleer de tool-melding voor de gekozen combinatie.",
          en: "The 0–50 mm table is hand-verified per class; beyond 50 mm the tool uses the ISO 286-1 formulas, but only for classes H, h, JS, js, G, g, F, f, D and d — those were validated against the verified table. Classes like j, k, m, n, p and s have no usable closed-form formula and stay limited to 50 mm. At the smallest band (>0–3 mm), several classes are still entirely missing (the tool shows '—') because no confirmed source table was available, and the first band of H7/p6 is flagged as disputed until a primary ISO 286-2 table confirms or refutes it. Check the tool's own notice for the combination you chose.",
        },
      ],
    ],
  },
  {
    slug: "borgveer-twee-groeven-niet-een",
    basis: {
      nl: "DIN 471 (as) / DIN 472 (boring) workshoptabel met ISO 286-1 IT11-tolerantie voor de groefdiameter, norm + workshop-praktijk. Alleen d1 = 20 mm is onafhankelijk geverifieerd tegen een fabrikantendatasheet; overige maten zijn ongewijzigde pre-auditwaarden.",
      en: "DIN 471 (shaft) / DIN 472 (bore) workshop table with an ISO 286-1 IT11 tolerance on the groove diameter, standard + workshop practice. Only d1 = 20 mm is independently verified against a manufacturer datasheet; other sizes are unchanged pre-audit values.",
    },
    category: "Toleranties & assemblage",
    title: {
      nl: "Een borgveer heeft twee groeven, niet één.",
      en: "A circlip has two grooves, not one.",
    },
    intro: {
      nl: "Dezelfde as-diameter geeft een andere groef op een as dan in een boring — breedte, diameter en zelfs de tolerantieklasse verschillen per kant.",
      en: "The same shaft diameter gives a different groove on a shaft than in a bore — width, diameter and even the tolerance class differ per side.",
    },
    time: "5 min",
    tool: "seeger-grooves",
    question: {
      nl: "Een as van Ø20 mm krijgt een borgring aan de buitenkant en een naaf een borgring aan de binnenkant. Zijn dat dezelfde groefmaten?",
      en: "A Ø20 mm shaft gets an external retaining ring and a hub gets an internal one. Are those the same groove dimensions?",
    },
    sections: [
      [
        { nl: "DIN 471 (as) en DIN 472 (boring) zijn twee normen", en: "DIN 471 (shaft) and DIN 472 (bore) are two standards" },
        {
          nl: "Een uitwendige borgring (DIN 471) zit in een groef die in een as gedraaid is; een inwendige borgring (DIN 472) zit in een groef die in een boring gestoken is. Bij dezelfde nominale maat d1 zijn de groefdiameter d2, de groefbreedte b en de tolerantieklasse van d2 (h11 op de as, H11 in de boring) voor beide kanten apart vastgelegd — het zijn geen spiegelbeelden van elkaar. Tot een audit in september 2026 deelde de brontabel van deze tool één gemeenschappelijke breedtekolom voor beide kanten; bij Ø20 mm bleek dat mis: de externe groef (DSH-20) is 1,3 mm breed, de interne groef (DHO-20) 1,1 mm.",
          en: "An external retaining ring (DIN 471) sits in a groove turned into a shaft; an internal retaining ring (DIN 472) sits in a groove cut into a bore. At the same nominal size d1, the groove diameter d2, the groove width b, and the tolerance class of d2 (h11 on the shaft, H11 in the bore) are each specified separately for the two sides — they aren't mirror images of each other. Until a September 2026 audit, this tool's source table shared a single width column for both sides; at Ø20 mm that turned out to be wrong: the external groove (DSH-20) is 1.3 mm wide, the internal groove (DHO-20) 1.1 mm.",
        },
      ],
      [
        { nl: "Rekenvoorbeeld: Ø20 mm, het enige geverifieerde punt", en: "Worked example: Ø20 mm, the one verified point" },
        {
          nl: "Bij d1 = 20 mm geeft de externe groef (as) d2 = 19 mm (h11), b = 1,3 mm (H13) en een groefdiepte t = 0,5 mm. De interne groef (boring) geeft d2 = 21 mm (H11), b = 1,1 mm (H13) en dezelfde diepte t = 0,5 mm. Beide waarden zijn onafhankelijk gecontroleerd tegen een fabrikantendatasheet (Rotor Clip) — dit is de enige maat in de tabel waarvoor dat is gebeurd.",
          en: "At d1 = 20 mm, the external groove (shaft) gives d2 = 19 mm (h11), b = 1.3 mm (H13) and a groove depth t = 0.5 mm. The internal groove (bore) gives d2 = 21 mm (H11), b = 1.1 mm (H13) and the same depth t = 0.5 mm. Both values were independently checked against a manufacturer datasheet (Rotor Clip) — this is the only size in the table for which that has been done.",
        },
      ],
      [
        { nl: "De diepte volgt uit d1 en d2, plus een ISO-tolerantie", en: "Depth follows from d1 and d2, plus an ISO tolerance" },
        {
          nl: "De groefdiepte t is niet zelf getabelleerd: hij volgt uit t = |d1 − d2| / 2. Zelf krijgt d2 een ISO 286-1 IT11-tolerantie volgens de kant: h11 op de as (0 tot −0,13 mm) of H11 in de boring (0 tot +0,13 mm) — bij Ø19 en Ø21 mm is dat 0,13 mm breed. Op de afgeleide diepte t staat daarnaast een eigen, eenzijdige marge van de helft daarvan: +0,065 mm, mag dieper, niet ondieper. De groefbreedte b heeft een vaste tolerantieklasse H13, onafhankelijk van de maat. Zo blijft elke groef traceerbaar naar een formule of een norm, niet naar een los ingeschat getal.",
          en: "The groove depth t isn't tabulated on its own: it follows from t = |d1 − d2| / 2. d2 itself gets an ISO 286-1 IT11 tolerance keyed to the side: h11 on the shaft (0 to −0.13mm) or H11 in the bore (0 to +0.13mm) — for Ø19 and Ø21mm that's 0.13mm wide. The derived depth t then carries its own, one-sided margin of half that: +0.065mm, allowed to go deeper, not shallower. The groove width b has a fixed tolerance class H13, independent of size. That keeps every groove traceable to a formula or a standard, not a loosely estimated number.",
        },
      ],
      [
        { nl: "Aannames en toepassingsgrenzen", en: "Assumptions and applicability limits" },
        {
          nl: "Alleen d1 = 20 mm is voor beide kolommen onafhankelijk geverifieerd. Elke andere maat in de tabel draagt nog zijn ongewijzigde waarde van vóór de audit — niet herafgeleid, en dus met hetzelfde risico dat bij Ø20 mm al één keer een echte fout opleverde. Gebruik deze tool voor een eerste dimensionering, maar bevestig de gekozen maat altijd tegen DIN 471/472 of de catalogus van de ringfabrikant voordat die naar productie gaat.",
          en: "Only d1 = 20 mm has been independently verified for both columns. Every other size in the table still carries its unchanged pre-audit value — not re-derived, and so carrying the same risk that already produced a real error at Ø20 mm. Use this tool for a first-pass sizing, but always confirm the chosen size against DIN 471/472 or the ring manufacturer's catalogue before it goes to production.",
        },
      ],
    ],
  },
];
