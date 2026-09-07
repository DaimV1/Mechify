import type { ComponentType } from "react";
import { FitTolerancesCalc } from "@/components/calculators/fit-tolerances-calc";
import { KeywaysCalc } from "@/components/calculators/keyways-calc";
import { BucklingCalc } from "@/components/calculators/buckling-calc";

/** Maps a live tool's id (see lib/tools.ts) to its calculator component. */
export const CALCULATOR_REGISTRY: Record<string, ComponentType> = {
  "fit-tolerances": FitTolerancesCalc,
  keyways: KeywaysCalc,
  buckling: BucklingCalc,
};
