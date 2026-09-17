import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  airConsumptionPerCycleL,
  airConsumptionPerMinuteL,
  ALL_BORES,
  effectiveForce,
  extendForce,
  fmtAir,
  fmtN0,
  minBoreFor,
  retractForce,
} from "@/lib/calculators/pneumatic";
import {
  columnCapacity,
  eFor,
  END_CONDITIONS,
  fmtDotComma,
  kDesignFor,
  MATERIALS_E,
  rp02For,
  sectionProps,
  type EndConditionId,
} from "@/lib/calculators/knik";
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
  SourceBadge,
  SourceLink,
} from "@/components/calculators/calc-ui";
import { SourceMetaBadge } from "@/components/calculators/source-meta";
import { metaCopyLine, type EngineeringSourceMeta } from "@/lib/engineering-meta";

const CYLINDER_META: EngineeringSourceMeta = {
  basisType: "standard",
  reference: "ISO 15552 / ISO 6432 bore-rod combinations · F = p*A theoretical force model",
  status: "current",
  checkedDate: "2026-09-17",
  validityRange: { nl: "Boring tot Ø320 mm", en: "Bore up to Ø320 mm" },
  assumptions: {
    nl: "ISO 15552/6432 zijn interwisselbaarheid-/montagemaatnormen, geen krachtprestatiegarantie. F = p·A hierboven is theoretisch (geen wrijving); een wrijvingsrendement en het luchtverbruik staan als optionele controle onderaan. Leidingdrukverlies, snelheids-/debietlimieten en demping zitten niet in dit model — reken zelf een veiligheidsfactor.",
    en: "ISO 15552/6432 are interchangeability/mounting-dimension standards, not a force-performance guarantee. F = p*A above is theoretical (no friction); a friction efficiency and air consumption are available as an optional check below. Line pressure drop, speed/flow limits and cushioning are not modelled — add your own safety factor.",
  },
  sourceUrl: "https://committee.iso.org/standard/66921.html?browse=ics",
};

