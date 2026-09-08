export const articles = [
  {
    slug: "koppel-en-toerental",
    category: "Aandrijftechniek",
    title: "Meer koppel begint bij het juiste werkpunt.",
    intro:
      "Een motor kies je niet alleen op kilowatt. Toerental, belasting en transmissie bepalen samen wat er aan de machine beschikbaar is.",
    time: "6 min",
    tool: "koppel",
    question:
      "Een transportband vraagt 40 N·m bij 120 omw/min. Is een motor van 0,75 kW voldoende?",
    sections: [
      [
        "Begin bij de uitgaande as",
        "Leg eerst het belastingskoppel en het benodigde toerental aan de aangedreven as vast. In een stationair roterend systeem geldt P = T · ω, met ω = 2πn/60. Gebruik je P in kW, T in N·m en n in omw/min, dan volgt P = T · n / 9549,2966. Vermogen beschrijft het werk per tijdseenheid; koppel alleen vertelt niet hoe snel de machine dat werk uitvoert.",
      ],
      [
        "Van belasting naar motor",
        "Bij 40 N·m en 120 omw/min is het mechanische uitgangsvermogen circa 0,503 kW. Met een transmissierendement van 85% vraagt dit ongeveer 0,591 kW aan de motoras. Een motor van 0,75 kW lijkt stationair voldoende, maar die vergelijking beoordeelt nog niet het starten of versnellen. Controleer de koppel-toerentalkromme en de toegestane thermische belasting van de gekozen motor.",
      ],
      [
        "Versnellen is een aparte belasting",
        "Tijdens versnellen komt een inertiekoppel bij de procesbelasting. Voor een equivalente traagheid J aan de beschouwde as geldt T = J · α. Reken alle traagheden consequent om naar dezelfde as en gebruik het gewenste snelheidsprofiel. Wrijving, stilstandkoppel en cyclustijd kunnen het piekkoppel bepalen, ook als het gemiddelde vermogen laag blijft.",
      ],
      [
        "Aannames en ontwerpcontrole",
        "De calculator beschrijft een stationair mechanisch werkpunt en gebruikt positieve grootheden. Elektrisch opgenomen vermogen, motor- en regelaarverliezen, regeneratie, dynamiek en veiligheidsfuncties vallen buiten dit model. Controleer belastingsgevallen en fabrikantgegevens vóór componentselectie.",
      ],
    ],
  },
  {
    slug: "overbrenging-kiezen",
    category: "Aandrijftechniek",
    title: "Een overbrenging kiezen zonder verrassingen.",
    intro:
      "Minder toerental, meer koppel. Begrijp wat een verhouding doet en waar de verliezen terechtkomen.",
    time: "5 min",
    tool: "overbrenging",
    question: "Wat levert een motor met 8 N·m bij 1.500 omw/min na een reductie van 10:1?",
    sections: [
      [
        "Definieer de verhouding vooraf",
        "Mechify gebruikt i = n₁ / n₂. Een waarde groter dan 1 is een reductie; een waarde tussen 0 en 1 verhoogt het toerental. Het uitgangstoerental is n₂ = n₁ / i. Deze expliciete definitie voorkomt verwarring wanneer catalogi de verhouding in een andere volgorde weergeven.",
      ],
      [
        "Koppel met rendement",
        "Het ideale uitgaande koppel is T₁ · i. Voor een aandrijvende motor met rendement η gebruiken we T₂ = T₁ · i · η. Met 1.500 omw/min, 8 N·m, i = 10 en η = 0,92 krijg je 150 omw/min en 73,6 N·m. De invoer levert circa 1,257 kW; de uitvoer circa 1,156 kW. Het verschil gaat in dit eenvoudige model verloren.",
      ],
      [
        "Controleer méér dan de verhouding",
        "Bekijk het nominale en piekkoppel, speling, torsiestijfheid en toegestane radiale en axiale asbelasting. Een poelie ver buiten het lager kan een toelaatbare asbelasting overschrijden terwijl het koppel prima past. Beoordeel ook smering, montagepositie en warmteafvoer voor de werkelijke cyclus.",
      ],
      [
        "Aannames en toepassingsgrenzen",
        "Dit model veronderstelt een vaste verhouding, een constante efficiëntie en energiestroom van ingang naar uitgang. Werkelijke efficiëntie varieert met belasting en toerental. Terugaandrijven, zelfremming, startwrijving en dynamische pieken worden niet berekend.",
      ],
    ],
  },
  {
    slug: "pneumatische-cilinder",
    category: "Pneumatiek",
    title: "Cilinderkracht: de stang maakt het verschil.",
    intro:
      "Dezelfde druk geeft bij uitschuiven en inschuiven een andere kracht. Reken met het effectieve oppervlak.",
    time: "5 min",
    tool: "cilinder",
    question:
      "Hoeveel duw- en trekkracht levert een cilinder van Ø50 mm met een stang van Ø20 mm bij 6 bar?",
    sections: [
      [
        "Werk met drukverschil",
        "De basiskracht is F = p · A. Bij uitschuiven werkt de druk op het volledige zuigeroppervlak. Bij inschuiven neemt de stang een deel van dat oppervlak in. Reken bar om naar N/mm²: 1 bar = 0,1 N/mm². De calculator gebruikt overdruk en veronderstelt atmosferische druk aan de ontluchtende zijde.",
      ],
      [
        "Rekenvoorbeeld Ø50 / Ø20",
        "Het volledige oppervlak is π · 50² / 4 = 1.963,50 mm². De ringoppervlakte is π · (50² − 20²) / 4 = 1.649,34 mm². Bij 6 bar zijn de theoretische krachten 1.178,10 N uitgaand en 989,60 N ingaand. Met een aangenomen krachtfactor van 90% worden dit 1.060,29 N en 890,64 N.",
      ],
      [
        "Kracht is nog geen cilinderselectie",
        "Gebruik de druk bij de cilinder tijdens beweging, niet alleen de ingestelde voedingsdruk. Leidingen, ventielen en tegendruk beïnvloeden het werkpunt. De krachtfactor is een vereenvoudigde aftrek voor verliezen, geen universele fabrikantwaarde. Een lange stang vraagt daarnaast een knikcontrole; zijdelingse belasting vraagt vaak een afzonderlijke geleiding.",
      ],
      [
        "Aannames en toepassingsgrenzen",
        "Het model berekent statische axiale kracht. Snelheid, luchtverbruik, demping, knik, versnelling en stopgedrag zijn niet inbegrepen. Voor een verticale last moet ook het gewicht en het vereiste gedrag bij drukverlies afzonderlijk worden beoordeeld.",
      ],
    ],
    source: [
      "Festo — Cylinder sizing by piston force",
      "https://www.festo.com/net/supportportal/files/10203/actuators",
    ],
  },
  {
    slug: "lineaire-geleiding",
    category: "Lineaire beweging",
    title: "Een geleiding draagt meer dan alleen gewicht.",
    intro:
      "De plaats van de last is net zo belangrijk als de grootte. Maak momenten zichtbaar voordat je een geleiding selecteert.",
    time: "6 min",
    tool: "converter",
    question:
      "Een last van 20 kg staat 150 mm buiten de geleiding. Wat betekent dit voor de lagerblokken?",
    sections: [
      [
        "Teken eerst het vrije lichaam",
        "Teken de krachten, hun aangrijpingspunten en de reactierichtingen. Kies een duidelijk assenstelsel. Een last buiten het steunvlak veroorzaakt een moment; een lagerblok wordt daardoor niet alleen met een verticale kracht belast. Denk ook aan acceleratie, kabelrupsweerstand en externe proceskrachten.",
      ],
      [
        "Maak het moment concreet",
        "Met g = 9,81 m/s² geeft 20 kg een gewicht van 196,2 N. Op 0,15 m afstand ontstaat een moment van 29,43 N·m. In een vereenvoudigd vlak model met twee steunpunten op 0,20 m afstand leidt dit moment tot een extra krachtpaar van 147,15 N. Tel deze bijdrage met het juiste teken op bij de directe lastverdeling.",
      ],
      [
        "Stijfheid en montage horen bij de keuze",
        "De echte lastverdeling hangt af van blokafstand, railafstand, voorspanning en stijfheid van het frame. Een stijve geleiding op een slappe montageplaat maakt het systeem niet stijf. Voorzie bereikbare montagevlakken en bepaal hoe je de paralleliteit instelt zonder het systeem op te spannen.",
      ],
      [
        "Aannames en toepassingsgrenzen",
        "Het voorbeeld is een statisch vlak evenwichtsmodel. Het is geen levensduur- of draaggetalberekening. Gebruik voor de uiteindelijke selectie het belastingsmodel, de equivalente belasting en montagevoorschriften van de gekozen fabrikant.",
      ],
    ],
  },
  {
    slug: "frame-en-maakbaarheid",
    category: "Machineframes",
    title: "Een goed frame begint bij de krachtweg.",
    intro: "Een frame moet belastingen voorspelbaar afvoeren én praktisch te bouwen zijn.",
    time: "5 min",
    tool: "converter",
    question: "Een robotmodule trilt na een versnelling. Moet het frame simpelweg zwaarder worden?",
    sections: [
      [
        "Volg de kracht naar de vloer",
        "Teken de route van de proceskracht via bevestiging, liggers en verbindingen naar de voetpunten. Lange uitkragingen en slappe boutverbindingen kunnen de vervorming domineren. Meer massa toevoegen lost een ongunstige krachtweg niet automatisch op. Vergroot waar nodig de effectieve doorsnedehoogte, verkort vrije lengtes en plaats verbindingen dicht bij de belasting.",
      ],
      [
        "Een bruikbaar eerste model",
        "Voor een eenvoudige ingeklemde balk met puntlast aan het vrije eind geldt δ = F · L³ / (3 · E · I). De derde macht van L laat zien waarom een kortere uitkraging sterk helpt. Halveren van de vrije lengte geeft in dit ideale model een achtste van de doorbuiging, bij gelijk materiaal, doorsnede en kracht.",
      ],
      [
        "Ontwerp ook de fabricagestappen",
        "Bij een gelast frame kunnen vervormingen tijdens lassen ontstaan. Bepaal vooraf welke vlakken na het lassen worden nabewerkt, waar opspanning mogelijk is en hoe de constructie bereikbaar blijft. Breng kritieke montagevlakken en functionele referenties samen in de tekening.",
      ],
      [
        "Aannames en toepassingsgrenzen",
        "Het balkmodel geldt voor kleine elastische vervorming onder de aangegeven ideale ondersteuning. Verbindingen, lokale vervorming en dynamische resonantie zijn niet inbegrepen. Bij trillingsproblemen moeten excitatie, eigenfrequenties en demping samen worden onderzocht.",
      ],
    ],
  },
  {
    slug: "toleranties-en-assemblage",
    category: "Toleranties & assemblage",
    title: "Toleranties die de montage helpen.",
    intro: "Specificeer nauwkeurigheid waar de functie die nodig heeft. Geef de rest ruimte.",
    time: "6 min",
    tool: "converter",
    question:
      "Drie onderdelen moeten samen een vrije ruimte behouden. Hoe voorkom je dat de tolerantiestapel die ruimte opeet?",
    sections: [
      [
        "Begin bij de functionele maat",
        "Bepaal eerst wat moet passen, bewegen of afdichten. Kies referentievlakken die aansluiten bij de werking en de meetmethode. Vermijd een keten van maten wanneer één gemeenschappelijke referentie de functie direct kan vastleggen. Een mooi nominale CAD-assembly bewijst niet dat alle geproduceerde onderdelen passen.",
      ],
      [
        "Een eenvoudige worst-case stapel",
        "Stel dat een opening 30 ±0,10 mm is en een onderdeel 29,5 ±0,15 mm. De nominale speling is 0,50 mm. De kleinste speling is 29,90 − 29,65 = 0,25 mm; de grootste 30,10 − 29,35 = 0,75 mm. Voeg je vulringen, coatings of extra onderdelen toe, neem hun bijdragen expliciet op in de keten.",
      ],
      [
        "Maak assemblage en onderhoud bereikbaar",
        "Voorzie invoerafschuiningen, ruimte voor gereedschap en een haalbare montagevolgorde. Bepaal welke onderdelen positioneren en welke alleen klemmen. Controleer of een slijtagedeel vervangen kan worden zonder de complete machine uit te lijnen. Een exploded view helpt om deze volgorde bespreekbaar te maken.",
      ],
      [
        "Aannames en toepassingsgrenzen",
        "Het voorbeeld gebruikt een lineaire worst-case som van maatgrenzen. Vorm, ligging, temperatuur en vervorming zijn niet opgenomen. Kies geen passing uitsluitend op een algemene tabel: belasting, materiaal, montage en fabrikantgegevens bepalen wat passend is. Er wordt hier geen normconformiteit geclaimd.",
      ],
    ],
  },
  {
    slug: "parametrisch-ontwerpen",
    category: "CAD-workflows",
    title: "Modelleer de bedoeling, niet alleen de vorm.",
    intro:
      "Een betrouwbaar parametrisch model verandert voorspelbaar wanneer een ontwerpmaat wijzigt.",
    time: "5 min",
    tool: "converter",
    question:
      "Een montageplaat bestaat in drie breedtes. Hoe voorkom je drie afzonderlijke, uit elkaar groeiende modellen?",
    sections: [
      [
        "Leg de ontwerpregels vast",
        "Maak onderscheid tussen vrije keuzes en afgeleide maten. Een plaatbreedte is bijvoorbeeld vrij; de randafstand van een gatenpatroon kan een vaste regel zijn. Geef parameters betekenisvolle namen en beperk afhankelijkheden van toevallige randen of vlakken die bij een wijziging verdwijnen.",
      ],
      [
        "Test de uitersten",
        "Neem een plaat met breedtes 120, 180 en 240 mm en een vaste gat-randafstand van 20 mm. Laat de afstand tussen de gaten volgen uit breedte minus 40 mm. Test de kleinste en grootste variant op randafstand, overlap en ruimte voor boutkoppen. Een geslaagde herberekening controleert alleen het model, niet de maakbaarheid.",
      ],
      [
        "Van principe naar CAD",
        "In SolidWorks kunnen configuraties varianten binnen een document organiseren. Leg vast welke maten en eigenschappen per configuratie variëren. In Inventor kun je benoemde parameters gebruiken om maatrelaties expliciet te maken. Documenteer in beide gevallen artikelnummer, materiaal en revisie zodat een modelvariant niet wordt verward met een vrijgegeven product.",
      ],
      [
        "Aannames en toepassingsgrenzen",
        "Dit is een modelleerstrategie, geen directe softwarekoppeling. Menunamen en beschikbare functies verschillen per versie en licentie. Verifieer tekeningen en stuklijsten na elke variantwijziging; een correct 3D-model garandeert niet dat afgeleide documenten actueel zijn.",
      ],
    ],
    source: [
      "SolidWorks — Configurations",
      "https://help.solidworks.com/2024/English/solidworks/sldworks/c_Configurations_Overview.htm",
    ],
  },
];
