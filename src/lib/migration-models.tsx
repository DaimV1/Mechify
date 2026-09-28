import { lazy, type ComponentType } from "react";
const module = (loader: () => Promise<Record<string, unknown>>, name: string) =>
  lazy(async () => ({ default: (await loader())[name] as ComponentType }));
export const EXTRA_MODELS: Record<
  string,
  { label: string; original: string; note: string; component: ComponentType }
> = {
  "pneumatic-cylinder": {
    label: "Lastfactor & luchtverbruik",
    original: "Boring & knikcontrole",
    note: "Selectie op duwen of trekken, met lastfactor en slagvolume. De oorspronkelijke selectie zonder marge blijft beschikbaar.",
    component: module(() => import("@/components/toolkit/cylinder-calc"), "CylinderCalc"),
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
