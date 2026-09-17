import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  boltSafetyStatus,
  clampStatus,
  computeBoltedJoint,
  fmtBoltedJoint,
} from "@/lib/calculators/bolted-joint";
import {
  PROPERTY_CLASSES,
  STRESS_AREA,
  THREAD_SIZES,
  yieldStress,
  type ThreadSize,
} from "@/lib/calculators/fasteners";
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
  SelectInput,
} from "@/components/calculators/calc-ui";
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";

const BOLTED_JOINT_META: EngineeringSourceMeta = {
  basisType: "standard",
  reference:
    "VDI 2230 Blatt 1 — static verification of a concentrically loaded bolted joint (lite scope)",
  status: "current",
  checkedDate: "2026-09-17",
  validityRange: {
    nl: "Concentrische, statische axiale belasting — geen excentrische/buiglast, geen dwarskracht, geen vermoeiing",
    en: "Concentric, static axial load only — no eccentric/bending load, no transverse load, no fatigue",
  },
  assumptions: {
    nl: "Alleen de twee klassieke VDI 2230-grensgevallen: restklemkracht onder volle bedrijfslast en maximale boutkracht onder volle bedrijfslast. De belastingsfactor Φ, settingverlies F_Z en de vereiste restklemkracht zijn eigen invoer (uit tabel of meting) — dit is geen volledige verbindingsdimensionering. De caution-drempels (10% marge op F_Kerf, S_F tussen 1,0-1,2) zijn Mechify-screeningscriteria, geen letterlijke VDI 2230-tabelwaarden — VDI 2230 schrijft zelf geen vaste veiligheidsfactor voor.",
    en: "Only the two classic VDI 2230 boundary cases: residual clamp load under full working load and maximum bolt force under full working load. The load factor Φ, embedding loss F_Z and the required residual clamp load are your own input (from a table or measurement) — this is not a full joint dimensioning. The caution thresholds (10% margin on F_Kerf, S_F between 1.0-1.2) are Mechify screening criteria, not literal VDI 2230 table values — VDI 2230 itself does not mandate one fixed safety factor.",
  },
  verification: {
    nl: "Voor een kritieke of excentrisch/dynamisch belaste verbinding: gebruik een volledige VDI 2230-berekening (settingtabel, torsie tijdens aandraaien, vermoeiingscontrole).",
    en: "For a critical or eccentrically/dynamically loaded joint: use a full VDI 2230 calculation (embedding table, tightening torsion, fatigue check).",
  },
};

