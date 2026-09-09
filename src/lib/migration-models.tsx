import { lazy, type ComponentType } from "react";
const module = (loader: () => Promise<Record<string, unknown>>, name: string) =>
  lazy(async () => ({ default: (await loader())[name] as ComponentType }));
export const EXTRA_MODELS: Record<
  string,
  { label: string; original: string; note: string; component: ComponentType }
> = {
  "seeger-grooves": {
    label: "Groeftabel",
    original: "Ontwerpschatting",
    note: "Vaste referentietabel uit de oorspronkelijke toolkit; de ontwerpschatting blijft afzonderlijk beschikbaar. Gebruik fabrikantgegevens voor vrijgave.",
    component: module(() => import("@/components/toolkit/seeger-calc"), "SeegerCalc"),
  },
  fasteners: {
    label: "Tabel & wrijving",
    original: "Instelbare moerfactor",
    note: "De tabelmethode en de K-factorbenadering gebruiken verschillende aannames voor wrijving en voorspanning. Hun momenten zijn niet onderling uitwisselbaar.",
    component: module(() => import("@/components/toolkit/fastener-calc"), "FastenerCalc"),
  },
  "o-ring-grooves": {
    label: "Groeftabel",
    original: "Instelbare compressie",
    note: "De tabel levert vaste groefmaten; het vrije ontwerpmodel berekent maten uit compressie en breedtefactor.",
    component: module(() => import("@/components/toolkit/oring-calc"), "OringCalc"),
  },
  edges: {
    label: "Kantpersrichtlijnen",
    original: "Vrije buigberekening",
    note: "247TailorSteel-richtlijnen met eigen tabellen voor materiaal en haaks/scherp kanten. Geen algemene ISO/DIN-rekenmethode.",
    component: module(() => import("@/components/toolkit/kanten-calc"), "KantenCalc"),
  },
  "motor-specification": {
    label: "Inclusief versnelling",
    original: "Stationair werkpunt",
    note: "Uitgebreide dimensionering met acceleratie en rollenmassa. Standaardwaarden en marge verschillen van het stationaire model.",
    component: module(() => import("@/components/toolkit/motor-calc"), "MotorCalc"),
  },
  "pneumatic-cylinder": {
    label: "Lastfactor & luchtverbruik",
    original: "Boring & knikcontrole",
    note: "Selectie op duwen of trekken, met lastfactor en slagvolume. De oorspronkelijke selectie zonder marge blijft beschikbaar.",
    component: module(() => import("@/components/toolkit/cylinder-calc"), "CylinderCalc"),
  },
  "beam-deflection": {
    label: "Maximale doorbuiging & spanning",
    original: "Doorbuiging & moment",
    note: "Toont ook de positie van maximale doorbuiging. Bij een excentrische puntlast ligt het maximum niet noodzakelijk onder de last.",
    component: module(() => import("@/components/toolkit/deflection-calc"), "DeflectionCalc"),
  },
  units: {
    label: "Tweerichtingsconversie",
    original: "Directe conversie",
    note: "Conversie vanuit beide invoervelden, met de aanvullende eenheden uit de oorspronkelijke toolkit.",
    component: module(() => import("@/components/toolkit/eenheden-calc"), "EenhedenCalc"),
  },
};
export const SOURCE_KEYS: Record<string, string> = {
  "fit-tolerances": "passingen",
  "iso-2768": "iso2768",
  keyways: "spiebaan",
  "bearing-fits": "lager",
  "seeger-grooves": "seeger",
  fasteners: "bevestigers",
  "o-ring-grooves": "oring",
  edges: "kanten",
  units: "eenheden",
  "motor-specification": "motor",
  "pneumatic-cylinder": "cilinder",
  buckling: "knik",
  "beam-deflection": "doorbuiging",
  "cad-resources": "bronnen",
  macros: "macros",
};