const T = {
  nl: {
    heading: "ISO-boring bij een last",
    intro:
      "F = p · A, dubbelwerkende cilinder. Zoekt de kleinste standaard boring (ISO 15552 / ISO 6432) waarvan de uittrekkracht de opgegeven last haalt — zonder marge. Reken zelf een veiligheidsfactor voor leidingverlies, wrijving en versnelling.",
    forceLabel: "Benodigde kracht F (N)",
    pressureLabel: "Werkdruk p (bar)",
    fillForcePressure: "Vul een kracht en druk groter dan 0 in.",
    noBore: (p: string) =>
      `Geen standaard boring tot Ø320 mm haalt deze kracht bij ${p} bar. Verhoog de druk of gebruik een meercilinder-opstelling.`,
    rodLabel: (rod?: number) => `zuigerstang Ø${rod} mm`,
    recommendedBore: "Aanbevolen boring",
    rod: "Zuigerstang",
    extendForce: "Uittrekkracht",
    retractForce: "Intrekkracht",
    hideBuckling: "Verberg uitknikcontrole zuigerstang",
    showBuckling: "Uitknikcontrole zuigerstang (optioneel)",
    bucklingIntro:
      "Indicatieve Euler-controle van de zuigerstang bij volledig uitgeschoven positie, met dezelfde rekenkern als de knikberekening. Fabrikant-selectietabellen (Festo/SMC) houden ook rekening met speling in de geleiding en een grotere veiligheidsfactor (doorgaans 3,5–5×) — gebruik die voor de uiteindelijke keuze.",
    strokeLabel: "Uitgeschoven lengte L (mm)",
    endConditionLabel: "Inklemming",
    rodMaterialLabel: "Materiaal zuigerstang",
    safetyRatio: "S = F_cr / F_uit",
    bucklingBasisNote:
      "De uitknikcontrole rekent met de beschikbare uittrekkracht F_uit bij deze boring en druk (het geblokkeerde/vastgelopen geval), niet met de opgegeven last F — een cilinder die tegen een aanslag vastloopt levert zijn volledige theoretische kracht, ook als de last zelf lager is.",
    additionalCheckNote:
      "λ ligt onder de Euler-grens: F_cr hierboven is de plooilast (bovengrens), geen geverifieerde kolomcapaciteit. Aanvullende kolomcontrole vereist — zie de Euler-knik rekenhulp.",
    chainToBuckling: "Open deze staaf in de Euler-knik tool →",
    lowSafetyNote: (s: string) =>
      `S = ${s} ligt onder de gangbare fabrikant-marge van 3,5–5× voor pneumatische zuigerstangen. Kies een dikkere stang, een kortere slag, of een grotere boring.`,
    fillLength: "Vul een lengte groter dan 0 in.",
    standardBores: "Standaard boringen",
    thSeries: "Reeks",
    thBore: "Boring",
    thRod: "Zuigerstang",
    thExtendAt: (p: string) => `Uittrekkracht @ ${p} bar`,
    sourceBadge:
      'Boring/zuigerstang-combinaties volgens de gangbare cilindercatalogi (Festo DSBC/DNC, SMC CA2/CQ2) die ISO 15552 en ISO 6432 volgen. Sommige boringen hebben meerdere standaard stangdiameters; controleer de fabrikant-catalogus voor de volledige set. Bij Ø200/250/320 wijkt de stangdiameter hier af van de aanvullende rekenhulp ("Lastfactor & luchtverbruik") — geen van beide is aan een genoemd fabrikant-typenummer gekoppeld; gebruik voor een bestelling de datasheet van één met naam genoemde cilinderfamilie.',
    sourceWiki: "Wikipedia — Pneumatic cylinder",
    copyLoad: (F: string, p: string) => `Last ${F} N bij ${p} bar`,
    copyBore: (bore: number, series: string) => `Aanbevolen boring: Ø${bore} mm (${series})`,
    copyRod: (rod?: number) => `Zuigerstang Ø${rod} mm`,
    copyExtend: (n: string) => `Uittrekkracht ${n} N`,
    copyBuckling: (fcr: string, s: string) =>
      `Uitknik zuigerstang (o.b.v. F_uit, geblokkeerd geval): F_cr = ${fcr} N, S = ${s}`,
    hideAir: "Verberg rendement en luchtverbruik",
    showAir: "Rendement en luchtverbruik (optioneel)",
    airIntro:
      "F = p·A is theoretisch: wrijving in zuiger- en stangafdichtingen kost typisch 5-20% van de theoretische kracht. Het luchtverbruik is de vrije-luchthoeveelheid (bij atmosferische druk) die de compressor per cyclus/minuut moet leveren — een gangbare pneumatiek-vuistregelformule, geen ISO-norm.",
    efficiencyLabel: "Cilinderrendement η (0-1)",
    cyclesLabel: "Cycli per minuut",
    effExtendForce: "Effectieve uittrekkracht (met wrijving)",
    effRetractForce: "Effectieve intrekkracht (met wrijving)",
    airPerCycle: "Luchtverbruik per cyclus",
    airPerMinute: "Luchtverbruik per minuut",
    fillAir: "Vul rendement, slag en cycli per minuut in (alle groter dan 0).",
    copyEfficiency: (eta: string, effUit: string, effIn: string) =>
      `Rendement η=${eta}: effectieve uittrekkracht ${effUit} N, intrekkracht ${effIn} N`,
    copyAir: (perCycle: string, perMin: string) =>
      `Luchtverbruik: ${perCycle} Nl/cyclus, ${perMin} Nl/min`,
  },
  en: {
    heading: "ISO bore for a load",
    intro:
      "F = p · A, double-acting cylinder. Finds the smallest standard bore (ISO 15552 / ISO 6432) whose extend force meets the given load — with no margin. Add your own safety factor for line loss, friction and acceleration.",
    forceLabel: "Required force F (N)",
    pressureLabel: "Working pressure p (bar)",
    fillForcePressure: "Enter a force and pressure greater than 0.",
    noBore: (p: string) =>
      `No standard bore up to Ø320 mm reaches this force at ${p} bar. Increase the pressure or use a multi-cylinder setup.`,
    rodLabel: (rod?: number) => `rod Ø${rod} mm`,
    recommendedBore: "Recommended bore",
    rod: "Rod",
    extendForce: "Extend force",
    retractForce: "Retract force",
    hideBuckling: "Hide rod buckling check",
    showBuckling: "Rod buckling check (optional)",
    bucklingIntro:
      "Indicative Euler check of the rod at fully extended position, using the same calculation core as the buckling tool. Manufacturer selection tables (Festo/SMC) also account for guide clearance and a larger safety factor (typically 3.5–5×) — use those for the final choice.",
    strokeLabel: "Extended length L (mm)",
    endConditionLabel: "End condition",
    rodMaterialLabel: "Rod material",
    safetyRatio: "S = F_cr / F_uit",
    bucklingBasisNote:
      "The buckling check uses the available extend force F_uit at this bore and pressure (the blocked/stalled case), not the requested load F — a cylinder jammed against a hard stop delivers its full theoretical force, even if the actual load is lower.",
    additionalCheckNote:
      "λ is below the Euler limit: F_cr above is the squash load (an upper bound), not a verified column capacity. Additional column assessment required — see the Euler buckling tool.",
    chainToBuckling: "Open this rod in the Euler buckling tool →",
    lowSafetyNote: (s: string) =>
      `S = ${s} is below the typical manufacturer margin of 3.5–5× for pneumatic rods. Choose a thicker rod, a shorter stroke, or a larger bore.`,
    fillLength: "Enter a length greater than 0.",
    standardBores: "Standard bores",
    thSeries: "Series",
    thBore: "Bore",
    thRod: "Rod",
    thExtendAt: (p: string) => `Extend force @ ${p} bar`,
    sourceBadge:
      'Bore/rod combinations per common cylinder catalogs (Festo DSBC/DNC, SMC CA2/CQ2) following ISO 15552 and ISO 6432. Some bores have several standard rod diameters; check the manufacturer catalog for the full set. At Ø200/250/320 the rod diameter here differs from the supplementary tool ("Load factor & air use") — neither is tied to a named manufacturer type code; for an order, use the datasheet of one named cylinder family.',
    sourceWiki: "Wikipedia — Pneumatic cylinder",
    copyLoad: (F: string, p: string) => `Load ${F} N at ${p} bar`,
    copyBore: (bore: number, series: string) => `Recommended bore: Ø${bore} mm (${series})`,
    copyRod: (rod?: number) => `Rod Ø${rod} mm`,
    copyExtend: (n: string) => `Extend force ${n} N`,
    copyBuckling: (fcr: string, s: string) =>
      `Rod buckling (based on F_uit, blocked case): F_cr = ${fcr} N, S = ${s}`,
    hideAir: "Hide efficiency and air consumption",
    showAir: "Efficiency and air consumption (optional)",
    airIntro:
      "F = p*A is theoretical: piston/rod seal friction typically costs 5-20% of the theoretical force. Air consumption is the free-air volume (at atmospheric pressure) the compressor must supply per cycle/minute — a common pneumatics rule-of-thumb formula, not an ISO standard.",
    efficiencyLabel: "Cylinder efficiency η (0-1)",
    cyclesLabel: "Cycles per minute",
    effExtendForce: "Effective extend force (with friction)",
    effRetractForce: "Effective retract force (with friction)",
    airPerCycle: "Air consumption per cycle",
    airPerMinute: "Air consumption per minute",
    fillAir: "Enter efficiency, stroke and cycles per minute (all greater than 0).",
    copyEfficiency: (eta: string, effUit: string, effIn: string) =>
      `Efficiency eta=${eta}: effective extend force ${effUit} N, retract force ${effIn} N`,
    copyAir: (perCycle: string, perMin: string) =>
      `Air consumption: ${perCycle} Nl/cycle, ${perMin} Nl/min`,
  },
};

