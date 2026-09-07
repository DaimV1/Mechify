import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { COMMON } from "@/lib/i18n/common";
import { useLocale } from "@/lib/i18n/locale-context";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const { locale } = useLocale();
  return (
    <nav aria-label={COMMON[locale].breadcrumbNav} className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-subtle">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
            {item.href ? (
              <Link to={item.href} className="transition-colors hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span className="text-muted" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
