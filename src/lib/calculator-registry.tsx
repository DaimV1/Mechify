import type { ComponentType } from "react";
import { FitTolerancesCalc } from "@/components/calculators/fit-tolerances-calc";
import { KeywaysCalc } from "@/components/calculators/keyways-calc";
import { BucklingCalc } from "@/components/calculators/buckling-calc";
import { UnitsCalc } from "@/components/calculators/units-calc";
import { PneumaticCylinderCalc } from "@/components/calculators/pneumatic-cylinder-calc";
import { MotorSpecificationCalc } from "@/components/calculators/motor-specification-calc";
import { BeamDeflectionCalc } from "@/components/calculators/beam-deflection-calc";
import { EdgesCalc } from "@/components/calculators/edges-calc";
import { Iso2768Calc } from "@/components/calculators/iso2768-calc";
import { BearingFitsCalc } from "@/components/calculators/bearing-fits-calc";
import { SeegerGroovesCalc } from "@/components/calculators/seeger-grooves-calc";
import { FastenersCalc } from "@/components/calculators/fasteners-calc";
import { OringGroovesCalc } from "@/components/calculators/o-ring-grooves-calc";
import { CadResourcesCalc } from "@/components/calculators/cad-resources-calc";
import { MacrosCalc } from "@/components/calculators/macros-calc";

/** Maps a live tool's id (see lib/tools.ts) to its calculator component. */
export const CALCULATOR_REGISTRY: Record<string, ComponentType> = {
  "fit-tolerances": FitTolerancesCalc,
  keyways: KeywaysCalc,
  buckling: BucklingCalc,
  units: UnitsCalc,
  "pneumatic-cylinder": PneumaticCylinderCalc,
  "motor-specification": MotorSpecificationCalc,
  "beam-deflection": BeamDeflectionCalc,
  edges: EdgesCalc,
  "iso-2768": Iso2768Calc,
  "bearing-fits": BearingFitsCalc,
  "seeger-grooves": SeegerGroovesCalc,
  fasteners: FastenersCalc,
  "o-ring-grooves": OringGroovesCalc,
  "cad-resources": CadResourcesCalc,
  macros: MacrosCalc,
};
