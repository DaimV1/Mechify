import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/ui/badge";
import { COMMON } from "@/lib/i18n/common";
import { useLocale } from "@/lib/i18n/locale-context";
import { getToolText, toolHref, type Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool }: { tool: Tool }) {
  const { locale } = useLocale();
  const t = COMMON[locale];
  const href = toolHref(tool);
  const { title, blurb } = getToolText(tool, locale);
  return (
    <Link
      to={href}
      className={cn(
        "group flex flex-col justify-between rounded-xl border border-border-strong bg-surface p-5 transition-colors hover:border-accent/60 hover:bg-surface-2",
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-subtle">{tool.standard}</p>
          <StatusBadge status={tool.status} />
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{blurb}</p>
      </div>
      <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent">
        {tool.status === "live" ? t.openTool : t.viewPlan}
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
