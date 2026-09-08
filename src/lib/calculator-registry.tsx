import { DrivePowerCalc, TransmissionCalc } from "@/components/quick-drive";
import { lazy, type ComponentType } from "react";
const FitTolerancesCalc = lazy(() =>
  import("@/components/calculators/fit-tolerances-calc").then((m) => ({
    default: m.FitTolerancesCalc,
  })),
);
const KeywaysCalc = lazy(() =>
  import("@/components/calculators/keyways-calc").then((m) => ({ default: m.KeywaysCalc })),
);
const BucklingCalc = lazy(() =>
  import("@/components/calculators/buckling-calc").then((m) => ({ default: m.BucklingCalc })),
);
const UnitsCalc = lazy(() =>
  import("@/components/calculators/units-calc").then((m) => ({ default: m.UnitsCalc })),
);
const PneumaticCylinderCalc = lazy(() =>
  import("@/components/calculators/pneumatic-cylinder-calc").then((m) => ({
    default: m.PneumaticCylinderCalc,
  })),
);
const MotorSpecificationCalc = lazy(() =>
  import("@/components/calculators/motor-specification-calc").then((m) => ({
    default: m.MotorSpecificationCalc,
  })),
);
const BeamDeflectionCalc = lazy(() =>
  import("@/components/calculators/beam-deflection-calc").then((m) => ({
    default: m.BeamDeflectionCalc,
  })),
);
const EdgesCalc = lazy(() =>
  import("@/components/calculators/edges-calc").then((m) => ({ default: m.EdgesCalc })),
);
const Iso2768Calc = lazy(() =>
  import("@/components/calculators/iso2768-calc").then((m) => ({ default: m.Iso2768Calc })),
);
const BearingFitsCalc = lazy(() =>
  import("@/components/calculators/bearing-fits-calc").then((m) => ({
    default: m.BearingFitsCalc,
  })),
);
const SeegerGroovesCalc = lazy(() =>
  import("@/components/calculators/seeger-grooves-calc").then((m) => ({
    default: m.SeegerGroovesCalc,
  })),
);
const FastenersCalc = lazy(() =>
  import("@/components/calculators/fasteners-calc").then((m) => ({ default: m.FastenersCalc })),
);
const OringGroovesCalc = lazy(() =>
  import("@/components/calculators/o-ring-grooves-calc").then((m) => ({
    default: m.OringGroovesCalc,
  })),
);
const CadResourcesCalc = lazy(() =>
  import("@/components/calculators/cad-resources-calc").then((m) => ({
    default: m.CadResourcesCalc,
  })),
);
const MacrosCalc = lazy(() =>
  import("@/components/calculators/macros-calc").then((m) => ({ default: m.MacrosCalc })),
);

/** Maps a live tool's id (see lib/tools.ts) to its calculator component. */
export const CALCULATOR_REGISTRY: Record<string, ComponentType> = {
  "drive-power": DrivePowerCalc,
  transmission: TransmissionCalc,
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
