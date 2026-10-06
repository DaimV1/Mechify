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
  Note,
  ValidatedNumField,
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
    nl: "Alleen torsiespanning uit een gegeven koppel. Buiging, axiale last en dwarskracht van een tandwiel/poelie/kettingwiel zitten er niet in — bij de meeste assen is dat wél de maatgevende belasting, niet zuivere torsie alleen. Ook geen spanningsconcentratie bij spiebanen/schouders/gaten, geen vermoeiing en geen stijfheid (torsiehoek, doorbuiging, kritisch toerental). De 1,0/1,2-reserveband is een Mechify-screeningscriterium, geen vaste normwaarde.",
    en: "Torsional stress from a given torque only. Bending, axial load and transverse shear from a gear/pulley/sprocket are not included — for most shafts that combined loading governs, not pure torsion alone. Also no stress concentration at keyways/shoulders/holes, no fatigue, and no stiffness (twist angle, deflection, critical speed). The 1.0/1.2 reserve band is a Mechify screening threshold, not a fixed code value.",
  },
  verification: {
    nl: "Voor een as die ook buiging of dwarskracht draagt: gebruik een combinatiespanning (bijv. von Mises) en een vermoeiingscontrole, niet deze tool alleen.",
    en: "For a shaft that also carries bending or transverse shear: use a combined-stress check (e.g. von Mises) and a fatigue check, not this tool alone.",
  },
};

const T = {
  nl: {
    heading: "Asdiameter bij torsie",
    intro: "Minimale as-Ø die τ = 16T/(πd³) onder een toelaatbare schuifspanning houdt.",
    inputSection: "Koppel en materiaal",
    torque: "Koppel T (N·m)",
    tauAllow: "Toelaatbare schuifspanning τ_toel (N/mm²)",
    resultsSection: "Resultaat",
    resultDiameter: "Minimale diameter d_min",
    checkSection: "Controleer een gekozen diameter (optioneel)",
    checkDiameter: "Gekozen diameter d (mm)",
    resultStress: "Torsiespanning τ bij d",
    resultSF: "Reserve t.o.v. ingevoerde toelaatbare spanning R",
    sfFail: "R < 1,0 — de berekende spanning overschrijdt de ingevoerde toelaatbare spanning.",
    sfCaution: "R tussen 1,0 en 1,2 — beperkte reserve; controleer de belastingsaannames.",
    sfOk: "R ≥ 1,2 — reserve ten opzichte van de ingevoerde toelaatbare spanning volgens het Mechify-screeningscriterium.",
    reserveHelp:
      "R = τ_toel/τ. Dit is geen veiligheidsfactor tegen vloeien; de toelaatbare spanning kan al een veiligheidsfactor bevatten.",
    copyUnavailable:
      "Geen resultaat om te kopiëren: vul een geldig positief koppel en een geldige positieve toelaatbare spanning in.",
    positiveError: "Vul een getal groter dan 0 in.",
    fill: "Vul koppel en toelaatbare schuifspanning in (beide groter dan 0).",
    copy: (torque: string, tau: string, dmin: string) =>
      `T=${torque} N·m, τ_toel=${tau} N/mm²: d_min = ${dmin} mm`,
    copyCheck: (d: string, stress: string, sf: string) =>
      `Bij d=${d} mm: τ = ${stress} N/mm², R = ${sf}`,
  },
  en: {
    heading: "Shaft diameter under torsion",
    intro: "Minimum shaft Ø that keeps τ = 16T/(πd³) at or below an allowable shear stress.",
    inputSection: "Torque and material",
    torque: "Torque T (N·m)",
    tauAllow: "Allowable shear stress τ_allow (N/mm²)",
    resultsSection: "Result",
    resultDiameter: "Minimum diameter d_min",
    checkSection: "Check a chosen diameter (optional)",
    checkDiameter: "Chosen diameter d (mm)",
    resultStress: "Torsional stress τ at d",
    resultSF: "Reserve against entered allowable stress R",
    sfFail: "R < 1.0 — calculated stress exceeds the entered allowable stress.",
    sfCaution: "R between 1.0 and 1.2 — limited reserve; check the load assumptions.",
    sfOk: "R ≥ 1.2 — reserve against the entered allowable stress meets the Mechify screening threshold.",
    reserveHelp:
      "R = τ_allow/τ. This is not a safety factor against yield; the allowable stress may already include a safety factor.",
    copyUnavailable: "No result to copy: enter a valid positive torque and allowable stress.",
    positiveError: "Enter a number greater than 0.",
    fill: "Enter torque and allowable shear stress (both greater than 0).",
    copy: (torque: string, tau: string, dmin: string) =>
      `T=${torque} N.m, tau_allow=${tau} N/mm^2: d_min = ${dmin} mm`,
    copyCheck: (d: string, stress: string, sf: string) =>
      `At d=${d} mm: tau = ${stress} N/mm^2, R = ${sf}`,
  },
};

