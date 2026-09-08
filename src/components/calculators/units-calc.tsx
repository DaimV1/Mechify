import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { convert, findCategory, fmtConverted, UNIT_CATEGORIES } from "@/lib/calculators/units";
import { useLocale } from "@/lib/i18n/locale-context";
import { parseNum } from "@/components/calculators/calc-ui";
import {
  CalcEyebrow,
  CalcPanel,
  CopyLink,
  CopyResult,
  Field,
  Note,
  SelectInput,
} from "@/components/calculators/calc-ui";

const T = {
  nl: {
    heading: "Eenheden omrekenen",
    baseNote: (base: string) =>
      `Alle omrekeningen via de SI-basiseenheid van de categorie (${base}).`,
    category: "Categorie",
    from: "Van",
    to: "Naar",
    value: "Waarde",
    fillValue: "Vul een waarde in.",
    allUnitsTitle: (value: string, fromLabel: string, categoryLabel: string) =>
      `${value} ${fromLabel} in alle eenheden van ${categoryLabel.toLowerCase()}`,
    thUnit: "Eenheid",
    thValue: "Waarde",
    footnote:
      "Exacte definities (inch, lbf, bar, atm) of de standaard afgeleide constanten (psi, mmHg) volgens NIST SP 811 en ISO 80000 — geen afgeronde vuistregels.",
  },
  en: {
    heading: "Convert units",
    baseNote: (base: string) => `All conversions go through the category's SI base unit (${base}).`,
    category: "Category",
    from: "From",
    to: "To",
    value: "Value",
    fillValue: "Enter a value.",
    allUnitsTitle: (value: string, fromLabel: string, categoryLabel: string) =>
      `${value} ${fromLabel} in every unit of ${categoryLabel.toLowerCase()}`,
    thUnit: "Unit",
    thValue: "Value",
    footnote:
      "Exact definitions (inch, lbf, bar, atm) or the standard derived constants (psi, mmHg) per NIST SP 811 and ISO 80000 — no rounded rules of thumb.",
  },
};

const CATEGORY_LABELS: Record<string, { nl: string; en: string }> = {
  length: { nl: "Lengte", en: "Length" },
  temperature: { nl: "Temperatuur", en: "Temperature" },
  volume: { nl: "Volume", en: "Volume" },
  force: { nl: "Kracht", en: "Force" },
  pressure: { nl: "Druk", en: "Pressure" },
  torque: { nl: "Koppel", en: "Torque" },
  power: { nl: "Vermogen", en: "Power" },
  mass: { nl: "Massa", en: "Mass" },
};

export function UnitsCalc() {
  const { locale } = useLocale();
  const t = T[locale];
  const [search, setSearch] = useSearchParams();
  const [categoryId, setCategoryId] = useState(search.get("cat") ?? "length");
  const category = findCategory(categoryId);
  const [fromId, setFromId] = useState(search.get("from") ?? category.units[0].id);
  const [toId, setToId] = useState(
    search.get("to") ?? category.units[1]?.id ?? category.units[0].id,
  );
  const [value, setValue] = useState(search.get("v") ?? "1");

  useEffect(() => {
    const next = new URLSearchParams(search);
    next.set("cat", categoryId);
    next.set("from", fromId);
    next.set("to", toId);
    if (value) next.set("v", value);
    else next.delete("v");
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, fromId, toId, value]);

  function onCategory(id: string) {
    const cat = findCategory(id);
    setCategoryId(id);
    setFromId(cat.units[0].id);
    setToId(cat.units[1]?.id ?? cat.units[0].id);
  }

  const categoryLabel = (id: string) => CATEGORY_LABELS[id]?.[locale] ?? id;

  const v = parseNum(value);
  const result = v != null ? convert(v, category, fromId, toId) : null;

  const copy = useMemo(() => {
    if (result == null) return "";
    const from = category.units.find((u) => u.id === fromId);
    const to = category.units.find((u) => u.id === toId);
    return `${value} ${from?.label ?? ""} = ${fmtConverted(result)} ${to?.label ?? ""}`;
  }, [result, category, fromId, toId, value]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {t.heading}
        </h2>
        <Note>{t.baseNote(category.baseLabel)}</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label={t.category}>
            <SelectInput value={categoryId} onChange={onCategory}>
              {UNIT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c.id)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.from}>
            <SelectInput value={fromId} onChange={setFromId}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t.to}>
            <SelectInput value={toId} onChange={setToId}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <div className="mt-4 max-w-xs">
          <Field label={t.value}>
            <input
              id="units-value"
              inputMode="decimal"
              className="w-full rounded border border-line bg-surface px-3 py-2 font-mono text-ink"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
        </div>

        {result != null ? (
          <>
            <p className="mt-5 font-mono text-2xl tabular-nums text-ink">
              {fmtConverted(result)}{" "}
              <span className="text-base text-muted">
                {category.units.find((u) => u.id === toId)?.label}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">{t.fillValue}</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {t.allUnitsTitle(
            value || "1",
            category.units.find((u) => u.id === fromId)?.label ?? "",
            categoryLabel(category.id),
          )}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{t.thUnit}</th>
                <th>{t.thValue}</th>
              </tr>
            </thead>
            <tbody>
              {category.units.map((u) => {
                const rowValue = v != null ? convert(v, category, fromId, u.id) : null;
                return (
                  <tr key={u.id} className={u.id === toId ? "is-active" : ""}>
                    <th scope="row" className="normal-case">
                      {u.label}
                    </th>
                    <td>{rowValue != null ? fmtConverted(rowValue) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-subtle">{t.footnote}</p>
      </section>
    </>
  );
}