const T = {
  nl: {
    heading: "Boutverbinding — statische controle (VDI 2230-lite)",
    intro:
      "Controleert de twee klassieke VDI 2230-grensgevallen voor een concentrisch, statisch axiaal belaste boutverbinding: blijft de verbinding geklemd (restklemkracht F_KR) en blijft de bout onder de vloeigrens (F_Smax)? Excentrische/buig- en dwarsbelasting, settingtabel en vermoeiing zitten hier niet in.",
    inputSection: "Bout en voorspanning",
    threadSize: "Draadmaat",
    propertyClass: "Sterkteklasse",
    preload: "Montagevoorspankracht F_V (kN)",
    embedding: "Settingverlies F_Z (kN)",
    loadFactor: "Belastingsfactor Φ (0-1)",
    workingLoad: "Externe bedrijfslast per bout F_A (kN)",
    requiredClamp: "Vereiste restklemkracht F_Kerf (kN)",
    resultsSection: "Resultaat",
    resultFVRest: "F_V,rest (na setting)",
    resultFKR: "F_KR (restklemkracht)",
    resultFSmax: "F_S,max (max. boutkracht)",
    resultSigma: "σ_S (boutspanning)",
    resultSF: "Veiligheid tegen vloeien S_F",
    clampFail: "F_KR < F_Kerf — de verbinding komt los onder volle bedrijfslast.",
    clampCaution: "F_KR net boven F_Kerf (<10% marge) — weinig reserve.",
    clampOk: "F_KR ≥ F_Kerf met voldoende marge — verbinding blijft geklemd.",
    sfFail: "S_F < 1,0 — de bout vloeit onder de maximale bedrijfslast.",
    sfCaution: "S_F tussen 1,0 en 1,2 — krap, controleer belastingaannames.",
    sfOk: "S_F ≥ 1,2 — voldoende marge tegen vloeien.",
    fill: "Vul F_V, Φ, F_A en F_Kerf in (F_V en F_Kerf groter dan 0).",
    chainToFasteners: "Gebruik de bevestigingsmateriaal-tool voor aandraaimoment en A_s/Rp0,2 →",
    copy: (
      size: string,
      cls: string,
      fv: string,
      fz: string,
      phi: string,
      fa: string,
      fkr: string,
      fsmax: string,
      sigma: string,
      sf: string,
    ) =>
      [
        `${size}, klasse ${cls}: F_V=${fv} kN, F_Z=${fz} kN, Φ=${phi}, F_A=${fa} kN`,
        `F_KR = ${fkr} kN, F_S,max = ${fsmax} kN, σ_S = ${sigma} N/mm², S_F = ${sf}`,
      ].join("\n"),
  },
  en: {
    heading: "Bolted joint — static verification (VDI 2230-lite)",
    intro:
      "Checks the two classic VDI 2230 boundary cases for a concentric, static, axially loaded bolted joint: does the joint stay clamped (residual clamp load F_KR), and does the bolt stay below yield (F_Smax)? Eccentric/bending and transverse load, the embedding-loss table and fatigue are not included.",
    inputSection: "Bolt and preload",
    threadSize: "Thread size",
    propertyClass: "Property class",
    preload: "Assembly preload F_V (kN)",
    embedding: "Embedding loss F_Z (kN)",
    loadFactor: "Load factor Φ (0-1)",
    workingLoad: "External working load per bolt F_A (kN)",
    requiredClamp: "Required residual clamp load F_Kerf (kN)",
    resultsSection: "Result",
    resultFVRest: "F_V,rest (after embedding)",
    resultFKR: "F_KR (residual clamp load)",
    resultFSmax: "F_S,max (max. bolt force)",
    resultSigma: "σ_S (bolt stress)",
    resultSF: "Static safety against yield S_F",
    clampFail: "F_KR < F_Kerf — the joint separates under full working load.",
    clampCaution: "F_KR just above F_Kerf (<10% margin) — little reserve.",
    clampOk: "F_KR ≥ F_Kerf with adequate margin — joint stays clamped.",
    sfFail: "S_F < 1.0 — the bolt yields under the maximum working load.",
    sfCaution: "S_F between 1.0 and 1.2 — tight, check the load assumptions.",
    sfOk: "S_F ≥ 1.2 — adequate margin against yielding.",
    fill: "Enter F_V, Φ, F_A and F_Kerf (F_V and F_Kerf greater than 0).",
    chainToFasteners: "Use the fasteners tool for tightening torque and A_s/Rp0.2 →",
    copy: (
      size: string,
      cls: string,
      fv: string,
      fz: string,
      phi: string,
      fa: string,
      fkr: string,
      fsmax: string,
      sigma: string,
      sf: string,
    ) =>
      [
        `${size}, class ${cls}: F_V=${fv} kN, F_Z=${fz} kN, Phi=${phi}, F_A=${fa} kN`,
        `F_KR = ${fkr} kN, F_S,max = ${fsmax} kN, sigma_S = ${sigma} N/mm^2, S_F = ${sf}`,
      ].join("\n"),
  },
};

