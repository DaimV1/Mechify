import { useLocale, type Locale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

const LOCALES: Locale[] = ["nl", "en"];

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      role="group"
      aria-label="Taal / Language"
      className={cn(
        "inline-flex items-center rounded-md border border-border-strong bg-surface p-0.5",
        className,
      )}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "rounded px-2 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
            locale === l ? "bg-accent text-accent-ink" : "text-muted hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
