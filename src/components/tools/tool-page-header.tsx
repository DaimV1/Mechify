import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StandardBadge } from "@/components/ui/badge";

export function ToolPageHeader({
  crumbs,
  eyebrow,
  title,
  standard,
  lede,
}: {
  crumbs: { href?: string; label: string }[];
  eyebrow: string;
  title: string;
  standard: string;
  lede: ReactNode;
}) {
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <StandardBadge>{standard}</StandardBadge>
      </div>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lede}</p>
    </>
  );
}
