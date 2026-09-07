import { Check, Copy, Info, Link2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { COMMON } from "@/lib/i18n/common";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

export function CalcPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border-strong bg-surface p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] sm:p-7",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm text-muted">
      {label}
      {children}
    </label>
  );
}

const controlClass =
  "h-12 w-full rounded-md border border-border-strong bg-bg px-3 font-mono text-base text-ink tabular-nums outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30";

/** Keeps one decimal separator visible so "20,5" doesn't collapse to "205". */
export function sanitizeDiameterInput(raw: string) {
  let v = raw.replace(/[^\d.,]/g, "");
  const sep = v.search(/[.,]/);
  if (sep >= 0) {
    const mark = v[sep];
    v = v.slice(0, sep + 1) + v.slice(sep + 1).replace(/[.,]/g, "");
    const [head, tail = ""] = v.split(mark);
    return `${head.slice(0, 4)}${mark}${tail.slice(0, 2)}`;
  }
  return v.slice(0, 4);
}

export function parseWholeMm(raw: string): { status: "empty" } | { status: "ok"; mm: number } {
  const t = raw.trim();
  if (t === "") return { status: "empty" };
  const mm = Number.parseInt(t, 10);
  if (!Number.isFinite(mm)) return { status: "empty" };
  return { status: "ok", mm };
}

export function parseNum(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function NumInput({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(sanitizeDiameterInput(e.target.value))}
      className={controlClass}
    />
  );
}

/** Whole millimeters only — no decimal separator can be entered. */
export function sanitizeWholeMmInput(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 4);
}

export function WholeMmInput({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(sanitizeWholeMmInput(e.target.value))}
      className={controlClass}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  children,
  disabled,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(controlClass, "disabled:opacity-50")}
    >
      {children}
    </select>
  );
}

export function ResultGrid({ items }: { items: { label: ReactNode; value: string }[] }) {
  return (
    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-border bg-bg px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted">{item.label}</dt>
          <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CopyResult({ text }: { text: string }) {
  const { locale } = useLocale();
  const t = COMMON[locale];
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      className="mt-5 print:hidden"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
      {done ? t.copied : t.copyResult}
    </Button>
  );
}

/** Copies the current page URL (with its query-string state) so a result can be pasted into a mail or a ticket. */
export function CopyLink() {
  const { locale } = useLocale();
  const t = COMMON[locale];
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      className="mt-5 print:hidden"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {done ? t.copied : t.copyLink}
    </Button>
  );
}

export function KindDot({ kind }: { kind: "los" | "overgang" | "lijn" | "vast" }) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 rounded-full",
        kind === "los" && "bg-fit-clearance",
        kind === "overgang" && "bg-fit-transition",
        kind === "lijn" && "bg-fit-line",
        kind === "vast" && "bg-fit-interference",
      )}
      aria-hidden="true"
    />
  );
}

export function CalcEyebrow({ children }: { children?: ReactNode }) {
  const { locale } = useLocale();
  return <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{children ?? COMMON[locale].calcHelper}</p>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm leading-relaxed text-muted">{children}</p>;
}

/** Visible source/caveat chip for provenance notes that matter even to a reader who only scans the table. */
export function SourceBadge({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 inline-flex items-start gap-1.5 rounded-md border border-border-strong bg-bg px-2.5 py-1.5 text-xs leading-relaxed text-muted">
      <Info className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  const { locale } = useLocale();
  return (
    <p className="mt-4 text-xs leading-relaxed text-subtle">
      {COMMON[locale].source}{" "}
      <a href={href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </p>
  );
}