export function ShaftDiameterCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const fmt = (n: number, digits = 2) =>
    n.toLocaleString(locale === "en" ? "en-GB" : "nl-NL", { maximumFractionDigits: digits });
  const [search, setSearch] = useSearchParams();
  const [torque, setTorque] = useState(search.get("t") ?? "50");
  const [tauAllow, setTauAllow] = useState(search.has("tau") ? (search.get("tau") ?? "") : "40");
  const [dCheck, setDCheck] = useState(search.get("d") ?? "");

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    // Preserve intentional blanks so a shared/reloaded URL cannot restore 50 N·m.
    next.set("t", torque);
    // An explicitly empty tau is meaningful for cross-tool handoffs: torque is
    // known, but allowable stress must still be selected for the material.
    next.set("tau", tauAllow);
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
  const checkSF =
    dMin != null && checkStress != null && checkStress > 0 && tauVal != null
      ? tauVal / checkStress
      : null;
  const checkStatus = checkSF != null ? shaftSafetyStatus(checkSF) : null;

  const copy = useMemo(() => {
    if (dMin == null) return "";
    const lines = [t.copy(torque, tauAllow, fmt(dMin)), metaCopyLine(SHAFT_META, locale)];
    if (checkStress != null && checkSF != null) {
      lines.splice(
        1,
        0,
        t.copyCheck(dCheck, fmt(checkStress, 1), fmt(checkSF)),
        t.reserveHelp,
        checkStatus === "fail" ? t.sfFail : checkStatus === "caution" ? t.sfCaution : t.sfOk,
      );
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

      <h3 className="mt-6 font-display text-base font-semibold text-ink">{t.inputSection}</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <ValidatedNumField
          label={t.torque}
          id="shaft-torque"
          validateInitially={search.has("t")}
          value={torque}
          onChange={setTorque}
          error={torqueVal == null || torqueVal <= 0 ? t.positiveError : undefined}
        />
        <ValidatedNumField
          label={t.tauAllow}
          id="shaft-tau-allow"
          validateInitially={search.has("tau")}
          value={tauAllow}
          onChange={setTauAllow}
          error={tauVal == null || tauVal <= 0 ? t.positiveError : undefined}
        />
      </div>

      <h3 className="mt-8 font-display text-base font-semibold text-ink">{t.resultsSection}</h3>
      {dMin == null ? (
        <p className="mt-5 text-sm text-muted" role="status">
          {t.fill}
        </p>
      ) : (
        <ResultGrid items={[{ label: t.resultDiameter, value: `${fmt(dMin)} mm` }]} />
      )}

      <h3 className="mt-8 font-display text-base font-semibold text-ink">{t.checkSection}</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <ValidatedNumField
          label={t.checkDiameter}
          id="shaft-d-check"
          validateInitially={search.has("d")}
          value={dCheck}
          onChange={setDCheck}
          error={
            dCheck.trim() !== "" && (dCheckVal == null || dCheckVal <= 0)
              ? t.positiveError
              : undefined
          }
        />
      </div>
      {checkStress != null && checkSF != null ? (
        <>
          <ResultGrid
            items={[
              { label: t.resultStress, value: `${fmt(checkStress, 1)} N/mm²` },
              { label: t.resultSF, value: fmt(checkSF) },
            ]}
          />
          <Note>{t.reserveHelp}</Note>
          <p
            role="status"
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
        {copy ? (
          <CopyResult text={copy} />
        ) : (
          <p className="text-sm text-muted">{t.copyUnavailable}</p>
        )}
        <CopyLink />
      </div>
      <SourceMetaBadge meta={SHAFT_META} />
    </CalcPanel>
  );
}
