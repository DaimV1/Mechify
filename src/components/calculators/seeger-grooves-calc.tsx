import { CirclipSection, SchemaPanel } from "@/components/toolkit/schema";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CIRCLIP_KINDS,
  computeGroove,
  fmtCirclip,
  nearestStandardSizes,
  type CirclipKind,
} from "@/lib/calculators/circlip";
import { fmtSeeger3, VERIFIED_SEEGER_D1 } from "@/lib/toolkit/seeger";
import { useLocale } from "@/lib/i18n/locale-context";
import { readStoredDiameter, storeDiameter } from "@/lib/tools";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  parseWholeMm,
  ResultGrid,
  SelectInput,
  SourceBadge,
  WholeMmInput,
} from "@/components/calculators/calc-ui";

const T = {
  nl: {
    heading: "Seegerringgroef bij Ø",
    intro:
      "Catalogusopzoeking (DIN 471 as / DIN 472 boring, werkplaatstabel Ø 3–100 mm op vaste nominale maten). Geen ring bij deze diameter geeft geen resultaat — kies een van de standaardmaten. Alleen de hieronder gemarkeerde maat is onafhankelijk geverifieerd tegen een fabrikant-datasheet; andere maten controleren tegen de actuele DIN of ringfabrikant-catalogus vóór productie.",
    type: "Type",
    diameterShaft: "As-Ø (mm)",
    diameterBore: "Boring-Ø (mm)",
    fillDiameter: "Vul een diameter in.",
    fillPositive: "Vul een diameter groter dan 0 in.",
    noRing: (d: number, lower: number | null, upper: number | null) => {
      const near = [lower, upper].filter((v): v is number => v != null);
      const hint =
        near.length > 0
          ? ` Dichtstbijzijnde standaardmaten: ${near.map((v) => `Ø${v}`).join(" en ")} mm.`
          : "";
      return `Geen standaard seegerring voor Ø${d} mm in deze tabel (bereik 3–100 mm, niet elke maat).${hint}`;
    },
    grooveDiameter: "Groefdiameter",
    grooveWidth: "Groefbreedte",
    grooveDepth: "Groefdiepte",
    depthTolerance: "Dieptetolerantie",
    verified: "Geverifieerd t.o.v. fabrikant-datasheet.",
    notVerified:
      "Niet geverifieerd — controleer tegen DIN 471/472 of de fabrikantcatalogus vóór productie.",
    estimateTitle: "Catalogustabel",
    thDiameter: "Ø (mm)",
    sourceBadge: (verifiedList: string) =>
      `Catalogusdata uit een werkplaatstabel (samenvatting van DIN 471/472), niet de officiële norm-PDF. Alleen Ø${verifiedList} mm is onafhankelijk geverifieerd tegen een fabrikant-datasheet (Rotor Clip); vraag voor elke andere maat de actuele norm of ringfabrikant-catalogus op vóór productie.`,
    copyKind: { as: "As", boring: "Boring" },
  },
  en: {
    heading: "Circlip groove at Ø",
    intro:
      "Catalogue lookup (DIN 471 shaft / DIN 472 bore, workshop table Ø 3-100 mm at fixed nominal sizes). No ring at a given diameter returns no result — pick one of the standard sizes instead. Only the size flagged below has been independently verified against a manufacturer datasheet; check every other size against the current DIN or ring manufacturer catalog before production.",
    type: "Type",
    diameterShaft: "Shaft Ø (mm)",
    diameterBore: "Bore Ø (mm)",
    fillDiameter: "Enter a diameter.",
    fillPositive: "Enter a diameter greater than 0.",
    noRing: (d: number, lower: number | null, upper: number | null) => {
      const near = [lower, upper].filter((v): v is number => v != null);
      const hint =
        near.length > 0
          ? ` Nearest standard sizes: ${near.map((v) => `Ø${v}`).join(" and ")} mm.`
          : "";
      return `No standard circlip for Ø${d} mm in this table (range 3-100 mm, not every size).${hint}`;
    },
    grooveDiameter: "Groove diameter",
    grooveWidth: "Groove width",
    grooveDepth: "Groove depth",
    depthTolerance: "Depth tolerance",
    verified: "Verified against a manufacturer datasheet.",
    notVerified:
      "Not verified — confirm against DIN 471/472 or the manufacturer catalog before production.",
    estimateTitle: "Catalogue table",
    thDiameter: "Ø (mm)",
    sourceBadge: (verifiedList: string) =>
      `Catalogue data from a workshop table (summary of DIN 471/472), not the official standard PDF. Only Ø${verifiedList} mm is independently verified against a manufacturer datasheet (Rotor Clip); request the current standard or ring manufacturer catalog for every other size before production.`,
    copyKind: { as: "Shaft", boring: "Bore" },
  },
};

