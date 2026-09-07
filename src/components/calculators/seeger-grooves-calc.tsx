import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CIRCLIP_KINDS, computeGroove, fmtCirclip, type CirclipKind } from "@/lib/calculators/circlip";
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
      "Technische schatting op basis van de gebruikelijke opbouw van seeger-groeven (breedte in vaste stappen, diepte ruwweg evenredig met de diameter). Geen vervanging van de DIN 471/472-tabel of de catalogus van de ringfabrikant — neem de definitieve groefmaat daaruit over vóór productie.",
    type: "Type",
    diameterShaft: "As-Ø (mm)",
    diameterBore: "Boring-Ø (mm)",
    fillDiameter: "Vul een diameter in.",
    fillPositive: "Vul een diameter groter dan 0 in.",
    grooveDiameter: "Groefdiameter",
    grooveWidth: "Groefbreedte",
    grooveDepth: "Groefdiepte",
    estimateTitle: "Schatting over het bereik",
    thDiameter: "Ø (mm)",
    sourceBadge:
      "Schatting, geen catalogusdata. DIN 471 (as) en DIN 472 (boring) publiceren per nominale diameter een vaste groefdiameter, -breedte en tolerantie — vraag de actuele norm of ringfabrikant-catalogus op voor productietekeningen.",
    copyKind: { as: "As", boring: "Boring" },
  },
  en: {
    heading: "Circlip groove at Ø",
    intro:
      "Technical estimate based on the typical structure of circlip grooves (width in fixed steps, depth roughly proportional to diameter). Not a substitute for the DIN 471/472 table or the ring manufacturer's catalog — take the final groove size from there before production.",
    type: "Type",
    diameterShaft: "Shaft Ø (mm)",
    diameterBore: "Bore Ø (mm)",
    fillDiameter: "Enter a diameter.",
    fillPositive: "Enter a diameter greater than 0.",
    grooveDiameter: "Groove diameter",
    grooveWidth: "Groove width",
    grooveDepth: "Groove depth",
    estimateTitle: "Estimate across the range",
    thDiameter: "Ø (mm)",
    sourceBadge:
      "Estimate, not catalog data. DIN 471 (shaft) and DIN 472 (bore) publish a fixed groove diameter, width and tolerance per nominal diameter — request the current standard or ring manufacturer catalog for production drawings.",
    copyKind: { as: "Shaft", boring: "Bore" },
  },
};

export function SeegerGroovesCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [kind, setKind] = useState<CirclipKind>((search.get("kind") as CirclipKind) ?? "as");
  const [diameter, setDiameter] = useState(() => search.get("d") ?? readStoredDiameter({ min: 3, max: 100 }));

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

  const copy = useMemo(() => {
    if (!result) return "";
    return [
      `${t.copyKind[kind]} Ø${d} mm (${standard})`,
      `${t.grooveDiameter} ${fmtCirclip(result.grooveDiameter)} mm`,
      `${t.grooveWidth} ${fmtCirclip(result.grooveWidth)} mm`,
      `${t.grooveDepth} ${fmtCirclip(result.grooveDepth)} mm`,
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, kind, d, standard, locale]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{t.heading}</h2>
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
        ) : !result ? (
          <p className="mt-5 text-sm text-muted">{t.fillPositive}</p>
        ) : (
          <>
            <ResultGrid
              items={[
                { label: t.grooveDiameter, value: `Ø${fmtCirclip(result.grooveDiameter)} mm` },
                { label: t.grooveWidth, value: `${fmtCirclip(result.grooveWidth)} mm` },
                { label: t.grooveDepth, value: `${fmtCirclip(result.grooveDepth)} mm` },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{t.estimateTitle}</h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thDiameter}</th>
                <th>{t.grooveDiameter}</th>
                <th>{t.grooveWidth}</th>
                <th>{t.grooveDepth}</th>
              </tr>
            </thead>
            <tbody>
              {[8, 10, 12, 15, 16, 18, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100].map((dia) => {
                const r = computeGroove(kind, dia);
                return (
                  <tr key={dia} className={dia === d ? "is-active" : ""}>
                    <th scope="row" className="normal-case">
                      {dia}
                    </th>
                    <td>{r ? `Ø${fmtCirclip(r.grooveDiameter)}` : "—"}</td>
                    <td>{r ? fmtCirclip(r.grooveWidth) : "—"}</td>
                    <td>{r ? fmtCirclip(r.grooveDepth) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SourceBadge>{t.sourceBadge}</SourceBadge>
      </section>
    </>
  );
}
