import type { ReactNode } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

export function StandardBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "live" | "soon" }) {
  const { locale } = useLocale();
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-success">
        <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
        {locale === "nl" ? "Beschikbaar" : "Available"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-subtle">
      <span className="size-1.5 rounded-full bg-subtle" aria-hidden="true" />
      {locale === "nl" ? "Binnenkort" : "Coming soon"}
    </span>
  );
}