export function SeegerGroovesCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [kind, setKind] = useState<CirclipKind>((search.get("kind") as CirclipKind) ?? "as");
  const [diameter, setDiameter] = useState(
    () => search.get("d") ?? readStoredDiameter({ min: 3, max: 100 }),
  );

  useEffect(() => {
    const next = new URLSearchParams(search);
    next.set("kind", kind);
    if (diameter) next.set("d", diameter);
    else next.delete("d");
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, diameter]);

  function onDia(v: string) {
    setDiameter(v);
    const next = parseWholeMm(v);
    if (next.status === "ok") storeDiameter(String(next.mm));
  }

  const parsed = parseWholeMm(diameter);
  const d = parsed.status === "ok" ? parsed.mm : Number.NaN;
  const result = Number.isFinite(d) ? computeGroove(kind, d) : null;
  const standard = CIRCLIP_KINDS.find((k) => k.id === kind)?.standard ?? "";
  const nearest = Number.isFinite(d) && !result ? nearestStandardSizes(kind, d) : null;

  const copy = useMemo(() => {
    if (!result) return "";
    const status = result.verified ? t.verified : t.notVerified;
    return [
      `${t.copyKind[kind]} Ø${d} mm (${standard}) — ${status}`,
      `${t.grooveDiameter} ${fmtCirclip(result.grooveDiameter)} mm ${result.grooveDiameterClass}`,
      `${t.grooveWidth} ${fmtCirclip(result.grooveWidth)} mm`,
      `${t.grooveDepth} ${fmtCirclip(result.grooveDepth)} mm`,
      `${t.depthTolerance} 0 / +${fmtSeeger3(result.grooveDepthPlus)} mm`,
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, kind, d, standard, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.intro}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.type}>
            <SelectInput value={kind} onChange={(v) => setKind(v as CirclipKind)}>
              {CIRCLIP_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {locale === "nl" ? k.label : k.labelEn} ({k.standard})
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={kind === "as" ? t.diameterShaft : t.diameterBore}>
            <WholeMmInput id="circlip-diameter" value={diameter} onChange={onDia} />
          </Field>
        </div>

        {parsed.status === "empty" ? (
          <p className="mt-5 text-sm text-muted">{t.fillDiameter}</p>
        ) : !Number.isFinite(d) || d <= 0 ? (
          <p className="mt-5 text-sm text-muted">{t.fillPositive}</p>
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">
            {t.noRing(d, nearest?.lower ?? null, nearest?.upper ?? null)}
          </p>
        ) : (
          <>
            <p
              className={`mt-5 text-sm font-medium ${result.verified ? "text-ink" : "text-danger"}`}
            >
              {result.verified ? t.verified : t.notVerified}
            </p>
            <ResultGrid
              items={[
                {
                  label: t.grooveDiameter,
                  value: `Ø${fmtCirclip(result.grooveDiameter)} mm ${result.grooveDiameterClass}`,
                },
                { label: t.grooveWidth, value: `${fmtCirclip(result.grooveWidth)} mm` },
                { label: t.grooveDepth, value: `${fmtCirclip(result.grooveDepth)} mm` },
                {
                  label: t.depthTolerance,
                  value: `0 / +${fmtSeeger3(result.grooveDepthPlus)} mm`,
                },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>
      <SchemaPanel caption="Technisch schema · maten in mm · schematisch, niet op schaal">
        <CirclipSection
          kind={kind}
          d1={Number.isFinite(d) ? d : undefined}
          d2={result?.grooveDiameter}
          b={result?.grooveWidth}
          t={result?.grooveDepth}
        />
      </SchemaPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.estimateTitle}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thDiameter}</th>
                <th>{t.grooveDiameter}</th>
                <th>{t.grooveWidth}</th>
                <th>{t.grooveDepth}</th>
                <th>{t.depthTolerance}</th>
                <th>{locale === "nl" ? "Status" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {[8, 10, 12, 15, 16, 18, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100].map(
                (dia) => {
                  const r = computeGroove(kind, dia);
                  return (
                    <tr key={dia} className={dia === d ? "is-active" : ""}>
                      <th scope="row" className="normal-case">
                        {dia}
                      </th>
                      <td>
                        {r ? `Ø${fmtCirclip(r.grooveDiameter)} ${r.grooveDiameterClass}` : "—"}
                      </td>
                      <td>{r ? fmtCirclip(r.grooveWidth) : "—"}</td>
                      <td>{r ? fmtCirclip(r.grooveDepth) : "—"}</td>
                      <td>{r ? `0/+${fmtSeeger3(r.grooveDepthPlus)}` : "—"}</td>
                      <td>
                        {r
                          ? r.verified
                            ? locale === "nl"
                              ? "geverifieerd"
                              : "verified"
                            : locale === "nl"
                              ? "niet geverifieerd"
                              : "not verified"
                          : "—"}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
        <SourceBadge>{t.sourceBadge([...VERIFIED_SEEGER_D1].join(", "))}</SourceBadge>
      </section>
    </>
  );
}
