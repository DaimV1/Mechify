import { AlertTriangle, CheckCircle2, History, Sigma, Truck } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { metaLabel, metaText, metaTone, type EngineeringSourceMeta } from "@/lib/engineering-meta";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<ReturnType<typeof metaTone>, string> = {
  ok: "border-success/40 bg-success/10 text-success",
  warn: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/40 bg-danger/10 text-danger",
  neutral: "border-border-strong bg-bg text-muted",
};

const TONE_ICON: Record<ReturnType<typeof metaTone>, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  danger: History,
  neutral: Sigma,
};

const BASIS_ICON: Partial<Record<EngineeringSourceMeta["basisType"], typeof CheckCircle2>> = {
  vendor: Truck,
  physics: Sigma,
};

const FIELD_LABELS = {
  nl: {
    checked: "Gecontroleerd",
    range: "Geldigheid",
    assumptions: "Aannames",
    verify: "Verifieer",
  },
  en: { checked: "Checked", range: "Validity", assumptions: "Assumptions", verify: "Verify" },
};

/**
 * Structured provenance panel: what kind of source a result rests on and
 * what state that source is in, always shown with an icon (never color
 * alone) so a legacy/withdrawn standard can't be mistaken for a current
 * table lookup at a glance. See src/lib/engineering-meta.ts.
 */
export function SourceMetaBadge({ meta }: { meta: EngineeringSourceMeta }) {
  const { locale } = useLocale();
  const t = FIELD_LABELS[locale];
  const tone = metaTone(meta);
  const Icon = BASIS_ICON[meta.basisType] ?? TONE_ICON[tone];

  return (
    <div
      className={cn("mt-3 rounded-md border px-3 py-2.5 text-xs leading-relaxed", TONE_CLASS[tone])}
    >
      <p className="flex items-start gap-1.5 font-semibold uppercase tracking-wide">
        <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>{metaLabel(meta, locale)}</span>
      </p>
      <p className="mt-1 text-muted">
        {meta.reference}
        {meta.sourceUrl ? (
          <>
            {" · "}
            <a
              href={meta.sourceUrl}
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.verify}
            </a>
          </>
        ) : null}
      </p>
      <p className="mt-1 text-subtle">
        {t.checked} {meta.checkedDate}
        {meta.validityRange ? ` · ${t.range}: ${metaText(meta.validityRange, locale)}` : ""}
      </p>
      {meta.assumptions ? (
        <p className="mt-1 text-subtle">
          {t.assumptions}: {metaText(meta.assumptions, locale)}
        </p>
      ) : null}
    </div>
  );
}
