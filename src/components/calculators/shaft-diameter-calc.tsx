import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  hollowShaftTorsionStress,
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
  reference: "τ = Tr/J; J = π(Dₒ⁴−Dᵢ⁴)/32 — Wiley / Philpot, Mechanics of Materials, ch. 6",
  sourceUrl:
    "https://www.education.wiley.com/content/Philpot_Mechanics_of_Materials_4e/media/simulations/mec_movies/ch06/m06_02_s170.html",
  status: "current",
  checkedDate: "2026-10-08",
  validityRange: {
    nl: "Massieve ronde as (dimensionering) of concentrische holle ronde as (controle), elastische zuivere torsie",
    en: "Solid round shaft (sizing) or concentric hollow round shaft (check), elastic pure torsion",
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
    hollowHeading: "Geavanceerd: controle holle ronde as",
    hollowHelp:
      "Controle van een gekozen doorsnede bij hetzelfde koppel en dezelfde toelaatbare spanning. Geen bepaling van een minimale holle diameter. τ = 16T·Dₒ/[π(Dₒ⁴−Dᵢ⁴)] met T in N·mm. Alleen elastische, zuivere torsie van een uniforme concentrische ronde doorsnede; geen lokale plooi, vermoeiing, spanningsconcentraties of gecombineerde belasting.",
    outer: "Buitendiameter Dₒ (mm)",
    inner: "Binnendiameter Dᵢ (mm; 0 = massief)",
    innerError: "Vul een getal van 0 tot kleiner dan de buitendiameter in.",
    hollowPending:
      "Geen holle-asresultaat: vul geldige diameters, koppel en toelaatbare spanning in. Bij extreme waarden kan het resultaat niet betrouwbaar worden weergegeven.",
    hollowResult: "Torsiespanning holle doorsnede τ",
    inputSection: "Koppel en materiaal",
    torque: "Koppel T (N·m)",
    tauAllow: "Toelaatbare schuifspanning τ_toel (N/mm²)",
    resultsSection: "Resultaat",
    resultDiameter: "Minimale massieve diameter d_min",
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
      `T=${torque} N·m, τ_toel=${tau} N/mm²: massieve d_min = ${dmin} mm`,
    copyCheck: (d: string, stress: string, sf: string) =>
      `Bij d=${d} mm: τ = ${stress} N/mm², R = ${sf}`,
  },
  en: {
    heading: "Shaft diameter under torsion",
    intro: "Minimum shaft Ø that keeps τ = 16T/(πd³) at or below an allowable shear stress.",
    hollowHeading: "Advanced: hollow circular shaft check",
    hollowHelp:
      "Check a chosen section using the same torque and allowable stress. Does not size a minimum hollow diameter. τ = 16T·Dₒ/[π(Dₒ⁴−Dᵢ⁴)] with T in N·mm. Elastic pure torsion of a uniform concentric circular section only; no local buckling, fatigue, stress concentrations or combined loading.",
    outer: "Outside diameter Dₒ (mm)",
    inner: "Inside diameter Dᵢ (mm; 0 = solid)",
    innerError: "Enter a number from 0 to less than the outside diameter.",
    hollowPending:
      "No hollow-shaft result: enter valid diameters, torque and allowable stress. Extreme values may prevent reliable numerical results.",
    hollowResult: "Hollow-section torsional stress τ",
    inputSection: "Torque and material",
    torque: "Torque T (N·m)",
    tauAllow: "Allowable shear stress τ_allow (N/mm²)",
    resultsSection: "Result",
    resultDiameter: "Minimum solid diameter d_min",
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
      `T=${torque} N.m, tau_allow=${tau} N/mm^2: solid d_min = ${dmin} mm`,
    copyCheck: (d: string, stress: string, sf: string) =>
      `At d=${d} mm: tau = ${stress} N/mm^2, R = ${sf}`,
  },
};

