import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";
import { COMMON } from "@/lib/i18n/common";
import { useLocale } from "@/lib/i18n/locale-context";
import { matchTools, type Tool } from "@/lib/tools";

export function ToolGrid({ tools }: { tools: Tool[] }) {
  const { locale } = useLocale();
  const t = COMMON[locale];
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => matchTools(query, tools), [query, tools]);

  return (
    <div>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-subtle"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchToolAria}
          className="h-12 w-full rounded-lg border border-border-strong bg-surface pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{t.noToolsFound(query)}</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