export function PneumaticCylinderCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [force, setForce] = useState(search.get("f") ?? "1000");
  const [pressure, setPressure] = useState(search.get("p") ?? "6");
  const [stroke, setStroke] = useState(search.get("l") ?? "300");
  const [endCondition, setEndCondition] = useState<EndConditionId>(
    (search.get("end") as EndConditionId) ?? "fc",
  );
  const [materialId, setMaterialId] = useState(search.get("material") ?? "staal");
  const [showBuckling, setShowBuckling] = useState(false);
  const [efficiency, setEfficiency] = useState(search.get("eta") ?? "0.9");
  const [cyclesPerMin, setCyclesPerMin] = useState(search.get("cpm") ?? "10");
  const [showAir, setShowAir] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(search);
    const set = (k: string, v: string) => (v ? next.set(k, v) : next.delete(k));
    set("f", force);
    set("p", pressure);
    set("l", stroke);
    next.set("end", endCondition);
    next.set("material", materialId);
    set("eta", efficiency);
    set("cpm", cyclesPerMin);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [force, pressure, stroke, endCondition, materialId, efficiency, cyclesPerMin]);

  const F = parseNum(force);
  const p = parseNum(pressure);
  const L = parseNum(stroke);

  const recommended = F != null && p != null && F > 0 && p > 0 ? minBoreFor(F, p) : null;
  const rod = recommended?.rods[0];
  const label = (x: { label: string; labelEn: string }) => (locale === "nl" ? x.label : x.labelEn);

  const buckling = useMemo(() => {
    if (!recommended || rod == null || L == null || !(L > 0) || p == null) return null;
    const section = sectionProps("rond", { D: rod });
    if (!section) return null;
    // Buckling is checked against the cylinder's own available extend force
    // (the blocked/stalled case), not the requested load F — see
    // bucklingBasisNote. A stalled or end-of-stroke cylinder can exert its
    // full theoretical force on the rod regardless of the nominal load.
    const F_uit = extendForce(recommended.bore, p);
    return columnCapacity({
      L,
      k: kDesignFor(endCondition),
      E: eFor(materialId),
      I: section.I,
      A: section.A,
      F: F_uit,
      rp02: rp02For(materialId),
    });
  }, [recommended, rod, L, p, endCondition, materialId]);

  const etaVal = parseNum(efficiency);
  const cyclesVal = parseNum(cyclesPerMin);
  const airResult = useMemo(() => {
    if (!recommended || rod == null || p == null || L == null || !(L > 0)) return null;
    if (etaVal == null || !(etaVal > 0) || cyclesVal == null || !(cyclesVal > 0)) return null;
    const effUit = effectiveForce(extendForce(recommended.bore, p), etaVal);
    const effIn = effectiveForce(retractForce(recommended.bore, rod, p), etaVal);
    const qCycle = airConsumptionPerCycleL(recommended.bore, rod, L, p);
    const qMin = airConsumptionPerMinuteL(qCycle, cyclesVal);
    return { effUit, effIn, qCycle, qMin };
  }, [recommended, rod, p, L, etaVal, cyclesVal]);

  const copy = useMemo(() => {
    if (!recommended || F == null || p == null) return "";
    const extend = extendForce(recommended.bore, p);
    const lines = [
      t.copyLoad(fmtN0(F), String(p)),
      t.copyBore(recommended.bore, recommended.series),
      t.copyRod(rod),
      t.copyExtend(fmtN0(extend)),
    ];
    if (buckling)
      lines.push(t.copyBuckling(fmtN0(buckling.Fcr), fmtDotComma(buckling.safety ?? 0, 2)));
    if (airResult) {
      lines.push(t.copyEfficiency(efficiency, fmtN0(airResult.effUit), fmtN0(airResult.effIn)));
      lines.push(t.copyAir(fmtAir(airResult.qCycle), fmtAir(airResult.qMin)));
    }
    lines.push(metaCopyLine(CYLINDER_META, locale));
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommended, F, p, rod, buckling, airResult, efficiency, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <SourceMetaBadge meta={CYLINDER_META} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.forceLabel}>
            <NumInput id="pneu-force" value={force} onChange={setForce} />
          </Field>
          <Field label={t.pressureLabel}>
            <NumInput id="pneu-pressure" value={pressure} onChange={setPressure} />
          </Field>
        </div>

        {F == null || p == null || F <= 0 || p <= 0 ? (
          <p className="mt-5 text-sm text-muted">{t.fillForcePressure}</p>
        ) : !recommended ? (
          <p className="mt-5 text-sm text-muted">{t.noBore(String(p))}</p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">
              {recommended.series} · Ø{recommended.bore} mm · {t.rodLabel(rod)}
            </p>
            <ResultGrid
              items={
                [
                  { label: t.recommendedBore, value: `Ø${recommended.bore} mm` },
                  { label: t.rod, value: `Ø${rod} mm` },
                  { label: t.extendForce, value: `${fmtN0(extendForce(recommended.bore, p))} N` },
                  rod != null
                    ? {
                        label: t.retractForce,
                        value: `${fmtN0(retractForce(recommended.bore, rod, p))} N`,
                      }
                    : null,
                ].filter(Boolean) as { label: string; value: string }[]
              }
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>

            <button
              type="button"
              onClick={() => setShowBuckling((s) => !s)}
              className="mt-6 text-sm font-medium text-ink underline decoration-border-strong underline-offset-4 hover:decoration-ink"
            >
              {showBuckling ? t.hideBuckling : t.showBuckling}
            </button>
            {showBuckling ? (
              <div className="mt-4 rounded-lg border border-border bg-bg p-4">
                <Note>{t.bucklingIntro}</Note>
                <Note>{t.bucklingBasisNote}</Note>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label={t.strokeLabel}>
                    <NumInput id="pneu-stroke" value={stroke} onChange={setStroke} />
                  </Field>
                  <Field label={t.endConditionLabel}>
                    <SelectInput
                      value={endCondition}
                      onChange={(v) => setEndCondition(v as EndConditionId)}
                    >
                      {END_CONDITIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {label(c)}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field label={t.rodMaterialLabel}>
                    <SelectInput value={materialId} onChange={setMaterialId}>
                      {MATERIALS_E.map((m) => (
                        <option key={m.id} value={m.id}>
                          {label(m)}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                {buckling ? (
                  <>
                    <ResultGrid
                      items={[
                        { label: "F_cr", value: `${fmtN0(buckling.Fcr)} N` },
                        { label: t.safetyRatio, value: fmtDotComma(buckling.safety ?? 0, 2) },
                        { label: "λ", value: fmtDotComma(buckling.lambda, 1) },
                      ]}
                    />
                    {!buckling.verifiedCapacity ? (
                      <Note>{t.additionalCheckNote}</Note>
                    ) : buckling.safety != null && buckling.safety < 3.5 ? (
                      <Note>{t.lowSafetyNote(fmtDotComma(buckling.safety, 2))}</Note>
                    ) : null}
                    {rod != null ? (
                      <p className="mt-3 text-sm">
                        <Link
                          to={`/calculators/buckling?section=rond&D=${rod}&L=${stroke}&end=${endCondition}&material=${materialId}`}
                          className="text-accent hover:underline"
                        >
                          {t.chainToBuckling}
                        </Link>
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-4 text-sm text-muted">{t.fillLength}</p>
                )}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setShowAir((s) => !s)}
              className="mt-3 text-sm font-medium text-ink underline decoration-border-strong underline-offset-4 hover:decoration-ink"
            >
              {showAir ? t.hideAir : t.showAir}
            </button>
            {showAir ? (
              <div className="mt-4 rounded-lg border border-border bg-bg p-4">
                <Note>{t.airIntro}</Note>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field label={t.strokeLabel}>
                    <NumInput id="pneu-air-stroke" value={stroke} onChange={setStroke} />
                  </Field>
                  <Field label={t.efficiencyLabel}>
                    <NumInput id="pneu-efficiency" value={efficiency} onChange={setEfficiency} />
                  </Field>
                  <Field label={t.cyclesLabel}>
                    <NumInput id="pneu-cycles" value={cyclesPerMin} onChange={setCyclesPerMin} />
                  </Field>
                </div>
                {airResult ? (
                  <ResultGrid
                    items={[
                      { label: t.effExtendForce, value: `${fmtN0(airResult.effUit)} N` },
                      { label: t.effRetractForce, value: `${fmtN0(airResult.effIn)} N` },
                      { label: t.airPerCycle, value: `${fmtAir(airResult.qCycle)} Nl` },
                      { label: t.airPerMinute, value: `${fmtAir(airResult.qMin)} Nl/min` },
                    ]}
                  />
                ) : (
                  <p className="mt-4 text-sm text-muted">{t.fillAir}</p>
                )}
              </div>
            ) : null}
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.standardBores}
        </h2>
        <div className="table-scroll mt-4" tabIndex={0}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thSeries}</th>
                <th>{t.thBore}</th>
                <th>{t.thRod}</th>
                <th>{t.thExtendAt(pressure || "6")}</th>
              </tr>
            </thead>
            <tbody>
              {ALL_BORES.map((row) => {
                const pVal = parseNum(pressure) ?? 6;
                const isActive =
                  recommended?.bore === row.bore && recommended.series === row.series;
                return (
                  <tr key={`${row.series}-${row.bore}`} className={isActive ? "is-active" : ""}>
                    <th scope="row" className="normal-case">
                      {row.series}
                    </th>
                    <td>Ø{row.bore} mm</td>
                    <td>Ø{row.rods.join(" / ")} mm</td>
                    <td>{fmtN0(extendForce(row.bore, pVal))} N</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SourceBadge>{t.sourceBadge}</SourceBadge>
        <SourceLink href="https://en.wikipedia.org/wiki/Pneumatic_cylinder">
          {t.sourceWiki}
        </SourceLink>
      </section>
    </>
  );
}
