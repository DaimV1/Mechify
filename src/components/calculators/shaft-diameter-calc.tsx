import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  shaftDiameterForTorque,
  shaftSafetyStatus,
  shaftTorsionStress,
} from "@/lib/calculators/shaft";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  NumInput,
  parseNum,
  ResultGrid,
} from "@/components/calculators/calc-ui";
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";

const SHAFT_META: EngineeringSourceMeta = {
  basisType: "physics",
  reference: "τ = 16T/(πd³) — solid round shaft in pure torsion (Roark / Shigley)",
  status: "current",
  checkedDate: "2026-09-22",
  validityRange: {
    nl: "Massieve ronde as, zuivere torsie",
    en: "Solid round shaft, pure torsion",
  },
  assumptions: {
    nl: "Alleen torsiespanning uit een gegeven koppel. Buiging, axiale last en dwarskracht van een tandwiel/poelie/kettingwiel zitten er niet in — bij de meeste assen is dat wél de maatgevende belasting, niet zuivere torsie alleen. Ook geen spanningsconcentratie bij spiebanen/schouders/gaten, geen vermoeiing en geen stijfheid (torsiehoek, doorbuiging, kritisch toerental). De 1,0/1,2-veiligheidsband is een Mechify-screeningscriterium, geen vaste normwaarde.",
    en: "Torsional stress from a given torque only. Bending, axial load and transverse shear from a gear/pulley/sprocket are not included — for most shafts that combined loading governs, not pure torsion alone. Also no stress concentration at keyways/shoulders/holes, no fatigue, and no stiffness (twist angle, deflection, critical speed). The 1.0/1.2 safety band is a Mechify screening threshold, not a fixed code value.",
  },
  verification: {
    nl: "Voor een as die ook buiging of dwarskracht draagt: gebruik een combinatiespanning (bijv. von Mises) en een vermoeiingscontrole, niet deze tool alleen.",
    en: "For a shaft that also carries bending or transverse shear: use a combined-stress check (e.g. von Mises) and a fatigue check, not this tool alone.",
  },
};

const T = {
  nl: {
    heading: "Asdiameter bij torsie",
    intro:
      "Minimale diameter van een massieve ronde as die de torsiespanning τ = 16T/(πd³) onder een toelaatbare schuifspanning houdt. Controleer optioneel ook een gekozen diameter.",
    inputSection: "Koppel en materiaal",
    torque: "Koppel T (N·m)",
    tauAllow: "Toelaatbare schuifspanning τ_toel (N/mm²)",
    resultsSection: "Resultaat",
    resultDiameter: "Minimale diameter d_min",
    checkSection: "Controleer een gekozen diameter (optioneel)",
    checkDiameter: "Gekozen diameter d (mm)",
    resultStress: "Torsiespanning τ bij d",
    resultSF: "Veiligheid tegen vloeien S_F",
    sfFail: "S_F < 1,0 — de as vloeit bij dit koppel op deze diameter.",
    sfCaution: "S_F tussen 1,0 en 1,2 — krap, controleer de belastingsaannames.",
    sfOk: "S_F ≥ 1,2 — voldoende marge tegen vloeien (zuivere torsie).",
    fill: "Vul koppel en toelaatbare schuifspanning in (beide groter dan 0).",
    copy: (torque: string, tau: string, dmin: string) =>
      `T=${torque} N·m, τ_toel=${tau} N/mm²: d_min = ${dmin} mm`,
    copyCheck: (d: string, stress: string, sf: string) =>
      `Bij d=${d} mm: τ = ${stress} N/mm², S_F = ${sf}`,
  },
  en: {
    heading: "Shaft diameter under torsion",
    intro:
      "Minimum diameter of a solid round shaft that keeps the torsional stress τ = 16T/(πd³) at or below an allowable shear stress. Optionally check a chosen diameter too.",
    inputSection: "Torque and material",
    torque: "Torque T (N·m)",
    tauAllow: "Allowable shear stress τ_allow (N/mm²)",
    resultsSection: "Result",
    resultDiameter: "Minimum diameter d_min",
    checkSection: "Check a chosen diameter (optional)",
    checkDiameter: "Chosen diameter d (mm)",
    resultStress: "Torsional stress τ at d",
    resultSF: "Static safety against yield S_F",
    sfFail: "S_F < 1.0 — the shaft yields under this torque at this diameter.",
    sfCaution: "S_F between 1.0 and 1.2 — tight, check the load assumptions.",
    sfOk: "S_F ≥ 1.2 — adequate margin against yielding (pure torsion).",
    fill: "Enter torque and allowable shear stress (both greater than 0).",
    copy: (torque: string, tau: string, dmin: string) =>
      `T=${torque} N.m, tau_allow=${tau} N/mm^2: d_min = ${dmin} mm`,
    copyCheck: (d: string, stress: string, sf: string) =>
      `At d=${d} mm: tau = ${stress} N/mm^2, S_F = ${sf}`,
  },
};