export function ShaftDiameterCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const fmt = (n: number, digits = 2) =>
    n.toLocaleString(locale === "en" ? "en-GB" : "nl-NL", { maximumFractionDigits: digits });
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [torque, setTorque] = useState(search.get("t") ?? "50");
  const [tauAllow, setTauAllow] = useState(search.has("tau") ? (search.get("tau") ?? "") : "40");
  const [dCheck, setDCheck] = useState(search.get("d") ?? "");

  const [outer, setOuter] = useState(search.get("do") ?? "");
  const [inner, setInner] = useState(search.get("di") ?? "0");
  const [geometryTouched, setGeometryTouched] = useState(false);
  const [hollowOpen, setHollowOpen] = useState(search.has("do") || search.has("di"));

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    // Preserve intentional blanks so a shared/reloaded URL cannot restore 50 N·m.
    next.set("t", torque);
    // An explicitly empty tau is meaningful for cross-tool handoffs: torque is
    // known, but allowable stress must still be selected for the material.
    next.set("tau", tauAllow);
    set("d", dCheck);
    if (hollowOpen || outer !== "" || search.has("do") || search.has("di")) {
      next.set("do", outer);
      next.set("di", inner);
    }
    navigate({ search: `?${next}`, hash: location.hash }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torque, tauAllow, dCheck, outer, inner, hollowOpen]);

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

  const outerVal = parseNum(outer);
  const innerVal = parseNum(inner);
  const hollowStress =
    torqueVal != null && outerVal != null && innerVal != null
      ? hollowShaftTorsionStress(torqueVal, outerVal, innerVal)
      : null;
  const rawReserve =
    hollowStress != null && tauVal != null && tauVal > 0 ? tauVal / hollowStress : null;
  const hollowReserve =
    rawReserve != null && Number.isFinite(rawReserve) && rawReserve > 0 ? rawReserve : null;
  const hollowVerdict =
    hollowReserve == null
      ? ""
      : hollowReserve < 1
        ? t.sfFail
        : hollowReserve < 1.2
          ? t.sfCaution
          : t.sfOk;
  const hollowRequested = hollowOpen || outer !== "" || search.has("do") || search.has("di");

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
    if (hollowRequested) {
      lines.push(
        t.hollowHeading,
        t.hollowHelp,
        "Wiley / Philpot: https://www.education.wiley.com/content/Philpot_Mechanics_of_Materials_4e/media/simulations/mec_movies/ch06/m06_02_s170.html (2026-10-08)",
      );
      if (hollowStress != null && hollowReserve != null) {
        lines.push(
          `Dₒ=${outer} mm, Dᵢ=${inner} mm: τ=${fmt(hollowStress, 2)} N/mm², R=${fmt(hollowReserve)}`,
          t.reserveHelp,
          hollowVerdict,
        );
      } else lines.push(t.hollowPending);
    }
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dMin,
    torque,
    tauAllow,
    dCheck,
    checkStress,
    checkSF,
    locale,
    hollowRequested,
    hollowStress,
    hollowReserve,
    outer,
    inner,
    hollowVerdict,
  ]);

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

      <details
        className="mt-8 rounded-xl border border-border-strong p-4"
        open={hollowOpen}
        onToggle={(event) => setHollowOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer font-display font-semibold text-ink">
          {t.hollowHeading}
        </summary>
        <Note>{t.hollowHelp}</Note>
        <p className="mt-2 text-sm text-muted">
          <a
            className="underline"
            href="https://www.education.wiley.com/content/Philpot_Mechanics_of_Materials_4e/media/simulations/mec_movies/ch06/m06_02_s170.html"
            target="_blank"
            rel="noreferrer"
          >
            Wiley / Philpot — J = π(Dₒ⁴−Dᵢ⁴)/32
          </a>{" "}
          · {locale === "en" ? "Formula checked" : "Formule gecontroleerd"}: 2026-10-08
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <ValidatedNumField
            id="shaft-outer"
            label={t.outer}
            value={outer}
            onChange={setOuter}
            onValidationVisible={() => setGeometryTouched(true)}
            validateInitially={search.has("do")}
            error={outerVal == null || outerVal <= 0 ? t.positiveError : undefined}
          />
          <ValidatedNumField
            id="shaft-inner"
            label={t.inner}
            value={inner}
            onChange={setInner}
            onValidationVisible={() => setGeometryTouched(true)}
            validationVisible={geometryTouched ? true : undefined}
            validateInitially={search.has("di")}
            error={
              innerVal == null || innerVal < 0 || (outerVal != null && innerVal >= outerVal)
                ? t.innerError
                : undefined
            }
          />
        </div>
        {hollowStress != null && hollowReserve != null ? (
          <>
            <ResultGrid
              items={[
                { label: t.hollowResult, value: `${fmt(hollowStress, 2)} N/mm²` },
                { label: t.resultSF, value: fmt(hollowReserve) },
              ]}
            />
            <Note>{t.reserveHelp}</Note>
            <p
              role="status"
              className={`mt-3 text-sm font-medium ${hollowReserve < 1 ? "text-danger" : hollowReserve < 1.2 ? "text-warning" : "text-success"}`}
            >
              {hollowVerdict}
            </p>
          </>
        ) : (
          <p role="status" className="mt-3 text-sm text-muted">
            {t.hollowPending}
          </p>
        )}
      </details>

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
