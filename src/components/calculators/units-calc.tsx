import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { convert, findCategory, fmtConverted, UNIT_CATEGORIES } from "@/lib/calculators/units";
import { parseNum } from "@/components/calculators/calc-ui";
import { CalcEyebrow, CalcPanel, CopyLink, CopyResult, Field, NumInput, Note, SelectInput } from "@/components/calculators/calc-ui";

export function UnitsCalc() {
  const [search, setSearch] = useSearchParams();
  const [categoryId, setCategoryId] = useState(search.get("cat") ?? "length");
  const category = findCategory(categoryId);
  const [fromId, setFromId] = useState(search.get("from") ?? category.units[0].id);
  const [toId, setToId] = useState(search.get("to") ?? category.units[1]?.id ?? category.units[0].id);
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
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Eenheden omrekenen</h2>
        <Note>Alle omrekeningen via de SI-basiseenheid van de categorie ({category.baseLabel}).</Note>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label="Categorie">
            <SelectInput value={categoryId} onChange={onCategory}>
              {UNIT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Van">
            <SelectInput value={fromId} onChange={setFromId}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Naar">
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
          <Field label="Waarde">
            <NumInput id="units-value" value={value} onChange={setValue} />
          </Field>
        </div>

        {result != null ? (
          <>
            <p className="mt-5 font-mono text-2xl tabular-nums text-ink">
              {fmtConverted(result)} <span className="text-base text-muted">{category.units.find((u) => u.id === toId)?.label}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">Vul een waarde in.</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {value || "1"} {category.units.find((u) => u.id === fromId)?.label} in alle eenheden van {category.label.toLowerCase()}
        </h2>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Eenheid</th>
                <th>Waarde</th>
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
        <p className="mt-2 text-xs text-subtle">
          Exacte definities (inch, lbf, bar, atm) of de standaard afgeleide constanten (psi, mmHg) volgens NIST SP 811 en ISO 80000 —
          geen afgeronde vuistregels.
        </p>
      </section>
    </>
  );
}
