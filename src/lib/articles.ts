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
];