export function BoltedJointCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [size, setSize] = useState<ThreadSize>(
    (search.get("m") && search.get("m")! in STRESS_AREA ? search.get("m") : "M10") as ThreadSize,
  );
  const [classId, setClassId] = useState(search.get("c") ?? "8.8");
  const [fv, setFv] = useState(search.get("fv") ?? "20");
  const [fz, setFz] = useState(search.get("fz") ?? "1");
  const [phi, setPhi] = useState(search.get("phi") ?? "0.25");
  const [fa, setFa] = useState(search.get("fa") ?? "5");
  const [fkreq, setFkreq] = useState(search.get("fkreq") ?? "10");

  useEffect(() => {
    const next = new URLSearchParams(search);
    next.set("m", size);
    next.set("c", classId);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    set("fv", fv);
    set("fz", fz);
    set("phi", phi);
    set("fa", fa);
    set("fkreq", fkreq);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, classId, fv, fz, phi, fa, fkreq]);

  const cls = PROPERTY_CLASSES.find((c) => c.id === classId) ?? PROPERTY_CLASSES[0];
  const As = STRESS_AREA[size];
  const Rp = yieldStress(cls);

  const fvVal = parseNum(fv);
  const fzVal = parseNum(fz) ?? 0;
  const phiVal = parseNum(phi);
  const faVal = parseNum(fa) ?? 0;
  const fkreqVal = parseNum(fkreq);

  const result =
    fvVal != null && fvVal > 0 && phiVal != null && fkreqVal != null && fkreqVal > 0
      ? computeBoltedJoint({
          As,
          Rp,
          FV: fvVal,
          FZ: fzVal,
          phi: phiVal,
          FA: faVal,
          FKreq: fkreqVal,
        })
      : null;

  const cStatus = result && fkreqVal != null ? clampStatus(result.fKR, fkreqVal) : null;
  const sfStatus = result ? boltSafetyStatus(result.safetyFactor) : null;

  const copy = useMemo(() => {
    if (!result) return "";
    return [
      t.copy(
        size,
        classId,
        fv,
        fz,
        phi,
        fa,
        fmtBoltedJoint(result.fKR),
        fmtBoltedJoint(result.fSmax),
        fmtBoltedJoint(result.sigmaS, 1),
        fmtBoltedJoint(result.safetyFactor),
      ),
      metaCopyLine(BOLTED_JOINT_META, locale),
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, size, classId, fv, fz, phi, fa, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <SourceMetaBadge meta={BOLTED_JOINT_META} />

        <h3 className="mt-6 font-display text-base font-semibold text-ink">{t.inputSection}</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label={t.threadSize}>
            <SelectInput value={size} onChange={(v) => setSize(v as ThreadSize)}>
              {THREAD_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.propertyClass}>
            <SelectInput value={classId} onChange={setClassId}>
              {PROPERTY_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.preload}>
            <NumInput id="bolted-joint-fv" value={fv} onChange={setFv} />
          </Field>
          <Field label={t.embedding}>
            <NumInput id="bolted-joint-fz" value={fz} onChange={setFz} />
          </Field>
          <Field label={t.loadFactor}>
            <NumInput id="bolted-joint-phi" value={phi} onChange={setPhi} />
          </Field>
          <Field label={t.workingLoad}>
            <NumInput id="bolted-joint-fa" value={fa} onChange={setFa} />
          </Field>
          <Field label={t.requiredClamp}>
            <NumInput id="bolted-joint-fkreq" value={fkreq} onChange={setFkreq} />
          </Field>
        </div>

        <h3 className="mt-8 font-display text-base font-semibold text-ink">{t.resultsSection}</h3>
        {!result ? (
          <p className="mt-5 text-sm text-muted">{t.fill}</p>
        ) : (
          <>
            <ResultGrid
              items={[
                { label: t.resultFVRest, value: `${fmtBoltedJoint(result.fVRest)} kN` },
                { label: t.resultFKR, value: `${fmtBoltedJoint(result.fKR)} kN` },
                { label: t.resultFSmax, value: `${fmtBoltedJoint(result.fSmax)} kN` },
                { label: t.resultSigma, value: `${fmtBoltedJoint(result.sigmaS, 1)} N/mm²` },
                {
                  label: t.resultSF,
                  value: Number.isFinite(result.safetyFactor)
                    ? fmtBoltedJoint(result.safetyFactor)
                    : "∞",
                },
              ]}
            />
            <p
              className={`mt-3 text-sm font-medium ${
                cStatus === "fail"
                  ? "text-danger"
                  : cStatus === "caution"
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {cStatus === "fail"
                ? t.clampFail
                : cStatus === "caution"
                  ? t.clampCaution
                  : t.clampOk}
            </p>
            <p
              className={`mt-1 text-sm font-medium ${
                sfStatus === "fail"
                  ? "text-danger"
                  : sfStatus === "caution"
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {sfStatus === "fail" ? t.sfFail : sfStatus === "caution" ? t.sfCaution : t.sfOk}
            </p>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <CopyResult text={copy} />
          <CopyLink />
        </div>
        <p className="mt-4 text-sm">
          <Link to="/tools/fasteners" className="text-accent hover:underline">
            {t.chainToFasteners}
          </Link>
        </p>
      </CalcPanel>
    </>
  );
}
