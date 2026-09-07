import { Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocale } from "@/lib/i18n/locale-context";
import { getToolText, type Tool } from "@/lib/tools";

export function ComingSoon({ tool }: { tool: Tool }) {
  const { locale } = useLocale();
  const { title } = getToolText(tool, locale);
  const t =
    locale === "nl"
      ? {
          heading: `${title} wordt gemigreerd`,
          body: (
            <>
              Deze rekenhulp staat op de planning voor Mechify en is nog niet live. De onderliggende{" "}
              {tool.standard}-data en rekenlogica volgen de architectuur die hiernaast al functioneert.
            </>
          ),
          cta: "Bekijk beschikbare tools",
        }
      : {
          heading: `${title} is being migrated`,
          body: (
            <>
              This calculation aid is planned for Mechify and isn't live yet. The underlying {tool.standard} data
              and calculation logic follow the same architecture already working elsewhere on the site.
            </>
          ),
          cta: "View available tools",
        };

  return (
    <section className="rounded-xl border border-dashed border-border-strong bg-surface p-8 text-center sm:p-12">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2">
        <Construction className="size-6 text-accent" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">{t.heading}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{t.body}</p>
      <Link
        to="/tools"
        className="mt-6 inline-flex h-10 items-center rounded-md border border-border-strong bg-bg px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
      >
        {t.cta}
      </Link>
    </section>
  );
}