function fmt(n: number, digits = 2): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: digits });
}

export function ShaftDiameterCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [torque, setTorque] = useState(search.get("t") ?? "50");
  const [tauAllow, setTauAllow] = useState(search.get("tau") ?? "40");
  const [dCheck, setDCheck] = useState(search.get("d") ?? "");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    set("t", torque);
    set("tau", tauAllow);
    set("d", dCheck);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torque, tauAllow, dCheck]);

  const torqueVal = parseNum(torque);
  const tauVal = parseNum(tauAllow);
  const dCheckVal = parseNum(dCheck);

  const dMin =
    torqueVal != null && tauVal != null ? shaftDiameterForTorque(torqueVal, tauVal) : null;

  const checkStress =
    torqueVal != null && dCheckVal != null && dCheckVal > 0
      ? shaftTorsionStress(torqueVal, dCheckVal)
      : null;
  const checkSF = checkStress != null && tauVal != null ? tauVal / checkStress : null;
  const checkStatus = checkSF != null ? shaftSafetyStatus(checkSF) : null;

  const copy = useMemo(() => {
    if (dMin == null) return "";
    const lines = [t.copy(torque, tauAllow, fmt(dMin)), metaCopyLine(SHAFT_META, locale)];
    if (checkStress != null && checkSF != null) {
      lines.splice(1, 0, t.copyCheck(dCheck, fmt(checkStress, 1), fmt(checkSF)));
    }
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dMin, torque, tauAllow, dCheck, checkStress, checkSF, locale]);

  return (
    <CalcPanel>
      <CalcEyebrow />
      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
        {t.heading}
      </h2>
      <Note>{t.intro}</Note>
      <SourceMetaBadge meta={SHAFT_META} />

      <h3 className="mt-6 font-display text-base font-semibold text-ink">{t.inputSection}</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Field label={t.torque}>
          <NumInput id="shaft-torque" value={torque} onChange={setTorque} />
        </Field>
        <Field label={t.tauAllow}>
          <NumInput id="shaft-tau-allow" value={tauAllow} onChange={setTauAllow} />
        </Field>
      </div>

      <h3 className="mt-8 font-display text-base font-semibold text-ink">{t.resultsSection}</h3>
      {dMin == null ? (
        <p className="mt-5 text-sm text-muted">{t.fill}</p>
      ) : (
        <ResultGrid items={[{ label: t.resultDiameter, value: `${fmt(dMin)} mm` }]} />
      )}

      <h3 className="mt-8 font-display text-base font-semibold text-ink">{t.checkSection}</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Field label={t.checkDiameter}>
          <NumInput id="shaft-d-check" value={dCheck} onChange={setDCheck} />
        </Field>
      </div>
      {checkStress != null && checkSF != null ? (
        <>
          <ResultGrid
            items={[
              { label: t.resultStress, value: `${fmt(checkStress, 1)} N/mm²` },
              { label: t.resultSF, value: fmt(checkSF) },
            ]}
          />
          <p
            className={`mt-3 text-sm font-medium ${
              checkStatus === "fail"
                ? "text-danger"
                : checkStatus === "caution"
                  ? "text-warning"
                  : "text-success"
            }`}
          >
            {checkStatus === "fail" ? t.sfFail : checkStatus === "caution" ? t.sfCaution : t.sfOk}
          </p>
        </>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <CopyResult text={copy} />
        <CopyLink />
      </div>
    </CalcPanel>
  );
}
