import { useSearchParams } from "react-router-dom";
import { tx, useLocale } from "@/lib/i18n/locale";
import {
  bendInterruptionPercent,
  checkBendHole,
  dashMm,
  parseBendDimension,
  type KantenRow,
} from "@/lib/toolkit/kanten";
import { CalcPanel, Field, Note, NumInput, ResultGrid, CopyResult } from "./calc-ui";

export function BendClearance({ row }: { row: KantenRow | null }) {
  const { locale } = useLocale();
  const [params, setParams] = useSearchParams();
  const values = {
    flange: params.get("flange") ?? "",
    hole: params.get("hole") ?? "6",
    edge: params.get("edge") ?? "",
    interruption: params.get("interruption") ?? "",
    bendLength: params.get("bendLength") ?? "",
  };
  const setValues = (update: (previous: typeof values) => typeof values) => {
    const updated = update(values);
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(updated).forEach(([key, value]) =>
          value ? next.set(key, value) : next.delete(key),
        );
        return next;
      },
      { replace: true },
    );
  };
  const s = row?.s ?? null;
  const flange = parseBendDimension(values.flange);
  const hole = checkBendHole(s, parseBendDimension(values.hole), parseBendDimension(values.edge));
  const percent = bendInterruptionPercent(
    parseBendDimension(values.interruption),
    parseBendDimension(values.bendLength),
  );
  const mm = (v: number | null) => (v == null ? "—" : `${dashMm(Number(v.toFixed(3)))} mm`);
  const status =
    hole?.status === "outside"
      ? tx(
          locale,
          "Gatrand buiten de minimale-beenlengtezone.",
          "Hole edge outside the minimum-leg-length zone.",
        )
      : hole?.status === "too-close"
        ? tx(
            locale,
            "Te dichtbij: verplaats het gat of overleg over een aangepaste bewerking.",
            "Too close: move the hole or discuss an alternative process.",
          )
        : hole?.status === "review"
          ? tx(
              locale,
              "Klein gat binnen de zone: controleer de 10%-grens en laat de vervorming beoordelen.",
              "Small hole inside the zone: check the 10% limit and have distortion reviewed.",
            )
          : tx(
              locale,
              "Vul een geldige diameter en gatrandafstand in voor de controle.",
              "Enter a valid diameter and hole-edge distance to check.",
            );
  return (
    <CalcPanel className="mt-4">
      <Note>
        {tx(
          locale,
          "Meet s en a vanaf het buitenvlak van het opstaande been (het theoretische buitenhoekpunt) tot respectievelijk de plaatrand en de dichtstbijzijnde gatrand. Niet vanaf de buigraaklijn of het gatcentrum. De schets toont een 90°-zetting.",
          "Measure s and a from the outside face of the upright leg (virtual outside corner) to the sheet edge and nearest hole edge respectively. Do not measure from the bend tangent or hole centre. The sketch shows a 90° bend.",
        )}
      </Note>
      <svg
        viewBox="0 0 520 220"
        className="mt-4 w-full max-w-xl text-ink"
        role="img"
        aria-label={tx(
          locale,
          "90 graden doorsnede: a tot gatrand, c tot hart, s tot plaatrand, alle vanaf buitenvlak",
          "90 degree section: a to hole edge, c to centre, s to sheet edge, all from outside face",
        )}
      >
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M70 35V145Q70 165 90 165H270M310 165H445V153H310M270 153H94Q82 153 82 141V35Z" />
          <path d="M270 153V165M310 153V165" />
          <path
            d="M70 170V215M445 170V215M270 95V150M290 64V175"
            strokeDasharray="4 4"
            opacity=".5"
          />
          <path d="M70 108H270M70 78H290M70 200H445" stroke="var(--accent)" />
          <path
            d="M70 102V114M270 102V114M70 72V84M290 72V84M70 194V206M445 194V206"
            stroke="var(--accent)"
          />
        </g>
        <g fill="currentColor" fontSize="13" fontFamily="monospace">
          <text x="150" y="101">
            a ≥ s
          </text>
          <text x="145" y="70">
            c ≥ s + Ø/2
          </text>
          <text x="225" y="194">
            s
          </text>
          <text x="273" y="145">
            Ø
          </text>
        </g>
      </svg>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {(
          [
            ["flange", tx(locale, "Werkelijke beenlengte (mm)", "Actual leg length (mm)")],
            ["hole", tx(locale, "Gatdiameter Ø (mm)", "Hole diameter Ø (mm)")],
            [
              "edge",
              tx(locale, "a · buitenvlak tot gatrand (mm)", "a · outside face to hole edge (mm)"),
            ],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <NumInput
              value={values[key]}
              onChange={(v) => setValues((prev) => ({ ...prev, [key]: v }))}
            />
          </Field>
        ))}
      </div>
      <ResultGrid
        items={[
          { label: tx(locale, "Minimale beenlengte s", "Minimum leg length s"), value: mm(s) },
          {
            label: tx(locale, "Gatrand buiten zone: a ≥", "Hole edge outside zone: a ≥"),
            value: mm(hole?.minEdge ?? null),
          },
          {
            label: tx(locale, "Gatcentrum buiten zone: c ≥", "Hole centre outside zone: c ≥"),
            value: mm(hole?.minCenter ?? null),
          },
        ]}
      />
      <div className="mt-4 space-y-2 text-sm text-ink" aria-live="polite">
        <p>
          {s == null
            ? tx(
                locale,
                "Geen tabelwaarde: geen beoordeling mogelijk.",
                "No table value: assessment unavailable.",
              )
            : flange == null
              ? tx(
                  locale,
                  "Vul de werkelijke beenlengte in om deze te vergelijken.",
                  "Enter the actual leg length to compare.",
                )
              : flange < s
                ? tx(
                    locale,
                    "Been te kort voor deze tabelcombinatie.",
                    "Leg too short for this table combination.",
                  )
                : tx(
                    locale,
                    "Beenlengte voldoet aan de tabelwaarde.",
                    "Leg length meets the table value.",
                  )}
        </p>
        <p>{status}</p>
      </div>
      <Note>
        {tx(
          locale,
          "Voor Ø ≥ 5 mm houden we a ≥ s aan. De brontekst noemt > 5 mm, de afbeelding ≥ 5 mm; deze tool kiest de strengere grens. Voor kleinere gaten binnen de zone is geen gegarandeerd vervormingsvrije minimumafstand gepubliceerd.",
          "For Ø ≥ 5 mm we use a ≥ s. The source text says > 5 mm, the drawing ≥ 5 mm; this tool uses the stricter boundary. No guaranteed distortion-free minimum is published for smaller holes inside the zone.",
        )}
      </Note>
      <h3 className="mt-6 font-display text-lg text-ink">
        {tx(locale, "Onderbrekingen binnen de buigzone", "Interruptions inside the bend zone")}
      </h3>
      <Note>
        {tx(
          locale,
          "Tel alle gatdiameters en sleuflengtes binnen de zone op, inclusief relevante onderbrekingen aan de uiteinden. Vergelijk met de lengte van deze zetting. Maximaal 10% is een aanvullende voorwaarde, geen vrijstelling voor grote gaten en geen garantie voor gatnauwkeurigheid.",
          "Sum all hole diameters and slot lengths inside the zone, including relevant end interruptions. Compare with this bend's length. The 10% maximum is an additional condition, not an exemption for large holes or a guarantee of hole accuracy.",
        )}
      </Note>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={tx(locale, "Som onderbrekingen (mm)", "Total interruptions (mm)")}>
          <NumInput
            value={values.interruption}
            onChange={(v) => setValues((p) => ({ ...p, interruption: v }))}
          />
        </Field>
        <Field label={tx(locale, "Lengte van deze zetting (mm)", "Length of this bend (mm)")}>
          <NumInput
            value={values.bendLength}
            onChange={(v) => setValues((p) => ({ ...p, bendLength: v }))}
          />
        </Field>
      </div>
      <p className="mt-4 text-sm text-ink" aria-live="polite">
        {percent == null
          ? tx(
              locale,
              "Vul geldige afmetingen in (zetlengte > 0; som ≤ zetlengte).",
              "Enter valid dimensions (bend length > 0; total ≤ bend length).",
            )
          : `${percent.toFixed(2)}% — ${percent > 10 ? tx(locale, "boven de 10%-grens", "exceeds the 10% limit") : tx(locale, "binnen de 10%-grens; overige voorwaarden blijven gelden", "within the 10% limit; other conditions still apply")}`}
      </p>
      <Note>
        {tx(
          locale,
          "Deze controle betreft alleen de gekozen tabel en afstanden. Houd rekening met toleranties, gereedschap en botsingen. Kritische pasgaten zo nodig na het kanten bewerken. Hemming en speciale insnedes vereisen een aparte beoordeling.",
          "This check covers only the selected table and distances. Allow for tolerances, tooling and collisions. Consider machining critical fit holes after bending. Hemming and special relief cuts need separate assessment.",
        )}
      </Note>
      <CopyResult
        text={`247TailorSteel; ${row?.material ?? "—"}; t=${mm(row?.t ?? null)}; ${row?.kind ?? "—"}; s=${mm(s)}; Ø=${values.hole}; a=${values.edge}; ${status}; interruption=${percent == null ? "—" : percent.toFixed(2) + "%"}`}
      />
    </CalcPanel>
  );
}
